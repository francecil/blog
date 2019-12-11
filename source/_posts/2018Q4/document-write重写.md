## 前言
本文介绍的document.write重写方法，会放在文档头部执行，且不影响原先document.write的执行时间点。内部执行不再采用document.write

## document.write的奇妙用法
html文档是边解释边执行的，所以write一部分时，会把这部分放入html解析器中。

若没有后续write，可能会把js代码断作为html节点内容的一部分
```js
<script>
document.write("<script>")
// 没有及时写入<\/script>
var a = 1;
// 上面的代码会变成<script>代码中的一部分
```

这里我们假设用户的document.write用法是正确的，即write了开标签，如果不write闭标签会出错的话 后面一定会write闭标签。

**对于单个节点的write(无父节点等复杂情况)**,考虑以下几种情况
1. 仅写入开标签，但必要的闭标签在下一个document.write中
2. 仅写入开标签，但闭标签非必要
3. 存在script标签
4. 写入标签未闭合，例：`<di` 暂未能判断是文本还是标签

### 情况1处理
> 仅写入开标签，但必要的闭标签在下一个document.write中

维护一个 需要必要闭标签的标签列表，第一个write写入了开标签，此时将其暂存，在第二个write的时候再补上 `str=leLabel+str`

### 情况2处理
> 仅写入开标签，但闭标签非必要

第一个write写入了开标签，但该标签不在`需要必要闭标签的标签列表`中,此时将其暂存，在第二个write的时候再补上 `str=leLabel+str`

### 情况3处理
>  存在script标签

先写入script前的内容，然后append script 再继续处理script后的内容


### 情况4处理
> 写入标签未闭合，例：`<di` 暂未能判断是文本还是标签

```js
<script>
document.write("<spa")
console.log(555)
document.write("n>dsdas</span>")
</script>
```

将其当成标签，暂不写入内容，在下一次document.write的时候，先判断上下文。

若处于不同currentScript,说明上一未闭合标签是普通文本，需要补上文本

否则检测本次write的文本 是否以`xx>` 开头，且`(document.createElement(标签名)).__proto__ instanceof HTMLUnknownElement === false`则说明为标签，否则为普通文本

第三方库里面用的自定义元素，`(document.createElement(标签名)).__proto__ instanceof HTMLElement === true`

#### 拓展知识：未知元素与自定义元素
- 未知元素
> `<unknownelement>`
> 
> HTML规范中将没有定义的元素作为HTMLUnknownElement进行解析。


- 自定义元素
> `<unknown-element>`
>
> 自定义元素则并非如此。如果在创建时使用有效的名称（包含“-”），则潜在的自定义元素将解析为 HTMLElement 。