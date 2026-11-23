// Lesson 8 example: pretends to be the rover's odometry. It drives base_link round
// a circle in the odom frame and broadcasts where it is, 50 times a second.
#include <chrono>
#include <cmath>
#include <memory>

#include "geometry_msgs/msg/transform_stamped.hpp"
#include "rclcpp/rclcpp.hpp"
#include "tf2/LinearMath/Quaternion.hpp"
#include "tf2_ros/transform_broadcaster.hpp"

using namespace std::chrono_literals;

class CircleBroadcaster : public rclcpp::Node
{
public:
  CircleBroadcaster()
  : Node("circle_broadcaster"), start_(now())
  {
    broadcaster_ = std::make_unique<tf2_ros::TransformBroadcaster>(*this);
    timer_ = create_wall_timer(20ms, [this] {tick();});
  }

private:
  void tick()
  {
    const rclcpp::Time stamp = now();
    // A circle of radius 1 m, starting at the origin heading along x, half a radian per second.
    const double heading = kTurnRate * (stamp - start_).seconds();

    geometry_msgs::msg::TransformStamped t;
    t.header.stamp = stamp;
    t.header.frame_id = "odom";
    t.child_frame_id = "base_link";
    t.transform.translation.x = kRadius * std::sin(heading);
    t.transform.translation.y = kRadius * (1.0 - std::cos(heading));
    tf2::Quaternion q;
    q.setRPY(0.0, 0.0, heading);
    t.transform.rotation.x = q.x();
    t.transform.rotation.y = q.y();
    t.transform.rotation.z = q.z();
    t.transform.rotation.w = q.w();
    broadcaster_->sendTransform(t);
  }

  static constexpr double kRadius = 1.0;
  static constexpr double kTurnRate = 0.5;
  rclcpp::Time start_;
  std::unique_ptr<tf2_ros::TransformBroadcaster> broadcaster_;
  rclcpp::TimerBase::SharedPtr timer_;
};

int main(int argc, char ** argv)
{
  rclcpp::init(argc, argv);
  rclcpp::spin(std::make_shared<CircleBroadcaster>());
  rclcpp::shutdown();
  return 0;
}
