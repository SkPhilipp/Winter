var Q = require('q');
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
        var deferred = Q.defer();
        setTimeout(function(){
            deferred.resolve(log4js.getLogger(name));
        }, 100);
        return deferred.promise;
    }
};

module.exports = Log4jsProvider;