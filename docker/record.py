#!/usr/bin/env python3
"""Runs a scripted terminal session inside the course container and reports what each command printed.

The lessons never quote a command or its output from memory. Each lesson has a
scenario file (site/src/transcripts/lessonNN.scenarios.json); site/scripts/transcripts.mjs
feeds one scenario at a time to this script on standard input and stores the
result, which is what the lesson page then shows.

A scenario is a JSON list of steps. A step is one of:

  {"id": "node-list", "cmd": "ros2 node list"}
      Run the command, wait for it to finish, record its output.

  {"id": "echo", "cmd": "ros2 topic echo /chatter", "seconds": 3.5}
      A command that never finishes by itself: stop it after that many seconds.

  {"id": "talker", "cmd": "ros2 run demo_nodes_cpp talker", "background": true, "settle": 3}
      Start it, wait `settle` seconds, and leave it running for the later steps.
      Its output is recorded when the scenario ends. While it runs, its output
      so far is in /tmp/rec/<id>.log, where a later step may read it.

  {"id": "listener-after", "tail": "listener", "lines": 2}
      Record the last lines a background command has printed so far.

  {"cmd": "sleep 1"}
      No id: run it, record nothing.

  {"id": "build", "cmd": "colcon build", "cwd": "/root/ws"}
      Run it in that folder. The lesson page shows the folder in the prompt.

  {"id": "no-ros", "cmd": "ros2 --help", "fresh": true}
      Run it in a clean shell where ROS has not been set up (no setup file
      sourced, no ROS variables), as on a computer with ROS installed but not
      yet sourced.

`lines` keeps only the first lines of the output (the last ones for `tail`).
`"check": false` (with a `why`) records a step and shows it, but the stability
check does not compare it, because what it prints depends on timing.
`ignore` is a list of regular expressions: lines matching one are left out
before that. It is for lines that appear only on some runs, such as a warning
printed while discovery is still going on, and the lesson says so where it matters.
"""

import json
import os
import re
import signal
import subprocess
import sys
import time

SETUP = "source /opt/ros/jazzy/setup.bash"
LOGS = "/tmp/rec"
ANSI = re.compile(r"\x1b\[[0-9;?]*[A-Za-z]")
DEFAULT_TIMEOUT = 40.0


# Printed by ros2 bag only because the recorder runs commands without a terminal.
# A reader's terminal never shows it, so it is left out of every recording.
NO_TERMINAL = "stdin is not a terminal device. Keyboard handling disabled."


def clean(text):
    text = ANSI.sub("", text).replace("\r\n", "\n").replace("\r", "\n").replace(NO_TERMINAL, "")
    return "\n".join(line.rstrip() for line in text.split("\n")).strip("\n")


CLEAN_ENV = {"HOME": "/root", "TERM": "xterm", "PATH": "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"}


def start(cmd, log_path, fresh=False, cwd=None):
    log = open(log_path, "wb")
    if fresh:
        argv, env = ["bash", "--norc", "--noprofile", "-c", cmd], dict(CLEAN_ENV)
    else:
        argv, env = ["bash", "-c", f"{SETUP}; {cmd}"], {**os.environ, "PYTHONUNBUFFERED": "1"}
    # Its own process group, so the command and everything it starts can be stopped together.
    return subprocess.Popen(
        argv, stdout=log, stderr=subprocess.STDOUT, stdin=subprocess.DEVNULL, start_new_session=True, env=env, cwd=cwd
    )


def stop(proc):
    if proc.poll() is not None:
        return
    for sig, wait in ((signal.SIGINT, 2.0), (signal.SIGKILL, 2.0)):
        try:
            os.killpg(proc.pid, sig)
        except ProcessLookupError:
            return
        try:
            proc.wait(timeout=wait)
            return
        except subprocess.TimeoutExpired:
            continue


def read(log_path):
    with open(log_path, "rb") as f:
        return clean(f.read().decode("utf-8", errors="replace"))


def keep(text, lines, from_end=False, ignore=()):
    if ignore and text:
        patterns = [re.compile(p) for p in ignore]
        text = "\n".join(line for line in text.split("\n") if not any(p.search(line) for p in patterns))
    if not lines or not text:
        return text, False
    rows = text.split("\n")
    if len(rows) <= lines:
        return text, False
    return "\n".join(rows[-lines:] if from_end else rows[:lines]), True


def main():
    steps = json.load(sys.stdin)
    os.makedirs(LOGS, exist_ok=True)
    # The ros2 command keeps a background helper (the daemon) that tracks the graph.
    # The first command starts it, and if nodes are already running it can answer
    # before it has found them. Starting it before anything else makes recordings
    # repeatable. (Readers can still meet the delay; Lesson 2 tells them.)
    subprocess.run(["bash", "-c", f"{SETUP}; ros2 daemon start"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=60)
    background = {}  # id -> (process, step, log path)
    runs = []
    failed = None

    for index, step in enumerate(steps):
        step_id = step.get("id")
        name = step_id or f"step{index}"

        if "tail" in step:
            _, source, log_path = background[step["tail"]]
            output, truncated = keep(read(log_path), step.get("lines"), from_end=True, ignore=step.get("ignore", ()))
            runs.append({"id": step_id, "command": source["cmd"], "output": output, "ended": "running", "truncated": False, "tail": truncated})
            continue

        cmd = step["cmd"]
        log_path = f"{LOGS}/{name}.log"
        proc = start(cmd, log_path, fresh=step.get("fresh", False), cwd=step.get("cwd"))

        if step.get("background"):
            background[name] = (proc, step, log_path)
            time.sleep(float(step.get("settle", 2)))
            if proc.poll() is not None:
                failed = f"{name}: the background command exited straight away (code {proc.returncode}):\n{read(log_path)}"
                break
            continue

        seconds = step.get("seconds")
        try:
            proc.wait(timeout=float(seconds) if seconds else DEFAULT_TIMEOUT)
            ended = "exit"
        except subprocess.TimeoutExpired:
            if not seconds:
                stop(proc)
                failed = f"{name}: `{cmd}` did not finish within {DEFAULT_TIMEOUT:.0f} s. Output so far:\n{read(log_path)}"
                break
            ended = "stopped"
        # Take the output before interrupting, so the interrupt's own noise is not part of it.
        output, truncated = keep(read(log_path), step.get("lines"), ignore=step.get("ignore", ()))
        stop(proc)
        if not step_id and ended == "exit" and proc.returncode != 0 and not step.get("mayFail"):
            failed = f"{name}: the set-up command `{cmd}` failed (code {proc.returncode}):\n{read(log_path)}"
            break
        if step_id:
            runs.append({"id": step_id, "command": cmd, "output": output, "ended": ended, "code": proc.returncode if ended == "exit" else None, "truncated": truncated})

    for name, (proc, step, log_path) in background.items():
        if step.get("id"):
            output, truncated = keep(read(log_path), step.get("lines"), ignore=step.get("ignore", ()))
            runs.append({"id": step["id"], "command": step["cmd"], "output": output, "ended": "running", "truncated": truncated})
    for proc, _, _ in background.values():
        stop(proc)

    json.dump({"runs": runs, "failed": failed}, sys.stdout)
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
