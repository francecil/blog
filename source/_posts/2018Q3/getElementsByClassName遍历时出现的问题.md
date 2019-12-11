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

## 补充

上面写法有差异，在于NodeList对象的不同表现。

>大多数情况下，NodeList 对象都是个实时集合。
>
>意思是说，如果文档中的节点树发生变化，则已经存在的 NodeList 对象也可能会变化。
>
>在另一些情况下，NodeList 是一个静态集合，也就意味着随后对文档对象模型的任何改动都不会影响集合的内容。document.querySelectorAll 返回一个静态的 NodeList。

引用自：https://developer.mozilla.org/zh-CN/docs/Web/API/NodeList

同时，这也解释了为何`getElementsByClassName`获取NodeList的速度比`querySelectorAll`快。

因为前者仅返回 **列表的引用地址** 仅访问时才实时获取数据 , 而后者一开始就要获取和封装所有数据。

>DynamicNodeList 对象通过在cache缓存中 注册它的存在 并创建。 从本质上讲, 创建一个新的 DynamicNodeList 是非常轻量级的, 因为不需要做任何前期工作。 每次访问 DynamicNodeList 时, 必须查询 document 的变化, length 属性 以及 item() 方法证明了这一点(使用中括号的方式访问也是一样的).

>相比之下, StaticNodeList 对象实例由另一个文件创建,然后循环填充所有的数据 。 在 document 中执行静态查询的前期成本上比起 DynamicNodeList 要显著提高很多倍。

参考：<a href="https://blog.csdn.net/renfufei/article/details/41088521">DOM中的动态NodeList与静态NodeList</a>