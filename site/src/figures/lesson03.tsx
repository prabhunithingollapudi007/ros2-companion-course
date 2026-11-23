import { arrow } from './arrows'
import { Figure } from './Figure'

/** The four folders of a workspace and what moves between them. */
export function WorkspaceFolders() {
  const out: { name: string; y: number; what: string; accent?: boolean }[] = [
    { name: 'build/', y: 40, what: 'intermediate files: CMake caches, object files. Never edit.' },
    { name: 'install/', y: 110, what: 'the results: programs, libraries, setup files', accent: true },
    { name: 'log/', y: 180, what: 'a record of every build, for when one fails' },
  ]
  return (
    <Figure
      height={250}
      label="A workspace has four folders. You write packages in src. colcon build reads src and writes three folders: build for intermediate files, install for the finished results, and log for build logs. Sourcing install/setup.bash tells the terminal about what is in install."
      caption={
        <>
          You only ever edit <code>src</code>. <code>colcon build</code>, run from the workspace folder, creates the other
          three. What you use afterwards comes from <code>install</code>, and sourcing its setup file is how a terminal
          learns about it. Deleting <code>build</code>, <code>install</code> and <code>log</code> is always safe: the
          next build makes them again.
        </>
      }
    >
      <rect x={20} y={70} width={150} height={100} rx={10} className="fig-box-accent" />
      <text x={36} y={98} className="fig-mono-strong">
        src/
      </text>
      <text x={36} y={122} className="fig-small">
        your packages:
      </text>
      <text x={36} y={140} className="fig-small">
        the part you write
      </text>

      <line x1={170} y1={120} x2={250} y2={120} className="fig-line-s1" markerEnd={arrow('s1')} />
      <text x={210} y={110} textAnchor="middle" className="fig-mono">
        colcon
      </text>
      <text x={210} y={138} textAnchor="middle" className="fig-mono">
        build
      </text>

      {out.map((f) => (
        <g key={f.name}>
          <line x1={252} y1={120} x2={286} y2={f.y + 20} className="fig-line-muted" />
          <rect x={288} y={f.y} width={412} height={40} rx={8} className={f.accent ? 'fig-box-accent' : 'fig-box'} />
          <text x={302} y={f.y + 25} className="fig-mono-strong">
            {f.name}
          </text>
          <text x={380} y={f.y + 25} className="fig-small">
            {f.what}
          </text>
        </g>
      ))}
      <text x={496} y={236} textAnchor="middle" className="fig-mono">
        source install/setup.bash → this terminal can run them
      </text>
    </Figure>
  )
}

/** A dependency is declared in two files, for two different readers. */
export function DeclareTwice() {
  return (
    <Figure
      height={290}
      label="A C++ package that uses std_msgs declares it twice. In package.xml, a depend tag tells colcon and rosdep that the package needs std_msgs. In CMakeLists.txt, find_package and ament_target_dependencies tell CMake where std_msgs's headers and libraries are, so the compiler can find them. Leaving out the CMake lines gives the compile error recorded below."
      caption={
        <>
          The two files answer different questions. <code>package.xml</code> says <em>what</em> the package needs, for the
          tools that plan the build and install missing packages. <code>CMakeLists.txt</code> says <em>how</em> to compile
          and link it. Leave the CMake lines out and the compiler cannot find the headers; leave the{' '}
          <code>package.xml</code> line out and the build may still work on your machine, but colcon may build packages in
          the wrong order and rosdep will not install what is missing elsewhere.
        </>
      }
    >
      <rect x={20} y={14} width={320} height={200} rx={10} className="fig-box" />
      <text x={36} y={40} className="fig-mono-strong">
        package.xml
      </text>
      <text x={36} y={62} className="fig-small">
        read by colcon and rosdep
      </text>
      <rect x={32} y={80} width={296} height={30} rx={6} className="fig-chip-accent" />
      <text x={44} y={100} className="fig-mono">
        {'<depend>std_msgs</depend>'}
      </text>
      <text x={36} y={140} className="fig-small">
        what this package needs, so that it is
      </text>
      <text x={36} y={158} className="fig-small">
        built after std_msgs and std_msgs can
      </text>
      <text x={36} y={176} className="fig-small">
        be installed where it is missing
      </text>

      <rect x={380} y={14} width={320} height={200} rx={10} className="fig-box" />
      <text x={396} y={40} className="fig-mono-strong">
        CMakeLists.txt
      </text>
      <text x={396} y={62} className="fig-small">
        read by CMake, which runs the compiler
      </text>
      <rect x={392} y={80} width={296} height={30} rx={6} className="fig-chip-accent" />
      <text x={404} y={100} className="fig-mono">
        find_package(std_msgs REQUIRED)
      </text>
      <rect x={392} y={116} width={296} height={30} rx={6} className="fig-chip-accent" />
      <text x={404} y={136} className="fig-mono">
        ament_target_dependencies(... std_msgs)
      </text>
      <text x={396} y={176} className="fig-small">
        where the headers and libraries are,
      </text>
      <text x={396} y={194} className="fig-small">
        and that this program uses them
      </text>

      <rect x={160} y={234} width={400} height={40} rx={8} className="fig-box-accent" />
      <text x={360} y={259} textAnchor="middle" className="fig-mono">
        #include "std_msgs/msg/string.hpp"
      </text>
      <line x1={180} y1={214} x2={250} y2={232} className="fig-line-muted" />
      <line x1={540} y1={214} x2={470} y2={232} className="fig-line-muted" />
    </Figure>
  )
}
