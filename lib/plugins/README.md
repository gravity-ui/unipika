##Creating type plugin

Plugin must export a function that takes `_format` function as an argument and returns a formatter. Formatter is a function that will format data with the following arguments:

- **node {UnipikaYSON}** - data node in UnipikaYSON format.
- **settings {Object}** - settings that may or may not be used by plugin.
- **level {Number}** - level that may or may not be used for complex types formatting by plugin.

Whether or not these arguments are used by plugin directly they must be passed to `_format` function if called inside plugin.

Also the formatter must expose the following API:

- **[isScalar] {Boolean}** - whether the type described by plugin is scalar and so must be wrapped in a span to support css highlighting.

For more reference see existing plugins.



