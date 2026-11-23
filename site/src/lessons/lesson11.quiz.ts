import type { Question } from '../components/Quiz'

export const lesson11Quiz: Question[] = [
  {
    prompt: 'When is an action better than a service?',
    options: [
      'When the work takes long enough that the client wants progress, or may want to stop it',
      'When the answer is a number',
      'When there are many clients',
      'When the server is written in C++',
    ],
    answer: 0,
    explain: 'Driving somewhere, charging a battery, moving an arm: seconds or minutes of work, with feedback along the way and a chance to cancel. A service call that took that long would leave the client blind.',
  },
  {
    prompt: 'An .action file has two --- lines. What are its three parts, in order?',
    options: ['Goal, result, feedback', 'Goal, feedback, result', 'Request, response, status', 'Feedback, goal, result'],
    answer: 0,
    explain: 'DriveDistance.action has the goal (distance, speed), then the result (travelled), then the feedback (remaining).',
  },
  {
    prompt: 'The server gets a goal with a negative distance. What should its goal callback do?',
    options: [
      'Reject it, so the client knows at once',
      'Accept it and abort later',
      'Accept it and drive backwards',
      'Ignore it: the client will time out',
    ],
    answer: 0,
    explain: 'The goal callback decides before any work starts. drive_server rejects bad numbers, and also rejects a second goal while it is driving.',
  },
  {
    prompt: 'Why does drive_server do the driving on a thread of its own?',
    options: [
      'So that the node stays free to answer other requests, such as a cancel, while the work goes on',
      'Threads make the robot drive faster',
      'Action servers cannot run in the main thread',
      'To publish feedback on a different topic',
    ],
    answer: 0,
    explain: 'If the work ran inside the accepted callback, the executor would be stuck there until it finished, and the cancel request could not be handled until it was too late.',
  },
  {
    prompt: 'A client asks to cancel. Does the goal stop at once?',
    options: [
      'Not necessarily: the server accepts the request, and the goal ends when the server’s loop notices and calls canceled()',
      'Yes: the client stops it',
      'Yes: ROS kills the server’s thread',
      'No: goals cannot be cancelled once accepted',
    ],
    answer: 0,
    explain: 'The recording shows "cancel requested", then, a fraction of a second later at the next pass of the loop, "cancelled after" the distance reached. The server decides how to stop safely.',
  },
  {
    prompt: 'ros2 topic list --include-hidden-topics shows /drive_distance/_action/feedback. What is it?',
    options: [
      'The topic the action’s feedback travels on: actions are built from topics and services',
      'A debugging copy of the feedback',
      'A topic left over from ROS 1',
      'The result of the last goal',
    ],
    answer: 0,
    explain: 'Every action is two hidden topics, feedback and status, and three hidden services, send_goal, cancel_goal and get_result.',
  },
]
