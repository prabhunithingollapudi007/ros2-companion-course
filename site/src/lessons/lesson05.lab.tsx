import { numberIn, tidy } from '../lab/answers'
import type { LabQuestion } from '../lab/LabQuestions'
import { lesson05 } from '../transcripts'

// The Lesson 5 lab: one launch file for a two-robot fleet and a dashboard.
// labs/lesson05/check.py launches it twice in the container. Every answer is
// pinned by lesson05.test.ts to what was recorded there.

const run = (id: string) => lesson05.runs[id]

export const lesson05Lab: LabQuestion[] = [
  {
    prompt: (
      <p>
        With your launch file running, how many nodes does <code>ros2 node list</code> show?
      </p>
    ),
    placeholder: 'A number',
    check: (a) => numberIn(a) === 5,
    answer: '5',
    how: [run('lab-nodes')],
  },
  {
    prompt: (
      <p>
        Launched with <code>second_robot:=rover</code>, what is the full name of the second robot&apos;s monitor?
      </p>
    ),
    placeholder: 'A node name',
    check: (a) => tidy(a) === '/rover/monitor',
    answer: '/rover/monitor',
    how: [run('lab-check')],
  },
  {
    prompt: (
      <p>
        Which topics does <code>/dashboard</code> subscribe to, as <code>ros2 node info /dashboard</code> shows them?
      </p>
    ),
    placeholder: 'Two topic names',
    check: (a) => tidy(a).includes('/robot1/battery_status') && tidy(a).includes('/robot2/battery_status'),
    answer: '/robot1/battery_status and /robot2/battery_status',
    how: [run('lab-dashboard-info')],
  },
  {
    prompt: (
      <p>
        Run <code>python3 /labs/lesson05/check.py</code>. How many checks pass?
      </p>
    ),
    placeholder: 'A number',
    check: (a) => numberIn(a) === 13,
    answer: '13 of 13',
    how: [run('lab-check')],
  },
]
