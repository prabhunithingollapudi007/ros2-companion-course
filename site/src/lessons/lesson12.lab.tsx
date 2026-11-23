import { numberIn, tidy } from '../lab/answers'
import type { LabQuestion } from '../lab/LabQuestions'
import { lesson12 } from '../transcripts'

// The Lesson 12 lab: the speed limiter's limits as parameters, with a YAML file
// and a launch file. labs/lesson12/check.py sets and reads them. Answers are
// pinned by lesson12.test.ts.

const run = (id: string) => lesson12.runs[id]

export const lesson12Lab: LabQuestion[] = [
  {
    prompt: <p>What is the blinker&apos;s rate by default?</p>,
    placeholder: 'A number',
    check: (a) => numberIn(a) === 2,
    answer: '2.0',
    how: [run('param-get')],
  },
  {
    prompt: (
      <p>
        <code>--params-file porch.yaml -p rate:=4.0</code>: which rate does it start with?
      </p>
    ),
    placeholder: 'A number',
    check: (a) => numberIn(a) === 4,
    answer: '4.0: the -p comes last',
    how: [run('start-file-then-p')],
  },
  {
    prompt: (
      <p>
        Setting <code>rate</code> to <code>fast</code> fails. Why?
      </p>
    ),
    placeholder: 'A few words',
    check: (a) => /type|string|double/.test(tidy(a)),
    answer: 'Wrong type: rate is a double, and a string is not allowed',
    how: [run('param-set-type')],
  },
  {
    prompt: <p>What is the largest careful_speed the lab&apos;s node will accept?</p>,
    placeholder: 'A number',
    check: (a) => numberIn(a) === 1,
    answer: '1.0, its range, as long as normal_speed is at least that',
    how: [run('lab-describe')],
  },
  {
    prompt: (
      <p>
        Run <code>python3 /labs/lesson12/check.py</code>. How many checks pass?
      </p>
    ),
    placeholder: 'A number',
    check: (a) => numberIn(a) === 7,
    answer: '7 of 7',
    how: [run('lab-check')],
  },
]
