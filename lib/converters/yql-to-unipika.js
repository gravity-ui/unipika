(function () {
    function wrapYQLType(name) {
        return 'yql.' + name;
    }
    function wrapYQLPgType(name) {
        return 'yql.pg.' + name;
    }

    function convertSimplePgType(data, dataType) {
        const type = wrapYQLPgType(dataType.toLowerCase());
        return {
            $type: type,
            $value: data,
        };
    }

    function convertSimpleType(data, dataType) {
        const type = wrapYQLType(dataType.toLowerCase());

        switch (dataType) {
            case 'String':
            case 'Uuid':
                if (Array.isArray(data)) {
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

    function getVariantKey(typeIndex, dataType) {
        let result;
        if (dataType[0] === 'StructType') {
            result = convertSimpleType(dataType[1][typeIndex][0], 'String');
        } else {
            result = convertSimpleType(typeIndex, 'Int32');
        }
        result.$key = true;
        return result;
    }

    function isEnum(variantTypes) {
        return variantTypes.every(function (variantType) {
            return variantType[0] === 'VoidType';
        });
    }

    function isSet(dictType) {
        return dictType[2][0] === 'VoidType';
    }

    function convertVariantTypes(dataType) {
        const typeName = dataType[0];
        return dataType[1].map(function (typeValue) {
            if (typeName === 'StructType') {
                return typeValue[1];
            } else {
                return typeValue;
            }
        });
    }

    function convertStructToJSON(struct) {
        const result = {};
        struct.$value.forEach(function (entry) {
            const key = entry[0];
            const value = entry[1];
            if (key.$type !== wrapYQLType('string')) {
                throw new Error('unipika: try to convert struct with no-string keys to object');
            }
            result[key.$value] = value.$value;
        });
        return result;
    }

    function getSrc(convertedData = {}) {
        if (
            Object.prototype.hasOwnProperty.call(convertedData, 'src') &&
            typeof convertedData.src === 'string'
        ) {
            return convertedData.src;
        }
        if (typeof convertedData.$value === 'string') {
            return convertedData.$value;
        }
        return undefined;
    }
    // eslint-disable-next-line complexity
    function convertTaggedType(tag, dataType, data, converter, validateSrcUrl) {
        let convertedValue = converter(data, dataType);
        let convertedStruct;
        switch (tag) {
            case 'url':
                if (dataType[0] === 'StructType') {
                    convertedStruct = convertStructToJSON(convertedValue);
                    if (
                        Object.prototype.hasOwnProperty.call(convertedStruct, 'href') &&
                        typeof convertedStruct.href === 'string'
                    ) {
                        convertedValue = {
                            $type: 'tag_value',
                            $value: convertedStruct,
                        };
                    } else {
                        return convertedValue;
                    }
                }
                break;
            case 'videourl':
            case 'audiourl':
            case 'imageurl': {
                if (dataType[0] === 'StructType') {
                    convertedStruct = convertStructToJSON(convertedValue);
                    const src = getSrc(convertedStruct);
                    if (src && validateSrcUrl(src)) {
                        convertedValue = {
                            $type: 'tag_value',
                            $value: convertedStruct,
                        };
                    } else {
                        return convertedValue;
                    }
                }
                const src = getSrc(convertedValue);
                if (src && !validateSrcUrl(src)) {
                    return convertedValue;
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
                    convertedStruct = convertStructToJSON(convertedValue);
                    const src = getSrc(convertedStruct);
                    if (src) {
                        convertedValue = {
                            $type: 'tag_value',
                            $value: convertedStruct,
                        };
                    } else {
                        return convertedValue;
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

    function convert(node, settings, flags) {
        function truncateLargeData(data) {
            if (
                settings.maxListSize > 0 &&
                Array.isArray(data) &&
                data.length > settings.maxListSize
            ) {
                return data.slice(0, settings.maxListSize);
            }

            return data;
        }

        function wrapIncomplete(node, isIncomplete) {
            if (isIncomplete) {
                node.$incomplete = true;
            }
            return node;
        }

        function truncateBase64(text, maxBytes) {
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

        function truncateLargeString(node) {
            if (settings.maxStringSize > 0 && node.$value) {
                if (!node.$binary && !node.$tag && node.$value.length > settings.maxStringSize) {
                    node.$original_value = node.$value;
                    node.$value = node.$value.substr(0, settings.maxStringSize);
                    return wrapIncomplete(node, true);
                }

                // 0.75 - base64 chars to bytes ratio
                if (
                    node.$binary &&
                    !node.$tag &&
                    node.$value.length * 0.75 > settings.maxStringSize
                ) {
                    node.$original_value = node.$value;
                    node.$value = truncateBase64(node.$value, settings.maxStringSize);
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
        function yqlToYson(data, dataType) {
            const typeName = dataType[0],
                typeValue = dataType[1];

            let isIncomplete, isBinary;
            if (settings.treatValAsData && data && Object.hasOwnProperty.call(data, 'val')) {
                isIncomplete = data.inc;
                isBinary = data.b64;
                data = data.val;
            }

            let truncatedData;
            if (isIncomplete) {
                truncatedData = data;
            } else {
                truncatedData = truncateLargeData(data);
                isIncomplete = truncatedData !== data;
            }

            flags.incomplete = flags.incomplete || isIncomplete;

            switch (typeName) {
                case 'OptionalType': {
                    const hasData = Array.isArray(data) && data.length;
                    const optionalData = hasData
                        ? yqlToYson(data[0], typeValue)
                        : yqlToYson(null, ['VoidType']);

                    if (hasData) {
                        optionalData.$optional = (optionalData.$optional || 0) + 1;
                    }
                    return optionalData;
                }
                case 'TaggedType':
                    return convertTaggedType(
                        dataType[1],
                        dataType[2],
                        data,
                        yqlToYson,
                        settings.validateSrcUrl,
                    );

                // Список значений одного типа
                case 'ListType':
                    return wrapIncomplete(
                        {
                            $type: wrapYQLType('list'),
                            $value: truncatedData.map(function (subData) {
                                return yqlToYson(subData, dataType[1]);
                            }),
                        },
                        isIncomplete,
                    );

                // То же отображение, что и ListType
                case 'StreamType':
                    return wrapIncomplete(
                        {
                            $type: wrapYQLType('stream'),
                            $value: truncatedData.map(function (subData) {
                                return yqlToYson(subData, dataType[1]);
                            }),
                        },
                        isIncomplete,
                    );

                // Список значений различных типов
                case 'TupleType':
                    return wrapIncomplete(
                        {
                            $type: wrapYQLType('tuple'),
                            $value: truncatedData.map(function (subData, index) {
                                return yqlToYson(subData, typeValue[index]);
                            }),
                        },
                        isIncomplete,
                    );

                // Key-value map, все ключи и значения одного и того же типа
                case 'DictType':
                    if (isSet(dataType)) {
                        return wrapIncomplete(
                            {
                                $type: wrapYQLType('set'),
                                $value: truncatedData.map(function (subData) {
                                    return yqlToYson(subData[0], dataType[1]);
                                }),
                            },
                            isIncomplete,
                        );
                    }
                    return wrapIncomplete(
                        {
                            $type: wrapYQLType('dict'),
                            $value: truncatedData.map(function (subData) {
                                return [
                                    yqlToYson(subData[0], dataType[1]),
                                    yqlToYson(subData[1], dataType[2]),
                                ];
                            }),
                        },
                        isIncomplete,
                    );

                // Key-value map, ключи и значения могут быть различных типов
                case 'StructType': {
                    const structData = data
                        .map(function (subData, index) {
                            const struct = typeValue[index];
                            const value = yqlToYson(subData, struct[1]);
                            if (settings.omitStructNull && value.$value === null) {
                                return null;
                            }

                            const key = convertSimpleType(struct[0], 'String');
                            key.$key = true;
                            return [key, value];
                        })
                        .filter(Boolean);
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
                    const variantTypes = convertVariantTypes(typeValue);
                    if (isEnum(variantTypes)) {
                        return {
                            $type: wrapYQLType('enum'),
                            $value: getVariantKey(data[0], typeValue).$value,
                        };
                    }
                    return {
                        $type: wrapYQLType('variant'),
                        $value: [
                            [
                                getVariantKey(data[0], typeValue),
                                yqlToYson(data[1], variantTypes[data[0]]),
                            ],
                        ],
                    };
                }
                case 'VoidType':
                    return {
                        $type: wrapYQLType('null'),
                        $value: null,
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
                            const normalizedValue = convertSimpleType(data, typeValue);
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
                                $value: data,
                            };
                        }
                        case 'Yson': {
                            const normalizedYsonValue = convertSimpleType(data, typeValue);

                            if (isIncomplete) {
                                // when server sets incomplete flag for a string, the string is already truncated
                                return wrapIncomplete(normalizedYsonValue, true);
                            } else {
                                return normalizedYsonValue;
                            }
                        }
                        default:
                            return convertSimpleType(data, typeValue);
                    }
                case 'PgType':
                    return convertSimplePgType(data, typeValue);
            }
        }

        return yqlToYson(...node);
    }

    function normalizeSettings(settings) {
        const normalizedSettings = settings || {};
        const validateSrcUrl =
            settings && settings.validateSrcUrl ? settings.validateSrcUrl : () => false;
        normalizedSettings.validateSrcUrl = validateSrcUrl;
        return normalizedSettings;
    }

    module.exports = function (node, settings, flags) {
        const normalizedSettings = normalizeSettings(settings);
        const normalizedFlags = flags || {};
        return convert(node, normalizedSettings, normalizedFlags);
    };
})();
