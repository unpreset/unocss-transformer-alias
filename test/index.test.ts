import type { UnoGenerator } from '@unocss/core'
import { createGenerator } from '@unocss/core'
import { describe, expect, test } from 'vitest'
import MagicString from 'magic-string'
import { transformAlias } from '../src'

const uno = createGenerator({
  shortcuts: [
    ['btn', 'px-2 py-3 bg-blue-500 text-white rounded'],
    [/^btn-(.*)$/, ([, c]) => `bg-${c}4:10 text-${c}5 rounded`],
    [/^text-(.*)$/, ([, c]) => `bg-${c}4:10 text-${c}5 rounded`],
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
  test('basic', () => {
    const transform = createTransformer()

    const code = `
<template>
  <div *btn>
    <div text-xl class="*text-red" />
    <div *btn-red />
  </div>
</template>
    `.trim()

    expect(transform(code)).toMatchInlineSnapshot(`
      "<template>
        <div px-2 py-3 bg-blue-500 text-white rounded>
          <div text-xl class=\\"bg-red4:10 text-red5 rounded\\" />
          <div bg-red4:10 text-red5 rounded />
        </div>
      </template>"
    `)
  })

  test('prefix', () => {
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
        <div px-2 py-3 bg-blue-500 text-white rounded>
          <div text-xl class=\\"bg-red4:10 text-red5 rounded\\" />
          <div *btn-red />
        </div>
      </template>"
    `)
  })
})
