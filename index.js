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
 * Define an annotatioin
 * @param _name The annotation(group)'s name
 * @param _builder Builder for the annotation
 */
Rtn.define = function () {
    anno.def.apply(this, Array.prototype.slice.call(arguments));
    return Rtn;
};
