import { isName, numberIn, tidy } from '../lab/answers'
import type { LabQuestion } from '../lab/LabQuestions'
import { lesson16 } from '../transcripts'

// The Lesson 16 lab: the ROS 1 heartbeat, ported. labs/lesson16/check.py runs the
// port. Answers are pinned by lesson16.test.ts.

const run = (id: string) => lesson16.runs[id]

export const lesson16Lab: LabQuestion[] = [
  {
    prompt: <p>The ported odom_logger&apos;s launch file remaps odom. Which topic does the node subscribe to?</p>,
    placeholder: 'A topic name',
    check: (a) => isName(a, '/rover/odom'),
    answer: '/rover/odom',
    how: [run('port-info')],
  },
  {
    prompt: <p>After the positions 0, 0.5, 1.0 and 1.5 m, what distance does it publish?</p>,
    placeholder: 'A number',
    check: (a) => numberIn(a) === 1.5,
    answer: '1.5 m',
    how: [run('port-drive'), run('port-distance')],
  },
  {
    prompt: <p>In the ROS 1 launch file, which attribute names the program to run, and what is it called in ROS 2?</p>,
    placeholder: 'Two words',
    check: (a) => /type/.test(tidy(a)) && /exec/.test(tidy(a)),
    answer: 'type, which ROS 2 calls exec',
    how: [],
  },
  {
    prompt: (
      <p>
        Run <code>python3 /labs/lesson16/check.py</code> on your port. How many checks pass?
      </p>
    ),
    placeholder: 'A number',
    check: (a) => numberIn(a) === 7,
    answer: '7 of 7',
    how: [run('lab-check')],
  },
]
