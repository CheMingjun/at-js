/*!
 * Author: CheMingjun
 * [github](https://github.com/chemingjun/at-js)
 */


'use strict';
/**
 * Create reg pattern for scaning
 * @param _anno Annotation's name
 * @returns {RegExp}
 */
var ptnExp = function (_anno) {
    return new RegExp("\\s+(//|['\"])@" + _anno
        + "\\s*\(\\([^)]*\\)\)?(['\"]\\s*[;\r])?\\s*(var|let)\\s*(\\S+)\\s*=?\\s*(function\\s*(\\*?)\\s*\\(([^)]*)\\))?\\s*({|;)", 'ig')
}
var ptnFn = function (_anno) {
    return new RegExp("\\s+(//|['\"])@" + _anno
        + "\\s*\(\\([^)]*\\)\)?(['\"]\\s*[;\r])?\\s*function\\s*(\\*?)\\s*(\\S+)\\s*\\(([^)]*)\\)\\s*[{|;]", 'ig')
}
/**
 * Scan file if it has annotations
 * @param _fpath file's path
 * @param ct file's content
 * @param anno annotation name
 * @param _func process function
 * @returns {Array}
 */
var scan = function (_fpath, ct, anno, _func) {
    let proRtn = [];
    ct.replace(ptnExp(anno), function (_str, _b, _annoArgs, _e, _letVar, _varName, _funcSig, _gen, _args, _bodyB, _position) {
        if (_letVar === 'let') {
            throw new Error('"Let"(' + _letVar + ' ' + _varName + ') can not be describe in a annotation in file[' + _fpath + ']');
        }
        let ctx = {
            filePath: _fpath,
            name: anno,
            refName: _varName,
            refType: _gen && _gen === '*' ? 'generator' : (_funcSig ? 'function' : (_bodyB === '{' ? 'object' : 'undefined')),
            defType: _letVar
        };
        if (_annoArgs) {
            _annoArgs = _annoArgs.trim();
            if (_annoArgs != '') {
                let desc = {}, t = _annoArgs.substring(1, _annoArgs.length - 1).split('&');//url style,split by '&'
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
            proRtn.push('\n;' + _letVar + ' ' + _varName + "=(function(){"
                + rtn + "})()");
        } else {
            return _str;
        }
    }).replace(ptnFn(anno), function (_str, _b, _annoArgs, _e, _gen, _varName, _args, _bodyB, _position) {
        let ctx = {
            filePath: _fpath,
            name: anno,
            refName: _varName,
            refType: _gen && _gen === '*' ? 'generator' : 'function'
        };
        if (_annoArgs) {
            _annoArgs = _annoArgs.trim();
            if (_annoArgs != '') {
                let desc = {}, t = _annoArgs.substring(1, _annoArgs.length - 1).split('&');//url style,split by '&'
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
            proRtn.push('\n;function ' + _varName + "(){"
                + rtn + "}");
        } else {
            return _str;
        }
    })
    return proRtn.length > 0 ? proRtn : null;
}, mcpc = module.constructor.prototype.constructor;

//check if support the current node(>=v4)
if (typeof mcpc === 'undefined' || typeof mcpc._extensions !== 'object') {
    throw new Error('At-js not support the node version.');
}
var annoReg = mcpc['_annoReg_'];

//check if another at-js defined
if (typeof annoReg == 'undefined') {
    mcpc['_annoReg_'] = annoReg = {};
    //override parse javascript file
    mcpc._extensions['.js'] = function (_module, _fPath) {
        let ct = require("fs").readFileSync(_fPath, 'utf8');
        if (/'|"@\S+'|"[;]/.test(ct)) {
            let fileScript = null, append = [];
            for (let anno in annoReg) {
                let aa = annoReg[anno];
                if (aa.scope === 'var') {
                    let ts = scan(_fPath, ct, anno, aa.build);
                    if (ts) {
                        append.push(ts);
                    }
                } else if (aa.scope === 'file') {
                    if (ptnExp(anno).test(ct) || ptnFn(anno).test(ct)) {
                        let obj = aa.build();
                        if (typeof obj !== 'object' || typeof obj.which !== 'object') {
                            throw new Error('The file annotation[' + anno + '] format wrong');
                        }
                        for (let k in obj.which) {
                            let ts = scan(_fPath, ct, k, obj.which[k]);
                            if (ts) {
                                append.push(ts);
                            }
                        }
                        fileScript = obj.script && obj.script();
                    }
                }
            }
            if (typeof fileScript === 'string') {
                ct += "\n//enhanced by [at-js](https://github.com/chemingjun/at-js)\n;(function(){\n" + fileScript + '\n})()';
            }
            append.forEach(function (_ary) {
                if (_ary && _ary.length > 0) {
                    _ary.forEach(function (_script) {
                        ct += '\n' + _script;
                    })
                }
            })
        }
        try {
            // if(/extention.js$/i.test(_fPath)){
            //     console.log(ct);
            // }
            _module._compile(ct, _fPath);
        } catch (err) {
            console.log('[Load file] "' + _fPath + '" error. \n' + err.stack);
        }
    };
}

//---------------------------------------------------------------------------------
module.exports = {
    def: function (_name, _desc) {
        if (annoReg[_name]) {
            throw new Error('The annotation "' + _name + '" had registed.');
        }
        annoReg[_name] = _desc;
    }
}