# unocss-transformer-alias [![npm](https://img.shields.io/npm/v/unocss-transformer-alias.svg)](https://npmjs.com/package/unocss-transformer-alias)

Transform alias for UnoCSS shortcuts.

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
