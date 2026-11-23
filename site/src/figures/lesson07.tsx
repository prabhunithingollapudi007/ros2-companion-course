import { arrow } from './arrows'
import { Figure } from './Figure'

/** What a link and a joint each describe. */
export function LinkAndJoint() {
  const types: { name: string; what: string }[] = [
    { name: 'fixed', what: 'does not move: a sensor bolted on' },
    { name: 'revolute', what: 'turns between two limits: an arm, a camera pan' },
    { name: 'continuous', what: 'turns without limit: a wheel' },
    { name: 'prismatic', what: 'slides between two limits: a lift' },
  ]
  return (
    <Figure
      height={300}
      label="A link is a rigid part with three descriptions: visual, what it looks like; collision, a simpler shape for contact; inertial, its mass and inertia. A joint connects a parent link to a child link: its origin places the child relative to the parent, its axis is what it turns or slides along, and its type is fixed, revolute, continuous or prismatic."
      caption={
        <>
          A URDF is a list of <code>&lt;link&gt;</code>s and <code>&lt;joint&gt;</code>s. Links are the rigid parts and
          say nothing about where they are. Joints say where: each joint puts one child link at an offset from its parent,
          and lets it move in one way, or not at all.
        </>
      }
    >
      <rect x={20} y={20} width={300} height={170} rx={10} className="fig-box" />
      <text x={36} y={46} className="fig-mono-strong">
        &lt;link&gt;
      </text>
      {[
        ['visual', 'what it looks like: a mesh or a shape'],
        ['collision', 'a simpler shape, for contact'],
        ['inertial', 'mass and inertia, for physics'],
      ].map(([k, v], i) => (
        <g key={k}>
          <rect x={36} y={62 + i * 40} width={268} height={32} rx={6} className="fig-chip-accent" />
          <text x={48} y={83 + i * 40} className="fig-mono">
            {k}
          </text>
          <text x={128} y={83 + i * 40} className="fig-small">
            {v}
          </text>
        </g>
      ))}

      <rect x={360} y={20} width={340} height={170} rx={10} className="fig-box" />
      <text x={376} y={46} className="fig-mono-strong">
        &lt;joint type="..."&gt;
      </text>
      {[
        ['parent, child', 'the two links it connects'],
        ['origin', "where the child is, in the parent's frame"],
        ['axis', 'what it turns about or slides along'],
        ['limit', 'how far, how fast, how hard'],
      ].map(([k, v], i) => (
        <g key={k}>
          <text x={376} y={76 + i * 30} className="fig-mono">
            {k}
          </text>
          <text x={490} y={76 + i * 30} className="fig-small">
            {v}
          </text>
        </g>
      ))}

      {types.map((t, i) => (
        <g key={t.name}>
          <rect x={20 + i * 172} y={210} width={164} height={74} rx={8} className={t.name === 'continuous' || t.name === 'revolute' ? 'fig-box-accent' : 'fig-box'} />
          <text x={32 + i * 172} y={234} className="fig-mono-strong">
            {t.name}
          </text>
          <text x={32 + i * 172} y={256} className="fig-small">
            {t.what.split(': ')[0]}:
          </text>
          <text x={32 + i * 172} y={274} className="fig-small">
            {t.what.split(': ')[1]}
          </text>
        </g>
      ))}
    </Figure>
  )
}

/** The rover's links as a tree, the way check_urdf prints it. */
export function RoverTree() {
  const children: { link: string; joint: string; type: string; x: number }[] = [
    { link: 'left_wheel', joint: 'left_wheel_joint', type: 'continuous', x: 100 },
    { link: 'right_wheel', joint: 'right_wheel_joint', type: 'continuous', x: 270 },
    { link: 'caster', joint: 'caster_joint', type: 'fixed', x: 440 },
    { link: 'camera', joint: 'camera_pan', type: 'revolute', x: 610 },
  ]
  return (
    <Figure
      height={210}
      label="The rover as a tree. base_link is the root. Four joints hang from it: left_wheel_joint and right_wheel_joint, both continuous, to the two wheels; caster_joint, fixed, to the caster; and camera_pan, revolute, to the camera."
      caption="Every link except one has exactly one parent, so the links always form a tree with a single root, here base_link. That is what makes it possible to work out where every part is from the joint angles alone, and it is the shape the frames of Lesson 8 take."
    >
      <rect x={290} y={14} width={140} height={40} rx={8} className="fig-box-accent" />
      <text x={360} y={39} textAnchor="middle" className="fig-mono-strong">
        base_link
      </text>
      {children.map((c) => (
        <g key={c.link}>
          <path d={`M360,54 C360,90 ${c.x},90 ${c.x},128`} className="fig-line" markerEnd={arrow('ink')} />
          <text x={c.x} y={104} textAnchor="middle" className="fig-mono">
            {c.joint}
          </text>
          <text x={c.x} y={118} textAnchor="middle" className="fig-small">
            {c.type}
          </text>
          <rect x={c.x - 66} y={130} width={132} height={36} rx={8} className="fig-box" />
          <text x={c.x} y={153} textAnchor="middle" className="fig-mono-strong">
            {c.link}
          </text>
        </g>
      ))}
    </Figure>
  )
}
