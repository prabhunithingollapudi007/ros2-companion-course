"""Shared helpers for the lab checkers (labs/lessonNN/check.py).

Each checker runs inside the course container, prints one line per check and
a summary, and exits with 0 only if every check passed. The lessons record a
checker passing on the reference solution, so CI notices if one stops working.
"""

import subprocess
import xml.etree.ElementTree as ET
from pathlib import Path

WS = Path("/labs/ws")


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


def ros(command, workspace=WS, timeout=30):
    """Runs a command with ROS and the workspace sourced. Returns (exit code, output)."""
    script = f"source /opt/ros/jazzy/setup.bash && source {workspace}/install/setup.bash && {command}"
    try:
        done = subprocess.run(["bash", "-c", script], capture_output=True, text=True, timeout=timeout)
    except subprocess.TimeoutExpired:
        return None, "(it did not finish within the time allowed)"
    return done.returncode, (done.stdout + done.stderr).strip()
