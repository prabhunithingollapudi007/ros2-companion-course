import type { Question } from '../components/Quiz'

export const lesson17Quiz: Question[] = [
  {
    prompt: 'Why is "drive to (x, y)" an action, not a service?',
    options: [
      'It takes seconds, its progress is worth reporting, and it must be stoppable',
      'Services cannot carry two numbers',
      'Actions are faster',
      'Because Gazebo only accepts actions',
    ],
    answer: 0,
    explain: 'Lesson 11. A service call that took twenty seconds would leave the client blind and unable to stop the robot.',
  },
  {
    prompt: 'go_to publishes on /cmd_vel_in, not /cmd_vel. Why?',
    options: [
      'So its commands pass through the speed limiter and the watchdog, like every other source of commands',
      'Because /cmd_vel is reserved for teleop',
      'Gazebo cannot read /cmd_vel',
      'It makes no difference',
    ],
    answer: 0,
    explain: 'The safety layer of Lesson 13 holds only if nothing goes around it.',
  },
  {
    prompt: 'go_to is cancelled mid-drive. What must it do before reporting canceled?',
    options: ['Publish a stop', 'Nothing: the watchdog will stop the robot', 'Reset odometry', 'Shut down'],
    answer: 0,
    explain: 'The watchdog would stop it half a second later anyway, but a cancel means stop now; the checker tests that the robot has stopped two seconds after.',
  },
  {
    prompt: 'go_to reads /odom in one callback and drives in another thread. What protects the pose they share?',
    options: ['A mutex', 'Nothing is needed', 'A callback group', 'QoS reliability'],
    answer: 0,
    explain: 'Two threads touching the same variables need a lock (Lesson 15). A callback group stops callbacks overlapping, but the drive loop is not a callback.',
  },
  {
    prompt: 'Why record a bag of a run?',
    options: [
      'To check and compare runs afterwards, at a desk, on exactly the same data',
      'Because Gazebo needs it to replay the world',
      'Bags are how actions report results',
      'To make the simulation run faster',
    ],
    answer: 0,
    explain: 'Lesson 6: the path in this lesson is read back out of the bag, and a change to the controller can be judged against it.',
  },
  {
    prompt: 'go_to drives straight through a crate. What would a real robot add?',
    options: [
      'A map and a planner that plans around obstacles, and sensors to see new ones: what Nav2 provides',
      'A higher speed limit',
      'A second watchdog',
      'Nothing: crates move out of the way',
    ],
    answer: 0,
    explain: 'go_to is a controller, not a planner. Nav2 adds maps, localisation, global and local planning and recovery behaviours, behind actions like NavigateToPose.',
  },
]
