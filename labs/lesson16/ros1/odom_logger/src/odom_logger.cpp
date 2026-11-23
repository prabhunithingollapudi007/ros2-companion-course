// Lesson 16: a small ROS 1 node, to read and port. (ROS 1 is not installed in the
// course container; labs/lesson16/examples/odom_logger is the same node in ROS 2.)
//
// Logs how far the robot has driven, from its odometry, every `period` seconds.
#include <cmath>

#include <nav_msgs/Odometry.h>
#include <ros/ros.h>
#include <std_msgs/Float64.h>

class OdomLogger
{
public:
  explicit OdomLogger(ros::NodeHandle & nh)
  {
    ros::NodeHandle private_nh("~");
    private_nh.param("period", period_, 1.0);
    sub_ = nh.subscribe("odom", 10, &OdomLogger::odomCallback, this);
    pub_ = nh.advertise<std_msgs::Float64>("distance", 10);
    timer_ = nh.createTimer(ros::Duration(period_), &OdomLogger::report, this);
  }

private:
  void odomCallback(const nav_msgs::Odometry::ConstPtr & msg)
  {
    const double x = msg->pose.pose.position.x, y = msg->pose.pose.position.y;
    if (have_last_) {
      distance_ += std::hypot(x - last_x_, y - last_y_);
    }
    last_x_ = x;
    last_y_ = y;
    have_last_ = true;
  }

  void report(const ros::TimerEvent &)
  {
    std_msgs::Float64 out;
    out.data = distance_;
    pub_.publish(out);
    ROS_INFO("driven %.2f m", distance_);
  }

  double period_;
  double distance_ = 0.0, last_x_ = 0.0, last_y_ = 0.0;
  bool have_last_ = false;
  ros::Subscriber sub_;
  ros::Publisher pub_;
  ros::Timer timer_;
};

int main(int argc, char ** argv)
{
  ros::init(argc, argv, "odom_logger");
  ros::NodeHandle nh;
  OdomLogger logger(nh);
  ros::spin();
  return 0;
}
