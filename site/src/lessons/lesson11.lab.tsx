import { numberIn, tidy } from '../lab/answers'
import type { LabQuestion } from '../lab/LabQuestions'
import { lesson11 } from '../transcripts'

// The Lesson 11 lab: a battery charger as an action server. labs/lesson11/check.py
// sends it goals with goal_client.py. Answers are pinned by lesson11.test.ts.

const run = (id: string) => lesson11.runs[id]

export const lesson11Lab: LabQuestion[] = [
  {
    prompt: <p>How many action servers does <code>ros2 action info /drive_distance</code> list?</p>,
    placeholder: 'A number',
    check: (a) => numberIn(a) === 1,
    answer: '1: /drive_server',
    how: [run('action-info')],
  },
  {
    prompt: <p>With which status does the goal of 1.0 m finish?</p>,
    placeholder: 'A status',
    check: (a) => tidy(a) === 'succeeded',
    answer: 'SUCCEEDED',
    how: [run('send-goal')],
  },
  {
    prompt: <p>A second goal arrives while the server is driving. What happens to it?</p>,
    placeholder: 'One word',
    check: (a) => /reject/.test(tidy(a)),
    answer: 'It is rejected: the server takes one goal at a time',
    how: [run('send-goal-busy')],
  },
  {
    prompt: <p>How many hidden services make up the action?</p>,
    placeholder: 'A number',
    check: (a) => numberIn(a) === 3,
    answer: '3: send_goal, cancel_goal and get_result (and two topics, feedback and status)',
    how: [run('action-topics')],
  },
  {
    prompt: (
      <p>
        Run <code>python3 /labs/lesson11/check.py</code>. How many checks pass?
      </p>
    ),
    placeholder: 'A number',
    check: (a) => numberIn(a) === 8,
    answer: '8 of 8',
    how: [run('lab-check')],
  },
]
