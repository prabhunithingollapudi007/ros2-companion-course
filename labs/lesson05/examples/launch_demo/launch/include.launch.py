from launch import LaunchDescription
from launch.actions import GroupAction, IncludeLaunchDescription
from launch.substitutions import PathJoinSubstitution
from launch_ros.actions import PushRosNamespace
from launch_ros.substitutions import FindPackageShare


def generate_launch_description():
    talk_listen = PathJoinSubstitution([FindPackageShare('launch_demo'), 'launch', 'talk_listen.launch.py'])
    return LaunchDescription([
        GroupAction([
            PushRosNamespace('base'),
            IncludeLaunchDescription(talk_listen),
        ]),
    ])
