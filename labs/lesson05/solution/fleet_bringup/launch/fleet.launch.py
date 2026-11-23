# Reference solution for the Lesson 5 lab. Try the lab before reading it.
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node


def robot(namespace):
    """A battery and its monitor, in their own namespace."""
    return [
        Node(package='fleet_demo', executable='battery', namespace=namespace),
        Node(package='fleet_demo', executable='monitor', namespace=namespace),
    ]


def generate_launch_description():
    second = LaunchConfiguration('second_robot')
    return LaunchDescription([
        DeclareLaunchArgument('second_robot', default_value='robot2', description='Namespace of the second robot'),
        *robot('robot1'),
        *robot(second),
        Node(
            package='fleet_demo',
            executable='dashboard',
            remappings=[
                ('robot_a/status', '/robot1/battery_status'),
                ('robot_b/status', ['/', second, '/battery_status']),
            ],
        ),
    ])
