// Reference solution for the Lesson 11 lab. Try the lab before reading it.
//
// A pretend battery charger: the battery starts at 0.2 and charges by 0.01 every
// 0.1 s while a /charge goal runs, reporting the level as feedback. It stops at
// the goal's target, or where it is when the goal is cancelled.
#include <algorithm>
#include <atomic>
#include <memory>
#include <thread>

#include "charger_interfaces/action/charge.hpp"
#include "rclcpp/rclcpp.hpp"
#include "rclcpp_action/rclcpp_action.hpp"

using Charge = charger_interfaces::action::Charge;
using GoalHandle = rclcpp_action::ServerGoalHandle<Charge>;

class Charger : public rclcpp::Node
{
public:
  Charger()
  : Node("charger")
  {
    server_ = rclcpp_action::create_server<Charge>(
      this, "charge",
      [this](const rclcpp_action::GoalUUID &, std::shared_ptr<const Charge::Goal> goal) {
        if (busy_ || goal->target_level <= level_ || goal->target_level > 1.0) {
          RCLCPP_INFO(get_logger(), "rejected a target of %.2f at %.2f", goal->target_level, level_.load());
          return rclcpp_action::GoalResponse::REJECT;
        }
        busy_ = true;
        return rclcpp_action::GoalResponse::ACCEPT_AND_EXECUTE;
      },
      [](const std::shared_ptr<GoalHandle>) {return rclcpp_action::CancelResponse::ACCEPT;},
      [this](const std::shared_ptr<GoalHandle> handle) {std::thread{[this, handle] {charge(handle);}}.detach();});
  }

private:
  void charge(const std::shared_ptr<GoalHandle> handle)
  {
    const double target = handle->get_goal()->target_level;
    auto feedback = std::make_shared<Charge::Feedback>();
    auto result = std::make_shared<Charge::Result>();
    rclcpp::Rate rate(10);
    while (rclcpp::ok() && level_ < target) {
      if (handle->is_canceling()) {
        result->level = level_;
        handle->canceled(result);
        busy_ = false;
        return;
      }
      rate.sleep();
      level_ = std::min(target, level_ + 0.01);
      feedback->level = level_;
      handle->publish_feedback(feedback);
    }
    result->level = level_;
    handle->succeed(result);
    busy_ = false;
  }

  rclcpp_action::Server<Charge>::SharedPtr server_;
  std::atomic<double> level_{0.2};
  std::atomic<bool> busy_{false};
};

int main(int argc, char ** argv)
{
  rclcpp::init(argc, argv);
  rclcpp::spin(std::make_shared<Charger>());
  rclcpp::shutdown();
  return 0;
}
