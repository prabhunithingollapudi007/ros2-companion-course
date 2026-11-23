cmake_minimum_required(VERSION 3.0.2)
project(heartbeat)

find_package(catkin REQUIRED COMPONENTS roscpp std_msgs)

catkin_package()

include_directories(${catkin_INCLUDE_DIRS})

add_executable(heartbeat src/heartbeat.cpp)
target_link_libraries(heartbeat ${catkin_LIBRARIES})

install(TARGETS heartbeat RUNTIME DESTINATION ${CATKIN_PACKAGE_BIN_DESTINATION})
install(DIRECTORY launch DESTINATION ${CATKIN_PACKAGE_SHARE_DESTINATION})
