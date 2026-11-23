cmake_minimum_required(VERSION 3.8)
project(sync_demo)

if(CMAKE_COMPILER_IS_GNUCXX OR CMAKE_CXX_COMPILER_ID MATCHES "Clang")
  add_compile_options(-Wall -Wextra -Wpedantic)
endif()

find_package(ament_cmake REQUIRED)
find_package(rclcpp REQUIRED)
find_package(sensor_msgs REQUIRED)
find_package(message_filters REQUIRED)

add_executable(pair_printer src/pair_printer.cpp)
ament_target_dependencies(pair_printer rclcpp sensor_msgs message_filters)
install(TARGETS pair_printer DESTINATION lib/${PROJECT_NAME})

ament_package()
