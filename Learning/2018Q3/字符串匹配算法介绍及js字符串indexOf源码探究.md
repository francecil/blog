## 前言

之前学过的字符串匹配算法，一种是朴素算法，一种是KMP算法。

朴素算法即暴力，两层for循环，算法复杂度`O(n*m)`

```js
function match(s1,s2){
  var n = s1.length
  var m = s2.length
  f1:
  for(var i=0;i<n;i++){
    if(s1[i]===s2[0]){
      f2:
      for(var j=1;j<m;j++){
        if(s1[i+j]!==s2[j])continue f1;
      }
      return i
    }
  }
  return -1
}
```

KMP 的实现比较巧妙，下文会提到，我们先来介绍一种新的算法 `Rabin-Karp`

> 最近在分析 adblockplus.js 源码的时候了解到的，其实该算法性能比KMP差多了，这里权当学习算法思想

<!--more-->

## `Rabin-Karp` 介绍

> 先进行名词的说明:源串(S1)长度为n,子串(S2)长度为m

暴力之所以会慢，主要在于S1匹配了S2的第一个字符后，还要进行至多m-1个字符的判断。


如果能将S2映射到某个数字num1，S1每次也得到当前m长度字符串的映射数字num2，判断num1和num2是否相同（一次操作）即可快速判断两个字符串可能相同。

**上面说法需要注意两个问题：**

1. S1每次计算m长度字符串的映射数字需要足够快，必须仅做一次操作
2. num1和num2相同仅能判断两个字符串可能相同，还需要进行字符串每一位的判断

如何快速计算字符串的映射数字呢？

### 哈希

我们假设 s1="jijiaxing" s2="jia"，哈希表长度Q为 10007，字符对应的数字采用ASCII值，取ASCII字符集长度M为128


**计算s2("jia")对应的hash值**(`**`在js中表示指数运算)：
1. hash("a")=97*(128**0)=97
2. hash("ia")=105*(128**1)+hash("a")=13537
3. hash("jia")=106*(128**2)+hash("ia")=1750241

这样

**hash值的计算：**

```js
function hash(str){
  var Q = 10007
  var M = 128
  var val = 0
  for(var i=str.length-1;i>=0;i--){
    val=(val+str[i].charCodeAt(0))*128
  }
  return val
}
```