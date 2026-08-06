import type {ConverterNode, ConverterSettings} from '../converters/types';
import type {FormatSettings} from '../utils/format';

/**
 * The `_format` orchestrator function passed into every plugin factory.
 * Mirrors the `FormatFunction` type used by `list-fragment`/`map-fragment`.
 */
export type FormatFunction = (node: unknown, settings: FormatSettings, level: number) => string;

/**
 * Node shape consumed by plugins. Plugins run on the output of converters
 * (and the orchestrator), so they see the full `ConverterNode` surface
 * (`$decoded_value`, `$tag`, `$attributes`) in addition to the base
 * `FormatNode` fields.
 */
export type PluginNode = ConverterNode;

/**
 * Settings shape consumed by plugins. Extends `ConverterSettings` with the
 * runtime settings the orchestrator (`format.ts`) sets on the settings object
 * before invoking plugins (`showDecoded`, `binaryAsHex`, `escapeYQLStrings`)
 * plus the user-provided `customNumberFormatter` callback.
 */
export type PluginSettings = ConverterSettings & {
    showDecoded?: boolean;
    binaryAsHex?: boolean;
    escapeYQLStrings?: boolean;
    customNumberFormatter?: (value: unknown, type: string) => unknown;
};

/**
 * A single plugin: formats one node into a value of type `T`. `isScalar` is
 * attached to the function by the plugin factory so the orchestrator can
 * decide whether to wrap the result with `wrapScalar` or `wrapComplex`.
 *
 * Most plugins return `string`, but scalar plugins (e.g. `int64`, `null`,
 * `boolean`) may return the raw `node.$value` — a `number`, `null`, or
 * `boolean` — which `wrapScalar`/`wrapOptional` pass through unchanged when
 * `asHTML` is false, and coerce via `String()` when `asHTML` is true.
 */
export type PluginFunction = ((
    node: PluginNode,
    settings: PluginSettings,
    level: number,
) => unknown) & {
    isScalar?: boolean;
};

/**
 * Plugin factory: receives the orchestrator's `_format` function and returns
 * the plugin function. This is the `module.exports = function (_format) {...}`
 * pattern every plugin follows.
 */
export type PluginFactory = (_format: FormatFunction) => PluginFunction;
