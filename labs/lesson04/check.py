#!/usr/bin/env python3
"""Checks the Lesson 4 lab: a package power_monitor in /labs/ws with a message
BatteryStatus and a node battery_monitor that turns /battery_voltage readings
into /battery_status messages.

It starts the battery simulator and your node itself, on a ROS domain of its
own, so stop them in your terminals first or not: they do not interfere.

    python3 /labs/lesson04/check.py
"""

import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from checklib import WS, Checker, background, dependencies, package_xml, ros, ros_for, stop  # noqa: E402

PKG = WS / "src" / "power_monitor"
MSG = PKG / "msg" / "BatteryStatus.msg"
FIELDS = [("float32", "voltage"), ("float32", "percent"), ("bool", "low")]
EMPTY, FULL, LOW = 21.0, 25.2, 20.0


def expected_percent(voltage):
    return min(max((voltage - EMPTY) / (FULL - EMPTY) * 100.0, 0.0), 100.0)


def fields(path):
    rows = []
    for line in path.read_text().splitlines():
        line = line.split("#")[0].strip()
        if line:
            rows.append(tuple(line.split()[:2]))
    return rows


c = Checker(f"Lesson 4 lab: checking {WS}")
has_pkg = c.check("there is a package in src/power_monitor", (PKG / "package.xml").is_file(), "Create it in /labs/ws/src with ros2 pkg create.")
root = package_xml(PKG / "package.xml") if has_pkg else None
c.check("package.xml names it power_monitor", lambda: root.find("name").text == "power_monitor")
c.check("it depends on rclcpp and std_msgs", lambda: {"rclcpp", "std_msgs"} <= dependencies(root))
c.check(
    "package.xml declares it generates messages",
    lambda: "rosidl_default_generators" in dependencies(root)
    and any(e.text == "rosidl_interface_packages" for e in root.iter("member_of_group")),
    "It needs <buildtool_depend>rosidl_default_generators</buildtool_depend>, <exec_depend>rosidl_default_runtime</exec_depend> and <member_of_group>rosidl_interface_packages</member_of_group>.",
)
c.check(
    "msg/BatteryStatus.msg has float32 voltage, float32 percent and bool low",
    lambda: fields(MSG) == FIELDS,
    f"Found: {', '.join(' '.join(f) for f in fields(MSG)) if MSG.is_file() else 'no such file'}",
)
built = c.check(
    "the workspace has been built",
    (WS / "install" / "power_monitor" / "lib" / "power_monitor" / "battery_monitor").is_file(),
    "Run colcon build from /labs/ws. If it fails, read the first error it prints.",
)

if built:
    code, shown = ros("ros2 interface show power_monitor/msg/BatteryStatus")
    c.check("ROS knows the message type power_monitor/msg/BatteryStatus", code == 0 and "percent" in shown, shown)

    sim = background("python3 /labs/lesson04/battery_sim.py")
    node = background("ros2 run power_monitor battery_monitor")
    try:
        time.sleep(3)
        _, nodes = ros("ros2 node list", isolated=True)
        c.check("a node called /battery_monitor is running", "/battery_monitor" in nodes.split(), f"Running nodes: {nodes or 'none'}")
        _, kind = ros("ros2 topic type /battery_status", isolated=True)
        c.check("/battery_status carries power_monitor/msg/BatteryStatus", kind.strip() == "power_monitor/msg/BatteryStatus", f"It carries: {kind or 'nothing yet'}")
        rows = [r.split(",") for r in ros_for("ros2 topic echo --csv /battery_status", 5).splitlines() if r.count(",") == 2]
        c.check("it publishes a status for each reading", len(rows) >= 5, f"Received {len(rows)} messages in 5 seconds; the battery sends 10.")
        wrong = []
        for voltage, percent, low in rows:
            v, p = float(voltage), float(percent)
            want_p = expected_percent(v)
            if abs(p - want_p) > 0.05 or (low.strip().lower() == "true") != (want_p < LOW):
                wrong.append(f"{v:.1f} V gave {p:.2f} % and low={low.strip()}, expected {want_p:.2f} % and low={want_p < LOW}")
        c.check("percent and low are right for every reading", rows and not wrong, "; ".join(wrong[:2]))
    finally:
        stop(node)
        stop(sim)
else:
    for d in (
        "ROS knows the message type power_monitor/msg/BatteryStatus",
        "a node called /battery_monitor is running",
        "/battery_status carries power_monitor/msg/BatteryStatus",
        "it publishes a status for each reading",
        "percent and low are right for every reading",
    ):
        c.check(d, False, "Build the workspace first.")
sys.exit(c.finish())
