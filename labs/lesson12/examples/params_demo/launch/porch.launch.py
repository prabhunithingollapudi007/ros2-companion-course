from launch import LaunchDescription
from launch.substitutions import PathJoinSubstitution
from launch_ros.actions import Node
from launch_ros.substitutions import FindPackageShare


def generate_launch_description():
    config = PathJoinSubstitution([FindPackageShare('params_demo'), 'config', 'porch.yaml'])
    return LaunchDescription([
        Node(
            package='params_demo',
            executable='blinker',
            # Applied in order: the file first, then the dictionary, so verbose is set on top of the file.
            parameters=[config, {'verbose': True}],
        ),
    ])
