from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.conditions import IfCondition, UnlessCondition
from launch.substitutions import Command, LaunchConfiguration, PathJoinSubstitution
from launch_ros.actions import Node
from launch_ros.parameter_descriptions import ParameterValue
from launch_ros.substitutions import FindPackageShare


def generate_launch_description():
    share = FindPackageShare('rover_description')
    model = PathJoinSubstitution([share, 'urdf', 'rover.urdf.xacro'])
    # Run xacro when launching, and hand the resulting URDF to robot_state_publisher.
    robot_description = ParameterValue(Command(['xacro ', model]), value_type=str)
    gui = LaunchConfiguration('gui')
    return LaunchDescription([
        DeclareLaunchArgument('gui', default_value='true', description='Show sliders to move the joints'),
        Node(
            package='robot_state_publisher',
            executable='robot_state_publisher',
            parameters=[{'robot_description': robot_description}],
        ),
        Node(package='joint_state_publisher_gui', executable='joint_state_publisher_gui', condition=IfCondition(gui)),
        Node(package='joint_state_publisher', executable='joint_state_publisher', condition=UnlessCondition(gui)),
        Node(package='rviz2', executable='rviz2', arguments=['-d', PathJoinSubstitution([share, 'rviz', 'view.rviz'])]),
    ])
