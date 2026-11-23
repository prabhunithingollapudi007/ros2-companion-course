cmake_minimum_required(VERSION 3.0.2)
project(odom_logger)

find_package(catkin REQUIRED COMPONENTS roscpp nav_msgs std_msgs)

catkin_package()

include_directories(${catkin_INCLUDE_DIRS})

add_executable(odom_logger src/odom_logger.cpp)
target_link_libraries(odom_logger ${catkin_LIBRARIES})

install(TARGETS odom_logger RUNTIME DESTINATION ${CATKIN_PACKAGE_BIN_DESTINATION})
install(DIRECTORY launch DESTINATION ${CATKIN_PACKAGE_SHARE_DESTINATION})
