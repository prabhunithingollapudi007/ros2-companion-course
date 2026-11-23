// Lesson 15 lab: this node freezes. Find out why, and fix it.
//
// For each voltage reading on /battery_voltage, it asks the service
// /estimate_charge how full the battery is, and publishes the answer on
// /battery_charge. Run labs/lesson15/estimator.py alongside it.
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
        auto future = client_->async_send_request(request);
        future.wait();  // wait for the answer
        Float64 charge;
        charge.data = future.get()->charge;
        publisher_->publish(charge);
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
