module.exports = function (_format) {
    var utils = require('../utils/format');

    function preparePluginClassName(tagName) {
        return 'yql_tagged' + utils.WHITESPACE + 'tagged' + utils.WHITESPACE + 'tag_' + tagName;
    }

    function buildMediaSrc(mimeType, value) {
        if (mimeType === 'url') {
            return utils.hidereferrer(value);
        } else {
            return 'data:' + utils.escape(mimeType) + ';base64,' + utils.escape(value);
        }
    }

    function image(node, imageType, asHTML) {
        function buildImageHtml(src, style) {
            var className = preparePluginClassName('image');
            return '<img class="' + className + '" src="' + src + '"' + (style ? '" style="' + style + '"': '') + '/>';
        }

        function buildComplexImage() {
            var src = buildMediaSrc(imageType, node.$value.src);
            if (!asHTML) {
                return src
            }
            var constraints = {
                'width': node.$value.width,
                'height': node.$value.height,
                'max-width': node.$value.maxWidth,
                'max-height': node.$value.maxHeight,
            };
            var style = ['width', 'height', 'max-width', 'max-height']
                .map(function (key) {
                    var rawValue = constraints[key];
                    if (!rawValue) { return ''; }
                    var value = isNaN(rawValue) ? rawValue : rawValue + 'px';
                    return key + ':' + value;
                })
                .filter(Boolean)
                .join(';');

            return buildImageHtml(src, utils.escape(style));
        }

        function buildSimpleImage() {
            const src = buildMediaSrc(imageType, node.$value);
            return asHTML ? buildImageHtml(src) : src;
        }

        if (node.$type === 'tag_value') {
            return buildComplexImage();
        } else {
            return buildSimpleImage();
        }

    }

    function imagePlugin(imageType) {
        return function (node, settings/* , level*/) {
            return image(node, imageType, settings.asHTML);
        };
    }

    function video(node, videoType, asHTML) {
        function buildVideoHtml(src, style) {
            const className = preparePluginClassName('video');
            return '<video class="' + className + '" controls src="' + src + '"' + (style ? ' style="' + style + '"': '') + '></video>';
        }

        function buildComplexVideo() {
            const src = buildMediaSrc(videoType, node.$value.src);
            console.log(src)
            if (!asHTML) {
                return src
            }
            const constraints = {
                'width': node.$value.width,
                'height': node.$value.height,
                'max-width': node.$value.maxWidth,
                'max-height': node.$value.maxHeight,
            };
            const style = ['width', 'height', 'max-width', 'max-height']
                .map(function (key) {
                    const rawValue = constraints[key];
                    if (!rawValue) { return ''; }
                    const value = isNaN(rawValue) ? rawValue : rawValue + 'px';
                    return key + ':' + value;
                })
                .filter(Boolean)
                .join(';');

            return buildVideoHtml(src, utils.escape(style));
        }

        function buildSimpleVideo() {
            const src = buildMediaSrc(videoType, node.$value);
            return asHTML ? buildVideoHtml(src) : src;
        }

        if (node.$type === 'tag_value') {
            return buildComplexVideo();
        } else {
            return buildSimpleVideo();
        }
    }

    function videoPlugin(videoType) {
        return function (node, settings/* , level*/) {
            return video(node, videoType, settings.asHTML);
        };
    }

    function audio(audioBlob, audioType, asHTML) {
        var className = preparePluginClassName('audio');
        var src = buildMediaSrc(audioType, audioBlob);
        return asHTML ?
            '<audio class="' + className + '" controls src="' + src + '"></audio>' :
            utils.escape(audioBlob);
    }

    function audioPlugin(audioType) {
        return function (node, settings/* , level*/) {
            return audio(node.$value, audioType, settings.asHTML);
        };
    }

    function urlPlugin(node, settings, level) {
        function formatUrl(href, text, title) {
            var className = preparePluginClassName('url');
            var titleAttr = title ? ' title="' + utils.escape(title) + '"' : '';
            return '<a class="' + className + '" target="_blank" href="' + href + '"' + titleAttr + '>' + text + '</a>'
        }

        function formatSimpleUrl() {
            var formattedValue = utils.escape(node.$value);
            var formattedHref = utils.hidereferrer(node.$value);
            return formatUrl(formattedHref, formattedValue, '');
        }

        function formatNamedUrl() {
            var formattedValue = utils.escape(node.$value.text || node.$value.href);
            var formattedHref = utils.hidereferrer(node.$value.href || '');
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

    var plugins = {
        'image/svg': imagePlugin('image/svg+xml'),
        'image/svg+xml': imagePlugin('image/svg+xml'),
        'image/jpeg': imagePlugin('image/jpeg'),
        'image/png': imagePlugin('image/png'),
        'image/gif': imagePlugin('image/gif'),
        'image/webp': imagePlugin('image/webp'),
        'imageurl': imagePlugin('url'),

        'video/mp4': videoPlugin('video/mp4'),
        'video/webm': videoPlugin('video/webm'),
        'videourl': videoPlugin('url'),

        'audio/mpeg': audioPlugin('audio/mpeg'),
        'audio/webm': audioPlugin('audio/webm'),
        'audio/wav': audioPlugin('audio/wav'),
        'audiourl': audioPlugin('url'),

        'url': urlPlugin
    };

    function tagged(node, settings, level) {
        var format = plugins[node.$tag] || _format;
        return format(node.$value, settings, level);
    }

    return tagged;
};
