#!/usr/bin/env python3
"""Writes the bag the Lesson 6 lab uses: 30 seconds of a weather station.

    python3 /labs/lesson06/make_weather_bag.py /labs/ws/weather

/temperature  sensor_msgs/msg/Temperature       4 times a second, degrees Celsius
/humidity     sensor_msgs/msg/RelativeHumidity  once a second, as a fraction (0.55 is 55 %)

Every message has a header stamp from the station's own clock, which starts at
START below, so it is easy to tell recorded times from the time now. The two
sensors are read at different moments, so no two stamps are equal.
"""

import math
import sys

import rosbag2_py
from builtin_interfaces.msg import Time
from rclpy.serialization import serialize_message
from sensor_msgs.msg import RelativeHumidity, Temperature

START = 1_780_000_000  # seconds since 1970: 28 May 2026, 20:26:40 UTC
SECONDS = 30
FRAME = "weather_station"


def stamp(t):
    whole = math.floor(t)
    return Time(sec=whole, nanosec=round((t - whole) * 1e9))


def temperature(t):
    return round(18.0 + 4.0 * math.sin(2 * math.pi * t / 60), 3)


def humidity(t):
    return round(0.55 + 0.10 * math.sin(2 * math.pi * t / 45), 4)


def main(path):
    writer = rosbag2_py.SequentialWriter()
    writer.open(rosbag2_py.StorageOptions(uri=path, storage_id="mcap"), rosbag2_py.ConverterOptions("", ""))
    writer.create_topic(rosbag2_py.TopicMetadata(0, "/temperature", "sensor_msgs/msg/Temperature", "cdr"))
    writer.create_topic(rosbag2_py.TopicMetadata(1, "/humidity", "sensor_msgs/msg/RelativeHumidity", "cdr"))

    events = []
    for k in range(SECONDS * 4):
        t = 0.25 * k + 0.03
        msg = Temperature(temperature=temperature(t), variance=0.0)
        events.append((t, "/temperature", msg))
    for k in range(SECONDS):
        t = 1.0 * k + 0.11
        msg = RelativeHumidity(relative_humidity=humidity(t), variance=0.0)
        events.append((t, "/humidity", msg))

    for t, topic, msg in sorted(events, key=lambda e: e[0]):
        msg.header.stamp = stamp(START + t)
        msg.header.frame_id = FRAME
        # Recorded 5 ms after it was measured, as a real recorder would.
        writer.write(topic, serialize_message(msg), round((START + t + 0.005) * 1e9))
    del writer
    print(f"Wrote {path}: {SECONDS * 4} temperature and {SECONDS} humidity readings over {SECONDS} s.")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "/labs/ws/weather")
