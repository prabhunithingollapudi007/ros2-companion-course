// Lesson 11 example: an action server that pretends to drive a robot straight for
// a distance, reporting the distance left ten times a second. It takes one goal
// at a time, and stops early if the goal is cancelled.
#include <algorithm>
#include <atomic>
#include <chrono>
#include <memory>
#include <thread>

#include "drive_interfaces/action/drive_distance.hpp"
#include "rclcpp/rclcpp.hpp"
#include "rclcpp_action/rclcpp_action.hpp"

using namespace std::chrono_literals;
using DriveDistance = drive_interfaces::action::DriveDistance;
using GoalHandle = rclcpp_action::ServerGoalHandle<DriveDistance>;

class DriveServer : public rclcpp::Node
{
public:
  DriveServer()
  : Node("drive_server")
  {
    // Three callbacks: should this goal be accepted? may it be cancelled? and, once accepted, do the work.
    server_ = rclcpp_action::create_server<DriveDistance>(
      this, "drive_distance",
      [this](const rclcpp_action::GoalUUID &, std::shared_ptr<const DriveDistance::Goal> goal) {
        if (goal->distance <= 0.0 || goal->speed <= 0.0) {
          RCLCPP_INFO(get_logger(), "rejected: distance and speed must be more than 0");
          return rclcpp_action::GoalResponse::REJECT;
        }
        if (busy_) {
          RCLCPP_INFO(get_logger(), "rejected: already driving");
          return rclcpp_action::GoalResponse::REJECT;
        }
        RCLCPP_INFO(get_logger(), "accepted: %.1f m at %.1f m/s", goal->distance, goal->speed);
        busy_ = true;
        return rclcpp_action::GoalResponse::ACCEPT_AND_EXECUTE;
      },
      [this](const std::shared_ptr<GoalHandle>) {
        RCLCPP_INFO(get_logger(), "cancel requested");
        return rclcpp_action::CancelResponse::ACCEPT;
      },
      [this](const std::shared_ptr<GoalHandle> handle) {
        // The work takes seconds, so it runs on a thread of its own and the node stays free to answer.
        std::thread{[this, handle] {execute(handle);}}.detach();
      });
  }

private:
  void execute(const std::shared_ptr<GoalHandle> handle)
  {
    const auto goal = handle->get_goal();
    auto feedback = std::make_shared<DriveDistance::Feedback>();
    auto result = std::make_shared<DriveDistance::Result>();
    rclcpp::Rate rate(10);
    double travelled = 0.0;
    while (rclcpp::ok() && travelled < goal->distance) {
      if (handle->is_canceling()) {
        result->travelled = travelled;
        handle->canceled(result);
        RCLCPP_INFO(get_logger(), "cancelled after %.2f m", travelled);
        busy_ = false;
        return;
      }
      travelled = std::min(goal->distance, travelled + goal->speed * 0.1);
      feedback->remaining = goal->distance - travelled;
      handle->publish_feedback(feedback);
      rate.sleep();
    }
    result->travelled = travelled;
    handle->succeed(result);
    RCLCPP_INFO(get_logger(), "arrived after %.2f m", travelled);
    busy_ = false;
  }

  rclcpp_action::Server<DriveDistance>::SharedPtr server_;
  std::atomic<bool> busy_{false};
};

int main(int argc, char ** argv)
{
  rclcpp::init(argc, argv);
  rclcpp::spin(std::make_shared<DriveServer>());
  rclcpp::shutdown();
  return 0;
}
