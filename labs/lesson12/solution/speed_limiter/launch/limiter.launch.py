# Reference solution for the Lesson 12 lab. Try the lab before reading it.
from launch import LaunchDescription
from launch.substitutions import PathJoinSubstitution
from launch_ros.actions import Node
from launch_ros.substitutions import FindPackageShare


def generate_launch_description():
    return LaunchDescription([
        Node(
            package='speed_limiter',
            executable='speed_limiter',
            parameters=[PathJoinSubstitution([FindPackageShare('speed_limiter'), 'config', 'limits.yaml'])],
        ),
    ])
