#!/usr/bin/env python3
"""Lesson 6: prints the time this node's clock says, once a second.

    python3 /labs/lesson06/examples/what_time.py
    python3 /labs/lesson06/examples/what_time.py --ros-args -p use_sim_time:=true
"""

from datetime import datetime, timezone

import rclpy
from rclpy.executors import ExternalShutdownException
from rclpy.node import Node


class WhatTime(Node):
    def __init__(self):
        super().__init__("what_time")
        self.create_timer(1.0, self.tick)

    def tick(self):
        now = self.get_clock().now()
        seconds = now.nanoseconds / 1e9
        when = datetime.fromtimestamp(seconds, timezone.utc).strftime("%Y-%m-%d %H:%M:%S")
        self.get_logger().info(f"my clock says {seconds:.2f} s, that is {when} UTC")


def main():
    rclpy.init()
    node = WhatTime()
    try:
        rclpy.spin(node)
    except (KeyboardInterrupt, ExternalShutdownException):
        pass
    finally:
        node.destroy_node()
        rclpy.try_shutdown()


if __name__ == "__main__":
    main()
