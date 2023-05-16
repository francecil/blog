---
title: KMP
date: 2020-03-24 22:26:15
permalink: /pages/595c9b/
titleTag: 专题
categories: 
  - 通用技术
  - 算法
  - 字符串匹配
tags: 
  - 
---
## `KMP` 介绍

朴素算法之所以慢，在于逐个比较发现有字符不相同时，会将搜索串向后移动一位，然后重新逐位比较。

倘若我们能根据源字符串和搜索串匹配的部分字符串信息，将搜索串向后移动一定位置，将加快查找避免很多无效操作。

而这个信息就是：搜索串头部和后面某部分字符串会有重复。

比如，对于源串`abcabcabd`,搜索串`abcabd`,我们能在搜索串后面找到与搜索串头部的`ab`进行匹配。

源串和搜索串在比对到搜索串的 d 字符时出现问题，我们会对搜索串进行移动。

**移动位数 = 已匹配的字符数 - 已匹配最后一个字符其对应的部分匹配值**

后面会说明如何计算，这里我们拿到第二个b的部分匹配值2，计算得到移动位数为5-2=3

其实就是将搜索串移动到源串的第二个`ab`位置。

在计算部分匹配值之前，我们先说明下前缀后缀的含义。

> "前缀"指除了最后一个字符以外，一个字符串的全部头部组合
> "后缀"指除了第一个字符以外，一个字符串的全部尾部组合。

"部分匹配值"就是"前缀"和"后缀"的最长的共有元素的长度

对于字符串abcabd,按以下分析

- a 前缀:[] 后缀:[]，最长的共有长度为0
- ab 前缀:[a] 后缀:[b]，最长的共有长度为0
- abc 前缀:[a,ab] 后缀:[bc,c]，最长的共有长度为0
- abca 前缀:[a,ab,abc,] 后缀:[bca,ca,a]，共有元素为a,最长的共有长度为1
- abcab 前缀:[a,ab,abc,abca] 后缀:[bcab,cab,ab]，最长的共有长度为2
- abcabd 前缀:[a,ab,abc,abca,abcab] 后缀:[bcabd,cabd,abd,bd]，最长的共有长度为0

可以得到部分匹配表：
```
a b c a b d
0 0 0 1 2 0 
```

获取这个部分匹配表的过程又称为覆盖函数（next函数）。

有这样的递推公式：

对于匹配串pattern的前j个字符，若覆盖函数值overlay(j)为k,即`a[0]a[1]...a[k-1]=a[j-k]a[j-k+1]...a[j-1]`(坐标从0开始),则对于 pattern 的前j+1个字符，有：
1. pattern[k]==pattern[j]：说明在原来前后缀匹配k个字符的基础上，第k+1个字符也匹配了。显然前j+1个字符的覆盖函数值**overlay(j+1)=k+1**
2. pattern[k]!=pattern[j]：在原来前后缀匹配k个字符的基础上,找到这k个字符是否还存在前后缀匹配t个字符（即正好又是pattern前j个字符中的前后缀匹配t个字符,初始t=k），若匹配且第t个字符（从0计数）与pattern[j]相同，则overlay(j+1)=t,否则t=overlay(t-1)然后重复2过程；过程中若t为0说明已无前缀可匹配后缀了，取overlay(j+1)=0

代码如下
```js
function computeOverlay(pattern){
  var overlay = []
  var k = 0
  overlay[0]=0
  for(var i=1;i<pattern.length;i++){
	  k = overlay[i-1]
    if(pattern[k]===pattern[i]){
      overlay[i]=k+1
    } else{
      while(k>0&&pattern[k]!==pattern[i]){
        k = overlay[k-1]
      }
      if(pattern[k]===pattern[i]){
        k=k+1
      }
      overlay[i] = k
    }
  }
  return overlay
}
```

代码逻辑上做点小优化：
```js
function computeOverlay(pattern){
  var overlay = []
  var k = 0
  overlay[0]=0
  for(var i=1;i<pattern.length;i++){
	  k = overlay[i-1]
    while(k>0&&pattern[k]!==pattern[i]){
      k = overlay[k-1]
    }
    if(pattern[k]===pattern[i]){
      k=k+1
    }
    overlay[i] = k
  }
  return overlay
}
```

### KMP完整算法
```js
function computeOverlay(pattern){
  var overlay = []
  var k = 0
  overlay[0]=0
  for(var i=1;i<pattern.length;i++){
	  k = overlay[i-1]
    while(k>0&&pattern[k]!==pattern[i]){
      k = overlay[k-1]
    }
    if(pattern[k]===pattern[i]){
      k=k+1
    }
    overlay[i] = k
  }
  return overlay
}
function match(s1,s2){
  var n = s1.length
  var m = s2.length
  if(n<m)return -1
  var overlay = computeOverlay(s2)
  f1:
  for(var i=0;i<n;){
    f2:
    for(var j=0;j<m;j++){
      if(s1[i+j]!==s2[j]){
        if(j>0&&overlay[j-1]>0){
          //可跳跃时，移动位数 = 已匹配的字符数 - 已匹配最后一个字符其对应的部分匹配值
          i+=j-1-overlay[j-1]
        } else{
          i++
        }
        continue f1;
      }
    }
    return i
  }
  return -1
}
```
```js
computeOverlay("abadabab") // [0,0,1,0,1,2,3,2]
```

### 参考

<a href="http://www.ruanyifeng.com/blog/2013/05/Knuth%E2%80%93Morris%E2%80%93Pratt_algorithm.html">字符串匹配的KMP算法</a>

<a href="https://en.wikipedia.org/wiki/Knuth%E2%80%93Morris%E2%80%93Pratt_algorithm">Knuth–Morris–Pratt algorithm</a>
