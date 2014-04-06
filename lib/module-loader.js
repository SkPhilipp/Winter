var ModuleLoader = function () {
};

/**
 *
 * @param name
 * @param {Array} dependencies list of dependency names for given module
 * @param modules
 * @param loaded
 * @return {*} instantiated module reference
 */
ModuleLoader.prototype.instantiate = function (name, dependencies, modules, loaded) {
    var self = this;
    var parameters = [];
    dependencies.forEach(function (arg) {
        parameters.push(loaded[arg]);
    });
    var module = modules[name];
    if (module instanceof Function) {
        return new (Function.prototype.bind.apply(module, [module].concat(parameters)));
    }
    else {
        throw new Error('[' + name + '] is not a function; could not instantiate.');
    }
};

ModuleLoader.prototype.link = function (modules, dependencies, instantiatable, dependants) {

    var self = this;
    var current = instantiatable;
    var loaded = {};

    var spliceableDependencies = {};
    Object.keys(dependencies).forEach(function(key){
        spliceableDependencies[key] = dependencies[key].slice();
    });

    // while we can load modules, we load them!
    while (current.length > 0) {
        var next = [];
        current.forEach(function (name) {
            // time to instantiate
            var args = dependencies[name];
            loaded[name] = self.instantiate(name, args, modules, loaded);
            // get the reverse mapping entry and delete it from the mapping
            var moduleDependants = dependants[name];
            if (moduleDependants != null) {
                delete moduleDependants[name];
                moduleDependants.forEach(function (dependant) {
                    // remove all instances of name ( usually, 1 ) from the dependants' dependencies
                    var moduleDependencies = spliceableDependencies[dependant];
                    var index;
                    do {
                        index = moduleDependencies.indexOf(name);
                        moduleDependencies.splice(index, 1);
                    }
                    while (index !== -1);
                    // if length of dependencies to be loaded is 0, we can instantiate it
                    if (moduleDependencies.length == 0) {
                        next.push(dependant);
                    }
                });
            }
        });
        current = next;
    }

    // TODO: check for unloaded modules on reversed, throw errors for all when this happens

    return loaded;

};

module.exports = ModuleLoader;