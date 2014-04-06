var ValueProvider = function (value) {
    this.value = value;
};

ValueProvider.prototype.dependencies = function () {
    return [];
};

ValueProvider.prototype.instantiate = function () {
    return this.value;
};

module.exports = ValueProvider;