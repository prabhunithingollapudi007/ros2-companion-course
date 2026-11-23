import { useState } from 'react'
import { Playground } from '../../components/Playground'
import { DIRECTIONS, PAIRS, bridgeRule, canBridge, type Direction } from '../../ros/bridge'
import '../playgrounds.css'

export function BridgePlayground() {
  const [topic, setTopic] = useState('/cmd_vel')
  const [ros, setRos] = useState(PAIRS[0].ros)
  const [gz, setGz] = useState(PAIRS[0].gz)
  const [direction, setDirection] = useState<Direction>(']')
  const ok = canBridge(ros, gz)
  const clean = topic.trim() || '/topic'
  const rule = bridgeRule(clean, ros, direction, gz)
  const toRos = direction !== ']'
  const toGz = direction !== '['

  return (
    <Playground
      title="Building a bridge rule"
      caption={
        <>
          Gazebo and ROS each have their own messages and their own transport, so nothing passes between them until a
          bridge carries it. Each rule names one topic, its type on each side, and which way it goes. A rule whose two
          types have no conversion is refused when the bridge starts.
        </>
      }
    >
      <div className="controls">
        <label className="select-field">
          <span className="slider-label">Topic</span>
          <span className="arg-field">
            <input value={topic} onChange={(e) => setTopic(e.target.value)} aria-label="Topic name" spellCheck={false} />
          </span>
        </label>
        <label className="select-field">
          <span className="slider-label">Direction</span>
          <select value={direction} onChange={(e) => setDirection(e.target.value as Direction)}>
            {DIRECTIONS.map((d) => (
              <option key={d.sign} value={d.sign}>
                {d.sign} {d.what}
              </option>
            ))}
          </select>
        </label>
        <label className="select-field">
          <span className="slider-label">ROS type</span>
          <select
            value={ros}
            onChange={(e) => {
              // Choosing a ROS type picks its usual Gazebo partner; change that one to see a mismatch.
              setRos(e.target.value)
              setGz(PAIRS.find((p) => p.ros === e.target.value)?.gz ?? gz)
            }}
          >
            {PAIRS.map((p) => (
              <option key={p.ros} value={p.ros}>
                {p.ros}
              </option>
            ))}
          </select>
        </label>
        <label className="select-field">
          <span className="slider-label">Gazebo type</span>
          <select value={gz} onChange={(e) => setGz(e.target.value)}>
            {PAIRS.map((p) => (
              <option key={p.gz} value={p.gz}>
                {p.gz}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="figure-scroll">
        <svg viewBox="0 0 720 150" className="graph-svg" role="img" aria-label={ok ? `Messages on ${clean} go ${DIRECTIONS.find((d) => d.sign === direction)?.what}.` : 'These two types cannot be bridged.'}>
          <rect x={20} y={40} width={200} height={70} rx={10} className="fig-box" />
          <text x={120} y={70} textAnchor="middle" className="fig-mono-strong">
            Gazebo
          </text>
          <text x={120} y={92} textAnchor="middle" className="fig-mono">
            {gz}
          </text>
          <rect x={500} y={40} width={200} height={70} rx={10} className="fig-box-accent" />
          <text x={600} y={70} textAnchor="middle" className="fig-mono-strong">
            ROS 2
          </text>
          <text x={600} y={92} textAnchor="middle" className="fig-small">
            {ros}
          </text>
          <rect x={290} y={55} width={140} height={40} rx={8} className={ok ? 'topic-box' : 'topic-box is-mixed'} />
          <text x={360} y={80} textAnchor="middle" className="fig-topic">
            {ok ? 'parameter_bridge' : 'no conversion'}
          </text>
          {ok && toRos && <line x1={222} y1={66} x2={498} y2={66} className="fig-line-s1" markerEnd="url(#bridge-arrow)" opacity={0.9} />}
          {ok && toGz && <line x1={498} y1={86} x2={222} y2={86} className="fig-line-s2" markerEnd="url(#bridge-arrow-2)" opacity={0.9} />}
          <defs>
            <marker id="bridge-arrow" markerWidth={10} markerHeight={10} refX={8.5} refY={5} orient="auto">
              <path d="M0,1 L9,5 L0,9 Z" className="fig-fill-s1" />
            </marker>
            <marker id="bridge-arrow-2" markerWidth={10} markerHeight={10} refX={8.5} refY={5} orient="auto">
              <path d="M0,1 L9,5 L0,9 Z" className="fig-fill-s2" />
            </marker>
          </defs>
          <text x={360} y={135} textAnchor="middle" className="fig-small">
            {ok ? `${clean}: ${PAIRS.find((p) => p.ros === ros)?.use}` : `the bridge has no conversion between ${ros} and ${gz}`}
          </text>
        </svg>
      </div>

      <pre className="xacro-text" aria-label="The command">
        {`ros2 run ros_gz_bridge parameter_bridge ${rule}`}
      </pre>
    </Playground>
  )
}
