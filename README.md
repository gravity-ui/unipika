# unipika

Common YT/YQL/QC data formatting library.

## TODO

Plugins `yql-date`, `yql-datetime` and `yql-timestamp` do formatting of date by `Date.prototype.toISOString()`.
If it is required it is better to use `moment.js` and rewrite the plugins.
