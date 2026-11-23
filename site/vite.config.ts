import mdx from '@mdx-js/rollup'
import react from '@vitejs/plugin-react'
import rehypeKatex from 'rehype-katex'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import { defineConfig } from 'vite'

// Lessons are written in MDX: prose, code and the occasional formula, with
// React figures and playgrounds embedded.
export default defineConfig({
  base: './',
  plugins: [
    {
      enforce: 'pre',
      ...mdx({
        remarkPlugins: [remarkGfm, remarkMath],
        rehypePlugins: [rehypeKatex],
        providerImportSource: '@mdx-js/react',
      }),
    },
    react(),
  ],
})
