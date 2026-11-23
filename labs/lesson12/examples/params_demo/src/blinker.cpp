// Lesson 12 example: a blinking light, configured by parameters. It publishes
// on/off on /light at `rate` times a second, and logs `label` with each change
// when `verbose` is true. The rate can be changed while it runs; the label must
// not be empty.
#include <chrono>
#include <memory>
#include <string>
#include <vector>

#include "rclcpp/rclcpp.hpp"
#include "std_msgs/msg/bool.hpp"

class Blinker : public rclcpp::Node
{
public:
  Blinker()
  : Node("blinker")
  {
    // A parameter is declared with a default; a descriptor adds a description and a range.
    rcl_interfaces::msg::ParameterDescriptor rate_info;
    rate_info.description = "blinks per second";
    rate_info.floating_point_range.resize(1);
    rate_info.floating_point_range[0].from_value = 0.5;
    rate_info.floating_point_range[0].to_value = 10.0;
    rate_ = declare_parameter("rate", 2.0, rate_info);
    label_ = declare_parameter("label", "light");
    verbose_ = declare_parameter("verbose", false);

    // Before a change is made: say yes or no to it.
    check_ = add_on_set_parameters_callback(
      [](const std::vector<rclcpp::Parameter> & changes) {
        rcl_interfaces::msg::SetParametersResult result;
        result.successful = true;
        for (const auto & p : changes) {
          if (p.get_name() == "label" && p.as_string().empty()) {
            result.successful = false;
            result.reason = "label must not be empty";
          }
        }
        return result;
      });
    // After it is made: act on it.
    apply_ = add_post_set_parameters_callback(
      [this](const std::vector<rclcpp::Parameter> & changes) {
        for (const auto & p : changes) {
          if (p.get_name() == "rate") {
            rate_ = p.as_double();
            start_timer();
            RCLCPP_INFO(get_logger(), "now blinking %.1f times a second", rate_);
          } else if (p.get_name() == "label") {
            label_ = p.as_string();
          } else if (p.get_name() == "verbose") {
            verbose_ = p.as_bool();
          }
        }
      });

    publisher_ = create_publisher<std_msgs::msg::Bool>("light", 10);
    start_timer();
    RCLCPP_INFO(get_logger(), "%s: blinking %.1f times a second", label_.c_str(), rate_);
  }

private:
  void start_timer()
  {
    // Twice per blink: on, then off.
    timer_ = create_wall_timer(std::chrono::duration<double>(0.5 / rate_), [this] {
          std_msgs::msg::Bool msg;
          msg.data = on_ = !on_;
          publisher_->publish(msg);
          if (verbose_) {
            RCLCPP_INFO(get_logger(), "%s %s", label_.c_str(), on_ ? "on" : "off");
          }
        });
  }

  double rate_;
  std::string label_;
  bool verbose_;
  bool on_ = false;
  rclcpp::Publisher<std_msgs::msg::Bool>::SharedPtr publisher_;
  rclcpp::TimerBase::SharedPtr timer_;
  rclcpp::node_interfaces::OnSetParametersCallbackHandle::SharedPtr check_;
  rclcpp::node_interfaces::PostSetParametersCallbackHandle::SharedPtr apply_;
};

int main(int argc, char ** argv)
{
  rclcpp::init(argc, argv);
  rclcpp::spin(std::make_shared<Blinker>());
  rclcpp::shutdown();
  return 0;
}
