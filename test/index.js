var Winter = require('../lib/index');
var winter = new Winter();

winter.register('logger', new Winter.LoggerProvider());

winter.registerModules(require, {
    'main': './main',
    'hello': './hello'
});

winter.link().done();