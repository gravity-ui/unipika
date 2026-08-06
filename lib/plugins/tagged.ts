import * as utils from '../utils/format';

import type {FormatFunction, PluginFactory, PluginNode, PluginSettings} from './types';

type TaggedValue = {
    src?: string;
    width?: number | string;
    height?: number | string;
    maxWidth?: number | string;
    maxHeight?: number | string;
    text?: string;
    href?: string;
    title?: string;
};

export const tagged: PluginFactory = function (_format: FormatFunction) {
    function preparePluginClassName(tagName: string): string {
        return 'yql_tagged' + utils.WHITESPACE + 'tagged' + utils.WHITESPACE + 'tag_' + tagName;
    }

    function buildMediaSrc(mimeType: string, value: string, settings: PluginSettings): string {
        if (mimeType === 'url') {
            return utils.normalizeUrl(value, settings);
        } else {
            return 'data:' + utils.escape(mimeType) + ';base64,' + utils.escape(value);
        }
    }

    function image(node: PluginNode, imageType: string, settings: PluginSettings = {}): string {
        const {asHTML} = settings;
        function buildImageHtml(src: string, style = ''): string {
            const className = preparePluginClassName('image');
            return (
                '<img class="' +
                className +
                '" src="' +
                src +
                '"' +
                (style ? '" style="' + style + '"' : '') +
                '/>'
            );
        }

        function buildComplexImage(): string {
            const value = node.$value as TaggedValue;
            const src = buildMediaSrc(imageType, value.src as string, settings);
            if (!asHTML) {
                return src;
            }
            const constraints = {
                width: value.width,
                height: value.height,
                'max-width': value.maxWidth,
                'max-height': value.maxHeight,
            };
            const style = (['width', 'height', 'max-width', 'max-height'] as const)
                .map(function (key) {
                    const rawValue = constraints[key];
                    if (!rawValue) {
                        return '';
                    }
                    const value = isNaN(rawValue as number) ? rawValue : rawValue + 'px';
                    return key + ':' + value;
                })
                .filter(Boolean)
                .join(';');

            return buildImageHtml(src, utils.escape(style));
        }

        function buildSimpleImage(): string {
            const src = buildMediaSrc(imageType, String(node.$value), settings);
            return asHTML ? buildImageHtml(src) : src;
        }

        if (node.$type === 'tag_value') {
            return buildComplexImage();
        } else {
            return buildSimpleImage();
        }
    }

    function imagePlugin(
        imageType: string,
    ): (node: PluginNode, settings: PluginSettings) => string {
        return function (node: PluginNode, settings: PluginSettings /* , level*/) {
            return image(node, imageType, settings);
        };
    }

    function video(node: PluginNode, videoType: string, settings: PluginSettings): string {
        const {asHTML} = settings;
        function buildVideoHtml(src: string, style = ''): string {
            const className = preparePluginClassName('video');
            return (
                '<video class="' +
                className +
                '" controls src="' +
                src +
                '"' +
                (style ? ' style="' + style + '"' : '') +
                '></video>'
            );
        }

        function buildComplexVideo(): string {
            const value = node.$value as TaggedValue;
            const src = buildMediaSrc(videoType, value.src as string, settings);
            if (!asHTML) {
                return src;
            }
            const constraints = {
                width: value.width,
                height: value.height,
                'max-width': value.maxWidth,
                'max-height': value.maxHeight,
            };
            const style = ['width', 'height', 'max-width', 'max-height']
                .map(function (key) {
                    const rawValue = constraints[key as keyof typeof constraints];
                    if (!rawValue) {
                        return '';
                    }
                    const value = isNaN(rawValue as number) ? rawValue : rawValue + 'px';
                    return key + ':' + value;
                })
                .filter(Boolean)
                .join(';');

            return buildVideoHtml(src, utils.escape(style));
        }

        function buildSimpleVideo(): string {
            const src = buildMediaSrc(videoType, String(node.$value), settings);
            return asHTML ? buildVideoHtml(src) : src;
        }

        if (node.$type === 'tag_value') {
            return buildComplexVideo();
        } else {
            return buildSimpleVideo();
        }
    }

    function videoPlugin(
        videoType: string,
    ): (node: PluginNode, settings: PluginSettings) => string {
        return function (node: PluginNode, settings: PluginSettings /* , level*/) {
            return video(node, videoType, settings);
        };
    }

    function audio(audioBlob: string, audioType: string, settings: PluginSettings): string {
        const {asHTML} = settings;
        const className = preparePluginClassName('audio');
        const src = buildMediaSrc(audioType, audioBlob, settings);
        return asHTML
            ? '<audio class="' + className + '" controls src="' + src + '"></audio>'
            : utils.escape(audioBlob);
    }

    function audioPlugin(
        audioType: string,
    ): (node: PluginNode, settings: PluginSettings) => string {
        return function (node: PluginNode, settings: PluginSettings /* , level*/) {
            return audio(String(node.$value), audioType, settings);
        };
    }

    function urlPlugin(node: PluginNode, settings: PluginSettings, level: number): string {
        function formatUrl(href: string, text: string, title: string | undefined): string {
            const className = preparePluginClassName('url');
            const titleAttr = title ? ' title="' + utils.escape(title) + '"' : '';
            return (
                '<a class="' +
                className +
                '" target="_blank" href="' +
                href +
                '"' +
                titleAttr +
                '>' +
                text +
                '</a>'
            );
        }

        function formatSimpleUrl(): string {
            const formattedValue = utils.escape(String(node.$value));
            const formattedHref = utils.normalizeUrl(String(node.$value), settings);
            return formatUrl(formattedHref, formattedValue, '');
        }

        function formatNamedUrl(): string {
            const value = node.$value as TaggedValue;
            const formattedValue = utils.escape(value.text || value.href || '');
            const formattedHref = utils.normalizeUrl(value.href || '', settings);
            return formatUrl(formattedHref, formattedValue, value.title);
        }

        if (settings.asHTML) {
            if (node.$type === 'tag_value') {
                return formatNamedUrl();
            }
            if (typeof node.$value === 'string') {
                return formatSimpleUrl();
            }
        }

        return _format(node, settings, level);
    }

    const plugins: Record<
        string,
        (node: PluginNode, settings: PluginSettings, level: number) => string
    > = {
        'image/svg': imagePlugin('image/svg+xml'),
        'image/svg+xml': imagePlugin('image/svg+xml'),
        'image/jpeg': imagePlugin('image/jpeg'),
        'image/png': imagePlugin('image/png'),
        'image/gif': imagePlugin('image/gif'),
        'image/webp': imagePlugin('image/webp'),
        imageurl: imagePlugin('url'),

        'video/mp4': videoPlugin('video/mp4'),
        'video/webm': videoPlugin('video/webm'),
        videourl: videoPlugin('url'),

        'audio/mpeg': audioPlugin('audio/mpeg'),
        'audio/webm': audioPlugin('audio/webm'),
        'audio/wav': audioPlugin('audio/wav'),
        audiourl: audioPlugin('url'),

        url: urlPlugin,
    };

    function tagged(node: PluginNode, settings: PluginSettings, level: number): string {
        const format = plugins[node.$tag as string] || _format;
        return format(node.$value as PluginNode, settings, level);
    }

    return tagged;
};
