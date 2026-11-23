// Lesson 8 example: once a second, asks tf2 where the camera is in the map frame,
// now and half a second earlier. With the parameter ask_ahead set, it asks about a
// moment in the future instead, which tf2 refuses.
#include <chrono>
#include <cmath>
#include <cstdio>
#include <memory>
#include <string>

#include "rclcpp/rclcpp.hpp"
#include "tf2/LinearMath/Matrix3x3.hpp"
#include "tf2/LinearMath/Quaternion.hpp"
#include "tf2_ros/buffer.hpp"
#include "tf2_ros/transform_listener.hpp"

using namespace std::chrono_literals;

class WhereIs : public rclcpp::Node
{
public:
  WhereIs()
  : Node("where_is")
  {
    ask_ahead_ = declare_parameter("ask_ahead", 0.0);
    // The buffer keeps the last 10 s of every transform; the listener fills it from /tf and /tf_static.
    buffer_ = std::make_unique<tf2_ros::Buffer>(get_clock());
    listener_ = std::make_shared<tf2_ros::TransformListener>(*buffer_);
    timer_ = create_wall_timer(1s, [this] {tick();});
  }

private:
  void tick()
  {
    // Until the listener has heard both frames, there is nothing to ask about yet.
    // (Passing a string for the reason keeps canTransform from logging it.)
    std::string why;
    if (!buffer_->canTransform("map", "camera", tf2::TimePointZero, &why)) {
      return;
    }
    try {
      if (ask_ahead_ > 0.0) {
        const tf2::TimePoint later = tf2_ros::fromMsg(now()) + tf2::durationFromSec(ask_ahead_);
        buffer_->lookupTransform("map", "camera", later);
        return;
      }
      // TimePointZero means "the latest transform you have".
      const auto latest = buffer_->lookupTransform("map", "camera", tf2::TimePointZero);
      const tf2::TimePoint then = tf2_ros::fromMsg(latest.header.stamp) - tf2::durationFromSec(0.5);
      if (!buffer_->canTransform("map", "camera", then, &why)) {
        return;  // the buffer does not reach back half a second yet
      }
      const auto earlier = buffer_->lookupTransform("map", "camera", then);
      RCLCPP_INFO(get_logger(), "camera in map: %s; 0.5 s earlier: %s", describe(latest).c_str(), describe(earlier).c_str());
    } catch (const tf2::TransformException & e) {
      RCLCPP_WARN(get_logger(), "%s", e.what());
    }
  }

  static std::string describe(const geometry_msgs::msg::TransformStamped & t)
  {
    const auto & r = t.transform.rotation;
    double roll, pitch, yaw;
    tf2::Matrix3x3(tf2::Quaternion(r.x, r.y, r.z, r.w)).getRPY(roll, pitch, yaw);
    char text[80];
    std::snprintf(
      text, sizeof(text), "x %.2f y %.2f, heading %.0f deg",
      t.transform.translation.x, t.transform.translation.y, yaw * 180.0 / M_PI);
    return text;
  }

  double ask_ahead_;
  std::unique_ptr<tf2_ros::Buffer> buffer_;
  std::shared_ptr<tf2_ros::TransformListener> listener_;
  rclcpp::TimerBase::SharedPtr timer_;
};

int main(int argc, char ** argv)
{
  rclcpp::init(argc, argv);
  rclcpp::spin(std::make_shared<WhereIs>());
  rclcpp::shutdown();
  return 0;
}
