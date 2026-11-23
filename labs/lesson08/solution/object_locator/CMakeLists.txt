cmake_minimum_required(VERSION 3.8)
project(object_locator)

if(CMAKE_COMPILER_IS_GNUCXX OR CMAKE_CXX_COMPILER_ID MATCHES "Clang")
  add_compile_options(-Wall -Wextra -Wpedantic)
endif()

find_package(ament_cmake REQUIRED)
find_package(rclcpp REQUIRED)
find_package(geometry_msgs REQUIRED)
find_package(tf2_ros REQUIRED)
find_package(tf2_geometry_msgs REQUIRED)

add_executable(object_locator src/object_locator.cpp)
ament_target_dependencies(object_locator rclcpp geometry_msgs tf2_ros tf2_geometry_msgs)
install(TARGETS object_locator DESTINATION lib/${PROJECT_NAME})

ament_package()
