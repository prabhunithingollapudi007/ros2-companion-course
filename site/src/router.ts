import { createContext, useContext } from 'react'
import { findLesson } from './course'

// Every page has a real address, so a search engine can index each lesson and a
// link can point at one: the site root is the home page, and a lesson lives at
// `lesson/3/`. The build writes a ready-made HTML file at each of these.

export type Route = { page: 'home' } | { page: 'lesson'; n: number }

/** Where a page lives below the site root: '' or 'lesson/3/'. */
export function routePath(route: Route): string {
  return route.page === 'lesson' ? `lesson/${route.n}/` : ''
}

/** The page a path below the site root names, or null if it names none. */
export function routeAt(path: string): Route | null {
  const clean = path.replace(/index\.html$/, '').replace(/\/$/, '')
  if (clean === '') return { page: 'home' }
  const match = /^lesson\/(\d+)$/.exec(clean)
  return match && findLesson(Number(match[1])) ? { page: 'lesson', n: Number(match[1]) } : null
}

/**
 * Splits a full URL path into the site root and the page. The root is not known
 * in advance (the site may be hosted in a subfolder), so it is read off the path.
 */
export function parsePath(pathname: string): { base: string; route: Route } {
  const clean = pathname.replace(/index\.html$/, '')
  const nested = /^(.*\/)(lesson\/\d+)\/?$/.exec(clean)
  if (nested) return { base: nested[1], route: routeAt(nested[2]) ?? { page: 'home' } }
  return { base: clean.slice(0, clean.lastIndexOf('/') + 1) || '/', route: { page: 'home' } }
}

/** A relative link from one page to another, so it works wherever the site is hosted. */
export function linkTo(to: Route, from: Route): string {
  const up = from.page === 'home' ? '' : '../../'
  return up + routePath(to) || './'
}

export const RouteContext = createContext<Route>({ page: 'home' })

/** Returns a function that gives the link to any page from the current one. */
export function useLink(): (to: Route) => string {
  const from = useContext(RouteContext)
  return (to) => linkTo(to, from)
}

export const HOME: Route = { page: 'home' }
export const lesson = (n: number): Route => ({ page: 'lesson', n })
