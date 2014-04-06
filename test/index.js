var Log4jsProvieder = require('./log4js-provider');

var Winter = require('../lib/index');
var winter = new Winter();

winter.register('log4js', new Log4jsProvieder());

winter.registerModules(require, {
    'files': './samples/files',
    'logger': './samples/logger',
    'main': './samples/main'
});

winter.link();