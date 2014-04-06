var ModuleMapper = function () {
};

var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
var FN_ARG_SPLIT = /,/;
var FN_ARG = /^\s*(_?)(\S+?)\1\s*$/;
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

/**
 *
 * @param modulename
 * @param loaded
 * @return {Array}
 */
ModuleMapper.prototype.dependencies = function (modulename, loaded) {
    if (loaded instanceof Function) {
        // We use AngularJS's function argument parsing to obtain the function's argument list
        var args = [];
        var uncommented = loaded.toString().replace(STRIP_COMMENTS, '');
        var declaration = uncommented.match(FN_ARGS);
        declaration[1].split(FN_ARG_SPLIT).forEach(function (arg) {
            arg.replace(FN_ARG, function (all, underscore, name) {
                args.push(name);
            });
        });
        return args;
    }
    else {
        throw new Error('[' + modulename + '] is not a function; could not parse dependencies.');
    }
};

/**
 * Constructs a reverse mapping of dependencies.
 *
 * @param dependenciesmap
 * @return {{}}
 */
ModuleMapper.prototype.mapDepentants = function (dependenciesmap) {
    var dependants = {};
    Object.keys(dependenciesmap).forEach(function (name) {
        dependenciesmap[name].forEach(function (dependency) {
            dependants[dependency] = ( dependants[dependency] || [] ).concat(name);
        });
    });
    return dependants;
};


/**
 *
 * @param {Function} loader a function that when given a config entry, returns its module
 * @param {Object} config
 * @return {{modules: {}, dependencies: {}, instantiatable: Array}}
 */
ModuleMapper.prototype.map = function (loader, config) {

    var self = this;
    var modules = {};
    // a mapping of modules with dependencies' names to dependency name lists
    var dependencies = {};
    // names of entries within `modules` we can load
    var instantiatable = [];

    // add each config item, require it, and get the arg names
    Object.keys(config).forEach(function (name) {
        // load each entry, read its dependency list and add those to the mapping
        var value = config[name];
        modules[name] = loader(value);
        dependencies[name] = self.dependencies(name, modules[name]);
        // modules with an empty dependency list can be marked as instantiatable immediately
        if (dependencies[name].length == 0) {
            instantiatable.push(name);
        }
    });

    return {
        modules: modules,
        dependencies: dependencies,
        instantiatable: instantiatable
    };

};

module.exports = ModuleMapper;
