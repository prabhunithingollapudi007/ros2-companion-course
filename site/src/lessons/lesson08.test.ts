import { describe, expect, it } from 'vitest'
import { BASE_TO_CAMERA, CAMERA_HEIGHT, MAP_TO_ODOM, apply, compose, detectionAt, fromRPY, invert, placedOnMap, robotInOdom, toRPY, LAB_OBJECT } from '../ros/frames'
import { lesson08 } from '../transcripts'
import { lesson08Lab } from './lesson08.lab'

// Each statement Lesson08.mdx makes, checked against what the commands printed
// in the course container; the frame model of the playgrounds against the same;
// and every lab answer against the recordings.

const out = (id: string) => lesson08.runs[id].output
const numbersIn = (text: string) => [...text.matchAll(/-?\d+\.\d+/g)].map((m) => Number(m[0]))

describe('what Lesson 8 says, against the recordings', () => {
  it('static_transform_publisher sends map -> odom once on /tf_static, with yaw 0.3 as a quaternion', () => {
    expect(out('static-pub')).toContain("from 'map' to 'odom'")
    expect(out('tf-static-echo')).toContain('frame_id: map')
    expect(out('tf-static-echo')).toContain('child_frame_id: odom')
    const q = fromRPY(0, 0, MAP_TO_ODOM.yaw)
    expect(out('tf-static-echo')).toContain(`z: ${q.z}`)
    expect(out('tf-static-echo')).toContain(`w: ${q.w}`)
  })

  it('tf2_echo prints the static transform at time 0, with its angle in radians and degrees', () => {
    const text = out('tf2-echo-static')
    expect(text).toContain('At time 0.0')
    expect(text).toContain('- Translation: [0.500, -0.200, 0.000]')
    expect(text).toContain('- Rotation: in RPY (radian) [0.000, -0.000, 0.300]')
    expect(text).toContain(`- Rotation: in RPY (degree) [0.000, -0.000, ${((0.3 * 180) / Math.PI).toFixed(3)}]`)
  })

  it('asked the other way round, tf2 inverts the transform', () => {
    const inv = invert(MAP_TO_ODOM)
    expect(out('tf2-echo-inverse')).toContain(`- Translation: [${inv.x.toFixed(3)}, ${inv.y.toFixed(3)}, 0.000]`)
  })

  it('a frame nobody publishes does not exist', () => {
    expect(out('tf2-echo-missing')).toContain('Invalid frame ID "nowhere" passed to canTransform argument source_frame - frame does not exist')
  })

  it('the demo is one tree: map -> odom -> base_link -> the rover’s links', () => {
    expect(out('world-frames').split('\n').filter((l) => l.includes('->'))).toEqual([
      '"base_link" -> "camera"',
      '"base_link" -> "caster"',
      '"base_link" -> "left_wheel"',
      '"base_link" -> "right_wheel"',
      '"map" -> "odom"',
      '"odom" -> "base_link"',
    ])
  })

  it('the camera is 7 cm above the map, and only turned about z', () => {
    const text = out('tf2-echo-moving')
    expect(text).toMatch(new RegExp(`- Translation: \\[-?\\d+\\.\\d{3}, -?\\d+\\.\\d{3}, ${CAMERA_HEIGHT.toFixed(3)}\\]`))
    expect(text).toMatch(/- Rotation: in RPY \(radian\) \[0\.000, -?0\.000, -?\d\.\d{3}\]/)
  })

  it('where_is: half a second apart the camera has turned 0.25 rad and moved along its circle', () => {
    const centre = compose(MAP_TO_ODOM, { x: 0, y: 1, yaw: 0 })
    const radius = Math.hypot(1, BASE_TO_CAMERA.x)
    const lines = out('where-is').split('\n')
    expect(lines.length).toBe(2)
    for (const line of lines) {
      const [[x1, y1], [x0, y0]] = [...line.matchAll(/x (-?\d+\.\d+) y (-?\d+\.\d+)/g)].map((m) => [Number(m[1]), Number(m[2])])
      const [h1, h0] = [...line.matchAll(/heading (-?\d+) deg/g)].map((m) => Number(m[1]))
      expect(Math.abs(((h1 - h0 + 540) % 360) - 180 - 14.3)).toBeLessThanOrEqual(1)
      expect(Math.hypot(x1 - x0, y1 - y0)).toBeCloseTo(2 * radius * Math.sin(0.125), 1)
      for (const [x, y] of [
        [x1, y1],
        [x0, y0],
      ]) {
        expect(Math.abs(Math.hypot(x - centre.x, y - centre.y) - radius)).toBeLessThan(0.01)
      }
    }
  })

  it('tf2 will not extrapolate into the future', () => {
    expect(out('where-is-ahead')).toContain('Lookup would require extrapolation into the future')
  })
})

describe("the playgrounds' frame model", () => {
  it('composing a transform with its inverse gives no transform', () => {
    const t = compose(MAP_TO_ODOM, robotInOdom(2.3))
    const back = compose(t, invert(t))
    expect(back.x).toBeCloseTo(0, 12)
    expect(back.y).toBeCloseTo(0, 12)
    expect(back.yaw).toBeCloseTo(0, 12)
    expect(apply(invert(t), apply(t, { x: 1, y: 2 })).x).toBeCloseTo(1, 12)
  })

  it('quaternions go to roll, pitch, yaw and back', () => {
    for (const rpy of [
      [0.1, -0.4, 2.0],
      [-1.2, 0.3, -0.7],
    ]) {
      const back = toRPY(fromRPY(rpy[0], rpy[1], rpy[2]))
      back.forEach((v, i) => expect(v).toBeCloseTo(rpy[i], 12))
    }
  })

  it("the lab's detections land on the object at their own stamp, and tens of centimetres off with the latest transform", () => {
    for (const t of [1, 4.2, 9]) {
      const right = placedOnMap(t, t)
      expect(Math.hypot(right.x - LAB_OBJECT.x, right.y - LAB_OBJECT.y)).toBeLessThan(1e-12)
      const wrong = placedOnMap(t, t + 0.3)
      expect(Math.hypot(wrong.x - LAB_OBJECT.x, wrong.y - LAB_OBJECT.y)).toBeGreaterThan(0.1)
    }
    expect(Number.isFinite(detectionAt(0).x)).toBe(true)
  })
})

describe('the Lesson 8 lab', () => {
  it('the checker fails before the lab and passes the reference solution', () => {
    expect(out('lab-check-early')).toMatch(/0 of 7 checks passed\.$/)
    expect(out('lab-check')).toMatch(/All 7 checks passed\.$/)
    expect(out('lab-detections')).toContain('frame_id: camera')
    expect(out('lab-detections')).toContain(`z: ${-CAMERA_HEIGHT}`)
  })

  it('each answer is the recorded one, and near misses are refused', () => {
    const right = ['odom', '-0.419', '0.9888', 'future', '7']
    const wrong = ['map', '-0.5', '0.3', 'past', '6']
    lesson08Lab.forEach((q, i) => {
      expect(q.check(right[i]), `question ${i + 1}`).toBe(true)
      expect(q.check(wrong[i]), `question ${i + 1}`).toBe(false)
    })
    expect(numbersIn(out('tf2-echo-inverse'))).toContain(-0.419)
    expect(out('tf-static-echo')).toContain('w: 0.9887710779360422')
  })
})
