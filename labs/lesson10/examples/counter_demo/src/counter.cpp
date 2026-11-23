// Lesson 10 example: counts up once a second on /count, and offers two services:
// /reset (std_srvs/srv/Trigger) starts again from zero, and /set_step
// (counter_interfaces/srv/SetStep) changes how much it adds each time.
#include <chrono>
#include <memory>
#include <string>

#include "counter_interfaces/srv/set_step.hpp"
#include "rclcpp/rclcpp.hpp"
#include "std_msgs/msg/int64.hpp"
#include "std_srvs/srv/trigger.hpp"

using namespace std::chrono_literals;
using counter_interfaces::srv::SetStep;
using std_srvs::srv::Trigger;

class Counter : public rclcpp::Node
{
public:
  Counter()
  : Node("counter")
  {
    publisher_ = create_publisher<std_msgs::msg::Int64>("count", 10);
    timer_ = create_wall_timer(1s, [this] {
          std_msgs::msg::Int64 msg;
          msg.data = count_ += step_;
          publisher_->publish(msg);
        });

    // A server is a callback: it gets the request, fills in the response, and returns.
    reset_ = create_service<Trigger>(
      "reset", [this](const Trigger::Request::SharedPtr, Trigger::Response::SharedPtr response) {
        response->success = true;
        response->message = "was at " + std::to_string(count_);
        count_ = 0;
      });

    set_step_ = create_service<SetStep>(
      "set_step", [this](const SetStep::Request::SharedPtr request, SetStep::Response::SharedPtr response) {
        if (request->step < 1 || request->step > 100) {
          response->accepted = false;
          response->message = "step must be from 1 to 100, not " + std::to_string(request->step);
          return;
        }
        step_ = request->step;
        response->accepted = true;
        response->message = "counting in steps of " + std::to_string(step_);
        RCLCPP_INFO(get_logger(), "%s", response->message.c_str());
      });
  }

private:
  rclcpp::Publisher<std_msgs::msg::Int64>::SharedPtr publisher_;
  rclcpp::TimerBase::SharedPtr timer_;
  rclcpp::Service<Trigger>::SharedPtr reset_;
  rclcpp::Service<SetStep>::SharedPtr set_step_;
  int64_t count_ = 0;
  int64_t step_ = 1;
};

int main(int argc, char ** argv)
{
  rclcpp::init(argc, argv);
  rclcpp::spin(std::make_shared<Counter>());
  rclcpp::shutdown();
  return 0;
}
