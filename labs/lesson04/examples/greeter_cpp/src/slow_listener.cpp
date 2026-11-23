// A listener whose callback takes a quarter of a second, with a queue as deep
// as the first argument says (10 if none is given).
#include <chrono>
#include <memory>
#include <string>
#include <thread>

#include "greeter_cpp/msg/greeting.hpp"
#include "rclcpp/rclcpp.hpp"

using namespace std::chrono_literals;
using greeter_cpp::msg::Greeting;

class SlowListener : public rclcpp::Node
{
public:
  explicit SlowListener(size_t depth)
  : Node("slow_listener")
  {
    subscription_ = create_subscription<Greeting>(
      "greetings", depth,
      [this](const Greeting & msg) {
        RCLCPP_INFO(get_logger(), "Handling number %u", msg.count);
        std::this_thread::sleep_for(250ms);  // pretend this is slow work
      });
  }

private:
  rclcpp::Subscription<Greeting>::SharedPtr subscription_;
};

int main(int argc, char ** argv)
{
  rclcpp::init(argc, argv);
  size_t depth = argc > 1 ? std::stoul(argv[1]) : 10;
  rclcpp::spin(std::make_shared<SlowListener>(depth));
  rclcpp::shutdown();
  return 0;
}
