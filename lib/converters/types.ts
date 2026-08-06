import type {FormatNode, FormatSettings} from '../utils/format';

/**
 * Node shape produced by converters. Extends the base FormatNode with the
 * extra `$`-prefixed fields that converters set and the orchestrator/plugins
 * read, but which are not part of the minimal FormatNode contract.
 */
export type ConverterNode = FormatNode & {
    $decoded_value?: unknown;
    $tag?: string;
    $attributes?: unknown;
};

/**
 * Settings shape consumed by converters. Extends FormatSettings with the
 * runtime settings the orchestrator (format.js) sets on the settings object
 * before invoking a converter.
 */
export type ConverterSettings = FormatSettings & {
    decodeUTF8?: boolean;
    treatValAsData?: boolean;
    omitStructNull?: boolean;
    maxStringSize?: number;
    maxListSize?: number;
    validateSrcUrl?: (url: string) => boolean;
};
