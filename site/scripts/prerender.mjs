// Runs at the end of `npm run build`. The ordinary build leaves one index.html
// with an empty page that only fills in once JavaScript runs. This writes a real
// HTML file for every page (the home page and lesson/1/ to lesson/17/), each
// with its own title, description and the lesson's text and figures, so search
// engines, link previews and AI assistants can read the course.
//
// It also writes sitemap.xml, llms.txt and 404.html. What goes into them is
// decided in src/seo.ts; this file only does the reading and writing.

import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const site = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(site, 'dist')
const serverDir = path.join(site, 'dist-ssr')
const server = await import(pathToFileURL(path.join(serverDir, 'entry-server.js')).href)

const EMPTY_ROOT = '<div id="root"></div>'
const TITLE = /<title>[^<]*<\/title>/

const template = await readFile(path.join(dist, 'index.html'), 'utf8')
if (!template.includes(EMPTY_ROOT) || !TITLE.test(template)) {
  throw new Error('dist/index.html does not look like the built page: no empty root or no title.')
}

let total = 0
let written = 0
for (const route of server.ALL_ROUTES) {
  const where = server.routePath(route) || '(home)'
  const body = await server.renderPage(route)

  // A page that did not render fully must fail the build, not ship half empty.
  if (!body.includes('<h1') || body.includes('Loading…')) throw new Error(`${where}: the page did not render.`)
  if (route.page === 'lesson') {
    const sections = (body.match(/<h2/g) ?? []).length
    if (server.isWritten(route)) {
      written += 1
      if (sections < 3) throw new Error(`${where}: the lesson is missing from the rendered page.`)
    } else if (sections < 2 || !body.includes('Planned lab')) {
      throw new Error(`${where}: the planned outline is missing from the rendered page.`)
    }
  }

  const up = server.upFrom(route)
  const html = template
    // Scripts, styles and the icon are linked relative to the site root.
    .replaceAll('="./', () => `="${up || './'}`)
    .replace(TITLE, () => server.headTags(route, up))
    .replace(EMPTY_ROOT, () => `<div id="root">${body}</div>`)

  const folder = path.join(dist, server.routePath(route))
  await mkdir(folder, { recursive: true })
  await writeFile(path.join(folder, 'index.html'), html)
  total += html.length
}

const today = new Date().toISOString().slice(0, 10)
await writeFile(path.join(dist, 'sitemap.xml'), server.sitemap(today))
await writeFile(path.join(dist, 'llms.txt'), server.llmsTxt())
await writeFile(path.join(dist, '404.html'), server.notFoundPage())
await rm(serverDir, { recursive: true, force: true })

const lessons = server.ALL_ROUTES.length - 1
console.log(
  `Prerendered ${server.ALL_ROUTES.length} pages (${Math.round(total / 1024)} kB of HTML; ${written} of ${lessons} lessons written${written < lessons ? ', the rest as outlines' : ''}), sitemap.xml, llms.txt and 404.html.`,
)
