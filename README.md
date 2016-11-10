#at-js（为 Javascript 扩展的注释类型）
 [(English)](./readme-en.md)
>为 Javascript/node.js 扩展的注释类型

**Javascript annotation 类型(非 decorator type in ES6)**  
Annotation的意义在于为语言增加了一个新的维度，
"注释类型"（annotation）在JS中并非天然支持，
"decorator"类型（ES6）的能力在很多情形下是远远不够的，
比如，decorator很难描述单元测试事务性复杂描述表达。  
at-js的目的是为JS/node引入真正意义的annotation。

## 安装at-js
```
npm install at-js
```
##使用案例
1. 在您的module`入口文件`中，定义"helloworld"注释
>入口文件即您的module启动的第一个文件
```js
require('at-js').define('helloworld',{//annotation's name
    scope: 'var', build: function () {//the scope of it's effected
        return "return function(_msg){console.log('[helloworld]'+_msg);};"//the real script
    }
})

/*接下来引用并执行使用该注释的js文件
注意，这个引用要在require('at-js')之后
 */
require('./test').test();
```
2. 在**test.js**文件中使用helloworld注释
```js
module.exports = {
    test:function(){
        var info = 'hello hello';
        sayHello(info);
    }
}
'@helloworld';
var sayHello = function(){}
```

来看一个复杂的例子，如果您使用基于at-js的开源框架 **[at-test](https://github.com/CheMingjun/at-test)**
,您可以这样来表达一个单元测试:

```js
var assert = require('assert');
var ds = null;
//测试开始时的准备工作
'@test.start';
var start = function () {
    ds = {};
}
//阶段1
'@test.step(timeout=2000)';
var test0 = function* () {
    ds.test0 = 'finish';
    var rtn = yield (function(){
        return function(_next){
            setTimeout(function(){
                _next(null,3);
            },2000)
        }
    })();
    assert.equal(rtn,3);
}
//阶段2
'@test.step';
var test1 = function () {
    ds.test1 = 'finish';
    return ds;
}
//测试结束时的工作
'@test.finish';
var fh = function () {
    ds = null;
}
```
##API
###安装
```
$ npm install at-js
```
###定义注释
```js
var atJs = require('at-js');

//举例
atJs.define('myAnno',{//name
    scope: 'var', build: function () {//value
        return "return {name:'I am name property'};"
    }
})
```
at-js通过define(name,value)的形式定义一个（组）注释

**name** 注释名称，全局唯一，在 scope='file' 情形下，
name应该为一组具备相同特征的annotation的正则表达式字符串，
如: name='test.\\S+'

**value**  at-js目前（version 1.2.1）支持两种范围的注释：

1. var 变量型注释
```js
    {
        scope:'var',
        build:function(_ctx, _argAry){
            //_ctx
            {
                filePath,//应该该注释的文件位置
                name,//注释名称
                desc,//注释中的变量表(key-value)
                refName,//被注释的变量名称
                refType//被注释的变量类型（undefined|function|generator|object）
            }
            //_aryAry 被注释变量签名中的参数列表
        
            return //返回该变量被替换之后的代码
        }
    }
```

2. file 文件型注释
```js
    {
        return {
            which: {//针对改组annotation中的每一项做处理
                'test.start': function (_ctx, _argAry) {
                    //_ctx 与 _argAry 同上定义
                    //处理逻辑
                }
            }, script: function () {
                return //返回该文件追加的代码
            }
        }
    }
```
file 型注释的实际例子，可以参考 [at-test](https://github.com/CheMingjun/at-test)源码

###使用注释
```js
//注释可以通过
'@任意非空白字符';
//也可以使用
//@任意非空白字符

//简单的注释
'@myAnno';
var someVar = function(){

}

//带参数的注释
'@myAnno(name=somevalue)';
var someVar = function(){

}

//多个参数的注释,url风格的参数表，多个以&分开
'@myAnno(name=somevalue&for=v0,v1)';
var someVar = function(){

}

//除function之外，被注释的变量可以是undefined
'@myAnno';
var someVar;

//被注释的变量可以是function* 
'@myAnno';
var someVar = function*(){
    yield sleep(2000);
};

//被注释的变量可以是{}
'@myAnno';
var someVar = {
    origin:function(){
        
    }
};
```
##基于at-js的实用框架
[at-test](https://github.com/CheMingjun/at-js)  单元测试

[at-dao](https://github.com/CheMingjun/at-dao) 数据库接入

> 欢迎提issue，或者直接联系作者即时交流(微信号:ALJZJZ) 