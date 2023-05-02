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
    async transform(code, _, { uno }) {
      await transformAlias(code, uno, options)
    },
  }
}

export async function transformAlias(
  code: MagicString,
  uno: UnoGenerator,
  options: TransformerAliasOptions = {},
) {
  const prefix = options.prefix ?? '*'
  const extraRE = new RegExp(`${escapeRegExp(prefix)}([\\w-]+)`, 'g')
  const map = new Map<string, ShortcutValue | false>()

  for (const item of Array.from(code.original.matchAll(extraRE))) {
    let result = map.get(item[0])
    if (result === false) {
      continue
    }
    else if (!result) {
      const r = await expandShortcut(item[1], uno)
      if (r) {
        result = r[0].join(' ')
        map.set(item[0], result)
      }
      else {
        map.set(item[0], false)
        continue
      }
    }

    code.overwrite(item.index!, item.index! + item[0].length, result as string)
  }
}

export async function expandShortcut(
  input: string,
  uno: UnoGenerator,
  depth = 5,
): Promise<[ShortcutValue[]] | undefined> {
  if (depth <= 0)
    return

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
        .map(async r => (isString(r) ? (await expandShortcut(r, uno, depth - 1))?.[0] : undefined) || [r]),
    )).flat(1).filter(Boolean),
  ]
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
