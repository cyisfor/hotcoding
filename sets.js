function StringSet(init) {
    var set = Object(null);
    this.set = set;
    this.length = 0;
    console.log('init'+init);
    if(init) {
        var that = this;
        init.forEach(function (item) {
            that.add(item);
        });
    }
}

for(var name in Object) {
    console.log("o "+name);
}

StringSet.prototype.add = function(item) {
    this.set[item] = true;
    this[this.length++] = item;
}

StringSet.prototype.forEach = function(next) {
    Object.getOwnPropertyNames(this.set).forEach(next);
}

StringSet.prototype.every = function(next) {
    return Object.getOwnPropertyNames(this.set).every(next);
}

exports.StringSet = StringSet;
