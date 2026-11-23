// Reference solution for the Lesson 16 lab. Try the lab before reading it.
//
// The ROS 1 heartbeat, ported. The while loop with ros::Rate and spinOnce becomes
// a timer and an executor: the node's callbacks are all the executor runs.
#include <chrono>
#include <memory>
#include <string>

#include "rclcpp/rclcpp.hpp"
#include "std_msgs/msg/bool.hpp"
#include "std_msgs/msg/string.hpp"

class Heartbeat : public rclcpp::Node
{
public:
  Heartbeat()
  : Node("heartbeat")
  {
    const double rate = declare_parameter("rate", 2.0);
    pub_ = create_publisher<std_msgs::msg::String>("heartbeat", 10);
    sub_ = create_subscription<std_msgs::msg::Bool>(
      "heartbeat_cmd", 10, [this](const std_msgs::msg::Bool & cmd) {
        running_ = cmd.data;
        RCLCPP_INFO(get_logger(), "%s", running_ ? "resumed" : "paused");
      });
    timer_ = create_wall_timer(std::chrono::duration<double>(1.0 / rate), [this] {
          if (running_) {
            std_msgs::msg::String msg;
            msg.data = "alive " + std::to_string(++count_);
            pub_->publish(msg);
          }
        });
  }

private:
  bool running_ = true;
  int count_ = 0;
  rclcpp::Publisher<std_msgs::msg::String>::SharedPtr pub_;
  rclcpp::Subscription<std_msgs::msg::Bool>::SharedPtr sub_;
  rclcpp::TimerBase::SharedPtr timer_;
};

int main(int argc, char ** argv)
{
  rclcpp::init(argc, argv);
  rclcpp::spin(std::make_shared<Heartbeat>());
  rclcpp::shutdown();
  return 0;
}
