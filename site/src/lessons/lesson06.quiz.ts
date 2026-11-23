import type { Question } from '../components/Quiz'

export const lesson06Quiz: Question[] = [
  {
    prompt: 'A listener receives messages from ros2 bag play. Can it tell they are a replay?',
    options: [
      'Not from the messages: the player publishes them on the same topics, with the same types and spacing',
      'Yes: replayed messages carry a replay flag',
      'Yes: replayed topics are renamed /bag/...',
      'Only if the bag was recorded with -a',
    ],
    answer: 0,
    explain: 'The player is just another publisher. That is what makes bags useful for developing at a desk. The node can notice the time, though, which is what use_sim_time is for.',
  },
  {
    prompt: 'What does a message’s header.stamp say?',
    options: ['When the data was measured', 'When the message was published', 'When the subscriber received it', 'When the bag was recorded'],
    answer: 0,
    explain: 'A well-behaved driver sets the stamp to the moment of measurement. Publishing and delivery come later and vary; the stamp is what you line sensors up by.',
  },
  {
    prompt: 'Why can an exact-time synchroniser produce nothing at all from two sensors?',
    options: [
      'Two separate sensors are practically never read at exactly the same instant',
      'Exact synchronisers only work in simulation',
      'It needs use_sim_time',
      'It only pairs messages of the same type',
    ],
    answer: 0,
    explain: 'In the weather bag, temperature stamps end in .03, .28, .53, .78 and humidity stamps in .11. Approximate synchronisation pairs readings that are close in time instead.',
  },
  {
    prompt: 'A node started with use_sim_time:=true has a 1 s timer. Nothing publishes /clock. What happens?',
    options: [
      'Its clock reads zero and the timer never fires',
      'It falls back to the computer’s clock',
      'It crashes with a time error',
      'The timer fires as usual',
    ],
    answer: 0,
    explain: 'With use_sim_time, time comes only from /clock. The recording counted zero ticks before the bag started publishing /clock.',
  },
  {
    prompt: 'You play a bag with --clock --rate 2. How often does a sim-time node’s 1 s timer fire?',
    options: ['Twice a real second', 'Once a real second', 'Every two real seconds', 'Not at all'],
    answer: 0,
    explain: 'Its clock follows the bag’s time, which now runs twice as fast as real time; one second of bag time passes every half second.',
  },
  {
    prompt: 'In Jazzy, which records only /chatter into a bag folder called talk?',
    options: ['ros2 bag record -o talk --topics /chatter', 'ros2 bag record talk /chatter', 'ros2 bag save /chatter talk', 'ros2 topic record /chatter'],
    answer: 0,
    explain: 'Topics now go after --topics; giving them alone still works but prints a deprecation warning, as the recording shows. -a records every topic.',
  },
  {
    prompt: 'What is in a bag folder?',
    options: [
      'A metadata.yaml describing it, and the messages in one or more .mcap files',
      'A copy of each node that published',
      'A video of the topics',
      'One text file per topic',
    ],
    answer: 0,
    explain: 'MCAP is the default storage format in Jazzy. ros2 bag info reads the metadata: duration, message counts and types per topic.',
  },
  {
    prompt: 'Your dew point node copies the temperature message’s header into its output. Why?',
    options: [
      'The result describes that moment and place, and later nodes can line it up with other data',
      'ROS refuses to publish messages without a header',
      'It makes the message smaller',
      'So that ros2 bag record can store it',
    ],
    answer: 0,
    explain: 'A derived value inherits the time and frame of the data it came from. Stamping it with the time of computation would make it look later than it is.',
  },
]
