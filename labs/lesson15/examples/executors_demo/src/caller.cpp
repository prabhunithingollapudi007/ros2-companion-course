// Lesson 15 example: calls /add_two_ints from inside a timer callback, once a
// second, three ways.
//
//   caller wait       waits for the answer inside the callback: it never comes in time
//   caller groups     the same wait, with the client in its own callback group and two threads
//   caller callback   does not wait: the answer is handled in a callback when it arrives
//
// Run demo_nodes_cpp's add_two_ints_server alongside.
#include <chrono>
#include <future>
#include <memory>
#include <string>

#include "example_interfaces/srv/add_two_ints.hpp"
#include "rclcpp/rclcpp.hpp"

using namespace std::chrono_literals;
using AddTwoInts = example_interfaces::srv::AddTwoInts;

class Caller : public rclcpp::Node
{
public:
  explicit Caller(const std::string & mode)
  : Node("caller"), mode_(mode)
  {
    // With "groups", the client's responses are handled in a group of their own,
    // which a second thread can run while the timer's callback is still waiting.
    if (mode_ == "groups") {
      client_group_ = create_callback_group(rclcpp::CallbackGroupType::MutuallyExclusive);
    }
    client_ = create_client<AddTwoInts>("add_two_ints", rclcpp::ServicesQoS(), client_group_);
    timer_ = create_wall_timer(1s, [this] {ask();});
  }

private:
  void ask()
  {
    auto request = std::make_shared<AddTwoInts::Request>();
    request->a = ++n_;
    request->b = 100;
    if (mode_ == "callback") {
      // Send, and return at once. The executor calls this lambda when the answer arrives.
      client_->async_send_request(
        request, [this, a = request->a](rclcpp::Client<AddTwoInts>::SharedFuture answer) {
          RCLCPP_INFO(get_logger(), "%ld + 100 = %ld", a, answer.get()->sum);
        });
      return;
    }
    // Send, then wait here for the answer. The answer is delivered by the executor,
    // which, with one thread, is busy right here: in this callback.
    auto future = client_->async_send_request(request);
    if (future.wait_for(2s) == std::future_status::ready) {
      RCLCPP_INFO(get_logger(), "%ld + 100 = %ld", request->a, future.get()->sum);
    } else {
      RCLCPP_WARN(get_logger(), "%ld + 100: no answer after 2 s", request->a);
      client_->remove_pending_request(future);
    }
  }

  std::string mode_;
  long n_ = 0;
  rclcpp::CallbackGroup::SharedPtr client_group_;  // kept here: the node holds groups only weakly
  rclcpp::Client<AddTwoInts>::SharedPtr client_;
  rclcpp::TimerBase::SharedPtr timer_;
};

int main(int argc, char ** argv)
{
  rclcpp::init(argc, argv);
  const std::string mode = argc > 1 ? argv[1] : "wait";
  auto node = std::make_shared<Caller>(mode);
  if (mode == "groups") {
    rclcpp::executors::MultiThreadedExecutor executor(rclcpp::ExecutorOptions(), 2);
    executor.add_node(node);
    executor.spin();
  } else {
    rclcpp::spin(node);  // a single-threaded executor
  }
  rclcpp::shutdown();
  return 0;
}
