import type { Question } from '../components/Quiz'

export const lesson16Quiz: Question[] = [
  {
    prompt: 'What did every ROS 1 system need running first?',
    options: ['roscore, the master', 'A DDS discovery server', 'The ros2 daemon', 'Gazebo'],
    answer: 0,
    explain: 'Nodes registered with the master to find each other, and read parameters from its server. If it stopped, no new connections could be made. ROS 2 has no master.',
  },
  {
    prompt: 'private_nh.param("period", period_, 1.0) in ROS 1. What is it in ROS 2?',
    options: [
      'period_ = declare_parameter("period", 1.0);',
      'get_parameter("~period", period_);',
      'A launch argument',
      'A global parameter on the parameter server',
    ],
    answer: 0,
    explain: 'ROS 2 parameters belong to the node that declares them; there is no ~ namespace and no global server.',
  },
  {
    prompt: 'The ROS 1 heartbeat loops with ros::Rate, publishing and calling ros::spinOnce(). What does it usually become in ROS 2?',
    options: [
      'A timer whose callback publishes, and rclcpp::spin',
      'The same loop with rclcpp::Rate and no spinning',
      'An action server',
      'A launch file that runs it repeatedly',
    ],
    answer: 0,
    explain: 'A loop with spinOnce can be ported literally, but a timer lets the executor run everything, and is the idiom other ROS 2 code expects.',
  },
  {
    prompt: 'Which change is not a mere rename when porting?',
    options: [
      'A subscription’s queue size of 10 becoming a QoS profile',
      'ros::Publisher becoming rclcpp::Publisher',
      'ROS_INFO becoming RCLCPP_INFO',
      'nav_msgs/Odometry.h becoming nav_msgs/msg/odometry.hpp',
    ],
    answer: 0,
    explain: 'ROS 1 connections were reliable TCP; in ROS 2, reliability, durability and depth are chosen, and a mismatch silences a topic (Lesson 14).',
  },
  {
    prompt: 'A ROS 1 XML launch file: what changes to run it in ROS 2?',
    options: [
      'A few attributes, such as type="…" becoming exec="…"; ROS 2 still reads XML',
      'It must be rewritten in Python',
      'Nothing at all',
      'It cannot be ported',
    ],
    answer: 0,
    explain: 'ROS 2 launch reads Python, XML and YAML files. Python launch files can do more, but a simple XML file ports in minutes.',
  },
  {
    prompt: 'What is ros1_bridge for?',
    options: [
      'Running ROS 1 and ROS 2 side by side during a migration, passing topics and services between them',
      'Converting ROS 1 code to ROS 2 automatically',
      'Replaying ROS 1 bags in Gazebo',
      'Connecting two ROS 2 domains',
    ],
    answer: 0,
    explain: 'It lets a robot be ported package by package. It needs a ROS 1 and a ROS 2 installation on the same machine, which also makes it the last step of a migration to remove.',
  },
]
