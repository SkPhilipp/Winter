var Log4jsTimeoutProvider = require('./samples/log4js-timeout-provider');

var Winter = require('../lib/index');
var winter = new Winter();

winter.register('logger', new Log4jsTimeoutProvider());

winter.registerModules(require, {
    'files': './samples/files',
    'main': './samples/main'
});

winter.link();