import type { Question } from '../components/Quiz'

export const lesson10Quiz: Question[] = [
  {
    prompt: 'Which of these suits a service better than a topic?',
    options: [
      'Telling a node to switch to careful mode, and hearing whether it did',
      'A lidar sending scans 10 times a second',
      'Odometry published as the robot drives',
      'Battery voltage for anyone who wants it',
    ],
    answer: 0,
    explain: 'A service is for a request that deserves an answer: did it work? Streams of data that many nodes may want go on topics.',
  },
  {
    prompt: 'In a .srv file, what does the line --- separate?',
    options: ['The request, above, from the response, below', 'Two versions of the service', 'Comments from fields', 'The client’s fields from the server’s code'],
    answer: 0,
    explain: 'SetStep has int64 step above the line and bool accepted, string message below. rosidl turns each half into a message type: SetStep::Request and SetStep::Response.',
  },
  {
    prompt: 'You run ros2 service call /nobody_home and no server offers it. What happens?',
    options: [
      'It waits for a server to appear, saying so, until you stop it',
      'It fails at once with an error',
      'It returns an empty response',
      'It creates the service',
    ],
    answer: 0,
    explain: 'Clients wait for a server, as step_client does with wait_for_service. A service exists only while some node offers it.',
  },
  {
    prompt: 'Why does step_client call async_send_request and then spin_until_future_complete, instead of a call that blocks?',
    options: [
      'The response is delivered by spinning the node: something must spin while the client waits',
      'Because services are slower than topics',
      'So that the server can run in the same process',
      'There is no reason; a blocking call would work the same anywhere',
    ],
    answer: 0,
    explain: 'The answer arrives through the executor, like a message. Blocking inside a callback of a node that the same single thread must spin is the classic deadlock; in a node, handle the response in a callback instead.',
  },
  {
    prompt: 'Two clients call a server whose callback takes a second. When does the second get its answer?',
    options: [
      'About a second after the first: one thread answers one request at a time',
      'At the same time as the first',
      'Never: a server serves one client',
      'Immediately, with an empty response',
    ],
    answer: 0,
    explain: 'With the default single-threaded executor the server works through requests in order. Lesson 15 shows how to let callbacks run in parallel.',
  },
  {
    prompt: 'Where should a service type used by several packages live?',
    options: [
      'In a package of its own that holds only interfaces, like counter_interfaces',
      'Copied into each package that uses it',
      'In the package of whichever node offers it, always',
      'In a launch file',
    ],
    answer: 0,
    explain: 'An interfaces package is small, builds quickly, and can be depended on by C++ and Python packages alike without pulling in any node code.',
  },
]
