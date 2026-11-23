cmake_minimum_required(VERSION 3.8)
project(rover_sim)

find_package(ament_cmake REQUIRED)

# Nothing to compile: a world, the robot's simulation description, a launch file and an RViz layout.
install(DIRECTORY launch rviz urdf worlds DESTINATION share/${PROJECT_NAME})

ament_package()
