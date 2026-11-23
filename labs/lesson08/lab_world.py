#!/usr/bin/env python3
"""The world for the Lesson 8 lab.

A robot drives round a circle while its camera reports where it sees an object.
The object stands still at (2.0, 1.0, 0.0) in the map frame, but the camera
reports it in its own frame, which moves with the robot. Each report is stamped
with the moment the camera saw the object and arrives 0.3 s later, as a real
detector's results would.

    python3 /labs/lesson08/lab_world.py

Frames: map -> odom (fixed), odom -> base_link (moving, 50 times a second),
base_link -> camera (fixed). Topic: /detections, geometry_msgs/msg/PointStamped,
in the camera frame, twice a second.
"""

import math
from collections import deque

import rclpy
from geometry_msgs.msg import PointStamped, TransformStamped
from rclpy.executors import ExternalShutdownException
from rclpy.node import Node
from rclpy.time import Time
from tf2_ros import StaticTransformBroadcaster, TransformBroadcaster

OBJECT = (2.0, 1.0, 0.0)
MAP_TO_ODOM = (0.5, -0.2, 0.3)  # x, y, yaw
CAMERA = (0.15, 0.0, 0.07)  # in base_link
RADIUS, TURN_RATE = 1.0, 0.5  # the circle: metres, radians per second
DELAY = 0.3  # seconds between seeing the object and reporting it


def transform(stamp, parent, child, x, y, z, yaw):
    t = TransformStamped()
    t.header.stamp = stamp
    t.header.frame_id = parent
    t.child_frame_id = child
    t.transform.translation.x, t.transform.translation.y, t.transform.translation.z = x, y, z
    t.transform.rotation.z, t.transform.rotation.w = math.sin(yaw / 2), math.cos(yaw / 2)
    return t


def robot_in_odom(seconds):
    heading = TURN_RATE * seconds
    return RADIUS * math.sin(heading), RADIUS * (1 - math.cos(heading)), heading


def camera_in_map(seconds):
    """The camera's position and heading in the map frame, composing the three transforms by hand."""
    bx, by, byaw = robot_in_odom(seconds)
    cx = bx + math.cos(byaw) * CAMERA[0] - math.sin(byaw) * CAMERA[1]
    cy = by + math.sin(byaw) * CAMERA[0] + math.cos(byaw) * CAMERA[1]
    mx, my, myaw = MAP_TO_ODOM
    return (
        mx + math.cos(myaw) * cx - math.sin(myaw) * cy,
        my + math.sin(myaw) * cx + math.cos(myaw) * cy,
        CAMERA[2],
        myaw + byaw,
    )


class LabWorld(Node):
    def __init__(self):
        super().__init__("lab_world")
        self.start = self.get_clock().now()
        self.static = StaticTransformBroadcaster(self)
        now = self.start.to_msg()
        self.static.sendTransform(
            [transform(now, "map", "odom", MAP_TO_ODOM[0], MAP_TO_ODOM[1], 0.0, MAP_TO_ODOM[2]), transform(now, "base_link", "camera", *CAMERA, 0.0)]
        )
        self.moving = TransformBroadcaster(self)
        self.detections = self.create_publisher(PointStamped, "detections", 10)
        self.waiting = deque()  # reports seen but not yet sent: (send at, message)
        self.create_timer(0.02, self.drive)
        self.create_timer(0.5, self.see)
        self.create_timer(0.01, self.report)

    def seconds(self, t: Time):
        return (t - self.start).nanoseconds / 1e9

    def drive(self):
        now = self.get_clock().now()
        x, y, yaw = robot_in_odom(self.seconds(now))
        self.moving.sendTransform(transform(now.to_msg(), "odom", "base_link", x, y, 0.0, yaw))

    def see(self):
        now = self.get_clock().now()
        cx, cy, cz, cyaw = camera_in_map(self.seconds(now))
        dx, dy = OBJECT[0] - cx, OBJECT[1] - cy
        seen = PointStamped()
        seen.header.stamp = now.to_msg()
        seen.header.frame_id = "camera"
        seen.point.x = math.cos(cyaw) * dx + math.sin(cyaw) * dy
        seen.point.y = -math.sin(cyaw) * dx + math.cos(cyaw) * dy
        seen.point.z = OBJECT[2] - cz
        self.waiting.append((now.nanoseconds + int(DELAY * 1e9), seen))

    def report(self):
        now = self.get_clock().now().nanoseconds
        while self.waiting and self.waiting[0][0] <= now:
            self.detections.publish(self.waiting.popleft()[1])


def main():
    rclpy.init()
    try:
        rclpy.spin(LabWorld())
    except (KeyboardInterrupt, ExternalShutdownException):
        pass


if __name__ == "__main__":
    main()
