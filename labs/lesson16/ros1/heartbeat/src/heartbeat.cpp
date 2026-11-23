// Lesson 16 lab: a ROS 1 node to port to ROS 2.
//
// Publishes "alive 1", "alive 2", ... on /heartbeat, `rate` times a second (a
// private parameter, 2.0 by default). A std_msgs/Bool on /heartbeat_cmd pauses
// it (false) or resumes it (true); the count carries on where it stopped.
#include <ros/ros.h>
#include <std_msgs/Bool.h>
#include <std_msgs/String.h>

int main(int argc, char ** argv)
{
  ros::init(argc, argv, "heartbeat");
  ros::NodeHandle nh;
  ros::NodeHandle private_nh("~");

  double rate;
  private_nh.param("rate", rate, 2.0);

  bool running = true;
  ros::Publisher pub = nh.advertise<std_msgs::String>("heartbeat", 10);
  ros::Subscriber sub = nh.subscribe<std_msgs::Bool>(
    "heartbeat_cmd", 10, [&running](const std_msgs::Bool::ConstPtr & cmd) {
      running = cmd->data;
      ROS_INFO("%s", running ? "resumed" : "paused");
    });

  int count = 0;
  ros::Rate loop(rate);
  while (ros::ok()) {
    if (running) {
      std_msgs::String msg;
      msg.data = "alive " + std::to_string(++count);
      pub.publish(msg);
    }
    ros::spinOnce();
    loop.sleep();
  }
  return 0;
}
