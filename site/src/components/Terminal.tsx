import { Fragment, useState, type ReactNode } from 'react'
import './terminal.css'

/** One command and what it printed. Recorded by scripts/transcripts.mjs, or produced by a playground's model. */
export interface Run {
  command: string
  output: string
  /** 'exit': it finished. 'stopped': it runs until interrupted, and was. 'running': it was still running. */
  ended: 'exit' | 'stopped' | 'running'
  /** Only the first lines of the output were kept. */
  truncated?: boolean
  /** Only the last lines of the output were kept: it had printed more before them. */
  tail?: boolean
  /** The folder it ran in, shown in the prompt. */
  cwd?: string
}

/** /root/ws as a shell prompt shows it: ~/ws. */
const shortPath = (cwd: string) => cwd.replace(/^\/root(?=\/|$)/, '~')

interface Props {
  /** A recorded run, or several typed one after another in the same terminal. */
  run: Run | Run[]
  /** Which window this is, when a lesson uses more than one: "Terminal 2". */
  title?: string
  /** Set for output computed by a playground rather than recorded from the container. */
  simulated?: boolean
}

/**
 * A terminal session. By default it is a recording from the course container,
 * so what a lesson shows is what the command really prints.
 */
export function Terminal({ run, title = 'Terminal', simulated = false }: Props) {
  const [copied, setCopied] = useState(false)
  const runs = Array.isArray(run) ? run : [run]
  if (runs.length === 0 || runs.some((r) => !r)) {
    // A missing recording must stop the build, not leave a hole in the lesson.
    throw new Error(`Terminal "${title}": a transcript it shows has not been recorded. Run: npm run transcripts`)
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(runs.map((r) => r.command).join('\n'))
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <figure className={`terminal ${simulated ? 'is-simulated' : ''}`}>
      <div className="terminal-head">
        <span className="terminal-title">{title}</span>
        <span className="terminal-tag">{simulated ? 'simulated by this page' : 'recorded in the course container'}</span>
        <button type="button" className="terminal-copy" onClick={copy}>
          {copied ? 'Copied' : runs.length > 1 ? 'Copy commands' : 'Copy command'}
        </button>
      </div>
      <pre className="terminal-body">
        {runs.map((r, i) => (
          <Fragment key={i}>
            {r.cwd && <span className="terminal-cwd">{shortPath(r.cwd)} </span>}
            <span className="terminal-prompt">$ </span>
            <span className="terminal-cmd">{r.command}</span>
            {'\n'}
            {r.tail && <span className="terminal-note">{'…\n'}</span>}
            {r.output && <span className="terminal-out">{r.output + '\n'}</span>}
            {r.truncated && <span className="terminal-note">{'…\n'}</span>}
            {!r.output && r.ended === 'exit' && <span className="terminal-note">{'(prints nothing)\n'}</span>}
            {r.ended === 'stopped' && <span className="terminal-note">{'^C\n'}</span>}
            {r.ended === 'running' && <span className="terminal-note">{r.output ? '(keeps running)\n' : '(prints nothing, and keeps running)\n'}</span>}
          </Fragment>
        ))}
      </pre>
    </figure>
  )
}

/** Terminals that run at the same time, shown side by side. */
export function TerminalPair({ children }: { children: ReactNode }) {
  return <div className="terminal-pair">{children}</div>
}
