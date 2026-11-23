cmake_minimum_required(VERSION 3.8)
project(battery_monitor)

if(CMAKE_COMPILER_IS_GNUCXX OR CMAKE_CXX_COMPILER_ID MATCHES "Clang")
  add_compile_options(-Wall -Wextra -Wpedantic)
endif()

find_package(ament_cmake REQUIRED)
find_package(rclcpp REQUIRED)
find_package(std_msgs REQUIRED)
find_package(battery_interfaces REQUIRED)

add_executable(battery_monitor src/battery_monitor.cpp)
ament_target_dependencies(battery_monitor rclcpp std_msgs battery_interfaces)
install(TARGETS battery_monitor DESTINATION lib/${PROJECT_NAME})

ament_package()
