var Winter = require('../lib/index');
var winter = new Winter();
winter.register('logger', new Winter.LoggerProvider());

winter.registerModules(require, {
    'files': './samples/files',
    'main': './samples/main'
});

winter.link();