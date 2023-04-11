---
title: 监听 stick 状态
date: 2022-05-06 20:40:35
permalink: /pages/5216b4/
article: false
categories:
  - 大前端
  - 前端基础
  - 编程语言
  - CSS
tags:
  - 

---
## 示例: sticky 状态的导航栏加阴影

### 方式1：借助 IntersectionObserver

sticky 元素增加 1 像素偏移，通过 IntersectionObserver 监听到该元素不是 100% 展现时修改样式

```html
<header></header>
<nav></nav>

<style>
  body {
    margin: 0;
    height: 200vh;
  }
  header {
    background: red;
    height: 80px;
  }
  nav {
    background: magenta;
    height: 80px;
    position: sticky;
    top: -1px; 
  }
  nav[stuck] {
    box-shadow: 0 0 16px black;
  }
</style>

<script>
  const observer = new IntersectionObserver(
    ([e]) => {
      e.target.toggleAttribute("stuck", e.intersectionRatio < 1);
      console.log(e.intersectionRatio);
    },
    { threshold: [1] }
  );

  observer.observe(document.querySelector("nav"));
</script>
```

在线示例：https://codepen.io/francecil/pen/JjrJvzO?editors=1111

也可以增加一个占位元素，然后 observe 该元素，这样就不需要对 sticky 元素进行偏移

### 方式2：纯 css

阴影本身也是一个 sticky 元素，并用 margin-top 顶开一段距离


https://zhuanlan.zhihu.com/p/81249133

在线示例：https://codesandbox.io/s/xenodochial-proskuriakova-mg7up?file=/src/styles.css

## 示例：修改 sticky 内容

纯 css 无法实现，需要借助 IntersectionObserver 监听 sticky 元素的上方元素


threshold 定为 0，则当上方元素完全隐藏时触发事件，告知修改 sticky 内容

```js
import React, { useLayoutEffect } from "react";
import ReactDOM from "react-dom";

import "./styles.css";

function App() {
  useLayoutEffect(() => {
    const observer = new IntersectionObserver(
      ([e]) => {
        console.log(e.intersectionRatio, e.isIntersecting);
      },
      { threshold: [0] }
    );

    observer.observe(document.querySelector("#top"));
  }, []);
  return (
    <div className="App">
      <div id="top" style={{ height: 50, background: "red" }}>
        top
      </div>
      <nav>CSS Sticky With Shadow</nav>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);

```


参考文档：https://developers.google.com/web/updates/2017/09/sticky-headers