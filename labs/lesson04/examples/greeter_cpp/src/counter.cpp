// Publishes numbered greetings quickly: 20 a second, or as many as the first argument says.
#include <chrono>
#include <memory>
#include <string>

#include "greeter_cpp/msg/greeting.hpp"
#include "rclcpp/rclcpp.hpp"

using greeter_cpp::msg::Greeting;

class Counter : public rclcpp::Node
{
public:
  explicit Counter(int rate)
  : Node("counter")
  {
    publisher_ = create_publisher<Greeting>("greetings", 10);
    timer_ = create_wall_timer(std::chrono::milliseconds(1000 / rate), [this]() {
          Greeting msg;
          msg.text = "count";
          msg.count = ++count_;
          publisher_->publish(msg);
        });
  }

private:
  rclcpp::Publisher<Greeting>::SharedPtr publisher_;
  rclcpp::TimerBase::SharedPtr timer_;
  uint32_t count_ = 0;
};

int main(int argc, char ** argv)
{
  rclcpp::init(argc, argv);
  int rate = argc > 1 ? std::stoi(argv[1]) : 20;
  rclcpp::spin(std::make_shared<Counter>(rate));
  rclcpp::shutdown();
  return 0;
}
