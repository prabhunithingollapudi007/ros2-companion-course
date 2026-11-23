import { useState } from 'react'
import { Playground, Slider } from '../../components/Playground'
import { ROVER, expandWheelJoint, pyNumber } from '../../ros/rover'
import '../playgrounds.css'

const S = 450 // pixels per metre in the drawing
const round = (v: number) => Math.round(v * 100) / 100

/** The xacro side: the three properties the wheel's position depends on, and the two calls. */
function source(d: { baseWidth: number; wheelWidth: number; wheelX: number }) {
  return [
    `<xacro:property name="base_width" value="${d.baseWidth.toFixed(2)}"/>`,
    `<xacro:property name="wheel_width" value="${d.wheelWidth.toFixed(2)}"/>`,
    `<xacro:property name="wheel_x" value="${d.wheelX.toFixed(2)}"/>`,
    '',
    '<xacro:macro name="wheel" params="side reflect">',
    '  ...',
    '  <origin xyz="${wheel_x} ${reflect * (base_width/2 + wheel_width/2)} 0"',
    '          rpy="${-pi/2} 0 0"/>',
    '  ...',
    '</xacro:macro>',
    '',
    '<xacro:wheel side="left" reflect="1"/>',
    '<xacro:wheel side="right" reflect="-1"/>',
  ].join('\n')
}

export function MacroPlayground() {
  const [baseWidth, setBaseWidth] = useState(ROVER.baseWidth)
  const [wheelWidth, setWheelWidth] = useState(ROVER.wheelWidth)
  const [wheelX, setWheelX] = useState(ROVER.wheelX)
  const d = { baseWidth, wheelWidth, wheelX }
  const y = baseWidth / 2 + wheelWidth / 2

  // Top view, forward up the page; the base keeps the rover's length.
  const cx = 360
  const cy = 125
  const px = (yy: number) => cx - yy * S
  const py = (xx: number) => cy - xx * S

  return (
    <Playground
      title="One xacro macro, two wheels"
      caption={
        <>
          Change a property and both wheels follow, because each is one call of the same macro. On the right is what xacro
          writes for each call, in its own number format: Python&apos;s. With the rover&apos;s numbers it is character for
          character what <code>xacro</code> printed in the container, <code>0.16999999999999998</code> included.
        </>
      }
    >
      <div className="controls controls-3">
        <Slider label={<code>base_width</code>} value={baseWidth} min={0.2} max={0.5} step={0.01} onChange={(v) => setBaseWidth(round(v))} format={(v) => `${v.toFixed(2)} m`} />
        <Slider label={<code>wheel_width</code>} value={wheelWidth} min={0.02} max={0.08} step={0.01} onChange={(v) => setWheelWidth(round(v))} format={(v) => `${v.toFixed(2)} m`} />
        <Slider label={<code>wheel_x</code>} value={wheelX} min={-0.15} max={0.15} step={0.01} onChange={(v) => setWheelX(round(v))} format={(v) => `${v.toFixed(2)} m`} />
      </div>

      <div className="figure-scroll">
        <svg viewBox="0 0 720 250" className="graph-svg" role="img" aria-label={`From above: wheels at x ${pyNumber(wheelX)} m and y plus or minus ${y.toFixed(3)} m.`}>
          <rect x={px(baseWidth / 2)} y={py(ROVER.baseLength / 2)} width={baseWidth * S} height={ROVER.baseLength * S} rx={4} className="fig-box-accent" />
          {[1, -1].map((s) => (
            <g key={s}>
              <rect
                x={px(s * y + wheelWidth / 2)}
                y={py(wheelX + ROVER.wheelRadius)}
                width={wheelWidth * S}
                height={2 * ROVER.wheelRadius * S}
                rx={3}
                className="fig-fill-ink"
              />
              <circle cx={px(s * y)} cy={py(wheelX)} r={3.5} className="fig-dot-s1" />
              <text x={px(s * y) + (s > 0 ? -18 : 18)} y={py(wheelX) + 4} textAnchor={s > 0 ? 'end' : 'start'} className="fig-mono">
                y = {s > 0 ? '' : '−'}
                {y.toFixed(3)}
              </text>
            </g>
          ))}
          <circle cx={cx} cy={cy} r={3.5} className="fig-fill-ink" />
          <text x={cx} y={cy + 18} textAnchor="middle" className="fig-small">
            base_link
          </text>
          <line x1={cx} y1={cy} x2={cx} y2={py(wheelX)} className="fig-line-muted" />
        </svg>
      </div>

      <div className="xacro-pair">
        <pre className="xacro-text" aria-label="The xacro source">
          {source(d)}
        </pre>
        <pre className="xacro-text" aria-label="What xacro writes">
          {expandWheelJoint('left', 1, d)}
          {'\n'}
          {expandWheelJoint('right', -1, d)}
        </pre>
      </div>
    </Playground>
  )
}
