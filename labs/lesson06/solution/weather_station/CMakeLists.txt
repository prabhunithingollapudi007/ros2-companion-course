cmake_minimum_required(VERSION 3.8)
project(weather_station)

if(CMAKE_COMPILER_IS_GNUCXX OR CMAKE_CXX_COMPILER_ID MATCHES "Clang")
  add_compile_options(-Wall -Wextra -Wpedantic)
endif()

find_package(ament_cmake REQUIRED)
find_package(rclcpp REQUIRED)
find_package(sensor_msgs REQUIRED)
find_package(message_filters REQUIRED)

add_executable(dew_point src/dew_point.cpp)
ament_target_dependencies(dew_point rclcpp sensor_msgs message_filters)
install(TARGETS dew_point DESTINATION lib/${PROJECT_NAME})

ament_package()
