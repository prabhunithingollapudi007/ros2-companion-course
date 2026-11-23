#!/usr/bin/env python3
"""Checks the Lesson 10 lab: a service type SetMode in a package
speed_limiter_interfaces, and a C++ node speed_limiter in a package of the same
name that limits velocity commands and switches modes when /set_mode is called.

    python3 /labs/lesson10/check.py
"""

import re
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from checklib import WS, Checker, background, ros, stop  # noqa: E402

EXE = WS / "install" / "speed_limiter" / "lib" / "speed_limiter" / "speed_limiter"
SRV = "speed_limiter_interfaces/srv/SetMode"
WANT = (["string mode"], ["bool success", "string message", "float64 max_speed"])


def fields(text):
    """The request and response fields `ros2 interface show` printed, without comments."""
    parts = text.split("---")
    clean = lambda part: [re.sub(r"\s+", " ", line.split("#")[0]).strip() for line in part.splitlines() if line.split("#")[0].strip()]
    return (clean(parts[0]), clean(parts[1])) if len(parts) == 2 else None


def call(mode):
    """Calls /set_mode; returns (success, max_speed) from the response, or None."""
    _, text = ros(f'ros2 service call /set_mode {SRV} "{{mode: {mode}}}"', isolated=True, timeout=20)
    m = re.search(r"success=(True|False).*max_speed=(-?[\d.e-]+)", text)
    return (m.group(1) == "True", float(m.group(2))) if m else None


def limited(speed):
    """Publishes `speed` on /cmd_vel_in and returns the linear.x that comes out on /cmd_vel_out, or None."""
    pub = background(f'ros2 topic pub -r 10 /cmd_vel_in geometry_msgs/msg/Twist "{{linear: {{x: {speed}}}}}"')
    try:
        time.sleep(1.5)
        _, text = ros("ros2 topic echo --once /cmd_vel_out geometry_msgs/msg/Twist --field linear.x", isolated=True, timeout=15)
    finally:
        stop(pub)
    m = re.match(r"\s*(-?[\d.e-]+)", text)
    return float(m.group(1)) if m else None


c = Checker(f"Lesson 10 lab: checking {WS}")
c.check(
    "there are packages src/speed_limiter_interfaces and src/speed_limiter",
    all((WS / "src" / p / "package.xml").is_file() for p in ("speed_limiter_interfaces", "speed_limiter")),
    "Create both in /labs/ws/src with ros2 pkg create.",
)
_, shown = ros(f"ros2 interface show {SRV}") if (WS / "install" / "setup.bash").is_file() else (None, "")
c.check(
    f"{SRV} is built, with request 'string mode' and response 'bool success, string message, float64 max_speed'",
    fields(shown) == WANT,
    f"ros2 interface show {SRV} printed: {shown[:200]}" if shown else "Build the interfaces package with colcon build.",
)
built = c.check("the node speed_limiter is built and installed", EXE.is_file(), "Install it in CMakeLists.txt, then colcon build.")
NOT_BUILT = "Needs the node: build it first."

results = {}
if built:
    node = background("ros2 run speed_limiter speed_limiter")
    try:
        time.sleep(2)
        results["normal"] = limited(0.8)
        results["careful"] = call("careful")
        results["careful speed"] = limited(0.8)
        results["careful reverse"] = limited(-0.8)
        results["unknown"] = call("turbo")
        results["unknown speed"] = limited(0.8)
        results["back to normal"] = call("normal")
        results["normal again"] = limited(0.8)
    finally:
        stop(node)

near = lambda a, b: a is not None and abs(a - b) < 1e-6
ran = lambda hint: hint if built else NOT_BUILT
c.check("in normal mode, 0.8 m/s passes through unchanged", lambda: near(results["normal"], 0.8), ran(f"Got {results.get('normal')}."))
c.check(
    "/set_mode careful succeeds and reports a limit of 0.3",
    lambda: results["careful"] == (True, 0.3),
    ran(f"The response was {results.get('careful')} (success, max_speed)."),
)
c.check(
    "in careful mode, 0.8 comes out as 0.3, and -0.8 as -0.3",
    lambda: near(results["careful speed"], 0.3) and near(results["careful reverse"], -0.3),
    ran(f"Got {results.get('careful speed')} and {results.get('careful reverse')}."),
)
c.check(
    "an unknown mode fails, and leaves the limit as it was",
    lambda: results["unknown"] == (False, 0.3) and near(results["unknown speed"], 0.3),
    ran(f"The response was {results.get('unknown')}, and 0.8 came out as {results.get('unknown speed')}."),
)
c.check(
    "/set_mode normal puts the limit back to 1.0",
    lambda: results["back to normal"] == (True, 1.0) and near(results["normal again"], 0.8),
    ran(f"The response was {results.get('back to normal')}, and 0.8 came out as {results.get('normal again')}."),
)
sys.exit(c.finish())
