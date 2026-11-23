// Lesson 16: what each part of the ROS 1 odom_logger became in ROS 2. Each pair
// names a line in each file by text it contains; lesson16.test.ts checks that
// every one of them is in the files the recordings built.

export interface PortPair {
  ros1: string
  ros2: string
  what: string
  /** Mechanical: a rename. Meaning: the behaviour behind it changed too. */
  kind: 'mechanical' | 'meaning'
}

export const CPP_PAIRS: PortPair[] = [
  { ros1: '#include <ros/ros.h>', ros2: '#include "rclcpp/rclcpp.hpp"', what: 'roscpp becomes rclcpp; headers are lower case, .hpp, and messages live in a msg namespace.', kind: 'mechanical' },
  { ros1: '#include <nav_msgs/Odometry.h>', ros2: '#include "nav_msgs/msg/odometry.hpp"', what: 'Message headers: package/msg/snake_case.hpp.', kind: 'mechanical' },
  { ros1: 'class OdomLogger', ros2: 'class OdomLogger : public rclcpp::Node', what: 'A ROS 1 class holds a NodeHandle; a ROS 2 class usually is a node.', kind: 'mechanical' },
  {
    ros1: 'private_nh.param("period", period_, 1.0);',
    ros2: 'period_ = declare_parameter("period", 1.0);',
    what: 'ROS 1 read parameters from a global server, here under the private ~ namespace; a ROS 2 node declares its own (Lesson 12).',
    kind: 'meaning',
  },
  {
    ros1: 'sub_ = nh.subscribe("odom", 10, &OdomLogger::odomCallback, this);',
    ros2: 'sub_ = create_subscription<nav_msgs::msg::Odometry>(',
    what: 'The message type moves into the template argument. The 10 becomes a QoS depth: ROS 2 subscriptions also have reliability and durability (Lesson 14).',
    kind: 'meaning',
  },
  { ros1: 'pub_ = nh.advertise<std_msgs::Float64>("distance", 10);', ros2: 'pub_ = create_publisher<std_msgs::msg::Float64>("distance", 10);', what: 'advertise becomes create_publisher.', kind: 'mechanical' },
  {
    ros1: 'timer_ = nh.createTimer(ros::Duration(period_), &OdomLogger::report, this);',
    ros2: 'timer_ = create_wall_timer(std::chrono::duration<double>(period_), [this] {report();});',
    what: 'ROS 2 timers take std::chrono durations, and callbacks are usually lambdas.',
    kind: 'mechanical',
  },
  { ros1: 'const nav_msgs::Odometry::ConstPtr & msg', ros2: 'const nav_msgs::msg::Odometry & msg', what: 'Callbacks may take the message by reference: no shared pointer needed.', kind: 'mechanical' },
  { ros1: 'void report(const ros::TimerEvent &)', ros2: 'void report()', what: 'Timer callbacks take no event argument.', kind: 'mechanical' },
  { ros1: 'pub_.publish(out);', ros2: 'pub_->publish(out);', what: 'Publishers are shared pointers.', kind: 'mechanical' },
  { ros1: 'ROS_INFO("driven %.2f m", distance_);', ros2: 'RCLCPP_INFO(get_logger(), "driven %.2f m", distance_);', what: 'Logging names the node’s logger.', kind: 'mechanical' },
  { ros1: 'ros::init(argc, argv, "odom_logger");', ros2: 'rclcpp::init(argc, argv);', what: 'The node’s name moves from init to the node’s constructor.', kind: 'mechanical' },
  {
    ros1: 'ros::spin();',
    ros2: 'rclcpp::spin(std::make_shared<OdomLogger>());',
    what: 'ros::spin ran every callback of the process; rclcpp::spin runs one node in an executor, whose threads and groups are now yours to choose (Lesson 15).',
    kind: 'meaning',
  },
]

export const BUILD_PAIRS: PortPair[] = [
  { ros1: 'find_package(catkin REQUIRED COMPONENTS roscpp nav_msgs std_msgs)', ros2: 'find_package(rclcpp REQUIRED)', what: 'catkin becomes ament_cmake; each dependency is found on its own.', kind: 'mechanical' },
  { ros1: 'target_link_libraries(odom_logger ${catkin_LIBRARIES})', ros2: 'ament_target_dependencies(odom_logger rclcpp nav_msgs std_msgs)', what: 'Dependencies are attached to the target.', kind: 'mechanical' },
  { ros1: '<package format="2">', ros2: '<package format="3">', what: 'package.xml format 3, with ament_cmake as build type in <export>.', kind: 'mechanical' },
  { ros1: '<node pkg="odom_logger" type="odom_logger"', ros2: '<node pkg="odom_logger" exec="odom_logger"', what: 'XML launch files mostly carry over: type becomes exec.', kind: 'mechanical' },
]
