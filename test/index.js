var Log4jsProvider = require('./log4js-provider');

var Winter = require('../lib/index');
var winter = new Winter();

winter.register('logger', new Log4jsProvider());

winter.registerModules(require, {
    'files': './samples/files',
    'main': './samples/main'
});

winter.link();