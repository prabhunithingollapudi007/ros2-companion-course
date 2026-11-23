import { StrictMode } from 'react'
import { prerender } from 'react-dom/static'
import App from './App.tsx'
import { WRITTEN } from './lessons/index.ts'
import { linkTo, routePath, HOME, type Route } from './router.ts'
import { ALL_ROUTES, headTags, llmsTxt, notFoundPage, sitemap } from './seo.ts'

// This file is never loaded in the browser, so the fast-refresh rule does not apply.
// oxlint-disable react/only-export-components

// Used only at build time, by scripts/prerender.mjs: renders each page to HTML so
// that search engines, link previews and readers without JavaScript get the
// lesson itself instead of an empty page.

/** The page's HTML, once every lazily loaded part of it has arrived. */
export async function renderPage(route: Route): Promise<string> {
  const { prelude } = await prerender(
    <StrictMode>
      <App initialRoute={route} />
    </StrictMode>,
    // By default React holds a large section back and reveals it with a script.
    // These pages must be complete without one, so no section counts as large.
    { progressiveChunkSize: Number.MAX_SAFE_INTEGER },
  )
  return new Response(prelude).text()
}

/** The relative path from a page back to the site root: '' or '../../'. */
export const upFrom = (route: Route) => linkTo(HOME, route).replace(/^\.\/$/, '')

/** Whether a page is a lesson that has been written, as opposed to a planned outline. */
export const isWritten = (route: Route) => route.page === 'lesson' && Boolean(WRITTEN[route.n])

export { ALL_ROUTES, headTags, llmsTxt, notFoundPage, routePath, sitemap }
