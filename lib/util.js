/*!
 * Toybricks
 * Copyright(c) 2016
 */
var fs = require("fs"), path = require("path");
var logStack = [], logProxy = {
    debug: function (_msg) {
        logStack.push({time: new Date(), type: 'debug', msg: _msg});
        invokeLogger();
    }, info: function (_msg) {
        logStack.push({time: new Date(), type: 'info', msg: _msg});
        invokeLogger();
    }, warn: function (_msg) {
        logStack.push({time: new Date(), type: 'warn', msg: _msg});
        invokeLogger();
    }, error: function (_msg) {
        logStack.push({time: new Date(), type: 'error', msg: _msg});
        invokeLogger();
    }, trace: function (_msg) {
        logStack.push({time: new Date(), type: 'trace', msg: _msg});
        invokeLogger();
    }
}, invokeLogger = function () {
    if (logStack.length == 0) {
        return;
    }
    setTimeout(function () {
        logStack.forEach(function (_log) {
            myLogger[_log.type](_log.time, _log.msg);
        })
        logStack = [];
    })
};

var dfn = function (_dt, fmt) {
    fmt = fmt || 'yyyy-MM-dd hh:mm:ss';
    var o = {
        "M+": _dt.getMonth() + 1,
        "d+": _dt.getDate(),
        "h+": _dt.getHours(),
        "m+": _dt.getMinutes(),
        "s+": _dt.getSeconds(),
        "q+": Math.floor((_dt.getMonth() + 3) / 3),
        "S": _dt.getMilliseconds()
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (_dt.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}, logColor = {
    'INFO':'\033[32m','WARN':'\033[33m','ERROR':'\033[31m','TRACE':'\033[36m'
},lfn = function (_dt, _t, _m) {
    if(/^(\n)*$/ig.test(_m)){
        console.log(_m);
    }else{
        console.log(logColor[_t],'[' + dfn(_dt) + '][' + _t + ']' + _m,'\x1b[0m');
    }
}
var myLogger = {
    debug: function (_dt, _m) {
        lfn(_dt, 'DEBUG', _m);
    }, info: function (_dt, _m) {
        lfn(_dt, 'INFO', _m);
    }, warn: function (_dt, _m) {
        lfn(_dt, 'WARN', _m);
    }, error: function (_dt, _m) {
        lfn(_dt, 'ERROR', _m);
    }, trace: function (_dt, _m) {
        lfn(_dt, 'TRACE', _m);
    }
}

//----------------------------------------------------------------------
module.exports = {
    init: function (_logFn) {
        var lgImpl = typeof _logFn === 'function' ? _logFn() : null;
        if (typeof lgImpl === 'object'
            && typeof lgImpl.debug === 'function'
            && typeof lgImpl.info === 'function'
            && typeof lgImpl.warn === 'function'
            && typeof lgImpl.error === 'function') {
            myLogger = {
                debug: function (_dt, _m) {
                    lgImpl.debug(_m);
                }, info: function (_dt, _m) {
                    lgImpl.info(_m);
                }, warn: function (_dt, _m) {
                    lgImpl.warn(_m);
                }, error: function (_dt, _m) {
                    lgImpl.error(_m);
                }, trace: function (_dt, _m) {
                    lgImpl.trace(_m);
                }
            };
        } else {
            throw new Error('Logger format error.');
        }
    },
    is: {
        array: function (_o) {
            return Object.prototype.toString.call(_o) == '[object Array]';
        }, generator: function (_o) {
            return typeof _o == 'object' && typeof _o.next == 'function' && typeof _o.throw == 'function';
        }
    },
    log: function () {
        return logProxy;
    },
    path: {
        modulePath: function (_fpath) {
            var dirPath = path.dirname(_fpath);
            var ts = './', tp = path.join(dirPath, ts + 'package.json');
            while (tp != '' && !fs.existsSync(tp)) {
                ts += '../';
                tp = path.join(dirPath, ts + 'package.json')
            }
            return path.dirname(tp);
        }
    }
}