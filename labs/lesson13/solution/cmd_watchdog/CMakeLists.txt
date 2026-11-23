cmake_minimum_required(VERSION 3.8)
project(cmd_watchdog)

if(CMAKE_COMPILER_IS_GNUCXX OR CMAKE_CXX_COMPILER_ID MATCHES "Clang")
  add_compile_options(-Wall -Wextra -Wpedantic)
endif()

find_package(ament_cmake REQUIRED)
find_package(rclcpp REQUIRED)
find_package(geometry_msgs REQUIRED)

add_executable(cmd_watchdog src/cmd_watchdog.cpp)
ament_target_dependencies(cmd_watchdog rclcpp geometry_msgs)
install(TARGETS cmd_watchdog DESTINATION lib/${PROJECT_NAME})

ament_package()
