require('../lib')({ exportBrowserModule: true });

modules.require(['jquery', 'bh', 'unipika'], function ($, bh, unipika) {
    var examples = require('./example-data');
    var settings = require('./example-settings');

    var renderers = {
        checkbox: function (setting) {
            return bh.apply({
                block : 'checkbox',
                mods : {
                    theme : 'islands',
                    size : 'm',
                    checked : setting.value
                },
                name: setting.name,
                text : setting.name
            });
        },
        radiobutton: function (setting) {
            return bh.apply([
                {
                    tag: 'div',
                    cls: 'setting-heading',
                    content: setting.name
                },
                {
                    block : 'radio-group',
                    mods : {
                        theme : 'islands',
                        size : 'm',
                        type : 'line'
                    },
                    val: setting.value,
                    name : setting.name,
                    options : setting.options.map(function (option) {
                        return { val: option, text: option };
                    })
                }
            ]);
        }
    };

    function renderSetting(setting) {
        var settingRenderer = renderers[setting.type];

        return bh.apply({
            tag: 'div',
            cls: 'setting',
            content: settingRenderer(setting)
        });
    }

    function renderSettings() {
        var settingsWrapper = $('.settings');

        settingsWrapper.html(
            settings.map(renderSetting).join('')
        );
    }

    function prepareSettings() {
        var prepared = {};

        settings.forEach(function (setting) {
            prepared[setting.name] = setting.value;
        });

        return prepared;
    }

    function renderExamples() {
        var examplesWrapper = $('.examples');
        var preparedSettings = prepareSettings(settings);

        examplesWrapper.html(Object.keys(examples)
            .map(function (typeName) {
                return bh.apply({
                    tag: 'div',
                    cls: 'example-section',
                    content: [
                        {
                            tag: 'h2',
                            content: typeName
                        }
                    ].concat(
                        examples[typeName].examples.map(function (example) {
                            var converter = unipika.converters[examples[typeName].converter];
                            var converted = converter(example.value, preparedSettings);
                            var formatted = unipika.format(converted, preparedSettings);

                            return {
                                tag: 'div',
                                cls: 'example-wrapper',
                                content: [
                                    {
                                        tag: false,
                                        html: '<pre class="unipika">' + formatted + '</pre>'
                                    },
                                    {
                                        tag: false,
                                        html: '<pre class="unipika">' + unipika.formatRaw(example.value) + '</pre>'
                                    }/*,
                                    {
                                        tag: false,
                                        html: '<pre class="unipika">' + toPrettyJSON(converted) + '</pre>'
                                    }*/
                                ]
                            };
                        })
                    )
                });
            })
            .join(''));
    }

    function subscribeToChange() {
        var settingsWrapper = $('.settings');

        settingsWrapper.on('change', '.setting > .checkbox', function (evt) {
            var targetName = evt.target.name;
            var targetChecked = evt.target.checked;

            settings
                .find(function (setting) {
                    return setting.name === targetName;
                })
                .value = targetChecked;

            renderExamples();
        });

        settingsWrapper.on('change', '.setting .radio', function (evt) {
            var targetName = evt.target.name;
            var targetValue = evt.target.value;

            settings
                .find(function (setting) {
                    return setting.name === targetName;
                })
                .value = targetValue;

            renderExamples();
        });
    }

    renderSettings();

    renderExamples();

    subscribeToChange();
});
