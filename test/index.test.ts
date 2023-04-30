import type { UnoGenerator } from '@unocss/core'
import { createGenerator, expandVariantGroup } from '@unocss/core'
import { describe, expect, test } from 'vitest'
import MagicString from 'magic-string'
import { expandShortcut, transformAlias } from '../src'

const uno = createGenerator({
  shortcuts: [
    ['btn', 'px-2 py-3 bg-blue-500 text-(white xl) rounded'],
    [/^btn-(.*)$/, ([, c]) => `btn bg-${c}4:10 text-${c}5`],
    [/^text-(.*)$/, ([, c]) => `bg-${c}4:10 text-${c}5`],
  ],
})

function createTransformer(prefix = '*') {
  return (code: string, _uno: UnoGenerator = uno) => {
    const s = new MagicString(code)
    transformAlias(s, _uno, {
      prefix,
    })
    return s.toString()
  }
}

describe('transformer alias', () => {
  test('basic', async () => {
    const transform = createTransformer()

    const code = `
<template>
  <div *btn>
    <div text-xl class="*btn-red" />
    <div *btn-red />
  </div>
</template>
    `.trim()

    expect(transform(code)).toMatchInlineSnapshot(`
      "<template>
        <div px-2 py-3 bg-blue-500 text-white text-xl rounded>
          <div text-xl class=\\"btn bg-red4:10 text-red5\\" />
          <div btn bg-red4:10 text-red5 />
        </div>
      </template>"
    `)

    expect(await expandShortcut('btn-red', uno)).toMatchInlineSnapshot(`
      [
        [
          "px-2",
          "py-3",
          "bg-blue-500",
          "bg-white4:10",
          "bg-white54:10",
          "bg-white554:10",
          "text-white555",
          "bg-xl4:10",
          "bg-xl54:10",
          "bg-xl554:10",
          "text-xl555",
          "rounded",
          "bg-red4:10",
          "bg-red54:10",
          "bg-red554:10",
          "bg-red5554:10",
          "bg-red55554:10",
          "text-red55555",
        ],
      ]
    `)
  })

  test('prefix', async () => {
    const transform = createTransformer('&')

    const code = `
<template>
  <div &btn>
    <div text-xl class="&text-red" />
    <div *btn-red />
  </div>
</template>
    `.trim()

    expect(transform(code)).toMatchInlineSnapshot(`
      "<template>
        <div px-2 py-3 bg-blue-500 text-white text-xl rounded>
          <div text-xl class=\\"bg-red4:10 text-red5\\" />
          <div *btn-red />
        </div>
      </template>"
    `)

    expect(expandVariantGroup('bg-blue-500 text-(white xl) rounded')).toMatchInlineSnapshot('"bg-blue-500 text-white text-xl rounded"')
  })
})
