#!/usr/bin/env python3
"""Checks the Lesson 11 lab: an action type Charge in a package
charger_interfaces, and a C++ node charger, in a package of the same name, that
offers it as /charge.

    python3 /labs/lesson11/check.py

It sends goals with goal_client.py, which sits beside this file.
"""

import json
import re
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from checklib import WS, Checker, background, ros, stop  # noqa: E402

EXE = WS / "install" / "charger" / "lib" / "charger" / "charger"
ACTION = "charger_interfaces/action/Charge"
WANT = [["float64 target_level"], ["float64 level"], ["float64 level"]]
CLIENT = Path(__file__).resolve().parent / "goal_client.py"


def fields(text):
    """Goal, result and feedback fields as `ros2 interface show` printed them, without comments."""
    clean = lambda part: [re.sub(r"\s+", " ", line.split("#")[0]).strip() for line in part.splitlines() if line.split("#")[0].strip()]
    return [clean(part) for part in text.split("---")]


def goal(target, cancel_after=None):
    """What goal_client.py reports for one goal, or None if it printed nothing useful."""
    extra = f" {cancel_after}" if cancel_after else ""
    _, text = ros(f"python3 {CLIENT} {target}{extra}", isolated=True, timeout=60)
    for line in reversed(text.splitlines()):
        if line.startswith("{"):
            return json.loads(line)
    return None


c = Checker(f"Lesson 11 lab: checking {WS}")
c.check(
    "there are packages src/charger_interfaces and src/charger",
    all((WS / "src" / p / "package.xml").is_file() for p in ("charger_interfaces", "charger")),
    "Create both in /labs/ws/src with ros2 pkg create.",
)
_, shown = ros(f"ros2 interface show {ACTION}") if (WS / "install" / "setup.bash").is_file() else (None, "")
c.check(
    f"{ACTION} has goal 'float64 target_level', result 'float64 level' and feedback 'float64 level'",
    fields(shown) == WANT,
    f"ros2 interface show {ACTION} printed: {shown[:200]}" if shown else "Build the interfaces package with colcon build.",
)
built = c.check("the node charger is built and installed", EXE.is_file(), "Install it in CMakeLists.txt, then colcon build.")

r = {}
if built:
    node = background("ros2 run charger charger")
    try:
        time.sleep(2)
        r["to half"] = goal(0.5)
        r["lower"] = goal(0.3)
        r["too high"] = goal(1.5)
        r["cancelled"] = goal(1.0, 1.0)
        r["after cancel"] = goal(0.9)
    finally:
        stop(node)

g = r.get("to half") or {}
ran = lambda hint: hint if built else "Needs the node: build it first."
c.check(
    "a goal of 0.5 is accepted, and succeeds with the level at 0.5 after about 3 s",
    lambda: g["accepted"] and g["status"] == "succeeded" and abs(g["level"] - 0.5) < 0.011 and 2.0 < g["seconds"] < 5.0,
    ran(f"goal_client.py reported {g}" if g else "No report from goal_client.py."),
)
c.check(
    "its feedback climbs from just above 0.2 to 0.5",
    lambda: len(g["feedback"]) >= 10 and g["feedback"] == sorted(g["feedback"]) and 0.2 < g["feedback"][0] < 0.25 and abs(g["feedback"][-1] - 0.5) < 0.011,
    ran(f"Feedback: {g.get('feedback')}"),
)
c.check(
    "goals below the level now, or above 1.0, are rejected",
    lambda: r["lower"]["accepted"] is False and r["too high"]["accepted"] is False,
    ran(f"0.3 was {'accepted' if (r.get('lower') or {}).get('accepted') else 'rejected'}, 1.5 was {'accepted' if (r.get('too high') or {}).get('accepted') else 'rejected'}."),
)
x = r.get("cancelled") or {}
c.check(
    "cancelled after 1 s, a goal of 1.0 ends canceled, at about 0.6",
    lambda: x["status"] == "canceled" and 0.55 < x["level"] < 0.7,
    ran(f"goal_client.py reported {x}" if x else "No report."),
)
y = r.get("after cancel") or {}
c.check(
    "the charge is kept between goals: 0.9 then succeeds from there",
    lambda: y["status"] == "succeeded" and abs(y["level"] - 0.9) < 0.011 and y["feedback"][0] > 0.55,
    ran(f"goal_client.py reported {y}" if y else "No report."),
)
sys.exit(c.finish())
