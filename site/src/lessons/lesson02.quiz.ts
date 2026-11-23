import type { Question } from '../components/Quiz'

export const lesson02Quiz: Question[] = [
  {
    prompt: 'One node publishes on /chatter and three nodes subscribe to it, all with the same type. How many copies of each message are delivered?',
    options: ['One, to whichever subscriber asks first', 'Three, one to each subscriber', 'One, shared through a central server', 'None until a subscriber requests it'],
    answer: 1,
    explain: 'Every subscription on a topic receives every message published to it. The publisher does not choose who gets it, and does not need to know who is listening.',
  },
  {
    prompt: 'A node publishes std_msgs/msg/Int32 on /chatter while another subscribes to /chatter with std_msgs/msg/String. What happens?',
    options: [
      'The integer is converted to a string',
      'The subscriber crashes',
      'They never connect, and the topic is listed with both types',
      'ROS refuses to start the second node',
    ],
    answer: 2,
    explain: 'A publisher and a subscription connect only if the topic name and the message type both match. Nothing warns you; the clue is ros2 topic list -t showing two types for one topic.',
  },
  {
    prompt: 'What has to be running before two ROS 2 nodes can find each other?',
    options: ['Nothing but the two nodes', 'roscore, the master', 'A launch file', 'ros2 node list'],
    answer: 0,
    explain: 'Discovery in ROS 2 is distributed: each node announces itself and the others answer. The master is a ROS 1 idea.',
  },
  {
    prompt: 'You leave ros2 topic echo /chatter running and type ros2 node list in another terminal. Does the echo show up?',
    options: [
      'Yes, as a node called /echo',
      'No: it is a hidden node, though it is counted as a subscription and ros2 node list -a shows it',
      'No: echo reads the topic without joining the graph',
      'Only if it was started with --verbose',
    ],
    answer: 1,
    explain: 'Command-line tools join the graph like any node. ros2 topic info counts the echo as a subscription, but its node name starts with an underscore, which hides it from the ordinary list.',
  },
  {
    prompt: 'Two research groups share one network and both leave the ROS settings at their defaults. What happens?',
    options: [
      'Nothing: ROS 2 keeps every computer separate by default',
      "Each group's nodes can see, and receive messages from, the other group's nodes",
      'The second group to start gets an error',
      'Only the topic names are shared, not the messages',
    ],
    answer: 1,
    explain: 'Every node uses domain 0 unless told otherwise, and discovery reaches every node in the same domain on the network. Giving each group its own ROS_DOMAIN_ID keeps them apart.',
  },
  {
    prompt: 'Which two fields of geometry_msgs/msg/Twist does a wheeled robot on flat ground use to drive forward and to turn?',
    options: ['linear.x and angular.z', 'linear.y and angular.x', 'linear.z and angular.y', 'linear.x and linear.y'],
    answer: 0,
    explain: 'ROS puts x forward, y to the left and z up. Forward speed is linear.x; turning on the spot is a rotation about the vertical axis, angular.z.',
  },
  {
    prompt: 'Which command tells you how often a topic is being published?',
    options: ['ros2 topic hz', 'ros2 topic info', 'ros2 topic echo --once', 'ros2 interface show'],
    answer: 0,
    explain: 'ros2 topic hz subscribes and reports the average rate. topic info counts publishers and subscribers, and interface show describes the message type.',
  },
  {
    prompt: 'What do the three parts of the name sensor_msgs/msg/LaserScan say?',
    options: [
      'Package, kind of interface, type name',
      'Robot, topic, node',
      'Folder on disk, file name, field',
      'Domain, namespace, topic',
    ],
    answer: 0,
    explain: 'LaserScan is a message (msg, as opposed to a service or an action) defined in the sensor_msgs package.',
  },
  {
    prompt: 'A listener started with ROS_DOMAIN_ID=1 subscribes to /chatter while the talker runs with the default. What does the listener print?',
    options: ['Every greeting, slightly delayed', 'Nothing', 'An error saying the topic is in another domain', 'Every other greeting'],
    answer: 1,
    explain: 'Nodes in different domains never discover each other, so the listener waits on /chatter and hears nothing, without any error. That silence is what makes a wrong domain ID hard to spot.',
  },
]
