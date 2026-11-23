import { useState } from 'react'
import { Playground, Slider } from '../../components/Playground'
import { BASE_TO_CAMERA, LAB_OBJECT, MAP_TO_ODOM, apply, compose, invert, robotInOdom, wrap, type Pose } from '../../ros/frames'
import '../playgrounds.css'

// Map coordinates to the drawing: x to the right, y up, 150 pixels per metre.
const S = 150
const O = { x: 190, y: 285 }
const px = (p: { x: number; y: number }) => [O.x + p.x * S, O.y - p.y * S] as const
const deg = (r: number) => Math.round((wrap(r) * 180) / Math.PI)
const f2 = (v: number) => (Math.abs(v) < 0.005 ? 0 : v).toFixed(2)

function Axes({ pose, name, strong = false }: { pose: Pose; name: string; strong?: boolean }) {
  const [x, y] = px(pose)
  const len = strong ? 0.32 : 0.24
  const [xx, xy] = px({ x: pose.x + len * Math.cos(pose.yaw), y: pose.y + len * Math.sin(pose.yaw) })
  const [yx, yy] = px({ x: pose.x - len * Math.sin(pose.yaw), y: pose.y + len * Math.cos(pose.yaw) })
  return (
    <g>
      <line x1={x} y1={y} x2={xx} y2={xy} className="fig-line-s2" />
      <line x1={x} y1={y} x2={yx} y2={yy} className="fig-line-s3" />
      <circle cx={x} cy={y} r={3} className="fig-fill-ink" />
      <text x={x - 6} y={y + 16} textAnchor="end" className="fig-mono">
        {name}
      </text>
    </g>
  )
}

export function FrameTreePlayground() {
  const [t, setT] = useState(2)
  const [odomYaw, setOdomYaw] = useState(MAP_TO_ODOM.yaw)
  const [odomX, setOdomX] = useState(MAP_TO_ODOM.x)

  const mapToOdom: Pose = { x: odomX, y: MAP_TO_ODOM.y, yaw: odomYaw }
  const odomToBase = robotInOdom(t)
  const mapToBase = compose(mapToOdom, odomToBase)
  const mapToCamera = compose(mapToBase, BASE_TO_CAMERA)
  const frames: { name: string; pose: Pose; chain: string }[] = [
    { name: 'map', pose: { x: 0, y: 0, yaw: 0 }, chain: '(the root)' },
    { name: 'odom', pose: mapToOdom, chain: 'map → odom' },
    { name: 'base_link', pose: mapToBase, chain: 'map → odom → base_link' },
    { name: 'camera', pose: mapToCamera, chain: 'map → odom → base_link → camera' },
  ]

  // The robot's path: the circle in odom, drawn in map.
  const path = Array.from({ length: 64 }, (_, i) => px(compose(mapToOdom, robotInOdom((i / 63) * 4 * Math.PI))))
  const [ox, oy] = px(LAB_OBJECT)

  return (
    <Playground
      title="A frame tree you can move"
      caption={
        <>
          The demo&apos;s frames on the map: red for each frame&apos;s x axis, green for its y. Time moves the robot round
          its circle in <code>odom</code>, as circle_broadcaster does; the other two sliders move <code>odom</code> on the
          map, as a localisation system would when it corrects its estimate. The table gives the same object&apos;s
          coordinates in every frame.
        </>
      }
    >
      <div className="controls controls-3">
        <Slider label="Time since the robot set off" value={t} min={0} max={12.6} step={0.1} onChange={setT} format={(v) => `${v.toFixed(1)} s`} />
        <Slider label={<>odom&apos;s x on the map</>} value={odomX} min={-0.5} max={1.5} step={0.05} onChange={setOdomX} format={(v) => `${v.toFixed(2)} m`} />
        <Slider label={<>odom&apos;s yaw on the map</>} value={odomYaw} min={-Math.PI} max={Math.PI} step={0.05} onChange={setOdomYaw} format={(v) => `${deg(v)}°`} />
      </div>

      <div className="figure-scroll">
        <svg viewBox="0 0 720 340" className="graph-svg" role="img" aria-label={`Map view. The robot's camera is at x ${f2(mapToCamera.x)}, y ${f2(mapToCamera.y)} on the map, heading ${deg(mapToCamera.yaw)} degrees.`}>
          {Array.from({ length: 8 }, (_, i) => (
            <line key={`v${i}`} x1={O.x + (i - 1) * S} y1={10} x2={O.x + (i - 1) * S} y2={330} className="fig-line-muted" opacity={0.35} />
          ))}
          {Array.from({ length: 3 }, (_, i) => (
            <line key={`h${i}`} x1={10} y1={O.y - i * S} x2={710} y2={O.y - i * S} className="fig-line-muted" opacity={0.35} />
          ))}
          <polyline points={path.map((p) => p.join(',')).join(' ')} className="fig-line-muted fig-dash" fill="none" />
          <rect x={ox - 7} y={oy - 7} width={14} height={14} rx={2} className="fig-fill-s1" />
          <text x={ox + 12} y={oy + 4} className="fig-small">
            object
          </text>
          {frames.map((f) => (
            <Axes key={f.name} pose={f.pose} name={f.name} strong={f.name === 'map'} />
          ))}
        </svg>
      </div>

      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Frame</th>
              <th>Where it is on the map</th>
              <th>The object, in this frame</th>
            </tr>
          </thead>
          <tbody>
            {frames.map((f) => {
              const o = apply(invert(f.pose), LAB_OBJECT)
              return (
                <tr key={f.name}>
                  <td>
                    <code>{f.name}</code>
                    <div className="dim small">{f.chain}</div>
                  </td>
                  <td className="mono">
                    x {f2(f.pose.x)}, y {f2(f.pose.y)}, yaw {deg(f.pose.yaw)}°
                  </td>
                  <td className="mono">
                    x {f2(o.x)}, y {f2(o.y)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Playground>
  )
}
