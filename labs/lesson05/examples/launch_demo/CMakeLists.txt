cmake_minimum_required(VERSION 3.8)
project(launch_demo)

find_package(ament_cmake REQUIRED)

# Launch files are found in the package's share folder, so they must be installed there.
install(DIRECTORY launch DESTINATION share/${PROJECT_NAME})

ament_package()
