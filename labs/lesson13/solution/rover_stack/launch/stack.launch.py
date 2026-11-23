"""Reference solution for the Lesson 13 lab. Try the lab before reading it.

    teleop --/cmd_vel_in--> speed_limiter --/cmd_vel_limited--> cmd_watchdog --/cmd_vel--> Gazebo
"""
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument, IncludeLaunchDescription
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch.substitutions import LaunchConfiguration, PathJoinSubstitution
from launch_ros.actions import Node
from launch_ros.substitutions import FindPackageShare


def generate_launch_description():
    config = PathJoinSubstitution([FindPackageShare('rover_stack'), 'config', 'stack.yaml'])
    return LaunchDescription([
        DeclareLaunchArgument('gui', default_value='true', description="Open Gazebo's window"),
        IncludeLaunchDescription(
            PythonLaunchDescriptionSource(PathJoinSubstitution([FindPackageShare('rover_sim'), 'launch', 'sim.launch.py'])),
            launch_arguments={'gui': LaunchConfiguration('gui')}.items(),
        ),
        Node(
            package='speed_limiter',
            executable='speed_limiter',
            parameters=[config],
            remappings=[('cmd_vel_out', 'cmd_vel_limited')],
        ),
        Node(
            package='cmd_watchdog',
            executable='cmd_watchdog',
            parameters=[config],
            remappings=[('cmd_vel_in', 'cmd_vel_limited'), ('cmd_vel_out', 'cmd_vel')],
        ),
    ])
