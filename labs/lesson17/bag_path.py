#!/usr/bin/env python3
"""Prints the path the rover drove, from the /odom messages in a bag: time,
x and y, one line every half second of simulated time, and the last one.

    python3 /labs/lesson17/bag_path.py /labs/ws/capstone_run
"""

import sys

import rosbag2_py
from nav_msgs.msg import Odometry
from rclpy.serialization import deserialize_message


def main():
    reader = rosbag2_py.SequentialReader()
    reader.open(rosbag2_py.StorageOptions(uri=sys.argv[1], storage_id="mcap"), rosbag2_py.ConverterOptions("", ""))
    reader.set_filter(rosbag2_py.StorageFilter(topics=["/odom"]))
    start = None
    next_at = 0.0
    last = None  # the latest line not yet printed
    while reader.has_next():
        _, data, _ = reader.read_next()
        msg = deserialize_message(data, Odometry)
        t = msg.header.stamp.sec + msg.header.stamp.nanosec / 1e9
        start = t if start is None else start
        p = msg.pose.pose.position
        line = f"{t - start:.1f} {p.x:.2f} {p.y:.2f}"
        if t - start >= next_at - 1e-6:
            print(line)
            next_at += 0.5
            last = None
        else:
            last = line
    if last:
        print(last)  # where it ended


if __name__ == "__main__":
    main()
