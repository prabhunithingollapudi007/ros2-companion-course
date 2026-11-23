import { useState } from 'react'
import { Playground, Slider } from '../../components/Playground'
import { LAB_DELAY, LAB_OBJECT, MAP_TO_ODOM, cameraInMap, compose, placedOnMap, robotInOdom, type Pose } from '../../ros/frames'
import '../playgrounds.css'

const S = 120
const O = { x: 250, y: 290 }
const px = (p: { x: number; y: number }) => [O.x + p.x * S, O.y - p.y * S] as const

function Camera({ pose, faded }: { pose: Pose; faded?: boolean }) {
  const [x, y] = px(pose)
  const [hx, hy] = px({ x: pose.x + 0.3 * Math.cos(pose.yaw), y: pose.y + 0.3 * Math.sin(pose.yaw) })
  return (
    <g className={faded ? 'fig-faded' : undefined}>
      <line x1={x} y1={y} x2={hx} y2={hy} className="fig-line-s2" />
      <circle cx={x} cy={y} r={5} className="fig-fill-s2" />
    </g>
  )
}

export function TimeTravelPlayground() {
  const [seen, setSeen] = useState(3)
  const [delay, setDelay] = useState(LAB_DELAY)
  const arrived = seen + delay

  const right = placedOnMap(seen, seen)
  const wrong = placedOnMap(seen, arrived)
  const error = Math.hypot(wrong.x - LAB_OBJECT.x, wrong.y - LAB_OBJECT.y)
  const path = Array.from({ length: 64 }, (_, i) => px(compose(MAP_TO_ODOM, robotInOdom((i / 63) * 4 * Math.PI))))
  const [ox, oy] = px(LAB_OBJECT)
  const [rx, ry] = px(right)
  const [wx, wy] = px(wrong)

  return (
    <Playground
      title="Looking up a transform at an earlier time"
      caption={
        <>
          The lab&apos;s world: the robot drives round the dashed circle and its camera sees the square object, which stands
          still. Each detection says where the object was <em>in the camera frame, at the moment it was seen</em>, and
          arrives a little later. Placed on the map with the camera&apos;s pose from that moment, it lands on the object.
          Placed with the latest pose, from when it arrived, it lands where the camera has moved on to.
        </>
      }
    >
      <div className="controls">
        <Slider label="When the camera saw the object" value={seen} min={0} max={12} step={0.1} onChange={setSeen} format={(v) => `${v.toFixed(1)} s`} />
        <Slider label="How late the detection arrives" value={delay} min={0} max={1} step={0.05} onChange={setDelay} format={(v) => `${v.toFixed(2)} s`} />
      </div>

      <div className="figure-scroll">
        <svg viewBox="0 0 720 330" className="graph-svg" role="img" aria-label={`Using the latest transform puts the object ${(error * 100).toFixed(0)} centimetres away from where it is.`}>
          <polyline points={path.map((p) => p.join(',')).join(' ')} className="fig-line-muted fig-dash" fill="none" />
          <Camera pose={cameraInMap(arrived)} faded />
          <Camera pose={cameraInMap(seen)} />
          <line x1={px(cameraInMap(seen))[0]} y1={px(cameraInMap(seen))[1]} x2={ox} y2={oy} className="fig-line-s1 fig-dash" />
          <rect x={ox - 8} y={oy - 8} width={16} height={16} rx={2} className="fig-box-accent" />
          <circle cx={rx} cy={ry} r={5} className="fig-dot-s1" />
          <circle cx={wx} cy={wy} r={6} className="fig-dot-s2" />
          <line x1={ox} y1={oy} x2={wx} y2={wy} className="fig-line-s2" />
          <text x={ox + 14} y={oy + 26} className="fig-small">
            the object (square), and where the stamp puts it (blue)
          </text>
          <text x={wx + 10} y={wy - 10} className="fig-small">
            where the latest pose puts it (orange)
          </text>
          <text x={20} y={24} className="fig-small">
            Camera when it saw the object (solid) and when the detection arrived (faded)
          </text>
        </svg>
      </div>

      <div className="cards">
        <div className="card">
          <div className="card-title">Transform at the detection&apos;s stamp</div>
          <div className="card-value">{(Math.hypot(right.x - LAB_OBJECT.x, right.y - LAB_OBJECT.y) * 100).toFixed(1)} cm off</div>
          <div className="card-note">
            <code>buffer.transform(point, &quot;map&quot;, timeout)</code> uses the point&apos;s own stamp
          </div>
        </div>
        <div className="card">
          <div className="card-title">The latest transform</div>
          <div className="card-value">{(error * 100).toFixed(1)} cm off</div>
          <div className="card-note">
            a lookup at <code>TimePointZero</code>, made when the detection arrived
          </div>
        </div>
      </div>
    </Playground>
  )
}
