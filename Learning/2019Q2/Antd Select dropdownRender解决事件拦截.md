## 前言

官方
https://github.com/ant-design/ant-design/issues/14639

https://github.com/ant-design/ant-design/issues/13448

## 事件传递

```html
<div id="div">
  <span id="span">
    <input id="input" placeholder="test"/>
  </span>
</div>
```
```js
document.getElementById("span").addEventListener("mousedown",(e)=>{
	console.log(3,e)
  e.preventDefault()
},false)
document.getElementById("input").addEventListener("mousedown",(e)=>{
	console.log(2,e)
  e.stopPropagation()
},true)
```

Select 就好比 span, 冒泡拦截了 mousedown 并 preventDefault，并且还会触发 下拉菜单的关闭

所以在 input 的时候, 进行事件的取消传递。
