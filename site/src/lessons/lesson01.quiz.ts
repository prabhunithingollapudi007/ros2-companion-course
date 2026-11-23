import type { Question } from '../components/Quiz'

export const lesson01Quiz: Question[] = [
  {
    prompt: 'What does ROS mainly give a robot project?',
    options: [
      'A standard way for separate programs to exchange data, plus tools and ready-made packages',
      'An operating system kernel for robot computers',
      'A simulator that replaces the real robot',
      'A programming language for robots',
    ],
    answer: 0,
    explain: 'ROS is communication, client libraries, tools and a large set of shared packages. It runs on an ordinary operating system, here Ubuntu, and Gazebo, the simulator, is a separate project it works with.',
  },
  {
    prompt: 'Why does this course use ROS 2 Jazzy rather than ROS 1?',
    options: [
      'ROS 1 ended with Noetic, whose support finished in May 2025; Jazzy is a long-term ROS 2 release supported until May 2029',
      'ROS 1 only runs in a simulator',
      'Jazzy is the only ROS 2 release',
      'ROS 1 cannot run C++ code',
    ],
    answer: 0,
    explain: 'ROS 1 is no longer developed. Since 2022, long-term ROS 2 releases have come every second May with five years of support; Jazzy came out in May 2024.',
  },
  {
    prompt: 'What does source /opt/ros/jazzy/setup.bash do?',
    options: [
      'Sets variables in the current shell, including PATH, so it can find ROS programs and packages',
      'Installs ROS 2',
      'Starts all the ROS nodes on the computer',
      'Downloads the latest packages',
    ],
    answer: 0,
    explain: 'The setup file adds ROS’s folder to PATH and sets variables such as ROS_DISTRO and AMENT_PREFIX_PATH. Nothing is installed or started.',
  },
  {
    prompt: 'You open a new terminal on a computer with ROS installed but nothing added to ~/.bashrc, and type ros2. What happens?',
    options: [
      'command not found: the settings from sourcing belong to the terminal they were made in',
      'It works, because ROS was sourced in another terminal earlier',
      'It works, because installing ROS sets it up for every terminal',
      'It asks which release to use',
    ],
    answer: 0,
    explain: 'Each shell has its own variables. Source the setup file in every new terminal, or put the line in ~/.bashrc so new terminals do it themselves. The course container already does that.',
  },
  {
    prompt: 'In ros2 run demo_nodes_cpp talker, what are demo_nodes_cpp and talker?',
    options: ['A package and a program in it', 'A program and its argument', 'A node and a topic', 'A folder and a file inside the container'],
    answer: 0,
    explain: 'ros2 run takes a package name and the name of one of its executables. ros2 pkg executables lists what a package contains.',
  },
  {
    prompt: 'The talker and the listener are running and you stop the talker. What happens to the listener?',
    options: [
      'It keeps running and prints nothing until a talker publishes again',
      'It stops too',
      'It prints an error and exits',
      'It has to be restarted before it can hear a new talker',
    ],
    answer: 0,
    explain: 'Each node is a separate program. The listener simply receives nothing, and when a talker starts again it is found and heard without restarting anything.',
  },
  {
    prompt: 'Why does the course run ROS in a container?',
    options: [
      'Everyone gets the same Ubuntu and ROS versions without installing ROS on their own computer',
      'ROS 2 cannot be installed on Linux',
      'Containers make ROS programs run faster',
      'ROS nodes can only talk to each other inside a container',
    ],
    answer: 0,
    explain: 'ROS 2 Jazzy targets Ubuntu 24.04. A container packs that system and ROS together, so the same commands give the same results on Windows, macOS and Linux. ETH’s course does the same.',
  },
  {
    prompt: 'Which command lists the sub-commands that ros2 understands?',
    options: ['ros2 --help', 'ros2 list', 'ros2 doctor --all', 'source --help'],
    answer: 0,
    explain: 'ros2 --help lists them: node, topic, service, action, param, bag, launch, run and more. ros2 <command> --help explains each one.',
  },
]
