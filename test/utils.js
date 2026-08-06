export function toPlainText(_serialize, input, format, settings) {
    settings = settings || {};

    settings.format = format;
    settings.asHTML = false;

    return _serialize(input, settings);
}

export function toHTMLText(_serialize, input, format, settings) {
    settings = settings || {};

    settings.format = format;
    settings.asHTML = true;

    return _serialize(input, settings);
}
