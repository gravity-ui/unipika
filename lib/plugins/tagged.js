module.exports = function (_format) {
    const utils = require('../utils/format');

    function preparePluginClassName(tagName) {
        return 'yql_tagged' + utils.WHITESPACE + 'tagged' + utils.WHITESPACE + 'tag_' + tagName;
    }

    function buildMediaSrc(mimeType, value, settings) {
        if (mimeType === 'url') {
            return utils.normalizeUrl(value, settings);
        } else {
            return 'data:' + utils.escape(mimeType) + ';base64,' + utils.escape(value);
        }
    }

    function image(node, imageType, settings = {}) {
        const {asHTML} = settings;
        function buildImageHtml(src, style) {
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

        function buildComplexImage() {
            const src = buildMediaSrc(imageType, node.$value.src, settings);
            if (!asHTML) {
                return src;
            }
            const constraints = {
                width: node.$value.width,
                height: node.$value.height,
                'max-width': node.$value.maxWidth,
                'max-height': node.$value.maxHeight,
            };
            const style = ['width', 'height', 'max-width', 'max-height']
                .map(function (key) {
                    const rawValue = constraints[key];
                    if (!rawValue) {
                        return '';
                    }
                    const value = isNaN(rawValue) ? rawValue : rawValue + 'px';
                    return key + ':' + value;
                })
                .filter(Boolean)
                .join(';');

            return buildImageHtml(src, utils.escape(style));
        }

        function buildSimpleImage() {
            const src = buildMediaSrc(imageType, node.$value, settings);
            return asHTML ? buildImageHtml(src) : src;
        }

        if (node.$type === 'tag_value') {
            return buildComplexImage();
        } else {
            return buildSimpleImage();
        }
    }

    function imagePlugin(imageType) {
        return function (node, settings /* , level*/) {
            return image(node, imageType, settings);
        };
    }

    function video(node, videoType, settings) {
        const {asHTML} = settings;
        function buildVideoHtml(src, style) {
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

        function buildComplexVideo() {
            const src = buildMediaSrc(videoType, node.$value.src, settings);
            if (!asHTML) {
                return src;
            }
            const constraints = {
                width: node.$value.width,
                height: node.$value.height,
                'max-width': node.$value.maxWidth,
                'max-height': node.$value.maxHeight,
            };
            const style = ['width', 'height', 'max-width', 'max-height']
                .map(function (key) {
                    const rawValue = constraints[key];
                    if (!rawValue) {
                        return '';
                    }
                    const value = isNaN(rawValue) ? rawValue : rawValue + 'px';
                    return key + ':' + value;
                })
                .filter(Boolean)
                .join(';');

            return buildVideoHtml(src, utils.escape(style));
        }

        function buildSimpleVideo() {
            const src = buildMediaSrc(videoType, node.$value, settings);
            return asHTML ? buildVideoHtml(src) : src;
        }

        if (node.$type === 'tag_value') {
            return buildComplexVideo();
        } else {
            return buildSimpleVideo();
        }
    }

    function videoPlugin(videoType) {
        return function (node, settings /* , level*/) {
            return video(node, videoType, settings);
        };
    }

    function audio(audioBlob, audioType, settings) {
        const {asHTML} = settings;
        const className = preparePluginClassName('audio');
        const src = buildMediaSrc(audioType, audioBlob, settings);
        return asHTML
            ? '<audio class="' + className + '" controls src="' + src + '"></audio>'
            : utils.escape(audioBlob);
    }

    function audioPlugin(audioType) {
        return function (node, settings /* , level*/) {
            return audio(node.$value, audioType, settings);
        };
    }

    function urlPlugin(node, settings, level) {
        function formatUrl(href, text, title) {
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

        function formatSimpleUrl() {
            const formattedValue = utils.escape(node.$value);
            const formattedHref = utils.normalizeUrl(node.$value, settings);
            return formatUrl(formattedHref, formattedValue, '');
        }

        function formatNamedUrl() {
            const formattedValue = utils.escape(node.$value.text || node.$value.href);
            const formattedHref = utils.normalizeUrl(node.$value.href || '', settings);
            return formatUrl(formattedHref, formattedValue, node.$value.title);
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

    const plugins = {
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

    function tagged(node, settings, level) {
        const format = plugins[node.$tag] || _format;
        return format(node.$value, settings, level);
    }

    return tagged;
};
