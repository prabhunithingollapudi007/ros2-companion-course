import { describe, expect, it } from 'vitest'
import solution from '../../../labs/lesson04/solution/power_monitor/src/battery_monitor.cpp?raw'
import { lesson04 } from '../transcripts'
import { code, lineOf } from './lesson04.code'
import { lesson04Lab } from './lesson04.lab'

// Each statement Lesson04.mdx makes, checked against what the commands printed
// in the course container, and every lab answer against the same recordings.

const out = (id: string) => lesson04.runs[id].output
const lines = (id: string) => out(id).split('\n')

describe('what Lesson 4 says, against the recordings', () => {
  it('the example package builds, and ROS knows its message', () => {
    expect(out('example-build')).toMatch(/Summary: 1 package finished/)
    expect(lines('example-interface')).toEqual(['string text', 'uint32 count'])
    expect(code.msg.code.trim()).toBe(out('example-interface'))
  })

  it('the build generates a snake_case C++ header and a Python class for the message', () => {
    expect(lines('generated-headers')).toContain('greeting.hpp')
    expect(out('generated-python')).toBe("greeter_cpp.msg.Greeting(text='hi', count=1)")
  })

  it('the greeter sends a numbered greeting every half second, and the listener receives them', () => {
    const sent = [...out('greeter').matchAll(/\[(\d+\.\d+)\] \[greeter\]: Sending greeting (\d+)/g)]
    expect(sent.map((m) => Number(m[2]))).toEqual([1, 2, 3, 4])
    expect(Number(sent[1][1]) - Number(sent[0][1])).toBeCloseTo(0.5, 1)
    expect(out('listener')).toMatch(/\[listener\]: Got 'hello' number \d+/)
    expect(lines('nodes')).toEqual(['/greeter', '/listener'])
    expect(out('topic-info')).toBe('Type: greeter_cpp/msg/Greeting\nPublisher count: 1\nSubscription count: 1')
    expect(out('echo-once')).toMatch(/^text: hello\ncount: \d+\n---$/)
  })

  it('the listings point at lines that exist', () => {
    for (const [file, text] of [
      [code.greeter, 'create_publisher'],
      [code.greeter, 'create_wall_timer'],
      [code.greeter, 'publisher_->publish(msg)'],
      [code.greeter, 'rclcpp::spin'],
      [code.listener, 'create_subscription'],
      [code.slowListener, 'sleep_for'],
      [code.cmake, 'rosidl_generate_interfaces'],
      [code.cmake, 'target_link_libraries'],
    ] as const) {
      expect(lineOf(file.code, text)).toBeGreaterThan(0)
    }
  })
})

describe('the Lesson 4 lab', () => {
  const rows = lines('lab-echo').map((r) => r.split(','))

  it('the reference solution reports what the lab specifies for every reading', () => {
    expect(rows.length).toBeGreaterThanOrEqual(5)
    for (const [v, p, low] of rows) {
      const want = Math.min(Math.max(((Number(v) - 21) / (25.2 - 21)) * 100, 0), 100)
      expect(Number(p)).toBeCloseTo(want, 1)
      expect(low === 'True').toBe(want < 20)
    }
  })

  it('the checker fails everything before the lab and passes the reference solution', () => {
    expect(out('lab-check-early')).toMatch(/0 of 11 checks passed\.$/)
    expect(out('lab-check')).toMatch(/All 11 checks passed\.$/)
    expect(solution).toContain('#include "power_monitor/msg/battery_status.hpp"')
  })

  it('each answer is the recorded one, and near misses are refused', () => {
    const at = (v: string) => rows.find((r) => r[0].startsWith(v))!
    const right = ['power_monitor/msg/battery_status.hpp', at('22.39')[1], at('21.6')[2] === 'True' ? 'yes' : 'no', 'power_monitor/msg/BatteryStatus', '11']
    const wrong = ['power_monitor/msg/BatteryStatus.hpp', '35', 'no', 'std_msgs/msg/Float32', '10']
    lesson04Lab.forEach((q, i) => {
      expect(q.check(right[i]), `question ${i + 1}`).toBe(true)
      expect(q.check(wrong[i]), `question ${i + 1}`).toBe(false)
    })
  })
})
