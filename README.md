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
    [/^btn-(.*)$/, ([, c]) => `bg-${c}4:10 text-${c}5 rounded`],
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
```

Will be transformed to:

```html
<div px-2 py-3 bg-blue-500 text-white rounded>
<div class="bg-red4:10 text-red5 rounded" />
``` 

## Options

> I suggest you to use special prefixes to avoid UnoCSS incorrectly transforming your code.

```ts
transformerAlias({
  // default: '*'
  prefix?: string
})
```

## About

- [UnoCSS Issue #2543](https://github.com/unocss/unocss/issues/2543)
- [WindiCSS Alias Config](https://windicss.org/integrations/vite.html#alias-config)


## License

MIT License &copy; 2023-PRESENT [Chris](https://github.com/zyyv)
