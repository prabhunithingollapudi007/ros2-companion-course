#!/usr/bin/env python3
"""Checks the Lesson 5 lab: a package fleet_bringup in /labs/ws whose launch file
fleet.launch.py starts two robots and a dashboard wired to both.

It launches your file itself, twice, on a ROS domain of its own.

    python3 /labs/lesson05/check.py
"""

import re
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from checklib import WS, Checker, background, ros, stop  # noqa: E402

PKG = WS / "src" / "fleet_bringup"
LAUNCH = "ros2 launch fleet_bringup fleet.launch.py"


def robot_nodes(ns):
    return {f"/{ns}/battery", f"/{ns}/monitor"}


def run_fleet(extra, c, second):
    """Launches the fleet, checks what is running, and stops it."""
    launch = background(f"{LAUNCH} {extra}".strip())
    try:
        time.sleep(6)
        _, nodes = ros("ros2 node list", isolated=True)
        want = robot_nodes("robot1") | robot_nodes(second) | {"/dashboard"}
        got = set(nodes.split())
        c.check(
            f"it starts {', '.join(sorted(want))}",
            got == want,
            f"Running: {', '.join(sorted(got)) or 'nothing'}" + (f"; missing {', '.join(sorted(want - got))}" if want - got else ""),
        )
        for ns in ("robot1", second):
            _, info = ros(f"ros2 topic info /{ns}/battery_status", isolated=True)
            c.check(
                f"the dashboard listens to /{ns}/battery_status",
                "Subscription count: 1" in info,
                info.replace("\n", "; ") or "no such topic",
            )
    finally:
        stop(launch)
    output = launch.stdout.read().decode("utf-8", errors="replace")
    reports = re.findall(r"robot_a: ([\d.]+) % \| robot_b: ([\d.]+) %", output)
    c.check("the dashboard reports a charge for both robots", bool(reports), "Its last report: " + (re.findall(r"robot_a: .*", output) or ["none"])[-1])


c = Checker(f"Lesson 5 lab: checking {WS}")
c.check("fleet_demo has been built", (WS / "install" / "fleet_demo").is_dir(), "Copy /labs/lesson05/fleet_demo into /labs/ws/src and build.")
c.check("there is a package in src/fleet_bringup", (PKG / "package.xml").is_file(), "Create it in /labs/ws/src with ros2 pkg create.")
c.check("it has launch/fleet.launch.py", (PKG / "launch" / "fleet.launch.py").is_file())
installed = c.check(
    "the launch file is installed",
    (WS / "install" / "fleet_bringup" / "share" / "fleet_bringup" / "launch" / "fleet.launch.py").is_file(),
    "Add install(DIRECTORY launch DESTINATION share/${PROJECT_NAME}) to CMakeLists.txt, then build.",
)
code, args = ros(f"{LAUNCH} --show-args") if installed else (1, "")
c.check("it declares a launch argument second_robot", code == 0 and "'second_robot'" in args, args.strip()[:200] or "Not installed yet.")

if installed:
    run_fleet("", c, "robot2")
    run_fleet("second_robot:=rover", c, "rover")
else:
    for _ in range(2):
        for d in ("it starts the five nodes", "the dashboard listens to the first robot", "the dashboard listens to the second robot", "the dashboard reports a charge for both robots"):
            c.check(d, False, "Install the launch file first.")
sys.exit(c.finish())
