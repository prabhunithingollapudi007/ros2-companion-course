"""Lesson 13 example: the rover's whole stack from one launch file.

    teleop --/cmd_vel_in--> speed_limiter --/cmd_vel--> Gazebo (DiffDrive)

Drive it with:
    ros2 run teleop_twist_keyboard teleop_twist_keyboard --ros-args -r cmd_vel:=cmd_vel_in
"""
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument, IncludeLaunchDescription
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch.substitutions import LaunchConfiguration, PathJoinSubstitution
from launch_ros.actions import Node
from launch_ros.substitutions import FindPackageShare


def generate_launch_description():
    # One file holds the settings of every node in the stack, keyed by node name.
    config = PathJoinSubstitution([FindPackageShare('rover_stack'), 'config', 'stack.yaml'])
    return LaunchDescription([
        DeclareLaunchArgument('gui', default_value='true', description="Open Gazebo's window"),
        # The simulation of Lesson 9, included whole: Gazebo, the robot, the bridge.
        IncludeLaunchDescription(
            PythonLaunchDescriptionSource(PathJoinSubstitution([FindPackageShare('rover_sim'), 'launch', 'sim.launch.py'])),
            launch_arguments={'gui': LaunchConfiguration('gui')}.items(),
        ),
        # The speed limiter of Lessons 10 and 12, between the commands and the robot.
        Node(
            package='speed_limiter',
            executable='speed_limiter',
            parameters=[config],
            remappings=[('cmd_vel_out', 'cmd_vel')],
        ),
    ])
