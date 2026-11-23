#!/usr/bin/env python3
"""Lesson 4 lab: a pretend battery.

Publishes its voltage on /battery_voltage (std_msgs/msg/Float32) twice a
second, going through the same readings over and over, from full to empty.

    python3 /labs/lesson04/battery_sim.py
"""

import rclpy
from rclpy.executors import ExternalShutdownException
from rclpy.node import Node
from std_msgs.msg import Float32

VOLTAGES = [25.2, 24.3, 23.1, 22.4, 21.6, 21.0, 20.6]


class BatterySim(Node):
    def __init__(self):
        super().__init__("battery_sim")
        self.publisher = self.create_publisher(Float32, "battery_voltage", 10)
        self.index = 0
        self.create_timer(0.5, self.tick)

    def tick(self):
        voltage = VOLTAGES[self.index % len(VOLTAGES)]
        self.index += 1
        self.publisher.publish(Float32(data=voltage))
        self.get_logger().info(f"Battery at {voltage:.1f} V")


def main():
    rclpy.init()
    node = BatterySim()
    try:
        rclpy.spin(node)
    except (KeyboardInterrupt, ExternalShutdownException):
        pass
    finally:
        node.destroy_node()
        rclpy.try_shutdown()


if __name__ == "__main__":
    main()
