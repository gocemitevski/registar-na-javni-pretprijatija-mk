import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))

function getOdsDate() {
  try {
    const odsPath = resolve(__dirname, 'public/ods/registar-javni-pretprijatija-r-s-makedonija.ods')
    const metaContent = execSync(`unzip -p "${odsPath}" meta.xml`, { encoding: 'utf8', stdio: 'pipe' })
    const match = metaContent.match(/<dc:date>([^<]+)<\/dc:date>/)
    if (match) {
      return new Date(match[1]).toISOString()
    }
  } catch (e) {
    console.warn('Could not read ODS modification date:', e.message)
  }
  return null
}

const odsDateStr = getOdsDate()

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  define: {
    __ODS_DATE__: JSON.stringify(odsDateStr),
  },
  optimizeDeps: {
    include: ['chart.js'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'xlsx': ['xlsx'],
          'chart': ['chart.js'],
        },
      },
      external: ['react-i18next']
    },
  },
})
