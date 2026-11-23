// Reference solution for the Lesson 17 capstone. Try it before reading this.
//
// An action server, /go_to, that drives the rover to a point in the odom frame:
// it turns to face the goal, drives towards it while steering, and stops within
// `tolerance` of it. Commands go out on cmd_vel_in, into the Lesson 13 stack
// (speed limiter, then watchdog); position comes from odom.
#include <algorithm>
#include <atomic>
#include <cmath>
#include <memory>
#include <mutex>
#include <thread>

#include "capstone_interfaces/action/go_to.hpp"
#include "geometry_msgs/msg/twist.hpp"
#include "nav_msgs/msg/odometry.hpp"
#include "rclcpp/rclcpp.hpp"
#include "rclcpp_action/rclcpp_action.hpp"

using GoTo = capstone_interfaces::action::GoTo;
using GoalHandle = rclcpp_action::ServerGoalHandle<GoTo>;
using geometry_msgs::msg::Twist;

class GoToServer : public rclcpp::Node
{
public:
  GoToServer()
  : Node("go_to")
  {
    max_speed_ = declare_parameter("max_speed", 0.5);
    max_turn_ = declare_parameter("max_turn", 1.0);
    tolerance_ = declare_parameter("tolerance", 0.1);

    cmd_ = create_publisher<Twist>("cmd_vel_in", 10);
    odom_ = create_subscription<nav_msgs::msg::Odometry>(
      "odom", 10, [this](const nav_msgs::msg::Odometry & msg) {
        std::lock_guard<std::mutex> lock(mutex_);
        const auto & q = msg.pose.pose.orientation;
        x_ = msg.pose.pose.position.x;
        y_ = msg.pose.pose.position.y;
        yaw_ = std::atan2(2.0 * (q.w * q.z + q.x * q.y), 1.0 - 2.0 * (q.y * q.y + q.z * q.z));
        have_odom_ = true;
      });
    server_ = rclcpp_action::create_server<GoTo>(
      this, "go_to",
      [this](const rclcpp_action::GoalUUID &, std::shared_ptr<const GoTo::Goal>) {
        if (busy_ || !have_odom_) {
          return rclcpp_action::GoalResponse::REJECT;
        }
        busy_ = true;
        return rclcpp_action::GoalResponse::ACCEPT_AND_EXECUTE;
      },
      [](const std::shared_ptr<GoalHandle>) {return rclcpp_action::CancelResponse::ACCEPT;},
      [this](const std::shared_ptr<GoalHandle> handle) {std::thread{[this, handle] {drive(handle);}}.detach();});
  }

private:
  void drive(const std::shared_ptr<GoalHandle> handle)
  {
    const auto goal = handle->get_goal();
    auto feedback = std::make_shared<GoTo::Feedback>();
    auto result = std::make_shared<GoTo::Result>();
    rclcpp::Rate rate(20);
    while (rclcpp::ok()) {
      double x, y, yaw;
      {
        std::lock_guard<std::mutex> lock(mutex_);
        x = x_;
        y = y_;
        yaw = yaw_;
      }
      const double distance = std::hypot(goal->x - x, goal->y - y);
      const double heading_error = std::remainder(std::atan2(goal->y - y, goal->x - x) - yaw, 2.0 * M_PI);
      result->distance_left = distance;

      if (handle->is_canceling()) {
        stop();
        result->reached = false;
        handle->canceled(result);
        busy_ = false;
        return;
      }
      if (distance < tolerance_) {
        stop();
        result->reached = true;
        handle->succeed(result);
        busy_ = false;
        return;
      }

      // Turn towards the goal; drive only when roughly facing it, slowing down near it.
      Twist cmd;
      cmd.angular.z = std::clamp(2.0 * heading_error, -max_turn_, max_turn_);
      if (std::abs(heading_error) < 0.3) {
        cmd.linear.x = std::min(max_speed_, 0.8 * distance);
      }
      cmd_->publish(cmd);

      feedback->distance_left = distance;
      feedback->heading_error = heading_error;
      handle->publish_feedback(feedback);
      rate.sleep();
    }
  }

  void stop() {cmd_->publish(Twist());}

  double max_speed_, max_turn_, tolerance_;
  std::mutex mutex_;
  double x_ = 0.0, y_ = 0.0, yaw_ = 0.0;
  std::atomic<bool> have_odom_{false}, busy_{false};
  rclcpp::Publisher<Twist>::SharedPtr cmd_;
  rclcpp::Subscription<nav_msgs::msg::Odometry>::SharedPtr odom_;
  rclcpp_action::Server<GoTo>::SharedPtr server_;
};

int main(int argc, char ** argv)
{
  rclcpp::init(argc, argv);
  rclcpp::spin(std::make_shared<GoToServer>());
  rclcpp::shutdown();
  return 0;
}
