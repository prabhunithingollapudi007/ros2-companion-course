#!/usr/bin/env python3
"""Checks the Lesson 9 lab: a package quad_sim that drives the Lesson 7 quad in a
Gazebo world of its own.

    python3 /labs/lesson09/check.py

It needs quad_description from Lesson 7 in the same workspace. It launches your
simulation without a window, drives the robot forward and then round, and reads
where odometry says it went. Gazebo runs on a partition of its own, so a
simulation you have running in another terminal is not disturbed.
"""

import math
import re
import subprocess
import sys
import time
import xml.etree.ElementTree as ET
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from checklib import WS, Checker, background, ros, stop  # noqa: E402

PKG = WS / "src" / "quad_sim"
SHARE = WS / "install" / "quad_sim" / "share" / "quad_sim"
GZ = "GZ_PARTITION=lesson09_check "  # keeps the check's Gazebo apart from yours
WHEELS = {"left": {"front_left_wheel_joint", "rear_left_wheel_joint"}, "right": {"front_right_wheel_joint", "rear_right_wheel_joint"}}


def odom():
    """(x, y, yaw) from one /odom message, or None."""
    _, text = ros("ros2 topic echo --once --no-lost-messages /odom nav_msgs/msg/Odometry --field pose.pose", isolated=True, timeout=15)
    values = dict(re.findall(r"^\s*([xyzw]): (-?[\d.e-]+)$", text.split("orientation:")[0], re.M))
    turn = dict(re.findall(r"^\s*([xyzw]): (-?[\d.e-]+)$", text.split("orientation:")[-1], re.M))
    if not values or not turn:
        return None
    qz, qw = float(turn["z"]), float(turn["w"])
    return float(values["x"]), float(values["y"]), 2 * math.atan2(qz, qw)


def drive(linear, angular, seconds):
    """Publishes a velocity command for a while, then a stop."""
    twist = f'"{{linear: {{x: {linear}}}, angular: {{z: {angular}}}}}"'
    ros(f"ros2 topic pub -r 10 -t {int(seconds * 10)} /cmd_vel geometry_msgs/msg/Twist {twist}", isolated=True, timeout=seconds + 15)
    ros('ros2 topic pub -r 10 -t 5 /cmd_vel geometry_msgs/msg/Twist "{}"', isolated=True, timeout=15)


c = Checker(f"Lesson 9 lab: checking {WS}")
c.check("there is a package in src/quad_sim", (PKG / "package.xml").is_file(), "Create it in /labs/ws/src with ros2 pkg create.")
c.check(
    "quad_description from Lesson 7 is in the workspace too",
    (WS / "install" / "quad_description").is_dir(),
    "Copy your Lesson 7 package into src as well (or labs/lesson07/solution/quad_description), then colcon build.",
)
installed = c.check(
    "worlds/yard.sdf, urdf/quad_sim.urdf.xacro and launch/sim.launch.py are installed",
    all((SHARE / f).is_file() for f in ("worlds/yard.sdf", "urdf/quad_sim.urdf.xacro", "launch/sim.launch.py")),
    "Install worlds, urdf and launch in CMakeLists.txt, then colcon build.",
)


def world_ok():
    world = ET.parse(SHARE / "worlds" / "yard.sdf").getroot().find("world")
    post = world.find("model[@name='post']")
    pose = [float(v) for v in (post.findtext("pose") or "").split()]
    shape = post.find("link/collision/geometry/cylinder")
    return (
        world.get("name") == "yard"
        and (post.findtext("static") or "").strip() == "true"
        and abs(pose[0] - 4) < 0.01
        and abs(pose[1] - 1) < 0.01
        and abs(float(shape.findtext("radius")) - 0.15) < 1e-6
    )


c.check(
    "the world is called yard and has a static post, a cylinder of radius 0.15 m, at (4, 1)",
    world_ok if installed else False,
    "A <model name=\"post\"> with <static>true</static>, a <pose> starting 4 1, and a cylinder collision of radius 0.15.",
)


def plugin_ok():
    done = subprocess.run(
        ["bash", "-c", f"source /opt/ros/jazzy/setup.bash && source {WS}/install/setup.bash && xacro {SHARE}/urdf/quad_sim.urdf.xacro"],
        capture_output=True,
        text=True,
    )
    robot = ET.fromstring(done.stdout)
    for plugin in robot.iter("plugin"):
        if "DiffDrive" in (plugin.get("name") or ""):
            left = {e.text.strip() for e in plugin.findall("left_joint")}
            right = {e.text.strip() for e in plugin.findall("right_joint")}
            return robot.get("name") == "quad" and left == WHEELS["left"] and right == WHEELS["right"]
    return False


c.check(
    "the robot is quad, with a DiffDrive plugin driving both left and both right wheels",
    plugin_ok if installed else False,
    "One <left_joint> line for each left wheel, one <right_joint> for each right wheel.",
)

started = moved = turned = None
if installed:
    sim = background(GZ + "ros2 launch quad_sim sim.launch.py gui:=false")
    try:
        code, clock = ros(GZ + "ros2 topic echo --once --no-lost-messages /clock rosgraph_msgs/msg/Clock", isolated=True, timeout=90)
        started = code == 0 and "sec:" in clock
        if started:
            _, sim_time = ros("ros2 param get /robot_state_publisher use_sim_time", isolated=True)
            time.sleep(3)  # let the robot be spawned and settle
            before = odom()
            drive(0.4, 0.0, 3)
            after = odom()
            drive(0.0, 0.4, 2)
            last = odom()
            if before and after:
                moved = (after[0] - before[0], after[1] - before[1])
            if after and last:
                turned = math.atan2(math.sin(last[2] - after[2]), math.cos(last[2] - after[2]))
    finally:
        stop(sim)

c.check("it starts with gui:=false, and the simulation clock reaches ROS on /clock", bool(started), "Bridge /clock: /clock@rosgraph_msgs/msg/Clock[gz.msgs.Clock")
c.check(
    "robot_state_publisher runs on simulated time",
    lambda: started and "True" in sim_time,
    "Give it the parameter use_sim_time: True.",
)
c.check(
    "driving forward on /cmd_vel moves it forward in /odom",
    lambda: moved is not None and moved[0] > 0.3 and abs(moved[1]) < 0.3 * moved[0],
    f"It moved {moved[0]:.2f} m forward and {moved[1]:.2f} m sideways." if moved else "No odometry: bridge /cmd_vel (ROS to Gazebo) and /odom (Gazebo to ROS).",
)
c.check(
    "turning on /cmd_vel turns it to the left",
    lambda: turned is not None and 0.3 < turned < 2.8,
    f"It turned {turned:.2f} rad." if turned is not None else "No odometry to measure the turn.",
)
sys.exit(c.finish())
