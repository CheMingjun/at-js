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
var anno = require('./lib/anno');
//---------------------------------------------------------------------------------------------
var Rtn = {};
module.exports = Rtn;
/**
 * define a  annotatioin
 * @param _name
 * @param _impl
 */
Rtn.define = function () {
    anno.def.apply(this, Array.prototype.slice.call(arguments));
    return Rtn;
};