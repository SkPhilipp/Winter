var log4js = require('log4js');

var LoggerProvider = function () {
};

LoggerProvider.prototype.dependencies = function () {
    return [];
};

LoggerProvider.prototype.instantiate = function (providers, name) {
    if (name == undefined) {
        return null;
    }
    else {
        return log4js.getLogger(name);
    }
};

module.exports = LoggerProvider;