import { numberIn, tidy } from '../lab/answers'
import type { LabQuestion } from '../lab/LabQuestions'
import { lesson03 } from '../transcripts'

// The Lesson 3 lab: create, build, change and rebuild a C++ package in /labs/ws.
// labs/lesson03/check.py checks the result in the container. Every answer is
// pinned by lesson03.test.ts to what the commands printed there.

const run = (id: string) => lesson03.runs[id]

export const lesson03Lab: LabQuestion[] = [
  {
    prompt: (
      <p>
        After the first build, which folders sit next to <code>src</code> in <code>/labs/ws</code>?
      </p>
    ),
    placeholder: 'Folder names',
    check: (a) => ['build', 'install', 'log'].every((f) => tidy(a).includes(f)),
    answer: 'build, install and log',
    how: [run('lab-build'), run('lab-ls')],
  },
  {
    prompt: (
      <p>
        With the workspace sourced, what does <code>ros2 pkg prefix hello_ros</code> print?
      </p>
    ),
    placeholder: 'A path',
    check: (a) => tidy(a).replace(/\/$/, '') === '/labs/ws/install/hello_ros',
    answer: '/labs/ws/install/hello_ros',
    how: [run('lab-prefix')],
  },
  {
    prompt: (
      <p>
        Change the greeting in <code>hello.cpp</code> and save it, but do not build. What does{' '}
        <code>ros2 run hello_ros hello</code> print now?
      </p>
    ),
    placeholder: 'What it prints',
    check: (a) => tidy(a) === 'hello world hello_ros package',
    answer: 'still the old greeting, hello world hello_ros package',
    how: [run('lab-edited'), run('lab-run-stale')],
  },
  {
    prompt: (
      <p>
        Build again and run it. Then run the checker, <code>python3 /labs/lesson03/check.py</code>. How many checks pass?
      </p>
    ),
    placeholder: 'A number',
    check: (a) => numberIn(a) === 8,
    answer: '8 of 8',
    how: [run('lab-rebuild'), run('lab-run-new'), run('lab-check')],
  },
]
