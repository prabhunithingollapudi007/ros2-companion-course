// Reference solution for the Lesson 13 lab. Try the lab before reading it.
//
// Passes velocity commands from cmd_vel_in to cmd_vel_out. If no command has
// arrived for `timeout` seconds, it publishes a stop (an all-zero Twist) ten
// times a second until commands come again.
#include <chrono>
#include <memory>

#include "geometry_msgs/msg/twist.hpp"
#include "rclcpp/rclcpp.hpp"

using namespace std::chrono_literals;
using geometry_msgs::msg::Twist;

class CmdWatchdog : public rclcpp::Node
{
public:
  CmdWatchdog()
  : Node("cmd_watchdog"), last_(now())
  {
    rcl_interfaces::msg::ParameterDescriptor info;
    info.description = "seconds without a command before stopping the robot";
    timeout_ = declare_parameter("timeout", 0.5, info);
    publisher_ = create_publisher<Twist>("cmd_vel_out", 10);
    subscription_ = create_subscription<Twist>(
      "cmd_vel_in", 10, [this](const Twist & in) {
        last_ = now();
        publisher_->publish(in);
      });
    timer_ = create_wall_timer(100ms, [this] {
          if ((now() - last_).seconds() > timeout_) {
            publisher_->publish(Twist());
          }
        });
  }

private:
  double timeout_;
  rclcpp::Time last_;
  rclcpp::Publisher<Twist>::SharedPtr publisher_;
  rclcpp::Subscription<Twist>::SharedPtr subscription_;
  rclcpp::TimerBase::SharedPtr timer_;
};

int main(int argc, char ** argv)
{
  rclcpp::init(argc, argv);
  rclcpp::spin(std::make_shared<CmdWatchdog>());
  rclcpp::shutdown();
  return 0;
}
