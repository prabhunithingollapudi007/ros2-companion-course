#!/usr/bin/env python3
"""Checks the Lesson 6 lab: a node dew_point in a package weather_station that pairs
/temperature and /humidity by time stamp and publishes /dew_point.

It makes a fresh copy of the weather bag, plays it, runs your node, and checks
every dew point against the readings in the bag. All on a domain of its own.

    python3 /labs/lesson06/check.py
"""

import math
import subprocess
import sys
import tempfile
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from checklib import WS, Checker, background, ros_for, stop  # noqa: E402

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
import make_weather_bag as bag  # noqa: E402

PKG = WS / "src" / "weather_station"
TOLERANCE = 0.2  # degrees Celsius
SLOP = 0.5  # seconds: how far apart a pair's two readings may be


def magnus(celsius, humidity):
    b, c = 17.62, 243.12
    gamma = math.log(humidity) + b * celsius / (c + celsius)
    return c * gamma / (b - gamma)


def readings():
    """Every (stamp, value) in the bag, as make_weather_bag.py writes them."""
    temps = [(bag.START + 0.25 * k + 0.03, bag.temperature(0.25 * k + 0.03)) for k in range(bag.SECONDS * 4)]
    hums = [(bag.START + 1.0 * k + 0.11, bag.humidity(1.0 * k + 0.11)) for k in range(bag.SECONDS)]
    return temps, hums


c = Checker(f"Lesson 6 lab: checking {WS}")
c.check("there is a package in src/weather_station", (PKG / "package.xml").is_file(), "Create it in /labs/ws/src with ros2 pkg create.")
built = c.check(
    "the workspace has been built",
    (WS / "install" / "weather_station" / "lib" / "weather_station" / "dew_point").is_file(),
    "Run colcon build from /labs/ws.",
)

if built:
    folder = Path(tempfile.mkdtemp()) / "weather"
    subprocess.run(["bash", "-c", f"source /opt/ros/jazzy/setup.bash && python3 {HERE / 'make_weather_bag.py'} {folder}"], capture_output=True)
    node = background("ros2 run weather_station dew_point")
    time.sleep(2)
    play = background(f"ros2 bag play {folder}")
    try:
        rows = ros_for("ros2 topic echo --csv /dew_point", 33)
    finally:
        stop(play)
        stop(node)
    # Temperature's CSV fields: stamp sec, stamp nanosec, frame_id, temperature, variance
    out = []
    for row in rows.splitlines():
        parts = row.split(",")
        if len(parts) == 5:
            out.append((int(parts[0]) + int(parts[1]) / 1e9, parts[2], float(parts[3])))
    c.check("it publishes on /dew_point", len(out) > 0, "Nothing arrived on /dew_point while the bag played.")
    c.check("it publishes at least one dew point per humidity reading", len(out) >= bag.SECONDS - 2, f"{len(out)} messages; the bag has {bag.SECONDS} humidity readings.")
    temps, hums = readings()
    temp_at = dict((round(s, 2), v) for s, v in temps)
    c.check(
        "each dew point carries the stamp and frame of a temperature reading",
        out and all(round(s, 2) in temp_at and frame == bag.FRAME for s, frame, _ in out),
        "Copy the temperature message's header into the dew point message." if out else "",
    )
    wrong = []
    for s, _, value in out:
        t = temp_at.get(round(s, 2))
        candidates = [magnus(t, h) for hs, h in hums if abs(hs - s) <= SLOP] if t is not None else []
        if not candidates or min(abs(value - x) for x in candidates) > TOLERANCE:
            wrong.append(f"at {s - bag.START:.2f} s: {value:.2f} °C")
    c.check(
        f"every dew point matches a temperature and a humidity reading less than {SLOP} s apart",
        out and not wrong,
        ("; ".join(wrong[:3]) + ". Check the formula and the pairing.") if wrong else "",
    )
else:
    for d in (
        "it publishes on /dew_point",
        "it publishes at least one dew point per humidity reading",
        "each dew point carries the stamp and frame of a temperature reading",
        f"every dew point matches a temperature and a humidity reading less than {SLOP} s apart",
    ):
        c.check(d, False, "Build the workspace first.")
sys.exit(c.finish())
