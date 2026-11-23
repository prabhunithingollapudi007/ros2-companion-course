#!/usr/bin/env python3
"""Checks the Lesson 8 lab: a C++ node object_locator, in a package of the same
name, that turns each detection on /detections (a point in the camera frame) into
the same point in the map frame on /object_in_map.

    python3 /labs/lesson08/check.py

It runs your node with lab_world.py, whose object stands still at (2.0, 1.0, 0.0)
in the map frame, and compares every point you publish with that.
"""

import math
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from checklib import WS, Checker, background, dependencies, package_xml, stop  # noqa: E402

PKG = WS / "src" / "object_locator"
EXE = WS / "install" / "object_locator" / "lib" / "object_locator" / "object_locator"
WORLD = Path(__file__).resolve().parent / "lab_world.py"
OBJECT = (2.0, 1.0, 0.0)
TOLERANCE = 0.02  # metres


def points(csv_text):
    """(stamp in ns, frame, x, y, z) for each line `ros2 topic echo --csv` printed for a PointStamped."""
    found = []
    for line in csv_text.splitlines():
        parts = line.split(",")
        if len(parts) == 6 and parts[0].isdigit():
            found.append((int(parts[0]) * 10**9 + int(parts[1]), parts[2], *map(float, parts[3:])))
    return found


c = Checker(f"Lesson 8 lab: checking {WS}")
root = package_xml(PKG / "package.xml")
c.check("there is a package in src/object_locator", root is not None, "Create it in /labs/ws/src with ros2 pkg create.")
c.check(
    "it depends on rclcpp, geometry_msgs, tf2_ros and tf2_geometry_msgs",
    root is not None and {"rclcpp", "geometry_msgs", "tf2_ros", "tf2_geometry_msgs"} <= dependencies(root),
    "Add them to package.xml (and find_package them in CMakeLists.txt).",
)
built = c.check("the node object_locator is built and installed", EXE.is_file(), "Install it in CMakeLists.txt, then colcon build.")

results, seen = [], []
if built:
    node = background("ros2 run object_locator object_locator")
    time.sleep(2)  # its listener should be filling its buffer before the first detection arrives
    world = background(f"python3 {WORLD}")
    time.sleep(1)
    out = background("ros2 topic echo --csv /object_in_map")
    inp = background("ros2 topic echo --csv /detections")
    try:
        time.sleep(6)
    finally:
        for proc in (inp, out, world, node):
            stop(proc)
    results = points(out.stdout.read().decode("utf-8", errors="replace"))
    seen = points(inp.stdout.read().decode("utf-8", errors="replace"))

c.check(
    "it publishes points on /object_in_map",
    len(results) >= 5,
    f"Got {len(results)} in 6 s while /detections had {len(seen)}. Subscribe to detections, publish geometry_msgs/msg/PointStamped on object_in_map."
    if built
    else "Build the node first.",
)
c.check("they are in the map frame", lambda: results and all(r[1] == "map" for r in results), "Set header.frame_id to map.")
stamps = {s[0] for s in seen}
# The two listeners start a moment apart: compare only results from detections both of them heard.
covered = [r for r in results if stamps and min(stamps) <= r[0] <= max(stamps)]
c.check(
    "each keeps the stamp of the detection it came from",
    lambda: len(covered) >= 3 and all(r[0] in stamps for r in covered),
    "The point in the map frame describes the same moment: keep the detection's header.stamp.",
)
errors = [math.dist(r[2:], OBJECT) for r in results]
c.check(
    f"each is within {TOLERANCE * 100:.0f} cm of where the object is, {OBJECT}",
    lambda: errors and max(errors) <= TOLERANCE,
    (
        f"Largest error: {max(errors):.3f} m. Errors of tens of centimetres mean the transform is from the wrong moment: "
        "look it up at the detection's stamp, not the latest one."
    )
    if errors
    else "No points to check.",
)
sys.exit(c.finish())
