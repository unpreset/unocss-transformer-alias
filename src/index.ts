import { expandVariantGroup, isStaticShortcut, isString } from '@unocss/core'
import type { SourceCodeTransformer, UnoGenerator } from '@unocss/core'
import type MagicString from 'magic-string'

export interface TransformerAliasOptions {
  /**
   * Prefix for your alias.
   *
   * @default "*"
   */
  prefix?: string
}

export default function transformerAlias(options: TransformerAliasOptions = {}): SourceCodeTransformer {
  return {
    name: 'unocss-transformer-alias',
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
      let result
      if (isStaticShortcut(shortcut)) {
        if (shortcut[0] === item[1])
          result = shortcut[1]
      }
      else {
        const match = item[1].match(shortcut[0])
        if (match !== null)
          result = shortcut[1](match, uno.config as any)
      }
      if (isString(result))
        code.overwrite(item.index!, item.index! + item[0].length, expandVariantGroup(result.trim()))
    }
  }
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
