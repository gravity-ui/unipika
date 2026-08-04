import {isArray} from '../utils/is-array';

import type {ConverterNode, ConverterSettings} from './types';

type YqlDataType = unknown[];

type YqlData = unknown;

type YqlFlags = {
    incomplete?: boolean;
};

type YqlSettings = ConverterSettings & {
    validateSrcUrl: (url: string) => boolean;
};

function wrapYQLType(name: string): string {
    return 'yql.' + name;
}

function wrapYQLPgType(name: string): string {
    return 'yql.pg.' + name;
}

function convertSimplePgType(data: YqlData, dataType: string, category: unknown): ConverterNode {
    const type = wrapYQLPgType(dataType.toLowerCase());
    return {
        $type: type,
        $value: data,
        $category: category as string,
    };
}

function convertSimpleType(data: YqlData, dataType: string): ConverterNode {
    const type = wrapYQLType(dataType.toLowerCase());

    switch (dataType) {
        case 'String':
        case 'Uuid':
            if (isArray(data)) {
                return {
                    $binary: true,
                    $type: type,
                    $value: data[0],
                };
            }
            break;
    }

    return {
        $type: type,
        $value: data,
    };
}

function getVariantKey(typeIndex: number, dataType: YqlDataType): ConverterNode {
    let result: ConverterNode;
    if ((dataType[0] as string) === 'StructType') {
        result = convertSimpleType(
            ((dataType[1] as unknown[])[typeIndex] as unknown[])[0],
            'String',
        );
    } else {
        result = convertSimpleType(typeIndex, 'Int32');
    }
    result.$key = true;
    return result;
}

function isEnum(variantTypes: unknown[]): boolean {
    return variantTypes.every(function (variantType) {
        return (variantType as unknown[])[0] === 'VoidType';
    });
}

function isSet(dictType: YqlDataType): boolean {
    return ((dictType[2] as unknown[])[0] as string) === 'VoidType';
}

function convertVariantTypes(dataType: YqlDataType): unknown[] {
    const typeName = dataType[0] as string;
    return (dataType[1] as unknown[]).map(function (typeValue) {
        if (typeName === 'StructType') {
            return (typeValue as unknown[])[1];
        } else {
            return typeValue;
        }
    });
}

function convertStructToJSON(struct: ConverterNode): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    (struct.$value as unknown[]).forEach(function (entry) {
        const key = (entry as unknown[])[0] as ConverterNode;
        const value = (entry as unknown[])[1] as ConverterNode;
        if (key.$type !== wrapYQLType('string')) {
            throw new Error('unipika: try to convert struct with no-string keys to object');
        }
        result[key.$value as string] = value.$value;
    });
    return result;
}

function getSrc(convertedData: Record<string, unknown> | ConverterNode): string | undefined {
    if (
        Object.prototype.hasOwnProperty.call(convertedData, 'src') &&
        typeof (convertedData as Record<string, unknown>).src === 'string'
    ) {
        return (convertedData as Record<string, unknown>).src as string;
    }
    if (typeof (convertedData as ConverterNode).$value === 'string') {
        return (convertedData as ConverterNode).$value as string;
    }
    return undefined;
}

// eslint-disable-next-line complexity
function convertTaggedType(
    tag: string,
    dataType: YqlDataType,
    data: YqlData,
    converter: (data: YqlData, dataType: YqlDataType) => ConverterNode | undefined,
    validateSrcUrl: (url: string) => boolean,
): ConverterNode {
    let convertedValue: ConverterNode | Record<string, unknown> | undefined = converter(
        data,
        dataType,
    );
    let convertedStruct: Record<string, unknown>;
    switch (tag) {
        case 'url':
            if (dataType[0] === 'StructType') {
                convertedStruct = convertStructToJSON(convertedValue as ConverterNode);
                if (
                    Object.prototype.hasOwnProperty.call(convertedStruct, 'href') &&
                    typeof convertedStruct.href === 'string'
                ) {
                    convertedValue = {
                        $type: 'tag_value',
                        $value: convertedStruct,
                    };
                } else {
                    return convertedValue as ConverterNode;
                }
            }
            break;
        case 'videourl':
        case 'audiourl':
        case 'imageurl': {
            if (dataType[0] === 'StructType') {
                convertedStruct = convertStructToJSON(convertedValue as ConverterNode);
                const src = getSrc(convertedStruct);
                if (src && validateSrcUrl(src)) {
                    convertedValue = {
                        $type: 'tag_value',
                        $value: convertedStruct,
                    };
                } else {
                    return convertedValue as ConverterNode;
                }
            }
            const src = getSrc(convertedValue as ConverterNode);
            if (src && !validateSrcUrl(src)) {
                return convertedValue as ConverterNode;
            }
            break;
        }
        case 'image/svg':
        case 'image/svg+xml':
        case 'image/jpeg':
        case 'image/png':
        case 'image/gif':
        case 'image/webp':
        case 'video/mp4':
        case 'video/webm': {
            if (dataType[0] === 'StructType') {
                convertedStruct = convertStructToJSON(convertedValue as ConverterNode);
                const src = getSrc(convertedStruct);
                if (src) {
                    convertedValue = {
                        $type: 'tag_value',
                        $value: convertedStruct,
                    };
                } else {
                    return convertedValue as ConverterNode;
                }
            }
            break;
        }
    }

    return {
        $type: wrapYQLType('tagged'),
        $tag: tag,
        $value: convertedValue,
    };
}

function convertInternal(
    node: [YqlData, YqlDataType],
    settings: YqlSettings,
    flags: YqlFlags,
): ConverterNode | undefined {
    function truncateLargeData(data: YqlData): YqlData {
        if (
            settings.maxListSize &&
            settings.maxListSize > 0 &&
            isArray(data) &&
            data.length > settings.maxListSize
        ) {
            return data.slice(0, settings.maxListSize);
        }

        return data;
    }

    function wrapIncomplete(node: ConverterNode, isIncomplete: boolean): ConverterNode {
        if (isIncomplete) {
            node.$incomplete = true;
        }
        return node;
    }

    function truncateBase64(text: string, maxBytes: number): string {
        // divide into 24-bit groups aka 3 bytes or 4 base64-chars
        // and append the rest with padding

        const fullGroups = Math.min(Math.floor(maxBytes / 3), Math.ceil(text.length / 4));

        const headChars = fullGroups * 4;

        const restBytes = Math.min(maxBytes - fullGroups * 3, text.length - headChars);

        const head = text.substr(0, headChars);

        if (restBytes == 1) {
            return head + text.substr(headChars, 2) + '==';
        } else if (restBytes == 2) {
            return head + text.substr(headChars, 3) + '=';
        }

        return head;
    }

    function truncateLargeString(node: ConverterNode): ConverterNode {
        if (settings.maxStringSize && settings.maxStringSize > 0 && node.$value) {
            if (
                !node.$binary &&
                !node.$tag &&
                (node.$value as string).length > settings.maxStringSize
            ) {
                node.$original_value = node.$value as string;
                node.$value = (node.$value as string).substr(0, settings.maxStringSize);
                return wrapIncomplete(node, true);
            }

            // 0.75 - base64 chars to bytes ratio
            if (
                node.$binary &&
                !node.$tag &&
                (node.$value as string).length * 0.75 > settings.maxStringSize
            ) {
                node.$original_value = node.$value as string;
                node.$value = truncateBase64(node.$value as string, settings.maxStringSize);
                return wrapIncomplete(node, true);
            }
        }
        return node;
    }

    /*
      The conversion works for
      * data coming from YQL
      * data coming from the enhanced YT table-readers when
        the 'web-json' output format with $attributes.value_format set to 'yql' is used.
        The rest of the comment is about the enhanced YT format.

      The enhanced YT table-reader format is almost the same as an existing YQL
      format, with the following differences.

      * `data` is either a nested list `<lst>` (as in YQL), or a dictionary
        `{val: <lst>, b64: <boolean>, inc: <boolean>}`, where
      * inc means 'incomplete' and acts as `$incomplete` flag in existing YT
        format for values, it can be applied to strings, lists, tuples and
        dictionaries;
      * b64 means 'base64' and acts as a flag that value could not be
        decoded as UTF8 (AKA `$binary`), hence has to be treated as a binary
        and was converted to string via base64 conversion.

        Essentially, before unipika converter for YQL had to decide if the
        data is binary and/or truncated. In new 'web-json' over YQL format the
        YT server-side decides if the value should be treated as a binary
        and/or truncated.
     */
    // eslint-disable-next-line complexity
    function yqlToYson(data: YqlData, dataType: YqlDataType): ConverterNode | undefined {
        const typeName = dataType[0] as string,
            typeValue = dataType[1];

        let isIncomplete: boolean | undefined;
        let isBinary: boolean | undefined;
        let dataValue = data;
        if (settings.treatValAsData && data && Object.hasOwnProperty.call(data, 'val')) {
            const dataObj = data as Record<string, unknown>;
            isIncomplete = dataObj.inc as boolean;
            isBinary = dataObj.b64 as boolean;
            dataValue = dataObj.val;
        }

        let truncatedData: YqlData;
        if (isIncomplete) {
            truncatedData = dataValue;
        } else {
            truncatedData = truncateLargeData(dataValue);
            isIncomplete = truncatedData !== dataValue;
        }

        flags.incomplete = flags.incomplete || isIncomplete;

        switch (typeName) {
            case 'OptionalType': {
                const hasData = isArray(dataValue) && dataValue.length;
                const optionalData = hasData
                    ? yqlToYson((dataValue as unknown[])[0], typeValue as YqlDataType)
                    : yqlToYson(null, ['NullType']);

                // FIXME(Phase 4): original JS had `if (hasData)` without the `optionalData` guard.
                // When yqlToYson returns undefined (unknown type name), this throws TypeError
                // on `optionalData.$optional` — preserving original crash behavior.
                // Revisit: should this be a graceful return or an explicit error?
                if (hasData) {
                    optionalData!.$optional = (optionalData!.$optional || 0) + 1;
                }
                return optionalData;
            }
            case 'TaggedType':
                return convertTaggedType(
                    dataType[1] as string,
                    dataType[2] as YqlDataType,
                    dataValue,
                    yqlToYson,
                    settings.validateSrcUrl,
                );

            // Список значений одного типа
            case 'ListType':
                return wrapIncomplete(
                    {
                        $type: wrapYQLType('list'),
                        $value: (truncatedData as unknown[]).map(function (subData) {
                            return yqlToYson(subData, dataType[1] as YqlDataType);
                        }),
                    },
                    Boolean(isIncomplete),
                );

            // То же отображение, что и ListType
            case 'StreamType':
                return wrapIncomplete(
                    {
                        $type: wrapYQLType('stream'),
                        $value: (truncatedData as unknown[]).map(function (subData) {
                            return yqlToYson(subData, dataType[1] as YqlDataType);
                        }),
                    },
                    Boolean(isIncomplete),
                );

            // Список значений различных типов
            case 'TupleType':
                return wrapIncomplete(
                    {
                        $type: wrapYQLType('tuple'),
                        $value: (truncatedData as unknown[]).map(function (subData, index) {
                            return yqlToYson(
                                subData,
                                (typeValue as unknown[])[index] as YqlDataType,
                            );
                        }),
                    },
                    Boolean(isIncomplete),
                );

            // Key-value map, все ключи и значения одного и того же типа
            case 'DictType':
                if (isSet(dataType)) {
                    return wrapIncomplete(
                        {
                            $type: wrapYQLType('set'),
                            $value: (truncatedData as unknown[]).map(function (subData) {
                                return yqlToYson(
                                    (subData as unknown[])[0],
                                    dataType[1] as YqlDataType,
                                );
                            }),
                        },
                        Boolean(isIncomplete),
                    );
                }
                return wrapIncomplete(
                    {
                        $type: wrapYQLType('dict'),
                        $value: (truncatedData as unknown[]).map(function (subData) {
                            return [
                                yqlToYson((subData as unknown[])[0], dataType[1] as YqlDataType),
                                yqlToYson((subData as unknown[])[1], dataType[2] as YqlDataType),
                            ];
                        }),
                    },
                    Boolean(isIncomplete),
                );

            // Key-value map, ключи и значения могут быть различных типов
            case 'StructType': {
                const structData = (dataValue as unknown[])
                    .map(function (subData, index) {
                        const struct = (typeValue as unknown[])[index] as unknown[];
                        const value = yqlToYson(subData, struct[1] as YqlDataType);
                        // FIXME(Phase 4): original JS had `if (settings.omitStructNull && value.$value === null)`
                        // without the `value` guard. When yqlToYson returns undefined (unknown type name),
                        // this throws TypeError on `value.$value` — preserving original crash behavior.
                        // Revisit: should this be a graceful return or an explicit error?
                        if (settings.omitStructNull && value!.$value === null) {
                            return null;
                        }

                        const key = convertSimpleType(struct[0], 'String');
                        key.$key = true;
                        return [key, value];
                    })
                    .filter(Boolean) as [ConverterNode, ConverterNode][];
                truncatedData = truncateLargeData(structData);

                return wrapIncomplete(
                    {
                        $type: wrapYQLType('struct'),
                        $value: truncatedData,
                    },
                    truncatedData !== structData,
                );
            }

            case 'VariantType': {
                const variantTypes = convertVariantTypes(typeValue as YqlDataType);
                if (isEnum(variantTypes)) {
                    return {
                        $type: wrapYQLType('enum'),
                        $value: getVariantKey(
                            (dataValue as unknown[])[0] as number,
                            typeValue as YqlDataType,
                        ).$value,
                    };
                }
                return {
                    $type: wrapYQLType('variant'),
                    $value: [
                        [
                            getVariantKey(
                                (dataValue as unknown[])[0] as number,
                                typeValue as YqlDataType,
                            ),
                            yqlToYson(
                                (dataValue as unknown[])[1],
                                variantTypes[(dataValue as unknown[])[0] as number] as YqlDataType,
                            ),
                        ],
                    ],
                };
            }
            case 'VoidType':
                return {
                    $type: wrapYQLType('void'),
                    $value: 'Void',
                };

            case 'NullType':
                return {
                    $type: wrapYQLType('null'),
                    $value: null,
                };

            case 'EmptyListType':
                return {
                    $type: wrapYQLType('list'),
                    $value: [],
                };

            case 'EmptyDictType':
                return {
                    $type: wrapYQLType('dict'),
                    $value: [],
                };

            case 'DataType':
                switch (typeValue) {
                    case 'String':
                    case 'Utf8': {
                        const normalizedValue = convertSimpleType(dataValue, typeValue as string);
                        if (isBinary) {
                            normalizedValue.$binary = true;
                        }
                        if (isIncomplete) {
                            // when server sets incomplete flag for a string, the string is already truncated
                            return wrapIncomplete(normalizedValue, true);
                        } else {
                            return truncateLargeString(normalizedValue);
                        }
                    }
                    case 'JsonDocument': {
                        return {
                            $type: 'yql.json',
                            $value: dataValue,
                        };
                    }
                    case 'Yson': {
                        const normalizedYsonValue = convertSimpleType(
                            dataValue,
                            typeValue as string,
                        );

                        if (isIncomplete) {
                            // when server sets incomplete flag for a string, the string is already truncated
                            return wrapIncomplete(normalizedYsonValue, true);
                        } else {
                            return normalizedYsonValue;
                        }
                    }
                    default:
                        return convertSimpleType(dataValue, typeValue as string);
                }
            case 'PgType': {
                const pgCategory = dataType[2];
                return convertSimplePgType(dataValue, typeValue as string, pgCategory);
            }
        }
        return undefined;
    }

    return yqlToYson(...node);
}

function normalizeSettings(settings?: ConverterSettings): YqlSettings {
    const normalizedSettings: YqlSettings = (settings || {}) as YqlSettings;
    const validateSrcUrl =
        settings && settings.validateSrcUrl ? settings.validateSrcUrl : () => false;
    normalizedSettings.validateSrcUrl = validateSrcUrl;
    return normalizedSettings;
}

export function convert(
    node: [YqlData, YqlDataType],
    settings?: ConverterSettings,
    flags?: YqlFlags,
): ConverterNode | undefined {
    const normalizedSettings = normalizeSettings(settings);
    const normalizedFlags: YqlFlags = flags || {};
    return convertInternal(node, normalizedSettings, normalizedFlags);
}
