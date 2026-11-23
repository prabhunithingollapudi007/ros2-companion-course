import { describe, expect, it } from 'vitest'
import solution from '../../../labs/lesson05/solution/fleet_bringup/launch/fleet.launch.py?raw'
import { lesson05 } from '../transcripts'
import { cmake, launchFiles } from './lesson05.code'
import { lesson05Lab } from './lesson05.lab'

// Each statement Lesson05.mdx makes, checked against what the commands printed
// in the course container, and every lab answer against the same recordings.

const out = (id: string) => lesson05.runs[id].output
const lines = (id: string) => out(id).split('\n')

describe('what Lesson 5 says, against the recordings', () => {
  it('launch output names each process, and Ctrl+C stops them all', () => {
    expect(out('launch-basic')).toMatch(/^\[INFO\] \[talker-1\]: process started with pid \[\d+\]$/m)
    expect(out('launch-basic')).toMatch(/^\[talker-1\] \[INFO\] .* \[talker\]: Publishing/m)
    expect(lines('launch-nodes')).toEqual(['/listener', '/talker'])
    expect(out('after-ctrl-c')).toBe('')
  })

  it('every launch file in the package is installed into its share folder', () => {
    expect(lines('installed').sort()).toEqual(Object.keys(launchFiles).map((k) => `${k}.launch.py`).sort())
    expect(cmake.code).toContain('install(DIRECTORY launch DESTINATION share/${PROJECT_NAME})')
  })

  it('a launch file that is not there is reported against the share folder', () => {
    expect(out('missing')).toContain("was not found in the share directory of package 'launch_demo'")
  })

  it('a node in a namespace logs under its namespace too', () => {
    expect(out('cli-robot1')).toMatch(/\[robot1\.talker\]: Publishing/)
    expect(out('pairs-launch')).toMatch(/\[(left|right)\.talker\]: Publishing/)
  })

  it('--show-args lists each argument with its description and default', () => {
    expect(out('show-args')).toContain("'robot':")
    expect(out('show-args')).toContain('Namespace to start the pair in')
    expect(out('show-args')).toContain("(default: 'robot1')")
  })

  it('both pairs connect within their own namespace', () => {
    expect(out('pairs-left-info')).toBe('Type: std_msgs/msg/String\nPublisher count: 1\nSubscription count: 1')
    expect(out('renamed-info')).toBe('Type: std_msgs/msg/String\nPublisher count: 1\nSubscription count: 1')
  })
})

describe('the Lesson 5 lab', () => {
  it('the reference launch file declares second_robot and remaps the dashboard', () => {
    expect(out('lab-show-args')).toContain("'second_robot':")
    expect(out('lab-show-args')).toContain("(default: 'robot2')")
    expect(solution).toContain("('robot_a/status', '/robot1/battery_status')")
  })

  it('it starts five nodes, and the dashboard hears both robots', () => {
    expect(lines('lab-nodes')).toEqual(['/dashboard', '/robot1/battery', '/robot1/monitor', '/robot2/battery', '/robot2/monitor'])
    expect(out('lab-dashboard-info')).toContain('/robot1/battery_status: std_msgs/msg/Float32')
    expect(out('lab-dashboard-info')).toContain('/robot2/battery_status: std_msgs/msg/Float32')
    expect(out('lab-launch')).toMatch(/robot_a: [\d.]+ % \| robot_b: [\d.]+ %/)
  })

  it('the checker fails before the lab and passes the reference solution', () => {
    expect(out('lab-check-early')).toMatch(/1 of 13 checks passed\.$/)
    expect(out('lab-check')).toMatch(/All 13 checks passed\.$/)
    expect(out('lab-check')).toContain('/rover/monitor')
  })

  it('each answer is the recorded one, and near misses are refused', () => {
    const right = [String(lines('lab-nodes').length), '/rover/monitor', out('lab-dashboard-info'), '13']
    const wrong = ['4', '/robot2/monitor', '/robot1/battery_status', '12']
    lesson05Lab.forEach((q, i) => {
      expect(q.check(right[i]), `question ${i + 1}`).toBe(true)
      expect(q.check(wrong[i]), `question ${i + 1}`).toBe(false)
    })
  })
})
