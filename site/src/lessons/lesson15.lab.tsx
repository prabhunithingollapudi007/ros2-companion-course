import { numberIn, tidy } from '../lab/answers'
import type { LabQuestion } from '../lab/LabQuestions'
import { lesson15 } from '../transcripts'

// The Lesson 15 lab: a battery monitor that freezes, fixed. labs/lesson15/check.py
// runs it with the estimator. Answers are pinned by lesson15.test.ts.

const run = (id: string) => lesson15.runs[id]

export const lesson15Lab: LabQuestion[] = [
  {
    prompt: <p>With one thread, how many times does busy_node&apos;s slow timer run in 4.5 s?</p>,
    placeholder: 'A number',
    check: (a) => numberIn(a) === 2,
    answer: '2: at 2 s and at 4 s',
    how: [run('busy-1-same')],
  },
  {
    prompt: <p>Which setup lets the fast timer keep ticking while the slow one works?</p>,
    placeholder: 'A few words',
    check: (a) => /separate|own group|groups/.test(tidy(a)) && /(two|2|multi)/.test(tidy(a)),
    answer: 'Two threads and a callback group for each timer: busy_node 2 separate',
    how: [run('busy-2-same'), run('busy-2-separate')],
  },
  {
    prompt: <p>The frozen battery_monitor is asked for its parameters with a 5 s timeout. What exit code does timeout give?</p>,
    placeholder: 'A number',
    check: (a) => numberIn(a) === 124,
    answer: '124: the time ran out; the node never answered',
    how: [run('lab-frozen-params')],
  },
  {
    prompt: (
      <p>
        Run <code>python3 /labs/lesson15/check.py</code> after your fix. How many checks pass?
      </p>
    ),
    placeholder: 'A number',
    check: (a) => numberIn(a) === 5,
    answer: '5 of 5',
    how: [run('lab-check')],
  },
]
