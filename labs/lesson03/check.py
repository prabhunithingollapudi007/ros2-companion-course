#!/usr/bin/env python3
"""Checks the Lesson 3 lab: a C++ package called hello_ros in the workspace /labs/ws,
built, whose program `hello` prints "Hello from my first package".

    python3 /labs/lesson03/check.py
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from checklib import WS, Checker, dependencies, package_xml, ros  # noqa: E402

GREETING = "Hello from my first package"
PKG = WS / "src" / "hello_ros"

c = Checker(f"Lesson 3 lab: checking {WS}")
c.check("the workspace has a src folder", (WS / "src").is_dir(), "Create it with: mkdir -p /labs/ws/src")
has_pkg = c.check("there is a package in src/hello_ros", (PKG / "package.xml").is_file(), "Create it from /labs/ws/src with ros2 pkg create.")
root = package_xml(PKG / "package.xml") if has_pkg else None
c.check("package.xml names it hello_ros", lambda: root.find("name").text == "hello_ros")
c.check("it is a C++ package (ament_cmake)", lambda: root.find("export/build_type").text == "ament_cmake", "Use --build-type ament_cmake.")
c.check("it depends on rclcpp", lambda: "rclcpp" in dependencies(root), "Add <depend>rclcpp</depend>, or create it with --dependencies rclcpp.")
c.check(
    "CMakeLists.txt builds a program called hello",
    lambda: "add_executable(hello " in (PKG / "CMakeLists.txt").read_text(),
    "Create the package with --node-name hello.",
)
built = c.check(
    "the workspace has been built",
    (WS / "install" / "hello_ros" / "lib" / "hello_ros" / "hello").is_file(),
    "Run colcon build from /labs/ws.",
)
if built:
    code, output = ros("ros2 run hello_ros hello")
    c.check(
        f'ros2 run hello_ros hello prints "{GREETING}"',
        code == 0 and GREETING in output,
        f"It printed: {output or '(nothing)'}. Did you build again after editing hello.cpp?",
    )
else:
    c.check(f'ros2 run hello_ros hello prints "{GREETING}"', False, "Build the workspace first.")
sys.exit(c.finish())
