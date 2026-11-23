import { useState } from 'react'
import { Playground } from '../../components/Playground'
import { code } from '../../lessons/lesson16.code'
import { CPP_PAIRS } from '../../ros/port'
import '../playgrounds.css'

const lines = (text: string) => text.replace(/\r\n/g, '\n').replace(/\n$/, '').split('\n')
const ROS1 = lines(code.ros1Cpp.code)
const ROS2 = lines(code.ros2Cpp.code)
const find = (all: string[], text: string) => all.findIndex((l) => l.includes(text))

function Column({ title, all, marked, onPick, side }: { title: string; all: string[]; marked: number; onPick: (line: number) => void; side: 'ros1' | 'ros2' }) {
  return (
    <div className="side-col">
      <div className="side-title">{title}</div>
      <pre className="xacro-text side-code">
        {all.map((l, i) => {
          const pair = CPP_PAIRS.findIndex((p) => find(all, side === 'ros1' ? p.ros1 : p.ros2) === i)
          return (
            <span
              key={i}
              className={`side-line ${pair >= 0 ? 'is-mapped' : ''} ${i === marked ? 'is-marked' : ''}`}
              onClick={pair >= 0 ? () => onPick(pair) : undefined}
            >
              {l || ' '}
              {'\n'}
            </span>
          )
        })}
      </pre>
    </div>
  )
}

export function SideBySidePlayground() {
  const [pick, setPick] = useState(3)
  const pair = CPP_PAIRS[pick]

  return (
    <Playground
      title="The same node in ROS 1 and ROS 2, side by side"
      caption={
        <>
          odom_logger as it was in ROS 1, and as ported. Underlined lines have a counterpart: click one, or step through
          them. Most changes are renames; the ones marked <em>meaning</em> change how the program behaves, and are where
          ports go wrong.
        </>
      }
    >
      <div className="button-row">
        <button type="button" className="btn btn-small" onClick={() => setPick((p) => (p + CPP_PAIRS.length - 1) % CPP_PAIRS.length)}>
          Previous
        </button>
        <button type="button" className="btn btn-small btn-primary" onClick={() => setPick((p) => (p + 1) % CPP_PAIRS.length)}>
          Next
        </button>
        <span className="small dim">
          {pick + 1} of {CPP_PAIRS.length}
        </span>
      </div>
      <p className={`side-note ${pair.kind === 'meaning' ? 'is-meaning' : ''}`} aria-live="polite">
        <strong>{pair.kind === 'meaning' ? 'Meaning: ' : 'Rename: '}</strong>
        {pair.what}
      </p>
      <div className="xacro-pair">
        <Column title="ROS 1 (roscpp)" all={ROS1} marked={find(ROS1, pair.ros1)} onPick={setPick} side="ros1" />
        <Column title="ROS 2 (rclcpp)" all={ROS2} marked={find(ROS2, pair.ros2)} onPick={setPick} side="ros2" />
      </div>
    </Playground>
  )
}
