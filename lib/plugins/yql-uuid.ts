import * as utils from '../utils/format';

import type {PluginFactory, PluginNode} from './types';

type ChunkConfig = {
    length: number;
    reverse: boolean;
};

export const yqlUuidPluginFactory: PluginFactory = function (/*_format*/) {
    const chunkConfigs: ChunkConfig[] = [
        {length: 4, reverse: true},
        {length: 2, reverse: true},
        {length: 2, reverse: true},
        {length: 2, reverse: false},
        {length: 6, reverse: false},
    ];

    function uuid(node: PluginNode /*, settings, level*/): string {
        let position = 0;
        const chunks: string[] = [];
        const value = node.$binary ? atob(String(node.$value)) : String(node.$value);

        chunkConfigs.forEach(function (config) {
            const chunk = value
                .substr(position, config.length)
                .split(utils.EMPTY_STRING)
                .map(function (char) {
                    return utils.toPaddedHex(char.charCodeAt(0), 2);
                });

            position += config.length;
            if (config.reverse) {
                chunk.reverse();
            }
            chunks.push(chunk.join(utils.EMPTY_STRING));
        });

        return chunks.join('-');
    }

    uuid.isScalar = true;

    return uuid;
};
