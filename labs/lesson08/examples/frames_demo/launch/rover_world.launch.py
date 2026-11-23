from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument
from launch.conditions import IfCondition
from launch.substitutions import Command, LaunchConfiguration, PathJoinSubstitution
from launch_ros.actions import Node
from launch_ros.parameter_descriptions import ParameterValue
from launch_ros.substitutions import FindPackageShare


def generate_launch_description():
    model = PathJoinSubstitution([FindPackageShare('rover_description'), 'urdf', 'rover.urdf.xacro'])
    layout = PathJoinSubstitution([FindPackageShare('frames_demo'), 'rviz', 'frames.rviz'])
    return LaunchDescription([
        DeclareLaunchArgument('rviz', default_value='true', description='Open RViz'),
        # map -> odom: where odometry's starting point is on the map. It never changes, so it is static.
        Node(
            package='tf2_ros',
            executable='static_transform_publisher',
            arguments=['--x', '0.5', '--y', '-0.2', '--yaw', '0.3', '--frame-id', 'map', '--child-frame-id', 'odom'],
        ),
        # odom -> base_link: where the robot has driven to. It changes all the time.
        Node(package='frames_demo', executable='circle_broadcaster'),
        # base_link -> wheels, caster and camera: from the rover's URDF and its joint states.
        Node(
            package='robot_state_publisher',
            executable='robot_state_publisher',
            parameters=[{'robot_description': ParameterValue(Command(['xacro ', model]), value_type=str)}],
        ),
        Node(package='joint_state_publisher', executable='joint_state_publisher'),
        Node(package='rviz2', executable='rviz2', arguments=['-d', layout], condition=IfCondition(LaunchConfiguration('rviz'))),
    ])
