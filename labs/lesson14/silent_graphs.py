#!/usr/bin/env python3
"""The Lesson 14 lab: three small graphs in which a message never arrives.

    python3 /labs/lesson14/silent_graphs.py GRAPH [--seconds N] [--ros-args --params-file FILE]

GRAPH is one of:
  lidar  fake_lidar publishes /scan; obstacle_watch should hear it.
  map    map_server_lite publishes the map once, at start; planner, which
         starts two seconds later, should still get it.
  odom   odometer, in the namespace /robot1, publishes its odometry;
         dashboard should hear it.

Each listening node says at the end how many messages it got. Do not change
this file: fix each graph with parameters, in a params file keyed by node name.
The parameters each node has are in its constructor below.
"""

import argparse
import sys
import time

import rclpy
from nav_msgs.msg import Odometry
from rclpy.executors import SingleThreadedExecutor
from rclpy.node import Node
from rclpy.qos import DurabilityPolicy, QoSProfile, ReliabilityPolicy
from sensor_msgs.msg import LaserScan
from std_msgs.msg import String

RELIABILITY = {"reliable": ReliabilityPolicy.RELIABLE, "best_effort": ReliabilityPolicy.BEST_EFFORT}
DURABILITY = {"volatile": DurabilityPolicy.VOLATILE, "transient_local": DurabilityPolicy.TRANSIENT_LOCAL}


class Listener(Node):
    """A node that counts what it receives."""

    def __init__(self, name, **kwargs):
        super().__init__(name, **kwargs)
        self.received = 0

    def got(self, _msg):
        self.received += 1

    def report(self, what):
        print(f"{self.get_name()}: received {self.received} {what}", flush=True)


# ---------- lidar ----------


class FakeLidar(Node):
    def __init__(self):
        super().__init__("fake_lidar")
        # Like most sensor drivers: best effort, because a late scan is worth less than the next one. Not a parameter.
        qos = QoSProfile(depth=5, reliability=ReliabilityPolicy.BEST_EFFORT)
        self.pub = self.create_publisher(LaserScan, "scan", qos)
        self.create_timer(0.1, self.tick)

    def tick(self):
        scan = LaserScan()
        scan.header.frame_id = "lidar"
        scan.header.stamp = self.get_clock().now().to_msg()
        scan.ranges = [2.0] * 36
        self.pub.publish(scan)


class ObstacleWatch(Listener):
    def __init__(self):
        super().__init__("obstacle_watch")
        reliability = self.declare_parameter("scan_reliability", "reliable").value
        qos = QoSProfile(depth=5, reliability=RELIABILITY[reliability])
        self.create_subscription(LaserScan, "scan", self.got, qos)


# ---------- map ----------


class MapServerLite(Node):
    def __init__(self):
        super().__init__("map_server_lite")
        durability = self.declare_parameter("map_durability", "volatile").value
        qos = QoSProfile(depth=1, reliability=ReliabilityPolicy.RELIABLE, durability=DURABILITY[durability])
        self.pub = self.create_publisher(String, "map", qos)
        self.pub.publish(String(data="map version 1"))  # once, at start, like a map that does not change


class Planner(Listener):
    def __init__(self):
        super().__init__("planner")
        # A late joiner that needs the map: it asks for transient_local. Not a parameter.
        qos = QoSProfile(depth=1, reliability=ReliabilityPolicy.RELIABLE, durability=DurabilityPolicy.TRANSIENT_LOCAL)
        self.create_subscription(String, "map", self.got, qos)


# ---------- odom ----------


class Odometer(Node):
    def __init__(self):
        super().__init__("odometer", namespace="robot1")
        self.pub = self.create_publisher(Odometry, "odom", 10)
        self.create_timer(0.1, lambda: self.pub.publish(Odometry()))


class Dashboard(Listener):
    def __init__(self):
        super().__init__("dashboard")
        topic = self.declare_parameter("odom_topic", "/odom").value
        self.create_subscription(Odometry, topic, self.got, 10)


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("graph", choices=["lidar", "map", "odom"])
    parser.add_argument("--seconds", type=float, default=5.0, help="how long to run (default 5)")
    args, ros_args = parser.parse_known_args()
    rclpy.init(args=[sys.argv[0], *ros_args])

    executor = SingleThreadedExecutor()
    if args.graph == "lidar":
        listener, what = ObstacleWatch(), "scans"
        nodes = [FakeLidar(), listener]
    elif args.graph == "map":
        server = MapServerLite()
        executor.add_node(server)
        executor.spin_once(timeout_sec=0.1)
        time.sleep(2.0)  # the planner starts later
        listener, what = Planner(), "map messages"
        nodes = [listener]
    else:
        listener, what = Dashboard(), "odometry messages"
        nodes = [Odometer(), listener]
    for node in nodes:
        executor.add_node(node)

    end = time.monotonic() + args.seconds
    while time.monotonic() < end:
        executor.spin_once(timeout_sec=0.1)
    listener.report(what)
    rclpy.shutdown()


if __name__ == "__main__":
    main()
