var Winter = require('../lib/index');
var winter = new Winter();

winter.load(require, {
    'files': './samples/files',
    'logger': './samples/logger',
    'main': './samples/main'
});
