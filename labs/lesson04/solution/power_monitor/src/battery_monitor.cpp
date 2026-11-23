// Reference solution for the Lesson 4 lab. Try the lab before reading it.
#include <algorithm>
#include <memory>

#include "power_monitor/msg/battery_status.hpp"
#include "rclcpp/rclcpp.hpp"
#include "std_msgs/msg/float32.hpp"

using power_monitor::msg::BatteryStatus;
using std_msgs::msg::Float32;

constexpr float EMPTY = 21.0f;  // volts at 0 %
constexpr float FULL = 25.2f;   // volts at 100 %
constexpr float LOW = 20.0f;    // below this many percent, the battery is low

class BatteryMonitor : public rclcpp::Node
{
public:
  BatteryMonitor()
  : Node("battery_monitor")
  {
    publisher_ = create_publisher<BatteryStatus>("battery_status", 10);
    subscription_ = create_subscription<Float32>(
      "battery_voltage", 10,
      [this](const Float32 & reading) {
        BatteryStatus status;
        status.voltage = reading.data;
        status.percent = std::clamp((reading.data - EMPTY) / (FULL - EMPTY) * 100.0f, 0.0f, 100.0f);
        status.low = status.percent < LOW;
        publisher_->publish(status);
      });
  }

private:
  rclcpp::Publisher<BatteryStatus>::SharedPtr publisher_;
  rclcpp::Subscription<Float32>::SharedPtr subscription_;
};

int main(int argc, char ** argv)
{
  rclcpp::init(argc, argv);
  rclcpp::spin(std::make_shared<BatteryMonitor>());
  rclcpp::shutdown();
  return 0;
}
