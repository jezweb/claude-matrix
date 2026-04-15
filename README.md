# Claude Code // The Matrix

What people see when they watch you use Claude Code.

A single-page Cloudflare Worker that simulates realistic Claude Code terminal sessions across multiple projects. Each tab shows a different project with user prompts, thinking, tool calls, syntax-highlighted code, diffs, terminal output, and responses — cycling in randomised order with organic timing.

**Live**: https://claude-matrix.webfonts.workers.dev

## How it works

Content is defined in `src/content.yaml` — each tab is a complete Claude Code session. A build step (`node build.mjs`) converts YAML to JSON, which gets inlined into the HTML at bundle time.

The page renders each session line-by-line with timing that mimics real Claude Code behaviour: fast code dumps, pauses before tool calls, variable thinking speeds, and occasional micro-pauses.

## Edit content

1. Edit `src/content.yaml`
2. `node build.mjs` to regenerate `src/content.json`
3. `npm run dev` to preview locally
4. `npm run deploy` to ship

### Line types

| Type | Renders as |
|------|-----------|
| `user` | Blue-bordered user prompt (also types in the input bar) |
| `thinking` | Italic dimmed text |
| `tool` | Green-bulleted tool call header (`● Read src/file.ts`) |
| `code` | Syntax-highlighted code with line numbers |
| `diff-add` | Green text on green background |
| `diff-del` | Red text on red background |
| `diff-hunk` | Cyan hunk header (`@@ -1,5 +1,12 @@`) |
| `diff-ctx` | Dimmed context line |
| `output` | Terminal output |
| `success` | Green success message |
| `error` | Red error message |
| `warning` | Yellow warning |
| `response` | Assistant response (supports `**bold**`) |
| `dim` | Dimmed supplementary text |
| `path` | Blue file path |
| `blank` | Empty line |

## Stack

- Cloudflare Workers
- TypeScript
- YAML for content
- Zero dependencies at runtime (everything inlined into a single HTML response)

## Dev

```bash
npm install
npm run dev     # local dev server
npm run deploy  # deploy to Cloudflare
```
