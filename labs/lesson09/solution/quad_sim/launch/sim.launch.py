# Reference solution for the Lesson 9 lab. Try the lab before reading it.
from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument, IncludeLaunchDescription
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch.substitutions import Command, LaunchConfiguration, PathJoinSubstitution, PythonExpression
from launch_ros.actions import Node
from launch_ros.parameter_descriptions import ParameterValue
from launch_ros.substitutions import FindPackageShare


def generate_launch_description():
    share = FindPackageShare('quad_sim')
    world = PathJoinSubstitution([share, 'worlds', 'yard.sdf'])
    model = PathJoinSubstitution([share, 'urdf', 'quad_sim.urdf.xacro'])
    # '-r -s world' without a window, '-r world' with one.
    gz_args = [PythonExpression(["'-r ' if '", LaunchConfiguration('gui'), "' == 'true' else '-r -s '"]), world]
    return LaunchDescription([
        DeclareLaunchArgument('gui', default_value='true'),
        IncludeLaunchDescription(
            PythonLaunchDescriptionSource(PathJoinSubstitution([FindPackageShare('ros_gz_sim'), 'launch', 'gz_sim.launch.py'])),
            launch_arguments={'gz_args': gz_args}.items(),
        ),
        Node(
            package='robot_state_publisher',
            executable='robot_state_publisher',
            parameters=[{'robot_description': ParameterValue(Command(['xacro ', model]), value_type=str), 'use_sim_time': True}],
        ),
        Node(package='ros_gz_sim', executable='create', arguments=['-topic', 'robot_description', '-name', 'quad', '-z', '0.1']),
        Node(
            package='ros_gz_bridge',
            executable='parameter_bridge',
            arguments=[
                '/clock@rosgraph_msgs/msg/Clock[gz.msgs.Clock',
                '/cmd_vel@geometry_msgs/msg/Twist]gz.msgs.Twist',
                '/odom@nav_msgs/msg/Odometry[gz.msgs.Odometry',
                '/tf@tf2_msgs/msg/TFMessage[gz.msgs.Pose_V',
                '/joint_states@sensor_msgs/msg/JointState[gz.msgs.Model',
            ],
            parameters=[{'use_sim_time': True}],
        ),
    ])
