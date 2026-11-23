# Reference solution for the Lesson 17 capstone. Try it before reading this.
"""The whole capstone: the Lesson 13 stack, and go_to on top of it.

    go_to --/cmd_vel_in--> speed_limiter --/cmd_vel_limited--> cmd_watchdog --/cmd_vel--> Gazebo
       ^                                                                                   |
       +------------------------------------- /odom ----------------------------------------+
"""
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument, IncludeLaunchDescription
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch.substitutions import LaunchConfiguration, PathJoinSubstitution
from launch_ros.actions import Node
from launch_ros.substitutions import FindPackageShare


def generate_launch_description():
    config = PathJoinSubstitution([FindPackageShare('capstone_bringup'), 'config', 'capstone.yaml'])
    return LaunchDescription([
        DeclareLaunchArgument('gui', default_value='true', description="Open Gazebo's window"),
        IncludeLaunchDescription(
            PythonLaunchDescriptionSource(PathJoinSubstitution([FindPackageShare('rover_stack'), 'launch', 'stack.launch.py'])),
            launch_arguments={'gui': LaunchConfiguration('gui')}.items(),
        ),
        Node(package='go_to', executable='go_to', parameters=[config, {'use_sim_time': True}]),
    ])
