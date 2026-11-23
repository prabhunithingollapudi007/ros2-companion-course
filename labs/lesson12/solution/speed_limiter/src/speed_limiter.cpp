// Reference solution for the Lesson 12 lab. Try the lab before reading it.
//
// The Lesson 10 speed limiter, with its two limits as parameters: normal_speed
// (0.1 to 2.0 m/s) and careful_speed (0.05 to 1.0 m/s), which may not be more
// than normal_speed. /set_mode switches between them as before.
#include <algorithm>
#include <memory>
#include <string>
#include <vector>

#include "geometry_msgs/msg/twist.hpp"
#include "rclcpp/rclcpp.hpp"
#include "speed_limiter_interfaces/srv/set_mode.hpp"

using geometry_msgs::msg::Twist;
using speed_limiter_interfaces::srv::SetMode;

rcl_interfaces::msg::ParameterDescriptor speed(const std::string & what, double low, double high)
{
  rcl_interfaces::msg::ParameterDescriptor d;
  d.description = what;
  d.floating_point_range.resize(1);
  d.floating_point_range[0].from_value = low;
  d.floating_point_range[0].to_value = high;
  return d;
}

class SpeedLimiter : public rclcpp::Node
{
public:
  SpeedLimiter()
  : Node("speed_limiter")
  {
    normal_ = declare_parameter("normal_speed", 1.0, speed("limit in normal mode, m/s", 0.1, 2.0));
    careful_ = declare_parameter("careful_speed", 0.3, speed("limit in careful mode, m/s", 0.05, 1.0));

    check_ = add_on_set_parameters_callback(
      [this](const std::vector<rclcpp::Parameter> & changes) {
        double normal = normal_, careful = careful_;
        for (const auto & p : changes) {
          if (p.get_name() == "normal_speed") {normal = p.as_double();}
          if (p.get_name() == "careful_speed") {careful = p.as_double();}
        }
        rcl_interfaces::msg::SetParametersResult result;
        result.successful = careful <= normal;
        if (!result.successful) {
          result.reason = "careful_speed may not be more than normal_speed";
        }
        return result;
      });
    apply_ = add_post_set_parameters_callback(
      [this](const std::vector<rclcpp::Parameter> & changes) {
        for (const auto & p : changes) {
          if (p.get_name() == "normal_speed") {normal_ = p.as_double();}
          if (p.get_name() == "careful_speed") {careful_ = p.as_double();}
        }
      });

    publisher_ = create_publisher<Twist>("cmd_vel_out", 10);
    subscription_ = create_subscription<Twist>(
      "cmd_vel_in", 10, [this](const Twist & in) {
        const double limit = careful_mode_ ? careful_ : normal_;
        Twist out = in;
        out.linear.x = std::clamp(in.linear.x, -limit, limit);
        publisher_->publish(out);
      });
    service_ = create_service<SetMode>(
      "set_mode", [this](const SetMode::Request::SharedPtr request, SetMode::Response::SharedPtr response) {
        if (request->mode == "normal" || request->mode == "careful") {
          careful_mode_ = request->mode == "careful";
          response->success = true;
          response->message = "mode " + request->mode;
        } else {
          response->success = false;
          response->message = "unknown mode '" + request->mode + "': use normal or careful";
        }
        response->max_speed = careful_mode_ ? careful_ : normal_;
      });
  }

private:
  double normal_;
  double careful_;
  bool careful_mode_ = false;
  rclcpp::node_interfaces::OnSetParametersCallbackHandle::SharedPtr check_;
  rclcpp::node_interfaces::PostSetParametersCallbackHandle::SharedPtr apply_;
  rclcpp::Publisher<Twist>::SharedPtr publisher_;
  rclcpp::Subscription<Twist>::SharedPtr subscription_;
  rclcpp::Service<SetMode>::SharedPtr service_;
};

int main(int argc, char ** argv)
{
  rclcpp::init(argc, argv);
  rclcpp::spin(std::make_shared<SpeedLimiter>());
  rclcpp::shutdown();
  return 0;
}
