import type { Question } from '../components/Quiz'

export const lesson05Quiz: Question[] = [
  {
    prompt: 'What does ros2 launch do when you press Ctrl+C?',
    options: [
      'Stops every process the launch file started',
      'Stops only the last node it started',
      'Leaves the nodes running in the background',
      'Restarts the nodes',
    ],
    answer: 0,
    explain: 'Launch keeps track of the processes it started and shuts them all down together. The recording shows ros2 node list empty straight afterwards.',
  },
  {
    prompt: 'A talker in namespace robot1 publishes on the relative name chatter. What is the topic called?',
    options: ['/robot1/chatter', '/chatter', '/robot1/talker/chatter', 'robot1_chatter'],
    answer: 0,
    explain: 'A relative name goes after the node’s namespace. /chatter would need an absolute name in the code, and /robot1/talker/chatter a private one, ~/chatter.',
  },
  {
    prompt: 'The same talker is started with -r chatter:=/news. Where does it publish?',
    options: ['/news', '/robot1/news', '/robot1/chatter', 'Nowhere: the rule is invalid inside a namespace'],
    answer: 0,
    explain: 'The rule’s right-hand side is absolute, so it is used as it is. With chatter:=news, relative, the result would have been /robot1/news.',
  },
  {
    prompt: 'You edit a launch file in src and run ros2 launch again, but nothing has changed. Why?',
    options: [
      'ros2 launch reads the installed copy in install/<package>/share; build again to install the edit',
      'Launch files are cached until the container restarts',
      'You need to source /opt/ros/jazzy/setup.bash again',
      'Launch files only take effect after a reboot',
    ],
    answer: 0,
    explain: 'The CMakeLists.txt line install(DIRECTORY launch DESTINATION share/${PROJECT_NAME}) copies launch files at build time, and ros2 launch looks only in the share folder.',
  },
  {
    prompt: 'How do you find out which arguments a launch file accepts?',
    options: ['ros2 launch <package> <file> --show-args', 'ros2 param list', 'Open install/setup.bash', 'ros2 launch --help-args'],
    answer: 0,
    explain: '--show-args prints each DeclareLaunchArgument with its description and default, without starting anything.',
  },
  {
    prompt: 'Why start the same pair of nodes in two namespaces rather than renaming every topic by hand?',
    options: [
      'A namespace moves all of a node’s relative names at once, so the copies cannot collide',
      'Nodes in different namespaces run faster',
      'ROS refuses to run two nodes from the same program',
      'Namespaces make the topics private to the node',
    ],
    answer: 0,
    explain: 'With the code using relative names, one namespace per robot keeps /left/chatter and /right/chatter apart with no other change. That is why code should use relative names unless it really means one global topic.',
  },
  {
    prompt: 'In a launch file, what does name="speaker" in a Node do?',
    options: [
      'Gives the node a different name, like -r __node:=speaker on the command line',
      'Chooses which program to run',
      'Renames the package',
      'Sets the namespace to /speaker',
    ],
    answer: 0,
    explain: 'executable picks the program; name overrides the node name its code chose. Without it, the code’s name is used.',
  },
  {
    prompt: 'Two nodes in different namespaces need to share one topic. What is the cleanest fix that does not touch their code?',
    options: [
      'Remap the topic in the launch file to the same absolute name for both',
      'Put both nodes in the root namespace',
      'Change ROS_DOMAIN_ID for one of them',
      'Give both nodes the same name',
    ],
    answer: 0,
    explain: 'That is what the lab’s dashboard needs: its robot_a/status and robot_b/status are remapped to /robot1/battery_status and /robot2/battery_status.',
  },
]
