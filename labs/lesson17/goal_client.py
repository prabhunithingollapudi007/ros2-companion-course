#!/usr/bin/env python3
"""Sends one goal to the capstone's /go_to action and prints, as JSON, what
happened. check.py uses it; you can too.

    python3 /labs/lesson17/goal_client.py X Y [CANCEL_AFTER]
"""

import json
import sys
import time

import rclpy
from action_msgs.msg import GoalStatus
from capstone_interfaces.action import GoTo
from rclpy.action import ActionClient
from rclpy.node import Node

ENDINGS = {GoalStatus.STATUS_SUCCEEDED: "succeeded", GoalStatus.STATUS_CANCELED: "canceled", GoalStatus.STATUS_ABORTED: "aborted"}


def main():
    x, y = float(sys.argv[1]), float(sys.argv[2])
    cancel_after = float(sys.argv[3]) if len(sys.argv) > 3 else 0.0
    rclpy.init()
    node = Node("capstone_goal_client")
    client = ActionClient(node, GoTo, "go_to")
    report = {"accepted": False, "status": None, "reached": None, "distance_left": None, "feedback": 0, "first": None, "last": None, "seconds": None}
    if not client.wait_for_server(timeout_sec=20):
        report["status"] = "no server"
        print(json.dumps(report))
        return

    def on_feedback(f):
        d = round(f.feedback.distance_left, 3)
        report["feedback"] += 1
        report["first"] = d if report["first"] is None else report["first"]
        report["last"] = d

    start = time.monotonic()
    sent = client.send_goal_async(GoTo.Goal(x=x, y=y), feedback_callback=on_feedback)
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
    done = handle.get_result_async()
    rclpy.spin_until_future_complete(node, done, timeout_sec=60)
    outcome = done.result()
    if outcome is not None:
        report["status"] = ENDINGS.get(outcome.status, str(outcome.status))
        report["reached"] = outcome.result.reached
        report["distance_left"] = round(outcome.result.distance_left, 3)
    report["seconds"] = round(time.monotonic() - start, 1)
    print(json.dumps(report))


if __name__ == "__main__":
    main()
