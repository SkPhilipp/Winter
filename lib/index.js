var Q = require('q');

var Winter = function () {
    this._providers = {};
    this._dependencies = {};
};

var ModuleProvider = require('./providers/module-provider');
var ValueProvider = require('./providers/value-provider');
var LoggerProvider = require('./providers/logger-provider');

Winter.ModuleProvider = ModuleProvider;
Winter.ValueProvider = ValueProvider;
Winter.LoggerProvider = LoggerProvider;

/**
 * Registers a single provider under a given name.
 *
 * @param name
 * @param provider
 */
Winter.prototype.register = function (name, provider) {
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
 * Links as much as possible within the given set of names
 *
 * @param names
 * @param dependants
 * @param spliceableDependencies
 * @private
 */
Winter.prototype._linkNext = function (names, dependants, spliceableDependencies) {
    var self = this;
    var next = [];
    var promises = [];
    names.forEach(function (name) {
        // time to instantiate
        var promise = Q(self._providers[name].instantiate(self._providers))
            .then(function () {
                // get the reverse mapping entry and delete it from the mapping
                var moduleDependants = dependants[name];
                if (moduleDependants != null) {
                    delete moduleDependants[name];
                    moduleDependants.forEach(function (dependant) {
                        // remove all instances of name ( usually, 1 ) from the dependants' dependencies
                        var moduleDependencies = spliceableDependencies[dependant];
                        var index = moduleDependencies.indexOf(name);
                        while (index !== -1) {
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
        promises.push(promise);
    });
    return Q.all(promises).then(function () {
        if (next.length > 0) {
            return self._linkNext(next, dependants, spliceableDependencies);
        }
    });
};

/**
 * Attempts to instantiate once for every provider.
 *
 * @return {*}
 */
Winter.prototype.link = function () {

    var self = this;

    // names of entries within `modules` we can load
    var instantiatable = [];
    Object.keys(self._dependencies).forEach(function (name) {
        if (self._dependencies[name].length == 0) {
            instantiatable.push(name);
        }
    });

    // map dependants and a copy of the depedencies mapping
    var dependants = self._depentants(self._dependencies);
    var spliceableDependencies = {};
    Object.keys(self._dependencies).forEach(function (key) {
        spliceableDependencies[key] = self._dependencies[key].slice();
    });

    // get the promise that recurses which does all the work
    self._linkNext(instantiatable, dependants, spliceableDependencies)
        .then(function () {

            // check for unresolved dependencies
            Object.keys(spliceableDependencies).forEach(function (dependant) {
                var unresolvedDependencies = spliceableDependencies[dependant];
                if (unresolvedDependencies.length > 0) {
                    console.error('Unresolved dependencies for', dependant, unresolvedDependencies);
                }
            });

        })
        .done();

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