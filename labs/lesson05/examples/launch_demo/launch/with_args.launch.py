from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration
from launch_ros.actions import Node


def generate_launch_description():
    robot = LaunchConfiguration('robot')
    return LaunchDescription([
        DeclareLaunchArgument('robot', default_value='robot1', description='Namespace to start the pair in'),
        Node(package='demo_nodes_cpp', executable='talker', namespace=robot),
        Node(package='demo_nodes_cpp', executable='listener', namespace=robot),
    ])
