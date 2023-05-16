---
title: 从「消失的 1 千粉丝」谈及 toFixed 的坑
date: 2020/06/14 10:00:00
tags: 
  - ECMAScript
  - JavaScriptCore
permalink: /pages/fdca7f/
categories: 
  - 大前端
  - 前端基础
  - 浏览器原理
  - V8 执行引擎
---

## 故事是这样的

小郑是某平台一位 UP 🐷，经过两年努力现在平台粉丝也有 994500 个了，距离冲击百万 UP 仅剩一步之遥。

![99.45w](https://upload-images.jianshu.io/upload_images/9277731-4c8db063ccdf1ca1.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

金主爸爸告诉他，只要百万，就让他接个大的广告单。

奈何最近没有灵感，天天🕊，始终不涨粉。

于是他便打起了歪主意，买粉！先到某宝上买了 1 千粉丝试试水，很快，对方说已到账。

小郑兴冲冲的上平台上一看，并没有，还是显示的 `99.5` ，1 千个粉丝去哪了？？

<!--more-->

正准备投诉商家时，鼠标下滑看到了这样的一幕！

![99.55w](https://upload-images.jianshu.io/upload_images/9277731-4790996ca7d0b42f.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

具体粉丝数确实是正确的，按照小学教的的四舍五入，应该显示 `99.6万` 才对。

难道是平台的 bug ?不解的小郑打算向程序员朋友小盖询问，小盖一看：

「 这应该是用了 toFixed 了吧，这方法有个坑。。容我细细道来 」

> 以上故事纯属虚构（包括图片）

## toFixed 是什么

以下引自 [MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Number/toFixed) 的定义

```
numObj.toFixed(digits)
```

返回指定 digits 位数的字符串，必要时会进行四舍五入。看以下例子

```js
99.45.toFixed(1);   // "99.5"
99.99.toFixed(1);   // "100.0"
99.55.toFixed(1);   // "99.5" warning: 见下面解释
```

是不是发现第三个例子不太对？

我们知道，js 中的浮点数内部是用双精度 64位（double）表示的，采用的是 [IEEE 754 表示法](https://en.wikipedia.org/wiki/IEEE_754)，

所以 `99.55` 实际是 `99.549999999999997`
> 网上有[在线工具](https://www.binaryconvert.com/convert_double.html?decimal=057057046053053)可以直接算出来

那么很明显可以看出来答案，四舍五入结果就是 `99.5` 

so，得到答案了，本文结束?

我们再看下 ecmascript 规范是怎么描述的

[Number.prototype.toFixed ( fractionDigits )](http://www.ecma-international.org/ecma-262/6.0/#sec-number.prototype.tofixed)

![toFixed](https://upload-images.jianshu.io/upload_images/9277731-b6ba435aed1e5c67.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

关键看红色区域，我们需要找个一个 n ，使其 `n / 10 - 99.55` 尽可能接近零。 找到 n 之后后面的结果就都确定了。

（额，看起来好像很复杂的样子，不是直接对小数位四舍五入。。）

假设 n 为 995,则 m 为 "995", k = m.length = 3, a = "99", b = "5", 最终结果为 "99.5"

那么 n 是不是 995 呢？

满足 `n / 10 - 99.55` 尽可能接近零这个条件的有两个数： 995,996 而他们的计算结果分别为：

```js
995/10 - 99.55 // -0.04999999999999716
996/10 - 99.55 //  0.04999999999999716
```

和 0 间的差值是一样的，选大的结果是 996 ，可我们运行的结果却是 99.5 ，这又是为何？难道浏览器引擎的实现有误？或者没按规范实现？

对比了几个引擎，结果都是 995，我们先看一哈 JavaScriptCore (Webkit 的 js 引擎) 实现

## JavaScriptCore toFixed 源码


源码在 `webkit/Source/JavaScriptCore/runtime/NumberPrototype.cpp` 中的 numberProtoFuncToFixed 方法

在 JavaScriptCore 中，原型方法很好找，就是 xxxProtoFuncXxx 的结构

### 调试环境 

（本小结可以选择略过，直接看后面的分析和小结）

在 macOS 上编译 webkit 比 v8 简单多了，详见 [Setup and Debug JavaScriptCore / WebKit](https://liveoverflow.com/setup-and-debug-javascriptcore-webkit-browser-0x01/)

通过以下命令进入 debug 环境

```sh
# 利用 lldb 调试 jsc
$ lldb ./WebKitBuild/Debug/bin/jsc
# 开始调试
(lldb) run
>>>
# control + c 再次进入 lldb
# 打断点, 断点方法输几个字符按 Tab 就可以出提示了
(lldb): b JSC::numberProtoFuncToFixed(JSC::JSGlobalObject*, JSC::CallFrame*)
(lldb): b WTF::double_conversion::FastFixedDtoa(double, int, WTF::double_conversion::BufferReference<char>, int*, int*) 
# 结束调试，切到 jsc, 需要按 2次回车
(lldb): c
# 输入 js 代码，回车进入 lldb 调试环境
>>> 99.55.toFixed(1)
# EncodedJSValue JSC_HOST_CALL numberProtoFuncToFixed(JSGlobalObject* globalObject, CallFrame* callFrame)
```

jsc 常用指令
```sh
describe(x) #查看对象（js在 c 中均为对象） 的内部描述，结构，内存地址
```

lldb 常用指令
> 增强插件 chisel ，更多使用方法后续写一篇文章，
```sh
x/8gx address #查看内存地址 address

next(n) #单步执行
step(s) #进入函数
continue(c) #将程序运行到结束或者断点处（进入下一断点）
finish #将程序运行到当前函数返回（从函数跳出）
breakpoint(b) 行号/函数名 <条件语句> #设置断点
fr v #查看局部变量信息
print(p) x #输出变量 x 的值
```

### 源码分析

入口，各种情况的处理

```c
EncodedJSValue JSC_HOST_CALL numberProtoFuncToFixed(JSGlobalObject* globalObject, CallFrame* callFrame)
{
    VM& vm = globalObject->vm();
    auto scope = DECLARE_THROW_SCOPE(vm);

    // x 取值 99.549999999999997
    double x;
    if (!toThisNumber(vm, callFrame->thisValue(), x))
        return throwVMToThisNumberError(globalObject, scope, callFrame->thisValue());

    // decimalPlaces 取值 1
    int decimalPlaces = static_cast<int>(callFrame->argument(0).toInteger(globalObject));
    RETURN_IF_EXCEPTION(scope, { });

    // 特殊处理，略
    if (decimalPlaces < 0 || decimalPlaces > 100)
        return throwVMRangeError(globalObject, scope, "toFixed() argument must be between 0 and 100"_s);

    // x 的特殊处理，略
    if (!(fabs(x) < 1e+21))
        return JSValue::encode(jsString(vm, String::number(x)));

    // NaN or Infinity 的特殊处理
    ASSERT(std::isfinite(x));

    // 进入执行 number=99.549999999999997, decimalPlaces=1
    return JSValue::encode(jsString(vm, String::numberToStringFixedWidth(x, decimalPlaces)));
}
```

从 numberToStringFixedWidth 方法不断进入，到达 FastFixedDtoa 处理方法

需要注意的是，原数值的整数和小数部分都分别采用了指数表示法，方便后面位运算处理

`99.549999999999997 = 7005208482886451 * 2 ** -46
= 99 + 38702809297715 * 2 ** -46`

```js
// FastFixedDtoa(v=99.549999999999997, fractional_count=1, buffer=(start_ = "", length_ = 122), length=0x00007ffeefbfd488, decimal_point=0x00007ffeefbfd494)

bool FastFixedDtoa(double v,
                   int fractional_count,
                   BufferReference<char> buffer,
                   int* length,
                   int* decimal_point) {
  const uint32_t kMaxUInt32 = 0xFFFFFFFF;
  // 将 v 表示成 尾数(significand) × 底数(2) ^ 指数(exponent) 
  // 7005208482886451 x 2 ^ -46
  uint64_t significand = Double(v).Significand();
  int exponent = Double(v).Exponent();

  // 省略部分代码

  if (exponent + kDoubleSignificandSize > 64) {
    // ...
  } else if (exponent >= 0) {
    // ...
  } else if (exponent > -kDoubleSignificandSize) {
    // exponent > -53 的情况, 切割数字

    // 整数部分: integrals = 7005208482886451 >> 46 = 99 
    uint64_t integrals = significand >> -exponent;
    // 小数部分(指数表达法的尾数部分): fractionals = 7005208482886451 - 99 << 46  = 38702809297715
    // 指数不变 -46
    // 38702809297715 * (2 ** -46) = 0.5499999999999972
    uint64_t fractionals = significand - (integrals << -exponent);
    if (integrals > kMaxUInt32) {
      FillDigits64(integrals, buffer, length);
    } else {
      // buffer 中放入 "99"
      FillDigits32(static_cast<uint32_t>(integrals), buffer, length);
    }
    *decimal_point = *length;
    // 填充小数部分，buffer 为 "995"
    FillFractionals(fractionals, exponent, fractional_count,
                    buffer, length, decimal_point);
  } else if (exponent < -128) {
    // ...
  } else {
    // ...
  }
  TrimZeros(buffer, length, decimal_point);
  buffer[*length] = '\0';
  if ((*length) == 0) {
    // The string is empty and the decimal_point thus has no importance. Mimick
    // Gay's dtoa and and set it to -fractional_count.
    *decimal_point = -fractional_count;
  }
  return true;
}

```

FillFractionals 用来填充小数部分，取几位，是否进位都在该方法中处理

```c
// FillFractionals(fractionals=38702809297715, exponent=-46, fractional_count=1, buffer=(start_ = "99���", length_ = 122), length=0x00007ffeefbfd488, decimal_point=0x00007ffeefbfd494)


/*
小数部分的二进制表示法： fractionals * 2 ^ -exponent
38702809297715 * (2 ** -46) = 0.5499999999999972

前提：
  -128 <= exponent <=0。
  0 <= fractionals * 2 ^ exponent < 1 
  buffer 可以保存结果
此函数将舍入结果。在舍入过程中，此函数未生成的数字可能会更新，且小数点变量可能会更新。如果此函数生成数字 99，并且缓冲区已经包含 “199”（因此产生的缓冲区为“19999”），则向上舍入会将缓冲区的内容更改为 “20000”。
*/
static void FillFractionals(uint64_t fractionals, int exponent,
                            int fractional_count, BufferReference<char> buffer,
                            int* length, int* decimal_point) {
  ASSERT(-128 <= exponent && exponent <= 0);
  if (-exponent <= 64) { 
    ASSERT(fractionals >> 56 == 0);
    int point = -exponent; // 46

    // 每次迭代，将小数乘以10，去除整数部分放入 buffer

    for (int i = 0; i < fractional_count; ++i) { // 0->1
      if (fractionals == 0) break;

      // fractionals 乘以 5 而不是乘以 10 ，并调整 point 的位置，这样， fractionals 变量将不会溢出。然后整体相当于乘以 10
      // 不会溢出的验证过程：
      // 循环初始： fractionals < 2 ^ point , point <= 64 且 fractionals < 2 ^ 56
      // 每次迭代后， point-- 。
      // 注意 5 ^ 3 = 125 < 128 = 2 ^ 7。
      // 因此，此循环的三个迭代不会溢出 fractionals （即使在循环体末尾没有减法）。
      // 与此同时 point 将满足 point <= 61，因此 fractionals < 2 ^ point ，并且 fractionals 再乘以 5 将不会溢出(<int64)。


      // 该操作不会溢出，证明见上方
      fractionals *= 5; // 193514046488575
      point--; // 45
      int digit = static_cast<int>(fractionals >> point); // 193514046488575 * 2 ** -45 = 5
      ASSERT(digit <= 9);
      buffer[*length] = static_cast<char>('0' + digit); // '995'
      (*length)++;
      // 去掉整数位
      fractionals -= static_cast<uint64_t>(digit) << point; // 193514046488575 - 5 * 2 ** 45 = 17592186044415 
      // 17592186044415 * 2 ** -45 = 0.4999999999999716 
    }
    // 看小数的下一位是否值得让 buffer 中元素进位
    // 通过乘2看是否能 >=1 来判断
    ASSERT(fractionals == 0 || point - 1 >= 0);
    // 本例中 17592186044415 >> 44 = 17592186044415 * 2 ** -44 = 0.9999999999999432 , & 1 = 0
    if ((fractionals != 0) && ((fractionals >> (point - 1)) & 1) == 1) {
      RoundUp(buffer, length, decimal_point);
    }
  } else {  // We need 128 bits.
    // ...
  }
}


```

这样就得到了 995 ，即规范描述中的 n ，后面插入一个小数点即为最终结果 99.5

### 小结

js 引擎并没有按规范中说的，去寻找一个 n ，使其 `n / (10 ^ f)` 尽可能等于 x ，感觉这样效率太慢了。而是直接将 x 分为整数和小数部分，并采用指数表示法分别进行计算。

处理小数的时候，其实就是让小数点右移。用指数表示法的时候，其中有个细节就是考虑了底数直接 `*10` 可能会导致溢出，然后采用了 `底数 *5 ，指数递减` 的方式 ，注释中给出了证明。 在 f 位计算后，最后再计算下一位，看是否需要进位。

当然，最终结果不符合我们日常的计算，核心还是在于 IEEE 754 表示法

99.55 在调试初期取值就是 99.549999999999997 了

因此，以后用 toFixed 方法的时候，要是担心没有正常四舍五入，就先去 [在线工具](https://www.binaryconvert.com/convert_double.html?decimal=057057046053053) 上查看看

## V8 toFixed 源码

[v8 toFixed](https://source.chromium.org/chromium/chromium/src/+/master:v8/src/builtins/builtins-number.cc;l=67?q=NumberPrototypeToFixed&ss=chromium%2Fchromium%2Fsrc:v8%2F)

入口在这，就不再分析了，和 JavaScriptCore 大同小异，感兴趣的读者可以自行查看

```c
// ES6 section 20.1.3.3 Number.prototype.toFixed ( fractionDigits )
BUILTIN(NumberPrototypeToFixed) {

  // ... 省略参数解析，拆包，类型判断
  
  // value_number 和 fraction_digits_number 即为我们目标值
  // 假设 value_number = 99.55, fraction_digits_number = 1.0
  double const value_number = value->Number();
  double const fraction_digits_number = fraction_digits->Number();

  // ... 省略范围检查

  // ... 省略 value_number 特殊值处理： Infinity NaN

  // 实际处理方法 DoubleToFixedCString
  char* const str = DoubleToFixedCString(
      value_number, static_cast<int>(fraction_digits_number));
  Handle<String> result = isolate->factory()->NewStringFromAsciiChecked(str);
  DeleteArray(str);
  return *result;
}
```

## 正确的 「四舍五入」

那如何写出一个符合常理的四舍五入方法呢？我们可以借助 [Math.round](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Math/round) 方法实现

### Math.round(x)

给定数字的值 x 四舍五入到最接近的整数。

- 如果 x 的小数部分大于 0.5，则舍入到相邻的绝对值更大的整数。 
- 如果 x 的小数部分小于 0.5，则舍入到相邻的绝对值更小的整数。
- 如果参数的小数部分恰好等于0.5，则舍入到相邻的在正无穷（+∞）方向上的整数。
  > ⚠️ 注意： 与很多其他语言中的round()函数不同，Math.round()并不总是舍入到远离0的方向（尤其是在负数的小数部分恰好等于0.5的情况下）。

举例
```js
Math.round(99.51) // 100
Math.round(99.5) // 100
Math.round(99.49) //99
Math.round(-99.51) // -100
Math.round(-99.5) // -99
Math.round(-99.49) //-99 
```

### 代码

```js
// 注意，要用除法。若用乘法的话，乘以小数，该小数是不精确的 （还是上面的原因，ieee 754 表示法）
// 996 * 0.1 = 99.60000000000001
function round(number, precision=0) {
    return Math.round(+number + 'e' + precision) / (10 ** precision)
    //same as:
    //return Number(Math.round(+number + 'e' + precision) + 'e-' + precision);
}

round(99.55,1) // 99.6
round(-99.5,0) // -99
```

对负数进行，比如 -99.5 四舍五入按其他平台处理，取值 -100

```js
/**
 * 
 * @param {*} number 
 * @param {*} precision 
 * @param {boolean} flag 负数四舍五入是否按远离 0 处理
 */
function round(number, precision = 0, flag = false) {
    if (flag && number < 0) {
        return -round(Math.abs(number), precision)
    }
    return Math.round(+number + 'e' + precision) / (10 ** precision)
}
round(99.55,1) // 99.6
round(-99.55,1) // -99.5
round(-99.55,1,true) // -99.6
```

之前想说还需要考虑溢出，因为发现我们自己实现的 round 和 toFixed 都不符合预期
```js
round(999999999955.2376236232, 6) // 999999999955.2378
999999999955.2376236232.toFixed(6) // "999999999955.237671
```

后来发现 `999999999955.2376236232` 这个数字在 64 位中就无法表示了，只能表示为 `9.999999999552376708984375e11`

所以，溢出的例子我们就不考虑了。

PS: 处理时发现的一个方法 `Math.trunc` 可以直接拿到整数部分，不管正负，不像 `Math.floor` 对于负数会向下取整

### 回到问题，平台如何修复这个bug

平台上的粉丝数显示遵从这样几个原则：
1. 小于 1 万，直接显示
2. 小于 1 亿，四舍五入保留一位小数，若小数部分为 0 ，则不显示
3. 大于等于 1 亿，四舍五入保留一位小数，若小数部分为 0 ，则不显示

利用刚刚写的 round 函数操作一波

```js
function round(number, precision = 0, flag = false) {
    if (flag && number < 0) {
        return -round(Math.abs(number), precision)
    }
    return Math.round(+number + 'e' + precision) / (10 ** precision)
}
const formatNumForAvatar = num => {
    if (num >= 1e+8) {
        return {
            num: round(num / 1e+8, 1),
            unit: '亿'
        }
    }
    if (num >= 1e+4) {
        return {
            num: round(num / 1e+4, 1),
            unit: "万"
        }
    }
    return {
        num: num <= 0 ? 0 : num
    }
}
/**
 * 测试用例
 */

formatNumForAvatar(9999) // {num: 9999}
formatNumForAvatar(99999) // {num: 10, unit: "万"}
formatNumForAvatar(995500) // {num: 99.6, unit: "万"}
formatNumForAvatar(99999900) // {num: 10000, unit: "万"}
formatNumForAvatar(109999900) // {num: 1.1, unit: "亿"}
```

还是有问题，没有处理好 `10000 万` 这种 case

目前想到的就是增加判断条件，或者硬编码

```js
function round(number, precision = 0, flag = false) {
    if (flag && number < 0) {
        return -round(Math.abs(number), precision)
    }
    return Math.round(+number + 'e' + precision) / (10 ** precision)
}
const formatNumForAvatar = num => {
    // 处理 99995000+ 的情况
    if (num >= 1e+8 - 5000) {
        return {
            num: round(num / 1e+8, 1),
            unit: '亿'
        }
    }
    if (num >= 1e+4) {
        return {
            num: round(num / 1e+4, 1),
            unit: "万"
        }
    }
    return {
        num: num <= 0 ? 0 : num
    }
}
/**
 * 测试用例
 */

formatNumForAvatar(9999) // {num: 9999}
formatNumForAvatar(99999) // {num: 10, unit: "万"}
formatNumForAvatar(995500) // {num: 99.6, unit: "万"}
formatNumForAvatar(99994999) // {num: 9999.5, unit: "万"}
formatNumForAvatar(99999900) // {num: 1, unit: "亿"}
formatNumForAvatar(109999900) // {num: 1.1, unit: "亿"}
```

如果有其他更好的方式欢迎评论~



## 最后

从发现问题，到写下这篇文章拖了大概 2 周了，主要是之前对 JS 引擎调试完全不了解

光搭建 v8 调试环境就花了好几个晚上，包括 macOS 上 gdb 的坑，V8 构建的坑，断点调试的坑，如何配合 vscode 等等... 后面会再出几篇文章讲这个，欢迎关注

如果是 macOS 上，建议还是去看 JavaScriptCore 源码吧，这些基础方法实现，其实大部分和 V8 是一样的

## 参考文档


- [JavaScriptCore 编译调试](https://liveoverflow.com/setup-and-debug-javascriptcore-webkit-browser-0x01/)
- [调试 WebKit](https://zhuanlan.zhihu.com/p/26144355)