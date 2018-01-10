
# 数组拓展

## 拓展运算符 ...

该运算符将一个数组，变为参数序列。

## Array.from
**ES5写法：**`[].slice.call()` 
`Array.from`也是**`浅复制`**
将（1）类数组对象(DOM 操作返回的 NodeList 集合、arguments对象 )和（2）可遍历对象（包括set map）转为数组
例：
```
let arrayLike = {
    '0': 'a',
    '1': 'b',
    '2': 'c',
    length: 3};
Array.from(arrayLike)

let map = new Map([
  [1, 'one'],
  [2, 'two'],
  [3, 'three'],
]);

let arr = [...map];
```
Array.from接受第二个参数 类似于数组map方法 对每个元素进行处理，再放回数组
```
let arrayLike ={
    '0': 1,
    '1': 2,
    '2': 3,
    length: 3
}
Array.from(arrayLike , (x) => x * x)
// [1, 4, 9]
```
相比Array.from().map() 省略了一个步骤，测试显示节省一半时间
同理，map需要传this的话，Array.from可以传第三个参数
```
[1,2,3].map(x=>x*x,window)
//等价于
Array.from([1,2,3] , (x) => x * x,window)
```
**应用**
返回字符串长度。
由于大于"\uFFFF"的字符的长度大于1，而我们需求一半是长度算1
故可以把字符串转为数组后得到其数组大小
`return Array.from(str).length`
## Array.of
用于替代`Array()`和`new Array()`
因为后者根据参数个数不同行为有异
```
Array() // []
Array(3) // [, , ,]
Array(3, 11, 8) // [3, 11, 8]
```
采用`Array.of`表现则一致
```
Array.of(3, 11, 8) // [3,11,8]
Array.of(3) // [3]
Array.of(3).length // 1
```

## find和findIndex
find返回第一个返回值为true的成员 若无返回undefined
```
[1, 4, -5, 10].find((n) => n < 0)
// -5
[1, 5, 10, 15].find(function(value, index, arr) {
  return value > 9;
}) // 10
```
findIndex返回第一个返回值为true的成员的索引

## copyWithin
将指定位置的成员复制到其他位置（会覆盖原有成员），然后返回当前数组
```
Array.prototype.copyWithin(target, start = 0, end = this.length)
```
它接受三个参数。

target（必需）：从该位置开始替换数据。
start（可选）：从该位置开始读取数据，默认为 0。如果为负值，表示倒数。
end（可选）：到该位置前停止读取数据，默认等于数组长度。如果为负值，表示倒数。

## fill
使用给定值，填充一个数组
```
new Array(3).fill(7) //[7,7,7]
```
## keys() values() entries()
