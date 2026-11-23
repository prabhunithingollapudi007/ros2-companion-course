#include <memory>

#include "greeter_cpp/msg/greeting.hpp"
#include "rclcpp/rclcpp.hpp"

using greeter_cpp::msg::Greeting;

class Listener : public rclcpp::Node
{
public:
  Listener()
  : Node("listener")
  {
    subscription_ = create_subscription<Greeting>(
      "greetings", 10,
      [this](const Greeting & msg) {
        RCLCPP_INFO(get_logger(), "Got '%s' number %u", msg.text.c_str(), msg.count);
      });
  }

private:
  rclcpp::Subscription<Greeting>::SharedPtr subscription_;
};

int main(int argc, char ** argv)
{
  rclcpp::init(argc, argv);
  rclcpp::spin(std::make_shared<Listener>());
  rclcpp::shutdown();
  return 0;
}
