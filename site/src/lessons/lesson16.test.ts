import { describe, expect, it } from 'vitest'
import { BUILD_PAIRS, CPP_PAIRS } from '../ros/port'
import { lesson16 } from '../transcripts'
import { code } from './lesson16.code'
import { lesson16Lab } from './lesson16.lab'

// Each statement Lesson16.mdx makes, checked against what the commands printed
// in the course container; the side-by-side playground against the files; and
// every lab answer.

const out = (id: string) => lesson16.runs[id].output

describe('what Lesson 16 says, against the recordings', () => {
  it('the port builds, takes its parameter and remapping from the XML launch file, and adds up the distance', () => {
    expect(out('port-info')).toContain('/rover/odom: nav_msgs/msg/Odometry')
    expect(out('port-info')).toContain('/distance: std_msgs/msg/Float64')
    expect(out('port-param')).toBe('Double value is: 0.5')
    expect(out('port-log')).toContain('driven 1.50 m')
    expect(out('port-distance')).toContain('data: 1.5')
  })
})

describe('the side-by-side playground', () => {
  it('every pair names lines that are in the files', () => {
    for (const p of CPP_PAIRS) {
      expect(code.ros1Cpp.code, p.ros1).toContain(p.ros1)
      expect(code.ros2Cpp.code, p.ros2).toContain(p.ros2)
    }
    const ros1 = code.ros1Cmake.code + code.ros1Xml.code + code.ros1Launch.code
    const ros2 = code.ros2Cmake.code + code.ros2Xml.code + code.ros2Launch.code
    for (const p of BUILD_PAIRS) {
      expect(ros1, p.ros1).toContain(p.ros1)
      expect(ros2, p.ros2).toContain(p.ros2)
    }
  })

  it('the ROS 1 code is ROS 1 and the port has none of it left', () => {
    expect(code.ros1Cpp.code).toContain('ros::NodeHandle')
    expect(code.ros2Cpp.code).not.toMatch(/ros::|ROS_INFO|NodeHandle/)
  })
})

describe('the Lesson 16 lab', () => {
  it('the checker fails before the port and passes the reference solution', () => {
    expect(out('lab-check-early')).toMatch(/0 of 7 checks passed\.$/)
    expect(out('lab-check')).toMatch(/All 7 checks passed\.$/)
    expect(out('lab-run')).toMatch(/^alive \d+\n---\nDouble value is: 5\.0$/)
  })

  it('each answer is the recorded one, and near misses are refused', () => {
    const right = ['/rover/odom', '1.5', 'type becomes exec', '7']
    const wrong = ['/odom', '1.0', 'name', '6']
    lesson16Lab.forEach((q, i) => {
      expect(q.check(right[i]), `question ${i + 1}`).toBe(true)
      expect(q.check(wrong[i]), `question ${i + 1}`).toBe(false)
    })
  })
})
