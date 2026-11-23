import { useState } from 'react'
import { Playground } from '../../components/Playground'
import { Terminal } from '../../components/Terminal'
import { arrow } from '../../figures/arrows'
import { UNDERLAY, OVERLAY_WS, OVERLAY_PACKAGES } from '../../ros/lesson03'
import { amentPrefixPath, executables, findPackage, overlay } from '../../ros/overlay'
import { lesson03 } from '../../transcripts'
import '../playgrounds.css'

const r = lesson03.runs
type Command = 'prefix' | 'executables' | 'talker'

const RECORDED: Record<Command, { under: string; over: string }> = {
  prefix: { under: 'under-prefix', over: 'over-prefix' },
  executables: { under: 'under-executables', over: 'over-executables' },
  talker: { under: 'under-run', over: 'over-run' },
}

const LABELS: Record<Command, string> = {
  prefix: 'Where is demo_nodes_py?',
  executables: 'What programs does it have?',
  talker: 'Run its talker',
}

export function OverlayStack() {
  const [sourced, setSourced] = useState(false)
  const [command, setCommand] = useState<Command>('prefix')

  const prefixes = sourced ? overlay(UNDERLAY, OVERLAY_WS, OVERLAY_PACKAGES) : UNDERLAY
  const found = findPackage(prefixes, 'demo_nodes_py')!
  const fromOverlay = found.path.startsWith(OVERLAY_WS)
  const run = r[sourced ? RECORDED[command].over : RECORDED[command].under]
  const programs = executables(prefixes, 'demo_nodes_py')

  return (
    <Playground
      title="Which copy wins"
      caption={
        <>
          A second workspace, <code>~/over</code>, contains a new package that happens to be called{' '}
          <code>demo_nodes_py</code>, with one program, <code>talker</code>, that only prints a line. ROS searches the
          locations in <code>AMENT_PREFIX_PATH</code> from the left and takes the whole package from the first one that has
          it. The terminal shows what each command really printed in the course container.
        </>
      }
    >
      <div className="button-row">
        <button type="button" className={`btn btn-small ${sourced ? '' : 'btn-primary'}`} aria-pressed={!sourced} onClick={() => setSourced(false)}>
          Only /opt/ros/jazzy sourced
        </button>
        <button type="button" className={`btn btn-small ${sourced ? 'btn-primary' : ''}`} aria-pressed={sourced} onClick={() => setSourced(true)}>
          ~/over/install/setup.bash sourced too
        </button>
      </div>
      <div className="button-row">
        {(Object.keys(LABELS) as Command[]).map((c) => (
          <button key={c} type="button" className={`btn btn-small ${c === command ? 'btn-primary' : 'btn-quiet'}`} aria-pressed={c === command} onClick={() => setCommand(c)}>
            {LABELS[c]}
          </button>
        ))}
      </div>

      <div className="figure-scroll">
        <svg viewBox="0 0 720 210" className="graph-svg" role="img" aria-label={`demo_nodes_py is found in ${found.path}, with ${programs.length} programs.`}>
          <text x={20} y={22} className="fig-label">
            AMENT_PREFIX_PATH, searched from the top
          </text>
          {sourced && (
            <g>
              <rect x={20} y={36} width={480} height={64} rx={10} className={fromOverlay ? 'fig-box-accent' : 'fig-box'} />
              <text x={36} y={60} className="fig-mono-strong">
                {OVERLAY_WS}/install/demo_nodes_py
              </text>
              <text x={36} y={84} className="fig-small">
                overlay: demo_nodes_py with {OVERLAY_PACKAGES.demo_nodes_py.length} program
              </text>
            </g>
          )}
          <g transform={`translate(0 ${sourced ? 80 : 0})`}>
            <rect x={20} y={36} width={480} height={64} rx={10} className={!fromOverlay ? 'fig-box-accent' : 'fig-box fig-faded'} />
            <text x={36} y={60} className="fig-mono-strong">
              /opt/ros/jazzy
            </text>
            <text x={36} y={84} className="fig-small">
              underlay: demo_nodes_py with {UNDERLAY[0].packages.demo_nodes_py.length} programs{fromOverlay ? ', hidden' : ''}
            </text>
          </g>
          <line x1={540} y1={40} x2={540} y2={sourced ? 176 : 96} className="fig-line" markerEnd={arrow('ink')} />
          <text x={556} y={sourced ? 112 : 72} className="fig-small">
            first match
          </text>
          <text x={556} y={sourced ? 130 : 90} className="fig-small">
            wins
          </text>
        </svg>
      </div>

      <Terminal
        title={sourced ? 'With the overlay sourced' : 'With only Jazzy sourced'}
        run={{ ...run, command: run.command.replace('source install/setup.bash && ', '') }}
      />
      <p className="small dim">AMENT_PREFIX_PATH={amentPrefixPath(prefixes)}</p>
    </Playground>
  )
}
