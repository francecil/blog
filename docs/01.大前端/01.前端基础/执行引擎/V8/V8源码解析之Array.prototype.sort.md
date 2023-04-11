---
title: V8源码解析之Array.prototype.sort
date: 2019/07/04 00:00:00
tags: 
  - ECMAScript
  - V8
permalink: /pages/223f25/
---

## 前言

先问个问题，以下代码输出什么？

```js
[1,2,13,14,5,6,17,18,9,10,11,12,31,41].sort(()=>0)
```

<!--more-->

聪明的你可以会认为，这不是返回元素顺序不变的数组么？


emmm 正常来说，的确如此，然后有个小伙伴(chrome v59 环境)遇到一个这样的问题

```js
[1,2,13,14,5,6,17,18,9,10,11,12,31,41].sort(()=>0)
// [18,1,13,14,5,6,17,2,9,10,11,12,31,41]
[1,2,13,14,5,6,17,18,9,10].sort(()=>0)
// [1,2,13,14,5,6,17,18,9,10]
```
然后我在自己电脑上( chrome v76 )测试是这样的结果
```js
[1,2,13,14,5,6,17,18,9,10,11,12,31,41].sort(()=>0)
// [1,2,13,14,5,6,17,18,9,10,11,12,31,41]
[1,2,13,14,5,6,17,18,9,10].sort(()=>0)
// [1,2,13,14,5,6,17,18,9,10]
```

我们知道，给一个 sort 的比较函数中返回0，表示当前比较的两个元素相等

照理说，`sort(()=>0)` 后数组的元素顺序是不变的，和我的测试效果一致，

那为什么在 低版本的 chrome 上，不同长度的数组运用 `sort(()=>0)` 后效果不一样呢？

本文就来做个解析。通过本文，你可以了解到：
- Array.prototype.sort 的实现细节与遗留问题
- 如何看 JS 源码


## 定义

```
arr.sort([compareFunction])
```
这里我们引用 MDN 的一段话：
> 如果 compareFunction(a, b) 小于 0 ，那么 a 会被排列到 b 之前；
> 
> 如果 compareFunction(a, b) 大于 0 ， b 会被排列到 a 之前。
> 
> 如果 compareFunction(a, b) 等于 0 ， a 和 b 的相对位置不变。备注： [ECMAScript 标准](http://yanhaijing.com/es5/#353)并不保证这一行为，而且也不是所有浏览器都会遵守（例如 Mozilla 在 2003 年之前的版本）

也就是说，有些浏览器不遵循 `compareFunction(a, b) 等于 0时， a 和 b 的相对位置不变` 的规则

这里我们看出来了，chrome v59 就是不遵循该规则的。 但是数组长度较小时好像又遵循了？

这里我们猜测不同长度的数组会运用不同的排序算法

在分析源码之前，我们先简单提下，什么是 插入排序 和 快速排序

## 排序算法

我们假设比较函数为
```js
comparefn = (a,b)=> a-b
```

### 1. 插入排序
> 遍历数组，将每个待排序元素插入到前面已排序的适当位置

插入排序分为直接插入排序、二分查找插入排序、希尔排序

由于 v8 也只是用了直接插入排序，这里我们只实现它,其他几种不进行讨论，想要了解的可以参考--[优化的直接插入排序](https://www.cnblogs.com/heyuquan/p/insert-sort.html)


![引用自 wikipedia](https://upload-images.jianshu.io/upload_images/9277731-e6e3d03ebc90be7b.gif?imageMogr2/auto-orient/strip)

实现代码如下：

```js
function InsertionSort(array) {
  for (let i = 1; i < array.legnth; i++) {
    let element = array[i];
    // 将待排序元素element插入对应位置
    for (let j = i - 1; j >= 0; j--) {
      let tmp = array[j];
      // comparefn > 0 表示element要排在tmp之前
      if (comparefn(tmp, element) > 0) {
        a[j + 1] = tmp;
      } else {
        //
        break;
      }
    }
    a[j + 1] = element;
  }
};
```

### 2. 快速排序

> 设定一个基准，利用该基准值大小将数组分为左右两部分
> 
> 此时左右两部分可以独立排序，分别对左右两部分进行上面的操作
> 
> 递归处理，直至数组排序完成

考虑到空间消耗，现在的快速排序一般都是指`原地算法`的快速排序

关于原地算法，参看 https://en.wikipedia.org/wiki/In-place_algorithm

下面有两者实现，基准值取左边的或者右边，效果差不多

![引用自 wikipedia](https://upload-images.jianshu.io/upload_images/9277731-fde423214816b518.gif?imageMogr2/auto-orient/strip)

```js
function qsort(array){
  function swap(arr,i1,i2){
    let tmp = arr[i1]
    arr[i1] = arr[i2]
    arr[i2] = tmp
  }
  function partition(arr, left, right){
    let storeIndex = left // 其值等于表示已找到的小于基准值的元素个数
    let pivot = arr[right] //基准
    for(let i=left;i<right;i++){
      if(arr[i]<pivot){
        swap(arr,storeIndex++,i)
      }
    }
    swap(arr,storeIndex,right)
    return storeIndex
  }
  // 基准在左边
  // function partition(arr, left, right){
  //   let storeIndex = left
  //   let pivot = arr[left] //基准
  //   for(let i = left+1;i<=right;i++){
  //     if(arr[i]<pivot){
  //       swap(arr,++storeIndex,i)
  //     }
  //   }
  //   swap(arr,storeIndex,left)
  //   return storeIndex
  // }
  function sort(arr,left,right){
    if(left<right){
      let storeIndex = partition(arr, left, right);
      sort(arr, left, storeIndex - 1);
      sort(arr, storeIndex + 1, right);
    }
  }
  sort(array, 0, array.length - 1);
  return array
}
```

## v8 源码分析

理解了基本的排序算法，接下来我们开始研究源码。

比较 chrome v59 和 chrome v76 的 v8 实现差异在哪

### 如何查找对应chrome版本的 v8 源码

打开`chrome://version/`

上面显示的 JavaScript 即是 v8 的版本
```
Google Chrome	76.0.3809.132 (正式版本) （64 位） (cohort: Stable)
操作系统	Windows 10 OS Version 1809 (Build 17763.316)
JavaScript	V8 7.6.303.29
```
也正如 [V8’s version numbering scheme](https://v8.dev/docs/version-numbers) 所述

`Chromium 76` 对应 v8 的 `7.6`

接着我们直接去 [v8](https://github.com/v8/v8) 查看源码，这里主要看两个版本的

### 5.9.221

对应的排序算法 [源码地址](https://github.com/v8/v8/blob/5.9.221/src/js/array.js#L709)

*结合测试用例看更佳 [/test/mjsunit/array-sort](https://github.com/v8/v8/blob/5.9.221/test/mjsunit/array-sort.js)*

可以看出来，早期v8 排序的实现逻辑是用js写的，对应的实现为 ArraySort


```js
utils.InstallFunctions(GlobalArray.prototype, DONT_ENUM, [
  ...
  "sort", getFunction("sort", ArraySort),
  ...
])
```
- ArraySort 

没有什么有用代码，直接进入 InnerArraySort
```js
function ArraySort(comparefn) {
  CHECK_OBJECT_COERCIBLE(this, "Array.prototype.sort");

  var array = TO_OBJECT(this);
  var length = TO_LENGTH(array.length);
  return InnerArraySort(array, length, comparefn);
}
```
- InnerArraySort 

对类数组对象以及空洞数组进行特殊处理，然后进行排序
```js
// comparefn 不可调用（未定义，非function等），设置默认函数
if (!IS_CALLABLE(comparefn)) {
  comparefn = function (x, y) {
    if (x === y) return 0;
    if (% _IsSmi(x) && % _IsSmi(y)) {
      return % SmiLexicographicCompare(x, y);
    }
    x = TO_STRING(x);
    y = TO_STRING(y);
    if (x == y) return 0;
    else return x < y ? -1 : 1;
  };
}
if (length < 2) return array;

var is_array = IS_ARRAY(array);
var max_prototype_element;
if (!is_array) {
  // 对 类数组对象（比如 {length:10,0:'c',10:'b'}） 进行排序，兼容 JSC标准
  // 考虑了继承属性，所以效率可能不高，不过这种需要排序的情况较少
  // e.g. 也可以看这个例子 https://github.com/v8/v8/blob/5.9.221/test/mjsunit/array-sort.js#L337
  /*
  let f1 = {1: "c", 3: "f"}
  let f2 = {6: "a", length: 10}
  f2.__proto__ = f1
  f2 // {6: "a", length: 10,__proto__:{1: "c", 3: "f"}}
  Array.prototype.sort.call(f2) // {0: "a", 1: "b", 2: "c", 3: "f", length: 10}
  */
  // 返回自身及原型链中所有属性的个数
  max_prototype_element = CopyFromPrototype(array, length);
}
// 快速RemoveArrayHoles：从数组末尾复制已定义元素填充到前面的空洞（末尾变为空洞）
// 类数组对象等情况不支持快速RemoveArrayHoles，会返回 -1
// 否则 返回已定义元素的个数
var num_non_undefined = % RemoveArrayHoles(array, length);
// 处理类数组对象等情况
if (num_non_undefined == -1) {
  // 返回 类数组对象的已定义实例属性的个数
  num_non_undefined = SafeRemoveArrayHoles(array);
}

QuickSort(array, 0, num_non_undefined);

if (!is_array && (num_non_undefined + 1 < max_prototype_element)) {
  // 处理 原型同名属性 等情况
  ShadowPrototypeElements(array, num_non_undefined, max_prototype_element);
}

return array;
```
其他的特殊处理不在文本论述中，我们直接看排序实现

- QuickSort

``` js
function QuickSort (a, from, to) {
  // 基准选择第一个元素
  var third_index = 0;
  while (true) {
    // 待排序数组长度 <= 10 采用插入排序
    if (to - from <= 10) {
      InsertionSort(a, from, to);
      return;
    }
    if (to - from > 1000) {
      // 每隔 200 ~ 215 （根据 length & 15的结果）个元素取一个值，
      // 然后将这些值进行排序，取中间值的下标
      // 这里的排序其实又是一个递归调用
      third_index = GetThirdIndex(a, from, to);
    } else {
      // 将中间元素设为基准值
      third_index = from + ((to - from) >> 1);
    }
    // 将第一个,中间元素（上面获取的基准值），最后一个元素三者中的中位数作为基准值
    var v0 = a[from];
    var v1 = a[to - 1];
    var v2 = a[third_index];
    var c01 = comparefn(v0, v1);
    if (c01 > 0) {
      // v1 < v0, so swap them.
      var tmp = v0;
      v0 = v1;
      v1 = tmp;
    } // v0 <= v1.
    var c02 = comparefn(v0, v2);
    if (c02 >= 0) {
      // v2 <= v0 <= v1.
      var tmp = v0;
      v0 = v2;
      v2 = v1;
      v1 = tmp;
    } else {
      // v0 <= v1 && v0 < v2
      var c12 = comparefn(v1, v2);
      if (c12 > 0) {
        // v0 <= v2 < v1
        var tmp = v1;
        v1 = v2;
        v2 = tmp;
      }
    }
    // 最终效果 v0 <= v1 <= v2
    a[from] = v0;
    a[to - 1] = v2;
    var pivot = v1;
    var low_end = from + 1;   // 比基准值小的元素的上界
    var high_start = to - 1;  // 比基准值大的元素的下界
    // 将基准值与 from + 1 位置的元素进行互换
    // 此时 from + 1 位置的元素肯定是要排 form 位置后面的
    a[third_index] = a[low_end];
    a[low_end] = pivot;

    // 划分函数 将小于（假设升序排序）基准值的元素排在左边
    partition: for (var i = low_end + 1; i < high_start; i++) {
      var element = a[i];
      var order = comparefn(element, pivot);
      if (order < 0) {
        a[i] = a[low_end];
        a[low_end] = element;
        low_end++;
      } else if (order > 0) {
        // 当待排序元素大于基准值时，
        // 与到右侧第一个小于基准值的元素互换
        do {
          high_start--;
          if (high_start == i) break partition;
          var top_elem = a[high_start];
          order = comparefn(top_elem, pivot);
        } while (order > 0);
        a[i] = a[high_start];
        a[high_start] = element;
        // 该元素小于基准值，需要排在基准值左边
        if (order < 0) {
          element = a[i];
          a[i] = a[low_end];
          a[low_end] = element;
          low_end++;
        }
      }
    }
    // 对左右两个子数组再进行排序
    // 先处理待排序元素较少的
    if (to - high_start < low_end - from) {
      QuickSort(a, high_start, to);
      to = low_end;
    } else {
      QuickSort(a, from, low_end);
      from = high_start;
    }
  }
};
```

在基准选择上做了各种处理，详细看注释

以正常的升序排序为例
```
array = [1,2,13,14,5,6,17,18,9,10,11,12,31,14,51]
comparefn = (a,b)=>a-b
```

第一轮执行过程如下：

1. third_index = 7, from = 0, to = 15, pivot = a[7] = 18, low_end = 1, high_start = 14, a[7] = a[1] = 2, a[1] = 18
    > [1,18,13,14,5,6,17,2,9,10,11,12,31,14,51]
2. 进入 partition 循环，从 i=2开始比较
3. i=2,由于 a[i] < pivot, 此时 a[2] = a[low_end] = a[1] = 18, low_end = 2
    > [1,13,18,14,5,6,17,2,9,10,11,12,31,14,51]
4. 直到 i=12 才出现 a[i]=31 > pivot, 这段过程结束后 low_end = 11
    > [1,13,14,5,6,17,2,9,10,11,12,18,31,14,51]
5. i=12,由于 a[12] = 31 > pivot,high_start = 13,由于 a[13] < pivot,a[i=12]=a[13]=14,a[13]=31
    > [1,13,14,5,6,17,2,9,10,11,12,18,14,31,51]
6. 同时由于 a[13] < pivot，a[12] = a[low_end] = a[11] = 18,a[11] = 31, low_end = 12
    > [1,13,14,5,6,17,2,9,10,11,12,14,18,31,51]
7. i < high_start 不成立，循环中断
8. to - high_start = 14-13=1，low_end - from = 12，分别进行 QuickSort(a,13,14) 和 QuickSort(a,0,12)
9. 继续新一轮的执行

看上去没有什么问题，这次采用开头的例子

```
array = [1,2,13,14,5,6,17,18,9,10,11,12,31,14,51]
comparefn = (a,b)=>0
```

第一轮执行过程如下：

1. third_index = 7, from = 0, to = 15, v0=a[0]=1,v[1]=a[14]=51,v[2]=a[7]=18,
2. 由于 comparefn(v0, v2)>=0,表示 v2 <= v0 <= v1,v0=18,v1=1,v2=51, a[0]=18,a[14]=51,pivot = v1 = 1, low_end = 1, high_start = 14, a[7] = a[1] = 2, a[1] = 1
    > [18,1,13,14,5,6,17,2,9,10,11,12,31,14,51]
2. 进入 partition 循环，从 i=2开始比较,由于 comparefn(element, pivot)=0 不进行处理直至循环结束
3. to - high_start = 14-14=0，low_end - from = 0，故先进行 QuickSort(a,0,0) 再进入循环判断 QuickSort(a,14,14)
4. 判断结束，返回 [18,1,13,14,5,6,17,2,9,10,11,12,31,14,51]

可以看出来，v8源码有两个问题

#### ① v0,v1,v2 的交换处理代码
```js
comparefn = (a,b)=>0
function swap ([v0, v1, v2]) {
  // 给定 v0,v1,v2
  // 对其进行排序，保证 v0<=v1<=v2
  var c01 = comparefn(v0, v1);
  if (c01 > 0) {
    // v1 < v0, so swap them.
    var tmp = v0;
    v0 = v1;
    v1 = tmp;
  }
  // 此时 v0 <= v1.
  var c02 = comparefn(v0, v2);
  if (c02 > 0) {
    // v2 < v0 <= v1.的情况 进行交换
    var tmp = v0;
    v0 = v2;
    v2 = v1;
    v1 = tmp;
  } else {
    // v0 <= v1 && v0 <= v2
    var c12 = comparefn(v1, v2);
    if (c12 > 0) {
      // v1 > v2
      var tmp = v1;
      v1 = v2;
      v2 = tmp;
    }
  }
  return [v0, v1, v2]
}

```
主要是 c02 的判断上改为 `>` ,保证 v0与v2相同时 不会进行交换

#### ② 重新赋值

原来代码在交换后，做了这些操作，没有考虑相等的情况

```js
a[from] = v0;
a[to - 1] = v2;
var pivot = v1;
var low_end = from + 1;   // Upper bound of elements lower than pivot.
var high_start = to - 1;  // Lower bound of elements greater than pivot.
a[third_index] = a[low_end];
a[low_end] = pivot;
```
假设 v0,v1,v2的顺序不变，但是原来 `a[to-1]` 的值是v1 此时变成v2,故在一开始赋值时应该变更顺序
```js
var v0 = a[from];
var v1 = a[third_index];
var v2 = a[to - 1];
```
`a[third_index]` 是否与 `a[low_end]` 交换，也应该做个判断
```js
if(comparefn(pivot,a[low_end])!==0){
  a[third_index] = a[low_end];
  a[low_end] = pivot;
} else {
  a[third_index] = pivot
}
```

**优化后的快排函数**
```js
function ArraySort (array, comparefn) {
  function InsertionSort (a, from, to) {
    for (var i = from + 1; i < to; i++) {
      var element = a[i];
      for (var j = i - 1; j >= from; j--) {
        var tmp = a[j];
        var order = comparefn(tmp, element);
        if (order > 0) {
          a[j + 1] = tmp;
        } else {
          break;
        }
      }
      a[j + 1] = element;
    }
  };

  function GetThirdIndex (a, from, to) {
    var t_array = new Array();
    // Use both 'from' and 'to' to determine the pivot candidates.
    var increment = 200 + ((to - from) & 15);
    var j = 0;
    from += 1;
    to -= 1;
    for (var i = from; i < to; i += increment) {
      t_array[j] = [i, a[i]];
      j++;
    }
    t_array.sort(function (a, b) {
      return comparefn(a[1], b[1]);
    });
    var third_index = t_array[t_array.length >> 1][0];
    return third_index;
  }
  function QuickSort (a, from, to) {
    // 基准选择第一个元素
    var third_index = 0;
    while (true) {
      // 待排序数组长度 <= 10 采用插入排序
      if (to - from <= 10) {
        InsertionSort(a, from, to);
        return;
      }
      if (to - from > 1000) {
        // 每隔 200 ~ 215 （根据 length & 15的结果）个元素取一个值，
        // 然后将这些值进行排序，取中间值的下标
        // 这里的排序其实又是一个递归调用
        third_index = GetThirdIndex(a, from, to);
      } else {
        // 将中间元素设为基准值
        third_index = from + ((to - from) >> 1);
      }
      // 将第一个,中间元素（上面获取的基准值），最后一个元素三者中的中位数作为基准值
      var v0 = a[from];
      var v1 = a[third_index];
      var v2 = a[to - 1];
      var c01 = comparefn(v0, v1);
      if (c01 > 0) {
        // v1 < v0, so swap them.
        var tmp = v0;
        v0 = v1;
        v1 = tmp;
      }
      // 此时 v0 <= v1.
      var c02 = comparefn(v0, v2);
      if (c02 > 0) {
        // v2 < v0 <= v1.的情况 进行交换
        var tmp = v0;
        v0 = v2;
        v2 = v1;
        v1 = tmp;
      } else {
        // v0 <= v1 && v0 <= v2
        var c12 = comparefn(v1, v2);
        if (c12 > 0) {
          // v1 > v2
          var tmp = v1;
          v1 = v2;
          v2 = tmp;
        }
      }
      // 最终效果 v0 <= v1 <= v2
      a[from] = v0;
      a[to - 1] = v2;
      var pivot = v1;
      var low_end = from + 1;   // 比基准值小的元素的上界
      var high_start = to - 1;  // 比基准值大的元素的下界
      // 将基准值与 from + 1 位置的元素进行互换
      // 此时 from + 1 位置的元素肯定是要排 form 位置后面的
      if (comparefn(pivot, a[low_end]) !== 0) {
        a[third_index] = a[low_end];
        a[low_end] = pivot;
      } else {
        a[third_index] = pivot
      }

      // 划分函数 将小于（假设升序排序）基准值的元素排在左边
      partition: for (var i = low_end + 1; i < high_start; i++) {
        var element = a[i];
        var order = comparefn(element, pivot);
        if (order < 0) {
          a[i] = a[low_end];
          a[low_end] = element;
          low_end++;
        } else if (order > 0) {
          // 当待排序元素大于基准值时，
          // 与到右侧第一个小于基准值的元素互换
          do {
            high_start--;
            if (high_start == i) break partition;
            var top_elem = a[high_start];
            order = comparefn(top_elem, pivot);
          } while (order > 0);
          a[i] = a[high_start];
          a[high_start] = element;
          // 该元素小于基准值，需要排在基准值左边
          if (order < 0) {
            element = a[i];
            a[i] = a[low_end];
            a[low_end] = element;
            low_end++;
          }
        }
      }
      // 对左右两个子数组再进行排序
      // 先处理待排序元素较少的
      if (to - high_start < low_end - from) {
        QuickSort(a, high_start, to);
        to = low_end;
      } else {
        QuickSort(a, from, low_end);
        from = high_start;
      }
    }
  };
  QuickSort(array, 0, array.length)
  return array
}
ArraySort([1,2,13,14,5,6,17,18,9,10,11,12,31,41],()=>0)
//  [1, 2, 13, 14, 5, 6, 17, 18, 9, 10, 11, 12, 31, 41]
ArraySort([1,2,13,14,5,6,17,18,9,10,11,12,31,41],(a,b)=>a-b)
//  [1, 2, 5, 6, 9, 10, 11, 12, 13, 14, 17, 18, 31, 41]
```

### 7.6.303

根据 [V8引擎中的排序](https://juejin.im/post/5c472940e51d455249762bef) 得知，在v8 的7.0版本中修改了 Array.prototype.sort 的实现，不再采用js实现，进而采用一直叫 `Torque` 的语言，类似 TypeScript，强类型。
> v8 中的 src/js/array.js 在大概 7.2之后的版本删除，中间几个版本用来迁移 array的其他方法

源码路径 [/third_party/v8/builtins/array-sort.tq](https://github.com/v8/v8/blob/7.6.303/third_party/v8/builtins/array-sort.tq)

可以得知，sort 更换了实现，采用了 [TimSort 排序算法](https://en.wikipedia.org/wiki/Timsort)

简单的说：
1. 扫描数组，确定其中的单调上升段和严格单调下降段，将严格下降段反转。我们将这样的段称之为run。 
2. 定义最小run长度，短于此的run通过插入排序合并直至长度大于最小run长度； 
3. 反复归并一些相邻run，过程中需要避免归并长度相差很大的run，直至整个排序完成；

实现还是较为复杂的，本文不进行深入，具体的可以查看 [TimSort的实现](https://mp.weixin.qq.com/s?__biz=MzI2MTY0OTg2Nw==&mid=2247483816&idx=1&sn=079af3d70efcb68efa7400f09decb59c&chksm=ea56650cdd21ec1ace7c8fd168d62feb636e4b32f9a4d90329fe479489d8e7a70e612df8920b&token=2074049324&lang=zh_CN#rd) 一文


### 其他

在看源码的时候又发现一个实现差异的问题

chrome v59
```js
[1,,2,,3,4,5].sort(v=>0)
// [1, 5, 2, 4, 3, undefined x 2]
```
chrome 76
```js
[1,,2,,3,4,5].sort(v=>0)
// [1, 2, 3, 4, 5, empty × 2]
```

新版的实现应该是较为科学的

还有一些有趣的差异可以看[这里](https://juejin.im/post/5c472940e51d455249762bef#heading-2)


## 总结

低版本 v8 的快排实现有bug,当数组较小时采用插入排序是没问题的

新版本的chrome所使用的v8版本实现了稳定排序，并解决了一些潜在问题（与开发者想要的实现效果不同）

最后分享一个 `V8源码中寻找JS方法实现` 的技巧

1. 根据部分文件名快速查找文件：https://help.github.com/en/articles/finding-files-on-github
2. 在搜索栏中输入 "Array.prototype.sort" in:file 即可搜索含有全匹配 Array.prototype.sort 内容的文件
3. js方法实现一般在 /src/js/ 和 /src/runtime/ 目录中，参考自 https://www.zhihu.com/question/59792274/answer/169671660
4. 结合 test/mjsunit 一起看源码效果更佳

## 参考
1. [es5中文规范](http://yanhaijing.com/es5/#353)
2. [MDN-Array.prototype.sort](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
3. [【深度】扒开V8引擎的源码，我找到了你们想要的前端算法](https://yalishizhude.com/2019/09/05/v8-sort/)
4. [JavaScript专题之解读 v8 排序源码](https://juejin.im/post/59e80dc6f265da432a7aaf15)
5. [Getting things sorted in V8](https://v8.dev/blog/array-sort)