import type { UnoGenerator } from '@unocss/core'
import { createGenerator, expandVariantGroup } from '@unocss/core'
import { describe, expect, test } from 'vitest'
import MagicString from 'magic-string'
import { expandShortcut, transformAlias } from '../src'

const uno = createGenerator({
  shortcuts: [
    ['btn', 'px-2 py-3 bg-blue-500 text-(white xl) rounded'],
    [/^btn-(.*)$/, ([, c]) => `btn bg-${c}4:10 text-${c}5`],
    [/^primary-(.*)$/, ([, c]) => `border-${c} btn-${c} flex items-center`],
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
        <div *btn>
          <div text-xl class=\\"*btn-red\\" />
          <div *btn-red />
        </div>
      </template>"
    `)
  })

  test('prefix', async () => {
    const transform = createTransformer('&')

    const code = `
<template>
  <div &test>
    <div text-xl class="&primary-red" />
    <div *btn-red />
  </div>
</template>
    `.trim()

    expect(transform(code)).toMatchInlineSnapshot(`
      "<template>
        <div &test>
          <div text-xl class=\\"&primary-red\\" />
          <div *btn-red />
        </div>
      </template>"
    `)
  })

  test('expand shortcut', async () => {
    const code = `
    <template>
        <div class="*btn-red" />
        <div *btn-red />
    </template>
        `.trim()
    const transform = createTransformer()

    expect(transform(code)).toMatchInlineSnapshot(`
      "<template>
              <div class=\\"*btn-red\\" />
              <div *btn-red />
          </template>"
    `)

    expect(expandVariantGroup('text-(white xl) rounded')).toBe('text-white text-xl rounded')

    expect(await expandShortcut('primary-red', uno))
      .toMatchInlineSnapshot(`
        [
          [
            "border-red",
            "px-2",
            "py-3",
            "bg-blue-500",
            "text-white",
            "text-xl",
            "rounded",
            "bg-red4:10",
            "text-red5",
            "flex",
            "items-center",
          ],
        ]
      `)
  })
})
