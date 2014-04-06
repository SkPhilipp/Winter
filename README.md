Winter
======

Winter can do dependency injection without being intrusive on your existing code.

    // hello.js

    module.exports = function(){
        return "Hello";
    };

    // main.js

    module.exports = function(logger, hello){
        logger.info(hello);
    };

    // index.js

    var winter = new Winter();

    winter.register('logger', new Winter.LoggerProvider());

    winter.registerModules(require, {
        'main': './main'
        'hello': './hello'
    });

    winter.link().done();

This will output

    [2014-04-06 16:06:09.104] [INFO] main - Hello

Additionally
------------

- You can create custom providers like `LoggerProvider`, check out the sources; it's easy.
- Winter works with `q` promises; providers are can freely return promises instead of instances directly.
- Registering a module more than once on the same name will overwrite the earlier module.
- Winter's `link` should only be called once, and all providers should be registered before calling `link`.
- Cyclic or missing dependencies are detected and logged to `console.error`.
