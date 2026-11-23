cmake_minimum_required(VERSION 3.8)
project(power_monitor)

if(CMAKE_COMPILER_IS_GNUCXX OR CMAKE_CXX_COMPILER_ID MATCHES "Clang")
  add_compile_options(-Wall -Wextra -Wpedantic)
endif()

find_package(ament_cmake REQUIRED)
find_package(rclcpp REQUIRED)
find_package(std_msgs REQUIRED)
find_package(rosidl_default_generators REQUIRED)

rosidl_generate_interfaces(${PROJECT_NAME}
  "msg/BatteryStatus.msg"
)
rosidl_get_typesupport_target(cpp_typesupport_target ${PROJECT_NAME} rosidl_typesupport_cpp)

add_executable(battery_monitor src/battery_monitor.cpp)
target_compile_features(battery_monitor PUBLIC cxx_std_17)
ament_target_dependencies(battery_monitor rclcpp std_msgs)
target_link_libraries(battery_monitor "${cpp_typesupport_target}")

install(TARGETS battery_monitor DESTINATION lib/${PROJECT_NAME})

ament_export_dependencies(rosidl_default_runtime)
ament_package()
