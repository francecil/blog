# 变量提升

```
foo() //TypeError
var foo = function(){}
/*
foo会被提升到全局，其运行顺序是这样的：
var foo
foo() //TypeError
foo = function(){}
*/

foo2() //ReferenceError
let foo = function(){}

if(!obj in window){
	var obj = 3 
}
console.log(obj)
//obj编译的时候会被提到全局,实际效果是：
var obj
if(!obj in window){
	obj = 3 
}
console.log(obj)
```

# 作用域闭包

想用iife循环输出1~5
```
for(var i =1;i<=5;i++){
	(function(){
		setTimeout(function(){console.log(i)},1000)
	})()
}
//输出5次6
```

这样是不行的，原因在于这个iife中的作用域是空的，setTimeout的执行顺序在循环之后，故又会去拿全局的i

所以需要传入当前的i到iife的作用域，setTimeout执行的时候就去取这个临时变量了

```
for(var i =1;i<=5;i++){
	(function(i){
		setTimeout(function(){console.log(i)},1000)
	})(i)
}
```

# 块作用域

想实现es6这样的效果
```
{
let a = 2;
console.log( a ); // 2
} console.log( a ); // ReferenceError
```

非es6环境下可以这样

```
try{throw undefined;}
catch(a){
	a = 2;
	console.log( a ); // 2
}
```
