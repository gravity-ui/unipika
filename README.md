# unipika

Common YT/YQL/QC data formatting library.

## format(data[, settings[, converter]])

Function accepts data in Unipika-YSON format (hereinafter referred to as the - Unipika), or, if converter is presented, in any other format and formats data according to its type. Currently two built-in converters are presented:

- YSON to Unipikа
- YQL to Unipika

### Examples

[View](https://github.yandex-team.ru/pages/data-ui/unipika/example/)

### List of supported types:

|Source format|Types|
|---|---|
|YSON|`string`, `number`, `int64`, `uint64`, `double`, `map`, `list`, `null`|
|YQL|`yql.string`, `yql.int64`, `yql.uint64`, `yql.double`, `yql.struct`, `yql.dict`, `yql.list`, `yql.tuple`, `yql.null`, `yql.yson`|

Similar in meaning types are displayed similarly. For example, `int64` and `yql.int64`, `map` and `yql.struct`, etc.

It is assumed that types can't be mixed in arbitrary way, that is, for example, `list` can't have elements of type `yql.string`, nevertheless, library doesn't attempt to fix invalid data in this case. When using built-in converter this situation shouldn't happen. Also, for example, only YSON types can have attributes, for the rest of types special field `$attributes` is pointless.

### Formatter settings:

|Name|Type|Default value|Description|
|---|---|---|---|
|validateSrcUrl|`(domain: string) => boolean`|`() => false`|Function, which accepts source url for `TaggedType` types and returns whether it is allowed to be downloaded. If settings in not defined, `TaggedType` types (images, audio, video) will be formatted as `StructType`|
|format|String|`'json'`|`[YSON-specific]` Affects displaying YSON types. Serialization to text `yson` or `json` is supported. These ways of representation are described in YT documentation.|
|decodeUTF8|Boolean|`true`|`[YSON-Converter][YSON-specific]` Setting is passed to the converter (YSON to Unipikа). Indicated whether to try decode the data. The data received from YT with the setting { encode_utf8 = false } should not be decoded (also is means that all strings are valid UTF-8 sequences, that is, they are not binary). By default the data from YT is received with the setting { encode_utf8 = true } and should be decoded; strings that cannot be decoded are marked as binary.|
|showDecoded|Boolean|`true`|`[NCP][YSON-specific]` Indicates whether the decoded data should be displayed or the data in the form in which it is received from YT.|
|binaryAsHex|Boolean|`true`|`[NCP][YSON-specific]` Indicates whether binary strings should be displayed as a sequence of HEX-digits. |
|asHTML|Boolean|`true`| Return serialized data in `plain text` or `html`.|
|break|Boolean|`true`| Put hyphens and indents or return everything as a single line.|
|indent|Number|`4`| Indent size.|
|compact|Boolean|`false`| The mode in which complex types like `map`, `list`, `yql.struct` and so on, are displayed more compact if contain only one element.|
|highlightControlCharacter|Boolean|`false`|Enables highlighting of special control characters in html strings.|
|escapeWhitespace|Boolean|`true`|`[NCP]`The mode in which hyphens and tab characters are not escaped. With this option it is convenient to view formatted data like stack-traces.|
|escapeYQLStrings|Boolean|`true`|`[NCP][YQL-Converter]`The mode in which no symbols are escaped at all, so that user can get "raw" data.|
|nonBreakingIndent|Boolean|`true`|The mode in which indents, spaces in key-value separator, and spaces in string binary representation are nonbreaking ( `&nbsp;` symbol).|
|omitStructNull|Boolean|`false`|`[YQL-Converter]` Indicates whether to skip keys with `null` value in `yql.struct` type. |
|maxListSize|Number|`undefined`|`[YQL-Converter]` Maximum allowed size of list nodes (`yql.list`, `yql.dict`, `yql.struct`, `yql.tuple`, `yql.stream`). If value > 0 is set, node will be truncated to this value. |
|maxStringSize|Number|`undefined`|`[YQL-Converter]` Maximum allowed size of strings (`yql.string`, `yql.utf8`). If value > 0 is set, string will be truncated to this value. |
|limitMapLength|Number|`undefined`| Maximum allowed size of all map nodes. If value > 0 is set, node will be truncated to this (value - 1). |
|limitListLength|Number|`undefined`| Maximum allowed size of all list nodes. If value > 0 is set, node will be truncated to this (value - 1). |

`[YQL-Converter]` - Options affects only data conversion from YQL format.
`[YSON-Converter]` - Options affects only data conversion from YSON format.
`[YSON-Specific]` - Options affects only YSON types representation and should not affect other types representation.
`[NCP]` - (Non copy-pastable) this representation is used to improve readability, but is not valid; copying and using such data may cause an error.

## formatFromYSON(data[, settings])

Format function wrapper, data is passed in YSON format, YSON to Unipika converter is used.

## formatFromYQL(data[, settings])

Format function wrapper, data is passed in YQL format (in the list `[data, dataType]`), YQL to Unipika converter is used.


## TODO

Plugins `yql-date`, `yql-datetime` and `yql-timestamp` do formatting of date by `Date.prototype.toISOString()`.
If it is required it is better to use `moment.js` and rewrite the plugins.
