# Unipika → TypeScript Migration Plan

## Goal
Migrate `@gravity-ui/unipika` from plain JS (CommonJS, gulp+browserify) to TypeScript with a modern build (gulp + `@gravity-ui/gulp-utils`, following the gravity-ui/uikit pattern). A new major version will be released after migration. Progress is tracked in this file via the checklist below — each phase is a commit boundary.

## Constraints & Rules
- **Runtime must not change** — except for explicitly approved changes (see "Approved Runtime Changes" below). Any additional runtime change must be highlighted and approved before implementation.
- **CONSULT USER FIRST** — for ALL questions about changing runtime code, consult the user first before implementing anything. This includes adding/removing guards, changing conditionals, altering control flow, or any modification that affects runtime behavior. Do NOT silently introduce logic changes during TS conversion.
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
32. **No programmatically-generated functions during TS migration** — when converting a module to TS, replace runtime-generated functions (e.g. `generateMethod` + loop in `lib/utils/type.js` that creates `isString`, `isNumber`, etc. by attaching them to the function object at runtime) with explicit, individually-written named functions and named exports. The dynamic/metaprogramming pattern is hard to type correctly and goes against the spirit of a typed codebase. This applies to all phases: if a module uses runtime code generation, the TS version defines each function explicitly. (Agreed during Phase 3.)
33. **Tests before refactor** — if a module being converted to TS lacks sufficient test coverage for the behavior that will change shape during conversion (e.g. the generated `is*` methods in `type.js`), write characterization tests capturing the *current* behavior FIRST, verify they pass against the existing JS, then perform the TS refactor and verify the tests still pass. This extends Phase 0's characterization-test discipline to per-module coverage gaps discovered during Phases 3-7. (Agreed during Phase 3.)
34. **No implicit `any` — annotate `let` variables explicitly** — when converting JS to TS, `let` variables that are assigned from expressions whose inferred type is `any` (or a loose union like `string | undefined` from object indexing) must be given an explicit type annotation instead of relying on inference. Implicit `any` is forbidden (the plan already forbids `any` outright); this rule extends it to variables that would silently infer `any` or an overly-loose type. For example, `let currentChar, currentCode, escapedChar` in `escapeJSONString`/`escapeYSONString` must be `let currentChar: string`, `let currentCode: number`, `let escapedChar: string`. (Agreed during Phase 3.)
35. **Prefer type annotations over `as` casts; don't annotate when inference is already correct** — to make a variable's type narrower/optional, write `let parent: FormatNode | undefined = node[parentKey];` (a type annotation on the variable), NOT `let parent = node[parentKey] as FormatNode | undefined;` (an `as` cast). The annotation is stricter: it constrains all future assignments to the variable, whereas `as` is a one-off expression assertion. This is the preferred way to satisfy the "avoid `as`" rule. HOWEVER, do not add a redundant annotation when the source expression already infers the desired type — e.g. if `FormatNode` has an index signature `[key: symbol]: FormatNode | undefined`, then `node[parentKey]` already infers `FormatNode | undefined` and `let parent = node[parentKey]` needs no annotation at all. The rule: annotate only when inference gives `any` or an overly-loose type; otherwise let inference do the work. (Agreed during Phase 3.)
36. **`lib`/`target` set to `es2021`** — `tsconfig.json` now sets `"target": "es2021"` and `"lib": ["es2021"]` (overriding the base `@gravity-ui/tsconfig`) so modern runtime APIs like `String.prototype.replaceAll` (used in `format.js`'s `wrapScalar`) type-check without errors. It's 2026; ES2021 is universally supported by supported Node versions. (Agreed during Phase 3.)
37. **Don't over-annotate `const` object literals** — for `const` object literals where TypeScript can infer the type (e.g. `escapeMap`, `unescapeMap`, lookup tables like `{'\n': '\\n'}`), do NOT add an explicit type annotation like `: Record<string, string>`. Let inference work. Only annotate when inference produces `any` or an unusable overly-specific type that breaks downstream usage. (Agreed during Phase 3.)
38. **No `require` / `import = require` in final TS — use ES `import`/`export` everywhere** — the final codebase will contain zero `require()` calls and zero `import x = require(...)` constructs. All modules use standard ES `import` / `export` syntax. For modules whose original CJS export was a single callable function with attached methods (e.g. `type.js` → `module.exports = type` with `type.isString` etc.), use named exports (`export function type`, `export function isString`, ...) and attach the `is*` methods to the `type` function for the public `utils.type` surface. The public `utils.type` / `utils.format` / etc. dot-access shape is assembled in `index.ts` via `import * as ...` and nesting — NOT via `export =`. Consumers still using `require()` (not-yet-converted `.js` files in `lib/`) are updated to use the named-export shape (`require('./utils/type').type` or, once converted, ES imports). (Agreed during Phase 3.)
39. **`import x = require(...)` is forbidden** — use ES `import` syntax only. `import discoverType = require('./type')` must be `import {type as discoverType} from './type'` (or `import * as ...`). This applies to all `.ts` files. (Agreed during Phase 3.)
40. **`esModuleInterop: true` enabled** — `tsconfig.json` sets `"esModuleInterop": true` so ES `import`/`export` interops cleanly with CJS `module.exports` (default imports of CJS modules, `import * as` namespace imports). This is required because the migration converts CJS modules to ES-style imports while not-yet-converted `.js` consumers still use `require()`. (Agreed during Phase 3.)
41. **`strict: true` — no relaxation overrides** — `tsconfig.json` no longer sets `strict: false`, `noUnusedLocals: false`, `noUnusedParameters: false`, or `noImplicitReturns: false`. All strict-mode checks are enabled. Unused locals/params must be prefixed with `_`. Implicit `any` must be annotated. Every strict-mode error is fixed at its root (correct types) rather than suppressed. Unclear cases are surfaced to the user for a decision. (Agreed during Phase 3.)
42. **`FormatNode` type: `$type` and `$value` are required** — audit of all converters (`raw-to-unipika.js`, `yson-to-unipika.js`, `yql-to-unipika.js`) and the orchestrator (`format.js`) confirms every unipika node has both `$type: string` and `$value` (which may be `null` for null-type nodes). Therefore `FormatNode.$type` is `string` (required) and `FormatNode.$value` is `unknown` (required, may be null). All other `$`-prefixed fields (`$incomplete`, `$binary`, `$key`, `$special_key`, `$optional`, `$original_value`, `$category`, `$tag`) are genuinely optional. This eliminates the `string | undefined` / `unknown | undefined` errors downstream. (Agreed during Phase 3.)
43. **`FormatSettings.asHTML` is required** — `asHTML` is always set by the orchestrator (`format.js`) in the default settings and is a fundamental setting, not optional. Making it required (`asHTML: boolean`) eliminates the `boolean | undefined` errors in the escape helper functions. (Agreed during Phase 3.)
44. **`FormatSettings` gains `limitListLength` / `limitMapLength`** — these fields are set by the orchestrator at runtime and consumed by `list-fragment` / `map-fragment`. They are added as optional `number` fields to `FormatSettings` so the fragment functions can access them without `as` casts. (Agreed during Phase 3.)
45. **Don't export what wasn't originally exported** — when converting a CJS module to TS, only `export` the symbols that were part of the original `module.exports`. Do not add new `export` statements for internal constants, helpers, or types that were not in the original public surface. This keeps the migration a pure type-safety refactor, not an API change. (Verified for `yson.ts`: the `TYPE_KEY`/`VALUE_KEY`/`ATTRIBUTES_KEY`/`INCOMPLETE_KEY`/`BINARY_KEY` constants WERE part of the original `yson.js` `module.exports`, so they stay exported.) (Agreed during Phase 3.)
46. **Blank line between exports** — when a module has multiple top-level `export` statements (e.g. `export type`, `export function`, `export const`), put a blank line between each export for readability. (Agreed during Phase 3.)
47. **Shared test types live next to the tests that use them** — when test helper types are only relevant to a subset of tests (e.g. `Input`/`Output` for format tests), define them in a `types.ts` file in that test subdirectory (e.g. `test/format/types.ts`), not at the top-level `test/` directory. Don't create redundant wrapper types like `TestCases = Map<Input, Output>` — use `Map<Input, Output>` directly. (Agreed during Phase 3.)
48. **Delete stale `.js` files after TS conversion** — when converting a `.js` file to `.ts`, the old `.js` file MUST be deleted. Otherwise Node/Jest module resolution prefers `.js` over `.ts`, and the tests pass against the old JS code while the TS file is only type-checked but never executed. Always verify no stale `.js` files remain alongside `.ts` files after conversion. (Discovered during Phase 3 — tests were passing against old `type.js`/`yson.js`/`format.js` while the `.ts` files had real runtime bugs.)
49. **`export =` for `module.exports = X` pattern** — when the original CJS module uses `module.exports = <function>` (not `module.exports = {a, b, c}`), the TS conversion must use named exports (`export function type(...)`) and update all CJS consumers to access via `.type` (e.g. `require('./utils/type').type`). Do NOT use `export =` syntax. The function name in the `.ts` file can match the original (e.g. `export function type`). (Agreed during Phase 3 — `type.ts` exports `type` as a named export; consumers updated to `require('./utils/type').type`.)
50. **`asHTML` is optional in `FormatSettings`** — `FormatSettings.asHTML` is `boolean?` (optional), not `boolean` (required). Some functions like `binaryToHex` are called without `asHTML`. Functions that pass `asHTML` as a `boolean` argument to other functions (e.g. `appendDoubleQuote`, `appendCharacter`) must default it at the top: `const asHTML = settings.asHTML ?? false;`. Functions that use `settings.asHTML` in a ternary or truthiness check (e.g. `wrapScalar`) do NOT need the default — `undefined` is falsy and works correctly. (Revised during Phase 3 — supersedes decision #43.)
51. **Babel ES module `exports` has null prototype** — when Babel transpiles ES `export` statements to CJS, the `exports` object is created with `Object.create(null)` (null prototype). This means `require('./module') instanceof Object` returns `false`. The original `module.exports = {...}` pattern (replacement assignment) produced a plain object with `Object.prototype`, but named ES exports (property assignments on the existing `exports` object) inherit the null prototype from Jest's module runtime. **Resolution:** do NOT wrap with `Object.assign({}, ...)` — instead, fix the test to use `expect(Object.prototype.toString.call(_utils)).toBe('[object Object]')` instead of `expect(_utils).toBeInstanceOf(Object)`. `Object.prototype.toString.call()` works for null-prototype objects (returns `'[object Object]'`), distinguishes objects from arrays/null/undefined, and avoids masking the real module export behind a wrapper copy. (Revised during Phase 3 — initially used `Object.assign` wrapper, then removed it in favor of fixing the test assertion.)
52. **Don't change test import paths** — when converting `require` to `import` in test files, keep the same module path (e.g. `require('../..')` → `import unipika from '../..'`). Do NOT change the path to import from a specific submodule (e.g. `import * as formatUtils from '../../lib/utils/format'`) — that tests different behavior. The test must still go through the same entry point. (Agreed during Phase 3.)
53. **Converter-specific types live in `lib/converters/types.ts`, not in the base `FormatNode`/`FormatSettings`** — when converting converters to TS, the extra `$`-prefixed fields converters set (`$decoded_value`, `$tag`, `$attributes`) and the runtime settings the orchestrator passes to converters (`decodeUTF8`, `treatValAsData`, `omitStructNull`, `maxStringSize`, `maxListSize`, `validateSrcUrl`) must NOT be added to the base `FormatNode`/`FormatSettings` types in `lib/utils/format.ts`. Instead, a separate `ConverterNode` (extends `FormatNode`) and `ConverterSettings` (extends `FormatSettings`) are defined in `lib/converters/types.ts`. The base types stay at their Phase 3 state. This keeps the converter concerns separate from the core format types. (Agreed during Phase 4.)
54. **Typed `isArray` utility in `lib/utils/is-array.ts`** — a typed wrapper `export const isArray = Array.isArray as (value: unknown) => value is unknown[]` lives in `lib/utils/is-array.ts`. In `.ts` files, prefer `isArray(x)` over `Array.isArray(x)`. The native `Array.isArray` is typed as `(arg: unknown) => arg is any[]`, which narrows to `any[]` — an unsafe type that bypasses strict checking. This wrapper narrows to `unknown[]` instead, preserving type safety and eliminating downstream `as unknown[]` casts in the same expression. (Agreed during Phase 4.)
55. **Preserve original crash behavior with FIXME markers + non-null assertions** — when converting JS to TS, if the original code would throw a `TypeError` on `undefined` (e.g. accessing `optionalData.$optional` when `yqlToYson` returns `undefined` for an unknown type name), do NOT silently add a guard that changes crash → silent return. Instead: (a) keep the original logic, (b) use non-null assertions (`!`) to satisfy TS while keeping the crash at runtime, (c) add a `FIXME(Phase 4)` comment explaining the situation, (d) write a characterization test capturing the crash behavior. Two such spots in `yql-to-unipika.ts` (OptionalType and StructType). These should be revisited later to decide whether a crash, a graceful `return undefined`, or an explicit error is the correct behavior. (Agreed during Phase 4.)
56. **Numeric narrowing pattern: `x && x > 0` (redundant truthiness guard as type narrowing)** — when the original JS has `if (settings.maxListSize > 0 && ...)`, the preferred TS pattern is `settings.maxListSize && settings.maxListSize > 0` — the redundant `settings.maxListSize &&` truthiness check doubles as type narrowing, making TS narrow `maxListSize` from `number | undefined` to `number` for all downstream usages, eliminating the need for `!` non-null assertions or `?? 0` fallbacks. This is semantically equivalent to the original (`undefined > 0` is already `false`) and was approved by the user as the preferred approach over both `?? 0` (which adds a runtime `??` operator) and `!` (which is purely compile-time but triggers `no-non-null-assertion` lint warnings). Applied in `yql-to-unipika.ts` (`truncateLargeData` with `maxListSize` and `truncateLargeString` with `maxStringSize`). (Agreed during Phase 4.)
54. **Typed `isArray` utility in `lib/utils/is-array.ts`** — a typed wrapper `export const isArray = Array.isArray as (value: unknown) => value is unknown[]` lives in `lib/utils/is-array.ts`. In `.ts` files, prefer `isArray(x)` over `Array.isArray(x)`. The native `Array.isArray` is typed as `(arg: unknown) => arg is any[]`, which narrows to `any[]` — an unsafe type that bypasses strict checking. This wrapper narrows to `unknown[]` instead, preserving type safety and eliminating downstream `as unknown[]` casts in the same expression. (Agreed during Phase 4.)
55. **Preserve original crash behavior with FIXME markers + non-null assertions** — when converting JS to TS, if the original code would throw a `TypeError` on `undefined` (e.g. accessing `optionalData.$optional` when `yqlToYson` returns `undefined` for an unknown type name), the TS conversion must NOT silently add a guard that changes crash → silent return. Instead: (a) revert to the original logic, (b) use non-null assertions (`!`) to satisfy TS while keeping the crash at runtime, (c) add a `FIXME(Phase 4)` comment explaining the situation, (d) write a characterization test capturing the crash behavior. Two such spots were found and fixed in `yql-to-unipika.ts` (OptionalType and StructType). These should be revisited later to decide whether a crash, a graceful `return undefined`, or an explicit error is the correct behavior. (Agreed during Phase 4.)
56. **`ScalarValue` type and `PluginFactory<T>` generic design** — plugins return `ScalarValue` (`string | number | boolean | null`), not just `string`. Scalar plugins (`int64`, `null`, `boolean`, `uint64`, `yql-enum`, `yql-tzdate`, `yql-tzdatetime`, `yql-tztimestamp`) return raw `node.$value` (not string-coerced) to preserve type information for `format: 'json'` output (e.g. `formatValue` returns `5` as a number, `null` as null). `PluginFactory<T = ScalarValue>` is generic: plugins that always return `string` use `PluginFactory` (default), plugins that return raw `node.$value` use `PluginFactory<unknown>`. `wrapScalar`/`wrapComplex`/`wrapOptional` accept `ScalarValue` and use `String()` coercion in HTML branches (matching original implicit `+` concatenation — `String()` is a real runtime function call, not a cast). `formatValue` returns `ScalarValue`. The `_plugins` registry is typed as `Record<string, PluginFunction>` (default `unknown`), and `formatValue` casts the plugin result to `ScalarValue` (single well-documented cast point). (Agreed during Phase 5.)
57. **`as string` casts are forbidden when they diverge from runtime** — `as string` lies about the type when the runtime value is `null` or a number. Use `String()` (explicit runtime coercion) instead of `as string` (compile-time-only cast) when the value needs to be a string for concatenation. `String()` produces the same result as the original implicit `+` coercion and is honest about the runtime behavior. (Agreed during Phase 5.)

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
**Status: [x] DONE**

Goal: convert leaf modules with no internal unipika dependencies (or only leaf deps) to `.ts`. Bottom-up order:

- [x] `lib/utils/type.js` → `type.ts` (no internal deps). Characterization tests added in [`test/characterization/type.test.ts`](test/characterization/type.test.ts).
- [x] `lib/utils/utf8.js` → `utf8.ts` (depends on the vendored `vendor/utf8`, typed via `vendor/utf8.d.ts` — see Phase 2: the npm swap is blocked by the `allowTruncatedEnd` patch; the vendored copy stays).
- [x] `lib/utils/yson.js` → `yson.ts` (depends on type.js). Uses ES `import {type as discoverType} from './type'`.
- [x] `lib/utils/format.js` → `format.ts` (large, ~700 lines; pure utils). Characterization tests added in [`test/characterization/format-utils.test.ts`](test/characterization/format-utils.test.ts) (65 tests). Exports `FormatSettings` and `FormatNode` types.
- [x] `lib/utils/list-fragment.js` → `list-fragment.ts`. Named export `listFragmentFactory`. Updated 3 plugin consumers + `format.js` to use `.listFragmentFactory(_format)`.
- [x] `lib/utils/map-fragment.js` → `map-fragment.ts`. Named export `mapFragmentFactory`. Updated 3 plugin consumers + `format.js` to use `.mapFragmentFactory(_format)`.
- After each file: ran `jest` (including characterization tests) + `typecheck` to confirm no runtime regression. **Final: 675 tests pass, 0 typecheck errors, 0 lint errors.**
- **Commit boundary(s)** — user may commit per-file or per-group.

**Phase 3 outcome:**
- All 6 `lib/utils/*.js` files converted to `.ts` with named exports. Stale `.js` files deleted (critical — without deletion, Node/Jest resolves `.js` before `.ts` and tests pass against old code).
- `tsconfig.json` updated: `target`/`lib` set to `es2021`, `esModuleInterop: true`, `strict: true` (removed all relaxation overrides: `strict: false`, `noUnusedLocals: false`, `noUnusedParameters: false`, `noImplicitReturns: false`).
- `FormatNode` type: `$type: string` and `$value: unknown` are required (audit-confirmed). `FormatSettings.asHTML` is **optional** (revised — `binaryToHex` is called without it; functions that pass `asHTML` as `boolean` arg default it with `?? false`). `FormatSettings` gained `limitListLength`/`limitMapLength` optional fields.
- `type.ts` exports `type` as a named export (`export function type`). CJS consumers updated: `require('./utils/type').type`. `yson.ts` imports `{type as discoverType}`.
- `format.ts` `escapeMap`/`unescapeMap` HTML entities restored (`&`, `<`, `>`, `"`) — were accidentally stripped during initial TS conversion.
- `lib/index.js` wraps `require('./utils/format')` with `Object.assign({}, ...)` to give Babel's null-prototype `exports` object a proper `Object.prototype` (fixes `toBeInstanceOf(Object)` in tests).
- `test/utils/format.test.ts` updated: `require('../..')` → `import unipika from '../..'` (same path, same entry point).
- 17 new decisions recorded (#32-#52) covering: no programmatically-generated functions, characterization tests before refactor, no implicit `any`, prefer annotations over `as` casts, `es2021` lib/target, don't over-annotate `const` literals, no `require`/`import = require` in TS, `esModuleInterop`, `strict: true`, `FormatNode` required fields, `FormatSettings.asHTML` (revised to optional), `FormatSettings` limit fields, don't export what wasn't originally exported, blank line between exports, shared test types location, delete stale `.js` files, `export =` avoidance, `asHTML` optional with `?? false` default, Babel null-prototype `exports` workaround, don't change test import paths.
- Pre-existing test files (`test/format/*.test.ts`, `test/converters/*.test.ts`, `test/plugins/tagged.test.ts`) fixed for strict mode: unused vars removed, implicit `any` params typed. Shared `Input`/`Output` types added in [`test/format/types.ts`](test/format/types.ts).
- 6 plugin `.js` files + `lib/format.js` updated to use named-export factory shape (`.listFragmentFactory(_format)` / `.mapFragmentFactory(_format)`).
- **Final verification: 675 tests pass, 0 typecheck errors, 0 lint errors (6 pre-existing warnings).**

### Phase 4 — Convert converters to TS
**Status: [x] DONE**

- [x] `lib/converters/raw-to-unipika.js` → `.ts`.
- [x] `lib/converters/yson-to-unipika.js` → `.ts`.
- [x] `lib/converters/yql-to-unipika.js` → `.ts` (largest converter, ~488 lines).
- After each file: ran `jest` (including characterization tests) + `typecheck` to confirm no runtime regression. **Final: 675 tests pass, 0 typecheck errors, 0 lint errors.**
- **Commit boundary.**

**Phase 4 outcome:**
- All 3 `lib/converters/*.js` files converted to `.ts` with named exports (`export function convert`). Stale `.js` files deleted.
- New shared types file [`lib/converters/types.ts`](lib/converters/types.ts) defines `ConverterNode` (extends `FormatNode` with `$decoded_value`, `$tag`, `$attributes`) and `ConverterSettings` (extends `FormatSettings` with `decodeUTF8`, `treatValAsData`, `omitStructNull`, `maxStringSize`, `maxListSize`, `validateSrcUrl`). Per user direction (Decision #53), converter-specific fields live in a separate type, NOT crammed into the base `FormatNode`/`FormatSettings` — those stay at their Phase 3 state.
- `raw-to-unipika.ts`: `module.exports = convert` → `export function convert`. Consumers updated to `.convert`: `lib/format.js`, `lib/index.js`, `lib/plugins/yql-json.js`.
- `yson-to-unipika.ts`: `module.exports = convert` → `export function convert`. Uses `ConverterNode`/`ConverterSettings`. Consumers updated to `.convert`: `lib/format.js`, `lib/index.js`, `lib/plugins/yql-yson.js`.
- `yql-to-unipika.ts`: `module.exports = function(...)` → `export function convert`. Inner `convert` renamed to `convertInternal` to avoid name collision with the exported `convert`. `yqlToYson` returns `ConverterNode | undefined` (faithful to original — unknown type names fall through to `return undefined`); `convertInternal` and exported `convert` return `ConverterNode | undefined` accordingly. Heterogeneous `dataType`/`data` arrays typed as `unknown[]` with casts at access points. Consumers updated to `.convert`: `lib/format.js`, `lib/index.js`.
- `FormatNode`/`FormatSettings` in `lib/utils/format.ts` remain at their Phase 3 state. Converter-specific fields (`$decoded_value`, `$tag`, `$attributes`, etc.) live in separate `ConverterNode`/`ConverterSettings` types in [`lib/converters/types.ts`](lib/converters/types.ts).
- New typed `isArray` utility in [`lib/utils/is-array.ts`](lib/utils/is-array.ts) (Decision #54): `export const isArray = Array.isArray as (value: unknown) => value is unknown[]`. Used in `yql-to-unipika.ts` instead of native `Array.isArray` to avoid `any[]` narrowing. Eliminates `as unknown[]` casts in the same expression.
- **FIXME markers + characterization tests (Decision #55):** 2 spots in `yql-to-unipika.ts` where original JS crashes on `undefined` (OptionalType, StructType) are preserved with `!` non-null assertions + `FIXME(Phase 4)` comments. 2 characterization tests added capturing the crash behavior.
- **Numeric narrowing pattern (Decision #56):** `truncateLargeData` and `truncateLargeString` in `yql-to-unipika.ts` use the `x && x > 0` narrowing pattern for `maxListSize`/`maxStringSize` comparisons.
- **Final verification: 677 tests pass (675 original + 2 crash characterization), 0 typecheck errors, 0 lint errors (pre-existing `no-param-reassign`/`eqeqeq`/`no-shadow` warnings + 3 `no-non-null-assertion` warnings on the 2 crash-behavior FIXME spots only).**

### Phase 5 — Convert plugins to TS
**Status: [x] COMPLETED**

38 plugin files (10 YT + 28 YQL, verified count), all follow the same `module.exports = function(_format) {...}` factory pattern. Group by category:

- [x] YT plugins: `list`, `map`, `string`, `number`, `int64`, `uint64`, `double`, `boolean`, `null`, `tagged`.
- [x] YQL plugins: `yql-list`, `yql-stream`, `yql-tuple`, `yql-struct`, `yql-dict`, `yql-string`, `yql-utf8`, `yql-int64`, `yql-uint64`, `yql-double`, `yql-decimal`, `yql-bool`, `yql-date`, `yql-datetime`, `yql-timestamp`, `yql-tzdate`, `yql-tzdatetime`, `yql-tztimestamp`, `yql-interval`, `yql-uuid`, `yql-null`, `yql-variant`, `yql-enum`, `yql-set`, `yql-json`, `yql-yson`, `yql-tagged`, `yql-pg`.
- [x] `lib/format.js` → `format.ts` (the orchestrator that registers all plugins).
- [x] Created `lib/plugins/types.ts` with `PluginFactory<T>`, `PluginFunction<T>`, `PluginNode`, `PluginSettings`, `FormatFunction` types.
- [x] Added `ScalarValue` type (`string | number | boolean | null`) to `lib/utils/format.ts` — represents values plugins can return. Scalar plugins (e.g. `int64`, `null`, `boolean`) return raw `node.$value` (not string-coerced) to preserve type information for `format: 'json'` output. `wrapScalar`/`wrapComplex`/`wrapOptional` accept `ScalarValue` and use `String()` coercion in HTML branches (matching original implicit `+` concatenation behavior).
- [x] `PluginFactory<T = ScalarValue>` is generic — plugins that always return `string` use `PluginFactory` (default), plugins that return raw `node.$value` use `PluginFactory<unknown>`.
- [x] Fixed `tagged.ts` `title="undefined"` bug — `formatUrl` now accepts `title: string | undefined` and `formatNamedUrl` passes `value.title` directly (not `String(value.title)` which converted `undefined` to `"undefined"`).
- [x] Fixed `yql-date.test.ts` imports — named imports (`{yqlDate: date}`) instead of default `require`.
- [x] `tsc --noEmit` passes with 0 errors. `jest` passes with 689 tests. `eslint` passes with 0 errors (only pre-existing warnings).
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
| 2 | Replace vendor/utf8 with npm | ◐ PARTIAL — npm swap BLOCKED by `allowTruncatedEnd` patch; 37 characterization tests + `vendor/utf8.d.ts` added (582 tests, tsc, lint all pass) |
| 3 | Utils → TS | ✅ DONE (6 files converted: `type.ts`, `utf8.ts`, `yson.ts`, `format.ts`, `list-fragment.ts`, `map-fragment.ts`; 93 characterization tests added; 675 tests, tsc, lint all pass) |
| 4 | Converters → TS | ✅ DONE (3 files converted: `raw-to-unipika.ts`, `yson-to-unipika.ts`, `yql-to-unipika.ts`; new `lib/converters/types.ts` with `ConverterNode`/`ConverterSettings`; new `lib/utils/is-array.ts` typed `isArray` utility; 4 logic-changing guards reverted to original + FIXME markers; 2 crash characterization tests added; 677 tests, tsc, lint all pass) |
| 5 | Plugins → TS | ✅ DONE (38 plugins converted to `.ts` + `lib/plugins/types.ts` with `PluginFactory`/`PluginFunction`/`PluginNode`/`PluginSettings` types; `ScalarValue` type in `lib/utils/format.ts`; `lib/format.js` → `lib/format.ts` orchestrator; explicit return type annotations on simple functions; 689 tests, tsc, lint all pass) |
| 6 | Entry point → TS | NOT STARTED |
| 7 | Tests → TS | NOT STARTED |
| 8 | Build tool switch, strict mode & cleanup | NOT STARTED |
| 9 | Migrate playground (example/) to TS | NOT STARTED |
| 10 | Migration guide for consumers | NOT STARTED |

## Open Questions / Items to Highlight
1. **`parentKey = Symbol('parent')`** in `format.js` — ✅ RESOLVED (Phase 3): `FormatNode` type includes `[key: symbol]: FormatNode | undefined` index signature, allowing `node[parentKey]` access without `as` casts. The Symbol property is set in `lib/format.js` (still `.js`) and read in `wrapOptional` (`format.ts`).
2. **`type.js` dynamic method generation** (`type.isString`, etc.) — ✅ RESOLVED (Phase 3, Decision #32): replaced `generateMethod` loop with 13 explicit `is*` functions, attached to the `type` function via `type.isString = isString` etc. No mapped types needed.
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
12. **Phase 4 converter types are deliberately loose — refine later** — the YQL converter's `YqlDataType` is typed as `unknown[]` with `as` casts at each access point. This is a heterogeneous nested array (a YQL type descriptor) where `[0]` is a string (type name) and `[1]`/`[2]` vary by type name (string, nested `YqlDataType`, or array of `YqlDataType`). The ideal type would be a recursive discriminated union, but that's complex, fragile, and out of scope for the mechanical JS→TS conversion. There are many `as unknown[]` / `as YqlDataType` / `as string` casts throughout `yql-to-unipika.ts`. These should be revisited in a future pass to replace `unknown[]` with precise recursive types, eliminating the casts. The `FIXME(Phase 4)` markers (Decision #55) also need a follow-up to decide the correct behavior for unknown type names (crash vs. graceful return vs. explicit error).
