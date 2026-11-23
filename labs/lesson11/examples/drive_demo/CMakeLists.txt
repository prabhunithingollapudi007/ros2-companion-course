cmake_minimum_required(VERSION 3.8)
project(drive_demo)

if(CMAKE_COMPILER_IS_GNUCXX OR CMAKE_CXX_COMPILER_ID MATCHES "Clang")
  add_compile_options(-Wall -Wextra -Wpedantic)
endif()

find_package(ament_cmake REQUIRED)
find_package(rclcpp REQUIRED)
find_package(rclcpp_action REQUIRED)
find_package(drive_interfaces REQUIRED)

foreach(program drive_server drive_client)
  add_executable(${program} src/${program}.cpp)
  ament_target_dependencies(${program} rclcpp rclcpp_action drive_interfaces)
  install(TARGETS ${program} DESTINATION lib/${PROJECT_NAME})
endforeach()

ament_package()
