import { describe, expect, it } from 'vitest'
import { ROVER, ROVER_JOINTS, boxInertia, expandWheelJoint, jointStateText, pyNumber, sliderRange } from '../ros/rover'
import { lesson07 } from '../transcripts'
import { lesson07Lab } from './lesson07.lab'

// Each statement Lesson07.mdx makes, checked against what the commands printed
// in the course container; the playgrounds' model against the same output; and
// every lab answer against the recordings.

const out = (id: string) => lesson07.runs[id].output
const lines = (id: string) => out(id).split('\n')

describe('what Lesson 7 says, against the recordings', () => {
  it('xacro turns the 99-line file into 120 lines of URDF', () => {
    expect(lines('xacro-lines')).toEqual(['99 src/rover_description/urdf/rover.urdf.xacro', '120'])
  })

  it('check_urdf finds the rover, rooted at base_link with four children', () => {
    expect(out('check-urdf')).toContain('robot name is: rover')
    expect(out('check-urdf')).toContain('root Link: base_link has 4 child(ren)')
    const children = [...out('check-urdf').matchAll(/child\(\d\):\s+(\S+)/g)].map((m) => m[1])
    expect(children.sort()).toEqual(ROVER_JOINTS.map((j) => j.child).sort())
  })

  it('the launch starts robot_state_publisher, joint_state_publisher and RViz, and robot_state_publisher warns about the root inertia', () => {
    expect(lines('view-nodes')).toEqual(expect.arrayContaining(['/joint_state_publisher', '/robot_state_publisher', '/rviz']))
    expect(lines('view-nodes').some((n) => n.startsWith('/transform_listener_impl_'))).toBe(true)
    expect(lines('view-topics')).toEqual(expect.arrayContaining(['/joint_states', '/robot_description', '/tf', '/tf_static']))
    expect(out('view-launch')).toContain('KDL does not support a root link with an inertia')
  })

  it('/joint_states lists the movable joints only, all at zero without the sliders', () => {
    const text = out('joint-states')
    const shown = text.slice(text.indexOf('name:'), text.indexOf('velocity:')).trim()
    expect(shown).toBe(jointStateText({}))
    expect(text).not.toContain('caster_joint')
  })
})

describe("the playgrounds' model of the rover", () => {
  it('the wheel macro expands to exactly what xacro printed', () => {
    expect(expandWheelJoint('left', 1, ROVER)).toBe(out('xacro-left'))
    expect(expandWheelJoint('right', -1, ROVER)).toBe(out('xacro-right'))
  })

  it('the box inertia formula gives the numbers xacro wrote for the base', () => {
    const { ixx, iyy, izz } = boxInertia(ROVER.baseMass, ROVER.baseLength, ROVER.baseWidth, ROVER.baseHeight)
    expect(out('xacro-inertia')).toContain(`<mass value="${pyNumber(ROVER.baseMass)}"/>`)
    expect(out('xacro-inertia')).toContain(`ixx="${pyNumber(ixx)}"`)
    expect(out('xacro-inertia')).toContain(`iyy="${pyNumber(iyy)}"`)
    expect(out('xacro-inertia')).toContain(`izz="${pyNumber(izz)}"`)
  })

  it('sliders exist for movable joints only, with the limits from the file', () => {
    expect(sliderRange('fixed')).toBeNull()
    expect(sliderRange('revolute')).toEqual([-Math.PI / 2, Math.PI / 2])
    expect(sliderRange('continuous')).toEqual([-Math.PI, Math.PI])
  })
})

describe('the Lesson 7 lab', () => {
  it('the checker fails before the lab and passes the reference solution', () => {
    expect(out('lab-check-early')).toMatch(/0 of 13 checks passed\.$/)
    expect(out('lab-check')).toMatch(/All 13 checks passed\.$/)
  })

  it('the quad base inertia is that of a 6 kg box', () => {
    const { izz } = boxInertia(6, 0.5, 0.3, 0.12)
    expect(out('lab-inertia')).toContain(`izz="${pyNumber(izz)}"`)
  })

  it('each answer is the recorded one, and near misses are refused', () => {
    const right = ['120', '-0.17', 'robot_state_publisher', '4', '0.17', '13']
    const wrong = ['99', '0.17', 'joint_state_publisher', '5', '0.034', '12']
    lesson07Lab.forEach((q, i) => {
      expect(q.check(right[i]), `question ${i + 1}`).toBe(true)
      expect(q.check(wrong[i]), `question ${i + 1}`).toBe(false)
    })
    expect(out('xacro-right')).toContain('xyz="0.1 -0.16999999999999998 0"')
  })
})
