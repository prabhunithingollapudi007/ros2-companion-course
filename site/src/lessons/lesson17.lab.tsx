import { isName, numberIn, tidy } from '../lab/answers'
import type { LabQuestion } from '../lab/LabQuestions'
import { lesson17 } from '../transcripts'

// The Lesson 17 capstone. labs/lesson17/check.py drives the reader's go_to in
// Gazebo. Answers are pinned by lesson17.test.ts.

const run = (id: string) => lesson17.runs[id]

export const lesson17Lab: LabQuestion[] = [
  {
    prompt: <p>With the capstone running, which node offers the /go_to action?</p>,
    placeholder: 'A node name',
    check: (a) => isName(a, '/go_to'),
    answer: '/go_to',
    how: [run('cap-nodes'), run('cap-actions')],
  },
  {
    prompt: <p>With which status does the goal (2, −1) finish?</p>,
    placeholder: 'A status',
    check: (a) => tidy(a) === 'succeeded',
    answer: 'SUCCEEDED, with reached: True',
    how: [run('cap-goal')],
  },
  {
    prompt: <p>Which three topics are in the recorded bag?</p>,
    placeholder: 'Topic names',
    check: (a) => ['/odom', '/cmd_vel', '/cmd_vel_in'].every((t) => tidy(a).includes(t.slice(1))) && !/limited/.test(tidy(a)),
    answer: '/odom, /cmd_vel and /cmd_vel_in',
    how: [run('cap-bag')],
  },
  {
    prompt: (
      <p>
        Run <code>python3 /labs/lesson17/check.py</code>. How many checks pass?
      </p>
    ),
    placeholder: 'A number',
    check: (a) => numberIn(a) === 8,
    answer: '8 of 8',
    how: [run('lab-check')],
  },
]
