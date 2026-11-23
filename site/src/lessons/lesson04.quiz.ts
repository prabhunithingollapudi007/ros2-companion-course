import type { Question } from '../components/Quiz'

export const lesson04Quiz: Question[] = [
  {
    prompt: 'The greeter’s constructor creates a publisher and a 500 ms timer. When is its first message sent?',
    options: [
      'When the timer first fires, about half a second after spin starts',
      'As soon as the publisher is created',
      'When a subscriber connects',
      'When main reaches rclcpp::shutdown()',
    ],
    answer: 0,
    explain: 'The constructor only sets things up. The timer’s callback does the publishing, and callbacks run only while rclcpp::spin is running.',
  },
  {
    prompt: 'What does rclcpp::spin(node) do?',
    options: [
      'Waits for timers and incoming messages and runs their callbacks, one at a time, until the program is stopped',
      'Publishes every message the node has queued, then returns',
      'Starts a new thread for each callback',
      'Checks the node for errors and returns',
    ],
    answer: 0,
    explain: 'spin is the node’s main loop. Without it, main would return straight after the constructor and no callback would ever run.',
  },
  {
    prompt: 'A package named nav_tools defines msg/RobotPose.msg. What does a C++ file in another package include?',
    options: ['"nav_tools/msg/robot_pose.hpp"', '"nav_tools/msg/RobotPose.hpp"', '"nav_tools/RobotPose.h"', '"msg/robot_pose.hpp"'],
    answer: 0,
    explain: 'The header is package/msg/ plus the message name in snake_case. The C++ type keeps its capitals: nav_tools::msg::RobotPose.',
  },
  {
    prompt: 'In create_publisher<Greeting>("greetings", 10), what is the 10?',
    options: [
      'The queue depth: how many messages to keep if they cannot be sent or handled straight away',
      'The publishing rate in hertz',
      'The maximum number of subscribers',
      'A timeout in seconds',
    ],
    answer: 0,
    explain: 'It is the history depth, the simplest part of a topic’s quality-of-service settings (Lesson 14). The rate is decided by whatever calls publish, here the timer.',
  },
  {
    prompt: 'Messages arrive 20 times a second, the callback takes 250 ms, and the queue depth is 3. What happens?',
    options: [
      'About every fifth message is handled; the others are dropped from the full queue',
      'Every message is handled, just later',
      'The publisher slows down to 4 messages a second',
      'The subscriber crashes when the queue is full',
    ],
    answer: 0,
    explain: 'The callback manages 4 a second. While it works, 5 new messages arrive into a queue that holds 3, so the oldest are dropped. The recording shows exactly that: the numbers it handles go up in steps of five.',
  },
  {
    prompt: 'Same as before, but with a queue depth of 100. What changes?',
    options: [
      'Every message is handled in order, but the callback falls further and further behind',
      'Nothing: the extra depth is ignored',
      'The callback runs faster',
      'Messages are handled newest first',
    ],
    answer: 0,
    explain: 'Nothing is dropped at first, but the backlog grows by 16 messages a second, so each message waits longer than the one before. A long queue hides an overloaded callback; it does not fix it.',
  },
  {
    prompt: 'Which CMake lines let a program use a message defined in its own package?',
    options: [
      'rosidl_generate_interfaces, rosidl_get_typesupport_target, and target_link_libraries for the program',
      'find_package(std_msgs REQUIRED) only',
      'add_executable with the .msg file listed as a source',
      'None: messages are found automatically',
    ],
    answer: 0,
    explain: 'rosidl_generate_interfaces generates the code; rosidl_get_typesupport_target names the library holding it; target_link_libraries links your program to it. package.xml needs rosidl_default_generators and the rosidl_interface_packages group too.',
  },
  {
    prompt: 'Why does the subscription callback take its message as const Greeting & msg?',
    options: [
      'It only reads the message, so a const reference avoids copying it',
      'Messages cannot be copied in C++',
      'The & makes the callback run in parallel',
      'ROS requires every callback to return a reference',
    ],
    answer: 0,
    explain: 'rclcpp accepts several callback signatures; a const reference is the simplest when you only read the message. Other forms, such as a shared pointer, are useful when you keep the message for later.',
  },
]
