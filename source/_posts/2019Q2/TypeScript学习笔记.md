---
title: TypeScript学习笔记
date: 2019/05/01 01:00:00
categories: 大前端
tags: 
  - TypeScript
---

## 前言


<!--more-->

## Partial

```ts
type Partial<T> = {
    [P in keyof T]?: T[P];
};
```

使得T的所有属性可选

## Omit
```ts
type Omit<T, K extends keyof any> = Pick<T, Exclude<keyof T, K>>;
```
构造一个带有T所有属性并去除K属性的类型

常见用法1：继承并覆盖接口类型

> ts继承的话不能修改父类某个属性的类型，可以采取 

```ts
interface base {
  a:number,
  b:string
}
interface child extends Omit<base,'a'> {
  a:string
}
// right
const t:child = {
  a:"",
  b:"",
}
```

常见用法2：组合两个接口，同名属性以后者为准

```ts
interface t1 {
  a:number,
  b:string
}
interface t2 {
  a:string,
  c:boolean,
}
type t3 = Omit<t1, keyof t2> & t2;
// right
const t:t3 = {
  a:"",
  b:"",
  c:true,
}
```

用法1，2经常组合起来使用

## T | T[] => T[]

有个对象，其类型为 Option 或 Option 数组

现在需要将其强制转为 Option 数组类型，即如果他是 Option 则放入数组中

```js
interface Option {
  [key: string]: React.ReactNode;
}
type A = Option | Option[]
const a:A = {name:"111"}
// 实现 toArray 函数，使得 b 的类型为 Option[]
const b = toArray(a)
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
const list = ["a",null,"b"]
const list2 = list.filter(v=>v)
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
  name: 'gahing',
  age: 18
}
```

现在用将该默认对象赋值或传递到其他地方，其他地方对变量需要有个定义。

但是又不想重新定义
```js
interface Obj {
  name: string,
  age: number
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

会提示  action 的其他类型 C/D 不在 handles key 中，此时需要做下过滤
=》
```js
type PartAction = keyof(typeof handles)
if(action){
  handles[action as PartAction]?.()
}
```

## const 与 enum 的区别

```ts
const APP = {
  XIGUA : "xigua",
  TOUTIAO : "toutiao",
  LITE : "lite",
}
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
(Object.values(APP) as string[]).includes
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

参考 [TypeScript中的怪语法](https://cloud.tencent.com/developer/article/1125664)

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
type a = 'a' | 'b' | 'c' extends 'a' ? 'a' : never; // never, 这里并没有做类型分发，所以输出是 never 
```

https://juejin.cn/post/6976247111394263053

## 对象的 key 是限定的，不应该使用 interface 而应该用 type

```ts
enum Option {
  ONE = 'one',
  TWO = 'two',
  THREE = 'three'
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
  ONE = 'one',
  TWO = 'two',
  THREE = 'three',
}
interface OptionRequirement {
  someBool: boolean;
  someString: string;
}
type OptionRequirements = {
  [key in Options]: OptionRequirement; // Note that "key in".
}
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
const arr = ["a", "b" , "c"]
// 期望转为下面这种
type arrType = "a" | "b" | "c"
```

解决方案

```ts
const arr = ['performance', 'accessibility', 'best-practices', 'seo', 'pwa'] as const;
type A = typeof arr[number]; // 'performance' | 'accessibility' | 'best-practices' | 'seo' | 'pwa';
```

另外，不推荐**联合类型**转**字符串数组**

## interface vs type Alias

### 相同点

- 都可以拓展，且可以拓展对方
```ts
interface I1 {
    name: string
}
interface I2 extends I1 {
    age: number
}
type T1 = {
    name: string
}
type T2 = T1 & {
    age: number
}
interface I3 extends T1 {
    age: number
}
type T3 = I1 & {
    age: number
}
let a: T3 = {
    name: '',
    age: 1
}
```
- 都可以描述一个对象或函数
### type 可以 interface 不行的

- type 还可以作用于其他类型
- type 能使用 in 关键字生成映射类型，但 interface 不行
```ts
type P = 'a' | 'b' 
type User = {
  [k in P]?: string
}
interface I1 {
    // 只能是 string 或 number ，使用其他类似会提示用 type
    [name: string|number]: string
}
let user: User = {
    a: '2',
}
```
- type 可以使用 typeof 获取实例的类型进行赋值
```ts
let user = {
  name: 'hh'
}
type User = typeof user
/**
type User = {
    name: string;
}
*/
```

### interface 支持而 type 不支持

- 声明合并，较少用，详见 https://www.tslang.cn/docs/handbook/declaration-merging.html

### 总结

- 用 interface 描述 **数据结构**，用 type 描述 **类型关系**
- type 基本上可以代替 interface 
- 日常开发中，先尝试使用 interface 来表示数据结构，语义上更符合；实在无法实现再用 type


### 拓展阅读

- https://juejin.cn/post/6844903749501059085
- https://blog.csdn.net/sinat_17775997/article/details/97102583?ivk_sa=1024320u

## 覆盖父接口的某个属性的类型

```ts
type Diff<T extends keyof any, U extends keyof any> =
    ({ [P in T]: P } & { [P in U]: never } & { [x: string]: never })[T];
type Overwrite<T, U> = Pick<T, Diff<keyof T, keyof U>> & U;

interface Base {
  id: string
  name: string
}

interface Extension {
    id?: number | string;
}
export interface IUser extends Overwrite<Base, Extension> {
    gender: string
}

// IUser 等同于
export interface IUser  {
    id?: number | string;
    gender: string
    name: string
}

```

## 枚举的键转为联合类型

例如
```ts
enum ReportStatus {
    default,
    running,
    success,
    failed
}

// 希望得到某个类型，其值为
type ReportStatusKey = "default" | "running" | "success" | "failed"
```

解决方案：
```ts
type ReportStatusKeys = keyof typeof ReportStatus
```