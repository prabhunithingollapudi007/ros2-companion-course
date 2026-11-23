cmake_minimum_required(VERSION 3.8)
project(greeter_cpp)

if(CMAKE_COMPILER_IS_GNUCXX OR CMAKE_CXX_COMPILER_ID MATCHES "Clang")
  add_compile_options(-Wall -Wextra -Wpedantic)
endif()

find_package(ament_cmake REQUIRED)
find_package(rclcpp REQUIRED)
find_package(rosidl_default_generators REQUIRED)

# Generate C++ (and Python) code for the message defined in this package.
rosidl_generate_interfaces(${PROJECT_NAME}
  "msg/Greeting.msg"
)
# The target that programs in this same package link against to use it.
rosidl_get_typesupport_target(cpp_typesupport_target ${PROJECT_NAME} rosidl_typesupport_cpp)

foreach(program greeter listener counter slow_listener)
  add_executable(${program} src/${program}.cpp)
  ament_target_dependencies(${program} rclcpp)
  target_link_libraries(${program} "${cpp_typesupport_target}")
  install(TARGETS ${program} DESTINATION lib/${PROJECT_NAME})
endforeach()

ament_export_dependencies(rosidl_default_runtime)
ament_package()
