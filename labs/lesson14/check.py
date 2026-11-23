#!/usr/bin/env python3
"""Checks the Lesson 14 lab: a params file /labs/ws/lesson14/fixes.yaml that
makes each of the three silent graphs in silent_graphs.py work.

    python3 /labs/lesson14/check.py
"""

import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from checklib import WS, Checker, ros  # noqa: E402

FIXES = WS / "lesson14" / "fixes.yaml"
GRAPHS = Path(__file__).resolve().parent / "silent_graphs.py"


def received(graph, fixes=True):
    extra = f" --ros-args --params-file {FIXES}" if fixes else ""
    _, text = ros(f"python3 {GRAPHS} {graph} --seconds 4{extra}", workspace=None, isolated=True, timeout=40)
    m = re.search(r"received (\d+)", text)
    return (int(m.group(1)) if m else None), text


c = Checker(f"Lesson 14 lab: checking {FIXES}")
c.check("the graphs are silent without fixes", lambda: all(received(g, fixes=False)[0] == 0 for g in ("lidar", "map", "odom")))
has_file = c.check("there is a params file lesson14/fixes.yaml in the workspace", FIXES.is_file(), "Create /labs/ws/lesson14/fixes.yaml.")

for graph, what, at_least, hint in [
    ("lidar", "obstacle_watch hears fake_lidar's scans", 20, "Which QoS policy does the publisher offer, and which does the subscriber ask for?"),
    ("map", "planner gets the map although it starts two seconds late", 1, "A late joiner gets old messages only if both sides agree to keep them."),
    ("odom", "dashboard hears the odometer", 20, "What is the odometer's topic's full name? ros2 topic list will tell you."),
]:
    if has_file:
        count, text = received(graph)
        c.check(f"{graph}: {what}", count is not None and count >= at_least, f"{text.strip().splitlines()[-1] if text.strip() else 'no output'}. {hint}")
    else:
        c.check(f"{graph}: {what}", False, "Needs the params file first.")
sys.exit(c.finish())
