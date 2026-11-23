cmake_minimum_required(VERSION 3.8)
project(frames_demo)

if(CMAKE_COMPILER_IS_GNUCXX OR CMAKE_CXX_COMPILER_ID MATCHES "Clang")
  add_compile_options(-Wall -Wextra -Wpedantic)
endif()

find_package(ament_cmake REQUIRED)
find_package(rclcpp REQUIRED)
find_package(geometry_msgs REQUIRED)
find_package(tf2 REQUIRED)
find_package(tf2_ros REQUIRED)

add_executable(circle_broadcaster src/circle_broadcaster.cpp)
ament_target_dependencies(circle_broadcaster rclcpp geometry_msgs tf2 tf2_ros)

add_executable(where_is src/where_is.cpp)
ament_target_dependencies(where_is rclcpp tf2 tf2_ros)

install(TARGETS circle_broadcaster where_is DESTINATION lib/${PROJECT_NAME})
install(DIRECTORY launch rviz DESTINATION share/${PROJECT_NAME})

ament_package()
