// The source files Lesson 16 shows: a ROS 1 package (read only: there is no ROS 1
// in the course container) and its ROS 2 port, which the recordings build and run.

import ros1Launch from '../../../labs/lesson16/ros1/odom_logger/launch/odom_logger.launch?raw'
import ros1Cmake from '../../../labs/lesson16/ros1/odom_logger/CMakeLists.txt?raw'
import ros1Xml from '../../../labs/lesson16/ros1/odom_logger/package.xml?raw'
import ros1Cpp from '../../../labs/lesson16/ros1/odom_logger/src/odom_logger.cpp?raw'
import heartbeatRos1 from '../../../labs/lesson16/ros1/heartbeat/src/heartbeat.cpp?raw'
import ros2Launch from '../../../labs/lesson16/examples/odom_logger/launch/odom_logger.launch.xml?raw'
import ros2Cmake from '../../../labs/lesson16/examples/odom_logger/CMakeLists.txt?raw'
import ros2Xml from '../../../labs/lesson16/examples/odom_logger/package.xml?raw'
import ros2Cpp from '../../../labs/lesson16/examples/odom_logger/src/odom_logger.cpp?raw'

const r1 = 'labs/lesson16/ros1/odom_logger/'
const r2 = 'labs/lesson16/examples/odom_logger/'

export const code = {
  ros1Cpp: { path: r1 + 'src/odom_logger.cpp', code: ros1Cpp },
  ros1Cmake: { path: r1 + 'CMakeLists.txt', code: ros1Cmake },
  ros1Xml: { path: r1 + 'package.xml', code: ros1Xml },
  ros1Launch: { path: r1 + 'launch/odom_logger.launch', code: ros1Launch },
  ros2Cpp: { path: r2 + 'src/odom_logger.cpp', code: ros2Cpp },
  ros2Cmake: { path: r2 + 'CMakeLists.txt', code: ros2Cmake },
  ros2Xml: { path: r2 + 'package.xml', code: ros2Xml },
  ros2Launch: { path: r2 + 'launch/odom_logger.launch.xml', code: ros2Launch },
  heartbeatRos1: { path: 'labs/lesson16/ros1/heartbeat/src/heartbeat.cpp', code: heartbeatRos1 },
}
