import { numberIn, tidy } from '../lab/answers'
import type { LabQuestion } from '../lab/LabQuestions'
import { lesson04 } from '../transcripts'

// The Lesson 4 lab: a C++ node that turns battery voltage into a status
// message of your own. labs/lesson04/check.py checks it in the container.
// Every answer is pinned by lesson04.test.ts to what was recorded there.

const run = (id: string) => lesson04.runs[id]
const yes = (a: string) => /^(yes|true|low)\b/.test(tidy(a))

export const lesson04Lab: LabQuestion[] = [
  {
    prompt: (
      <p>
        Which header does your node include to use <code>BatteryStatus</code>? Give the path inside the quotes.
      </p>
    ),
    placeholder: 'package/msg/....hpp',
    check: (a) => tidy(a).replace(/^#include\s*["<]?|[">]$/g, '') === 'power_monitor/msg/battery_status.hpp',
    answer: 'power_monitor/msg/battery_status.hpp',
    how: [run('generated-headers')],
  },
  {
    prompt: (
      <p>
        With the simulator and your node running, what percentage does your node report when the battery is at 22.4 V?
      </p>
    ),
    placeholder: 'A number',
    check: (a) => {
      const n = numberIn(a)
      return n !== null && Math.abs(n - 33.33) < 0.06
    },
    answer: '33.33 %',
    how: [run('lab-echo')],
  },
  {
    prompt: <p>Is the battery reported as low at 21.6 V?</p>,
    placeholder: 'Yes or no',
    check: yes,
    answer: 'yes: 14.29 % is below 20 %',
    how: [run('lab-echo')],
  },
  {
    prompt: (
      <p>
        What does <code>ros2 topic type /battery_status</code> print?
      </p>
    ),
    placeholder: 'A message type',
    check: (a) => tidy(a) === 'power_monitor/msg/batterystatus',
    answer: 'power_monitor/msg/BatteryStatus',
    how: [run('lab-check')],
  },
  {
    prompt: (
      <p>
        Run <code>python3 /labs/lesson04/check.py</code>. How many checks pass?
      </p>
    ),
    placeholder: 'A number',
    check: (a) => numberIn(a) === 11,
    answer: '11 of 11',
    how: [run('lab-check')],
  },
]
