Winter
======

_This project is complete, no longer maintained and part of my source code "attic". Feel free to use it though, it works great!_

Winter can do dependency injection without being intrusive on your existing code.

```javascript
// hello.js
module.exports = function(){
    this.message = "Hello";
};
```

```javascript
// main.js
module.exports = function(logger, hello){
    logger.info(hello.message);
};
```

```javascript
// index.js
var Winter = require('winter');
var winter = new Winter();

winter.register('logger', new Winter.LoggerProvider());

winter.registerModules(require, {
    'main': './main',
    'hello': './hello'
});

winter.link().done();
```

This will output

```
[2014-04-06 16:06:09.104] [INFO] main - Hello
```

For static values like the above `"Hello"` string, it is better to use `Winter.ValueProvider`.

Additionally
------------

- You can create custom providers like `LoggerProvider`, check out the sources; it's easy.
- Winter works with `q` promises; providers can freely return promises instead of instances directly.
- Registering a provider more than once on the same name will overwrite the previous provider for that name.
- Winter's `link` should only be called once, and all providers should be registered before calling `link`.
- Cyclic and missing dependencies cause `link`'s promise to fail, with information on whats wrong or missing.
