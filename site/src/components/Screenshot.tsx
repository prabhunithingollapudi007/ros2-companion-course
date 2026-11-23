import { useContext, type ReactNode } from 'react'
import '../figures/figures.css'
import { RouteContext } from '../router'

/**
 * A window in the course container, as the recording saw it. docker/record.py
 * takes these into public/shots; the link is relative to the page, like every
 * link on the site, so it works wherever the site is hosted.
 */
export function Screenshot({ name, alt, caption }: { name: string; alt: string; caption: ReactNode }) {
  const route = useContext(RouteContext)
  const src = `${route.page === 'home' ? '' : '../../'}shots/${name}`
  return (
    <figure className="figure screenshot">
      <img src={src} alt={alt} width={1280} height={800} loading="lazy" decoding="async" />
      <figcaption>
        {caption} <span className="dim">Screenshot taken while recording, in the course container.</span>
      </figcaption>
    </figure>
  )
}
