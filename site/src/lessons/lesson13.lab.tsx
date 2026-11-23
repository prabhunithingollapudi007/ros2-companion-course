import { isName, numberIn, tidy } from '../lab/answers'
import type { LabQuestion } from '../lab/LabQuestions'
import { lesson13 } from '../transcripts'

// The Lesson 13 lab: a command watchdog added to the rover's stack.
// labs/lesson13/check.py tests the node alone, then the whole stack in Gazebo.
// Answers are pinned by lesson13.test.ts.

const run = (id: string) => lesson13.runs[id]

export const lesson13Lab: LabQuestion[] = [
  {
    prompt: <p>In the stack, which topic does the speed limiter publish its commands on?</p>,
    placeholder: 'A topic name',
    check: (a) => isName(a, '/cmd_vel'),
    answer: '/cmd_vel: its cmd_vel_out, remapped in stack.launch.py',
    how: [run('limiter-info')],
  },
  {
    prompt: <p>Two seconds after the last command, how fast is the rover going, in m/s?</p>,
    placeholder: 'A number',
    check: (a) => {
      const n = numberIn(a)
      return n !== null && Math.abs(n - 0.8) < 0.05
    },
    answer: '0.8: still the speed limit. Nothing told it to stop',
    how: [run('stack-speed'), run('stack-speed-later')],
  },
  {
    prompt: (
      <p>
        A new requirement: a stop button on a web page, which must stop the robot whatever else is going on. Topic, service,
        action or parameter?
      </p>
    ),
    placeholder: 'One word',
    check: (a) => tidy(a) === 'topic',
    answer: 'A topic, which the safety layer listens to: an event for any node that cares, with no reply to wait for',
    how: [],
  },
  {
    prompt: (
      <p>
        Run <code>python3 /labs/lesson13/check.py</code>. How many checks pass?
      </p>
    ),
    placeholder: 'A number',
    check: (a) => numberIn(a) === 8,
    answer: '8 of 8',
    how: [run('lab-check')],
  },
]
