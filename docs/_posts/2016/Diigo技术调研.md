---
title: Diigo技术调研
date: 2016/10/21 11:00:00
tags: 
  - HTML
permalink: /pages/000186/
categories: 
  - 随笔
sidebar: auto
---

# 简介：

 Diigo：像在本子上一样为网页做笔记，后面再进入(本地)该页面会显示原来做的笔记

<!--more-->

# 功能调研

## 功能一：选择一段文字 可以设置背景颜色

diigo不支持选择文字的再选择，我们调研时 做成可再选择的。

比如一段

```html
    <div class="test">
        <p>对于选中的一段文本 应该记录其在dom节点的所有段 给其加标签</p>
        
        <ol>
            什么鬼啊
            <li>回复数阿飞</li>
            666
            <li>找商店帖</li>
            <li>言论是对的，在100年</li>
        </ol>
    </div>
```

然后选中了
```

                                                 有段 给其加标签</p>
        
        <ol>
            什么鬼啊
            <li>回复数阿飞</li>
            666
            <li>找商
```
如果是直接输出 `window.getSelection()` 的话是 `有段 给其加标签什么鬼啊回复数阿飞666找商`
与标签无关，没有任何意义
这时候应该按如下步骤去操作：

### 获取Range
```js
var range=window.getSelection().getRangeAt(0);
```

什么是Range及用法请参考[这里][1]

### 利用Range得到选中文字两端所在的dom节点
```js
    var startNode = range.startContainer; //得到‘选择文字’左部所在的容器节点(文本节点，nodeType=3)
    //如这边startNode.nodeName是#text 而不是p
    var endNode = range.endContainer; 
    //文本节点获取其父节点：Element节点 用parentElement 也可以
    //不能只记录父节点，需要记录父节点的第几个#TEXT 因为文本节点的父节点不一样只有一个child文本节点 如本例中的<ol>
    //不能记录文本节点，因为getElementsByTagName不支持search #TEXT
    var startParentNode = startNode.parentNode;
    var endParentNode = endNode.parentNode;
```


### 获取两个dom节点之间的有效节点

`选择文字` 会经过多个节点，我们需要把每个节点都记录下来,给其中的`text节点加style`
***所谓的有效节点就是指 dom树的`前序遍历叶子节点序列`中，所得两个节点之间的所有非空text节点***
text节点【**nodeType=3**】是普遍存在于dom中的
```html
    <div class="test">
    			<p>对于选中的一段文本 应该记录其在dom节点的所有段 给其加标签</p>
    
    			<ol>
				什么鬼啊
				<li>回复数阿飞</li>
				666
				<li>找商店帖</li>
				<li>言论是对的，在100年</li>
			</ol>
    		</div>
```
通过输出 `console.log($(".test")[0].childNodes);` 我们发现结果为
```
[text, p, text, ol, text]0: text1: p2: text3: ol4: textlength: 5__proto__: NodeList
```
即 **Element节点之间存在的空白也是会成为text节点** 的，因为显然 我们有时候写文字没加标签

所以我们递归遍历的时候需要判断下是否为有效的text节点

**要点：**

1. startNode和endNode 需要切分文本
2. 通过两个flag:startSearched,endSearchde设置是否当前节点为有效节点，并可以及时退出搜索
3. 通过搜索函数的返回值来判断是否需要跳跃节点：见注释


```js
                        var startSearched = false,endSearched = true;
    					var startOffset = range.startOffset;
    					var endOffset = range.endOffset;
    					//要特判下start和end在同一节点的情况
    					function traversal(node) {
    						//对textNode的处理
    						if(!endSearched) return 2;
    						if(startSearched && endSearched && node && node.nodeType === 3) {
    							if($.trim(node.nodeValue).length > 0) {
    								//如果text节点为start or end 可能需要切分为2个text节点 只需设置我们满足的节点
    								if(node == startNode) {
    									node.splitText(startOffset); //分割成两个文本节点，取第二个
    									var nextNode = node.nextSibling;
    									changeBgColor(nextNode);
    									return 1;
    								}
    								if(node == endNode) {
    									node.splitText(endOffset); //分割成两个文本节点，取第1个 当前这个
    									changeBgColor(node);
    									return 2;
    								}
    								console.log("正常节点：" + node.nodeValue);
    								changeBgColor(node);
    							}
    							return 0;
    						}
    						var i = 0,
    							childNodes = node.childNodes,
    							item;
    						//x注：start or end 节点做了分割后，这边会实时改动
    						//所以要根据traversal的返回值判断是否做分割
    						//#TEXT <span>#TEXT</span> #TEXT 的情况下 访问第二个TEXT的再次做了分割取右部，length不会改 因为span是作为一个节点;
    						//当取了第三个#TEXT的时候 不用管length了 看返回值直接break
    						//现在考虑左部的情况，如果是从第一个#TEXT 右边开始取，分割后length会+1,设置个flag 让程序自动跳过一次
    						var flag = false;
    						for(; i < childNodes.length; i++) {
    							item = childNodes[i];
    							//递归先序遍历子节点
    							if(flag) {
    								flag = false;
    								continue;
    							}
    							if(item == startNode) startSearched = true;
    							var result = traversal(item);
    							if(item == endNode) endSearched = false;
    							if(result === 2) break;
    							if(result === 1) flag = true;
    						}
    					};
    					traversal(document);
```
### 记录节点信息，再次加载页面时可快速访问并修改其 `style`

 上一步得到了满足要求的节点。
  首先是保存父节点的`tagName`和`index`以及子文本节点的childIndex。
  选择通过记录tagName及document.getElementsByTagName列表的index值，下次可以同理快速得到。
```js
    var list = document.getElementsByTagName(currentNode.tagName);
    console.log(list.length);
    for(i=0;i<list.length;i++)
    	if(list[i]==currentNode){console.log(i);break;}



    //获取子节点的Index位置
    function getNodeInChildIndex(par,child){
        var list = par.childNodes;
        for(i=0;i<list.length;i++){
            if(list[i]==child)return i;
        }
        return 0;
    }
``` 

 然后是起始和终止节点中文本选择的起点startOffset和终点endOffset
```js
    //range.startOffset:startNode中选择文字左部的偏移值
    //range.endOffset:endNode中选择文字右边的偏移值
    console.log(range.startOffset+" "+range.endOffset);
```

所以只要首尾两个节点做下处理，其他节点默认全部文字

### 样式加载
```js
    //传入的节点必须为文本节点，如果是start or endNode 需要传入切割后的节点
    function changeBgColor(node) {
    	console.log("changeBgColor:" + node.nodeValue);
    	var par = node.parentNode;
    	var spanEle = document.createElement("span");
    	spanEle.style.backgroundColor = 'red';
    	spanEle.appendChild(node.cloneNode(false));
    	//使用替换节点的方法
    	par.replaceChild(spanEle, node);
    };
```
### 边界处理

情况1：startNode 和 endNode 为同一节点
```js
                        //要特判下start和end在同一节点的情况
    					if(startNode==endNode){
    						//点击的话，两个offset值一样，为了不切分文本节点，这边应该返回
    						if(startOffset==endOffset)return;
    						endNode.splitText(endOffset);
    						var resultNode=endNode.splitText(startOffset);
    						changeBgColor(resultNode);
    						return;
    					}
```

### 功能备注

这边实现的只是diigo功能的一小部分，给文字换背景颜色之外，还可以基于该`‘选择文字’`贴笔记，位置是基于‘选择文字的’。
不过这边不再研究，直接转向更有难度的功能二。

## 功能二：网页即时贴组件,页面上的任意一个位置都可以贴上自己的笔记贴

> 大致搜了一下，网上有开源实现`react-stickynode` 不过自己先试着实现下吧，后面再去看别人的实现。

测了一下，diigo采用绝对定位。
不用考虑兼容分辨率的原因：自适应是由访问的网站去做的，兼容方案无从而知，所以我们的即时贴位置也不知道应该改到什么位置，一样GG。
如果是没有做自适应的，只给页面加
```html
    <meta name="viewport" content="width=device-width, initial-scale=1.0 user-scalable=no">
```
那也是GG
不用px用百分比的，更是GG..

**一个好消息是**：一般我们这个应用是在同一个设备上使用。。或者，真要做笔记的话，可以基于功能1的endOffset位置去做

**`diigo的大致实现如下：`**
```html
            <style>
    			div.floatNote {
    				position: absolute!important;
    				width: 34px;
    				height: 34px;
    				text-align: center;
    				background-image: url('chrome-extension://pnhplgjpclknigjpccbcnmicgcieojbh/diigolet/images/float_icon.png')!important;
    				background-repeat: no-repeat;
    				z-index: 2147483643;
    			}
    		</style>




    <div class="floatNote" style="left: 239px; top: 316px; cursor: default;"></div>
```




## 功能三：离线存储，页面load完去访问缓存数据，还原样式操作
先谈谈保存形式。
### 1.cookie的方式
每个域限制cookie的数量，cookie的大小限制为4kB；
一个域有多个URL,利用子cookie的方法一个URL仅使用一个cookie
不过这样域还是会受到cookie数量的限制，大概是数十个。
**容量太小，且有可能cookie被禁用**
### 2.IE用户数据
**每个域名最多1MB数据,一个文档最多128KB数据。**
以文档进行区分，不限制文档的数量，满足我们的需求。
**但是**只支持`Windows+IE`

以下权当学习。

在CSS中指定userData
```html
<div style="behavior:url(#default#userData)" id="datastore"></div>
```
设置数据
```js
    var dataStore = document.getElementById("datastore");
    dataStore.setAttribute("name","Nicholas");
    dataStore.setAttribute("book","JS Pro");
    //保存的数据空间名，仅用于区分不同的数据集
    dataStore.save("BookInfo");
    //覆盖元素可以进行更新
    
    获取数据
    dataStore.load("BookInfo");
    //load的调用获取了BookInfo数据空间的所有值，可以通过元素访问
    console.log(dataStore.getAttritube("name"));//"Nicholas"
    
    删除数据
    dataStore.load("BookInfo");
    dataStore.removeAttribute("name");
    dataStore.save("BookInfo");
```

### 3.Web Storage

以来源(协议、域、端口)为单位。
大多数限制为 5 MB 和 2.5 MB
**`满足要求。`**
**注**：**`https`://www.abc.com/index.html** 与 **`http`://www.abc.com/index.html** 我们视为不同页面、不同来源
采用 **globalStorage和localStorage** 的组合(*localStorage是标准，但没有所有浏览器都兼容*

```js
        function getLocalStorage(){
			if(typeof localStorage == "object"){
				return localStorage;
			}else if(typeof globalStorage == "object"){
				return globalStoragep[location.host];
			}else{
				throw new Error("Local storage not available.");
			}
		}
		var storage = getLocalStorage();
```

测试：
```js
    var storage = getLocalStorage();
    var book = storage.getItem("book");
    if(book==null){
    	console.log("book is null,please set value!");
    	storage.setItem("book","人人都是PM");
    }else{
    	console.log("book存在值，"+book)
    }
```

访问页面，再刷新。结果：

    [Web浏览器] "book is null,please set value!"	/Diigo/index.html (127)
    [Web浏览器] "book存在值，人人都是PM"	/Diigo/index.html (130)

### 4.Web SQL & IndexedDB
可以实现，不过对于我们的应用来说该方法比较复杂，故不采用
具体用法参考[这里][2]

-------
再谈谈数据类型 每个来源的**增删改查**

## 功能四：导出笔记数据，更新其他机器的本地笔记

## 功能五：云端存储

## 功能六：社交、群组、笔记畅享


~~有空再更新...~~
**【20171222更新】**
后面这些属于产品级功能，与前端技术关联不大，故不再更新。


  [1]: http://www.zhangxinxu.com/wordpress/2011/04/js-range-html%E6%96%87%E6%A1%A3%E6%96%87%E5%AD%97%E5%86%85%E5%AE%B9%E9%80%89%E4%B8%AD%E3%80%81%E5%BA%93%E5%8F%8A%E5%BA%94%E7%94%A8%E4%BB%8B%E7%BB%8D/
  [2]: http://www.ibm.com/developerworks/cn/web/1107_zhaifeng_indexeddb/