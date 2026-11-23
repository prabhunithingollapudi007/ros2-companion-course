from launch import LaunchDescription
from launch.actions import DeclareLaunchArgument, IncludeLaunchDescription
from launch.conditions import IfCondition, UnlessCondition
from launch.launch_description_sources import PythonLaunchDescriptionSource
from launch.substitutions import Command, LaunchConfiguration, PathJoinSubstitution
from launch_ros.actions import Node
from launch_ros.parameter_descriptions import ParameterValue
from launch_ros.substitutions import FindPackageShare


def generate_launch_description():
    share = FindPackageShare('rover_sim')
    world = PathJoinSubstitution([share, 'worlds', 'arena.sdf'])
    model = PathJoinSubstitution([share, 'urdf', 'rover_sim.urdf.xacro'])
    gz_sim = PathJoinSubstitution([FindPackageShare('ros_gz_sim'), 'launch', 'gz_sim.launch.py'])
    gui = LaunchConfiguration('gui')

    return LaunchDescription([
        DeclareLaunchArgument('gui', default_value='true', description="Open Gazebo's window"),
        DeclareLaunchArgument('rviz', default_value='false', description='Open RViz'),
        # Gazebo itself: -r starts the simulation running; -s runs the server only, without a window.
        IncludeLaunchDescription(
            PythonLaunchDescriptionSource(gz_sim),
            launch_arguments={'gz_args': ['-r ', world]}.items(),
            condition=IfCondition(gui),
        ),
        IncludeLaunchDescription(
            PythonLaunchDescriptionSource(gz_sim),
            launch_arguments={'gz_args': ['-r -s ', world]}.items(),
            condition=UnlessCondition(gui),
        ),
        # The robot's description, as in Lesson 7, but on the simulation's clock.
        Node(
            package='robot_state_publisher',
            executable='robot_state_publisher',
            parameters=[{'robot_description': ParameterValue(Command(['xacro ', model]), value_type=str), 'use_sim_time': True}],
        ),
        # Put the robot into the running world, from the description robot_state_publisher publishes.
        Node(package='ros_gz_sim', executable='create', arguments=['-topic', 'robot_description', '-name', 'rover', '-z', '0.1']),
        # Carry topics between Gazebo and ROS: TOPIC@ROS_TYPE then [ (Gazebo to ROS), ] (ROS to Gazebo) or @ (both), then GAZEBO_TYPE.
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
        Node(
            package='rviz2',
            executable='rviz2',
            arguments=['-d', PathJoinSubstitution([share, 'rviz', 'sim.rviz'])],
            parameters=[{'use_sim_time': True}],
            condition=IfCondition(LaunchConfiguration('rviz')),
        ),
    ])
