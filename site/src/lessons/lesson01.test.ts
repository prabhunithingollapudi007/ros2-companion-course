import { describe, expect, it } from 'vitest'
import { RELEASES, release, supportYears } from '../ros/releases'
import { lesson01 } from '../transcripts'
import { lesson01Lab } from './lesson01.lab'

// Each statement Lesson01.mdx makes, checked against what the commands printed
// in the course container, and every lab answer against the same recordings.

const out = (id: string) => lesson01.runs[id].output

describe('what Lesson 1 says, against the recordings', () => {
  it('without sourcing, ros2 is not found and there are no ROS variables', () => {
    expect(out('fresh-ros2')).toMatch(/ros2: command not found$/)
    expect(out('fresh-ros-vars')).toBe('')
  })

  it('sourcing prints nothing, and afterwards the ROS variables are set and ros2 is found', () => {
    expect(out('fresh-source')).toBe('')
    const vars = out('fresh-after').split('\n')
    expect(vars).toContain('ROS_DISTRO=jazzy')
    expect(vars).toContain('ROS_VERSION=2')
    expect(out('fresh-ament')).toBe('/opt/ros/jazzy')
    expect(out('fresh-path').split('\n')).toContain('/opt/ros/jazzy/bin')
    expect(out('fresh-which')).toBe('/opt/ros/jazzy/bin/ros2')
  })

  it('the container is Ubuntu 24.04 with Jazzy set up in every shell', () => {
    expect(out('os-release')).toMatch(/Ubuntu 24\.04/)
    expect(out('ros-distro')).toBe('jazzy')
  })

  it('ros2 --help lists the sub-commands the lesson names', () => {
    for (const verb of ['action', 'bag', 'doctor', 'interface', 'launch', 'node', 'param', 'pkg', 'run', 'service', 'topic']) {
      expect(out('ros2-help')).toMatch(new RegExp(`^  ${verb}\\s`, 'm'))
    }
  })

  it('ros2 pkg executables lists package and program, and the demo package has the talker and listener', () => {
    expect(out('pkg-executables').split('\n')).toEqual(['demo_nodes_cpp listener', 'demo_nodes_cpp talker'])
  })

  it('the listener heard greetings, went quiet, then heard the restarted talker count from 1', () => {
    const numbers = [...out('listener').matchAll(/Hello World: (\d+)/g)].map((m) => Number(m[1]))
    expect(numbers[0]).toBe(1)
    const restart = numbers.findIndex((n, i) => i > 0 && n < numbers[i - 1])
    expect(restart).toBeGreaterThan(0)
    expect(numbers[restart]).toBe(1)
  })
})

describe('the release timeline', () => {
  it('Jazzy was released in May 2024 and is supported for five years', () => {
    const jazzy = release('Jazzy')
    expect(jazzy.released).toEqual({ year: 2024, month: 5 })
    expect(supportYears(jazzy)).toBe(5)
  })

  it('since Humble, every long-term ROS 2 release came in May of an even year with five years of support', () => {
    for (const r of RELEASES.filter((r) => r.generation === 2 && r.lts && r.released.year >= 2022)) {
      expect(r.released.month).toBe(5)
      expect(r.released.year % 2).toBe(0)
      expect(supportYears(r)).toBe(5)
    }
    expect(supportYears(release('Foxy'))).toBe(3)
  })

  it('ROS 1 ended with Noetic in May 2025, and Lyrical is newer than Jazzy', () => {
    expect(release('Noetic').eol).toEqual({ year: 2025, month: 5 })
    expect(Math.max(...RELEASES.filter((r) => r.generation === 1).map((r) => r.eol.year))).toBe(2025)
    expect(release('Lyrical').released.year).toBe(2026)
  })
})

describe('the Lesson 1 lab answers come from the recordings', () => {
  const answers = ['jazzy', '24.04', out('pkg-executables-count'), 'listener', '1', 'no', 'command not found']
  it('each recorded answer is accepted', () => {
    lesson01Lab.forEach((q, i) => expect(q.check(answers[i]), `question ${i + 1}`).toBe(true))
  })
  it('near misses are refused', () => {
    const wrong = ['humble', '22.04', '27', 'talker', '0', 'yes', 'command found']
    lesson01Lab.forEach((q, i) => expect(q.check(wrong[i]), `question ${i + 1}`).toBe(false))
  })
  it('the answers are the ones recorded', () => {
    expect(out('after-stop')).toBe('/listener')
    expect(out('talker-again').split('\n')[0]).toContain("'Hello World: 1'")
    expect(out('lab-clean-shell')).toMatch(/command not found$/)
    expect(Number(out('pkg-executables-count'))).toBeGreaterThan(2)
  })
})
