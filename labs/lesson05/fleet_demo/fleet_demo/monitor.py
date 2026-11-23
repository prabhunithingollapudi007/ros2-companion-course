"""Turns battery_voltage into battery_status: the charge in percent (std_msgs/msg/Float32)."""

import rclpy
from rclpy.executors import ExternalShutdownException
from rclpy.node import Node
from std_msgs.msg import Float32

FULL = 25.2
EMPTY = 21.0


class Monitor(Node):
    def __init__(self):
        super().__init__("monitor")
        self.publisher = self.create_publisher(Float32, "battery_status", 10)
        self.create_subscription(Float32, "battery_voltage", self.on_voltage, 10)

    def on_voltage(self, msg):
        percent = min(max((msg.data - EMPTY) / (FULL - EMPTY) * 100.0, 0.0), 100.0)
        self.publisher.publish(Float32(data=percent))


def main():
    rclpy.init()
    node = Monitor()
    try:
        rclpy.spin(node)
    except (KeyboardInterrupt, ExternalShutdownException):
        pass
    finally:
        node.destroy_node()
        rclpy.try_shutdown()
