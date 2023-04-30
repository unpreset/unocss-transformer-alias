import { expandVariantGroup, isStaticShortcut, isString } from '@unocss/core'
import type { ShortcutValue, SourceCodeTransformer, UnoGenerator } from '@unocss/core'
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
        if (match != null)
          result = shortcut[1](match, uno.config as any)
      }
      if (isString(result))
        code.overwrite(item.index!, item.index! + item[0].length, expandVariantGroup(result.trim()))
    }
  }
}

export async function expandShortcut(
  input: string,
  uno: UnoGenerator,
  depth = 5,
  map = new Map<string, string>(),
) {
  if (depth <= 0)
    return

  if (map.get(input))
    return map.get(input)

  let result: string | ShortcutValue[] | undefined

  for (const shortcut of uno.config.shortcuts) {
    if (isStaticShortcut(shortcut)) {
      if (shortcut[0] === input)
        result = shortcut[1]
    }
    else {
      const match = input.match(shortcut[0])
      if (match != null)
        result = shortcut[1](match, {} as any)
    }
  }

  if (isString(result))
    result = expandVariantGroup(result.trim()).split(/\s+/g)

  if (!result)
    return

  return [
    (await Promise.all(
      result
        .filter(s => s !== input)
        .map(async r => (isString(r)
          ? (await expandShortcut(r, shortcuts, depth - 1))?.[0]
          : undefined) || [r]),
    )).flat(1).filter(Boolean),
  ]
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
