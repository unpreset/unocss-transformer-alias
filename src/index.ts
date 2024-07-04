import { expandVariantGroup, isStaticShortcut, isString } from '@unocss/core'
import type { ShortcutValue, SourceCodeTransformer, UnoGenerator } from '@unocss/core'
import type MagicString from 'magic-string'

export interface KeepOption {
  /**
   * keep prefix for your alias.
   *
   * @default '+'
   */
  prefix: string
  /**
   * Decedide whether to put it in `blocklist`.
   *
   * @default true
   */
  block: boolean
}

export interface TransformerAliasOptions {
  /**
   * Prefix for your alias.
   *
   * @default "*"
   */
  prefix?: string
  /**
   * Prefix for your alias and keep the original class.
   *
   * @default '+'
   */
  keep?: string | KeepOption
}

export default function transformerAlias(options?: TransformerAliasOptions): SourceCodeTransformer {
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
  {
    prefix = '*',
    keep = '+',
  }: TransformerAliasOptions = {},
) {
  if (typeof keep === 'string')
    keep = { prefix: keep, block: true }

  const extraRE = new RegExp(`(${escapeRegExp(prefix)}|${escapeRegExp(keep.prefix)})([\\w-:]+)`, 'g')
  const map = new Map<string, ShortcutValue | false>()

  for (const item of Array.from(code.original.matchAll(extraRE))) {
    let result = map.get(item[0])
    if (result === false) {
      continue
    }
    else if (!result) {
      const r = await expandShortcut(item[2], uno)
      if (r) {
        result = r[0].join(' ')
        map.set(item[0], result)
      }
      else {
        map.set(item[0], false)
        continue
      }
    }

    if (item[1] === keep.prefix) {
      result = `${item[2]} ${result}`
      if (keep.block)
        uno.config.blocklist = [...new Set([...uno.config.blocklist, item[2]])]
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
