// Where a parameter's value comes from, for the Lesson 12 playground. The rules
// are the ones the recordings show for the blinker's `rate`: the declared default
// unless something overrides it; among --params-file and -p, the last one given
// wins; a value out of range at start stops the node; a value out of range while
// it runs is refused and the old one kept.

export type Origin = 'the default' | 'the params file' | '-p' | 'ros2 param set'

export interface Override {
  kind: 'file' | 'arg'
  value: number
}

export interface Range {
  from: number
  to: number
}

export type Outcome = { started: false; reason: string } | { started: true; value: number; origin: Origin; refused: number[] }

const inside = (v: number, r: Range) => v >= r.from && v <= r.to

/** Starting with a default and overrides in the order given, then setting values while it runs. */
export function run(defaultValue: number, overrides: Override[], range: Range, sets: number[] = []): Outcome {
  const last = overrides[overrides.length - 1]
  let value = last ? last.value : defaultValue
  let origin: Origin = last ? (last.kind === 'file' ? 'the params file' : '-p') : 'the default'
  if (!inside(value, range)) return { started: false, reason: `${value} is outside ${range.from} to ${range.to}` }
  const refused: number[] = []
  for (const v of sets) {
    if (inside(v, range)) {
      value = v
      origin = 'ros2 param set'
    } else refused.push(v)
  }
  return { started: true, value, origin, refused }
}
