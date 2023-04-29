import type { SourceCodeTransformer, UnoGenerator } from '@unocss/core'
import { isStaticShortcut } from '@unocss/core'
import type MagicString from 'magic-string'

export interface TransformerAliasOptions {
  /**
   * Prefix for your alias.
   *
   * @default "*"
   */
  prefix?: string
}

export function transformerAlias(options: TransformerAliasOptions = {}): SourceCodeTransformer {
  return {
    name: '@unocss/transformer-alias',
    enforce: 'pre',
    transform(code, _, { uno }) {
      transformAlias(code, uno, options)
    },
  }
}

export function transformAlias(code: MagicString, uno: UnoGenerator, options: TransformerAliasOptions = {}) {
  const prefix = options.prefix ?? '*'
  const extraRE = new RegExp(`${escapeRegExp(prefix)}([\\w-]+)`, 'g')

  for (const item of Array.from(code.original.matchAll(extraRE))) {
    for (const shortcut of uno.config.shortcuts) {
      if (isStaticShortcut(shortcut)) {
        if (shortcut[0] === item[1])
          code.overwrite(item.index!, item.index! + item[0].length, shortcut[1] as string)
      }
      else {
        const match = item[1].match(shortcut[0] as RegExp)
        if (match)
          code.overwrite(item.index!, item.index! + item[0].length, shortcut[1](match, uno.config as any) as string)
      }
    }
  }
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
