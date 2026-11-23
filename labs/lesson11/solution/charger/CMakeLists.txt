cmake_minimum_required(VERSION 3.8)
project(charger)

if(CMAKE_COMPILER_IS_GNUCXX OR CMAKE_CXX_COMPILER_ID MATCHES "Clang")
  add_compile_options(-Wall -Wextra -Wpedantic)
endif()

find_package(ament_cmake REQUIRED)
find_package(rclcpp REQUIRED)
find_package(rclcpp_action REQUIRED)
find_package(charger_interfaces REQUIRED)

add_executable(charger src/charger.cpp)
ament_target_dependencies(charger rclcpp rclcpp_action charger_interfaces)
install(TARGETS charger DESTINATION lib/${PROJECT_NAME})

ament_package()
