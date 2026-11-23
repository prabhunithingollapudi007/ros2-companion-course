import { useEffect, useState } from 'react'
import { REPO_URL } from '../course'
import './lab.css'

/** Where the course container serves its web terminal (see docker/compose.yaml). */
export const TERMINAL_URL = 'http://localhost:7681/'
/** Its desktop, where RViz and Gazebo open their windows, through noVNC. */
export const DESKTOP_URL = 'http://localhost:6080/vnc.html'
const DESKTOP_VIEW = `${DESKTOP_URL}?autoconnect=true&resize=scale&reconnect=true`

const START = 'docker compose -f docker/compose.yaml up -d --build'
const STOP = 'docker compose -f docker/compose.yaml down'

type Status = 'checking' | 'up' | 'down'

/** Whether the container's terminal server answers. It is on another port, so the answer itself is opaque; that it answers is enough. */
async function reach(): Promise<Status> {
  try {
    await fetch(TERMINAL_URL, { mode: 'no-cors', cache: 'no-store' })
    return 'up'
  } catch {
    return 'down'
  }
}

interface Props {
  /** One entry per terminal window, with what to type in it first and how tall it is. */
  terminals: { title: string; first: string; height?: number }[]
  /** Also show the container's desktop, for labs that open windows (RViz, Gazebo). */
  desktop?: boolean
}

/**
 * Live terminals inside the course container, embedded in the page. Each one is
 * its own shell in the same container, so they share one ROS graph. When the
 * container is not running, this says how to start it.
 */
export function ContainerTerminals({ terminals, desktop = false }: Props) {
  const [status, setStatus] = useState<Status>('checking')

  const check = () => {
    setStatus('checking')
    void reach().then(setStatus)
  }

  // Checked once when the page opens; the reader can check again after starting the container.
  useEffect(() => {
    let current = true
    void reach().then((s) => current && setStatus(s))
    return () => {
      current = false
    }
  }, [])

  return (
    <section className="container-lab">
      <header className="container-lab-head">
        <span className={`status-dot is-${status}`} aria-hidden="true" />
        <strong>
          {status === 'up' ? 'Course container is running' : status === 'down' ? 'Course container is not running' : 'Looking for the course container…'}
        </strong>
        <span className="container-lab-actions">
          <button type="button" className="btn btn-quiet btn-small" onClick={check}>
            Check again
          </button>
          {status === 'up' && (
            <a className="btn btn-quiet btn-small" href={TERMINAL_URL} target="_blank" rel="noreferrer">
              Open a terminal in a new tab
            </a>
          )}
          {status === 'up' && desktop && (
            <a className="btn btn-quiet btn-small" href={DESKTOP_VIEW} target="_blank" rel="noreferrer">
              Open the desktop in a new tab
            </a>
          )}
        </span>
      </header>

      {status === 'up' ? (
        <>
          <div className="container-terminals">
            {terminals.map((t) => (
              <div className="container-terminal" key={t.title}>
                <div className="container-terminal-title">
                  {t.title}: <code>{t.first}</code>
                </div>
                <iframe src={TERMINAL_URL} title={`${t.title}, a shell in the course container`} style={{ height: t.height ?? 340 }} />
              </div>
            ))}
          </div>
          {desktop && (
            <div className="container-terminal container-desktop">
              <div className="container-terminal-title">The container&apos;s desktop: windows that programs open appear here</div>
              <iframe src={DESKTOP_VIEW} title="The course container's desktop" />
            </div>
          )}
        </>
      ) : (
        <div className="container-lab-help">
          <p>
            The lab runs in a container with ROS 2 Jazzy installed, so nothing ROS-related goes on your computer. Once it
            is running, {terminals.length} live terminals appear here. You need{' '}
            <a href="https://docs.docker.com/get-started/get-docker/" target="_blank" rel="noreferrer">
              Docker
            </a>{' '}
            and a copy of <a href={REPO_URL}>this course's repository</a>. From the repository's folder, run:
          </p>
          <pre className="container-lab-cmd">{START}</pre>
          <p className="small dim">
            The first start builds the image, which takes a while and about 5 GB of disk; later starts take seconds. Then
            press <em>Check again</em>. To stop it afterwards: <code>{STOP}</code>. The terminals are served on{' '}
            <code>{TERMINAL_URL}</code>
            {desktop && (
              <>
                {' '}
                and the desktop on <code>{DESKTOP_URL}</code>, both
              </>
            )}{' '}
            and accept connections from this computer only.
          </p>
        </div>
      )}
    </section>
  )
}
