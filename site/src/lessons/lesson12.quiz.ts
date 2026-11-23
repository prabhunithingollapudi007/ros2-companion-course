import type { Question } from '../components/Quiz'

export const lesson12Quiz: Question[] = [
  {
    prompt: 'Whose is a parameter?',
    options: [
      'One node’s: /blinker’s rate is not visible to any other node',
      'The whole ROS graph’s, shared by every node',
      'The package’s, shared by its nodes',
      'The launch file’s',
    ],
    answer: 0,
    explain: 'In ROS 2 each node holds its own parameters and serves them through its parameter services. Two nodes that need the same number each get it, usually from the same YAML file.',
  },
  {
    prompt: 'ros2 run … --ros-args -p rate:=4.0 --params-file porch.yaml, where porch.yaml says rate: 1.0. Which rate does the node start with?',
    options: ['1.0: the last one given wins', '4.0: -p always wins', '2.0: the default', 'It refuses to start'],
    answer: 0,
    explain: 'The recordings show both orders: file then -p gives 4.0, -p then file gives 1.0. Launch files work the same way with the parameters list.',
  },
  {
    prompt: 'ros2 param set /blinker rate 50.0, with a range of 0.5 to 10. What happens?',
    options: [
      'Refused: it doesn’t comply with the range, and the rate stays as it was',
      'Clamped to 10.0',
      'Accepted, and the node crashes',
      'Accepted: ranges are only checked at start',
    ],
    answer: 0,
    explain: 'The range in the descriptor is checked on every change. At start, the same value stops the node with an exception, as the recording shows.',
  },
  {
    prompt: 'What is the on-set callback for, and what is the post-set callback for?',
    options: [
      'On-set says yes or no to a change; post-set acts on a change that was made',
      'On-set runs at start, post-set at shutdown',
      'On-set is for strings, post-set for numbers',
      'They are two names for the same thing',
    ],
    answer: 0,
    explain: 'The blinker refuses an empty label in its on-set callback, and restarts its timer in the post-set callback. Validation must not change anything, because the change may still be refused.',
  },
  {
    prompt: 'Why might a node not notice ros2 param set at all?',
    options: [
      'It read the parameter once into a variable at start, and never looks again',
      'Parameters can only be set from launch files',
      'Because use_sim_time is false',
      'ros2 param set needs the node to be restarted',
    ],
    answer: 0,
    explain: 'The parameter changes; the copy in your variable does not. Either read the parameter when you need it, or update your copy in a post-set callback, as the blinker does.',
  },
  {
    prompt: 'What does ros2 param dump print?',
    options: [
      'Every parameter of the node and its value, as YAML a params file can use',
      'Only the parameters that were changed',
      'The parameter definitions in the C++ code',
      'A list of nodes with parameters',
    ],
    answer: 0,
    explain: 'Dump a node that you have tuned by hand, and you have the YAML file to start it that way next time.',
  },
]
