import type { Question } from '../components/Quiz'

export const lesson07Quiz: Question[] = [
  {
    prompt: 'A link has a visual and a collision description. Why two?',
    options: [
      'Visual is what you see; collision is a simpler shape that is cheap to test for contact',
      'Visual is for RViz and collision is for Gazebo, and they must be identical',
      'Collision is only needed for links that move',
      'Visual is in metres and collision in millimetres',
    ],
    answer: 0,
    explain: 'A detailed mesh looks right but is slow to test for contact, so a box, cylinder or sphere usually stands in for it. The rover uses the same shapes for both because its shapes are already simple.',
  },
  {
    prompt: 'A joint’s origin is xyz="0.1 0.17 0". In which frame are those numbers?',
    options: ["The parent link's frame", "The child link's frame", 'The world frame', 'The frame of the first link in the file'],
    answer: 0,
    explain: 'A joint places its child relative to its parent. That is why moving the base moves everything attached to it, and why the tree needs no world coordinates at all.',
  },
  {
    prompt: 'Which joint type suits a wheel?',
    options: ['continuous', 'revolute', 'prismatic', 'fixed'],
    answer: 0,
    explain: 'A wheel turns any number of times. Revolute is for joints with limits, like the camera’s ±90°; prismatic slides; fixed does not move.',
  },
  {
    prompt: 'Why must the links of a URDF form a tree?',
    options: [
      'Each link has exactly one parent, so its pose follows from the joints on one path from the root',
      'Because XML can only describe trees',
      'So that RViz can draw them in order',
      'It need not: links may have two parents to close a loop',
    ],
    answer: 0,
    explain: 'With one parent per link there is exactly one chain of joints from the root to any link, and multiplying its transforms gives the link’s pose. URDF cannot describe closed loops for this reason.',
  },
  {
    prompt: 'Who reads the xacro file?',
    options: [
      'Only xacro: it expands properties, maths and macros into plain URDF, which is all robot_state_publisher sees',
      'robot_state_publisher, which understands xacro directly',
      'RViz, when it loads the RobotModel display',
      'colcon, when it builds the package',
    ],
    answer: 0,
    explain: 'In view.launch.py, Command([\'xacro \', model]) runs xacro when the launch starts and passes its output, an ordinary URDF, as the robot_description parameter.',
  },
  {
    prompt: 'You turn the wheel sliders in joint_state_publisher_gui. What happens to the rover in RViz?',
    options: [
      'The wheels spin in place; the rover does not move',
      'The rover drives forward',
      'Nothing: wheels are continuous joints and cannot be shown',
      'The rover tips over',
    ],
    answer: 0,
    explain: 'Joint states only say how each part sits relative to its parent. Where the whole robot is in the world is a different question, answered by odometry or localisation, in Lessons 8 and 9.',
  },
  {
    prompt: 'Which joints appear in /joint_states?',
    options: ['The movable ones: both wheels and camera_pan', 'All four, including caster_joint', 'Only camera_pan, because it has limits', 'None until the robot moves'],
    answer: 0,
    explain: 'A fixed joint has no position to report. robot_state_publisher publishes the fixed ones once on /tf_static and the moving ones on /tf whenever joint states arrive.',
  },
]
