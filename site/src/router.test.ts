import { describe, expect, it } from 'vitest'
import { LESSONS } from './course'
import { HOME, lesson, linkTo, parsePath, routeAt, routePath, type Route } from './router'

const ALL: Route[] = [HOME, ...LESSONS.map((l) => lesson(l.n))]

describe('page addresses', () => {
  it('gives every page its own address below the site root', () => {
    expect(routePath(HOME)).toBe('')
    expect(routePath(lesson(6))).toBe('lesson/6/')
    expect(new Set(ALL.map(routePath)).size).toBe(18)
  })

  it('reads a page back from its address', () => {
    for (const route of ALL) expect(routeAt(routePath(route))).toEqual(route)
    expect(routeAt('lesson/6')).toEqual(lesson(6))
    expect(routeAt('lesson/6/index.html')).toEqual(lesson(6))
    expect(routeAt('index.html')).toEqual(HOME)
  })

  it('refuses addresses that name no page', () => {
    expect(routeAt('lesson/18/')).toBeNull()
    expect(routeAt('lesson/0/')).toBeNull()
    expect(routeAt('lesson/six/')).toBeNull()
    expect(routeAt('assets/index.js')).toBeNull()
  })
})

describe('finding the site root', () => {
  it('works at the top of a domain, as under npm run dev', () => {
    expect(parsePath('/')).toEqual({ base: '/', route: HOME })
    expect(parsePath('/lesson/12/')).toEqual({ base: '/', route: lesson(12) })
  })

  it('works in a subfolder, as on GitHub Pages', () => {
    const base = '/ros2-companion-course/'
    expect(parsePath(base)).toEqual({ base, route: HOME })
    expect(parsePath(base + 'index.html')).toEqual({ base, route: HOME })
    expect(parsePath(base + 'lesson/3/')).toEqual({ base, route: lesson(3) })
    expect(parsePath(base + 'lesson/3')).toEqual({ base, route: lesson(3) })
    expect(parsePath(base + 'lesson/3/index.html')).toEqual({ base, route: lesson(3) })
  })

  it('shows the home page, with the right root, for a lesson that does not exist', () => {
    expect(parsePath('/site/lesson/99/')).toEqual({ base: '/site/', route: HOME })
  })
})

describe('links between pages', () => {
  it('are relative, and land on the right page from anywhere', () => {
    const root = 'https://example.org/some/folder/'
    for (const from of ALL) {
      for (const to of ALL) {
        const landed = new URL(linkTo(to, from), root + routePath(from))
        expect(landed.href).toBe(root + routePath(to))
      }
    }
  })
})
