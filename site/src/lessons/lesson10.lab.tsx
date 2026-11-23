import { isName, numberIn, tidy } from '../lab/answers'
import type { LabQuestion } from '../lab/LabQuestions'
import { lesson10 } from '../transcripts'

// The Lesson 10 lab: a speed limiter with a mode service of the reader's own.
// labs/lesson10/check.py runs it and calls the service. Answers are pinned by
// lesson10.test.ts.

const run = (id: string) => lesson10.runs[id]

export const lesson10Lab: LabQuestion[] = [
  {
    prompt: (
      <p>
        What does <code>/add_two_ints</code> answer to <code>{'{a: 2, b: 3}'}</code>?
      </p>
    ),
    placeholder: 'A number',
    check: (a) => numberIn(a) === 5,
    answer: 'sum=5',
    how: [run('add-call')],
  },
  {
    prompt: <p>Which service type does the counter&apos;s /reset have?</p>,
    placeholder: 'A type',
    check: (a) => tidy(a) === 'std_srvs/srv/trigger',
    answer: 'std_srvs/srv/Trigger',
    how: [run('counter-info')],
  },
  {
    prompt: (
      <p>
        <code>/set_step</code> with a step of 500: what is <code>accepted</code>?
      </p>
    ),
    placeholder: 'True or False',
    check: (a) => /false|no/.test(tidy(a)),
    answer: 'False: the server refused it and said why in message',
    how: [run('call-step-bad')],
  },
  {
    prompt: <p>Which node offers the service that the step_client calls?</p>,
    placeholder: 'A node name',
    check: (a) => isName(a, '/counter'),
    answer: '/counter',
    how: [run('counter-info')],
  },
  {
    prompt: (
      <p>
        Run <code>python3 /labs/lesson10/check.py</code>. How many checks pass?
      </p>
    ),
    placeholder: 'A number',
    check: (a) => numberIn(a) === 8,
    answer: '8 of 8',
    how: [run('lab-check')],
  },
]
