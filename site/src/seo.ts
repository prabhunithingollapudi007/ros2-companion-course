import { COURSE_LINKS, LESSONS, PARTS, REPO_URL, ROS_DISTRO, SITE_URL, findLesson } from './course'
import { LESSON_MINUTES, WRITTEN } from './lessons'
import { HOME, lesson, routePath, type Route } from './router'

// What search engines, link previews and AI assistants are told about each page.
// Everything here is derived from the course outline, so it cannot drift from it.

export const SITE_NAME = 'ROS 2 Companion'
export const AUTHOR = 'Prabhu Nithin Gollapudi'
const CONTENT_LICENCE = 'https://creativecommons.org/licenses/by/4.0/'

const HOME_DESCRIPTION =
  `A free, visual course on ROS 2 ${ROS_DISTRO} in ${LESSONS.length} lessons: nodes and topics, packages and colcon, ` +
  'launch files, bags, URDF, TF2, Gazebo, services, actions, parameters, quality of service and executors, ending in a ' +
  "simulated-robot project. An unofficial companion to ETH Zurich's Programming for Robotics course."

export interface PageMeta {
  /** Full public address of the page. */
  url: string
  title: string
  description: string
  /** schema.org description of the page, for search engines. */
  jsonLd: Record<string, unknown>
}

export const ALL_ROUTES: Route[] = [HOME, ...LESSONS.map((l) => lesson(l.n))]

const urlOf = (route: Route) => SITE_URL + routePath(route)

const author = { '@type': 'Person', name: AUTHOR, url: REPO_URL.slice(0, REPO_URL.lastIndexOf('/')) }

const lessonLd = (n: number) => {
  const { lesson: l, part } = findLesson(n)!
  return {
    '@type': 'LearningResource',
    name: `Lesson ${l.n}: ${l.title}`,
    description: l.summary,
    url: urlOf(lesson(l.n)),
    position: l.n,
    learningResourceType: 'Lesson',
    about: part.title,
    teaches: l.topics,
    ...(LESSON_MINUTES[l.n] ? { timeRequired: `PT${LESSON_MINUTES[l.n]}M` } : {}),
  }
}

export function pageMeta(route: Route): PageMeta {
  if (route.page === 'lesson') {
    const { lesson: l } = findLesson(route.n)!
    // A lesson that is not written yet must not be advertised as if it were.
    const state = WRITTEN[l.n] ? 'With figures, interactive playgrounds, a quiz and a hands-on lab.' : 'Planned: this page is the outline for now.'
    return {
      url: urlOf(route),
      title: `${l.title} (Lesson ${l.n}) | ${SITE_NAME}`,
      description: `${l.summary} Covers: ${l.topics.join('; ')}. ${state}`,
      jsonLd: {
        '@context': 'https://schema.org',
        ...lessonLd(l.n),
        inLanguage: 'en',
        isAccessibleForFree: true,
        license: CONTENT_LICENCE,
        author,
        isPartOf: { '@type': 'Course', name: SITE_NAME, url: SITE_URL },
      },
    }
  }
  return {
    url: SITE_URL,
    title: `${SITE_NAME}: a visual course in ${LESSONS.length} lessons`,
    description: HOME_DESCRIPTION,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: SITE_NAME,
      description: HOME_DESCRIPTION,
      url: SITE_URL,
      inLanguage: 'en',
      isAccessibleForFree: true,
      license: CONTENT_LICENCE,
      coursePrerequisites: 'Basic C++ and Python, and some comfort in a Linux terminal.',
      provider: author,
      author,
      offers: { '@type': 'Offer', price: 0, priceCurrency: 'USD', category: 'Free' },
      hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'Online' },
      teaches: LESSONS.map((l) => l.title),
      hasPart: LESSONS.map((l) => lessonLd(l.n)),
    },
  }
}

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/**
 * The tags for a page's <head>. `up` is the relative path back to the site root
 * ('' on the home page, '../../' on a lesson).
 */
export function headTags(route: Route, up: string): string {
  const meta = pageMeta(route)
  const title = escapeHtml(meta.title)
  const description = escapeHtml(meta.description)
  // Inside a script element only "<" needs care: it must not be able to close the tag.
  const jsonLd = JSON.stringify(meta.jsonLd).replace(/</g, '\\u003c')
  return [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" />`,
    `<meta name="author" content="${escapeHtml(AUTHOR)}" />`,
    `<link rel="canonical" href="${meta.url}" />`,
    `<meta property="og:type" content="${route.page === 'lesson' ? 'article' : 'website'}" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${meta.url}" />`,
    `<meta property="og:image" content="${SITE_URL}social-card.png" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="${SITE_NAME}: a visual course on ROS 2 in ${LESSONS.length} lessons" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<link rel="alternate" type="text/plain" href="${up}llms.txt" title="Plain-text guide to this site for AI assistants" />`,
    `<script type="application/ld+json">${jsonLd}</script>`,
  ].join('\n    ')
}

/** sitemap.xml: one entry per page. */
export function sitemap(lastModified: string): string {
  const entries = ALL_ROUTES.map(
    (route) => `  <url>\n    <loc>${urlOf(route)}</loc>\n    <lastmod>${lastModified}</lastmod>\n  </url>`,
  )
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`
}

/**
 * llms.txt: a plain-text map of the site for AI assistants and agents, in the
 * format proposed at llmstxt.org.
 */
export function llmsTxt(): string {
  const written = LESSONS.filter((l) => WRITTEN[l.n]).length
  const lines = [
    `# ${SITE_NAME}`,
    '',
    `> ${HOME_DESCRIPTION}`,
    '',
    `It is written for people who can program in C++ and Python and have not used ROS. It targets ROS 2 ${ROS_DISTRO}.`,
    `${written} of the ${LESSONS.length} lessons are written so far; the rest are listed below as planned, with their outlines.`,
    '',
    'This is an independent study aid. It is not affiliated with, endorsed by, or produced by ETH Zurich, the Robotic',
    'Systems Lab, the lecturers of the course, or Open Robotics. It links to the course material and does not copy it.',
    '',
    `Author: ${AUTHOR}. Lesson text and figures: CC BY 4.0. Code: MIT.`,
    '',
  ]
  for (const part of PARTS) {
    lines.push(`## Part ${part.n}: ${part.title}`, '')
    for (const l of part.lessons) {
      const state = WRITTEN[l.n] ? '' : ' (planned)'
      lines.push(`- [Lesson ${l.n}: ${l.title}](${urlOf(lesson(l.n))})${state}: ${l.summary} Topics: ${l.topics.join('; ')}.`)
    }
    lines.push('')
  }
  lines.push(
    '## Reference',
    '',
    `- [Source code](${REPO_URL}): the site and instructions to run it locally.`,
    '',
    '## Optional',
    '',
    ...COURSE_LINKS.map((l) => `- [${l.label}](${l.url})`),
    '',
  )
  return lines.join('\n')
}

/** The page GitHub Pages shows for an address that does not exist. */
export function notFoundPage(): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex" />
    <title>Page not found | ${SITE_NAME}</title>
    <style>
      body { font: 16px/1.6 system-ui, sans-serif; max-width: 34rem; margin: 18vh auto; padding: 0 16px; color: #1c2430; background: #fbfaf7; }
      a { color: #1f5fbf; }
      @media (prefers-color-scheme: dark) { body { color: #e8eaee; background: #14171c; } a { color: #8ab4f8; } }
    </style>
  </head>
  <body>
    <h1>Page not found</h1>
    <p>There is no page at this address. The course has ${LESSONS.length} lessons, and its front page lists them all.</p>
    <p><a href="${SITE_URL}">Go to the ${SITE_NAME}</a></p>
  </body>
</html>
`
}
