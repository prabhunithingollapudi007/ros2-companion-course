#!/usr/bin/env python3
"""The Lesson 15 lab's charge estimator: offers /estimate_charge, which turns a
battery voltage into a fraction full, taking 0.2 s to think about it.

    python3 /labs/lesson15/estimator.py

It needs battery_interfaces built in the workspace, with install/setup.bash sourced.
3.3 V is empty and 4.2 V is full, in a straight line between.
"""

import time

import rclpy
from battery_interfaces.srv import EstimateCharge
from rclpy.executors import ExternalShutdownException
from rclpy.node import Node

EMPTY, FULL = 3.3, 4.2


def estimate(voltage):
    return min(1.0, max(0.0, (voltage - EMPTY) / (FULL - EMPTY)))


class Estimator(Node):
    def __init__(self):
        super().__init__("estimator")
        self.create_service(EstimateCharge, "estimate_charge", self.answer)

    def answer(self, request, response):
        time.sleep(0.2)
        response.charge = estimate(request.voltage)
        return response


def main():
    rclpy.init()
    try:
        rclpy.spin(Estimator())
    except (KeyboardInterrupt, ExternalShutdownException):
        pass


if __name__ == "__main__":
    main()
