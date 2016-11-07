/*!
 * Toybricks
 *
 * Javascript annotarion framework
 * <p>Annotaion not decorator(in ES6),most of the time,decorate is not enough.</p>
 *
 * Copyright(c) 2016
 * Author: CheMingjun <chemingjun@126.com>
 */
'use strict';
var assert = require('assert').ok,anno = require('./lib/anno');
//---------------------------------------------------------------------------------------------
var toybricks = {};
module.exports = toybricks;
/**
 * The configuaration of Toybricks
 * @param _cfg {logger}
 */
toybricks.config=function (_cfg) {
    var util = require("./lib/util")
    if (typeof _cfg === 'object') {
        if (typeof _cfg.logger === 'function') {
            util.init(_cfg.logger);
        }
        if (util.is.array(_cfg.annotations)) {
            _cfg.annotations.forEach(anno.reg);
        }
    }
};
/**
 * register new annotatioin
 * @param _name
 * @param _impl
 */
toybricks.regAnnotation = anno.reg;
//---------------------------------------------------------------------------
toybricks.regAnnotation('logger',{
    scope: 'var', build: function () {
        return "return require('toybricks/lib/util').log();\n"
    }
})
