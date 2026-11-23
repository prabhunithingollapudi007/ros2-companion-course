cmake_minimum_required(VERSION 3.8)
project(rover_stack)

find_package(ament_cmake REQUIRED)

# A bringup package: no code of its own, just how the robot's nodes are started and configured.
install(DIRECTORY config launch DESTINATION share/${PROJECT_NAME})

ament_package()
