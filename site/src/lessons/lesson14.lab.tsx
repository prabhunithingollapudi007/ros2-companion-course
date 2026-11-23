import { isName, numberIn, tidy } from '../lab/answers'
import type { LabQuestion } from '../lab/LabQuestions'
import { lesson14 } from '../transcripts'

// The Lesson 14 lab: three silent graphs, fixed with one params file.
// labs/lesson14/check.py runs each with it. Answers are pinned by lesson14.test.ts.

const run = (id: string) => lesson14.runs[id]

export const lesson14Lab: LabQuestion[] = [
  {
    prompt: <p>In the lidar graph, which QoS policy is incompatible?</p>,
    placeholder: 'A policy',
    check: (a) => tidy(a) === 'reliability',
    answer: 'RELIABILITY: the driver offers best effort, the listener asks for reliable',
    how: [run('lab-lidar')],
  },
  {
    prompt: <p>And in the map graph?</p>,
    placeholder: 'A policy',
    check: (a) => tidy(a) === 'durability',
    answer: 'DURABILITY: the planner asks for transient local, the map server offers volatile',
    how: [run('lab-map')],
  },
  {
    prompt: <p>The odom graph prints no warning at all. On which topic does the odometer really publish?</p>,
    placeholder: 'A topic name',
    check: (a) => isName(a, '/robot1/odom'),
    answer: '/robot1/odom: a relative name, in the namespace robot1. The dashboard listens on /odom, which nobody publishes',
    how: [run('lab-odom-topics')],
  },
  {
    prompt: <p>Which middleware does the course container use?</p>,
    placeholder: 'An rmw name',
    check: (a) => tidy(a) === 'rmw_fastrtps_cpp' || /fast ?dds|fastrtps/.test(tidy(a)),
    answer: 'rmw_fastrtps_cpp, Fast DDS',
    how: [run('doctor-rmw')],
  },
  {
    prompt: (
      <p>
        Run <code>python3 /labs/lesson14/check.py</code>. How many checks pass?
      </p>
    ),
    placeholder: 'A number',
    check: (a) => numberIn(a) === 5,
    answer: '5 of 5',
    how: [run('lab-check')],
  },
]
