#!/usr/bin/env python3
"""Lesson 2 lab: the software of a small wheeled robot, running as a handful of nodes.

Run it in one terminal and work out what it does from another, using only the
`ros2` command. Reading this file first spoils the exercise.

    python3 /labs/lesson02/mystery_graph.py
"""

import math

import rclpy
from geometry_msgs.msg import Twist
from nav_msgs.msg import Odometry
from rclpy.executors import ExternalShutdownException, SingleThreadedExecutor
from rclpy.node import Node
from sensor_msgs.msg import BatteryState, JointState, LaserScan
from std_msgs.msg import Bool, Empty, String

CRUISE_SPEED = 0.25  # metres per second
CRUISE_TURN = 0.1  # radians per second
TOO_CLOSE = 0.5  # metres


class WheelEncoder(Node):
    """Reports how far each wheel has turned."""

    def __init__(self):
        super().__init__("wheel_encoder")
        self.publisher = self.create_publisher(JointState, "joint_states", 10)
        self.angle = 0.0
        self.create_timer(1 / 50, self.tick)

    def tick(self):
        self.angle += 0.05
        msg = JointState()
        msg.header.stamp = self.get_clock().now().to_msg()
        msg.name = ["left_wheel", "right_wheel"]
        msg.position = [self.angle, self.angle]
        self.publisher.publish(msg)


class Lidar(Node):
    """A very small laser scanner: eight beams across the front of the robot."""

    def __init__(self):
        super().__init__("lidar")
        self.publisher = self.create_publisher(LaserScan, "scan", 10)
        self.create_timer(1 / 10, self.tick)

    def tick(self):
        msg = LaserScan()
        msg.header.stamp = self.get_clock().now().to_msg()
        msg.header.frame_id = "lidar"
        msg.angle_min = -math.pi / 2
        msg.angle_max = math.pi / 2
        msg.angle_increment = math.pi / 7
        msg.range_min = 0.1
        msg.range_max = 10.0
        msg.ranges = [2.0] * 8
        self.publisher.publish(msg)


class OdometryEstimator(Node):
    """Turns wheel angles into an estimate of where the robot is."""

    def __init__(self):
        super().__init__("odometry")
        self.create_subscription(JointState, "joint_states", self.on_joints, 10)
        self.publisher = self.create_publisher(Odometry, "odom", 10)
        self.distance = 0.0
        self.create_timer(1 / 20, self.tick)

    def on_joints(self, msg):
        self.distance = 0.05 * msg.position[0]

    def tick(self):
        msg = Odometry()
        msg.header.stamp = self.get_clock().now().to_msg()
        msg.header.frame_id = "odom"
        msg.child_frame_id = "base"
        msg.pose.pose.position.x = self.distance
        msg.twist.twist.linear.x = CRUISE_SPEED
        self.publisher.publish(msg)


class ObstacleDetector(Node):
    """Says whether anything in the scan is too close."""

    def __init__(self):
        super().__init__("obstacle_detector")
        self.publisher = self.create_publisher(Bool, "obstacle", 10)
        self.create_subscription(LaserScan, "scan", self.on_scan, 10)

    def on_scan(self, msg):
        self.publisher.publish(Bool(data=min(msg.ranges) < TOO_CLOSE))


class Planner(Node):
    """Decides how fast to drive."""

    def __init__(self):
        super().__init__("planner")
        self.blocked = False
        self.motors_on = True
        self.create_subscription(Odometry, "odom", lambda msg: None, 10)
        self.create_subscription(Bool, "obstacle", self.on_obstacle, 10)
        self.create_subscription(String, "motor_state", self.on_motor_state, 10)
        self.publisher = self.create_publisher(Twist, "cmd_vel", 10)
        self.create_timer(1 / 5, self.tick)

    def on_obstacle(self, msg):
        self.blocked = msg.data

    def on_motor_state(self, msg):
        self.motors_on = msg.data == "running"

    def tick(self):
        msg = Twist()
        if self.motors_on and not self.blocked:
            msg.linear.x = CRUISE_SPEED
            msg.angular.z = CRUISE_TURN
        self.publisher.publish(msg)


class SafetyStop(Node):
    """Overrides the planner with a stop command when something is too close."""

    def __init__(self):
        super().__init__("safety_stop")
        self.publisher = self.create_publisher(Twist, "cmd_vel", 10)
        self.create_subscription(Bool, "obstacle", self.on_obstacle, 10)

    def on_obstacle(self, msg):
        if msg.data:
            self.publisher.publish(Twist())


class MotorDriver(Node):
    """Would send the commanded speed to the motors. Here it only reports its state."""

    def __init__(self):
        super().__init__("motor_driver")
        self.stopped = False
        self.create_subscription(Twist, "cmd_vel", lambda msg: None, 10)
        self.create_subscription(Empty, "emergency_stop", self.on_emergency_stop, 10)
        self.state = self.create_publisher(String, "motor_state", 10)
        self.battery = self.create_publisher(BatteryState, "battery", 10)
        self.create_timer(1 / 2, self.report_state)
        self.create_timer(1.0, self.report_battery)

    def on_emergency_stop(self, _msg):
        if not self.stopped:
            self.get_logger().warn("Emergency stop received: motors are off.")
        self.stopped = True

    def report_state(self):
        self.state.publish(String(data="stopped" if self.stopped else "running"))

    def report_battery(self):
        msg = BatteryState()
        msg.header.stamp = self.get_clock().now().to_msg()
        msg.voltage = 24.1
        msg.percentage = 0.87
        msg.present = True
        self.battery.publish(msg)


def main():
    rclpy.init()
    executor = SingleThreadedExecutor()
    nodes = [WheelEncoder(), Lidar(), OdometryEstimator(), ObstacleDetector(), Planner(), SafetyStop(), MotorDriver()]
    for node in nodes:
        executor.add_node(node)
    print("The robot's software is running.", flush=True)
    print("Leave this terminal alone and explore from the other one. Press Ctrl+C here to stop it.", flush=True)
    try:
        executor.spin()
    except (KeyboardInterrupt, ExternalShutdownException):
        pass
    finally:
        for node in nodes:
            node.destroy_node()
        rclpy.try_shutdown()


if __name__ == "__main__":
    main()
