export function yqlTzdatePluginFactory(/*_format*/) {
    function tzdate(node /*, settings, level*/) {
        return node.$value;
    }

    tzdate.isScalar = true;

    return tzdate;
}
