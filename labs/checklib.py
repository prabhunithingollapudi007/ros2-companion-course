"""Shared helpers for the lab checkers (labs/lessonNN/check.py).

Each checker runs inside the course container, prints one line per check and
a summary, and exits with 0 only if every check passed. The lessons record a
checker passing on the reference solution, so CI notices if one stops working.
"""

import os
import signal
import subprocess
import time
import xml.etree.ElementTree as ET
from pathlib import Path

WS = Path("/labs/ws")

# Checkers that start nodes do it on a domain of their own, so nothing the
# reader left running in another terminal can join in, and vice versa.
CHECK_DOMAIN = "77"


class Checker:
    def __init__(self, title):
        self.title = title
        self.results = []
        print(title)

    def check(self, description, ok, hint=""):
        """Record one check. `ok` may be a function, so that later checks can be skipped once an earlier one fails."""
        if callable(ok):
            try:
                ok = ok()
            except Exception as error:  # a check that cannot even run counts as failed
                hint = hint or str(error)
                ok = False
        self.results.append(bool(ok))
        line = f"  PASS  {description}" if ok else f"  FAIL  {description}"
        if not ok and hint:
            line += f"\n        {hint}"
        print(line, flush=True)
        return bool(ok)

    def finish(self):
        passed = sum(self.results)
        total = len(self.results)
        print(f"All {total} checks passed." if passed == total else f"{passed} of {total} checks passed.")
        return 0 if passed == total else 1


def package_xml(path):
    """The parsed package.xml, or None."""
    try:
        return ET.parse(path).getroot()
    except (OSError, ET.ParseError):
        return None


def dependencies(root):
    """Every package named in a *depend tag of a package.xml."""
    return {e.text.strip() for e in root if e.tag.endswith("depend") and e.text}


def _script(command, workspace):
    """ROS set up, then the workspace on top unless it is None, then the command."""
    if workspace is None:
        return f"source /opt/ros/jazzy/setup.bash && {command}"
    return f"source /opt/ros/jazzy/setup.bash && source {workspace}/install/setup.bash && {command}"


def _env(isolated):
    env = dict(os.environ)
    if isolated:
        env["ROS_DOMAIN_ID"] = CHECK_DOMAIN
    return env


_daemon_ready = False


def _ensure_daemon():
    """Starts the ros2 command's background helper for the check's domain before
    anything else runs there. Started later, it can answer before it has found
    every node."""
    global _daemon_ready
    if not _daemon_ready:
        subprocess.run(
            ["bash", "-c", "source /opt/ros/jazzy/setup.bash && ros2 daemon start"],
            capture_output=True,
            env=_env(True),
            timeout=60,
        )
        _daemon_ready = True


def ros(command, workspace=WS, timeout=30, isolated=False):
    """Runs a command with ROS and the workspace sourced. Returns (exit code, output)."""
    if isolated:
        _ensure_daemon()
    try:
        done = subprocess.run(
            ["bash", "-c", _script(command, workspace)], capture_output=True, text=True, timeout=timeout, env=_env(isolated)
        )
    except subprocess.TimeoutExpired:
        return None, "(it did not finish within the time allowed)"
    return done.returncode, (done.stdout + done.stderr).strip()


def ros_for(command, seconds, workspace=WS, isolated=True):
    """Runs a command that does not stop by itself for `seconds`, then stops it. Returns its output."""
    proc = background(command, workspace, isolated)
    time.sleep(seconds)
    stop(proc)
    return proc.stdout.read().decode("utf-8", errors="replace").strip()


def background(command, workspace=WS, isolated=True):
    """Starts a command with ROS and the workspace sourced, and leaves it running."""
    if isolated:
        _ensure_daemon()
    return subprocess.Popen(
        ["bash", "-c", _script(command, workspace)],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        stdin=subprocess.DEVNULL,
        start_new_session=True,
        env=_env(isolated),
    )


def stop(proc):
    """Stops a command started with background(), and everything it started."""
    for sig, wait in ((signal.SIGINT, 3), (signal.SIGKILL, 2)):
        if proc.poll() is not None:
            return
        try:
            os.killpg(proc.pid, sig)
            proc.wait(timeout=wait)
        except (ProcessLookupError, subprocess.TimeoutExpired):
            continue
