import { useState } from 'react'
import { REPO_URL } from '../course'
import './listing.css'

interface Props {
  /** The file's path in the repository, shown as the title: labs/lesson04/examples/greeter_cpp/src/greeter.cpp */
  path: string
  /** The file's text, imported with ?raw so it is exactly what the recordings compiled. */
  code: string
  /** Line numbers (1-based) to highlight. */
  highlight?: number[]
  /** Show only these lines, [first, last], 1-based. */
  lines?: [number, number]
}

/** A source file from the course repository, as compiled in the recordings. */
export function Listing({ path, code, highlight = [], lines }: Props) {
  const [copied, setCopied] = useState(false)
  const all = code.replace(/\r\n/g, '\n').replace(/\n$/, '').split('\n')
  const [first, last] = lines ?? [1, all.length]
  const shown = all.slice(first - 1, last)
  const marked = new Set(highlight)
  const name = path.split('/').pop()

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shown.join('\n'))
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <figure className="listing">
      <div className="listing-head">
        <a className="listing-name" href={`${REPO_URL}/blob/master/${path}${lines ? `#L${first}-L${last}` : ''}`} target="_blank" rel="noreferrer">
          {name}
        </a>
        <span className="listing-path">{path.slice(0, path.length - (name?.length ?? 0))}</span>
        <button type="button" className="terminal-copy" onClick={copy}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="listing-body">
        {shown.map((line, i) => {
          const n = first + i
          return (
            <span key={n} className={`listing-line ${marked.has(n) ? 'is-marked' : ''}`}>
              <span className="listing-n" aria-hidden="true">
                {n}
              </span>
              {line || ' '}
              {'\n'}
            </span>
          )
        })}
      </pre>
    </figure>
  )
}
