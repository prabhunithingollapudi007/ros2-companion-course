#!/usr/bin/env python3
"""Checks the Lesson 12 lab: the Lesson 10 speed limiter with its limits as
parameters, normal_speed and careful_speed, a YAML file config/limits.yaml and a
launch file launch/limiter.launch.py that loads it.

    python3 /labs/lesson12/check.py
"""

import re
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from checklib import WS, Checker, background, ros, stop  # noqa: E402

EXE = WS / "install" / "speed_limiter" / "lib" / "speed_limiter" / "speed_limiter"
SHARE = WS / "install" / "speed_limiter" / "share" / "speed_limiter"
NODE = "/speed_limiter"


def get(name):
    _, text = ros(f"ros2 param get {NODE} {name}", isolated=True)
    m = re.search(r"value is: (-?[\d.e-]+)", text)
    return float(m.group(1)) if m else None


def set_param(name, value):
    """True if the node accepted the new value."""
    _, text = ros(f"ros2 param set {NODE} {name} {value}", isolated=True)
    return "Set parameter successful" in text


def limited(speed):
    pub = background(f'ros2 topic pub -r 10 /cmd_vel_in geometry_msgs/msg/Twist "{{linear: {{x: {speed}}}}}"')
    try:
        time.sleep(1.5)
        _, text = ros("ros2 topic echo --once /cmd_vel_out geometry_msgs/msg/Twist --field linear.x", isolated=True, timeout=15)
    finally:
        stop(pub)
    m = re.match(r"\s*(-?[\d.e-]+)", text)
    return float(m.group(1)) if m else None


c = Checker(f"Lesson 12 lab: checking {WS}")
built = c.check(
    "speed_limiter and speed_limiter_interfaces from Lesson 10 are built",
    EXE.is_file() and (WS / "install" / "speed_limiter_interfaces").is_dir(),
    "This lab extends the Lesson 10 lab: build both packages first.",
)
installed = c.check(
    "config/limits.yaml and launch/limiter.launch.py are installed",
    (SHARE / "config" / "limits.yaml").is_file() and (SHARE / "launch" / "limiter.launch.py").is_file(),
    "Install config and launch in CMakeLists.txt, then colcon build.",
)

r = {}
if built:
    node = background("ros2 run speed_limiter speed_limiter")
    try:
        time.sleep(2)
        r["defaults"] = (get("normal_speed"), get("careful_speed"))
        _, r["describe"] = ros(f"ros2 param describe {NODE} normal_speed careful_speed", isolated=True)
        r["set 1.5"] = set_param("normal_speed", 1.5)
        r["at 1.5"] = limited(1.6)
        r["set 3.0"] = set_param("normal_speed", 3.0)
        r["set 0.2"] = set_param("normal_speed", 0.2)
        r["after refusals"] = get("normal_speed")
    finally:
        stop(node)
if built and installed:
    launched = background("ros2 launch speed_limiter limiter.launch.py")
    try:
        time.sleep(3)
        r["from yaml"] = (get("normal_speed"), get("careful_speed"))
    finally:
        stop(launched)

ran = lambda hint: hint if built else "Needs the node: build it first."
c.check(
    "normal_speed and careful_speed are parameters, 1.0 and 0.3 by default",
    lambda: r["defaults"] == (1.0, 0.3),
    ran(f"ros2 param get gave {r.get('defaults')}."),
)
c.check(
    "their ranges are 0.1 to 2.0 and 0.05 to 1.0",
    lambda: re.findall(r"(Min|Max) value: (-?[\d.]+)", r["describe"]) == [("Min", "0.1"), ("Max", "2.0"), ("Min", "0.05"), ("Max", "1.0")],
    ran("Give each a ParameterDescriptor with a floating_point_range."),
)
c.check(
    "setting normal_speed to 1.5 while it runs takes effect at once",
    lambda: r["set 1.5"] and r["at 1.5"] is not None and abs(r["at 1.5"] - 1.5) < 1e-6,
    ran(f"The set {'worked' if r.get('set 1.5') else 'failed'}, and 1.6 m/s came out as {r.get('at 1.5')}."),
)
c.check(
    "3.0 (out of range) and 0.2 (below careful_speed) are refused, and the value stays 1.5",
    lambda: not r["set 3.0"] and not r["set 0.2"] and r["after refusals"] == 1.5,
    ran(f"3.0 was {'accepted' if r.get('set 3.0') else 'refused'}, 0.2 was {'accepted' if r.get('set 0.2') else 'refused'}; the value is {r.get('after refusals')}."),
)
c.check(
    "limiter.launch.py loads limits.yaml: 0.8 and 0.2",
    lambda: r["from yaml"] == (0.8, 0.2),
    f"With the launch file the values were {r.get('from yaml')}." if built and installed else "Install the launch file and the YAML file first.",
)
sys.exit(c.finish())
