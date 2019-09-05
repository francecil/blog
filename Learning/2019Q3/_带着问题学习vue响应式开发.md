##  1. 双向绑定的对象整个被替换，其下属性值不变，会再触发渲染么？

```js
user:{
  name: 'a'
}
// 执行了 this.user = {name:'a'} 后，会发生什么
// 执行了 this.user.name = 'a' 后，会发生什么
```
前者触发更新，后面不触发

触发了

## 2. 如何向已有对象添加多个属性

添加单个属性可以利用 `$set(object, key, value)`,如 `this.$set(this.user, 'sex', 0)`,
那么，同时添加多个属性呢？

`Object.assign`: 将所有可枚举属性的值从一个或多个源对象复制到目标对象

对于已存在的双向绑定对象 user
```js
{
  name: (...),
  __ob__: Observer {value: {…}, dep: Dep, vmCount: 0}
  get name: ƒ reactiveGetter()
  set name: ƒ reactiveSetter(newVal)
  __proto__: Object
}
```
调用 `Object.assign(user,{sex:0})` 后，user 只是变成了如下
```js
{
  name: (...),
  sex: 0,
  __ob__: Observer {value: {…}, dep: Dep, vmCount: 0}
  get name: ƒ reactiveGetter()
  set name: ƒ reactiveSetter(newVal)
  __proto__: Object
}
```
新增属性不会触发更新，所以正确的做法是：把 user 的属性和新增的属性 一起传递个一个新的对象，再赋给 `user`

当 user 发现值（引用）变动，会重新进行双向绑定，具体看 #1

## 3. 数组元素重新赋值

```js
list:[1,2,3]
// 执行了 this.list[0] = 0 后，会发生什么
```

结果是值可以改，但不会触发更新。

可以通过
```js
this.$set(this.list,'0',0)
//or
this.list.splice(0,1,0)
```
解决，但是为什么 vue 不支持索引修改值呢？

## 4. vue 的 nexttick 原理是什么,能不能用 promise 或者 settimeout 代替

