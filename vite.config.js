import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
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
  base: "/",
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  define: {
    __ODS_DATE__: JSON.stringify(odsDateStr),
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Bootstrap 5.3.x still ships @import-based partials and uses legacy
        // Sass globals (mix(), red()/green()/blue(), if()), so compiling it
        // emits ~300 deprecation warnings that cannot be fixed from here:
        //   import          -> every Bootstrap partial + our style.scss imports
        //   global-builtin  -> mix()/rgba()/nth()... inside Bootstrap functions
        //   if-function     -> the Sass if() syntax inside Bootstrap functions
        //   color-functions -> red()/green()/blue() inside luminance()
        // Our own partials avoid the deprecated globals (they use sass:color and
        // sass:string); remove these entries once Bootstrap 6 lands with @use.
        // https://sass-lang.com/documentation/breaking-changes/
        silenceDeprecations: ['import', 'global-builtin', 'if-function', 'color-functions'],
      },
    },
  },
  optimizeDeps: {
    include: ['chart.js'],
  },
  build: {
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/chart.js')) return 'chart'
        },
      },
    },
  },
})
