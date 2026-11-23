import { isName, numberIn, tidy } from '../lab/answers'
import type { LabQuestion } from '../lab/LabQuestions'
import { lesson08 } from '../transcripts'

// The Lesson 8 lab: placing camera detections on the map with tf2.
// labs/lesson08/check.py runs the reader's node against lab_world.py.
// Answers are pinned by lesson08.test.ts.

const run = (id: string) => lesson08.runs[id]
const near = (a: string, want: number, tolerance: number) => {
  const n = numberIn(a)
  return n !== null && Math.abs(n - want) <= tolerance
}

export const lesson08Lab: LabQuestion[] = [
  {
    prompt: (
      <p>
        In the demo&apos;s frame tree, which frame is <code>base_link</code>&apos;s parent?
      </p>
    ),
    placeholder: 'A frame name',
    check: (a) => isName(a, 'odom'),
    answer: 'odom',
    how: [run('world-frames')],
  },
  {
    prompt: (
      <p>
        map → odom is x 0.5, y −0.2, yaw 0.3 rad. What x does <code>tf2_echo odom map</code>, the other way round, print?
      </p>
    ),
    placeholder: 'A number',
    check: (a) => near(a, -0.419, 0.002),
    answer: '−0.419: turning back by 0.3 rad and moving back by (0.5, −0.2) is not just (−0.5, 0.2)',
    how: [run('tf2-echo-inverse')],
  },
  {
    prompt: <p>What is w in the quaternion for that yaw of 0.3 rad?</p>,
    placeholder: 'A number',
    check: (a) => near(a, 0.98877, 0.001),
    answer: '0.9888 = cos(0.15)',
    how: [run('tf-static-echo')],
  },
  {
    prompt: (
      <p>
        <code>where_is</code> with <code>ask_ahead:=0.5</code> asks about half a second from now. Into which direction would tf2 have
        to extrapolate?
      </p>
    ),
    placeholder: 'One word',
    check: (a) => /future/.test(tidy(a)),
    answer: 'the future: it refuses, because the newest transform it has is older than that',
    how: [run('where-is-ahead')],
  },
  {
    prompt: (
      <p>
        Run <code>python3 /labs/lesson08/check.py</code>. How many checks pass?
      </p>
    ),
    placeholder: 'A number',
    check: (a) => numberIn(a) === 7,
    answer: '7 of 7',
    how: [run('lab-check')],
  },
]
