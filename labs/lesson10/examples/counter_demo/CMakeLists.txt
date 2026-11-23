cmake_minimum_required(VERSION 3.8)
project(counter_demo)

if(CMAKE_COMPILER_IS_GNUCXX OR CMAKE_CXX_COMPILER_ID MATCHES "Clang")
  add_compile_options(-Wall -Wextra -Wpedantic)
endif()

find_package(ament_cmake REQUIRED)
find_package(rclcpp REQUIRED)
find_package(std_msgs REQUIRED)
find_package(std_srvs REQUIRED)
find_package(counter_interfaces REQUIRED)

add_executable(counter src/counter.cpp)
ament_target_dependencies(counter rclcpp std_msgs std_srvs counter_interfaces)

add_executable(step_client src/step_client.cpp)
ament_target_dependencies(step_client rclcpp counter_interfaces)

install(TARGETS counter step_client DESTINATION lib/${PROJECT_NAME})

ament_package()
