import type { Question } from '../components/Quiz'

export const lesson15Quiz: Question[] = [
  {
    prompt: 'What does an executor do?',
    options: [
      'Watches for timers that are due and messages, requests and answers that have arrived, and runs their callbacks on its threads',
      'Compiles callbacks before they run',
      'Sends messages to other nodes',
      'Decides which node may use the network',
    ],
    answer: 0,
    explain: 'rclcpp::spin(node) creates a single-threaded executor. Nothing in a node runs except when an executor calls it.',
  },
  {
    prompt: 'With a SingleThreadedExecutor, a callback sleeps for 1.5 s. What happens to a 10 Hz timer in the same node?',
    options: [
      'It does not run for 1.5 s, then fires once, not 15 times',
      'It runs on schedule on another thread',
      'It runs 15 times in a burst afterwards',
      'It is cancelled',
    ],
    answer: 0,
    explain: 'busy_node shows it: nearly half the fast ticks are lost in 4.5 s. Missed timer periods are skipped, not queued.',
  },
  {
    prompt: 'A MultiThreadedExecutor with two threads, both timers in the node’s default callback group. Does the fast timer keep up?',
    options: [
      'No: the default group is mutually exclusive, so its callbacks never overlap, however many threads there are',
      'Yes: two threads run two callbacks',
      'Only if the slow callback is shorter than 1 s',
      'Only with a reentrant timer',
    ],
    answer: 0,
    explain: 'Threads are only half of it. A callback group says which callbacks may run at the same time; the default one allows none.',
  },
  {
    prompt: 'Why does waiting for a service answer inside a callback stall a single-threaded node?',
    options: [
      'The answer is delivered by the executor, whose only thread is the one that is waiting',
      'Services cannot be called from callbacks',
      'The server refuses requests from inside callbacks',
      'Because futures only work in main()',
    ],
    answer: 0,
    explain: 'With future.wait() and no timeout, it waits for ever: a deadlock. The recordings show it in battery_monitor, which even stops answering ros2 param list.',
  },
  {
    prompt: 'Which are ways out of that deadlock?',
    options: [
      'A response callback instead of waiting; or the client in its own callback group with a multi-threaded executor',
      'A longer timeout',
      'Calling rclcpp::spin inside the callback',
      'A bigger queue for the subscription',
    ],
    answer: 0,
    explain: 'Both appear in caller. The response callback is usually the better choice: it needs no extra threads, and nothing in the node ever sits blocked.',
  },
  {
    prompt: 'What is a reentrant callback group for?',
    options: [
      'Letting the same callback run several times at once, on different threads',
      'Running callbacks in a fixed order',
      'Making a callback run again if it fails',
      'Keeping callbacks from ever overlapping',
    ],
    answer: 0,
    explain: 'Useful for a service server that should handle several requests in parallel; it then needs thread-safe code, which is the price.',
  },
]
