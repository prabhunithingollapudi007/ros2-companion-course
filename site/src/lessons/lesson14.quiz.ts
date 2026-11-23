import type { Question } from '../components/Quiz'

export const lesson14Quiz: Question[] = [
  {
    prompt: 'A lidar driver publishes best effort. Your node subscribes reliable. What happens?',
    options: [
      'No messages arrive, and a warning names RELIABILITY as the incompatible policy',
      'Messages arrive, but some are lost',
      'The driver switches to reliable',
      'The subscription receives each message twice',
    ],
    answer: 0,
    explain: 'A subscription that requires reliable delivery cannot accept a publisher that does not offer it. Ask for best effort (or SensorDataQoS) when subscribing to sensors.',
  },
  {
    prompt: 'Which pair connects?',
    options: [
      'Publisher reliable, subscription best effort',
      'Publisher best effort, subscription reliable',
      'Publisher volatile, subscription transient local',
      'None of them',
    ],
    answer: 0,
    explain: 'The offer must be at least the request. Reliable is more than best effort, so it satisfies it; the other two ask for more than is offered.',
  },
  {
    prompt: 'A node starts after /robot_description was published, yet receives it. Why?',
    options: [
      'robot_state_publisher publishes it transient local, and the node subscribes transient local, so the last message is kept for late joiners',
      'The message is republished every second',
      'ROS stores every message on disk',
      'Late joiners always get the last message',
    ],
    answer: 0,
    explain: 'Durability transient local on both sides: the publisher keeps its last messages (up to its depth) and hands them to new subscriptions. /tf_static works the same way.',
  },
  {
    prompt: 'Two nodes on one computer cannot see each other. Which of these is a likely cause?',
    options: [
      'Different ROS_DOMAIN_ID, or ROS_AUTOMATIC_DISCOVERY_RANGE=OFF on one of them',
      'They were built in different workspaces',
      'One is written in Python and the other in C++',
      'They use different message packages',
    ],
    answer: 0,
    explain: 'Discovery settings decide who can see whom. Workspaces and languages do not matter on the wire, as long as both sides have the message type.',
  },
  {
    prompt: 'With a discovery server, why does a plain ros2 node list show nothing?',
    options: [
      'The CLI is not a client of the server: it looks for multicast announcements, and there are none',
      'The server hides nodes from the CLI on purpose',
      'Nodes using a server have no names',
      'Because the daemon must be restarted after every node',
    ],
    answer: 0,
    explain: 'Give the CLI the same ROS_DISCOVERY_SERVER and make it a super client (ROS_SUPER_CLIENT=True), which receives everything the server knows.',
  },
  {
    prompt: 'A topic is silent. What do you check first?',
    options: [
      'That both sides use the same full topic name and type: ros2 topic list and ros2 topic info -v',
      'Reinstall ROS',
      'Increase the queue depth',
      'Switch the middleware',
    ],
    answer: 0,
    explain: 'Names first (namespaces and relative names catch everyone), then types, then QoS in ros2 topic info -v, then discovery: domain and range.',
  },
]
