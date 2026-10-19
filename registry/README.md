# Registry entry (staging)

`blends/smrifat1411.outlay/` is the exact folder to copy into a pull request to
[acrylblends/acrylblends.github.io](https://github.com/acrylblends/acrylblends.github.io).
It is staged here so the app repository carries a reviewable copy, and so CI can check that the
vendored plugin source is current.

Do not edit the copy by hand: change `plugins/outlay/` (the app's real plugin), then run

```bash
node scripts/sync-registry.mjs
```

which copies the plugin source (without `node_modules`) and takes the version from
`plugins/outlay/package.json`.

The full publish walkthrough, including the `registry/index.json` entry, is in
[`../docs/PUBLISH.md`](../docs/PUBLISH.md).
