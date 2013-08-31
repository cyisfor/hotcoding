var ss = require('sets');
var fs = require('fs');

var requires = Object(null);
var required = Object(null);

var cache = Object(null);
var pathCache = Object(null);

prefixes = [""];

// timeout IDs for various paths waiting for stability, to reload.
var watcherderps = Object(null);

function reload(name,next) {
    cache[name] = undefined;
    hotrequire2(name,next);
    guys = requires[name];
    if(guys) {
        guys.forEach(function (guy) {
            if(guy != ".") {
                reload(guy);
            }
        });
    } else {
        requires[name] = new ss.StringSet();
    }
}

function hotrequire(name,next) {
    var guy = module.parent;
    if (guy) {
        guy = guy.id;
        var guys = requires[name];
        if(guys) {
            guys.add(guy);
        } else {
            requires[name] = new ss.StringSet([guy]);
        }
    }
    return hotrequire2(name,next);
}

function hotrequire2(name,next) {
    if(cache[name]) {
        if(next) next(cache[name]);
        else return cache[name];
    } else {
        var vm = require('vm');
        function getPath(next) {
            var path = pathCache[name];
            if(path) {
                next(path);
            } else {
                base = name + ".js";
                function check(i) {
                    var prefix = prefixes[i];
                    if(prefix == undefined) {
                        next(new Error ("Could not find module "+name));
                        return;
                    }
                    var lpath = prefix + base;
                    console.log("looking for "+lpath);
                    fs.exists(lpath,function (exists) {
                        if(exists) {
                            pathCache[name] = lpath;
                            next(lpath);
                        } else {
                            check(i+1);
                        }
                    });
                }
                check(0);
            }
        }    

        function gotPath(path) {
            if(path instanceof Error) {
                next(path);
                return;
            }
            // siracha sauce!!
            fs.watch(path).on('change',function(eventt,filename) {
                var oldID = watcherderps[path];
                if(oldID) {
                    clearTimeout(oldID);
                }
                watcherderps[path] = setTimeout(function () { reload(name); },1000);
            });

            // Test the file first, to make sure it runs right on its own!

            var cp = require('child_process');
            cp = cp.spawn('node');
            var parenttimeout;
            cp.on('close',function (statuss) {
                clearTimeout(parenttimeout);
                console.log("Closed fido "+statuss);
                if(statuss == 0) {
                    fs.readFile(path,function (err, code) {
                        if(err) next(err);
                        module = {exports: Object(null), console: console}
                        result = vm.runInNewContext(code,module,path);
                        cache[name] = module;
                        console.log(name+ " compiled.");
                        // THIS IS THE FINAL NEXT
                        if(next) next(module);
                    });
                } else {
                    next(new Error("test failed on "+name));
                    return;
                }
            });

            // 10 seconds before assumed failure.
            cp.stdin.write("setTimeout(function() { process.exit(3); }, 1000);\n");
            cp.stdin.write("console.log('wakka wakka');\n");
            var stream = fs.createReadStream(path,{encoding: 'utf-8'});
            stream.on('end',function() {
                cp.stdin.write("\nprocess.exit(0);\n");
                cp.stdin.end();
                parenttimeout = setTimeout(function() { console.log('KILL FIDO'); cp.kill(); },12000);
            });
            stream.pipe(cp.stdin);
        }

        getPath(gotPath);
    }
}

exports.require = hotrequire;
exports.reload = reload;
