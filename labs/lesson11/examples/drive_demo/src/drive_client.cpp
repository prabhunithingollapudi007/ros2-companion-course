// Lesson 11 example: sends one goal to drive_server, prints its feedback and its
// result, and exits.
//
//   drive_client DISTANCE SPEED [CANCEL_AFTER]
//
// With a third argument, it cancels the goal after that many seconds.
#include <chrono>
#include <memory>
#include <string>
#include <thread>

#include "drive_interfaces/action/drive_distance.hpp"
#include "rclcpp/rclcpp.hpp"
#include "rclcpp_action/rclcpp_action.hpp"

using namespace std::chrono_literals;
using DriveDistance = drive_interfaces::action::DriveDistance;
using GoalHandle = rclcpp_action::ClientGoalHandle<DriveDistance>;

int main(int argc, char ** argv)
{
  rclcpp::init(argc, argv);
  auto node = rclcpp::Node::make_shared("drive_client");
  auto client = rclcpp_action::create_client<DriveDistance>(node, "drive_distance");
  if (!client->wait_for_action_server(10s)) {
    RCLCPP_ERROR(node->get_logger(), "no action server");
    return 1;
  }

  DriveDistance::Goal goal;
  goal.distance = argc > 1 ? std::stod(argv[1]) : 1.0;
  goal.speed = argc > 2 ? std::stod(argv[2]) : 0.5;
  const double cancel_after = argc > 3 ? std::stod(argv[3]) : 0.0;

  rclcpp_action::Client<DriveDistance>::SendGoalOptions options;
  options.goal_response_callback = [node, client, cancel_after](const GoalHandle::SharedPtr & handle) {
      if (!handle) {
        RCLCPP_INFO(node->get_logger(), "goal rejected");
        rclcpp::shutdown();
        return;
      }
      RCLCPP_INFO(node->get_logger(), "goal accepted");
      if (cancel_after > 0.0) {
        std::thread{[client, handle, cancel_after] {
            std::this_thread::sleep_for(std::chrono::duration<double>(cancel_after));
            client->async_cancel_goal(handle);
          }}.detach();
      }
    };
  options.feedback_callback = [node](GoalHandle::SharedPtr, const std::shared_ptr<const DriveDistance::Feedback> feedback) {
      RCLCPP_INFO(node->get_logger(), "%.2f m to go", feedback->remaining);
    };
  options.result_callback = [node](const GoalHandle::WrappedResult & result) {
      const char * how = result.code == rclcpp_action::ResultCode::SUCCEEDED ? "succeeded" :
        result.code == rclcpp_action::ResultCode::CANCELED ? "canceled" : "aborted";
      RCLCPP_INFO(node->get_logger(), "%s: travelled %.2f m", how, result.result->travelled);
      rclcpp::shutdown();
    };
  client->async_send_goal(goal, options);

  rclcpp::spin(node);
  return 0;
}
