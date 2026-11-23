#include <chrono>
#include <memory>

#include "greeter_cpp/msg/greeting.hpp"
#include "rclcpp/rclcpp.hpp"

using namespace std::chrono_literals;
using greeter_cpp::msg::Greeting;

class Greeter : public rclcpp::Node
{
public:
  Greeter()
  : Node("greeter")
  {
    publisher_ = create_publisher<Greeting>("greetings", 10);
    timer_ = create_wall_timer(500ms, [this]() {tick();});
  }

private:
  void tick()
  {
    Greeting msg;
    msg.text = "hello";
    msg.count = ++count_;
    RCLCPP_INFO(get_logger(), "Sending greeting %u", msg.count);
    publisher_->publish(msg);
  }

  rclcpp::Publisher<Greeting>::SharedPtr publisher_;
  rclcpp::TimerBase::SharedPtr timer_;
  uint32_t count_ = 0;
};

int main(int argc, char ** argv)
{
  rclcpp::init(argc, argv);
  rclcpp::spin(std::make_shared<Greeter>());
  rclcpp::shutdown();
  return 0;
}
