<p align="center">
<img src="https://raw.githubusercontent.com/unpreset/unocss-transformer-alias/main/public/logo.svg" style="width:100px;" />
</p>

<h1 align="center">unocss-transformer-alias</h1>

<p align="center">🌈 Transform alias for UnoCSS shortcuts.</p>

<p align="center">
<a>
<img src="https://img.shields.io/npm/v/unocss-transformer-alias?style=flat&colorA=080f12&colorB=1fa669" alt="npm version" />
</a>
<a>
<img src="https://img.shields.io/npm/dm/unocss-transformer-alias?style=flat&colorA=080f12&colorB=1fa669" alt="npm downloads" />
</a>
<a>
<img src="https://img.shields.io/github/license/unpreset/unocss-transformer-alias.svg?style=flat&colorA=080f12&colorB=1fa669" alt="License" />
</a>
</p>

## Install
```shell
pnpm i -D unocss-transformer-alias
```

```ts
// uno.config.ts
import { defineConfig } from 'unocss'
import transformerAlias from 'unocss-transformer-alias'

export default defineConfig({
  // ...
  shortcuts: [
    ['btn', 'px-2 py-3 bg-blue-500 text-white rounded'],
    [/^btn-(.*)$/, ([, c]) => `btn bg-${c}4:10 text-${c}5 rounded`],
  ],
  transformers: [
    transformerAlias(),
  ],
})
```

## Usage

```html
<div *btn />
<div class="*btn-red" />
<div class="+btn-blue" />
```

Will be transformed to:

```html
<div px-2 py-3 bg-blue-500 text-white rounded>
<div class="px-2 py-3 bg-blue-500 text-white rounded bg-red4:10 text-red5 rounded" />
<div class="btn-blue px-2 py-3 bg-blue-500 text-white rounded bg-blue4:10 text-blue5 rounded" />
```

## Options

> I suggest you to use special prefixes to avoid UnoCSS incorrectly transforming your code.

```ts
transformerAlias({
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
})

interface KeepOption {
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
```

## About

- [UnoCSS Issue #2543](https://github.com/unocss/unocss/issues/2543)
- [WindiCSS Alias Config](https://windicss.org/integrations/vite.html#alias-config)

## License

MIT License &copy; 2023-PRESENT [Chris](https://github.com/zyyv)
