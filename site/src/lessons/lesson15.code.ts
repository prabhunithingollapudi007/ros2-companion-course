// The source files Lesson 15 shows: busy_node and caller, and the lab's frozen node.

import busyNode from '../../../labs/lesson15/examples/executors_demo/src/busy_node.cpp?raw'
import caller from '../../../labs/lesson15/examples/executors_demo/src/caller.cpp?raw'
import batteryMonitor from '../../../labs/lesson15/lab/battery_monitor/src/battery_monitor.cpp?raw'

const base = 'labs/lesson15/examples/executors_demo/src/'

export const code = {
  busyNode: { path: base + 'busy_node.cpp', code: busyNode },
  caller: { path: base + 'caller.cpp', code: caller },
  batteryMonitor: { path: 'labs/lesson15/lab/battery_monitor/src/battery_monitor.cpp', code: batteryMonitor },
}
