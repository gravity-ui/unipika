export function yqlPgPluginFactory(/*_format*/) {
    function pg(node /*, settings, level*/) {
        return String(node.$value);
    }

    pg.isScalar = true;

    return pg;
}
