import type { Question } from '../components/Quiz'

export const lesson09Quiz: Question[] = [
  {
    prompt: 'What does Gazebo give you that RViz does not?',
    options: [
      'Physics: forces, contacts and motion, so the robot moves because its wheels push on the ground',
      'A 3D view of the robot',
      'The robot’s frames',
      'Nothing: they are two names for the same program',
    ],
    answer: 0,
    explain: 'RViz only draws what it is told. Gazebo simulates the world and the robot in it, and produces the data a real robot would: odometry, joint positions, sensor readings.',
  },
  {
    prompt: 'A ROS node publishes on /cmd_vel. Why does the simulated robot not move until a bridge is running?',
    options: [
      'Gazebo has its own transport and messages; only a bridge carries /cmd_vel across',
      'Gazebo only listens to topics in the /gz namespace',
      'The robot needs to be respawned first',
      'Gazebo reads commands from files, not topics',
    ],
    answer: 0,
    explain: 'gz-transport and ROS 2 are separate systems that happen to both use topics. parameter_bridge translates the topics you list, in the directions you give.',
  },
  {
    prompt: 'What does the rule /odom@nav_msgs/msg/Odometry[gz.msgs.Odometry say?',
    options: [
      'Carry /odom from Gazebo to ROS, as Odometry messages on each side',
      'Carry /odom from ROS to Gazebo',
      'Carry /odom both ways',
      'Rename /odom to /nav_msgs',
    ],
    answer: 0,
    explain: '[ is Gazebo to ROS, ] is ROS to Gazebo, @ is both ways. The type before the sign is the ROS type, the one after it the Gazebo type.',
  },
  {
    prompt: 'Why should robot_state_publisher run with use_sim_time: true here?',
    options: [
      'Its transforms must carry the simulation’s time, the time on /clock and on every message from Gazebo',
      'Otherwise it cannot read the URDF',
      'So that it runs faster than real time',
      'It need not: time does not matter in simulation',
    ],
    answer: 0,
    explain: 'Gazebo stamps everything with simulated time, which starts at zero. A node on the computer’s clock would stamp its data with today’s date, and lookups mixing the two fail, as in Lesson 6.',
  },
  {
    prompt: 'You stop publishing /cmd_vel. What does the rover do?',
    options: [
      'It keeps driving with the last command it got',
      'It stops at once',
      'It drives back to where it started',
      'Gazebo pauses the simulation',
    ],
    answer: 0,
    explain: 'The recording shows it: odometry read a few seconds after the last command had the rover more than half a metre further on. Send a zero Twist to stop, as teleop_twist_keyboard does when you press k.',
  },
  {
    prompt: 'Two wheels 0.34 m apart turn at the same speed in opposite directions. What does the robot do?',
    options: ['Turns on the spot', 'Drives straight', 'Drives a wide circle', 'Nothing: the speeds cancel'],
    answer: 0,
    explain: 'Its forward speed is the average of the wheel speeds, zero, and its turn rate is their difference divided by the separation, not zero.',
  },
]
