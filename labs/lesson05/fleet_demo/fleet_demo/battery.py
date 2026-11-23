"""A pretend battery: publishes its voltage on battery_voltage (std_msgs/msg/Float32)
twice a second, draining slowly from full."""

import rclpy
from rclpy.executors import ExternalShutdownException
from rclpy.node import Node
from std_msgs.msg import Float32

FULL = 25.2
EMPTY = 21.0
DRAIN = 0.05  # volts per reading


class Battery(Node):
    def __init__(self):
        super().__init__("battery")
        self.publisher = self.create_publisher(Float32, "battery_voltage", 10)
        self.voltage = FULL
        self.create_timer(0.5, self.tick)

    def tick(self):
        self.publisher.publish(Float32(data=self.voltage))
        self.voltage = max(EMPTY, self.voltage - DRAIN)


def main():
    rclpy.init()
    node = Battery()
    try:
        rclpy.spin(node)
    except (KeyboardInterrupt, ExternalShutdownException):
        pass
    finally:
        node.destroy_node()
        rclpy.try_shutdown()
