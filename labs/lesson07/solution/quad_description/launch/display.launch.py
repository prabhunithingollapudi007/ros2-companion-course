# Reference solution for the Lesson 7 lab. Try the lab before reading it.
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.conditions import IfCondition
from launch.substitutions import Command, LaunchConfiguration, PathJoinSubstitution
from launch_ros.actions import Node
from launch_ros.parameter_descriptions import ParameterValue
from launch_ros.substitutions import FindPackageShare


def generate_launch_description():
    model = PathJoinSubstitution([FindPackageShare('quad_description'), 'urdf', 'quad.urdf.xacro'])
    rviz = LaunchConfiguration('rviz')
    return LaunchDescription([
        DeclareLaunchArgument('rviz', default_value='true', description='Open RViz and the joint sliders'),
        Node(
            package='robot_state_publisher',
            executable='robot_state_publisher',
            parameters=[{'robot_description': ParameterValue(Command(['xacro ', model]), value_type=str)}],
        ),
        Node(package='joint_state_publisher_gui', executable='joint_state_publisher_gui', condition=IfCondition(rviz)),
        Node(package='rviz2', executable='rviz2', condition=IfCondition(rviz)),
    ])
