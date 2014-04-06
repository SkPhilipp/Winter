var log4js = require('log4js');

var Log4jsProvider = function(){
};

Log4jsProvider.prototype.dependencies = function () {
    return [];
};

/**
 *
 * @param {Array} providers
 * @param {String} [name]
 * @return {Logger}
 */
Log4jsProvider.prototype.instantiate = function (providers, name) {
    console.log('being required for name:' + name);
    if(name == undefined){
        return null;
    }
    else{
        return log4js.getLogger(name);
    }
};

module.exports = Log4jsProvider;