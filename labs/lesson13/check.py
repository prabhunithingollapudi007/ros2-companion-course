#!/usr/bin/env python3
"""Checks the Lesson 13 lab: a node cmd_watchdog, in a package of the same name,
that stops the robot when commands stop, added to the rover_stack launch file
between the speed limiter and the simulation.

    python3 /labs/lesson13/check.py

It needs the whole stack in the workspace: rover_description (Lesson 7),
rover_sim (Lesson 9), speed_limiter_interfaces and speed_limiter (Lessons 10
and 12), rover_stack and cmd_watchdog.
"""

import re
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from checklib import WS, Checker, background, ros, stop  # noqa: E402

PACKAGES = ["rover_description", "rover_sim", "speed_limiter_interfaces", "speed_limiter", "rover_stack", "cmd_watchdog"]
EXE = WS / "install" / "cmd_watchdog" / "lib" / "cmd_watchdog" / "cmd_watchdog"
GZ = "GZ_PARTITION=lesson13_check "


def first_number(text):
    m = re.match(r"\s*(-?[\d.e-]+)", text or "")
    return float(m.group(1)) if m else None


def echo_x(topic, kind="geometry_msgs/msg/Twist", field="linear.x"):
    _, text = ros(f"ros2 topic echo --once {topic} {kind} --field {field}", isolated=True, timeout=20)
    return first_number(text)


c = Checker(f"Lesson 13 lab: checking {WS}")
missing = [p for p in PACKAGES if not (WS / "install" / p).is_dir()]
c.check(
    "the stack's packages are built: " + ", ".join(PACKAGES),
    not missing,
    f"Missing: {', '.join(missing)}. Copy the examples or solutions of earlier lessons into src, then colcon build.",
)
built = c.check("the node cmd_watchdog is built and installed", EXE.is_file(), "Install it in CMakeLists.txt, then colcon build.")

w = {}
if built:
    dog = background("ros2 run cmd_watchdog cmd_watchdog")
    try:
        time.sleep(2)
        _, w["timeout"] = ros("ros2 param get /cmd_watchdog timeout", isolated=True)
        pub = background('ros2 topic pub -r 10 /cmd_vel_in geometry_msgs/msg/Twist "{linear: {x: 0.5}}"')
        try:
            time.sleep(1.5)
            w["passing"] = echo_x("/cmd_vel_out")
        finally:
            stop(pub)
        time.sleep(1.0)
        w["stopped"] = echo_x("/cmd_vel_out")
    finally:
        stop(dog)

ran = lambda hint: hint if built else "Needs the node: build it first."
c.check("it has a parameter timeout, 0.5 by default", lambda: "Double value is: 0.5" in w["timeout"], ran(f"ros2 param get printed: {w.get('timeout')}"))
c.check(
    "commands on cmd_vel_in come out on cmd_vel_out unchanged",
    lambda: w["passing"] is not None and abs(w["passing"] - 0.5) < 1e-6,
    ran(f"0.5 came out as {w.get('passing')}."),
)
c.check(
    "a second after commands stop, it is publishing stops (all zero)",
    lambda: w["stopped"] == 0.0,
    ran(f"A second after the last command, cmd_vel_out had {w.get('stopped')}."),
)

s = {}
if not missing:
    sim = background(GZ + "ros2 launch rover_stack stack.launch.py gui:=false")
    try:
        ros(GZ + "ros2 topic echo --once /clock rosgraph_msgs/msg/Clock", isolated=True, timeout=90)
        time.sleep(3)
        _, s["nodes"] = ros("ros2 node list", isolated=True)
        pub = background('ros2 topic pub -r 10 /cmd_vel_in geometry_msgs/msg/Twist "{linear: {x: 1.5}}"')
        try:
            time.sleep(3)
            s["driving"] = echo_x("/odom", "nav_msgs/msg/Odometry", "twist.twist.linear.x")
        finally:
            stop(pub)
        time.sleep(2)
        s["after"] = echo_x("/odom", "nav_msgs/msg/Odometry", "twist.twist.linear.x")
    finally:
        stop(sim)

whole = lambda hint: hint if not missing else "Needs the whole stack built first."
c.check(
    "stack.launch.py starts both the speed limiter and the watchdog",
    lambda: {"/speed_limiter", "/cmd_watchdog"} <= set(s["nodes"].split()),
    whole(f"Running nodes: {' '.join((s.get('nodes') or '').split())}"),
)
c.check(
    "driven at 1.5 m/s on /cmd_vel_in, the rover goes at the limit from stack.yaml, 0.8 m/s",
    lambda: s["driving"] is not None and abs(s["driving"] - 0.8) < 0.1,
    whole(f"Odometry said {s.get('driving')} m/s."),
)
c.check(
    "two seconds after the commands stop, the rover has stopped",
    lambda: s["after"] is not None and abs(s["after"]) < 0.05,
    whole(f"Odometry still said {s.get('after')} m/s: is the watchdog between the limiter and /cmd_vel?"),
)
sys.exit(c.finish())
