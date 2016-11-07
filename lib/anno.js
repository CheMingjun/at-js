/*!
 * 
 * Author: CheMingjun
 */
'use strict';
var fs = require("fs"), path = require("path"), util = require('./util');
var annoReg = {}, getPtnFn = function (_anno) {
    return new RegExp("\\s?(//|['\"])@" + _anno
        + "\\s*\(\\([^)]*\\)\)?(['\"]\\s*;)?\\s*(var|let)\\s*(\\S+)\\s*=\\s*(function([\\*]?)\\s*\\(([^)]*)\\))?\\s*{", 'ig')
}, scan = function (_fpath, ct, anno, _func) {
    let proRtn = [];
    ct = ct.replace(getPtnFn(anno), function (_str,_b, _annoArgs, _e,_letVar, _varName, _funcSig, _gen, _args, _position) {
        let ctx = {filePath: _fpath, name: anno, refName: _varName, isGenerator: _gen && _gen === '*'};
        if (_annoArgs) {
            _annoArgs = _annoArgs.trim();
            if (_annoArgs != '') {
                let desc = {}, t = _annoArgs.substring(1, _annoArgs.length - 1).split(',');
                t.forEach(function (_a) {
                    let tt = _a.split('=');
                    if (tt.length != 2) {
                        throw new Error('The arguments in annotation error in file[' + _fpath + ']');
                    }
                    desc[tt[0].trim()] = tt[1].trim();
                })
                ctx['desc'] = desc;
            }
        }
        let args = [ctx], parg = [];
        if (_args) {
            _args = _args.trim();
            if (_args != '') {
                let t = _args.split(',');
                t.forEach(function (_a) {
                    let tt = _a.split('=');
                    if (tt.length == 1) {
                        parg.push(_a);
                    } else if (tt.length == 2) {
                        parg.push(tt[0]);
                    } else {
                        throw new Error('The arguments error in function[' + _varName + '] in file[' + _fpath + ']');
                    }
                })
            }
        }
        if (parg.length > 0) {
            args.push(parg);
        }
        let rtn = _func.apply(this, args);
        //let rtn = _gennerator === '*' ? _func.apply(this, args).next().value : _func.apply(this, args);
        if (typeof rtn === 'string') {
            if (_funcSig) {
                proRtn.push('\n' + _letVar + ' ' + _varName + '=function' + _gen + '(' + _args + "){\n"
                    + rtn + "\n}");
            } else {
                proRtn.push('\n;' + _letVar + ' ' + _varName + "=(function(){\n"
                    + rtn + "\n})()");
            }
        } else {
            return _str;
        }
    })
    return proRtn;
}
module.constructor.prototype.require = function (_fpath) {
    this.constructor._extensions['.js'] =analyze;
    if(typeof _fpath==='string'){
        return this.constructor._load(_fpath, this);
    }
}
//---------------------------------------------------------------------------------

module.exports = {
    reg: function (_name, _desc) {
        if (annoReg[_name]) {
            throw new Error('The annotation "' + _name + '" had registed.');
        }
        annoReg[_name] = _desc;
    },
    analyze: function (_module, _fPath) {
        let ct = fs.readFileSync(_fPath, 'utf8');
        if (getPtnFn('(\\S+)').test(ct)) {
            let exports = null, append = [];
            for (let anno in annoReg) {
                let aa = annoReg[anno];
                if (aa.scope === 'var') {
                    append.push(scan(_fPath, ct, anno, aa.build));
                } else if (aa.scope === 'file') {
                    if (getPtnFn(anno + '.(\\S+)').test(ct)) {
                        let obj = aa.build();
                        if (typeof obj !== 'object' || typeof obj.which !== 'object') {
                            throw new Error('The file annotation[' + anno + '] format wrong');
                        }
                        for (let k in obj.which) {
                            scan(_fPath, ct, anno + '.' + k, obj.which[k]);
                        }
                        let script = obj.script && obj.script();
                        if (typeof script === 'object') {
                            exports = script.exports || null;
                        }
                    }
                }
            }
            if (typeof exports === 'string') {
                ct += "\n module.exports = " + exports;
            }
            append.forEach(function (_ary) {
                if (_ary && _ary.length > 0) {
                    _ary.forEach(function (_script) {
                        ct += '\n' + _script;
                    })
                }
            })
            // if (_fPath.indexOf('transaction.js') !== -1) {
            //     console.log(ct);
            // }
        }
        try {
            _module._compile(ct, _fPath);
        } catch (err) {
            console.log('[Load file] "' + _fPath + '" error. \n' + err.stack);
        }
    }
}