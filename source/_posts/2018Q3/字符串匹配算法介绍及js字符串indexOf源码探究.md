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

> 最近在分析 adblockplus.js 源码的时候了解到的

> 此外还有 有限自动机算法（Finite Automation）、Boyer-Moore 算法、Simon 算法、Colussi 算法、Galil-Giancarlo 算法、Apostolico-Crochemore 算法、Horspool 算法、Shift-Or 算法和 Sunday 算法

<!--more-->

## `Rabin-Karp` 介绍

> 先进行名词的说明:源串(S1)长度为n,子串(S2)长度为m

暴力之所以会慢，主要在于S1匹配了S2的第一个字符后，还要进行至多m-1个字符的判断。


如果能将S2映射到某个数字num1，S1每次也得到当前m长度字符串的映射数字num2，判断num1和num2是否相同（一次操作）即可快速判断两个字符串可能相同。

**上面说法需要注意两个问题：**

1. S1每次计算m长度字符串的映射数字需要足够快，必须仅做一次操作
2. num1和num2相同仅能判断两个字符串可能相同，还需要进行字符串每一位的判断

如何快速计算字符串的映射数字呢？


我们假设 s1="jijiaxing" s2="jia"，字符对应的数字采用ASCII值，取ASCII字符集长度M为128

左部为高位，最高位hash值为`s2[0].charCodeAt(0)*(128**(m-1))`(`**`在js中表示指数运算)

**计算s2("jia")对应的hash值**：
1. hash("j")=106
2. hash("ji")=hash("j")*128+105=13673
3. hash("jia")=hash("ji")*128+97=1750241


**我们可以添加或者删减一个字符，快速得到新字符串的hash值**

`hash("iax")=(hash("jia")-hash("j")*(128**2))*128+120=(1750241-106*16384)*128+120=1732856`

这样我们就可以先计算s1前m长度字符串的hash值，hash值一致再逐个比较，否则删去第一个字符，从s1再加一个字符，继续比较。。

前面的操作，我们没有做 mod 运算，当s2长度计算出来的hash值过大的时候，(js大数运算相对耗时)，我们需要对该值取余散列。假设哈希表长度Q为 10007

**于是前面的操作hash("jia")变成:**
1. hash("j")=106%10007=106
2. 
   ```
    hash("ji")
    =(106*128+105)%10007
    =((106*128)%10007+105%10007)%10007
    =(((106%10007)*(128%10007))%10007+105%10007)%10007
    =((hash("j")*128)%10007+105%10007)%10007
    =((hash("j")*128)+105)%10007
    =3666
   ```
   即，hash("ji")=((hash("j")*128)+105)%10007
3. 同理，hash("jia")=(hash("ji")*128+97)%10007=9023

**增减字符串的计算过程如下：**
```
hash("iax")
=(105*(128**2)+97*128+120)%10007
=((105*(128**2)+97*128)%10007+120%10007)%10007
=(((105*128+97)%10007*128%10007)%10007+120%10007)%10007
=(((106*(128**2)+105*128+97-106*(128**2))%10007*128%10007)%10007+120%10007)%10007
=((((106*(128**2)+105*128+97)%10007-(106*(128**2))%10007+10007)%10007*128%10007)%10007+120%10007)%10007
//用hash("jia")替换
=((((hash("jia")-(106*(128**2))%10007+10007)%10007*128%10007)%10007+120%10007)%10007
=(((hash("jia")+(10007-(106*(128**2))%10007))%10007*128%10007)%10007+120%10007)%10007
//化简10007-(106*(128**2))%10007
//=(10007-(106*(128**2))%10007)%10007
//增加一个10007倍数的值，不影响
//=(10007-(106*(128**2))%10007+105*10007)%10007
//=(106*10007-106*(128**2)%10007)%10007
//=(106*(10007-128**2%10007))%10007 
=((((106*(128**2)+105*128+97)%10007+(106*(10007-128**2%10007))%10007)%10007*128%10007)%10007+120%10007)%10007
=(((hash("jia")+(106*(10007-128**2%10007))%10007)*128)%10007+120%10007)%10007
=(((hash("jia")+(106*(10007-128**2%10007))%10007)*128)+120)%10007
// 计算本例的固定值10007-128**2%10007=3630
=(((hash("jia")+106*3630%10007)*128)+120)%10007
=(((9023+106*3630%10007)*128)+120)%10007
=1645
```
计算的时候，采用该式子： `(((hash("jia")+106*3630%10007)*128)+120)%10007`

以上用到了 **同余定理**
```
A*B % C = (A%C * B%C)%C
(A+B)%C = (A%C + B%C)%C
(A-B)%C = (A%C - B%C + C)%C // js运算中 -2%5=-2而不是3 故这里我们需要补上C,让差大于0 
```

### **下面给出Rabin-Karp的简单实现：**

```js
var Q = 10007
var M = 128
function getHash(str,len){
  var val = 0
  for(var i=0;i<len;i++){
    val=(val*M+str[i].charCodeAt(0))%Q
  }
  return val
}
//逐个比较相同长度字符串,s1从index位置开始取
function compare(s1,s2,offset){
  for(var i=0;i<s2.length;i++){
    if(s1[i+offset]!==s2[i])return false
  }
  return true
}
function match(s1,s2){
  var n = s1.length
  var m = s2.length
  if(n<m)return -1
  var s2Hash = getHash(s2,m)
  // 一个固定值
  var fix = Q-M**(m-1)%Q
  var curHash = getHash(s1,m)
  if(curHash===s2Hash&&compare(s1,s2,0))return 0
  for(var i=m;i<s1.length;i++){
    var offset = i-m+1
    curHash = (((curHash+(s1.charCodeAt(i-m))*fix%Q)*M)+s1.charCodeAt(i))%Q
    if(curHash===s2Hash&&compare(s1,s2,offset))return offset
  }
  return -1
}
//match("jijiaxing","jia")=2
```
### 效率

理论时间复杂度为O(n*m),但是由于hash不一致能排除大部分情况，故实际复杂度大概在O(n+m)

### 参考

<a href="https://www.cnblogs.com/tanxing/p/6049179.html">Rabin-Karp指纹字符串查找算法</a>

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
computeOverlay("abadabab")=[0,0,1,0,1,2,3,2]
```

### 参考

<a href="http://www.ruanyifeng.com/blog/2013/05/Knuth%E2%80%93Morris%E2%80%93Pratt_algorithm.html">字符串匹配的KMP算法</a>

<a href="https://en.wikipedia.org/wiki/Knuth%E2%80%93Morris%E2%80%93Pratt_algorithm">Knuth–Morris–Pratt algorithm</a>

## `Boyer-Moore` 介绍

大多数文本查找，用的是该算法

未完待续...

## 几种算法的性能比较

![051920279722486.gif][1]

## js indexOf源码

ECMAScript 2015中的定义:<a href="https://www.ecma-international.org/ecma-262/6.0/#sec-string.prototype.indexof"> String.prototype.indexOf</a>

v8 源码实现

1. 参数检查

```js
Object* String::IndexOf(Isolate* isolate, Handle<Object> receiver,
                        Handle<Object> search, Handle<Object> position) {
  if (receiver->IsNullOrUndefined(isolate)) {
    THROW_NEW_ERROR_RETURN_FAILURE(
        isolate, NewTypeError(MessageTemplate::kCalledOnNullOrUndefined,
                              isolate->factory()->NewStringFromAsciiChecked(
                                  "String.prototype.indexOf")));
  }
  Handle<String> receiver_string;
  ASSIGN_RETURN_FAILURE_ON_EXCEPTION(isolate, receiver_string,
                                     Object::ToString(isolate, receiver));

  Handle<String> search_string;
  ASSIGN_RETURN_FAILURE_ON_EXCEPTION(isolate, search_string,
                                     Object::ToString(isolate, search));

  ASSIGN_RETURN_FAILURE_ON_EXCEPTION(isolate, position,
                                     Object::ToInteger(isolate, position));

  uint32_t index = receiver_string->ToValidIndex(*position);
  return Smi::FromInt(
      String::IndexOf(isolate, receiver_string, search_string, index));
}
```
2. 确定字符编码对应的查找方法

```js
int String::IndexOf(Isolate* isolate, Handle<String> receiver,
                    Handle<String> search, int start_index) {
  DCHECK_LE(0, start_index);
  DCHECK(start_index <= receiver->length());

  uint32_t search_length = search->length();
  if (search_length == 0) return start_index;

  uint32_t receiver_length = receiver->length();
  if (start_index + search_length > receiver_length) return -1;

  receiver = String::Flatten(isolate, receiver);
  search = String::Flatten(isolate, search);

  // 不开gc vectors保持有效
  DisallowHeapAllocation no_gc;  // ensure vectors stay valid
  // Extract flattened substrings of cons strings before getting encoding.
  // 获取扁平字串？
  String::FlatContent receiver_content = receiver->GetFlatContent();
  String::FlatContent search_content = search->GetFlatContent();

  // dispatch on type of strings
  // 根据字符串编码类型
  if (search_content.IsOneByte()) {
    Vector<const uint8_t> pat_vector = search_content.ToOneByteVector();
    return SearchString<const uint8_t>(isolate, receiver_content, pat_vector,
                                       start_index);
  }
  Vector<const uc16> pat_vector = search_content.ToUC16Vector();
  return SearchString<const uc16>(isolate, receiver_content, pat_vector,
                                  start_index);
}
```

我们进到`src/string-search.h`中来，

```js
template <typename SubjectChar, typename PatternChar>
int SearchString(Isolate* isolate,
                 Vector<const SubjectChar> subject,
                 Vector<const PatternChar> pattern,
                 int start_index) {
  StringSearch<PatternChar, SubjectChar> search(isolate, pattern);
  return search.Search(subject, start_index);
}
```

里面定义了几种搜索算法

1. LinearSearch
2. BoyerMooreSearch
3. BoyerMooreHorspoolSearch
4. InitialSearch
5. SingleCharSearch

具体使用哪种，是由初始化StringSearch时定义的
```js
StringSearch(Isolate* isolate, Vector<const PatternChar> pattern)
      : isolate_(isolate),
        pattern_(pattern),
        start_(Max(0, pattern.length() - kBMMaxShift)) {
    if (sizeof(PatternChar) > sizeof(SubjectChar)) {
      if (!IsOneByteString(pattern_)) {
        strategy_ = &FailSearch;
        return;
      }
    }
    int pattern_length = pattern_.length();
    if (pattern_length < kBMMinPatternLength) {
      if (pattern_length == 1) {
        strategy_ = &SingleCharSearch;
        return;
      }
      strategy_ = &LinearSearch;
      return;
    }
    strategy_ = &InitialSearch;
  }

  int Search(Vector<const SubjectChar> subject, int index) {
    return strategy_(this, subject, index);
  }
```

有空再介绍里面每种算法..


  [1]: https://www.hongweipeng.com/usr/uploads/2018/09/3492094464.gif