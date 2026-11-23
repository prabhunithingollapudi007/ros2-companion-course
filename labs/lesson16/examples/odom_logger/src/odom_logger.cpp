// Lesson 16: the ROS 1 node in labs/lesson16/ros1/odom_logger, ported to ROS 2.
//
// Logs how far the robot has driven, from its odometry, every `period` seconds.
#include <chrono>
#include <cmath>
#include <memory>

#include "nav_msgs/msg/odometry.hpp"
#include "rclcpp/rclcpp.hpp"
#include "std_msgs/msg/float64.hpp"

class OdomLogger : public rclcpp::Node
{
public:
  OdomLogger()
  : Node("odom_logger")
  {
    period_ = declare_parameter("period", 1.0);
    sub_ = create_subscription<nav_msgs::msg::Odometry>(
      "odom", 10, [this](const nav_msgs::msg::Odometry & msg) {odomCallback(msg);});
    pub_ = create_publisher<std_msgs::msg::Float64>("distance", 10);
    timer_ = create_wall_timer(std::chrono::duration<double>(period_), [this] {report();});
  }

private:
  void odomCallback(const nav_msgs::msg::Odometry & msg)
  {
    const double x = msg.pose.pose.position.x, y = msg.pose.pose.position.y;
    if (have_last_) {
      distance_ += std::hypot(x - last_x_, y - last_y_);
    }
    last_x_ = x;
    last_y_ = y;
    have_last_ = true;
  }

  void report()
  {
    std_msgs::msg::Float64 out;
    out.data = distance_;
    pub_->publish(out);
    RCLCPP_INFO(get_logger(), "driven %.2f m", distance_);
  }

  double period_;
  double distance_ = 0.0, last_x_ = 0.0, last_y_ = 0.0;
  bool have_last_ = false;
  rclcpp::Subscription<nav_msgs::msg::Odometry>::SharedPtr sub_;
  rclcpp::Publisher<std_msgs::msg::Float64>::SharedPtr pub_;
  rclcpp::TimerBase::SharedPtr timer_;
};

int main(int argc, char ** argv)
{
  rclcpp::init(argc, argv);
  rclcpp::spin(std::make_shared<OdomLogger>());
  rclcpp::shutdown();
  return 0;
}
