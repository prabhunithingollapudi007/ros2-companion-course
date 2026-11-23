import type { ReactNode } from 'react'
import type { Source } from '../course'

// The recurring pieces of a lesson. Each lesson is written in MDX and
// composes these.

function Callout({ kind, label, children }: { kind: string; label: string; children: ReactNode }) {
  return (
    <aside className={`callout callout-${kind}`}>
      <div className="callout-label">{label}</div>
      <div className="callout-body">{children}</div>
    </aside>
  )
}

/** Opens every lesson: where it sits and what problem it solves. */
export function BigPicture({ children }: { children: ReactNode }) {
  return (
    <Callout kind="big" label="Big picture">
      {children}
    </Callout>
  )
}

/** A hard idea restated without jargon. */
export function PlainWords({ children }: { children: ReactNode }) {
  return (
    <Callout kind="plain" label="In plain words">
      {children}
    </Callout>
  )
}

/** Where two things say the same idea differently, for example ROS 1 and ROS 2. */
export function Bridge({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Callout kind="bridge" label={`Bridge: ${title}`}>
      {children}
    </Callout>
  )
}

/** A short reminder of a prerequisite, closed by default. */
export function Refresher({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="fold fold-refresher">
      <summary>
        <span className="fold-tag">Refresher</span>
        {title}
      </summary>
      <div className="fold-body">{children}</div>
    </details>
  )
}

/** A derivation worth doing. `why` says what you get from working through it. */
export function Derivation({ title, why, children }: { title: string; why: string; children: ReactNode }) {
  return (
    <details className="fold fold-derivation">
      <summary>
        <span className="fold-tag">Derivation</span>
        {title}
      </summary>
      <div className="fold-body">
        <p className="fold-why">
          <strong>Why it is worth doing:</strong> {why}
        </p>
        {children}
      </div>
    </details>
  )
}

/** Experiments to run on the playground above. */
export function TryThis({ children }: { children: ReactNode }) {
  return (
    <div className="try-this">
      <div className="try-this-label">Try this</div>
      {children}
    </div>
  )
}

/** Something to look at only after trying, such as the answer to a lab. Closed by default. */
export function Reveal({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details className="fold fold-refresher">
      <summary>
        <span className="fold-tag">Answer</span>
        {title}
      </summary>
      <div className="fold-body">{children}</div>
    </details>
  )
}

/** The short summary to reread months later. */
export function Recap({ children }: { children: ReactNode }) {
  return (
    <section className="recap" id="quick-recap">
      <div className="recap-label">Quick recap</div>
      {children}
    </section>
  )
}

// The three tag colours the stylesheet provides.
const SOURCE_STYLE: Record<Source['from'], 'a' | 'b' | 'c'> = {
  ETH: 'a',
  'ROS 2 docs': 'b',
  'Gazebo docs': 'c',
  Other: 'c',
}

export function SourceList({ sources }: { sources: Source[] }) {
  return (
    <ul className="sources">
      {sources.map((s) => (
        <li key={s.url + s.label}>
          <span className={`source-tag source-${SOURCE_STYLE[s.from]}`}>{s.from}</span>
          <a href={s.url} target="_blank" rel="noreferrer">
            {s.label}
          </a>
        </li>
      ))}
    </ul>
  )
}
