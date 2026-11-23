// Reference solution for the Lesson 8 lab. Try the lab before reading it.
//
// Takes each detection, a point in the camera frame, and publishes the same point
// in the map frame, using where the camera was at the moment of the detection.
#include <memory>

#include "geometry_msgs/msg/point_stamped.hpp"
#include "rclcpp/rclcpp.hpp"
#include "tf2_geometry_msgs/tf2_geometry_msgs.hpp"
#include "tf2_ros/buffer.hpp"
#include "tf2_ros/transform_listener.hpp"

class ObjectLocator : public rclcpp::Node
{
public:
  ObjectLocator()
  : Node("object_locator")
  {
    buffer_ = std::make_unique<tf2_ros::Buffer>(get_clock());
    listener_ = std::make_shared<tf2_ros::TransformListener>(*buffer_);
    publisher_ = create_publisher<geometry_msgs::msg::PointStamped>("object_in_map", 10);
    subscription_ = create_subscription<geometry_msgs::msg::PointStamped>(
      "detections", 10, [this](const geometry_msgs::msg::PointStamped & seen) {locate(seen);});
  }

private:
  void locate(const geometry_msgs::msg::PointStamped & seen)
  {
    try {
      // transform() looks up the camera's pose at seen.header.stamp, not the latest one,
      // and the result keeps that stamp. Wait up to 0.1 s for the transform to arrive.
      publisher_->publish(buffer_->transform(seen, "map", tf2::durationFromSec(0.1)));
    } catch (const tf2::TransformException & e) {
      RCLCPP_WARN(get_logger(), "Could not place a detection: %s", e.what());
    }
  }

  std::unique_ptr<tf2_ros::Buffer> buffer_;
  std::shared_ptr<tf2_ros::TransformListener> listener_;
  rclcpp::Publisher<geometry_msgs::msg::PointStamped>::SharedPtr publisher_;
  rclcpp::Subscription<geometry_msgs::msg::PointStamped>::SharedPtr subscription_;
};

int main(int argc, char ** argv)
{
  rclcpp::init(argc, argv);
  rclcpp::spin(std::make_shared<ObjectLocator>());
  rclcpp::shutdown();
  return 0;
}
