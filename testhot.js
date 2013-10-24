var hot = require('hot');
hot.require('testok',function (module) {
    console.log(module);
    console.log("Module testok loaded! "+module.time);
    console.log("same thing now: "+hot.require('testok').time);
    hot.reload('testok', function (module) {
        console.log('reloaded! '+module.time);
        hot.require('testbad',function(module) {
            console.log("We'll get here 50% of the time.");
            if(module instanceof Error) {
                console.log("Though it erred! "+module);
            }
            try {
                hot.require('nothingasdpuhogcdhi',function (module) {
                    console.log("module is an error:",module instanceof Error,module);
                    process.exit(0);
                });
            } catch(e) {
                console.log('um');
            }
        });
    });
});
