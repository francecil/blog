## 前言

我们需要遍历`.lyad`的元素,并将其`className`中的`lyad`删掉。 


<!--more-->


最开始的做法是

```js
var s = 'lyad'
var eles = document.querySelectorAll('.'+'s');
for (var j = 0,len=eles.length; j < len; j++) {
  eles[j].className = eles[j].className.replace(s, '')
}
```

> 没有任何问题。

查询文档以及自测，发现 `getElementsByClassName` 的速度比 `querySelectorAll` 快很多，5倍以上。

为了性能考虑，我们改为以下写法：

```js
var eles = document.getElementsByClassName(s)
for (var j = 0,len=eles.length; j < len; j++) {
  eles[j].className = eles[j].className.replace(s, '')
}
```

不出意外，会报`Cannot read property 'className' of undefined` 错误。

观察发现，一开始 eles 为四个，在访问`eles[2]`的时候出错,说明此时`eles.length===2`，访问了一个空元素。

即， getElementsByClassName 得到的元素其对应className 被删掉的话，eles 会自动删去其元素。

做个测试：

```js
var eles = document.getElementsByClassName('lyad')
console.log(eles.length) //4
eles[0].className = eles[0].className.replace('lyad', '')
console.log(eles.length) //3
```

## 以下写法都是ok的



```js
var eles = document.getElementsByClassName('lyad')
while(eles.length>0){
  eles[0].className = eles[0].className.replace('lyad', '')
}
```

注意 eles 获取要用 `getElementsByClassName` 而不是 `querySelectorAll` 否则将导致死循环。

```js
var eles = document.getElementsByClassName('lyad')
for (var j = 0,len=eles.length; j < len; j++) {
  eles[0].className = eles[0].className.replace('lyad', '')
}
```

注意 len 需要用临时变量保存，否则每次获取将会得到不同的 length 导致提前结束。

相比上一种写法更安全。