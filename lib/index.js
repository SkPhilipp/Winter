// TODO: promise-style loading and mapping, and support non-function instantiation

var ModuleMapper = require('./module-mapper');
var ModuleLoader = require('./module-loader');

var Winter = function () {
};

/**
 * Loads each and every module in the given config mapping.
 *
 * @param requirer
 * @param config
 * @return {*}
 */
Winter.prototype.load = function (requirer, config) {

    var mapper = new ModuleMapper();
    var loader = new ModuleLoader();

    var maps = mapper.map(requirer, config);
    var modules = maps.modules;
    var dependencies = maps.dependencies;
    var instantiatable = maps.instantiatable;
    var dependants = mapper.mapDepentants(dependencies);

    loader.link(modules, dependencies, instantiatable, dependants);

};

module.exports = Winter;