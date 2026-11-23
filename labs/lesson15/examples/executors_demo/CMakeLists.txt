cmake_minimum_required(VERSION 3.8)
project(executors_demo)

if(CMAKE_COMPILER_IS_GNUCXX OR CMAKE_CXX_COMPILER_ID MATCHES "Clang")
  add_compile_options(-Wall -Wextra -Wpedantic)
endif()

find_package(ament_cmake REQUIRED)
find_package(rclcpp REQUIRED)
find_package(example_interfaces REQUIRED)

add_executable(busy_node src/busy_node.cpp)
ament_target_dependencies(busy_node rclcpp)

add_executable(caller src/caller.cpp)
ament_target_dependencies(caller rclcpp example_interfaces)

install(TARGETS busy_node caller DESTINATION lib/${PROJECT_NAME})

ament_package()
