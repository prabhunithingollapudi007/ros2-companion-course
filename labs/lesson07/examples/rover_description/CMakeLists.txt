cmake_minimum_required(VERSION 3.8)
project(rover_description)

find_package(ament_cmake REQUIRED)

# Nothing to compile: the robot model, its launch file and an RViz layout are installed as they are.
install(DIRECTORY urdf launch rviz DESTINATION share/${PROJECT_NAME})

ament_package()
