// Reference solution for the Lesson 10 lab. Try the lab before reading it.
//
// Passes velocity commands from /cmd_vel_in to /cmd_vel_out, with the forward
// speed limited to 1.0 m/s, or 0.3 m/s in careful mode. The service /set_mode
// switches between the two.
#include <algorithm>
#include <memory>
#include <string>

#include "geometry_msgs/msg/twist.hpp"
#include "rclcpp/rclcpp.hpp"
#include "speed_limiter_interfaces/srv/set_mode.hpp"

using geometry_msgs::msg::Twist;
using speed_limiter_interfaces::srv::SetMode;

class SpeedLimiter : public rclcpp::Node
{
public:
  SpeedLimiter()
  : Node("speed_limiter")
  {
    publisher_ = create_publisher<Twist>("cmd_vel_out", 10);
    subscription_ = create_subscription<Twist>(
      "cmd_vel_in", 10, [this](const Twist & in) {
        Twist out = in;
        out.linear.x = std::clamp(in.linear.x, -max_speed_, max_speed_);
        publisher_->publish(out);
      });
    service_ = create_service<SetMode>(
      "set_mode", [this](const SetMode::Request::SharedPtr request, SetMode::Response::SharedPtr response) {
        if (request->mode == "normal") {
          max_speed_ = 1.0;
        } else if (request->mode == "careful") {
          max_speed_ = 0.3;
        } else {
          response->success = false;
          response->message = "unknown mode '" + request->mode + "': use normal or careful";
          response->max_speed = max_speed_;
          return;
        }
        response->success = true;
        response->message = "mode " + request->mode;
        response->max_speed = max_speed_;
        RCLCPP_INFO(get_logger(), "%s, limit %.1f m/s", response->message.c_str(), max_speed_);
      });
  }

private:
  rclcpp::Publisher<Twist>::SharedPtr publisher_;
  rclcpp::Subscription<Twist>::SharedPtr subscription_;
  rclcpp::Service<SetMode>::SharedPtr service_;
  double max_speed_ = 1.0;
};

int main(int argc, char ** argv)
{
  rclcpp::init(argc, argv);
  rclcpp::spin(std::make_shared<SpeedLimiter>());
  rclcpp::shutdown();
  return 0;
}
