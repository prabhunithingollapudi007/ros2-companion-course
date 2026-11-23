#!/usr/bin/env python3
"""Checks the Lesson 7 lab: a package quad_description with urdf/quad.urdf.xacro
describing the four-wheeled robot in the lesson, and launch/display.launch.py.

    python3 /labs/lesson07/check.py
"""

import math
import subprocess
import sys
import time
import xml.etree.ElementTree as ET
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from checklib import WS, Checker, background, ros, stop  # noqa: E402

PKG = WS / "src" / "quad_description"
XACRO = PKG / "urdf" / "quad.urdf.xacro"
WHEELS = {"front_left": (1, 1), "front_right": (1, -1), "rear_left": (-1, 1), "rear_right": (-1, -1)}
LINKS = {"base_link", "lidar"} | {f"{w}_wheel" for w in WHEELS}
MM = 0.001


def numbers(text, n=3):
    values = [float(v) for v in (text or "").split()]
    return values + [0.0] * (n - len(values))


def rotate(rpy, v):
    """v turned by roll, pitch, yaw about the fixed x, y and z axes, as URDF defines them."""
    r, p, y = rpy
    cr, sr, cp, sp, cy, sy = math.cos(r), math.sin(r), math.cos(p), math.sin(p), math.cos(y), math.sin(y)
    m = [
        [cy * cp, cy * sp * sr - sy * cr, cy * sp * cr + sy * sr],
        [sy * cp, sy * sp * sr + cy * cr, sy * sp * cr - cy * sr],
        [-sp, cp * sr, cp * cr],
    ]
    return [sum(m[i][k] * v[k] for k in range(3)) for i in range(3)]


def close(a, b, tolerance=MM):
    return all(abs(x - y) <= tolerance for x, y in zip(a, b))


c = Checker(f"Lesson 7 lab: checking {WS}")
c.check("there is a package in src/quad_description", (PKG / "package.xml").is_file(), "Create it in /labs/ws/src with ros2 pkg create.")
robot = None
if c.check("it has urdf/quad.urdf.xacro", XACRO.is_file(), "Write the robot in src/quad_description/urdf/quad.urdf.xacro."):
    done = subprocess.run(["bash", "-c", f"source /opt/ros/jazzy/setup.bash && xacro {XACRO}"], capture_output=True, text=True)
    if c.check("xacro turns it into a URDF", done.returncode == 0, (done.stderr.strip().splitlines() or ["(no output)"])[-1]):
        robot = ET.fromstring(done.stdout)
else:
    c.check("xacro turns it into a URDF", False, "Write the file first.")

joints = {j.get("name"): j for j in robot.iter("joint")} if robot is not None else {}
links = {l.get("name"): l for l in robot.iter("link")} if robot is not None else {}
NO_URDF = "Needs the URDF that xacro makes: fix the checks above first."
WHEEL_NAMES = "Name the joints " + ", ".join(f"{w}_wheel_joint" for w in WHEELS) + "."


def urdf_check(description, test, hint=""):
    """A check of the expanded URDF; with no URDF there is nothing to look at, so say that once."""
    return c.check(description, test, hint) if robot is not None else c.check(description, False, NO_URDF)


def origin(joint):
    o = joint.find("origin")
    return (numbers(o.get("xyz")) if o is not None else [0.0] * 3), (numbers(o.get("rpy")) if o is not None else [0.0] * 3)


urdf_check("the robot is called quad", lambda: robot.get("name") == "quad")
urdf_check(f"its links are {', '.join(sorted(LINKS))}", lambda: set(links) == LINKS, f"Found: {', '.join(sorted(links))}")
urdf_check(
    "four continuous wheel joints, <prefix>_wheel_joint, on base_link",
    lambda: all(
        joints[f"{w}_wheel_joint"].get("type") == "continuous" and joints[f"{w}_wheel_joint"].find("parent").get("link") == "base_link"
        for w in WHEELS
    ),
    WHEEL_NAMES,
)
urdf_check(
    "each wheel sits 0.18 m forward or back and 0.175 m to the side",
    lambda: all(close(origin(joints[f"{w}_wheel_joint"])[0], [f * 0.18, s * 0.175, 0.0]) for w, (f, s) in WHEELS.items()),
    WHEEL_NAMES,
)


def axis_in_base(joint):
    a = joint.find("axis")
    return rotate(origin(joint)[1], numbers(a.get("xyz")) if a is not None else [1.0, 0.0, 0.0])


urdf_check(
    "every wheel turns about the robot's sideways (y) axis",
    lambda: all(abs(abs(axis_in_base(joints[f"{w}_wheel_joint"])[1]) - 1) < 1e-3 for w in WHEELS),
    "Turn the joint with rpy, or set its axis, so the wheel spins about y as seen from base_link.",
)
urdf_check(
    "the lidar is fixed 0.15 m forward, on top of the base",
    lambda: joints["lidar_joint"].get("type") == "fixed" and close(origin(joints["lidar_joint"])[0], [0.15, 0.0, 0.09]),
    "Call its joint lidar_joint, make it fixed, and put it at xyz 0.15 0 0.09.",
)


def inertia_ok():
    for link in links.values():
        mass = link.find("inertial/mass")
        if mass is None or float(mass.get("value")) <= 0:
            return False
    i = links["base_link"].find("inertial/inertia")
    m = float(links["base_link"].find("inertial/mass").get("value"))
    want = (m * (0.3**2 + 0.12**2) / 12, m * (0.5**2 + 0.12**2) / 12, m * (0.5**2 + 0.3**2) / 12)
    got = (float(i.get("ixx")), float(i.get("iyy")), float(i.get("izz")))
    return abs(m - 6.0) < 1e-6 and all(abs(g - w) <= 0.01 * w for g, w in zip(got, want))


urdf_check("every link has a mass, and base_link's inertia is that of a 6 kg box", inertia_ok, "Use the box and cylinder inertia formulas from the lesson.")

if robot is not None:
    Path("/tmp/quad.urdf").write_text(done.stdout)
    tree = subprocess.run(["check_urdf", "/tmp/quad.urdf"], capture_output=True, text=True)
    c.check("check_urdf accepts it", tree.returncode == 0, tree.stdout.strip()[-200:] or tree.stderr.strip()[-200:])
else:
    c.check("check_urdf accepts it", False, NO_URDF)

installed = (WS / "install" / "quad_description" / "share" / "quad_description" / "launch" / "display.launch.py").is_file()
if c.check("launch/display.launch.py is built and installed", installed, "Install urdf and launch in CMakeLists.txt, then colcon build."):
    launch = background("ros2 launch quad_description display.launch.py rviz:=false")
    try:
        time.sleep(5)
        _, nodes = ros("ros2 node list", isolated=True)
        _, desc = ros("ros2 topic echo --once /robot_description --field data", isolated=True, timeout=20)
    finally:
        stop(launch)
    c.check("it starts robot_state_publisher with the robot's description", "/robot_state_publisher" in nodes.split() and 'name="quad"' in desc, nodes)
else:
    c.check("it starts robot_state_publisher with the robot's description", False, "Install the launch file first.")
sys.exit(c.finish())
