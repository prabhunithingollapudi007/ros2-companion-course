import { arrow } from './arrows'
import { Figure } from './Figure'

/** The order in which a parameter gets its value, from declaration to a change at run time. */
export function ParamLayers() {
  const steps = [
    { when: 'in the code', what: 'declare_parameter("rate", 2.0)', note: 'the default, used if nothing else says' },
    { when: 'at start', what: '--params-file porch.yaml, -p rate:=4.0', note: 'overrides; the last one given wins' },
    { when: 'at start', what: 'launch: parameters=[file, {…}]', note: 'the same, in list order' },
    { when: 'while it runs', what: 'ros2 param set /blinker rate 5.0', note: 'checked, then applied or refused' },
  ]
  return (
    <Figure
      height={250}
      label="Four layers, top to bottom. In the code, declare_parameter gives the default. At start, --params-file and -p override it, the last given winning; a launch file does the same with its parameters list, in order. While the node runs, ros2 param set asks for a change, which the node checks and then applies or refuses."
      caption={
        <>
          A parameter belongs to one node and has one value at a time. The value comes from the last of these that says
          anything about it. The checks (its type, its range, and your own callback) apply at every layer: at start, a
          value that fails them stops the node; at run time, it is refused and the old value stays.
        </>
      }
    >
      {steps.map((s, i) => {
        const y = 14 + i * 58
        return (
          <g key={s.what}>
            <text x={20} y={y + 27} className="fig-label">
              {s.when}
            </text>
            <rect x={150} y={y} width={330} height={42} rx={8} className={i === 3 ? 'fig-box-accent' : 'fig-box'} />
            <text x={164} y={y + 26} className="fig-mono">
              {s.what}
            </text>
            <text x={494} y={y + 26} className="fig-small">
              {s.note}
            </text>
            {i < steps.length - 1 && <line x1={315} y1={y + 42} x2={315} y2={y + 56} className="fig-line" markerEnd={arrow('ink')} />}
          </g>
        )
      })}
    </Figure>
  )
}
