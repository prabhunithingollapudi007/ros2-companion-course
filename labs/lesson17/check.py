#!/usr/bin/env python3
"""Checks the Lesson 17 capstone: go_to and capstone_bringup, on top of the
Lesson 13 stack, driving the rover in Gazebo; and a bag of a run.

    python3 /labs/lesson17/check.py

It launches capstone.launch.py without a window (on a Gazebo partition of its
own), sends goals with goal_client.py, and reads odometry.
"""

import json
import math
import re
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from checklib import WS, Checker, background, ros, stop  # noqa: E402

PACKAGES = [
    "rover_description", "rover_sim", "speed_limiter_interfaces", "speed_limiter",
    "rover_stack", "cmd_watchdog", "capstone_interfaces", "go_to", "capstone_bringup",
]
CLIENT = Path(__file__).resolve().parent / "goal_client.py"
BAG = WS / "capstone_run"
GZ = "GZ_PARTITION=lesson17_check "
GOAL = (2.0, -1.0)


def goal(x, y, cancel_after=None):
    extra = f" {cancel_after}" if cancel_after else ""
    _, text = ros(f"python3 {CLIENT} {x} {y}{extra}", isolated=True, timeout=90)
    for line in reversed(text.splitlines()):
        if line.startswith("{"):
            return json.loads(line)
    return None


def odom():
    """(x, y, speed) from one /odom message, or None."""
    _, text = ros("ros2 topic echo --once --no-lost-messages /odom nav_msgs/msg/Odometry", isolated=True, timeout=20)
    m = re.search(r"position:\s+x: (-?[\d.e-]+)\s+y: (-?[\d.e-]+)", text)
    v = re.search(r"twist:\s+twist:\s+linear:\s+x: (-?[\d.e-]+)", text)
    return (float(m.group(1)), float(m.group(2)), float(v.group(1))) if m and v else None


c = Checker(f"Lesson 17 capstone: checking {WS}")
missing = [p for p in PACKAGES if not (WS / "install" / p).is_dir()]
ready = c.check("every package is built: " + ", ".join(PACKAGES), not missing, f"Missing: {', '.join(missing)}.")

r = {}
if ready:
    sim = background(GZ + "ros2 launch capstone_bringup capstone.launch.py gui:=false")
    try:
        ros(GZ + "ros2 topic echo --once /clock rosgraph_msgs/msg/Clock", isolated=True, timeout=90)
        time.sleep(4)
        _, r["max_speed"] = ros("ros2 param get /go_to max_speed", isolated=True)
        _, r["tolerance"] = ros("ros2 param get /go_to tolerance", isolated=True)
        r["there"] = goal(*GOAL)
        r["at"] = odom()
        r["cancel"] = goal(0.0, 0.0, 2.0)
        time.sleep(2)
        r["after cancel"] = odom()
    finally:
        stop(sim)

need = lambda hint: hint if ready else "Needs every package built first."
c.check(
    "go_to has parameters max_speed 0.5 and tolerance 0.1, from capstone.yaml",
    lambda: "Double value is: 0.5" in r["max_speed"] and "Double value is: 0.1" in r["tolerance"],
    need(f"ros2 param get printed {r.get('max_speed')!r} and {r.get('tolerance')!r}."),
)
t = r.get("there") or {}
c.check(
    f"a goal of {GOAL} is accepted and succeeds, reached, within tolerance",
    lambda: t["accepted"] and t["status"] == "succeeded" and t["reached"] is True and t["distance_left"] < 0.1,
    need(f"goal_client.py reported {t}"),
)
c.check(
    "its feedback counts the distance down",
    lambda: t["feedback"] >= 10 and t["first"] > t["last"],
    need(f"{t.get('feedback')} feedback messages, from {t.get('first')} m to {t.get('last')} m."),
)
c.check(
    f"odometry agrees: the rover is within 0.15 m of {GOAL}",
    lambda: math.dist(r["at"][:2], GOAL) < 0.15,
    need(f"Odometry says {r.get('at')}."),
)
x = r.get("cancel") or {}
c.check(
    "a goal cancelled after 2 s ends canceled, not reached",
    lambda: x["status"] == "canceled" and x["reached"] is False,
    need(f"goal_client.py reported {x}"),
)
c.check(
    "two seconds after the cancel, the rover has stopped",
    lambda: abs(r["after cancel"][2]) < 0.05,
    need(f"Odometry says {r.get('after cancel')}: does go_to stop the robot when cancelled?"),
)
_, info = ros(f"ros2 bag info {BAG}", workspace=None, timeout=30) if BAG.is_dir() else (None, "")
odom_count = re.search(r"Topic: /odom \| Type: nav_msgs/msg/Odometry \| Count: (\d+)", info or "")
c.check(
    "a bag of a run is in /labs/ws/capstone_run, with /odom in it",
    odom_count is not None and int(odom_count.group(1)) > 0,
    "Record one while a goal runs: ros2 bag record -o /labs/ws/capstone_run --topics /odom /cmd_vel",
)
sys.exit(c.finish())
