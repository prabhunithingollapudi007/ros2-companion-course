// Lesson 10 example: asks the counter to count in steps of N, the first argument,
// waits for the answer, prints it and exits.
#include <chrono>
#include <memory>
#include <string>

#include "counter_interfaces/srv/set_step.hpp"
#include "rclcpp/rclcpp.hpp"

using namespace std::chrono_literals;
using counter_interfaces::srv::SetStep;

int main(int argc, char ** argv)
{
  rclcpp::init(argc, argv);
  auto node = rclcpp::Node::make_shared("step_client");
  auto client = node->create_client<SetStep>("set_step");

  // A service exists only while its server runs: wait for one to appear.
  while (!client->wait_for_service(1s)) {
    if (!rclcpp::ok()) {
      return 1;
    }
    RCLCPP_INFO(node->get_logger(), "waiting for /set_step...");
  }

  auto request = std::make_shared<SetStep::Request>();
  request->step = argc > 1 ? std::stoll(argv[1]) : 2;
  // Sending returns at once with a future: the answer arrives later.
  auto future = client->async_send_request(request);

  // Spin the node, so the response can be received, until the future holds it.
  if (rclcpp::spin_until_future_complete(node, future, 5s) == rclcpp::FutureReturnCode::SUCCESS) {
    const auto response = future.get();
    RCLCPP_INFO(
      node->get_logger(), "accepted: %s, %s", response->accepted ? "yes" : "no", response->message.c_str());
  } else {
    RCLCPP_ERROR(node->get_logger(), "no answer within 5 s");
  }
  rclcpp::shutdown();
  return 0;
}
