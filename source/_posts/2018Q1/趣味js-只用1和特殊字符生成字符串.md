---
title: 趣味js-只用特殊字符生成任意字符串
date: 2018-01-07 11:12:40
categories: 大前端
---

**180306更新**：发现有个`http://www.jsfuck.com/` ,上面就做了我想做的东西。也找到了C的生成方法

同时，由于+[]=0,+!+[]=1。我们可以把1也给省略

jsfuck里面还有很多骚操作，比如 `+("11e20")=1.1e+21`

<!--more-->

## 前言

今天逛[justjavac 老哥的博客][2]看到了类似下面的代码
```
(+([]+(11^(1<<1))+((1+1)<<(1+1))+(11>>>1)+(1^1)+((11>>1)+(1<<1))+(-~1)+(-~1+1)+(1^1)+(1^1)))[(!!1+[])[1^1]+([]+{}+[])[1]+(([]+{})[([]+{})[11-1>>1]+[[],[]+{}+[]][[]+1][1]+(/^/[1]+[])[1|1>>1|1]+[{},11^1,!{}+[]][1+1][1<<1^1]+(11/!{}+{})[~1+(11^1)+~1]+[!!{}+{}][[]&111][1&1]+(/^/[111]+[])[11^11]+[{},[{}]+{},1][1+[]][11-~1+11>>1]+(!!1+{})[1&1>>1]+([]+{1:1}+[])[1|1]+[[]+!!1][111>>>111][1<<1>>1]]+[])[([]+![111])[1|1<<1|1]+[/=/,[]+[][11]][1|[]][1>>1]+([{}]+{})[1+!![1]]+[1,!1+/~/][1%11][1^1<<1]+(!!1+[])[1^1]+[!!/-/+/-/][11%11][+!!1]](11^1<<1,-~11>>1)](~1-~(11^1)<<1<<1)
```
输出：`gahing`

实现的原理是什么？

## 原理

了解 js 隐式类型转换（不懂可以参考[这里][1]）的都知道

我们可以通过执行`!1+[]`得到`"false"`

> 具体原理是 false+object 操作会先去调用object的valueOf()方法 发现其值=this 

> 继续调用toString()方法得到"", 结果即false+"" = "false"(又去做了隐式转换)

故我们通过数组下标就可以拿到想要的字符`f,a,l,s,e`

类似的方法我们还能够拿到

```javascript
!1+[] = "false"
!!1+[] = "true"
1/[]+[] = "Infinity"
[]/[]+[] = "NaN"
[]+{} = "[object Object]"
[]+/^/[1] = "undefined" /* /^/是正则 */
[]+/\:@$/ = "/\:@$/" /*键盘可见特殊字符放/\ /其中(\用于转义)获取比如拿:就是[1]*/

//可拿到的小写字母有=abcdef ijln orst uy
```

然后你会发现，26个字母还是有好多不在上面的，并不能通过每次去上面拿字符然后再做拼接

<!--more-->

但是！！`constructor` 这个字符串里面的字符都可以通过上面的拿到

```javascript
"constructor" = ([]+{})[11-1>>1]+[[],[]+{}+[]][[]+1][1]+(/^/[1]+[])[1|1>>1|1]+[{},11^1,!{}+[]][1+1][1<<1^1]+(11/!{}+{})[~1+(11^1)+~1]+[!!{}+{}][[]&111][1&1]+(/^/[111]+[])[11^11]+[{},[{}]+{},1][1+[]][11-~1+11>>1]+(!!1+{})[1&1>>1]+([]+{1:1}+[])[1|1]+[[]+!!1][111>>>111][1<<1>>1]
```
`constructor`有什么作用呢，先思考下...

------------

好吧其实作用就是`""['constructor']+[]` 可以拿到`"function String() { [native code] }"`

于是，我拿到了`String`字符串，再通过其他地方又可拿到`to` ，于是`toString`方法就get了

最后实现的原理其实是toString,即:

`(985072300).toString(36)` 

`36=~1-~(11^1)<<1<<1`


前面的数字串是字符串的36进制(0~9a-z)表示,比如 gahing 的36进制表示是985072300

### 进制转换：

36进制可以预先通过下面的方法获得

```javascript
parseInt("gahing",36)
=>985072300

(985072300).toString(36)
=>"gahing"
```

### number转换为1和字符组合构成

举个例子就懂了

```
[]+1+2+3 = "123"
(+([]+1+2+3)) = 123
```

我们设置0~9的组合串为如下：
```
0:(1^1)
1:(1|1)
2:(-~1)
3:(-~1|1)
4:(-~1<<1)
5:(11>>1)
6:((11+1)>>1)
7:(11>>1|-~1)
8:(11^(-~1|1))
9:(11^(1<<1))
```

## 实现

```javascript
//$1="constructor"
let $1  = ([]+{})[11-1>>1]+[[],[]+{}+[]][[]+1][1]+(/^/[1]+[])[1|1>>1|1]+[{},11^1,!{}+[]][1+1][1<<1^1]+(11/!{}+{})[~1+(11^1)+~1]+[!!{}+{}][[]&111][1&1]+(/^/[111]+[])[11^11]+[{},[{}]+{},1][1+[]][11-~1+11>>1]+(!!1+{})[1&1>>1]+([]+{1:1}+[])[1|1]+[[]+!!1][111>>>111][1<<1>>1]
//$11="function String() { [native code] }"
let $11 = (([]+{})[$1]+[])
//$111="substr"
let $111 = ([]+![111])[1|1<<1|1]+[/=/,[]+[][11]][1|[]][1>>1]+([{}]+{})[1+!![1]]+[1,!1+/~/][1%11][1^1<<1]+(!!1+[])[1^1]+[!!/-/+/-/][11%11][+!!1]
//$$="String"
let $$ = $11[$111](11^1<<1,-~11>>1) //substr(9,6)
//$_1="toString"
let $_1=(!!1+[])[1^1]+([]+{}+[])[1]+$$
//结果：(985072300)['toString'](36)
(+([]+(11^(1<<1))+((1+1)<<(1+1))+(11>>>1)+(1^1)+((11>>1)+(1<<1))+(-~1)+(-~1+1)+(1^1)
+(1^1)))[$_1](~1-~(11^1)<<1<<1)
```


## 存在的问题及其改进方法

### 长字符串

当字符串有多种类型时（比如下面会提到的中文）需要考虑分段，多次`toString(36)`最后拼接起来。

由于`toString`方法获得不易，让`$='toString'`吧

### 大写字母、中文字符、非常见字符

个别大写字母可以通过以下式子去拿到

```
$1='constructor'
A: [][$1]+[]="function Array() { [native code] }"
B: (!!1)[$1]+[]="function Boolean() { [native code] }"
I: 1/[]+[] = "Infinity"
E: /\\/[$1]+[] = "function RegExp() { [native code] }"
N: []/[]+[] = "NaN"
O: []+{}="[object Object]"
S: ''[$1]+[] = "function String() { [native code] }"
R: /\\/[$1]+[] = "function RegExp() { [native code] }"
```

**当然，我们可以用黑科技去获取。**

String类有个方法`fromCodePoint`(不用`fromCharCode`因为其不能识别4字节字符)

通过传入`Unicode` 值即可得到对应的字符，String类可以通过构造函数`''['constructor']`拿到。

例：`''['constructor']['fromCodePoint'](23433) //输出'安'`

`23433` 是 `安` 的unicode码，可以通过 `'安'.codePointAt(0)` 获得

故我们可以事先得到`fromCodePoint`的组合串。用一个临时变量保存，会经常用到

~~**PS:实在是找不到怎么生成'C'的。。下文可以不用看了**~~
navigator.userAgent.match(RegExp('\\u0043')) 思路
eval(`${'\\u0043'}`) 思路

**180306更新**：发现有个`http://www.jsfuck.com/` ,上面就做了我想做的东西。也找到了C的生成方法
同时，由于+[]=0,+!+[]=1。我们可以把1也给省略



```
let  fcp = 74719523963420330000 // 'fromCodePoint'的36位编码
let $$ =(fcp)['toString'](36) //'fromCodePoint'
$1='constructor'
''[$1][$$](23433) // 输出'安'
```

这样，所有的字符都可以得到了。

## 生产

现在我们的需求是：输入一个字符串，输出一个组合串

### 规则

**一般来说：**

0. 数字串直接用`([]+1+11)`实现

1. 让连续的小写字母串用`toString(36)`

2. 可以直接拿到的英文字符，特殊字符，直接去获取

3. 最后再用`fromCodePoint`方法

**算法如下：**

1. 字符串分割：将连续的数字串、连续的小写字母串作为整体，其他的作为单个字符

   判断存在的类型，事先用变量替换需要多次用到的方法串，比如 `fromCodePoint`

   分割后的数组、元素类别及个数 对应的数据结构为:

   ```js
   {
     [Symbol.for('numStr')]:0,
     [Symbol.for('commonLowercaseStr')]:0,
     [Symbol.for('otherLowercaseStr')]:0,
     [Symbol.for('commonCapital')]:0,
     [Symbol.for('commonSign')]:0,
     [Symbol.for('otherChar')]:0,
     arr:[{str:'',type:Symbol.for('numStr'),transStr:''},...]
   }
   ```

2. 字符串替换：利用上文提到的替换公式将字符串替换掉

   2.1 数字串采用`([]+1+11)`实现，每个数字都有对应的组合串
   
   2.2 处理小写字母串，若该串所有字符可直接获取(abcdefijlnorstuy),则直接获取，否则采用`toString(36)`实现，36进制通过 `parseInt方法` 获取

   2.3 特殊字符、大写字母先看能否直接获取（ABEFINORS），否则走 2.4 流程

   2.4 利用`codePointAt`拿到`Unicode`码，再生成`String.fromCodePoint(unicode)` 的组合串

3. 字符串拼接：将分割后替换完的组合串进行拼接

**注：** 定义的变量，为保持拓展性，变量第一位都是$ 第二位为_表示后面的是替换方法 第二位为1表示后面将是替换具体字符

### 举个栗子

对于原串：`hello 送你一台iPhone6，价值$666`

```js
//将常见字符的组合串设置到source上
let source = init() //source:{'0':'(1^1)',...}

// 对字符串分割分类，生成数据结构
let data = split(str)
// arr = ['hello',' ','送','你','一','台','i','P','hone','6','，','价','值','$','666']
/**
obj = {
     [Symbol.for('numStr')]:2,
     [Symbol.for('commonLowercaseStr')]:1,
     [Symbol.for('otherLowercaseStr')]:2,
     [Symbol.for('commonCapital')]:0,
     [Symbol.for('commonSign')]:3,
     [Symbol.for('otherChar')]:7,
     arr:[{str:'hello',type:Symbol.for('otherLowercaseStr'),transStr:''},
     {str:' ',type:Symbol.for('commonSign'),transStr:''},
     {str:'送',type:Symbol.for('otherChar'),transStr:''},
     {str:'你',type:Symbol.for('otherChar'),transStr:''},
     {str:'一',type:Symbol.for('otherChar'),transStr:''},
     {str:'台',type:Symbol.for('otherChar'),transStr:''},
     {str:'i',type:Symbol.for('commonLowercaseStr'),transStr:''},
     {str:'P',type:Symbol.for('otherChar'),transStr:''},
     {str:'hone',type:Symbol.for('otherLowercaseStr'),transStr:''},
     {str:'6',type:Symbol.for('numStr'),transStr:''},
     {str:'，',type:Symbol.for('commonSign'),transStr:''},
     {str:'价',type:Symbol.for('otherChar'),transStr:''},
     {str:'值',type:Symbol.for('otherChar'),transStr:''},
     {str:'$',type:Symbol.for('commonSign'),transStr:''},
     {str:'666',type:Symbol.for('numStr'),transStr:''}]
   }
**/

//对数组元素类型，用变量替换会用到的方法串
let signObj = getSignOf(data.arr) //signObj={useConstructor:'$_$=xxx;';useFromCodePoint:'$_1=xxx;'}
//otherLowercaseStr>0 初始化$_$=constructor的组合串
//otherChar>0 初始化$_1=fromCodePoint的组合串
//为保持拓展性。变量第一位都是$ 第二位为_表示后面的是替换方法 第二位为1表示后面将是替换具体字符
let result = ''
let ua = signObj.useConstructor
let ub = signObj.useFromCodePoint
ua&&(result+=ua)
ub&&(result+=ub)

//循环元素处理，结果存在transStr
for(let obj of data.arr){
  switch(obj.type){
    case Symbol.for('numStr'):{handleNumStr(obj);break;}
    case Symbol.for('commonLowercaseStr'):{handleCommonLowercaseStr(obj);break;}
    case Symbol.for('otherLowercaseStr'):{handleOtherLowercaseStr(obj);break;}
    case Symbol.for('commonCapital'):{handleCommonCapital(obj);break;}
    case Symbol.for('commonSign'):{handleCommonSign(obj);break;}
    case Symbol.for('otherChar'):{handleOtherChar(obj);break;}
  }
}

//得到结果
result+=data.arr.reduce((tot,cur)=>tot+cur.transStr)
```

### 方法代码

```js
const numStr = Symbol.for('numStr')
const commonLowercaseStr = Symbol.for('commonLowercaseStr')
const otherLowercaseStr = Symbol.for('otherLowercaseStr')
const commonCapital = Symbol.for('commonCapital')
const useConstructorCapital = Symbol.for('useConstructorCapital')
const commonSign = Symbol.for('commonSign')
const otherChar = Symbol.for('otherChar')
const string_null_error = Symbol.for('string_null_error')
const string_multitype_error = Symbol.for('string_multitype_error')

var StringBuilder = (function () {
  let instance
  let builder = {}
  let init = function (name) {
    builder[0] = '1^1'
    builder[1] = '1|1'
    builder[2] = '-~1'
    builder[3] = '-~1|1'
    builder[4] = '-~1<<1'
    builder[5] = '11>>1'
    builder[6] = '(11+1)>>1'
    builder[7] = '11>>1|-~1'
    builder[8] = '11^(-~1|1)'
    builder[9] = '11^(1<<1)'
    builder[12] = '11+1'
    builder['false'] = '!1+[]'
    builder['true'] = '!!1+[]'
    builder['Infinity'] = '1/[]+[]'
    builder['NaN'] = '[]/[]+[]'
    builder['[object Object]'] = '[]+{}'
    builder['undefined'] = '[]+/^/[1]'
    builder['a'] = `(${builder['false']})[${builder[1]}]`
    builder['b'] = `(${builder['[object Object]']})[${builder[2]}]`
    builder['c'] = `(${builder['[object Object]']})[${builder[5]}]`
    builder['d'] = `(${builder['undefined']})[${builder[2]}]`
    builder['e'] = `(${builder['true']})[${builder[3]}]`
    builder['f'] = `(${builder['false']})[${builder[0]}]`
    builder['i'] = `(${builder['undefined']})[${builder[5]}]`
    builder['j'] = `(${builder['[object Object]']})[${builder[3]}]`
    builder['l'] = `(${builder['false']})[${builder[2]}]`
    builder['n'] = `(${builder['Infinity']})[${builder[1]}]`
    builder['o'] = `(${builder['[object Object]']})[${builder[1]}]`
    builder['r'] = `(${builder['true']})[${builder[1]}]`
    builder['s'] = `(${builder['false']})[${builder[3]}]`
    builder['t'] = `(${builder['true']})[${builder[0]}]`
    builder['u'] = `(${builder['undefined']})[${builder[0]}]`
    builder['y'] = `(${builder['Infinity']})[${builder[7]}]`
    builder['I'] = `(${builder['Infinity']})[${builder[0]}]`
    builder['N'] = `(${builder['NaN']})[${builder[0]}]`
    builder['O'] = `(${builder['[object Object]']})[${builder[8]}]`
    builder['constructor'] = handleStrByType('constructor')
    //let $_$=builder['constructor']
    builder['A'] = `([][$_$}]+[])[${builder[9]}]`
    builder['B'] = `((!!1)[$_$]+[])[${builder[9]}]`
    builder['E'] = `(/\\/[$_$]+[])[${builder[9]}]`
    builder['F'] = `((()=>{})[$_$]+[])[${builder[9]}]`
    builder['R'] = `(/\\/[$_$]+[])[${builder[12]}]`
    builder['S'] = `(([]+1)[$_$]+[])[${builder[9]}]`
    builder['fromCodePoint'] = handleStrByType('fromCodePoint')
    return {
      handleStr: function (str) {
        let arr = split(str)
        let source = packArrToSource(arr)
        let result = getSign(source)
      }
    }
  }
  /**
   * 
   * 将字符串进行分割
   * 
   * @param {any} str 
   * @returns 分割后的数组
   */
  function split(str) {
    if (!str || str.length === 0) throw { type: string_null_error, message: '字符串为空' }
    let arr = []
    let last = ""
    for (let c of str) {
      try {
        let curType = getTypeOf(c)
        if (last.length === 0) {
          if (curType === numStr || curType === commonLowercaseStr || curType === otherLowercaseStr) {
            last = c
          } else {
            arr.push(c)
          }
        } else {
          //last必为数字或小写字母串
          let lastType = getTypeOf(last)
          if (curType === lastType || (lastType !== numStr && (curType === commonLowercaseStr || curType === otherLowercaseStr))) {
            last += c
          } else {
            arr.push(last)
            last = ""
            if (curType === numStr || curType === commonLowercaseStr || curType === otherLowercaseStr) {
              last = c
            } else {
              arr.push(c)
            }
          }
        }
      } catch (error) {
        console.error(`字符为${c}`)
        throw error
      }
    }
    if (last !== "") arr.push(last);
    return arr
  }
  /**
   * 将数组每个元素进行包装，生成数据源
   * 
   * @param {any} arr 
   */
  function packArrToSource(arr) {
    let obj = {
      [numStr]: 0,
      [commonLowercaseStr]: 0,
      [otherLowercaseStr]: 0,
      [commonCapital]: 0,
      [useConstructorCapital]: 0,
      [commonSign]: 0,
      [otherChar]: 0,
      arr: []
    }
    arr.forEach((e) => {
      let curTemp = getTypeOf(e)
      obj[curTemp] += 1
      obj.arr.push({
        oriStr: e,
        type: curTemp,
        transStr: ''
      })
    }, this);
    return obj
  }
  /**
   * 获取字符串所属类型
   * 
   * @param {any} str 
   * @returns 
   */
  function getTypeOf(str) {
    if (!str || str.length === 0) throw { type: string_null_error, message: '字符串为空' }
    if (/^\d+$/.test(str)) return numStr;
    if (/^[abcdefijlnorstuy]+$/.test(str)) return commonLowercaseStr;
    if (/^[a-z]+$/.test(str)) return otherLowercaseStr;
    if (/^[INO]+$/.test(str)) return commonCapital;
    if (/^[ABEFRS]+$/.test(str)) return useConstructorCapital;
    if (/^((?=[\x21-\x7e])[^A-Za-z0-9])$/.test(str)) return commonSign;
    //存在多个字符，报错：有多种类型，需要重新split
    if (Array.from(str).length !== 1) throw { type: string_multitype_error, message: '存在多种类型' }
    return otherChar;
  }
  /**
   * 获取初始化字符串，并对source进行2个属性的设置
   * otherLowercaseStr>0 初始化$_$=constructor的组合串
   * otherChar>0 初始化$_1=fromCodePoint的组合串
   * 
   * @param {any} source 
   */
  function getSign(source) {
    //otherLowercaseStr>0 初始化$_$=constructor的组合串
    //otherChar>0 初始化$_1=fromCodePoint的组合串
    let result = ""
    if (source[otherLowercaseStr] > 0 || source[useConstructorCapital] > 0 || source[otherChar] > 0) {
      source['useConstructor'] = '$_$=' + builder['constructor']
      result += source['useConstructor'] + ';'
    }
    if (source[otherChar] > 0) {
      source['useFromCodePoint'] = '$_1=' + builder['fromCodePoint']
      result += source['useFromCodePoint'] + ';'
    }
    return result
  }
  /**
   * 将原串根据类型生成返回组合串
   * 
   * @param {any} str 
   * @param {any} type 
   * @returns 
   */
  function handleStrByType(str, type) {
    type = type || getTypeOf(str)
    switch (type) {
      case numStr: return handleNumStr(str);
      case commonLowercaseStr: return handleCommonLowercaseStr(str);
      case otherLowercaseStr: return handleOtherLowercaseStr(str);
      case commonCapital: return handleCommonCapital(str);
      case useConstructorCapital: return handleUseConstructorCapital(str);
      case commonSign: return handleCommonSign(str);
      case otherChar: return handleOtherChar(str);
    }
  }
  function handleNumStr() {

  }
  function handleCommonLowercaseStr(str) {
    return Array.from(str, c => obj[c]).reduce((tot, cur) => tot + '+' + cur)
  }
  function handleOtherLowercaseStr() {

  }
  function handleCommonCapital() {

  }
  function handleUseConstructorCapital() {

  }
  function handleCommonSign() {

  }
  function handleOtherChar() {

  }
  //修改源的
  function setSourceBuilder(s,str){

  }
  return {
    getInstance: function () {
      return instance || (instance = init())
    }
  }
})()
export default StringBuilder
```

### 优化

对于生成的字符串，我们要求尽量短一点。考虑是否有做压缩的可能性：

对于重复的字符串，可以用以下方法

```js
'a'['repeat'](5) === "aaaaa"

[]["constructor"](3)['fill']('a')['join']('') === "aaa"

```

但一般字符串很少有这样重复的

对于长英文串，是否可以事先得到所有字母的组合串，用变量表示，后面直接使用变量。

如 `$_$$$ = 'a'; $_$_1 = 'b'` 

即把 `$` 看做 `0` ， 采用类似 `ASCII码` 的方式实现


#### zip压缩（LZ77）简单原理

1. 当前待压缩字符串往前一个滑动窗口找最大匹配串

> 一个滑动窗口表示最多往前找的字符串长度,zip通常是32KB

2. 设置（距离dis,匹配串长度len）作为标识位，解压时会去往前找原串。

> 标志位本身也会占用空间。故匹配的字符串一般要满足>=三个字节

3. 对 (dis,len) 做哈夫曼编码，得到较小的字节串

4. 文件头写字典:(k,v)=>(哈夫曼编码,(dis,len))

#### zip解压缩对本项目的应用

- 初始化设置：
> 1. 匹配串需要>=8个字符才做压缩
> 2. 滑动窗口设为64字符串长度

- 压缩效果


----------------
未完待续

## github库

## ScriptOJ 出题

[1]: https://github.com/jawil/blog/issues/5
[2]: http://justjavac.com/about.html