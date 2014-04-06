/**
 *
 * @param name
 * @param mod
 * @constructor
 */
var ModuleProvider = function(name, mod){
    this._name = name;
    this._dependencies = this._parseDependencies(name, mod);
    this._module = mod;
    this._instance = null;
};

var FN_ARGS = /^function\s*[^\(]*\(\s*([^\)]*)\)/m;
var FN_ARG_SPLIT = /,/;
var FN_ARG = /^\s*(_?)(\S+?)\1\s*$/;
var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;

/**
 *
 * @param name
 * @param mod
 * @return {Array}
 */
ModuleProvider.prototype._parseDependencies = function (name, mod) {
    if (mod instanceof Function) {
        // We use AngularJS's function argument parsing to obtain the function's argument list
        var args = [];
        var uncommented = mod.toString().replace(STRIP_COMMENTS, '');
        var declaration = uncommented.match(FN_ARGS);
        declaration[1].split(FN_ARG_SPLIT).forEach(function (arg) {
            arg.replace(FN_ARG, function (all, underscore, name) {
                args.push(name);
            });
        });
        return args;
    }
    else {
        throw new Error('[' + name + '] is not a function; could not parse dependencies.');
    }
};

/**
 *
 * @return {Array}
 */
ModuleProvider.prototype.dependencies = function () {
    return this._dependencies;
};

/**
 *
 * @param {Array} providers
 * @param {String} [name]
 * @return {*}
 */
ModuleProvider.prototype.instantiate = function (providers, name) {
    var self = this;
    if(self._instance != null){
        return self._instance;
    }
    else{
        var parameters = [];
        self._dependencies.forEach(function (dependency) {
            parameters.push(providers[dependency].instantiate(providers, self._name));
        });
        if (self._module instanceof Function) {
            var instance = new (Function.prototype.bind.apply(self._module, [self._module].concat(parameters)));
            self._instance = instance;
            return instance;
        }
        else {
            throw new Error('[' + self._name + '] is not a function; could not instantiate.');
        }
    }
};

module.exports = ModuleProvider;