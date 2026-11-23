// ros_gz_bridge's command-line rules, for the Lesson 9 playground. The pairs listed
// here are ones the bridge accepts in the course container (lesson09 recordings
// start a bridge with each of them).

export type Direction = '@' | '[' | ']'

export const DIRECTIONS: { sign: Direction; what: string }[] = [
  { sign: '[', what: 'Gazebo to ROS only' },
  { sign: ']', what: 'ROS to Gazebo only' },
  { sign: '@', what: 'both ways' },
]

/** ROS message types and the Gazebo message type each is bridged to. */
export const PAIRS: { ros: string; gz: string; use: string }[] = [
  { ros: 'geometry_msgs/msg/Twist', gz: 'gz.msgs.Twist', use: 'velocity commands' },
  { ros: 'nav_msgs/msg/Odometry', gz: 'gz.msgs.Odometry', use: 'odometry' },
  { ros: 'rosgraph_msgs/msg/Clock', gz: 'gz.msgs.Clock', use: 'the simulation clock' },
  { ros: 'tf2_msgs/msg/TFMessage', gz: 'gz.msgs.Pose_V', use: 'transforms' },
  { ros: 'sensor_msgs/msg/JointState', gz: 'gz.msgs.Model', use: 'joint positions' },
  { ros: 'sensor_msgs/msg/LaserScan', gz: 'gz.msgs.LaserScan', use: 'a 2D lidar' },
  { ros: 'sensor_msgs/msg/Imu', gz: 'gz.msgs.IMU', use: 'an IMU' },
  { ros: 'sensor_msgs/msg/Image', gz: 'gz.msgs.Image', use: 'a camera' },
  { ros: 'std_msgs/msg/String', gz: 'gz.msgs.StringMsg', use: 'text' },
]

/** One argument for `ros2 run ros_gz_bridge parameter_bridge`. */
export const bridgeRule = (topic: string, ros: string, direction: Direction, gz: string) => `${topic}@${ros}${direction}${gz}`

/** Whether the bridge has a conversion between these two types. */
export const canBridge = (ros: string, gz: string) => PAIRS.some((p) => p.ros === ros && p.gz === gz)

/** Reads a rule back into its parts, or null if it is not one. */
export function parseRule(rule: string) {
  const m = /^(\/?[A-Za-z0-9_/]+)@([A-Za-z0-9_]+\/msg\/[A-Za-z0-9_]+)([@[\]])(gz\.msgs\.[A-Za-z0-9_]+)$/.exec(rule)
  return m ? { topic: m[1], ros: m[2], direction: m[3] as Direction, gz: m[4] } : null
}
