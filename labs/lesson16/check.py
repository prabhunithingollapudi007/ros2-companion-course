#!/usr/bin/env python3
"""Checks the Lesson 16 lab: labs/lesson16/ros1/heartbeat ported to a ROS 2
package heartbeat in /labs/ws/src, with its launch file as launch/heartbeat.launch.xml.

    python3 /labs/lesson16/check.py
"""

import re
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from checklib import WS, Checker, background, package_xml, ros, ros_for, stop  # noqa: E402

PKG = WS / "src" / "heartbeat"
EXE = WS / "install" / "heartbeat" / "lib" / "heartbeat" / "heartbeat"
LAUNCH = WS / "install" / "heartbeat" / "share" / "heartbeat" / "launch" / "heartbeat.launch.xml"


def beats(seconds):
    """The numbers in the /heartbeat messages heard in `seconds`."""
    echo = background("ros2 topic echo /heartbeat std_msgs/msg/String --field data")
    time.sleep(seconds)
    stop(echo)
    return [int(n) for n in re.findall(r"^alive (\d+)$", echo.stdout.read().decode(errors="replace"), re.M)]


def rate():
    """The publishing rate ros2 topic hz measures on /heartbeat, or None. It times the
    messages themselves, so it does not depend on how long the tool takes to start."""
    out = ros_for("ros2 topic hz /heartbeat", 8)
    values = re.findall(r"average rate: ([\d.]+)", out)
    return float(values[-1]) if values else None


def command(running):
    value = "true" if running else "false"
    ros(f'ros2 topic pub --times 3 -r 10 /heartbeat_cmd std_msgs/msg/Bool "{{data: {value}}}"', isolated=True, timeout=20)


c = Checker(f"Lesson 16 lab: checking {WS}")
root = package_xml(PKG / "package.xml")
c.check("there is a package in src/heartbeat", root is not None, "Create it in /labs/ws/src: a ROS 2 package, not the catkin one.")
c.check(
    "it is a ROS 2 package: format 3, built with ament_cmake",
    lambda: root.get("format") == "3" and root.findtext("export/build_type") == "ament_cmake",
    "package.xml needs format=\"3\" and <export><build_type>ament_cmake</build_type></export>.",
)
built = c.check("the node heartbeat is built and installed", EXE.is_file(), "Port CMakeLists.txt to ament_cmake, install the program, then colcon build.")

r = {}
if built:
    node = background("ros2 run heartbeat heartbeat")
    try:
        time.sleep(2)
        r["first"] = beats(5)
        r["hz"] = rate()
        command(False)
        time.sleep(1)
        r["paused"] = beats(2)
        command(True)
        r["resumed"] = beats(6)
        _, r["rate"] = ros("ros2 param get /heartbeat rate", isolated=True)
    finally:
        stop(node)
if LAUNCH.is_file():
    launched = background("ros2 launch heartbeat heartbeat.launch.xml")
    try:
        time.sleep(3)
        r["launched hz"] = rate()
        _, r["launch param"] = ros("ros2 param get /heartbeat rate", isolated=True)
    finally:
        stop(launched)

ran = lambda hint: hint if built else "Needs the node: build it first."
first = r.get("first", [])
c.check(
    "it publishes alive 1, alive 2, ... on /heartbeat, twice a second by default",
    lambda: len(first) >= 3 and first == list(range(first[0], first[0] + len(first))) and 1.5 < r["hz"] < 2.5,
    ran(f"It published {first}, at {r.get('hz')} per second."),
)
c.check("rate is a parameter, 2.0 by default", lambda: "Double value is: 2.0" in r["rate"], ran(f"ros2 param get printed: {r.get('rate')}"))
c.check(
    "false on /heartbeat_cmd pauses it, true resumes it, and the count carries on",
    lambda: r["paused"] == [] and len(r["resumed"]) >= 2 and r["resumed"][0] > first[-1],
    ran(f"Paused it published {r.get('paused')}; resumed, {r.get('resumed')}."),
)
c.check(
    "launch/heartbeat.launch.xml starts it at rate 5",
    lambda: "Double value is: 5.0" in r["launch param"] and 4.0 < r["launched hz"] < 6.0,
    f"With the launch file: {r.get('launch param')}, at {r.get('launched hz')} per second."
    if LAUNCH.is_file()
    else "Port launch/heartbeat.launch to launch/heartbeat.launch.xml and install it.",
)
sys.exit(c.finish())
