# let 和 const

## let

### 块作用域内有效 

### 不存在变量提升

### 暂时性死区（TDZ）


```
if (true) {
  // TDZ开始
  tmp = 'abc'; // ReferenceError
  console.log(tmp); // ReferenceError

  let tmp; // TDZ结束
  console.log(tmp); // undefined

  tmp = 123;
  console.log(tmp); // 123
}
```

### 块作用域内声明函数

https://stackoverflow.com/questions/31419897/what-are-the-precise-semantics-of-block-level-functions-in-es6

浏览器的实现无需按照标准

在块级作用域中采用函数表达式代替函数声明

## const

const 定义常量后，其值不可变。

const定义变量后，保证的不是变量的值不得改动，而是变量所指向的内存地址不得改变。

举例：
```
const MIN = 1
MIN = 0 //TypeError: Assignment to constant variable
const obj = {}
obj.a = 1 //1
obj = {}  //TypeError: Assignment to constant variable
```

obj对象本身仍是可变的，只是所处内存地址不能改变

如果真的想让对象冻结，采用`Object.freeze`方法

```js
let a = {name:{first:'gahing'}}
const foo = Object.freeze(a); //仍可以使用a={} 改变a的内存地址

// 常规模式时，下面一行不起作用；
// 严格模式时，该行会报错
foo.prop = 123;
```

但是对象其下的属性是不起作用的，比如

```
foo.name.last='z'
foo.name //{first: "gahing", last: "z"}
```

## 获取顶层对象

```
(typeof window !== 'undefined'
   ? window
   : (typeof process === 'object' &&
      typeof require === 'function' &&
      typeof global === 'object')
     ? global
     : this);
```

# 正则的拓展

## 增加构造函数

## u修饰符

用于四个字节的字符

```
/𠮷{2}/.test('𠮷𠮷') // false
/𠮷{2}/u.test('𠮷𠮷') // true
```

## y修饰符

和g一样也是全局匹配，只是匹配都是从剩余字符串的第一个字符开始匹配

```
var s = 'aaa_aa_a';
var r1 = /a+/g;
var r2 = /a+/y;

r1.exec(s) // ["aaa"]
r2.exec(s) // ["aaa"] 剩余_aa_a

r1.exec(s) // ["aa"]
r2.exec(s) // null
```
即 y 修饰符号隐含了头部匹配的标志 ^ 

单单一个y修饰符对match方法，只能返回第一个匹配，必须与g修饰符联用，才能返回所有匹配。

```
'a1a2a3'.match(/a\d/y) // ["a1"]
'a1a2a3'.match(/a\d/gy) // ["a1", "a2", "a3"]
```


## 具名组匹配

ES2018引入

```
const RE_DATE = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/;

const matchObj = RE_DATE.exec('1999-12-31');
const year = matchObj.groups.year; // 1999
const month = matchObj.groups.month; // 12
const day = matchObj.groups.day; // 31
```

可以使用`\k<组名>`写法和`\1` 数字引用

```
const RE_TWICE = /^(?<word>[a-z]+)!\k<word>!\1$/;
RE_TWICE.test('abc!abc!abc') // true
RE_TWICE.test('abc!abc!ab') // false
```

# 函数拓展

## 函数默认值

利用函数默认值，可以指定某个参数不得省略否则抛出异常

```
function throwIfMissing() {
  throw new Error('Missing parameter');
}

function foo(mustBeProvided = throwIfMissing()) {
  return mustBeProvided;
}

foo()
// Error: Missing parameter
```

## 严格模式

只要函数参数使用了默认值、解构赋值、或者扩展运算符，那么函数内部就不能显式设定为严格模式

解法有：1.设定全局严格 2.包在无参的立即执行函数中

尾调用优化：严格模式不含以下参数，故可以采用

```
func.arguments：返回调用时函数的参数。
func.caller：返回调用当前函数的那个函数。
```

# 数组拓展

## ES5的一些常用用法

`['a','b','c'].reduce((tot,cur)=>tot+cur) === 'abc'`

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
`Array.from` 接受第二个参数 类似于数组map方法 对每个元素进行处理，再放回数组
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
相比`Array.from().map()` 省略了一个步骤，**测试显示节省一半时间**

同理，map需要传this的话，Array.from可以传第三个参数

```
[1,2,3].map(x=>x*x,window)
//等价于
Array.from([1,2,3] , (x) => x * x,window)
```
**应用**
返回字符串长度。
由于大于"\uFFFF"的字符的长度大于1，而我们需求一般是长度算1
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

# 对象的拓展

## Object.is()

与===相比 不同之处为：**一是+0不等于-0，二是NaN等于自身**

es5可以用

```
function(x, y) {
    if (x === y) {
      // 针对+0 不等于 -0的情况
      return x !== 0 || 1 / x === 1 / y;
    }
    // 针对NaN的情况
    return x !== x && y !== y;
  }
```

## Object.create

>第一个参数为创建对象的原型对象
>传入null时，返回的是一个没有原型的对象（控制台调试下，{}显示 No properties ）
>而创建的{}会有原型

`({}).__proto__ 为一个对象 ,Object.create(null).__proto__===undefined`


# async 函数

```
async function test(){
	await new Promise((res,rej)=>rej())
	console.log('hello')
	await new Promise((res,rej)=>res())
}
test()
//返回 Promise {[[PromiseStatus]]: "rejected", [[PromiseValue]]: undefined}
```
async的是promise对象，其中一步返回或者抛出错误（reject,error）则状态改变,test执行then/catch回调

## await

其后接一个promise对象，非则转

实现重试次数功能

```
const superagent = require('superagent');
const NUM_RETRIES = 3;

async function test() {
  let i;
  for (i = 0; i < NUM_RETRIES; ++i) {
    try {
      await superagent.get('http://google.com/this-throws-an-error');
      break;
    } catch(err) {}
  }
  console.log(i); // 3
}

test();
```
上面代码中，如果await操作成功，就会使用break语句退出循环；如果失败，会被catch语句捕捉，然后进入下一轮循环。

## 注意点

当两个异步操作无继发关系（数据存在依赖），可以利用`Promise.all`
```
let foo = await getFoo();
let bar = await getBar();
//改为
let [foo, bar] = await Promise.all([getFoo(), getBar()]);
```

# Symbol

Symbol函数的参数只是表示对当前 Symbol 值的描述，因此相同参数的Symbol函数的返回值是不相等的

## Symbol 作为属性名

1.不能用点运算符
```
const mySymbol = Symbol();
a.mySymbol = 'Hello!'; //实际是指a['mySymbol'] 为字符串属性 非symbol属性
```

2.使用 Symbol 值定义属性时，Symbol 值必须放在方括号之中。
```
let s = Symbol()
let ss = Symbol()
let obj = {
  [s]:function(arg){},
  [ss]:33
}
obj[s](123)
obj[ss]
```

3.用于定义常量

```
log.levels = {
  DEBUG: Symbol('debug'),
  INFO: Symbol('info'),
  WARN: Symbol('warn')
};
log(log.levels.DEBUG, 'debug message');
log(log.levels.INFO, 'info message');
```
**注** Symbol作为属性名，该属性是公开属性

## 属性名遍历

Symbol 作为属性名，该属性不会出现在for...in、for...of循环，也不会被Object.keys()、Object.getOwnPropertyNames()、JSON.stringify()返回

但是，它也不是私有属性，有一个Object.getOwnPropertySymbols方法，可以获取指定对象的所有 Symbol 属性名。

## Symbol.for()、Symbol.keyFor()

重新使用同一个Symbol值。

`Symbol.for('test')` 搜索是否有以`test`为参数的 Symbol 值，有则返回无则创建并登记到全局

```js
let s1 = Symbol.for('foo');
let s2 = Symbol.for('foo');

s1 === s2 // true

Symbol('foo') === Symbol.for('foo') //false
//原因是Symbol()没有登记机制，后面Symbol.for()将搜索不到
```

`Symbol.keyFor`方法返回一个已登记的 Symbol 类型值的`key`,无则返回undefined。

```
let s1 = Symbol.for("foo");
Symbol.keyFor(s1) // "foo"
```

**注** Symbol.for()注册的symbol值是全局环境的 （iframe 中注册的主页面也获取的到

# Reflect

## 让Object操作都变成函数行为

如
```
delete obj[name]
新写法
Reflect.deleteProperty(obj, name)
```

## 与Proxy上的方法一一对应

Proxy中可以调用Reflect方法，去完成默认行为

```
Proxy({},{
  set:function(t,n,v){
    let suc = Reflect.set(t,n,v)
    if(suc){
      log(..)
    }
  }
})
```
### Reflect.set(target, name, value, receiver) 

`Reflect.set`方法设置`target`对象的 name 属性等于 value

```
var myObject = {
  foo: 4,
  set bar(value) {
    return this.foo = value;
  },
};

var myReceiverObject = {
  foo: 0,
};
myObject.foo // 4

Reflect.set(myObject, 'foo', 2);
myObject.foo // 2

Reflect.set(myObject, 'bar', 1, myReceiverObject);
myObject.foo // 2
myReceiverObject.foo // 1

Reflect.set(myObject, 'foo', 3, myReceiverObject);
myObject.foo //2
myReceiverObject.foo //3
```
含receiver参数的时候，若name属性可赋值或设置了赋值函数，则该name属性或name属性对应的赋值函数的this绑定receiver

### Proxy 与 Reflect一起使用

**注意：** Proxy的方法中的`receiver` 总是指向`当前的Proxy实例`

所以若Proxy的set方法含有`receiver参数`，执行`Reflect.set` 时，会将属性赋值给 receiver 上面（即Proxy实例），即触发`Proxy.defineProperty`



# 字符串的拓展

## 复习下 es5 的一些用法

### 切割字符串

> substr(start,len)
> substring(start,end) 

## codePointAt()

Unicode 码 大于 0xFFFF 的字符 ，由4个字节存储


故
```
"\u{20BB7}" //"𠮷"  用{}来包装 可以表示双字节。
var s = "𠮷";

s.length // 2
s.charAt(0) // ''
s.charAt(1) // ''
s.charCodeAt(0) // 55362
s.charCodeAt(1) // 57271
```

利用`codePointAt`可以拿到 Unicode码

```
let s = '𠮷a';

s.codePointAt(0) // 134071
s.codePointAt(1) // 57271

s.codePointAt(2) // 97
```
这样写的话不够自动，因为不知道是否该跳过（如At(1)）.

使用`for of`正确获取

```
let s = '𠮷a';
for (let ch of s) {
  console.log(ch.codePointAt(0).toString(16));
}
// 20bb7
// 61
```

`String.fromCodePoint(0x20BB7)` 用来解决es5的`String.fromCharCode(0x20BB7)`不能识别32位字符的问题

## includes(), startsWith(), endsWith() 

参数： `str,startIndex:开始搜索的位置`

```
let s = 'Hello world!';

s.startsWith('world', 6) // true
s.endsWith('Hello', 5) // true
s.includes('Hello', 6) // false
```

## 模板字符串

使用 **`**  保留换行

变量名写在`${}`中,`{}`中可以写任何js代码

模板字符串可嵌套


## 实例：模板编译

```js
const templateStr = `
<ul class="users">
  <% users.forEach((user) => { %>
    <li class="user-item">
      <%= 'My name is ' + user.name %>
    </li>
  <% }) %>
</ul>
`

const data = {
  users: [
    { name: 'Jerry', age: 12 },
    { name: 'Lucy', age: 13 }, 
    { name: 'Tomy', age: 14 }
  ]
}

render(templateStr, data)
/*返回结果：

<ul class="users">
  <li class="user-item">
    My name is Jerry
  </li>
  <li class="user-item">
    My name is Lucy
  </li>
  <li class="user-item">
    My name is Tomy
  </li>
</ul>

*/
```
> **思路** 将其转成：
```js
/*
`
${
echo('<ul class="users">')
  users.forEach((user) => {
    echo('<li class="user-item">')
      echo('My name is ' + user.name)
    echo('</li>')
  })
</ul>
}
`
*/
//定义echo函数
function echo(html){
  output += html;
}
```

> 代码实现

```js
const render = (template, data) => /* TODO */
{
  let exp0 = /<%=(.+)%>/g
  let exp1 = /<%(.+)%>/g
  template = template.replace(exp0,'`);\n echo($1) \n echo(`').replace(exp1,'`);\n $1 \n echo(`')
  template = 'echo(`' + template +'`)'
  //${template}的结果为 调用若干echo函数
  let comp = `
  let html = ''
  function echo(t){
    html+=t
  }
  ${template}
  return html
  `
  return Function(...Object.keys(data),comp)(...Object.values(data))
}
```

## 标签模板

```js
function tag(s, v1, v2) {
  console.log(s[0]);
  console.log(s[1]);
  console.log(s[2]);
  console.log(v1);
  console.log(v2);

  return "OK";
}
// "Hello "
// " world "
// ""
// 15
// 50
// "OK"

let a = 5;
let b = 10;

tag`Hello ${ a + b } world ${ a * b}` //最后面需要还有一个不被变量替换的''
//等价于
tag(['Hello ', ' world ', ''], 15, 50)

```

**应用：** 过滤html字符串，防止用户输入恶意内容

```

function SaferHTML(templateData,...values) {
  let s = '';
  let i = 0
  for (; i < values.length; i++) {
    s += templateData[i];
    let arg = String(values[i]);

    // Escape special characters in the substitution.
    s += arg.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");

    // Don't escape special characters in the template.
    
  }
  return s;
}

let sender = '<script>alert("abc")</script>'; // 恶意代码
let message = SaferHTML`<p>${sender} has sent you a message.</p>`;

message
// <p>&lt;script&gt;alert("abc")&lt;/script&gt; has sent you a message.</p>
```



# Class

ES5的原型链继承

```
function Parent(){
  this.name = 'parent'
}
function Child(){
  this.name = 'child'
}
// 用子类的原型对象等于父类的实例
// 则子类原型拥有父类的所有实例属性和实例方法,即Child.prototype.name = 'parent'
Child.prototype = new Parent()
// 实例调用方法，先去找实例方法 再去找原型方法
```