import { arrow } from './arrows'
import { Figure } from './Figure'

/** A topic next to a service: one-way to everyone, or a question and an answer for one asker. */
export function TopicVsService() {
  return (
    <Figure
      height={250}
      label="On the left, a topic: one publisher sends messages that every subscriber receives, and nobody replies. On the right, a service: a client sends a request to the one server for that service name, and the server sends a response back to that client only. Two clients each get their own response."
      caption={
        <>
          A topic is a broadcast: it goes to everyone listening, whether or not anyone is. A service is a question and an
          answer: one server per service name, any number of clients, and each client gets the response to its own request.
        </>
      }
    >
      <text x={20} y={24} className="fig-label">
        Topic: one way, to everyone
      </text>
      <ellipse cx={90} cy={120} rx={62} ry={22} className="fig-node" />
      <text x={90} y={125} textAnchor="middle" className="fig-mono">
        publisher
      </text>
      <rect x={180} y={102} width={80} height={36} rx={7} className="topic-box" />
      <text x={220} y={125} textAnchor="middle" className="fig-topic">
        /count
      </text>
      <line x1={152} y1={120} x2={178} y2={120} className="fig-line-s1" markerEnd={arrow('s1')} />
      {[60, 180].map((yy) => (
        <g key={yy}>
          <path d={`M260,120 C285,120 285,${yy} 300,${yy}`} className="fig-line-s1" markerEnd={arrow('s1')} />
          <ellipse cx={340} cy={yy} rx={38} ry={20} className="fig-node" />
          <text x={340} y={yy + 4.5} textAnchor="middle" className="fig-mono">
            sub
          </text>
        </g>
      ))}

      <text x={420} y={24} className="fig-label">
        Service: a request, and its response
      </text>
      <ellipse cx={640} cy={125} rx={56} ry={22} className="fig-node-accent" />
      <text x={640} y={130} textAnchor="middle" className="fig-mono">
        server
      </text>
      {[
        { yy: 70, name: 'client A' },
        { yy: 180, name: 'client B' },
      ].map(({ yy, name }) => (
        <g key={name}>
          <ellipse cx={470} cy={yy} rx={50} ry={20} className="fig-node" />
          <text x={470} y={yy + 4.5} textAnchor="middle" className="fig-mono">
            {name}
          </text>
          <path d={`M520,${yy - 6} C560,${yy - 6} 560,${125 - 8} 584,${125 - 8}`} className="fig-line-s1" markerEnd={arrow('s1')} />
          <path d={`M584,${125 + 8} C556,${125 + 8} 556,${yy + 6} 522,${yy + 6}`} className="fig-line-s2" markerEnd={arrow('s2')} />
        </g>
      ))}
      <text x={556} y={232} textAnchor="middle" className="fig-small">
        blue: requests; orange: each response, to its asker
      </text>
    </Figure>
  )
}
