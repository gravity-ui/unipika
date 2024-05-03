require('../lib')({exportBrowserModule: true});

modules.require(['jquery', 'bh', 'unipika'], function ($, bh, unipika) {
    const examples = require('./example-data');
    const settings = require('./example-settings');

    const renderers = {
        checkbox: function (setting) {
            return bh.apply({
                block: 'checkbox',
                mods: {
                    theme: 'islands',
                    size: 'm',
                    checked: setting.value,
                },
                name: setting.name,
                text: setting.name,
            });
        },
        radiobutton: function (setting) {
            return bh.apply([
                {
                    tag: 'div',
                    cls: 'setting-heading',
                    content: setting.name,
                },
                {
                    block: 'radio-group',
                    mods: {
                        theme: 'islands',
                        size: 'm',
                        type: 'line',
                    },
                    val: setting.value,
                    name: setting.name,
                    options: setting.options.map(function (option) {
                        return {val: option, text: option};
                    }),
                },
            ]);
        },
    };

    function renderSetting(setting) {
        const settingRenderer = renderers[setting.type];

        return bh.apply({
            tag: 'div',
            cls: 'setting',
            content: settingRenderer(setting),
        });
    }

    function renderSettings() {
        const settingsWrapper = $('.settings');

        settingsWrapper.html(settings.map(renderSetting).join(''));
    }

    function prepareSettings() {
        const prepared = {};

        settings.forEach(function (setting) {
            prepared[setting.name] = setting.value;
        });

        return prepared;
    }

    function renderExamples() {
        const examplesWrapper = $('.examples');
        const preparedSettings = prepareSettings(settings);

        examplesWrapper.html(
            Object.keys(examples)
                .map(function (typeName) {
                    return bh.apply({
                        tag: 'div',
                        cls: 'example-section',
                        content: [
                            {
                                tag: 'h2',
                                content: typeName,
                            },
                        ].concat(
                            examples[typeName].examples.map(function (example) {
                                const converter = unipika.converters[examples[typeName].converter];
                                const converted = converter(example.value, preparedSettings);
                                const formatted = unipika.format(converted, preparedSettings);

                                return {
                                    tag: 'div',
                                    cls: 'example-wrapper',
                                    content: [
                                        {
                                            tag: false,
                                            html: '<pre class="unipika">' + formatted + '</pre>',
                                        },
                                        {
                                            tag: false,
                                            html:
                                                '<pre class="unipika">' +
                                                unipika.formatRaw(example.value) +
                                                '</pre>',
                                        } /*,
                                    {
                                        tag: false,
                                        html: '<pre class="unipika">' + toPrettyJSON(converted) + '</pre>'
                                    }*/,
                                    ],
                                };
                            }),
                        ),
                    });
                })
                .join(''),
        );
    }

    function subscribeToChange() {
        const settingsWrapper = $('.settings');

        settingsWrapper.on('change', '.setting > .checkbox', function (evt) {
            const targetName = evt.target.name;
            const targetChecked = evt.target.checked;

            settings.find(function (setting) {
                return setting.name === targetName;
            }).value = targetChecked;

            renderExamples();
        });

        settingsWrapper.on('change', '.setting .radio', function (evt) {
            const targetName = evt.target.name;
            const targetValue = evt.target.value;

            settings.find(function (setting) {
                return setting.name === targetName;
            }).value = targetValue;

            renderExamples();
        });
    }

    renderSettings();

    renderExamples();

    subscribeToChange();
});
