import { isName, numberIn, tidy } from '../lab/answers'
import type { LabQuestion } from '../lab/LabQuestions'
import { lesson02 } from '../transcripts'

// The Lesson 2 lab: find out what labs/lesson02/mystery_graph.py does using only
// the ros2 command. Every answer here is pinned by lesson02.lab.test.ts to what
// the commands printed in the course container.

const run = (id: string) => lesson02.runs[id]

export const lesson02Lab: LabQuestion[] = [
  {
    prompt: <p>How many nodes make up the robot's software?</p>,
    placeholder: 'A number',
    check: (a) => numberIn(a) === 7,
    answer: '7',
    how: [run('lab-node-list')],
  },
  {
    prompt: (
      <p>
        Which node publishes the laser scans on <code>/scan</code>?
      </p>
    ),
    placeholder: 'A node name',
    check: (a) => isName(a, 'lidar'),
    answer: '/lidar',
    how: [run('lab-scan-info')],
  },
  {
    prompt: (
      <p>
        What message type does <code>/odom</code> carry? Give its full name.
      </p>
    ),
    placeholder: 'package/msg/Type',
    check: (a) => ['nav_msgs/msg/odometry', 'nav_msgs/odometry'].includes(tidy(a)),
    answer: 'nav_msgs/msg/Odometry',
    how: [run('lab-odom-type')],
  },
  {
    prompt: (
      <p>
        Two nodes publish on <code>/cmd_vel</code>. Which two?
      </p>
    ),
    placeholder: 'Two node names',
    check: (a) => /\bplanner\b/.test(tidy(a)) && /\bsafety[_ ]stop\b/.test(tidy(a)),
    answer: '/planner and /safety_stop',
    how: [run('lab-cmd-vel-info'), run('lab-cmd-vel-who')],
  },
  {
    prompt: (
      <p>
        How many times a second is <code>/joint_states</code> published? Round to a whole number.
      </p>
    ),
    placeholder: 'A number, in hertz',
    check: (a) => numberIn(a) === 50,
    answer: '50 Hz',
    how: [run('lab-joint-hz')],
  },
  {
    prompt: (
      <p>
        Leaving out <code>/parameter_events</code> and <code>/rosout</code>, which ROS itself uses, one topic is
        published but nothing subscribes to it. Which?
      </p>
    ),
    placeholder: 'A topic name',
    check: (a) => isName(a, '/battery'),
    answer: '/battery',
    how: [run('lab-all-counts')],
  },
  {
    prompt: <p>One topic has a subscriber but nothing publishing to it, so the node listening on it is waiting for someone else to speak. Which?</p>,
    placeholder: 'A topic name',
    check: (a) => isName(a, '/emergency_stop'),
    answer: '/emergency_stop',
    how: [run('lab-all-counts'), run('lab-estop-info')],
  },
  {
    prompt: <p>What forward speed is the robot being told to drive at, in metres per second?</p>,
    placeholder: 'A number',
    check: (a) => numberIn(a) === 0.25,
    answer: '0.25 m/s',
    how: [run('lab-cmd-vel-echo')],
  },
  {
    prompt: (
      <p>
        Publish one message on the topic from question 7, from the terminal. What does <code>/motor_state</code> say
        afterwards? (Start the robot again with Ctrl+C and the same command to undo it.)
      </p>
    ),
    placeholder: 'One word',
    check: (a) => tidy(a).replace(/^data:\s*/, '') === 'stopped',
    answer: 'stopped',
    how: [run('lab-motor-before'), run('lab-estop-pub'), run('lab-motor-after')],
  },
]
