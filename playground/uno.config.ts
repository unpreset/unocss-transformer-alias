import {
  defineConfig,
  presetAttributify,
  presetUno,
} from 'unocss'
import transformerAlias from 'unocss-transformer-alias'

export default defineConfig({
  shortcuts: [
    ['btn', 'text-white font-bold py-2 px-4 rounded cursor-pointer'],
    [/^btn-(.+)$/, ([,d]) => `bg-${d}-500 hover:bg-${d}-700 btn`],
  ],
  presets: [
    presetUno(),
    presetAttributify(),
  ],
  transformers: [
    transformerAlias(),
  ],
})
