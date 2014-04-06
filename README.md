Winter
======

Winter does dependency injection without being intrusive on your existing code.

Basics
------

Here's an example

    // logger.js

    var Logger = function(){
    };

    Logger.prototype.log = function(text){
        console.log(text);
    };

    module.exports = Logger;

    // main.js

    module.exports = function(logger){
        logger.log('hello');
    };

Here's how you run it with Winter:

    var winter = new Winter();

    winter.registerModules(require, {
        'logger': './relative-path-to/logger',
        'main': './relative-path-to/main'
    });

    winter.link();

It will output

    hello

Providers
---------

For modules, Winter uses `ModuleProviders`; Providers that call the `module.exports` function, and keep these in memory
for when they are a dependency for other modules. For example, `main.js` requires a `logger`, which is registered
as `./relative-path-to/logger`.

You can also create your own provider, to contextually create new objects, as a real world example, it isn't very
handy to only have one global `logger` object, we might as wel use `console`. With a custom provider we can add more
context to the logger, using a custom provider we could create a new logger with information on which module required
the logger.

Providers only have to implement two methods, `instantiate` which should return an instance of whatever your module
does. And `dependencies` which returns a list of dependencies required, before first call to `instantiate` can be made.

Here's the code sample using the `log4js` module.

    var log4js = require('log4js');

    var Log4jsProvider = function(){
    };

    Log4jsProvider.prototype.dependencies = function () {
        return [];
    };

    Log4jsProvider.prototype.instantiate = function (providers, name) {
        if(name == undefined){
            return null;
        }
        else{
            return log4js.getLogger(name);
        }
    };

    module.exports = Log4jsProvider;

You can register these custom providers as follows:

    winter.register('logger', new Log4jsProvider());

A sample on how to use this module would be ( `Log4jsProvider` code excluded here ):

    // main.js

    module.exports = function(logger){
        logger.info('hello');
    };

    // index.js

    var winter = new Winter();

    winter.register('logger', new Log4jsProvider());

    winter.registerModules(require, {
        'main': './relative-path-to/main'
    });

    winter.link();

This will output

    [2014-04-06 16:06:09.104] [INFO] main - hello

Now, it is using the `log4js` module, with a logger instantiated using the custom provider, the custom provider also
created the logger with the name of `main`, so now you will never again have to write
`require('log4js').getLogger('nameofmodule');`, and instead you can simple require a logger.

Additionally
------------

- Winter works with `q` promises; Providers are allowed to return promises of an instance instead of an instance.
- Registering a module more than once on the same name will overwrite the earlier module.
- Winter's `link` should only be called once, and all providers should be registered before calling `link`.
- Cyclic or missing dependencies are detected and logged to `console.error`.