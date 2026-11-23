import 'katex/dist/katex.min.css'
import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import App from './App.tsx'
import { parsePath } from './router.ts'
import './styles.css'

const { base, route } = parsePath(window.location.pathname)

const root = document.getElementById('root')!
const app = (
  <StrictMode>
    <App initialRoute={route} base={base} />
  </StrictMode>
)
// A built copy already contains the page's HTML (see scripts/prerender.mjs), so
// React attaches to it. Under `npm run dev` the root is empty and is drawn here.
if (root.hasChildNodes()) hydrateRoot(root, app)
else createRoot(root).render(app)
