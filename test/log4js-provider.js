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
        return log4js.getLogger(name);
    }
};

module.exports = Log4jsProvider;