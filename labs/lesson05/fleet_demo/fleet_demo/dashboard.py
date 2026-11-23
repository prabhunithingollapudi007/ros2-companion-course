"""Shows the charge of two robots. It listens on robot_a/status and robot_b/status
(std_msgs/msg/Float32, percent), and every two seconds logs what it last heard."""

import rclpy
from rclpy.executors import ExternalShutdownException
from rclpy.node import Node
from std_msgs.msg import Float32


class Dashboard(Node):
    def __init__(self):
        super().__init__("dashboard")
        self.latest = {"robot_a": None, "robot_b": None}
        for robot in self.latest:
            self.create_subscription(Float32, f"{robot}/status", lambda msg, r=robot: self.latest.__setitem__(r, msg.data), 10)
        self.create_timer(2.0, self.report)

    def report(self):
        parts = [f"{robot}: {'no data' if value is None else f'{value:.1f} %'}" for robot, value in self.latest.items()]
        self.get_logger().info(" | ".join(parts))


def main():
    rclpy.init()
    node = Dashboard()
    try:
        rclpy.spin(node)
    except (KeyboardInterrupt, ExternalShutdownException):
        pass
    finally:
        node.destroy_node()
        rclpy.try_shutdown()
