#!/usr/bin/env python3
"""Checks the Lesson 15 lab: battery_monitor, copied from labs/lesson15/lab into
the workspace with battery_interfaces and fixed so that it no longer freezes.

    python3 /labs/lesson15/check.py

It runs estimator.py and your node, publishes voltages twice a second, and
checks that a charge comes back for each, and that the node still answers
`ros2 param list` while it works.
"""

import re
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from checklib import WS, Checker, background, ros, stop  # noqa: E402

EXE = WS / "install" / "battery_monitor" / "lib" / "battery_monitor" / "battery_monitor"
ESTIMATOR = Path(__file__).resolve().parent / "estimator.py"
VOLTS = 3.84  # charge 0.6


c = Checker(f"Lesson 15 lab: checking {WS}")
c.check(
    "battery_interfaces is built",
    (WS / "install" / "battery_interfaces").is_dir(),
    "Copy labs/lesson15/lab/battery_interfaces into src, then colcon build.",
)
built = c.check("battery_monitor is built", EXE.is_file(), "Copy labs/lesson15/lab/battery_monitor into src, then colcon build.")

r = {}
if built:
    estimator = background(f"python3 {ESTIMATOR}")
    node = background("ros2 run battery_monitor battery_monitor")
    try:
        time.sleep(3)
        echo = background("ros2 topic echo /battery_charge std_msgs/msg/Float64 --field data")
        voltages = background(f'ros2 topic pub -r 2 /battery_voltage std_msgs/msg/Float64 "{{data: {VOLTS}}}"')
        time.sleep(3)
        code, r["params"] = ros("ros2 param list /battery_monitor", isolated=True, timeout=10)
        r["answered"] = code == 0 and "use_sim_time" in r["params"]
        time.sleep(5)
        stop(voltages)
        time.sleep(1)
        stop(echo)
        r["charges"] = [float(v) for v in re.findall(r"^(-?[\d.]+)$", echo.stdout.read().decode(errors="replace"), re.M)]
    finally:
        stop(node)
        stop(estimator)

ran = lambda hint: hint if built else "Needs the node: build it first."
charges = r.get("charges", [])
c.check(
    "a charge comes back for each voltage, not just the first",
    lambda: len(charges) >= 6,
    ran(f"Got {len(charges)} charges for about 18 voltages. If it is 0 or 1, the node froze waiting inside a callback."),
)
c.check(
    f"each charge is right: {VOLTS} V is 0.6 full",
    lambda: charges and all(abs(v - 0.6) < 1e-6 for v in charges),
    ran(f"Got {charges[:5]}"),
)
c.check(
    "while it works, it still answers ros2 param list",
    lambda: r["answered"],
    ran("ros2 param list /battery_monitor got no answer: the node's only thread is stuck."),
)
sys.exit(c.finish())
