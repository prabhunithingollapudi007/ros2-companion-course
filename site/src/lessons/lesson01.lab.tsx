import { isName, numberIn, tidy } from '../lab/answers'
import type { LabQuestion } from '../lab/LabQuestions'
import { lesson01 } from '../transcripts'

// The Lesson 1 lab: get the container running, find your way around it, and
// watch what happens when one of two nodes stops. Every answer is pinned by
// lesson01.lab.test.ts to what the commands printed in the course container.

const run = (id: string) => lesson01.runs[id]
const no = (a: string) => /^(no|nope|false)\b/.test(tidy(a))

export const lesson01Lab: LabQuestion[] = [
  {
    prompt: (
      <p>
        Which ROS release is set up in the container? Run <code>echo $ROS_DISTRO</code>.
      </p>
    ),
    placeholder: 'A release name',
    check: (a) => tidy(a) === 'jazzy',
    answer: 'jazzy',
    how: [run('ros-distro')],
  },
  {
    prompt: (
      <p>
        Which version of Ubuntu does the container run? Look in <code>/etc/os-release</code>.
      </p>
    ),
    placeholder: 'A version number',
    check: (a) => tidy(a).includes('24.04') || tidy(a).includes('noble'),
    answer: '24.04',
    how: [run('os-release')],
  },
  {
    prompt: (
      <p>
        How many programs does the <code>demo_nodes_cpp</code> package contain? (<code>ros2 pkg executables</code>{' '}
        lists them, one per line; <code>| wc -l</code> counts lines.)
      </p>
    ),
    placeholder: 'A number',
    check: (a) => numberIn(a) === Number(run('pkg-executables-count').output),
    answer: run('pkg-executables-count').output,
    how: [run('pkg-executables'), run('pkg-executables-count')],
  },
  {
    prompt: (
      <p>
        Start the listener in Terminal 2 and the talker in Terminal 1. Then stop the talker with Ctrl+C and run{' '}
        <code>ros2 node list</code> in Terminal 1. Which node is listed?
      </p>
    ),
    placeholder: 'A node name',
    check: (a) => isName(a, 'listener'),
    answer: '/listener',
    how: [run('after-stop')],
  },
  {
    prompt: <p>Start the talker again. What number is in its first greeting?</p>,
    placeholder: 'A number',
    check: (a) => numberIn(a) === 1,
    answer: "1: 'Hello World: 1'",
    how: [run('talker-again')],
  },
  {
    prompt: <p>Did you have to restart the listener for it to hear the new talker?</p>,
    placeholder: 'Yes or no',
    check: no,
    answer: 'no',
    how: [run('listener')],
  },
  {
    prompt: (
      <p>
        Type <code>env -i bash --norc</code> to open a shell with nothing set up, then <code>ros2 --help</code>. What does
        the shell reply? (Then <code>source /opt/ros/jazzy/setup.bash</code>, try again, and <code>exit</code> back to the
        normal shell.)
      </p>
    ),
    placeholder: 'What it says',
    check: (a) => tidy(a).includes('not found'),
    answer: 'ros2: command not found',
    how: [run('lab-clean-shell')],
  },
]
