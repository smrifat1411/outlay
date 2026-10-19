#!/usr/bin/env node
// Keep the Blends-registry entry in step with the app's plugins: copy the source (never
// node_modules) and take the version from the plugin manifest. Run before opening a registry PR.
import { cpSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const entry = join(root, 'registry', 'blends', 'smrifat1411.outlay')

// The app's plugins, one level deep, exactly as they are installed.
const appPlugins = join(root, 'plugins')
for (const name of ['outlay']) {
  cpSync(join(appPlugins, name), join(entry, 'plugins', name), {
    recursive: true,
    filter: (path) => !path.split(/[\\/]/u).includes('node_modules'),
  })
}

// The entry's version is the app's version.
const pkg = JSON.parse(readFileSync(join(appPlugins, 'outlay', 'package.json'), 'utf8'))
const blendFile = join(entry, 'blend.yaml')
if (pkg.version) {
  const text = readFileSync(blendFile, 'utf8').replace(/^( {2}version: ).*$/mu, `$1${pkg.version}`)
  writeFileSync(blendFile, text)
}

console.log(`synced plugins/outlay @ ${pkg.version} into registry/blends/smrifat1411.outlay`)
