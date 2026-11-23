// Reference solution for the Lesson 15 lab. Try the lab before reading it.
//
// The fix: do not wait inside the subscription's callback. Send the request with
// a second argument, a callback, and publish from there when the answer arrives.
// The node's one thread is never blocked, so it keeps receiving voltages,
// answers, and requests to its parameter services.
#include <memory>

#include "battery_interfaces/srv/estimate_charge.hpp"
#include "rclcpp/rclcpp.hpp"
#include "std_msgs/msg/float64.hpp"

using battery_interfaces::srv::EstimateCharge;
using std_msgs::msg::Float64;

class BatteryMonitor : public rclcpp::Node
{
public:
  BatteryMonitor()
  : Node("battery_monitor")
  {
    client_ = create_client<EstimateCharge>("estimate_charge");
    publisher_ = create_publisher<Float64>("battery_charge", 10);
    subscription_ = create_subscription<Float64>(
      "battery_voltage", 10, [this](const Float64 & voltage) {
        auto request = std::make_shared<EstimateCharge::Request>();
        request->voltage = voltage.data;
        client_->async_send_request(
          request, [this](rclcpp::Client<EstimateCharge>::SharedFuture answer) {
            Float64 charge;
            charge.data = answer.get()->charge;
            publisher_->publish(charge);
          });
      });
  }

private:
  rclcpp::Client<EstimateCharge>::SharedPtr client_;
  rclcpp::Publisher<Float64>::SharedPtr publisher_;
  rclcpp::Subscription<Float64>::SharedPtr subscription_;
};

int main(int argc, char ** argv)
{
  rclcpp::init(argc, argv);
  rclcpp::spin(std::make_shared<BatteryMonitor>());
  rclcpp::shutdown();
  return 0;
}
