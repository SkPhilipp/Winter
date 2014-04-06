var ModuleProvider = require('./module-provider');

var Winter = function () {
    this._providers = {};
    this._dependencies = {};
};

/**
 * Registers a single provider under a given name.
 *
 * @param name
 * @param provider
 */
Winter.prototype.register = function(name, provider){
    this._providers[name] = provider;
    this._dependencies[name] = provider.dependencies();
};

/**
 * Loads every value in config as a module and registers it as a ModuleProvider using the key as its name.
 *
 * @param loader an instance of require that can load values of config
 * @param mapping a map of module names to paths
 */
Winter.prototype.registerModules = function (loader, mapping) {
    var self = this;
    // add each config item, require it, and get the arg names
    Object.keys(mapping).forEach(function (name) {
        // load each entry, read its dependency list and add those to the mapping
        var value = mapping[name];
        var mod = loader(value);
        var provider = new ModuleProvider(name, mod);
        self.register(name, provider);
    });
};

/**
 * Attempts to instantiate once for every provider.
 *
 * @return {*}
 */
Winter.prototype.link = function(){
    var self = this;
    // names of entries within `modules` we can load
    var instantiatable = [];
    Object.keys(self._dependencies).forEach(function(name){
        if (self._dependencies[name].length == 0) {
            instantiatable.push(name);
        }
    });
    var dependants = self._depentants(self._dependencies);

    var current = instantiatable;

    var spliceableDependencies = {};
    Object.keys(self._dependencies).forEach(function(key){
        spliceableDependencies[key] = self._dependencies[key].slice();
    });
    // while we can load modules, we load them!
    while (current.length > 0) {
        var next = [];
        current.forEach(function (name) {
            // time to instantiate
            self._providers[name].instantiate(self._providers);
            // get the reverse mapping entry and delete it from the mapping
            var moduleDependants = dependants[name];
            if (moduleDependants != null) {
                delete moduleDependants[name];
                moduleDependants.forEach(function (dependant) {
                    // remove all instances of name ( usually, 1 ) from the dependants' dependencies
                    var moduleDependencies = spliceableDependencies[dependant];
                    var index = moduleDependencies.indexOf(name);
                    while(index !== -1) {
                        moduleDependencies.splice(index, 1);
                        index = moduleDependencies.indexOf(name);
                    }
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

};

/**
 * Constructs a reverse mapping of dependencies.
 *
 * @param dependenciesmap
 * @return {{}}
 */
Winter.prototype._depentants = function (dependenciesmap) {
    var dependants = {};
    Object.keys(dependenciesmap).forEach(function (name) {
        dependenciesmap[name].forEach(function (dependency) {
            dependants[dependency] = ( dependants[dependency] || [] ).concat(name);
        });
    });
    return dependants;
};

module.exports = Winter;