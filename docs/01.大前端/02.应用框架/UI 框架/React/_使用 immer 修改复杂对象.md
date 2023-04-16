---
title: 使用 immer 修改复杂对象
date: 2022-08-23 15:42:37
permalink: /pages/d19ef2/
categories: 
  - 大前端
  - 应用框架
  - UI 框架
  - React
tags: 
  - 
titleTag: 草稿
---
# 使用 immer 修改复杂对象

```js
export default function App() {
  const [data, setData] = useState({
    a: {
      b: {
          c: 1
      },
      d: {}
    },
  });
  useEffect(() => {
    console.log('a 变更了', data.a);
  }, [data.a]);
  const handleUpdate = () => {
    const random = Math.round(Math.random() * 100);
    // 更新 data.a.b.c 的值
  };
  console.log("rerender");
  return (
    <div>
      <div>{data.a.b.c}</div>
      <button onClick={handleUpdate}>update</button>
    </div>
  );
}
```

考虑这个场景，应该怎么更新 `data.a.b.c` ?

有人说直接改，再最外层解构，得到一个新的 data

```js
data.a.b.c = random
setData({
  ...data
})
```

看起来每个更新浏览器也都变更了，貌似没问题？

# data.a 引用不变

但是这里发现没有，useEffect 里 data.a 是一直不变更的

如果此时有个组件依赖了 a 并做了 memo 

```js
import { memo, useEffect, useState } from "react";
import "./styles.css";

const Child = memo(({ a }) => {
  return <div>{a.b.c}</div>;
});

export default function App() {
  const [data, setData] = useState({
    a: {
      b: {
        c: 1
      },
      d: {}
    }
  });
  useEffect(() => {
    console.log("a 变更了", data.a);
  }, [data.a]);
  const handleUpdate = () => {
    const random = Math.round(Math.random() * 100);
    // 更新 data.a.b.c 的值
    data.a.b.c = random;
    setData({
      ...data
    });
  };
  console.log("rerender");
  return (
    <div>
      <div>{data.a.b.c}</div>
      <button onClick={handleUpdate}>update</button>
      <Child a={data.a} />
    </div>
  );
}
```

那么此时子组件是始终不会变化的，因为 data.a 的引用一直不变

绝大多数场景下，一个对象的属性发生了改变，那么就应该生成一个新的对象，而是否重渲染是交由外部来判断的

那么我们应该怎么处理呢？

# 逐层解构

修改更新的代码：
```js
setData({
  ...data,
  a: {
    ...data.a,
    b: {
      ...data.a.b,
      c: random
    }
  }
})
```

结果符合预期

但是发现没有，这个处理非常麻烦。。。有什么解决方案么？

# 完全深拷贝

使用 loadsh 的 deepClone 功能，将 data 完全深拷贝一份再修改

```js
setData((data) => {
  const newData = deepClone(data)
  newData.a.b.c = random;
  return newData
});
```

结果符合预期，但是这个完全深拷贝性能比较低，因为不是所有子对象都需要深拷贝！

# 按需拷贝

那么怎么样避免深拷贝所有属性，而只针对目标属性和子对象

可以使用 immer 这个工具库

上面的代码，我们只要按如下方法修改即可
```js
import { produce } from 'immer'

setData((data) =>
  produce(data, (draft) => {
    draft.a.b.c = random;
  })
);
```

结果符合预期

# immer 的实现原理 （wip）

![](https://pic4.zhimg.com/80/v2-fdf4518f092e5500fc9264055e07b09b_1440w.jpg)


- 将待修改对象 state 做了 proxy 得到了 draft
- 处理 draft 变更
  - 一个赋值操作其实是由一个 get 和 set 组成
- 

对 draft proxy 的改变进行收集，如果

# 拓展阅读

https://zhuanlan.zhihu.com/p/146773995