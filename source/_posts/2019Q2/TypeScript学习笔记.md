---
title: TypeScript学习笔记
date: 2019/05/01 01:00:00
categories: 大前端
tags:
  - TypeScript
---

# 前言

之前没有系统的学习 ts ，都是看看网上随便搜的文章就开始入手，对 ts 的本质思想学习得不够彻底

本文适用于有一点点 ts 基础的读者

<!--more-->

# 基础知识

部分摘自[官方文档 Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

## const 与 enum 的区别

```ts
const APP = {
  XIGUA: "xigua",
  TOUTIAO: "toutiao",
  LITE: "lite",
};
enum APP2 {
  XIGUA = "xigua",
  TOUTIAO = "toutiao",
  LITE = "lite",
}
```

1. Object.values 的差异

前者得到的值是一个 string 数组，于是可以继续进行 include 的判断，但是不方便其他地方校验类型

而后者得到的是一个 APP2 数组，进行 include 判断时会报类型错误，需要进行类型转换

```ts
(Object.values(APP) as string[]).includes;
```

需要注意的是，如果枚举的值是字符串，编译的时候不会像数字那样，设置 `APP2['xigua']='XIGUA'`

## 开启 strictNullChecks 时变量报 Variable 'assertion' is used before being assigned

```js
let a:number
try {
  a = 1
} catch(){
  if(a) { // 编译报错

  }
}
```

需要手动加上 undefined 声明

```js
let a:number|undefined;
try {
  a = 1
} catch(){
  if(a) {

  }
}
```

参考 [TypeScript 中的怪语法](https://cloud.tencent.com/developer/article/1125664)

## ts-node tsc typescript 等 npm 包的区别

ts-node 需要跟一个入口，用来执行

tsc 将根据 tsconfig 转换所有文件

## 条件类型

```ts
type Extract<T,U> = T extends U ? T : never ;
Extract<"a" | "b" | "c", "a"> // "a"
```

分发条件类型的前置要求是存在范型:

```ts
type a = "a" | "b" | "c" extends "a" ? "a" : never; // never, 这里并没有做类型分发，所以输出是 never
```

https://juejin.cn/post/6976247111394263053

## 对象的 key 是限定的，不应该使用 interface 而应该用 type

```ts
enum Option {
  ONE = "one",
  TWO = "two",
  THREE = "three",
}

interface OptionRequirement {
  someBool: boolean;
  someString: string;
}

interface OptionRequirements {
  [key: Option]: OptionRequirement;
}
// 提示错误
// An index signature parameter type cannot be a union type. Consider using a mapped object type instead
```

需要改为

```ts
enum Options {
  ONE = "one",
  TWO = "two",
  THREE = "three",
}
interface OptionRequirement {
  someBool: boolean;
  someString: string;
}
type OptionRequirements = {
  [key in Options]: OptionRequirement; // Note that "key in".
};
```

见： https://stackoverflow.com/questions/54438012/an-index-signature-parameter-type-cannot-be-a-union-type-consider-using-a-mappe

### 部分属性属于某个集合

结合上面的，采用 interface 继承

```ts
interface AA extends OptionRequirements {
  b: boolean;
}
```

## 将字符串数组转为联合类型

```ts
const arr = ["a", "b", "c"];
// 期望转为下面这种
type arrType = "a" | "b" | "c";
```

解决方案

```ts
const arr = [
  "performance",
  "accessibility",
  "best-practices",
  "seo",
  "pwa",
] as const;
type A = typeof arr[number]; // 'performance' | 'accessibility' | 'best-practices' | 'seo' | 'pwa';
```

另外，不推荐**联合类型**转**字符串数组**

## interface vs type Alias

- type: 类型别名，顾名思义就是用某个别名来指代某个类型，方便复用而已
- interface: 接口声明，用于命名对象类型

官网说明：[Differences Between Type Aliases and Interfaces](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#differences-between-type-aliases-and-interfaces)

### 相同点

- 都可以拓展，且可以拓展对方

```ts
interface I1 {
  name: string;
}
interface I2 extends I1 {
  age: number;
}
type T1 = {
  name: string;
};
type T2 = T1 & {
  age: number;
};
interface I3 extends T1 {
  age: number;
}
type T3 = I1 & {
  age: number;
};
let a: T3 = {
  name: "",
  age: 1,
};
```

- 都可以描述一个对象或函数

### type 可以 interface 不行的

- type 还可以作用于其他类型
- type 能使用 in 关键字生成映射类型，但 interface 不行

```ts
type P = "a" | "b";
type User = {
  [k in P]?: string;
};
interface I1 {
  // 只能是 string 或 number ，使用其他类似会提示用 type
  [name: string | number]: string;
}
let user: User = {
  a: "2",
};
```

- type 可以使用 typeof 获取实例的类型进行赋值

```ts
let user = {
  name: "hh",
};
type User = typeof user;
/**
type User = {
    name: string;
}
*/
```

### interface 支持而 type 不支持

- 声明合并，详见 https://www.tslang.cn/docs/handbook/declaration-merging.html

interface 可以重新定义以添加其他属性，而接口不能

### 总结

- 用 interface 描述 **数据结构**，用 type 描述 **类型关系**
- type 基本上可以代替 interface
- 日常开发中，先尝试使用 interface 来表示数据结构，语义上更符合；实在无法实现再用 type

### 拓展阅读

- https://juejin.cn/post/6844903749501059085
- https://blog.csdn.net/sinat_17775997/article/details/97102583?ivk_sa=1024320u

## 类型断言 as

TypeScript 只允许类型断言转换为更具体或更不具体的类型版本，可防止“不可能”的强制类型指定

```ts
const x = "hello" as number;
// 报错
```

如果想打破规则，可以用采用两次断言

```ts
const x = "hello" as any as number;
```

## 字面推理

初始化变量时，ts 将假定该对象的属性可能在以后会更改值，于是其属性会被定义为基础类型

例如如下例子，`req.method` 将被推理为 string 类型，因此在使用 handleRequest 方法时将报错

```ts
// @errors: 2345
declare function handleRequest(url: string, method: "GET" | "POST"): void;
// ---cut---
const req = { url: "https://example.com", method: "GET" };
handleRequest(req.url, req.method);
// 报错：Argument of type 'string' is not assignable to parameter of type '"GET" | "POST"
```

两种解决方案：
1. 对 method 属性手动进行类型断言

```ts
// 可在对象初始化时指定:
const req = { url: "https://example.com", method: "GET" as "GET" };
// 也可在使用时指定
handleRequest(req.url, req.method as "GET");
```
2. 初始化时将整个对象转换为字面量类型

```ts
const req = { url: "https://example.com", method: "GET" } as const;
handleRequest(req.url, req.method);
```

> as const 将为所有属性分配字面量类型，而非通用类型


## 类型收窄

摘自官网 [Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)

在经过某些控制流语句后，类型会自动收缩
- typeof 运算符
- 非空判断
- 相等性检查
- in 运算符
- instanceof 运算符
- 重新赋值

### 使用类型谓词

定义一个返回类型为类型谓词的函数

```ts
type Fish = { swim: () => void };
type Bird = { fly: () => void };
declare function getSmallPet(): Fish | Bird;
function isFish(pet: Fish | Bird): pet is Fish {
  return (pet as Fish).swim !== undefined;
}
// ---cut---
// Both calls to 'swim' and 'fly' are now okay.
let pet = getSmallPet();

if (isFish(pet)) {
  pet.swim();
} else {
  // 逻辑分支自动推断为其他类型
  pet.fly();
}
```

## 函数

# 高级语法

## Partial

```ts
type Partial<T> = {
  [P in keyof T]?: T[P];
};
```

使得 T 的所有属性可选

## Omit

```ts
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
```

构造一个带有 T 所有属性并去除 K 属性的类型

常见用法 1：继承并覆盖接口类型

> ts 继承的话不能修改父类某个属性的类型，可以采取

```ts
interface base {
  a: number;
  b: string;
}
interface child extends Omit<base, "a"> {
  a: string;
}
// right
const t: child = {
  a: "",
  b: "",
};
```

常见用法 2：组合两个接口，同名属性以后者为准

```ts
interface t1 {
  a: number;
  b: string;
}
interface t2 {
  a: string;
  c: boolean;
}
type t3 = Omit<t1, keyof t2> & t2;
// right
const t: t3 = {
  a: "",
  b: "",
  c: true,
};
```

用法 1，2 经常组合起来使用

# 常用技巧

## 覆盖父接口的某个属性的类型

```ts
type Diff<T extends keyof any, U extends keyof any> = ({ [P in T]: P } & {
  [P in U]: never;
} & { [x: string]: never })[T];
type Overwrite<T, U> = Pick<T, Diff<keyof T, keyof U>> & U;

interface Base {
  id: string;
  name: string;
}

interface Extension {
  id?: number | string;
}
export interface IUser extends Overwrite<Base, Extension> {
  gender: string;
}

// IUser 等同于
export interface IUser {
  id?: number | string;
  gender: string;
  name: string;
}
```

## T | T[] => T[]

有个对象，其类型为 Option 或 Option 数组

现在需要将其强制转为 Option 数组类型，即如果他是 Option 则放入数组中

```js
interface Option {
  [key: string]: React.ReactNode;
}
type A = Option | Option[];
const a: A = { name: "111" };
// 实现 toArray 函数，使得 b 的类型为 Option[]
const b = toArray(a);
```

```js
export function toArray<T>(value: T | T[] | undefined): T[] {
  let ret = value;
  if (value === undefined) {
    ret = [];
  } else if (!Array.isArray(value)) {
    ret = [value as T];
  }
  return ret as T[];
}
// 本例还需要带上类型，其他的简单接口就不用了
toArray<Option>(a)

```

## 数组过滤 null

```js
const list = ["a", null, "b"];
const list2 = list.filter((v) => v);
```

然后 list2 的推导类型还是 `string | null []`

需要对 filter 方法进行声明

```js
// 箭头函数 TODO
function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined;
}
const list2 = list.filter(notEmpty) // string[]
```

## 已有一个默认对象，需要得到该对象的 interface

我们定义了一个默认对象

```js
const obj = {
  name: "gahing",
  age: 18,
};
```

现在用将该默认对象赋值或传递到其他地方，其他地方对变量需要有个定义。

但是又不想重新定义

```js
interface Obj {
  name: string;
  age: number;
}
```

其实直接用 `type Obj = typeof obj` 就行了，在 ts 里能拿到 obj 的完整定义

## 部分枚举值作为 key 组成的新对象，访问如何访问该对象

```js
enum Action {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
}
const { action:Action } = param
const handles = {
  [action.A]: ()=>{},
  [action.B]: ()=>{},
}

if(action){
  handles[action]?.()
}
```

会提示 action 的其他类型 C/D 不在 handles key 中，此时需要做下过滤
=》

```js
type PartAction = keyof(typeof handles)
if(action){
  handles[action as PartAction]?.()
}
```

## 枚举的键转为联合类型

例如

```ts
enum ReportStatus {
  default,
  running,
  success,
  failed,
}

// 希望得到某个类型，其值为
type ReportStatusKey = "default" | "running" | "success" | "failed";
```

解决方案：

```ts
type ReportStatusKeys = keyof typeof ReportStatus;
```
## 实现精确的接口或 / Exact Types

有两个接口定义如下，部分参数一致
```ts
interface A {
  key: string
  name: string
}
interface B {
  key: string
  value: string
}
```
此时有一个方法，其参数支持这两种接口
```ts
const fn = (props: A | B) => {}
fn({
  key: 'a',
  name: 'a'
})
fn({
  key: 'b',
  value: 'b'
})
```
如果按上面的方法定义 fn ，会出现如下用例没有被类型识别到
```ts
fn({
  key: 'a',
  name: 'a',
  value: 'b' // 没有存在相应定义的 A 或 B 接口，本应该报错，但是没有报错
})
```
目前 ts 原生 API 还不支持精确或（即只能是 A 或 B 的所有类型）

解决方案就是调整方法定义，使用函数重载解决
```ts
type Fn2 = {
  (props: A): void
  (props: B): void
}
const fn2: Fn2 = (props) => {}
fn2({
  key: 'a',
  name: 'a'
})
fn2({
  key: 'b',
  value: 'b'
})
fn2({
  key: 'a',
  name: 'a',
  value: 'b' // 会报错
})
```

Flow 支持这种特性，称之为 Exact Types ，ts 社区上的相关讨论：https://github.com/microsoft/TypeScript/issues/12936

在线示例：https://www.typescriptlang.org/play?#code/JYOwLgpgTgZghgYwgAgILIN4FgBQzkDWEAngFzIDOYUoA5rviHALYTlU0j04C+uokWIhQAhTA0Il21OhIBucADYBXNpRldcfHAgD2IKshghkAXmQAKAA5RdViuXQAfZCICUZgHyZtxi9jxJMmQAcjgQgBoJJlZyMJCtN1w-APwiYJCAI0j5JVU47MTkkH8JdLjwqMCYtXiq-AUVWuzkAHpW5EBCm0BIc0ANbUAKdUAPt0AUvUAs7UBJOUAQtzRkQDQjV2RAUuNAY+VAGH-AGnNhwFPowFKjQExU1cAxeUB6Mx79opwwYisUADEQACYzcUDrW3tHN3I5XWAAEwkbzsDlcX2QP3+WlwegMYCMj3I9ye5iB9g8pm8GF8j1KgXKoUq0RYtXCF2MD1xaSkoWy9XBeWaCV4SRw5MpQQqOWqxM5dMa+RpITaHUAWPLnZlAA