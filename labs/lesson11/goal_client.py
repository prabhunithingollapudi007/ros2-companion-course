#!/usr/bin/env python3
"""Sends one goal to the Lesson 11 lab's /charge action and prints, as JSON, what
happened: whether it was accepted, every feedback level, how it ended and the
result. check.py uses it; you can too.

    python3 /labs/lesson11/goal_client.py TARGET [CANCEL_AFTER]
"""

import json
import sys
import time

import rclpy
from action_msgs.msg import GoalStatus
from charger_interfaces.action import Charge
from rclpy.action import ActionClient
from rclpy.node import Node

ENDINGS = {GoalStatus.STATUS_SUCCEEDED: "succeeded", GoalStatus.STATUS_CANCELED: "canceled", GoalStatus.STATUS_ABORTED: "aborted"}


def main():
    target = float(sys.argv[1])
    cancel_after = float(sys.argv[2]) if len(sys.argv) > 2 else 0.0
    rclpy.init()
    node = Node("goal_client")
    client = ActionClient(node, Charge, "charge")
    report = {"accepted": False, "feedback": [], "status": None, "level": None, "seconds": None}
    if not client.wait_for_server(timeout_sec=10):
        report["status"] = "no server"
        print(json.dumps(report))
        return

    start = time.monotonic()
    goal = Charge.Goal(target_level=target)
    sent = client.send_goal_async(goal, feedback_callback=lambda f: report["feedback"].append(f.feedback.level))
    rclpy.spin_until_future_complete(node, sent, timeout_sec=10)
    handle = sent.result()
    if handle is None or not handle.accepted:
        print(json.dumps(report))
        return
    report["accepted"] = True

    if cancel_after > 0:
        end = time.monotonic() + cancel_after
        while time.monotonic() < end:
            rclpy.spin_once(node, timeout_sec=0.05)
        rclpy.spin_until_future_complete(node, handle.cancel_goal_async(), timeout_sec=10)

    finished = handle.get_result_async()
    rclpy.spin_until_future_complete(node, finished, timeout_sec=30)
    outcome = finished.result()
    if outcome is not None:
        report["status"] = ENDINGS.get(outcome.status, str(outcome.status))
        report["level"] = outcome.result.level
    report["seconds"] = round(time.monotonic() - start, 2)
    print(json.dumps(report))


if __name__ == "__main__":
    main()
