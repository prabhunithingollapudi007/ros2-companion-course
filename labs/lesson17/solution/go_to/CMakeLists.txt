cmake_minimum_required(VERSION 3.8)
project(go_to)

if(CMAKE_COMPILER_IS_GNUCXX OR CMAKE_CXX_COMPILER_ID MATCHES "Clang")
  add_compile_options(-Wall -Wextra -Wpedantic)
endif()

find_package(ament_cmake REQUIRED)
find_package(rclcpp REQUIRED)
find_package(rclcpp_action REQUIRED)
find_package(geometry_msgs REQUIRED)
find_package(nav_msgs REQUIRED)
find_package(capstone_interfaces REQUIRED)

add_executable(go_to src/go_to.cpp)
ament_target_dependencies(go_to rclcpp rclcpp_action geometry_msgs nav_msgs capstone_interfaces)
install(TARGETS go_to DESTINATION lib/${PROJECT_NAME})

ament_package()
