import { useState } from 'react'
import { Playground } from '../../components/Playground'
import { Terminal } from '../../components/Terminal'
import { lesson03 } from '../../transcripts'
import '../playgrounds.css'

const r = lesson03.runs

/** The lines of a recorded `find . | sort`, as paths without the leading "./". */
const paths = (output: string) =>
  output
    .split('\n')
    .map((p) => p.replace(/^\.\/?/, ''))
    .filter(Boolean)

interface Stage {
  label: string
  explain: string
  /** Everything in the workspace at this point, top level and src only. */
  tree: string[]
  run: typeof r[string][]
}

const SRC = paths(r['tree-src'].output)
// install, two levels deep: the package folders and the bash setup files. The
// recording also lists setup files for other shells and colcon's helper files.
const INSTALL = r['tree-install'].output
  .split('\n')
  .filter((p) => p.split('/').length <= 2)
  .filter((p) => p === 'install' || !/\/[._]|\.(ps1|sh|zsh|py)$|COLCON_IGNORE$/.test(p))

const STAGES: Stage[] = [
  {
    label: '1. An empty workspace',
    explain: 'A workspace is just a folder with a src folder in it. Nothing about it is special yet.',
    tree: paths(r['tree-empty'].output),
    run: [r['tree-empty']],
  },
  {
    label: '2. Create a package',
    explain: 'ros2 pkg create writes a package skeleton into src: the two description files, a licence, and empty folders for code.',
    tree: SRC,
    run: [r.create],
  },
  {
    label: '3. Build',
    explain: 'colcon build, from the workspace folder, finds every package under src and builds it. It creates build, install and log next to src.',
    tree: [...SRC, 'build', ...INSTALL, 'log'],
    run: [r['colcon-list'], r.build, r['ls-after']],
  },
  {
    label: '4. Source the result',
    explain: 'Until install/setup.bash is sourced, ROS does not know the package exists. Afterwards it is found, and the workspace is first in the search path.',
    tree: [...SRC, 'build', ...INSTALL, 'log'],
    run: [r['prefix-before'], r['prefix-after'], r['ament-after']],
  },
]

export function BuildStepper() {
  const [i, setI] = useState(0)
  const stage = STAGES[i]
  const before = new Set(i > 0 ? STAGES[i - 1].tree : [])
  const tree = [...stage.tree].sort()

  return (
    <Playground
      title="What a build puts where"
      caption={
        <>
          Step through creating and building a package. New files and folders are highlighted. Every listing and every
          command here was recorded in the course container. <code>install</code> is shown two levels deep, without the
          setup files for other shells and colcon's helper files.
        </>
      }
    >
      <div className="button-row" role="tablist" aria-label="Stages">
        {STAGES.map((s, k) => (
          <button key={s.label} type="button" role="tab" aria-selected={k === i} className={`btn btn-small ${k === i ? 'btn-primary' : ''}`} onClick={() => setI(k)}>
            {s.label}
          </button>
        ))}
      </div>
      <p className="stepper-explain">{stage.explain}</p>
      <div className="stepper">
        <ul className="file-tree" aria-label="The workspace folder">
          <li className="file-tree-root">~/ws</li>
          {tree.map((p) => {
            const depth = p.split('/').length
            const isNew = i > 0 && !before.has(p)
            return (
              <li key={p} className={isNew ? 'is-new' : ''} style={{ paddingLeft: `${depth * 1.1}em` }}>
                {p.split('/').pop()}
                {isNew && <span className="file-tree-tag">new</span>}
              </li>
            )
          })}
        </ul>
        <div className="stepper-run">
          <Terminal run={stage.run} />
        </div>
      </div>
    </Playground>
  )
}
