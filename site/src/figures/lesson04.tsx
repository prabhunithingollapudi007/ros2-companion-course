import { lesson04 } from '../transcripts'
import { arrow } from './arrows'
import { Figure } from './Figure'

/** The parts every rclcpp node has, and when each runs. */
export function NodeAnatomy() {
  const rows: { part: string; code: string; when: string; accent?: boolean }[] = [
    { part: 'main', code: 'rclcpp::init(argc, argv)', when: 'once: connect this program to ROS' },
    { part: 'constructor', code: 'Node("greeter")', when: 'once: give the node its name', accent: true },
    { part: '', code: 'create_publisher<Greeting>("greetings", 10)', when: 'once: say what it will publish', accent: true },
    { part: '', code: 'create_wall_timer(500ms, ...)', when: 'once: ask to be called every 500 ms', accent: true },
    { part: 'callback', code: 'tick(): publisher_->publish(msg)', when: 'every time the timer fires' },
    { part: 'main', code: 'rclcpp::spin(node)', when: 'runs until Ctrl+C, calling callbacks' },
    { part: 'main', code: 'rclcpp::shutdown()', when: 'once, on the way out' },
  ]
  return (
    <Figure
      height={330}
      label="The structure of the greeter node. main calls rclcpp::init, then creates the node. The node's constructor names it and creates a publisher and a timer. The timer's callback publishes a message each time it fires. main then calls rclcpp::spin, which runs until Ctrl+C and calls the callbacks, and finally rclcpp::shutdown."
      caption="Nothing in the constructor sends a message. It only sets things up: a name, a publisher, a timer. Messages go out later, from the callback, and only because spin keeps the program alive and calls the callback whenever the timer fires. A subscriber node has the same shape with a subscription instead of a timer."
    >
      {rows.map((r, i) => {
        const y = 12 + i * 44
        return (
          <g key={r.code}>
            <text x={16} y={y + 22} className="fig-label">
              {r.part}
            </text>
            <rect x={122} y={y} width={360} height={34} rx={7} className={r.accent ? 'fig-box-accent' : 'fig-box'} />
            <text x={136} y={y + 22} className="fig-mono">
              {r.code}
            </text>
            <text x={494} y={y + 22} className="fig-small">
              {r.when}
            </text>
          </g>
        )
      })}
      {/* spin (row 6) calls the callback (row 5) */}
      <path d="M121,249 C104,249 104,205 119,205" className="fig-line-s1" markerEnd={arrow('s1')} />
    </Figure>
  )
}

/** What rclcpp::spin does with a single thread. */
export function SpinLoop() {
  return (
    <Figure
      height={250}
      label="rclcpp::spin is a loop. It waits until something is ready: a timer is due or a message has arrived. It then runs that one callback to the end, and goes back to waiting. While a callback runs, nothing else in the node runs; new messages wait in the subscription's queue."
      caption="Spin runs one callback at a time, each to the end, on one thread. That keeps callbacks simple, because two never run at once in the same node, but a slow callback holds up everything else. Lesson 15 shows how to run callbacks in parallel when that matters."
    >
      <rect x={250} y={20} width={220} height={52} rx={26} className="fig-box-accent" />
      <text x={360} y={51} textAnchor="middle" className="fig-strong">
        wait for something ready
      </text>
      <rect x={250} y={168} width={220} height={52} rx={10} className="fig-box" />
      <text x={360} y={192} textAnchor="middle" className="fig-strong">
        run that callback
      </text>
      <text x={360} y={210} textAnchor="middle" className="fig-small">
        to the end
      </text>
      <path d="M300,72 C270,110 270,130 300,166" className="fig-line-s1" markerEnd={arrow('s1')} />
      <path d="M420,168 C450,130 450,110 420,74" className="fig-line-s1" markerEnd={arrow('s1')} />

      <rect x={20} y={40} width={170} height={36} rx={7} className="fig-chip" />
      <text x={34} y={63} className="fig-small">
        a timer is due
      </text>
      <rect x={20} y={90} width={170} height={36} rx={7} className="fig-chip" />
      <text x={34} y={113} className="fig-small">
        a message has arrived
      </text>
      <line x1={190} y1={66} x2={248} y2={52} className="fig-line-muted" markerEnd={arrow('muted')} />
      <line x1={190} y1={106} x2={252} y2={64} className="fig-line-muted" markerEnd={arrow('muted')} />

      <rect x={530} y={110} width={170} height={98} rx={10} className="fig-box" />
      <text x={544} y={134} className="fig-strong">
        subscription queue
      </text>
      {[0, 1, 2].map((k) => (
        <rect key={k} x={544 + k * 48} y={150} width={40} height={24} rx={5} className="fig-box-accent" />
      ))}
      <text x={544} y={196} className="fig-small">
        waits here meanwhile
      </text>
      <line x1={530} y1={160} x2={472} y2={190} className="fig-line-muted" markerEnd={arrow('muted')} />
    </Figure>
  )
}

/** From a .msg file to the names your code uses, with the header recorded in the build. */
export function MsgNaming() {
  const header = lesson04.runs['generated-headers'].output.split('\n').find((f) => f.endsWith('.hpp') && !f.startsWith('rosidl'))!
  return (
    <Figure
      height={236}
      label={`The file msg/Greeting.msg in the package greeter_cpp becomes the type greeter_cpp/msg/Greeting. In C++ you include greeter_cpp/msg/${header} and write greeter_cpp::msg::Greeting. In Python you import Greeting from greeter_cpp.msg. The header's name is the message name in snake_case.`}
      caption={
        <>
          The build generates code for every message, in C++ and in Python. The C++ header is named in{' '}
          <em>snake_case</em>: <code>Greeting.msg</code> becomes <code>greeting.hpp</code>, and a message called{' '}
          <code>BatteryStatus.msg</code> becomes <code>battery_status.hpp</code>. The type name keeps its capitals.
          Getting this wrong is the most common first compile error with your own messages.
        </>
      }
    >
      <rect x={20} y={20} width={210} height={56} rx={10} className="fig-box-accent" />
      <text x={36} y={44} className="fig-mono-strong">
        msg/Greeting.msg
      </text>
      <text x={36} y={64} className="fig-small">
        in the package greeter_cpp
      </text>
      <line x1={230} y1={48} x2={300} y2={48} className="fig-line-s1" markerEnd={arrow('s1')} />
      <text x={265} y={40} textAnchor="middle" className="fig-small">
        build
      </text>

      {[
        { y: 20, label: 'type', text: 'greeter_cpp/msg/Greeting' },
        { y: 80, label: 'C++ include', text: `#include "greeter_cpp/msg/${header}"` },
        { y: 124, label: 'C++ type', text: 'greeter_cpp::msg::Greeting' },
        { y: 168, label: 'Python', text: 'from greeter_cpp.msg import Greeting' },
      ].map((row) => (
        <g key={row.label}>
          <text x={312} y={row.y + 24} className="fig-label">
            {row.label}
          </text>
          <rect x={396} y={row.y + 4} width={318} height={30} rx={6} className="fig-chip" />
          <text x={406} y={row.y + 24} className="fig-mono">
            {row.text}
          </text>
        </g>
      ))}
      <line x1={300} y1={48} x2={300} y2={190} className="fig-line-muted" />
    </Figure>
  )
}
