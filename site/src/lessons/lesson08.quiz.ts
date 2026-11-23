import type { Question } from '../components/Quiz'

export const lesson08Quiz: Question[] = [
  {
    prompt: 'What does a transform from map to odom say?',
    options: [
      "Where the odom frame is, and how it is turned, in map's coordinates",
      'How to convert a point from map coordinates to odom coordinates, and nothing else',
      'Which of the two frames is newer',
      'The distance the robot has driven',
    ],
    answer: 0,
    explain: 'A transform from parent to child is the child frame’s pose in the parent. The same numbers convert a point given in the child frame into the parent frame; tf2 inverts them when you ask the other way round.',
  },
  {
    prompt: 'Why must frames form a tree, with one parent per frame?',
    options: [
      'So that there is exactly one chain of transforms between any two frames, and no conflicting answers',
      'Because /tf can only carry one transform per message',
      'So that RViz can lay them out',
      'They need not; tf2 averages the paths',
    ],
    answer: 0,
    explain: 'With one parent each, tf2 finds the path between two frames by walking up to their common ancestor. That is also why each frame’s link to its parent should come from one node only.',
  },
  {
    prompt: 'Which topic carries the transform between base_link and the caster, a fixed joint?',
    options: ['/tf_static, once, kept for anyone who joins later', '/tf, 50 times a second', '/joint_states', '/robot_description'],
    answer: 0,
    explain: 'Transforms that never change are sent once on /tf_static, whose publisher keeps the last message for late subscribers. Moving ones are sent repeatedly on /tf.',
  },
  {
    prompt: 'A detection is stamped 0.3 s ago, in the camera frame. Which transform puts it on the map correctly?',
    options: [
      "The camera's pose at the detection's stamp",
      "The camera's latest pose",
      "The camera's pose when the node started",
      'Any of them: frames do not change over time',
    ],
    answer: 0,
    explain: 'The robot has moved since. buffer.transform() looks the transform up at the message’s own stamp, which is what the lab needs.',
  },
  {
    prompt: 'where_is asked for a transform half a second in the future. What did tf2 do?',
    options: [
      'Refused: lookup would require extrapolation into the future',
      'Predicted it from the robot’s speed',
      'Returned the latest transform instead',
      'Waited half a second, then answered',
    ],
    answer: 0,
    explain: 'tf2 interpolates between samples it has and never extrapolates. With a timeout it would wait for newer data to arrive before giving up; without one it fails at once.',
  },
  {
    prompt: 'A rotation of 0.3 rad about z, as a quaternion, is (0, 0, 0.149, 0.989). Which is the same rotation?',
    options: ['(0, 0, −0.149, −0.989)', '(0, 0, 0.989, 0.149)', '(0, 0, 0.3, 1)', '(0.149, 0, 0, 0.989)'],
    answer: 0,
    explain: 'q and −q describe the same rotation. A rotation by θ about an axis is (axis·sin(θ/2), cos(θ/2)), so 0.3 rad about z gives z = sin 0.15 and w = cos 0.15.',
  },
]
