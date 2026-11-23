import { arrow } from './arrows'
import { Figure } from './Figure'

/** The layers between a node's code and the network. */
export function RmwLayers() {
  const layers = [
    { name: 'your node', what: 'rclcpp (C++) or rclpy (Python): the API you write against' },
    { name: 'rcl', what: 'the shared C core: names, parameters, time, graph queries' },
    { name: 'rmw', what: 'a small interface that hides which middleware is underneath' },
    { name: 'rmw_fastrtps_cpp', what: 'the middleware adapter in this container; others exist, e.g. Cyclone DDS' },
    { name: 'DDS / RTPS', what: 'discovery, QoS, delivery: where messages actually travel' },
  ]
  return (
    <Figure
      height={300}
      label="Five layers from top to bottom: your node, written with rclcpp or rclpy; rcl, the shared C core; rmw, the middleware interface; rmw_fastrtps_cpp, the adapter for Fast DDS used in the course container; and DDS with its wire protocol RTPS, which does discovery, quality of service and delivery."
      caption={
        <>
          Your code never talks to the network directly. Discovery and quality of service are done by the middleware at the
          bottom, which is why its rules (who can see whom, which settings match) decide whether a message arrives, whatever
          your code says.
        </>
      }
    >
      {layers.map((l, i) => {
        const y = 14 + i * 56
        return (
          <g key={l.name}>
            <rect x={40} y={y} width={190} height={42} rx={8} className={i === 4 ? 'fig-box-accent' : 'fig-box'} />
            <text x={135} y={y + 26} textAnchor="middle" className="fig-mono-strong">
              {l.name}
            </text>
            <text x={246} y={y + 26} className="fig-small">
              {l.what}
            </text>
            {i < layers.length - 1 && <line x1={135} y1={y + 42} x2={135} y2={y + 54} className="fig-line" markerEnd={arrow('ink')} />}
          </g>
        )
      })}
    </Figure>
  )
}

/** How nodes find each other: by default, and through a discovery server. */
export function DiscoveryModes() {
  const nodes = [
    [110, 70],
    [250, 40],
    [250, 130],
    [110, 170],
  ]
  const served = [
    [470, 60],
    [650, 60],
    [470, 170],
    [650, 170],
  ]
  return (
    <Figure
      height={230}
      label="On the left, default discovery: four nodes, each announcing itself to every other, so the lines between them grow with the square of their number. On the right, a discovery server in the middle: each of four nodes talks only to the server, which tells each who else is there."
      caption={
        <>
          By default every participant announces itself to every other on the network (multicast), which is easy but grows
          with the square of the number of participants and fails where multicast is blocked. A{' '}
          <strong>discovery server</strong> replaces that with a hub: nodes tell the server, and the server tells them. Data still flows directly between nodes.
        </>
      }
    >
      <text x={20} y={22} className="fig-label">
        Default: everyone tells everyone
      </text>
      {nodes.map(([x1, y1], i) =>
        nodes.slice(i + 1).map(([x2, y2]) => <line key={`${i}-${x2}-${y2}`} x1={x1} y1={y1} x2={x2} y2={y2} className="fig-line-muted fig-dash" />),
      )}
      {nodes.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={16} className="fig-node" />
      ))}
      <text x={420} y={22} className="fig-label">
        Discovery server: everyone tells the server
      </text>
      {served.map(([x, y]) => (
        <line key={`${x}-${y}`} x1={x} y1={y} x2={560} y2={115} className="fig-line-s1" />
      ))}
      {served.map(([x, y]) => (
        <circle key={`c${x}-${y}`} cx={x} cy={y} r={16} className="fig-node" />
      ))}
      <rect x={510} y={98} width={100} height={34} rx={8} className="fig-box-accent" />
      <text x={560} y={120} textAnchor="middle" className="fig-mono">
        server
      </text>
    </Figure>
  )
}
