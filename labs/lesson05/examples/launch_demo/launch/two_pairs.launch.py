from launch import LaunchDescription
from launch_ros.actions import Node


def generate_launch_description():
    return LaunchDescription([
        Node(package='demo_nodes_cpp', executable='talker', namespace='left'),
        Node(package='demo_nodes_cpp', executable='listener', namespace='left'),
        Node(package='demo_nodes_cpp', executable='talker', namespace='right'),
        Node(package='demo_nodes_cpp', executable='listener', namespace='right'),
    ])
