// First-time setup: clone + build the community plugins, then generate the
// aggregated plugin index (.quartz/plugins/index.ts).
//
// Why not Quartz's own `install-plugins.ts`? That script's first line is
// `import config from "../../../quartz.js"`, which evaluates the full Quartz
// layout — and the layout imports host components (Head.tsx, fileTrie.ts) that
// statically import `.quartz/plugins`. On a fresh checkout that index doesn't
// exist yet, so the import crashes before any plugin is installed (chicken/egg).
//
// We sidestep it by talking to the loader directly: installPlugins +
// regeneratePluginIndex live in gitLoader and import nothing from the host, so
// there's no cycle. Always regenerate the index even if a plugin fails to clone
// (e.g. a transient TLS error) so the build still has a valid index.
import fs from "node:fs"
import YAML from "yaml"
import {
  installPlugins,
  parsePluginSource,
  regeneratePluginIndex,
} from "./quartz/plugins/loader/gitLoader.ts"

const cfgPath = fs.existsSync("./quartz.config.yaml")
  ? "./quartz.config.yaml"
  : "./quartz.config.default.yaml"
const cfg = YAML.parse(fs.readFileSync(cfgPath, "utf-8"))

const sources = (cfg.plugins ?? [])
  .filter((p) => p && p.enabled !== false && typeof p.source === "string")
  .map((p) => p.source)

console.log(`Bootstrapping ${sources.length} plugin(s) from ${cfgPath}...`)

try {
  await installPlugins(sources.map(parsePluginSource), { verbose: true })
} catch (err) {
  console.warn("⚠ install step reported:", err?.message ?? err)
}

// Regenerate from whatever actually landed on disk, regardless of the above.
await regeneratePluginIndex({ verbose: true })
console.log("✓ Bootstrap complete")
