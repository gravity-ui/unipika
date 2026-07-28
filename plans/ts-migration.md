# Unipika → TypeScript Migration Plan

## Goal
Migrate `@gravity-ui/unipika` from plain JS (CommonJS, gulp+browserify) to TypeScript with a modern build (gulp + `@gravity-ui/gulp-utils`, following the gravity-ui/uikit pattern). A new major version will be released after migration. Progress is tracked in this file via the checklist below — each phase is a commit boundary.

## Constraints & Rules
- **Runtime must not change** — except for explicitly approved changes (see "Approved Runtime Changes" below). Any additional runtime change must be highlighted and approved before implementation.
- **Type assertions (`as`) should be avoided in general** — not just `as any`, but also `as number`, `as string`, etc. Prefer proper typing, type guards, and narrowing. `any` is forbidden. Every case where `any` or a type assertion seems unavoidable must be reported for discussion.
- **Prefer `type` over `interface`.**
- **No default exports** — use named exports only (`export function format`, `export const converters`, `export type UnipikaSettings`, etc.). No `export default` anywhere.
- **TypeScript**: keep current version already in devDependencies (^5.4.5). No upgrade.
- **Ask before changing code.** Each phase is reviewed/approved before implementation.
- **Phase progression is strictly by user command.** The assistant works through phases sequentially, but does NOT start the next phase until the user explicitly says to proceed. After completing a phase, the assistant stops and waits for the user's go-ahead.
- Commits are made by the user, one per phase (or sub-phase), using **Conventional Commits** format (e.g. `feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`). The assistant will be asked to generate commit message texts; the user will do the actual committing.

## Approved Runtime Changes
These changes have been discussed and approved by the user:

1. **Drop AMD/UMD/browser-global logic** — the `exportBrowserModule` logic in [`lib/index.js`](lib/index.js) (AMD/YModules/window.define) will be removed. The library will be a standard dual CJS/ESM library only.
2. **Drop factory pattern** — `lib/index.js` currently exports `module.exports = function(settings) { ... }`. This will be replaced with direct named exports from `index.ts` (`format`, `formatFromYSON`, `formatFromYQL`, `formatRaw`, `formatValue`, `formatKey`, `formatAttributes`, `converters`, `utils` + types — see #6 below on `utils`). **Why this isn't an API break for the real consumer:** react-unipika already imports the *pre-invoked* object via [`lib/unipika.js`](lib/unipika.js) (`module.exports = require('../lib')({exportBrowserModule: true})`) and calls `.format()` etc. directly — it never calls the factory itself. Named exports compiled to CJS produce `module.exports.format`, `.formatFromYSON`, etc. — the exact same dot-access shape react-unipika already relies on, just reached via a new path. Only internal tests use the raw factory-call convention (`require('../..')()`), and those are updated in Phase 1/7 as part of the migration, not part of the public API.
3. **Single entry point** — only `index.ts` will be the public export. No deep imports. The `lib/unipika.js` entry point will be removed. **Consumer impact:** react-unipika must update its import from `@gravity-ui/unipika/lib/unipika` → `@gravity-ui/unipika`.
4. **Replace gulp+browserify with gulp + `@gravity-ui/gulp-utils`** — modern build pipeline following the gravity-ui/uikit pattern. Produces dual CJS + ESM + `.d.ts` via `tsc` (wrapped by gulp-utils with custom transformers for SCSS imports). The build tool switch happens in Phase 8, once all source is already `.ts` — gulp-utils only ever sees pure `.ts` input, exactly like uikit.
5. **Replace vendor/utf8.js with npm `utf8@2.1.2`** — ~~same library (Mathias Bynens utf8.js v2.1.2), identical runtime behavior, just moved from `vendor/` to `node_modules/`.~~ **UPDATE (Phase 2): this turned out to be FALSE** — the vendored copy has a local `allowTruncatedEnd` patch that the npm package lacks, so the runtime is NOT identical. The npm swap is **blocked/deferred**; `vendor/utf8.js` stays. See Phase 2 outcome and Open Question #11. Upgrade to newer utf8 version is a separate future task.
6. **`utils` is a first-class public export** — `utils` (`.format`, `.yson`, `.utf8`, `.type`) is exported from `index.ts` as a named export, exactly like `converters`. It is part of the documented public API surface, appears in `.d.ts` type declarations, and is documented in README/MIGRATION.md. Consumers can use `import {utils, converters} from '@gravity-ui/unipika'` or `import * as unipika from '@gravity-ui/unipika'; unipika.utils.format(...)`. This is not a breaking change — `utils` is already reachable through the public factory object today (`unipika.utils.format`, see [`lib/index.js`](lib/index.js) lines 21-26) and is actively used by [`test/utils/format.test.ts:7`](test/utils/format.test.ts:7). The migration simply promotes it from an accidental export to an intentional, documented one.
7. **Delete `say()`** — trivial function returning `'Unipika Pika!'`. Not used internally, not used by react-unipika. Dead code. `lib/say.js` will be deleted and `say` removed from the public API.
8. **New major version** — all breaking changes will be released as a new major version. A migration guide will be written for consumers.

## Decisions Made
1. **TypeScript version**: keep ^5.4.5 (already in project). No upgrade.
2. **Build tool**: gulp + `@gravity-ui/gulp-utils` (following gravity-ui/uikit pattern). Wraps `tsc` with custom transformers for SCSS imports and local CSS modules. Produces dual CJS (`build/cjs/`) + ESM (`build/esm/`). Set up in Phase 8 (see Approved Runtime Change #4).
3. **vendor/utf8.js**: ~~replace with `utf8@2.1.2` from npm + `@types/utf8`.~~ **UPDATE (Phase 2): BLOCKED/deferred** — the vendored copy has a local `allowTruncatedEnd` patch the npm package lacks. `vendor/utf8.js` stays, typed via a hand-written `vendor/utf8.d.ts`. See Phase 2 outcome and Open Question #11.
4. **Export style**: direct named exports from `index.ts`, no factory, no deep imports.
5. **Utils export**: `utils` is a first-class, documented named export of `index.ts` (see Approved Runtime Change #6) — listed in "Public API surface", typed in `.d.ts`, documented in README/MIGRATION.md, same status as `converters`.
6. **Linting**: keep both `lint:js` (eslint with TS parser rules) and `typecheck` (tsc --noEmit). Matches react-unipika and gravity-ui ecosystem. **Verified:** `@gravity-ui/eslint-config` (already a devDependency) already pulls in `@typescript-eslint/parser` + `@typescript-eslint/eslint-plugin` (`^6.21.0`) as its own direct dependencies — Phase 8 may only need `.eslintrc` config changes (parser/parserOptions), not necessarily new devDependencies. Confirm during implementation whether pinning them directly is still wanted for explicitness.
7. **Jest transform**: keep `babel-jest` with `@babel/preset-typescript` (already works). Do not switch to `ts-jest`. `babel.config.js` stays.
8. **No `@types/node`**: unipika is a UI library, not a Node.js app. CommonJS module syntax is handled by the module system, not by `@types/node`.
9. **Drop AMD/UMD/YModules entirely** — investigated gravity-ui/uikit (the main gravity-ui UI library) as reference. uikit uses gulp + `@gravity-ui/gulp-utils` producing dual CJS+ESM output (`build/cjs/` + `build/esm/`). Zero AMD/UMD/YModules support anywhere in its source or build. The gravity-ui ecosystem standard is CJS+ESM only. unipika's AMD/YModules/browser-global logic is a legacy artifact, not an ecosystem convention. No known consumer needs the browser-global bundle (react-unipika uses `require()`, not `<script>` tags). Decision: match the ecosystem standard, drop AMD/UMD/YModules entirely. No separate UMD build output.
10. **Dual CJS/ESM output** — confirmed. `build/cjs/` + `build/esm/`, with conditional `exports` map in `package.json` (following uikit pattern: `import`/`require` keys with `types`/`default` sub-keys). Set up in Phase 8.
11. **CSS output** — compiled CSS goes to `styles/unipika.css` (following uikit pattern where styles stay in `styles/`). SCSS source stays in `styles/` for consumers who want to compile themselves. `exports` field exposes `"./styles/*": "./styles/*"` for passthrough.
12. **tsconfig.json** — starts by extending `@gravity-ui/tsconfig`. Options like `allowJs`, `checkJs`, `declaration`, `module`, `moduleResolution` set as needed during migration. Revisit at end of migration to finalize config. No separate `tsconfig.publish.json` — gulp-utils handles compiler options internally.
13. **package.json** — minimal changes only. Add/remove only what's needed for the migration. Cleanup of other fields is a separate task.
14. **Peer dependencies** — don't touch. Not needed currently.
15. **CI workflow** — no changes needed. Already runs `lint`, `typecheck`, `test`. No `build` step in CI (matching current setup).
16. **CHANGELOG.md** — do not touch. Auto-generated in CI.
17. **CODEOWNERS** — do not touch.
18. **CONTRIBUTING.md** — **verified: no update needed.** File is pure CLA legal boilerplate (Yandex CLA notice) with zero references to build tooling, gulp, or browserify. The earlier assumption that it "references old build setup" was incorrect.
19. **`.nvmrc`** — can update at the very end of the migration (Phase 8).
20. **react-unipika update** — separate task. Just ensure all needed types are importable from unipika.
21. **Type testing** — characterization tests only, to ensure runtime doesn't break during migration. No `tsd` or `expectType` type-level tests.
22. **`example/` directory** — an interactive playground (custom "storybook") where you can toggle settings and see formatted output. Currently depends on YModules, jQuery, bh (BEM HTML template engine), and bem-components (from yastatic.net CDN). **Leave untouched through Phases 0-8.** Migrate to TS in Phase 9 (at the very end, when all source is already TS and the build is switched).
23. **Test imports sequencing** — Phase 0 writes characterization tests against the *current* codebase (factory pattern). Phase 1 drops the factory AND updates all test imports (both characterization and existing tests) together to use direct imports. Full TS conversion of tests is Phase 7.
24. **CSS build details** (autoprefixer, sourcemaps, etc.) — implementation details, resolved during Code mode. Not part of the architectural plan.
25. **Formatters & linters** — code formatting rules (`.prettierrc.js`, `.editorconfig`) and linters (`.eslintrc`, `.stylelintrc`) do not change. Only add TS support where needed: `.eslintrc` gets `@typescript-eslint/parser` + `@typescript-eslint/eslint-plugin` in Phase 8. Everything else stays as-is.
26. **Plugins stay internal** — plugins are registered internally in `lib/format.js` (not exported from `lib/index.js`). No consumer imports them directly (only tests do). No new public API for plugins — runtime doesn't change. Plugins remain internal during and after migration.
27. **react-unipika consumer** — currently imports via `import unipika from '@gravity-ui/unipika/lib/unipika'` (default import, factory result) with `// @ts-ignore` / `// @ts-expect-error` comments (no types available). Uses: `unipika.format()`, `unipika.formatFromYSON()`, `unipika.formatRaw()`, `unipika.formatValue()`, `unipika.converters.raw()`, `unipika.converters.yson()`. These are exactly the functions unipika will export as named exports (see Public API surface). The unipika migration does not change runtime behavior — the same functions with the same signatures will be available. Updating react-unipika to use the new import path and types is a separate react-unipika task.
28. **Test deep imports** — [`test/plugins/yql-date.test.ts`](test/plugins/yql-date.test.ts:4) directly imports `require('../../lib/plugins/yql-date')` etc. These deep imports into `lib/` are fine for tests (they import from source, not from the published package). They will continue to work during migration as source files are converted to `.ts`.
29. **`build-storybook` script** — currently `npm run build && mkdir storybook-static && cp -r dist example storybook-static`. It's not real Storybook — it builds the library + example playground and copies them into `storybook-static/` for static deployment. Stays as-is through Phases 0-8 (will be broken after Phase 1). Updated in Phase 9 when the playground is migrated.
30. **Playground migration** — done at the very end (Phase 9), when all source is already TS and the build is switched. Approach: rewrite `example/example.js` → `example/example.ts`, import unipika directly from source, replace YModules loading with direct code (jquery + bh stay from CDN), bundle via esbuild in gulpfile, update `build-storybook` script.
31. **Build sequencing** — the build tool switch (gulp + `@gravity-ui/gulp-utils`, gulpfile rewrite, `package.json` `main`/`exports`/`sideEffects`/`files` update, `build/` output) happens in Phase 8, once all source is already `.ts`. During Phases 1-7, `package.json`'s `main` stays pointing at `./lib/index.js` (raw source) — the package keeps working for consumers with no build step, exactly as it does today. CI never runs a `build` step (Decision #15), so the lack of a build tool during migration is a non-issue. `tsconfig.json` + `typecheck` script (`tsc --noEmit`) are set up in Phase 1 and work throughout — they're for the type-checker, independent of the build tool.

## Source of reusable types
[`react-unipika/src/StructuredYson/types.ts`](../react-unipika/src/StructuredYson/types.ts) already defines `UnipikaSettings`, `UnipikaValue`, `UnipikaMap`, `UnipikaList`, etc. These will be adapted (with `type` instead of `interface`) into unipika's own `.ts` files.

## Public API surface (what gets exported from `index.ts`)
The following functions and objects will be exported as named exports:
- `format(node, settings, converter?)` — main format function.
- `formatFromYSON(node, settings?)` — format with yson converter.
- `formatFromYQL(node, settings?)` — format with yql converter.
- `formatRaw(node, settings?)` — format with raw converter, forced json settings.
- `formatValue(node, settings, level?)` — format a single value node.
- `formatKey(key, settings, level?)` — format a map key.
- `formatAttributes(node, settings, level?)` — format attributes.
- `converters` — object with `.yson`, `.yql`, `.raw` converter functions.
- `utils` — object with `.format`, `.yson`, `.utf8`, `.type` (see Approved Runtime Change #6: promoted from an accidental export to an intentional, documented one).
- Types: `UnipikaSettings`, `UnipikaValue`, `UnipikaNode`, `UnipikaMap`, `UnipikaList`, `UnipikaPrimitive`, etc.

---

## Migration Phases

### Phase 0 — Characterization tests (capture current behavior)
**Status: [x] DONE** — 182 tests across 5 files in `test/characterization/`, all passing.

Goal: write temporary tests in a separate directory (`test/characterization/`) that capture the *current* runtime behavior before any changes. These tests serve as a safety net — after each migration phase, run them to verify runtime hasn't changed. They will be deleted at the end of the migration.

**Analysis of existing test coverage gaps:**
- `formatRaw`, `formatFromYSON`, `formatValue` — well covered (plain + HTML output).
- `converters/yson-to-unipika`, `converters/yql-to-unipika` — well covered.
- `utils/format` — partially covered (`toPaddedHex`, `toPaddedOctal`, `binaryToHex`, `repeatChar`).

**Missing coverage to add:**
- [x] `formatFromYQL` — no dedicated test for this format function.
- [x] `formatKey` — not directly tested.
- [x] `formatAttributes` — not directly tested.
- [x] All settings combinations: `compact`, `break`, `indent`, `maxStringSize`, `maxListSize`, `omitStructNull`, `treatValAsData`, `binaryAsHex`, `escapeWhitespace`, `escapeYQLStrings`, `nonBreakingIndent`, `highlightControlCharacter`, `validateSrcUrl`, `normalizeUrl`.
- [x] Error handling — invalid inputs that throw errors (e.g., unsupported `$value` types, invalid `$attributes`).
- [x] `formatValue` with `$optional` — more thorough coverage.
- [x] YQL type plugins without dedicated tests (verified: 25 of 28 YQL plugins untested — only `yql-date`, `yql-string`, `yql-uuid` have dedicated test files today).
- [x] The factory function itself — `require('../..')()` with/without settings.
- [x] `converters.raw` — converter output (only tested indirectly via formatRaw).

- [x] Create `test/characterization/` directory.
- [x] Write characterization tests covering all gaps above.
- [x] Verify all characterization tests pass against current codebase.
- [x] Add `test/characterization/` to `.eslintignore` (temporary, will be removed in Phase 8).
- **Commit boundary.**

### Phase 1 — JS refactor: drop factory, AMD/UMD, `say()`; set up `tsconfig.json`
**Status: [x] DONE** — factory dropped, AMD/UMD removed, `say()` deleted, `tsconfig.json` + `typecheck` set up. 545 tests pass, `tsc --noEmit` passes, lint passes (0 errors).

Goal: drop the factory pattern, AMD/UMD/browser-global logic, and `say()`. Set up `tsconfig.json` and `typecheck` script. **No build tool change** — `package.json`'s `main` stays as `./lib/index.js` (raw source), no `exports` map, no `build/` directory, no gulpfile rewrite. The package keeps working for consumers exactly as it does today.

- [x] Add devDependency: `@gravity-ui/tsconfig`.
- [x] Create `tsconfig.json` (extends `@gravity-ui/tsconfig`), `allowJs: true`, `checkJs: false`, `declaration: true`, `noEmit: true`, `strict: false`, `noUnusedLocals: false`, `noUnusedParameters: false`, `noImplicitReturns: false`, `include: ["lib/**/*", "test/**/*"]`. No `exclude` — the `include` glob is specific enough (only `lib/` and `test/`), and `node_modules` is excluded by TS's default. **Note:** `module` and `moduleResolution` are inherited from the base `@gravity-ui/tsconfig` (`commonjs`/`node`) — not overridden. The plan's original `module: ESNext` / `moduleResolution: Node` was dropped in favor of inheriting the base config's values, which keeps the config minimal. The base `moduleResolution: "node"` triggers a deprecation *warning* in the VS Code editor (newer bundled TS) but is NOT an error for the project's TS 5.4.5 (`tsc --noEmit` exits 0). Will revisit in Phase 8 when the build tool is switched.
- [x] Update `package.json`:
  - `scripts.typecheck` → `tsc --noEmit` (was empty string `""` — a no-op).
  - **Do NOT change** `main` (stays `./lib/index.js`), do NOT add `exports`/`module`/`types`/`sideEffects` — those come in Phase 8.
  - **Do NOT** add `@gravity-ui/gulp-utils` or `rimraf` yet — those come in Phase 8.
  - **Do NOT** remove old build devDependencies (`gulp-autoprefixer`, `gulp-derequire`, `browserify`, `vinyl-source-stream`, `babel-polyfill`) yet — those come in Phase 8.
- [x] Refactor `lib/index.js` → drop factory, drop AMD/UMD, export functions directly via `module.exports = { format, formatFromYSON, ..., utils }`. **Keep the `utils` key** in the exported object (`unipika.utils.{format,yson,utf8,type}`, unchanged shape) — now a first-class, intentionally documented named export, not just a backward-compat leftover (see Approved Runtime Change #6).
- [x] Remove `lib/unipika.js` (deep-import entry point — no longer needed).
- [x] Delete `lib/say.js` (dead code — not used internally or by react-unipika).
- [x] Update test imports minimally — change `require('../..')()` to `require('../..')` (drop factory call) so tests pass with the new direct exports. Full TS conversion of tests is Phase 7. `test/utils/format.test.ts`'s `unipika.utils.format` access keeps working unchanged since `utils` remains exported. Also removed the `say` characterization test (the `returns object with say` test in `test/characterization/errors-converters-factory.test.ts`) since `say()` is deleted in this phase.
- [x] **HIGHLIGHT:** react-unipika import path changes from `@gravity-ui/unipika/lib/unipika` → `@gravity-ui/unipika`. This is a breaking change for consumers.
- [x] Verify `jest` still passes (including characterization tests) — 545 tests pass (was 546; 1 removed `say` test).
- [x] Verify `npm run typecheck` (`tsc --noEmit`) passes — this is the first time this CI step actually checks anything (was a no-op before).
- [x] Verify CI pipeline ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) passes: `lint`, `typecheck`, `test` — all three verified locally (lint: 0 errors/91 pre-existing warnings; typecheck: exit 0; test: 545 passed).
- **Commit boundary.**

### Phase 1.1 — Convert CommonJS to ESM (import/export)
**Status: [x] DONE** — all `lib/**/*.js` and `test/**/*.js`/`.test.ts` files converted from `require`/`module.exports` to `import`/`export`. 545 tests pass, lint passes (0 errors).

Goal: convert the entire `lib/` directory and all test files from CommonJS (`require`/`module.exports`) to ESM (`import`/`export`). This is an intermediate step before the TS migration — the codebase stays in `.js` files (Babel transpiles ESM back to CJS for Jest via `babel-jest`), but the module syntax is now modern ESM. This makes the subsequent TS conversion (Phases 3-7) a pure syntax/type-annotation task, with no module-system changes needed.

**Key decisions:**
- **Named exports only** — no `export default` anywhere (consistent with the plan's "No default exports" rule). `lib/index.js` uses named exports (`export {format, formatFromYSON, ...}` + `export const converters` + `export const utils`).
- **`import * as utils`** for namespace imports (e.g., `import * as utils from './format'`) — replaces `const utils = require('./utils/format')` which returned the whole `module.exports` object.
- **`type.js` explicit `is*` methods** — replaced the IIFE with `generateMethod` loop with explicit `export function isString`, `export function isNumber`, etc. (following the pattern from commit `b64e999`). The `type.isString` etc. access pattern is preserved by attaching the `is*` functions to the `type` function.
- **PluginFactory naming convention preserved** — `module.exports = function(_format) {...}` → `export function xxxPluginFactory(_format) {...}` (e.g., `booleanPluginFactory`, `yqlDatePluginFactory`, `listPluginFactory`).
- **Re-export pattern** for `double.js`/`number.js`: `export {int64PluginFactory as doublePluginFactory} from './int64'`.
- **Inline exports** — `lib/utils/format.js` and `lib/utils/yson.js` use `export` at each definition site (e.g., `export function parseSetting`, `export const JSON`) instead of a bottom `export { ... }` block. The `// Exports for unit testing` comment is preserved above `toPaddedHex`/`toPaddedOctal` and `binaryToHex`.
- **`vendor/utf8.js` untouched** — left as CommonJS (user instruction). `lib/utils/utf8.js` imports it via `import utf8 from '../../vendor/utf8'` (Babel interop handles the CJS default export).
- **`Object.assign` not used** — always returns an object even when it could be `undefined`; avoided in favor of explicit conditional logic.
- **Recursive converter functions renamed** — `const convert = function(...)` with recursive self-calls became the exported function name (e.g., `rawToUnipika`, `ysonToUnipika`, `yqlToUnipika`).

**Files changed:**
- `jest.config.ts` — transform pattern `'\\.tsx?$'` → `'\\.[jt]sx?$'` to handle ESM in `.js` files via `babel-jest`.
- `lib/index.js` — `require`/`module.exports` → `import`/`export` with named exports.
- `lib/format.js` — IIFE removed, `import` for all converters/plugins/utils, `export function` for all format functions.
- `lib/converters/*.js` (3 files) — IIFEs removed, `import`/`export function` for converters.
- `lib/plugins/*.js` (30+ files) — `module.exports = function` → `export function xxxPluginFactory`.
- `lib/utils/format.js` — IIFE removed, inline `export` at each definition site.
- `lib/utils/type.js` — IIFE + `generateMethod` loop → explicit `is*` named exports.
- `lib/utils/yson.js` — IIFE removed, inline `export` at each definition site.
- `lib/utils/utf8.js` — IIFE removed, `import utf8 from '../../vendor/utf8'` + named `encode`/`decode` exports.
- `lib/utils/list-fragment.js`, `lib/utils/map-fragment.js` — IIFEs removed, `import`/`export function`.
- `test/utils.js` — IIFE with `module.exports` → named `export function toPlainText`/`toHTMLText`.
- All `test/**/*.test.ts` (14 files) — `const unipika = require('../..')` → `import * as unipika from '../..'`.
- `test/plugins/yql-date.test.ts` — `require('../../lib/plugins/yql-date')` → `import {yqlDatePluginFactory as date} from '../../lib/plugins/yql-date'` (and similar for datetime/timestamp).
- `test/utils/format.test.ts` — `expect(_utils).toBeInstanceOf(Object)` → `expect(Object.prototype.toString.call(_utils)).toBe('[object Object]')` (Module Namespace Objects from `import * as` fail `instanceof Object` under Babel).

**Not changed (intentionally):**
- `vendor/utf8.js` — left as CommonJS (user instruction).
- `babel.config.js`, `.prettierrc.js`, `gulpfile.js` — Node.js config files, stay CommonJS.
- `example/*.js` — demo/playground files, not part of library or tests.

- [x] Convert all `lib/**/*.js` from `require`/`module.exports` to `import`/`export`.
- [x] Convert `test/utils.js` from IIFE/`module.exports` to named `export function`.
- [x] Convert all `test/**/*.test.ts` `require()` calls to `import` statements.
- [x] Update `jest.config.ts` transform pattern to handle ESM in `.js` files.
- [x] Fix `test/utils/format.test.ts` `toBeInstanceOf(Object)` for Module Namespace Objects.
- [x] Move `lib/utils/format.js` and `lib/utils/yson.js` exports inline to definition sites.
- [x] Verify all 545 tests pass.
- [x] Verify ESLint passes (0 errors, only pre-existing warnings).
- **Commit boundary.**

### Phase 2 — Replace vendor/utf8.js with npm package
**Status: [~] PARTIAL — npm swap BLOCKED; characterization tests + `.d.ts` done**

Goal: replace vendored utf8 with npm package (pinned to v2.1.2 for identical runtime).

**Outcome / blocker (HIGHLIGHT):** The vendored `vendor/utf8.js` is **NOT** identical to npm `utf8@2.1.2` (nor to the latest `utf8@3.0.0`). It carries a **local modification** adding an `options.allowTruncatedEnd` parameter to `decode()`, and unipika actively relies on it in [`lib/converters/yson-to-unipika.js:210`](lib/converters/yson-to-unipika.js:210): `decodeString(node[VALUE], {allowTruncatedEnd: node[INCOMPLETE]})`. Neither npm `utf8@2.1.2` nor `utf8@3.0.0` supports this option — their `decode(byteString)` takes no options and throws `Error('Invalid byte index')` on a truncated multibyte sequence instead of returning a graceful partial decode. A naive swap was attempted and **8 of 37 new characterization tests fail**, including the yson-converter test proving that incomplete YSON strings get misclassified as `$binary` instead of receiving a partial `$decoded_value`. The 29 non-truncation tests pass — npm `utf8@3.0.0` is otherwise byte-identical to the vendored copy (same `encode`, same `decode` for valid input, same error messages, same round-trips). **Decision: defer the npm swap.** The `allowTruncatedEnd` patch needs to be preserved somehow (local wrapper, forked decode, or upstream PR) — to be resolved separately. `vendor/utf8.js` stays; `lib/utils/utf8.js` stays unchanged.

- [x] **Verify vendored code matches npm package**: diffed `vendor/utf8.js` against `node_modules/utf8/utf8.js` for both `utf8@2.1.2` and `utf8@3.0.0`. **HIGHLIGHT:** the vendored copy has a local `allowTruncatedEnd` patch that the npm packages lack (see outcome above). Diff details: the npm `decode(byteString)` takes no `options` arg; the vendored `decode(byteString, options)` adds `allowTruncatedEnd` handling in `readContinuationByte` (returns `false` instead of throwing at end-of-input) and in `decodeSymbol` (bails on `false` continuation bytes). The license header also differs (vendored has the full MIT text; npm has a one-line banner) — cosmetic only.
- [x] Add utf8 characterization tests to `test/characterization/utf8.test.ts` (37 tests) capturing the **current vendored behavior**, including the `allowTruncatedEnd` patch: `encode` (ascii/2-byte/3-byte/4-byte/mixed/lone-surrogate-throws), `decode` no-options (round-trips + throws on truncated/invalid), `decode` with `allowTruncatedEnd` (truncated multibyte → `""` instead of throwing; valid prefix preserved; genuinely invalid bytes still throw; `allowTruncatedEnd: false` behaves like no-options), and yson-converter integration (truncated multibyte WITH `$incomplete` → partial `$decoded_value`, not `$binary`; WITHOUT `$incomplete` → `$binary`). These tests are the safety net for any future utf8 swap.
- [~] Add `utf8@2.1.2` to dependencies — **BLOCKED** (see outcome). npm `utf8` was installed (`--save-exact`) and then uninstalled; `package.json` is back to its original state (no `dependencies` field). The package's first-ever runtime dependency is still pending resolution of the `allowTruncatedEnd` blocker.
- [~] Add `@types/utf8` to devDependencies — **BLOCKED** (see outcome). Not added; the vendored copy is typed via a hand-written `vendor/utf8.d.ts` instead (see below).
- [~] Update `lib/utils/utf8.js` to `require('utf8')` — **BLOCKED / reverted.** The swap was attempted; 8 characterization tests failed (all `allowTruncatedEnd` cases). `lib/utils/utf8.js` was reverted to `require('../../vendor/utf8')` and is unchanged from Phase 1.
- [~] Remove `vendor/utf8.js` (and `vendor/` dir) — **BLOCKED.** `vendor/utf8.js` stays. A new `vendor/utf8.d.ts` was added (see below) so the relative import is properly typed.
- [x] **Write `vendor/utf8.d.ts`** — hand-written type declarations for the vendored copy (not `@types/utf8`), structured as a real module (not ambient `declare module`) so the relative import `require('../../vendor/utf8')` in `lib/utils/utf8.js` resolves to it. Exports `encode(string): string`, `decode(byteString, options?: Utf8DecodeOptions): string`, `version: string`, and `type Utf8DecodeOptions = { allowTruncatedEnd?: boolean }`. Verified the `.d.ts` is actually picked up by `tsc` (a probe confirmed `decode` returns `string`, not `any`; passing a wrong type errors).
- [x] **Add `vendor/**/*.d.ts` to `tsconfig.json` `include`** — so the hand-written `.d.ts` is part of the root program and its syntax is checked by `tsc --noEmit` (without this, a `.d.ts` loaded only as an import dependency is not parsed for syntax errors — verified: a deliberate syntax error was silently ignored). Used the targeted `vendor/**/*.d.ts` glob (not `vendor/**/*`) so the third-party `vendor/utf8.js` JS source is NOT pulled into the TS program (only the declaration file is). `include` is now `["lib/**/*", "test/**/*", "vendor/**/*.d.ts"]`.
- [x] Verify `jest` + `typecheck` + `lint` pass: `tsc --noEmit` exit 0; `jest` 582 passed (was 545 in Phase 1; +37 utf8 characterization tests); `eslint` 0 errors / 91 pre-existing warnings (unchanged from Phase 1 — no new warnings).
- **Commit boundary.**
- **Deferred item:** resolve the `allowTruncatedEnd` blocker (preserve the patch via a local wrapper around npm `utf8`, a forked `decode`, or an upstream PR to utf8.js), then complete the npm swap. Tracked as an open question below.

### Phase 3 — Convert low-level utility modules to TS
**Status: [ ] NOT STARTED**

Goal: convert leaf modules with no internal unipika dependencies (or only leaf deps) to `.ts`. Bottom-up order:

- [ ] `lib/utils/type.js` → `type.ts` (no internal deps).
- [ ] `lib/utils/utf8.js` → `utf8.ts` (depends on the vendored `vendor/utf8`, typed via `vendor/utf8.d.ts` — see Phase 2: the npm swap is blocked by the `allowTruncatedEnd` patch; the vendored copy stays).
- [ ] `lib/utils/yson.js` → `yson.ts` (depends on type.js).
- [ ] `lib/utils/format.js` → `format.ts` (large, ~655 lines; pure utils).
- [ ] `lib/utils/list-fragment.js` → `list-fragment.ts`.
- [ ] `lib/utils/map-fragment.js` → `map-fragment.ts`.
- After each file: run `jest` (including characterization tests) + `typecheck` to confirm no runtime regression.
- **Commit boundary(s)** — user may commit per-file or per-group.

### Phase 4 — Convert converters to TS
**Status: [ ] NOT STARTED**

- [ ] `lib/converters/raw-to-unipika.js` → `.ts`.
- [ ] `lib/converters/yson-to-unipika.js` → `.ts`.
- [ ] `lib/converters/yql-to-unipika.js` → `.ts` (largest converter, ~488 lines).
- Run `jest` (including characterization tests) + `typecheck` after each.
- **Commit boundary.**

### Phase 5 — Convert plugins to TS
**Status: [ ] NOT STARTED**

38 plugin files (10 YT + 28 YQL, verified count), all follow the same `module.exports = function(_format) {...}` factory pattern. Group by category:

- [ ] YT plugins: `list`, `map`, `string`, `number`, `int64`, `uint64`, `double`, `boolean`, `null`, `tagged`.
- [ ] YQL plugins: `yql-list`, `yql-stream`, `yql-tuple`, `yql-struct`, `yql-dict`, `yql-string`, `yql-utf8`, `yql-int64`, `yql-uint64`, `yql-double`, `yql-decimal`, `yql-bool`, `yql-date`, `yql-datetime`, `yql-timestamp`, `yql-tzdate`, `yql-tzdatetime`, `yql-tztimestamp`, `yql-interval`, `yql-uuid`, `yql-null`, `yql-variant`, `yql-enum`, `yql-set`, `yql-json`, `yql-yson`, `yql-tagged`, `yql-pg`.
- [ ] `lib/format.js` → `format.ts` (the orchestrator that registers all plugins).
- Run `jest` (including characterization tests) + `typecheck` after each group.
- **Commit boundary(s).**

### Phase 6 — Convert entry point to TS
**Status: [ ] NOT STARTED**

- [ ] `lib/index.js` → `index.ts` (direct named exports, no factory, no AMD/UMD).
- [ ] Export types (`UnipikaSettings`, `UnipikaValue`, etc.) from `index.ts`.
- [ ] Run full test suite (including characterization tests) + `typecheck`.
- **Commit boundary.**

### Phase 7 — Convert tests to TS
**Status: [ ] NOT STARTED**

**Verified current state:** most test files already have a `.ts` extension (`test/converters/*.test.ts`, `test/format/*.test.ts`, `test/plugins/*.test.ts`, `test/utils/format.test.ts`) — they are transpiled by babel-jest but never type-checked (no `tsconfig.json` exists yet, and `checkJs`/`tsc` don't touch them). Only `test/utils.js` still has a `.js` extension. So this phase is NOT "rename .js to .ts" for most files — it's: (a) rename the one remaining `.js` file, (b) replace untyped `require(...)` calls with proper `import` statements across all `.test.ts` files, (c) add real types so they benefit from the type-checking enabled at the end of this phase.

Goal: convert remaining JS test files to TS and add proper types. Does NOT enable strict mode yet (that's Phase 8).

- [ ] Review [`jest.config.ts`](jest.config.ts) — confirm babel-jest handles `.ts` test files (it already does).
- [ ] `test/utils.js` → `utils.ts`.
- [ ] Update test imports across ALL `test/**/*.test.ts` files: `require('../..')` → proper ES import from `index.ts` (this touches every test file, not just `test/utils.ts`, since they all still use the factory-call `require` pattern).
- [ ] Add proper types to test helpers and test data.
- [ ] Remove `checkJs: false` from `tsconfig.json` (enable JS type-checking now that tests are TS).
- **Commit boundary.**

### Phase 8 — Build tool switch, strict mode & cleanup
**Status: [ ] NOT STARTED**

Goal: switch the build from gulp+browserify to gulp + `@gravity-ui/gulp-utils` (following uikit pattern), enable strict mode, and clean up. All source is already `.ts` at this point.

**Build tool switch:**
- [ ] Add devDependencies: `@gravity-ui/gulp-utils`, `rimraf`.
- [ ] Rewrite `gulpfile.js` (based on uikit's gulpfile, adapted for unipika):
  - `clean` task: `rimrafSync('build')` + clean compiled CSS.
  - `compileTs(modules)` function using `@gravity-ui/gulp-utils` `createTypescriptProject()`:
    - CJS: `module: 'nodenext'`, `moduleResolution: 'nodenext'` → `build/cjs/`.
    - ESM: `module: 'esnext'`, `moduleResolution: 'bundler'` → `build/esm/`.
    - **API note (verified against `@gravity-ui/gulp-utils@1.0.3` on npm):** `transformScssImports` and `transformLocalModules` are NOT standalone exports. The package's root only exports `createTypescriptProject` and `addVirtualFile`. The transformers are properties of the object returned by `await createTypescriptProject(...)`, e.g. `project.customTransformers.transformScssImports` / `project.customTransformers.transformLocalModules`. The gulpfile must call `createTypescriptProject()` once per target (CJS/ESM) and pull the transformers off the resulting object, not import them directly.
    - Virtual `package.json` added to output dirs via `addVirtualFile()` (`type: 'module'` for esm, `type: 'commonjs'` for cjs).
  - `compile-to-esm` task.
  - `compile-to-cjs` task.
  - `styles` task: compile `styles/unipika.scss` → `styles/unipika.css` via `gulp-dart-sass`.
  - `build` task: `series(['clean', parallel(['compile-to-esm', 'compile-to-cjs']), 'styles'])`.
- [ ] Update `package.json`:
  - `main` → `./build/cjs/index.js` (was `./lib/index.js` — raw source; now requires `npm run build`).
  - `module` → `./build/esm/index.js`.
  - `types` → `./build/cjs/index.d.ts`.
  - `exports` map (following uikit pattern):
    ```json
    "exports": {
      ".": {
        "import": { "types": "./build/esm/index.d.ts", "default": "./build/esm/index.js" },
        "require": { "types": "./build/cjs/index.d.ts", "default": "./build/cjs/index.js" }
      },
      "./styles/*": "./styles/*"
    }
    ```
  - `sideEffects`: `["*.css", "*.scss"]` (enables tree-shaking of JS while preserving CSS).
  - `scripts.build` → `gulp`.
  - `scripts.prepublishOnly` → `npm run typecheck && npm run lint && npm run test && npm run build` (full verification before publish).
  - `scripts.clean` → update from `git checkout ./dist/ **/dist/` to `gulp clean`.
  - `scripts.build-storybook` → keep as-is for now (will be broken; updated in Phase 9).
  - Remove from devDependencies: `gulp-autoprefixer`, `gulp-derequire`, `browserify`, `vinyl-source-stream`, `babel-polyfill` (not imported anywhere, deprecated leftover).
  - Keep `gulp` (still used, now with gulp-utils), `gulp-dart-sass` (still used for styles).
  - Keep `ts-node` (used by Jest to load `jest.config.ts`).
  - Keep `babel.config.js` and `@babel/preset-*` (used by babel-jest for test transforms).
  - ~~Remove `vendor` from `files`.~~ **UPDATE (Phase 2): keep `vendor` in `files`** — the npm swap is blocked, `vendor/utf8.js` stays (typed via `vendor/utf8.d.ts`). Do NOT remove `vendor` from `files`.
  - Add `build/` to `files`.
  - Keep `styles/` in `files` (SCSS source + compiled CSS for consumers).
- [ ] Update existing `.gitignore` to include `build/` (in addition to existing entries like `node_modules/`, `dist/`, etc.).
- [ ] Remove `dist/` directory (old build output, no longer used). Note: `dist/` is already git-ignored and untracked — this is local cleanup of a build artifact, not a `git rm`.
- [ ] Verify build produces `build/cjs/`, `build/esm/` with `.d.ts` files.

**Strict mode & eslint:**
- [ ] Enable `strict: true` in `tsconfig.json`.
- [ ] Run `tsc --noEmit` and resolve all remaining type errors (report any `any`/`as` cases).
- [ ] Remove `allowJs` (all source now `.ts`).
- [ ] Revisit `tsconfig.json` — finalize all options now that migration is complete.
- [ ] Update `.eslintrc` for TS: add `@typescript-eslint/parser`, `@typescript-eslint/eslint-plugin`, update `parserOptions`. Remove `ecmaVersion: 6` and CommonJS globals (`require`, `module`, `modules`).
- [ ] Verify `lint:js` passes with TS rules.

**Cleanup:**
- [ ] Final full test + build verification.
- [ ] Update `.nvmrc` — can bump Node version at the very end (uikit uses Node >= 20.19).
- [ ] Clean up ignore files and remove stale references:
  - `.npmignore`: remove `karma.conf.js` (doesn't exist), add `plans/`, `.github/`, config files. Update for new `build/` structure.
  - `.eslintignore`: ~~remove `vendor` (deleted),~~ remove `dist` (deleted), add `build` if needed. **UPDATE (Phase 2): do NOT remove `vendor`** — `vendor/utf8.js` stays (npm swap blocked). Keep `vendor` in `.eslintignore` (vendored third-party JS should stay lint-ignored).
  - `.prettierignore`: ~~remove `vendor`,~~ remove `dist`, add `build` if needed. **UPDATE (Phase 2): do NOT remove `vendor`** — keep `vendor` in `.prettierignore`.
  - `.gitignore` (updated earlier in this phase): verify it covers `node_modules/`, `build/`, `*.log`, `.DS_Store`.
- [ ] Remove any other stale/junk files found during cleanup.
- [ ] Delete `test/characterization/` directory (temporary tests no longer needed).
- [ ] Remove `test/characterization/` from `.eslintignore`.
- **Commit boundary.**

### Phase 9 — Migrate playground (example/) to TS
**Status: [ ] NOT STARTED**

Goal: migrate the interactive playground (`example/`) to work with the new TS build. This is done at the very end, when all source is already TS and the build is switched, to avoid dealing with YModules and the factory pattern during migration.

- [ ] Rewrite `example/example.js` → `example/example.ts`:
  - Import unipika directly from source: `import {format, formatRaw, converters} from '../lib'`.
  - Replace YModules loading (`modules.require(['jquery', 'bh', 'unipika'], callback)`) with direct code — jquery and bh are loaded from CDN in `index.html`, available as globals.
  - Remove `require('../lib')({exportBrowserModule: true})` — no longer needed.
- [ ] Add `esbuild` (or `gulp-esbuild`) to devDependencies.
- [ ] Add gulp task `bundle-example` — uses esbuild to bundle `example/example.ts` → `example/dist/example-bundle.js`.
- [ ] Keep `example/example.scss` compiled via `gulp-dart-sass` (existing gulp task pattern).
- [ ] Update `example/index.html` — update CSS path from `../dist/unipika.css` to `../styles/unipika.css`.
- [ ] Update `build-storybook` script: `npm run build && mkdir storybook-static && cp -r build example storybook-static`.
- [ ] Verify playground builds and works (open `example/index.html` in browser).
- **Commit boundary.**

### Phase 10 — Migration guide for consumers
**Status: [ ] NOT STARTED**

Goal: write a migration guide documenting all breaking changes for the new major version.

- [ ] Create `MIGRATION.md` documenting:
  - **Import path change**: `@gravity-ui/unipika/lib/unipika` → `@gravity-ui/unipika` (single entry point).
  - **Factory pattern removed**: `require('@gravity-ui/unipika')()` → `import {format, formatValue, ...} from '@gravity-ui/unipika'`.
  - **AMD/UMD dropped**: library is now dual CJS/ESM only, no browser-global/AMD/YModules registration.
  - **Build output changed**: `dist/` → `build/cjs/` + `build/esm/` (with `.d.ts` files).
  - **Types now included**: `UnipikaSettings`, `UnipikaValue`, etc. exported from the package.
  - **`utils` now officially documented**: `utils.format`, `utils.yson`, `utils.utf8`, `utils.type` remain accessible exactly as today, but is now a first-class, intentionally documented named export (`import {utils} from '@gravity-ui/unipika'` or `import * as unipika from '@gravity-ui/unipika'; unipika.utils.format(...)`) — no behavior change, just promoted from an accidental export to a documented one.
  - **`say()` removed**: dead code, deleted (confirmed unused internally and by react-unipika).
  - ~~**vendor/utf8.js removed**: replaced with npm `utf8@2.1.2` dependency.~~ **UPDATE (Phase 2): this did NOT happen** — the npm swap is blocked by the `allowTruncatedEnd` patch. `vendor/utf8.js` stays. If the blocker is resolved later, update this section then; for now, do NOT document vendor/utf8.js removal in the migration guide.
- [ ] Update `README.md` with new usage examples.
- **Commit boundary.**

---

## Progress Tracking

| Phase | Description | Status |
|-------|-------------|--------|
| 0 | Characterization tests | ✅ DONE (182 tests, 5 files in `test/characterization/`) |
| 1 | JS refactor: drop factory, AMD/UMD, `say()`; set up `tsconfig.json` | ✅ DONE (545 tests, tsc --noEmit, lint all pass) |
| 1.1 | Convert CommonJS to ESM (import/export) | ✅ DONE (545 tests, lint 0 errors) |
| 2 | Replace vendor/utf8 with npm | ◐ PARTIAL — npm swap BLOCKED by `allowTruncatedEnd` patch; 37 characterization tests + `vendor/utf8.d.ts` added (582 tests, tsc, lint all pass) |
| 3 | Utils → TS | NOT STARTED |
| 4 | Converters → TS | NOT STARTED |
| 5 | Plugins → TS | NOT STARTED |
| 6 | Entry point → TS | NOT STARTED |
| 7 | Tests → TS | NOT STARTED |
| 8 | Build tool switch, strict mode & cleanup | NOT STARTED |
| 9 | Migrate playground (example/) to TS | NOT STARTED |
| 10 | Migration guide for consumers | NOT STARTED |

## Open Questions / Items to Highlight
1. **`parentKey = Symbol('parent')`** in `format.js` — mutates input nodes by attaching a Symbol property. Typing this requires care; may need a branded type. Will highlight if it forces `as`.
2. **`type.js` dynamic method generation** (`type.isString`, etc.) — generates `is*` methods at runtime via loop. Typing these requires a mapped type; will propose a solution in Phase 3.
3. **Styles handling** — SCSS compiled via `gulp-dart-sass` (stays). Compiled CSS output to `styles/unipika.css`. CSS build details (autoprefixer, sourcemaps) resolved during implementation.
4. **react-unipika update** — after Phase 1, react-unipika's import path changes from `@gravity-ui/unipika/lib/unipika` → `@gravity-ui/unipika`. This should be coordinated. react-unipika may also want to import types from unipika instead of duplicating them in `StructuredYson/types.ts` — but that's a separate react-unipika task.
5. **`lib/plugins/README.md`** — exists in the plugins directory. Should be preserved during TS conversion.
6. **Publish contract changes** — verified: today `package.json`'s `main` points directly to `./lib/index.js` (raw source), not to `dist/`. This means a build step is currently NOT required for the package to work for npm consumers — `dist/` is a separate browserify UMD bundle (for the `example/` playground / browser-global consumption), unrelated to `main`. During Phases 1-7, `main` stays as `./lib/index.js` — the package keeps working with no build step. In Phase 8, `main` becomes `./build/cjs/index.js`, so **running `npm run build` becomes mandatory before the package works at all for consumers** — this wasn't true before. `prepublishOnly` already runs `npm run build` today, so publishing itself is safe, but this is a meaningful shift in what "the package works" depends on and should be called out alongside the react-unipika import-path change as a highlighted consequence of Phase 8.
7. **`typecheck` script is currently a no-op** — verified: `package.json` has `"typecheck": ""` today, and CI already calls `npm run typecheck` (currently vacuously passing). Phase 1 replacing it with `tsc --noEmit` is the first time this CI step will actually check anything — worth being aware that CI's "typecheck" history before this migration carries no signal.
8. **tsconfig module/moduleResolution mismatch** — **Phase 1 decision:** `module` and `moduleResolution` are NOT overridden in `tsconfig.json` — they are inherited from the base `@gravity-ui/tsconfig` (`module: "commonjs"`, `moduleResolution: "node"`). The plan's original `module: ESNext` / `moduleResolution: Node` was dropped in favor of inheriting the base config's values. This means `npm run typecheck` (the editor/CI type-check) runs under `commonjs`/`node` settings, which don't match either actual build target (CJS uses `nodenext`/`nodenext`, ESM uses `esnext`/`bundler`, both set via per-target `compilerOptions` passed to `createTypescriptProject()` in Phase 8). Worth deciding during Phase 8 whether this is acceptable (matches uikit's approach) or whether the base tsconfig should mirror one of the two real targets more closely. **Note:** the base `moduleResolution: "node"` triggers a deprecation *warning* in the VS Code editor (newer bundled TS) but is NOT an error for the project's TS 5.4.5 (`tsc --noEmit` exits 0).
   - **Related open question, higher stakes than it looks:** it's unverified whether `createTypescriptProject()` reads/extends the root `tsconfig.json` at all (in particular `strict: true`, enabled in Phase 8), or whether it only honors the explicit per-target `compilerOptions` passed to it. If the latter, enabling `strict: true` in Phase 8 would only tighten the standalone `tsc --noEmit` check and would **not** affect the `.d.ts` actually shipped in `build/cjs/` and `build/esm/` — meaning the types consumers (react-unipika) receive could be generated under non-strict settings even after Phase 8 "enables strict mode." Verify this explicitly during Phase 8, since it directly affects whether the migration's main deliverable (correct, strict-checked `.d.ts`) is actually achieved.
9. **`tsconfig.json` `include` excludes `gulpfile.js` and `jest.config.ts`** — `jest.config.ts` is loaded by `ts-node`. **Phase 1 verified:** now that `tsconfig.json` exists, `ts-node` picks it up (it extends `@gravity-ui/tsconfig` which has `module: "commonjs"`, `moduleResolution: "node"` — compatible with `ts-node`). Jest passes (545 tests). Both `gulpfile.js` and `jest.config.ts` remain permanently outside of `tsc --noEmit` checking. **Phase 2 update:** `include` is now `["lib/**/*", "test/**/*", "vendor/**/*.d.ts"]` — the `vendor/**/*.d.ts` glob was added so the hand-written `vendor/utf8.d.ts` is part of the root program and syntax-checked by `tsc` (without it, a `.d.ts` loaded only as an import dependency is not parsed for syntax errors). `gulpfile.js` and `jest.config.ts` are still deliberately excluded. Decide if that's intentional (config files as a deliberately unchecked exception) or if they should be added to `include`.
10. **No type-level testing despite types being the main deliverable** — Decision 21 rules out `tsd`/`expectType` tests, relying on characterization tests for runtime safety only. Since the actual goal of the migration is to ship correct `.d.ts` types for consumers (react-unipika in particular), nothing in the plan would catch an incorrect exported type shape (e.g. `UnipikaSettings` drifting from real usage). Worth confirming this trade-off is intentional, possibly revisited once react-unipika starts consuming the new types.
11. **Phase 2 `allowTruncatedEnd` blocker (DEFERRED)** — the vendored `vendor/utf8.js` carries a local patch adding `options.allowTruncatedEnd` to `decode()`, used by [`lib/converters/yson-to-unipika.js:210`](lib/converters/yson-to-unipika.js:210) for `$incomplete` YSON strings. Neither npm `utf8@2.1.2` nor `utf8@3.0.0` supports it; a naive swap fails 8 of 37 new characterization tests and misclassifies incomplete strings as `$binary`. **Phase 2 outcome:** npm swap deferred; `vendor/utf8.js` + `lib/utils/utf8.js` kept as-is; 37 characterization tests added to `test/characterization/utf8.test.ts` as a safety net; hand-written `vendor/utf8.d.ts` added so the relative import is properly typed (verified `tsc` enforces it). **To resolve before completing the swap:** preserve the patch — options are (a) a local wrapper in `lib/utils/utf8.ts` around npm `utf8`'s `encode` + a forked `decode` carrying the `allowTruncatedEnd` logic, (b) a `try/catch` wrapper returning `''` on error when `allowTruncatedEnd` is set (simpler but swallows ALL decode errors, not just truncation — changes error semantics), or (c) an upstream PR to utf8.js. The 37 characterization tests pin the exact current behavior any solution must satisfy.
