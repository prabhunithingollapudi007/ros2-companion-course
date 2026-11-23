import type { Question } from '../components/Quiz'

export const lesson13Quiz: Question[] = [
  {
    prompt: 'Why put the speed limit in a node of its own, rather than in teleop and in the planner?',
    options: [
      'One node enforces it whatever sends commands, and it can be tested and configured in one place',
      'Because C++ nodes cannot share code',
      'Nodes run faster when they do less',
      'ROS requires one node per topic',
    ],
    answer: 0,
    explain: 'Anything that sends commands goes through it. A limit copied into every source is a limit someone forgets to copy into the next one.',
  },
  {
    prompt: 'The speed limiter publishes cmd_vel_out. How does it end up driving /cmd_vel without changing its code?',
    options: ['A remapping in the launch file', 'A parameter', 'A symbolic link', 'It cannot: the topic name must be changed in the code'],
    answer: 0,
    explain: 'remappings=[(\'cmd_vel_out\', \'cmd_vel\')] in stack.launch.py: Lesson 5. Nodes with generic names are easy to put anywhere in a chain.',
  },
  {
    prompt: 'In the recording, commands stopped, yet two seconds later the rover was still doing 0.8 m/s. Which layer should fix that?',
    options: [
      'Safety: a watchdog that sends stops when commands stop, whatever sends them',
      'Interfaces: teleop should send a stop when you let go',
      'Drivers: Gazebo should be changed',
      'Estimation: odometry is wrong',
    ],
    answer: 0,
    explain: 'Teleop could send a stop, but a crashed teleop, a dropped network link or a stuck planner would not. The safety layer must not depend on the good behaviour of the layers above it.',
  },
  {
    prompt: 'What is a bringup package, like rover_stack?',
    options: [
      'A package with no code of its own: launch files and configuration that start the robot',
      'A package that installs ROS',
      'The package with the robot’s URDF',
      'A test package',
    ],
    answer: 0,
    explain: 'It depends on the packages that do the work and decides how they are started and configured for one robot. Another robot reuses the same nodes with a bringup of its own.',
  },
  {
    prompt: 'Why keep the settings of every node in one stack.yaml, keyed by node name?',
    options: [
      'Everything that makes this robot this robot is in one file you can read, diff and swap',
      'Nodes can only read one YAML file',
      'It makes the nodes start faster',
      'ROS merges all YAML files anyway',
    ],
    answer: 0,
    explain: 'The code stays general; the file holds the choices. A second robot, or the same robot in simulation, gets a second file.',
  },
]
