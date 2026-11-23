cmake_minimum_required(VERSION 3.8)
project(counter_interfaces)

find_package(ament_cmake REQUIRED)
find_package(rosidl_default_generators REQUIRED)

# A package that holds only interfaces: other packages, in any language, depend on it.
rosidl_generate_interfaces(${PROJECT_NAME}
  "srv/SetStep.srv"
)

ament_export_dependencies(rosidl_default_runtime)
ament_package()
