// The course outline: 17 lessons in six parts. It follows the four lecture days
// of ETH Zurich's "Programming for Robotics - ROS" (2026, ROS 2 Jazzy), split
// into smaller lessons, and ends with a project.

export interface Source {
  from: 'ETH' | 'ROS 2 docs' | 'Gazebo docs' | 'Other'
  label: string
  url: string
}

export interface Lesson {
  n: number
  title: string
  summary: string
  topics: string[]
  playgrounds: string[]
  /** What the hands-on task asks for, in one sentence. */
  lab: string
  sources: Source[]
}

export interface Part {
  n: number
  title: string
  blurb: string
  lessons: Lesson[]
}

/** The ROS 2 release every lesson, command and lab is written for. */
export const ROS_DISTRO = 'Jazzy'

/** ETH publishes the slides and exercises as one ZIP on this page, not as separate files. */
export const ETH_COURSE_URL = 'https://rsl.ethz.ch/education-students/lectures/ros.html'

const eth = (day: number, label: string): Source => ({
  from: 'ETH',
  label: `Day ${day} lecture: ${label}`,
  url: ETH_COURSE_URL,
})

const docs = (path: string, label: string): Source => ({
  from: 'ROS 2 docs',
  label,
  url: `https://docs.ros.org/en/jazzy/${path}.html`,
})

const gazebo = (page: string, label: string): Source => ({
  from: 'Gazebo docs',
  label,
  url: `https://gazebosim.org/docs/harmonic/${page}/`,
})

/** Where this project lives. The hosted copy points readers here for the labs. */
export const REPO_URL = 'https://github.com/prabhunithingollapudi007/ros2-companion-course'

/** The public address of the hosted copy. Search engines are told each page's address from this. */
export const SITE_URL = 'https://prabhunithingollapudi007.github.io/ros2-companion-course/'

export const COURSE_LINKS = [
  { label: 'ETH Zurich, Programming for Robotics - ROS (course page and material)', url: ETH_COURSE_URL },
  { label: 'ROS 2 Jazzy documentation', url: 'https://docs.ros.org/en/jazzy/index.html' },
  { label: 'ROS 2 Jazzy tutorials', url: 'https://docs.ros.org/en/jazzy/Tutorials.html' },
  { label: 'Gazebo Harmonic documentation', url: 'https://gazebosim.org/docs/harmonic/getstarted/' },
]

export const PARTS: Part[] = [
  {
    n: 1,
    title: 'The ROS graph',
    blurb: 'What a running ROS system looks like, before you write any code.',
    lessons: [
      {
        n: 1,
        title: 'What ROS is, and your first commands',
        summary: 'What ROS gives a robot project, the container this course runs in, and a first talker and listener.',
        topics: [
          'What ROS adds: communication, packaging and ready-made tools',
          'ROS 1 and ROS 2, and the Jazzy release used here',
          'The course container and how to open a terminal in it',
          'Sourcing the environment',
          'A first talker and listener',
        ],
        playgrounds: ['Stop one piece: separate nodes against one big program'],
        lab: 'Start the container, find your way around it, and stop and restart a node.',
        sources: [
          eth(1, 'ROS architecture and philosophy'),
          docs('Releases', 'ROS 2 releases and their support dates'),
          docs('Tutorials/Beginner-CLI-Tools/Configuring-ROS2-Environment', 'Configuring the environment'),
          docs('Concepts/Basic/About-Nodes', 'Concepts: nodes'),
          { from: 'Other', label: 'Docker: get started', url: 'https://docs.docker.com/get-started/get-docker/' },
        ],
      },
      {
        n: 2,
        title: 'Nodes, topics and messages',
        summary:
          'The publish-subscribe graph: how nodes find each other, what travels between them, and how to inspect it from the terminal.',
        topics: [
          'Nodes as single-purpose programs',
          'Topics: named, typed streams with any number of publishers and subscribers',
          'Message types and how to read their definitions',
          'Discovery without a central server',
          'Domain IDs: keeping two systems apart',
          'Inspecting a live graph with the ros2 command',
        ],
        playgrounds: ['A live graph: add publishers and subscribers and watch messages flow', 'Domain IDs splitting one network into two'],
        lab: 'Explore a running graph from the terminal and answer questions about it.',
        sources: [
          eth(1, 'ROS nodes, topics and console commands'),
          docs('Tutorials/Beginner-CLI-Tools/Understanding-ROS2-Nodes/Understanding-ROS2-Nodes', 'Understanding nodes'),
          docs('Tutorials/Beginner-CLI-Tools/Understanding-ROS2-Topics/Understanding-ROS2-Topics', 'Understanding topics'),
          docs('Concepts/Basic/About-Interfaces', 'Concepts: interfaces'),
          docs('Concepts/Intermediate/About-Domain-ID', 'Concepts: the domain ID'),
        ],
      },
    ],
  },
  {
    n: 2,
    title: 'Writing ROS programs',
    blurb: "From running other people's nodes to building, launching and recording your own.",
    lessons: [
      {
        n: 3,
        title: 'Workspaces, packages and the build',
        summary: 'Where your code lives, how colcon turns it into something ROS can run, and why you source a setup file.',
        topics: [
          'The workspace: src, build, install and log',
          'What a package is: package.xml and CMakeLists.txt',
          'Building with colcon',
          'Underlays and overlays: what sourcing does',
          'Declaring dependencies',
        ],
        playgrounds: ['What a build puts where', 'Overlays: which copy of a package wins'],
        lab: 'Create, build, change and rebuild a C++ package, checked by a script in the container.',
        sources: [
          eth(1, 'Package structure, colcon workspace and build system'),
          docs('Tutorials/Beginner-Client-Libraries/Creating-A-Workspace/Creating-A-Workspace', 'Creating a workspace'),
          docs('Tutorials/Beginner-Client-Libraries/Creating-Your-First-ROS2-Package', 'Creating a package'),
          docs('Tutorials/Beginner-Client-Libraries/Colcon-Tutorial', 'Using colcon to build packages'),
          docs('Concepts/Advanced/About-Build-System', 'Concepts: the build system'),
        ],
      },
      {
        n: 4,
        title: 'Publishers, subscribers and your own messages',
        summary:
          'Writing nodes in C++ with rclcpp: a publisher on a timer, a subscriber with a callback, and a custom message type.',
        topics: [
          'The shape of an rclcpp node',
          'Publishing on a timer',
          'Subscribing with a callback, and what spinning means',
          'Queue depth',
          'Defining a message in a .msg file',
          'From MsgType.msg to msg_type.hpp: the naming rule',
        ],
        playgrounds: ['A queue that cannot keep up: which messages are handled and which dropped'],
        lab: 'A battery monitor: turn voltage readings into a status message of your own, checked in the container.',
        sources: [
          eth(1, 'Creating a C++ package, messages, publish and subscribe'),
          docs('Tutorials/Beginner-Client-Libraries/Writing-A-Simple-Cpp-Publisher-And-Subscriber', 'Writing a simple publisher and subscriber (C++)'),
          docs('Tutorials/Beginner-Client-Libraries/Custom-ROS2-Interfaces', 'Creating custom msg and srv files'),
          docs('Tutorials/Beginner-Client-Libraries/Single-Package-Define-And-Use-Interface', 'Implementing custom interfaces in one package'),
        ],
      },
      {
        n: 5,
        title: 'Launch files',
        summary: 'Starting a whole system with one command: Python launch files, namespaces, remapping and arguments.',
        topics: [
          'Why launch files exist',
          'A launch description in Python',
          'Names, namespaces and remapping',
          'Launch arguments',
          'Including other launch files',
          'Installing launch files with the package',
        ],
        playgrounds: ['Where does a name end up?', 'From launch file to graph'],
        lab: 'A two-robot fleet and a dashboard from one launch file, with a launch argument and remapping.',
        sources: [
          eth(1, 'Launch files'),
          docs('Tutorials/Beginner-CLI-Tools/Launching-Multiple-Nodes/Launching-Multiple-Nodes', 'Launching nodes'),
          docs('Tutorials/Intermediate/Launch/Launch-Main', 'Launch tutorials'),
          docs('Concepts/Basic/About-Launch', 'Concepts: launch'),
          { from: 'Other', label: 'ROS 2 design: topic and service names', url: 'https://design.ros2.org/articles/topic_and_service_names.html' },
          { from: 'Other', label: 'ROS 2 design: remapping names', url: 'https://design.ros2.org/articles/static_remapping.html' },
        ],
      },
      {
        n: 6,
        title: 'Bags, time and synchronising topics',
        summary:
          'Recording and replaying data, the difference between when a message was sent and when it was measured, and matching messages from two sensors.',
        topics: [
          'Recording, inspecting and replaying bags',
          'Developing offline against recorded data',
          'Header stamps and frame IDs',
          'Wall time, ROS time and simulated time',
          'Approximate-time synchronisation with message_filters',
          'Looking at data: rqt and Foxglove',
        ],
        playgrounds: ['Two sensor streams being matched by time stamp', 'Replaying a bag: what the clock does'],
        lab: 'Re-stamp a sensor stream using simulated time and combine it with a second one.',
        sources: [
          eth(1, 'Rosbag, timing, synchronisation and visualisation tools'),
          docs('Tutorials/Beginner-CLI-Tools/Recording-And-Playing-Back-Data/Recording-And-Playing-Back-Data', 'Recording and playing back data'),
          docs('p/message_filters/doc/index', 'message_filters'),
          docs('p/message_filters/doc/Tutorials/Approximate-Synchronizer-Cpp', 'Approximate time synchroniser (C++)'),
          { from: 'Other', label: 'ROS 2 design: clock and time', url: 'https://design.ros2.org/articles/clock_and_time.html' },
          docs('Concepts/Intermediate/About-RQt', 'Concepts: rqt'),
        ],
      },
    ],
  },
  {
    n: 3,
    title: 'Robots, frames and simulation',
    blurb: 'Giving ROS a body: a robot model, the coordinate frames attached to it, and a simulated world to drive it in.',
    lessons: [
      {
        n: 7,
        title: 'Describing a robot: URDF and xacro',
        summary: 'A robot as a tree of rigid links joined by joints, written in XML, and the macro language that keeps it short.',
        topics: [
          'Links: visual, collision and inertial',
          'Joints: types, axes, limits and origins',
          'The robot as a tree',
          'Xacro: properties, maths and macros',
          'Loading a robot description from a launch file',
        ],
        playgrounds: ['A joint tree you can move', 'One xacro macro, four wheels'],
        lab: 'Model a small wheeled robot in xacro and view it.',
        sources: [eth(2, 'Robot models (URDF) and xacro'), docs('Tutorials/Intermediate/URDF/URDF-Main', 'URDF tutorials')],
      },
      {
        n: 8,
        title: 'TF2: coordinate frames over time',
        summary: 'Keeping track of where everything is relative to everything else, at any moment.',
        topics: [
          'Frames and transforms',
          'The transform tree, and why it is a tree',
          'The /tf and /tf_static topics',
          'robot_state_publisher: from joint angles to transforms',
          'Broadcasting and looking up transforms in C++',
          'Asking for a transform at a time in the past',
          'Seeing frames in RViz',
        ],
        playgrounds: ['A frame tree you can drag', 'Looking up a transform at an earlier time', 'Quaternions and roll, pitch, yaw'],
        lab: "Publish a robot's pose in the world frame from a sensor reading.",
        sources: [
          eth(2, 'TF transformation system and RViz'),
          docs('Concepts/Intermediate/About-Tf2', 'Concepts: tf2'),
          docs('Tutorials/Intermediate/Tf2/Tf2-Main', 'tf2 tutorials'),
          docs('Tutorials/Intermediate/RViz/RViz-User-Guide/RViz-User-Guide', 'RViz user guide'),
        ],
      },
      {
        n: 9,
        title: 'Simulation with Gazebo',
        summary: 'A physics simulator standing in for the real robot: worlds, sensors, and the bridge that connects Gazebo to ROS.',
        topics: [
          'What a simulator provides',
          'Worlds in SDF',
          'Making a URDF simulation-ready: plugins and sensors',
          'The ROS-Gazebo bridge and its topic syntax',
          'Driving a differential-drive robot',
          'Simulated time',
        ],
        playgrounds: ['Differential drive: from wheel speeds to motion', 'Building a bridge rule'],
        lab: 'Build a small world, spawn your robot in it and drive it from the keyboard.',
        sources: [
          eth(2, 'Gazebo Sim and simulation descriptions (SDF)'),
          gazebo('ros2_integration', 'Use ROS 2 to interact with Gazebo'),
          gazebo('sdf_worlds', 'SDF worlds'),
          docs('Tutorials/Advanced/Simulators/Gazebo/Gazebo', 'Setting up a robot simulation (Gazebo)'),
          { from: 'Other', label: 'SDFormat specification', url: 'http://sdformat.org/spec' },
        ],
      },
    ],
  },
  {
    n: 4,
    title: 'Talking to nodes',
    blurb: 'Three more ways for nodes to interact, and how to choose between them.',
    lessons: [
      {
        n: 10,
        title: 'Services',
        summary: 'Asking a node a question and waiting for the answer: request and response.',
        topics: [
          'When a topic is the wrong tool',
          'Defining a service in a .srv file',
          'Writing a server and a client',
          'Calling a service from the terminal',
          'Waiting for an answer without blocking',
        ],
        playgrounds: ['The same exchange as a topic and as a service'],
        lab: 'Add a service that switches a running node between two modes.',
        sources: [
          eth(3, 'Services'),
          docs('Tutorials/Beginner-CLI-Tools/Understanding-ROS2-Services/Understanding-ROS2-Services', 'Understanding services'),
          docs('Tutorials/Beginner-Client-Libraries/Writing-A-Simple-Cpp-Service-And-Client', 'Writing a simple service and client (C++)'),
        ],
      },
      {
        n: 11,
        title: 'Actions',
        summary: 'Requests that take a while: goals, progress feedback, results and cancelling.',
        topics: [
          'Goal, feedback and result',
          'Defining an action in a .action file',
          'Writing an action server',
          'Writing an action client',
          'Cancelling a goal',
          'Sending goals from the terminal',
        ],
        playgrounds: ['The life of a goal: accepted, running, reporting, finished or cancelled'],
        lab: 'Wrap a slow task in an action server that reports progress and can be cancelled.',
        sources: [
          eth(3, 'Actions'),
          docs('Tutorials/Beginner-CLI-Tools/Understanding-ROS2-Actions/Understanding-ROS2-Actions', 'Understanding actions'),
          docs('Tutorials/Intermediate/Writing-an-Action-Server-Client/Cpp', 'Writing an action server and client (C++)'),
        ],
      },
      {
        n: 12,
        title: 'Parameters',
        summary: 'Configuring a node without recompiling it: declaring, reading and changing parameters.',
        topics: [
          'Parameters belong to a node',
          'Declaring and reading parameters in C++',
          'Setting parameters from the terminal, a launch file and a YAML file',
          'Reacting to a change while the node runs',
        ],
        playgrounds: ['Where a parameter value comes from: default, YAML file, launch file, terminal'],
        lab: 'Move every hard-coded number in your nodes into a YAML file.',
        sources: [
          eth(3, 'ROS 2 parameters'),
          docs('Concepts/Basic/About-Parameters', 'Concepts: parameters'),
          docs('Tutorials/Beginner-CLI-Tools/Understanding-ROS2-Parameters/Understanding-ROS2-Parameters', 'Understanding parameters'),
          docs('Tutorials/Beginner-Client-Libraries/Using-Parameters-In-A-Class-CPP', 'Using parameters in a class (C++)'),
          docs('Tutorials/Intermediate/Monitoring-For-Parameter-Changes-CPP', 'Monitoring for parameter changes (C++)'),
        ],
      },
      {
        n: 13,
        title: 'Designing a robot software stack',
        summary:
          'Going from a list of requirements to a graph of nodes, and choosing a topic, service, action or parameter for each connection.',
        topics: [
          'One job per node',
          'Topic, service, action or parameter?',
          'From requirements to a graph',
          'Drivers, estimation, planning, control and interfaces',
          'Keeping a stack easy to debug',
        ],
        playgrounds: ['Pick the interface: a set of cases', 'A requirements list turning into a graph'],
        lab: 'Design the node graph for a given robot and justify each choice.',
        sources: [
          eth(3, 'Robot software architecture'),
          docs('Concepts/Basic/About-Topics', 'Concepts: topics'),
          docs('Tutorials/Intermediate/Launch/Using-ROS2-Launch-For-Large-Projects', 'Managing large projects with launch'),
        ],
      },
    ],
  },
  {
    n: 5,
    title: 'Under the hood',
    blurb: 'The two places ROS 2 bugs hide: how nodes connect, and when callbacks run.',
    lessons: [
      {
        n: 14,
        title: 'Discovery and quality of service',
        summary: 'Why two nodes on the same topic may never exchange a message, and how to find out.',
        topics: [
          'The layers under your node: client library, rcl, rmw and the middleware',
          'How discovery works and where it struggles',
          'Quality of service: reliability, durability and history',
          'Compatible and incompatible pairs',
          'A routine for debugging a silent topic',
          'The discovery server',
        ],
        playgrounds: ['The QoS compatibility matrix', 'A lossy link: reliable against best-effort'],
        lab: 'Three graphs that will not talk. Find out why and fix each one.',
        sources: [
          eth(4, 'ROS 1 to ROS 2 migration: discovery and QoS'),
          docs('Concepts/Basic/About-Discovery', 'Concepts: discovery'),
          docs('Concepts/Intermediate/About-Quality-of-Service-Settings', 'Concepts: quality of service settings'),
          docs('Concepts/Intermediate/About-Different-Middleware-Vendors', 'Concepts: middleware vendors'),
          docs('Tutorials/Advanced/Discovery-Server/Discovery-Server', 'Using the Fast DDS discovery server'),
        ],
      },
      {
        n: 15,
        title: 'Executors and callback groups',
        summary: 'What decides when your callbacks run, and how a node can freeze itself.',
        topics: [
          'Callbacks and where they come from',
          'Single-threaded and multi-threaded executors',
          'Mutually exclusive and reentrant callback groups',
          'The blocking-call deadlock',
          'Keeping callbacks short',
        ],
        playgrounds: ['An executor running callbacks, thread by thread', 'A deadlock, and two ways out of it'],
        lab: 'Fix a node that freezes when it calls a service from inside a callback.',
        sources: [
          eth(4, 'ROS 1 to ROS 2 migration: executors and callbacks'),
          docs('Concepts/Intermediate/About-Executors', 'Concepts: executors'),
          docs('How-To-Guides/Using-callback-groups', 'Using callback groups'),
        ],
      },
      {
        n: 16,
        title: 'Reading and porting ROS 1 code',
        summary: 'Much existing robot code is ROS 1. How to read it, what changes when you port it, and how to do it in stages.',
        topics: [
          'ROS 1 in brief: the master, catkin and the global parameter server',
          'What ports mechanically: build files, APIs and launch',
          'What changes meaning: connections and execution',
          'Porting a small node line by line',
          'Running both together with ros1_bridge',
        ],
        playgrounds: ['The same node in ROS 1 and ROS 2, side by side'],
        lab: 'Port a small ROS 1 package to ROS 2.',
        sources: [
          eth(4, 'ROS 1 to ROS 2 migration'),
          docs('How-To-Guides/Migrating-from-ROS1', 'Migrating from ROS 1'),
          { from: 'Other', label: 'ros1_bridge', url: 'https://github.com/ros2/ros1_bridge' },
        ],
      },
    ],
  },
  {
    n: 6,
    title: 'Capstone',
    blurb: 'One project that uses every part of the course.',
    lessons: [
      {
        n: 17,
        title: 'Capstone: drive a robot to a goal',
        summary: 'A simulated robot that plans a path to a goal and follows it, built from the pieces of the earlier lessons.',
        topics: [
          'Designing the graph',
          'Robot model, frames and simulation',
          'A planner behind an action',
          'Configuration through parameters',
          'Recording a run and checking it',
        ],
        playgrounds: [],
        lab: 'The project is the lab: bring up the robot, plan to a goal, follow the path and record the run.',
        sources: [
          {
            from: 'ETH',
            label: 'Course page (the ETH course ends with a project exam, which is not published)',
            url: ETH_COURSE_URL,
          },
        ],
      },
    ],
  },
]

export const LESSONS: Lesson[] = PARTS.flatMap((p) => p.lessons)

export function findLesson(n: number): { lesson: Lesson; part: Part } | undefined {
  for (const part of PARTS) {
    const lesson = part.lessons.find((l) => l.n === n)
    if (lesson) return { lesson, part }
  }
  return undefined
}
