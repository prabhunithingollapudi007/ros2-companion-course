import { isName, numberIn } from '../lab/answers'
import type { LabQuestion } from '../lab/LabQuestions'
import { lesson07 } from '../transcripts'

// The Lesson 7 lab: the rover from the lesson, then a four-wheeled robot of the
// reader's own in xacro. labs/lesson07/check.py expands and inspects it.
// Answers are pinned by lesson07.test.ts.

const run = (id: string) => lesson07.runs[id]
const near = (a: string, want: number, tolerance = 0.001) => {
  const n = numberIn(a)
  return n !== null && Math.abs(n - want) <= tolerance
}

export const lesson07Lab: LabQuestion[] = [
  {
    prompt: (
      <p>
        <code>rover.urdf.xacro</code> is 99 lines long. How many lines of URDF does <code>xacro</code> turn it into?
      </p>
    ),
    placeholder: 'A number',
    check: (a) => numberIn(a) === 120,
    answer: '120',
    how: [run('xacro-lines')],
  },
  {
    prompt: <p>Where does the wheel macro put the right wheel: the y of its joint&apos;s origin, in metres?</p>,
    placeholder: 'A number',
    check: (a) => near(a, -0.17),
    answer: '−0.17, printed as -0.16999999999999998: −(0.30/2 + 0.04/2)',
    how: [run('xacro-right')],
  },
  {
    prompt: <p>With the rover launched, which node turns its URDF and joint states into transforms?</p>,
    placeholder: 'A node name',
    check: (a) => isName(a, 'robot_state_publisher'),
    answer: 'robot_state_publisher',
    how: [run('view-nodes')],
  },
  {
    prompt: (
      <p>
        How many children does <code>check_urdf</code> say <code>base_link</code> has?
      </p>
    ),
    placeholder: 'A number',
    check: (a) => numberIn(a) === 4,
    answer: '4: camera, caster and the two wheels',
    how: [run('check-urdf')],
  },
  {
    prompt: (
      <p>
        In your quad, what is <code>izz</code> of <code>base_link</code>, the 6 kg box 0.50 m long and 0.30 m wide, in kg·m²?
      </p>
    ),
    placeholder: 'A number',
    check: (a) => near(a, 0.17),
    answer: '0.17 = 6 × (0.50² + 0.30²) / 12',
    how: [run('lab-inertia')],
  },
  {
    prompt: (
      <p>
        Run <code>python3 /labs/lesson07/check.py</code>. How many checks pass?
      </p>
    ),
    placeholder: 'A number',
    check: (a) => numberIn(a) === 13,
    answer: '13 of 13',
    how: [run('lab-check')],
  },
]
