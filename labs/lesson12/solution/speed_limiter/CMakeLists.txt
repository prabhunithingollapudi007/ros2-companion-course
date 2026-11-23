cmake_minimum_required(VERSION 3.8)
project(speed_limiter)

if(CMAKE_COMPILER_IS_GNUCXX OR CMAKE_CXX_COMPILER_ID MATCHES "Clang")
  add_compile_options(-Wall -Wextra -Wpedantic)
endif()

find_package(ament_cmake REQUIRED)
find_package(rclcpp REQUIRED)
find_package(geometry_msgs REQUIRED)
find_package(speed_limiter_interfaces REQUIRED)

add_executable(speed_limiter src/speed_limiter.cpp)
ament_target_dependencies(speed_limiter rclcpp geometry_msgs speed_limiter_interfaces)
install(TARGETS speed_limiter DESTINATION lib/${PROJECT_NAME})
install(DIRECTORY config launch DESTINATION share/${PROJECT_NAME})

ament_package()
