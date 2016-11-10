#at-js
 [(中文)](./readme-zh.md)
>The annotation framework for javascript/node.js

##Javascript annotation type(not decorator type in ES6)
As we know,the Annotation type is not surport in javascript language.The at-js framework made it posible.
For example,use at-js, you can write the code like this:

```js
'@logger';
var myLogger = {
    info:function(_msg){
        console.log(_msg);
    }
}
```
And,you can use it like a real annotation:
```js
//@logger
var myLogger = {
    info:function(_msg){
        console.log(_msg);
    }
}
```

If you want to use the annotation above,first you should define the annotation like this:

```js
require('at-js').define('logger',{//annotation's name
    scope: 'var', build: function () {//the scope of it's effected
        return "return require('at-js/lib/util').log();"//the real script
    }
})
```
Finally,at runtime,at-js cover the origin code like this:
```js
var myLogger = (
  function(){return require('at-js/lib/util').log();}
)();
```

Is it interesting?
Use anthor framework at-test(base on at-js),you could test your code like this:

```js
var assert = require('assert');
var ds = null;

'@test.start';
var start = function () {
    ds = {};
}

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

'@test.step';
var test1 = function () {
    ds.test1 = 'finish';
    return ds;
}

'@test.finish';
var fh = function () {
    ds = null;
}
```