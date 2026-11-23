// Lesson 15 example: a slow callback and a fast one in the same node.
//
//   busy_node THREADS GROUPS     THREADS: 1 or 2; GROUPS: same or separate
//
// The slow timer fires every 2 s and works for 1.5 s; the fast timer fires every
// 0.1 s. After 4.5 s the node says how often each ran. With one thread, or with
// both timers in one mutually exclusive group, the fast timer waits while the slow
// one works.
#include <atomic>
#include <chrono>
#include <memory>
#include <string>
#include <thread>

#include "rclcpp/rclcpp.hpp"

using namespace std::chrono_literals;

class BusyNode : public rclcpp::Node
{
public:
  explicit BusyNode(bool separate)
  : Node("busy_node")
  {
    // Every node has a default group, mutually exclusive: its callbacks never run at the same time.
    // Here each timer can get a group of its own instead. The node only keeps a weak reference
    // to a group, so it must be kept here: a group that is destroyed takes its callbacks with it.
    if (separate) {
      slow_group_ = create_callback_group(rclcpp::CallbackGroupType::MutuallyExclusive);
      fast_group_ = create_callback_group(rclcpp::CallbackGroupType::MutuallyExclusive);
    }
    slow_ = create_wall_timer(2s, [this] {
          ++slow_runs_;
          std::this_thread::sleep_for(1500ms);  // standing in for real work
        }, slow_group_);
    fast_ = create_wall_timer(100ms, [this] {++fast_ticks_;}, fast_group_);
  }

  void report() const
  {
    RCLCPP_INFO(get_logger(), "slow ran %d times, fast ticked %d times", slow_runs_.load(), fast_ticks_.load());
  }

private:
  rclcpp::CallbackGroup::SharedPtr slow_group_, fast_group_;  // null: the default group
  rclcpp::TimerBase::SharedPtr slow_, fast_;
  std::atomic<int> slow_runs_{0}, fast_ticks_{0};
};

int main(int argc, char ** argv)
{
  rclcpp::init(argc, argv);
  const int threads = argc > 1 ? std::stoi(argv[1]) : 1;
  const bool separate = argc > 2 && std::string(argv[2]) == "separate";
  auto node = std::make_shared<BusyNode>(separate);

  // The executor decides which ready callback runs, and on which thread.
  std::unique_ptr<rclcpp::Executor> executor;
  if (threads == 1) {
    executor = std::make_unique<rclcpp::executors::SingleThreadedExecutor>();
  } else {
    executor = std::make_unique<rclcpp::executors::MultiThreadedExecutor>(rclcpp::ExecutorOptions(), threads);
  }
  executor->add_node(node);
  // spin() is what starts a MultiThreadedExecutor's threads; another thread stops it after 4.5 s.
  std::thread stopper([&executor] {
      std::this_thread::sleep_for(4500ms);
      executor->cancel();
    });
  executor->spin();
  stopper.join();
  node->report();
  rclcpp::shutdown();
  return 0;
}
