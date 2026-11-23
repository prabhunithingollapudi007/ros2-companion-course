import { isName, numberIn, tidy } from '../lab/answers'
import type { LabQuestion } from '../lab/LabQuestions'
import { lesson09 } from '../transcripts'

// The Lesson 9 lab: the Lesson 7 quad, driving in a Gazebo world of the reader's
// own. labs/lesson09/check.py launches it headless and drives it.
// Answers are pinned by lesson09.test.ts.

const run = (id: string) => lesson09.runs[id]

/** How far forward the rover got in the recording, from its odometry. */
export const recordedDistance = () => {
  const x = (id: string) => Number(/x: (-?[\d.e-]+)/.exec(run(id).output)?.[1])
  return x('odom-after') - x('odom-before')
}

export const lesson09Lab: LabQuestion[] = [
  {
    prompt: <p>Which ROS topic carries the simulation&apos;s time?</p>,
    placeholder: 'A topic name',
    check: (a) => isName(a, '/clock'),
    answer: '/clock, bridged from Gazebo',
    how: [run('sim-clock')],
  },
  {
    prompt: (
      <p>
        What does <code>ros2 param get /robot_state_publisher use_sim_time</code> print?
      </p>
    ),
    placeholder: 'True or False',
    check: (a) => /true/.test(tidy(a)),
    answer: 'Boolean value is: True',
    how: [run('sim-param')],
  },
  {
    prompt: (
      <p>
        Three seconds of <code>/cmd_vel</code> at 0.4 m/s: roughly how far forward does <code>/odom</code> say the rover went, in
        metres?
      </p>
    ),
    placeholder: 'A number',
    check: (a) => {
      const n = numberIn(a)
      return n !== null && n >= 1 && n <= 2
    },
    answer: 'about 1.2 to 1.7: 0.4 m/s for the 3 s of commands, plus the time it kept going until the reading',
    how: [run('odom-before'), run('drive-pub'), run('odom-after')],
  },
  {
    prompt: <p>In a bridge rule, which sign means &quot;from ROS to Gazebo only&quot;?</p>,
    placeholder: 'One character',
    check: (a) => a.trim() === ']',
    answer: '] (and [ means Gazebo to ROS, @ both ways)',
    how: [run('bridge-both')],
  },
  {
    prompt: (
      <p>
        Run <code>python3 /labs/lesson09/check.py</code>. How many checks pass?
      </p>
    ),
    placeholder: 'A number',
    check: (a) => numberIn(a) === 9,
    answer: '9 of 9',
    how: [run('lab-check')],
  },
]
