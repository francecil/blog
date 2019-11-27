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