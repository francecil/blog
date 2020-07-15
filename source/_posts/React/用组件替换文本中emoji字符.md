---
title: 用组件替换文本中emoji字符
date: 2020-07-14 20:12:40
categories: 大前端
tags: 
  - React
---

## 背景

需要将用户输入的内容进行展现，其中某些字符会被替换为预定义好的的表情图片。

注意安全漏洞

<!--more-->

## 简单粗暴的做法 dangerouslySetInnerHTML

```jsx
import React from "react";

const emojiMap = {
  "[aa]": "a.jpg",
  "[bb]": "b.jpg"
};
const DangerouslyRender = ({ text }) => {
  let regex = /\[\S+?\]/g;
  const allEmoji = Object.keys(emojiMap);
  text = text.replace(regex, match => {
    if (allEmoji.includes(match)) {
      return `<img class='emoji_icon' src='${emojiMap[match]}'/>`;
    }
    return match;
  });
  return (
    <pre
      dangerouslySetInnerHTML={{
        __html: text
      }}
    />
  );
};
export default function App() {
  const text = "hhh,b[aa]tt<img src=a onerror=alert(1)>[bb]";
  return (
    <div className="App">
      <DangerouslyRender text={text} />
    </div>
  );
}
```

存在的问题： XSS 漏洞

## 安全的做法

利用 split 进行分割，注意这里的正则相比之前多了括号，可以保留分割字符，用于后续替换

```js
"asdsd[aa],[bb]ss".split(/\[\S+?\]/g) //  ["asdsd", ",", "ss"]
"asdsd[aa],[bb]ss".split(/(\[\S+?\])/g) //  ["asdsd", "[aa]", ",", "[bb]", "ss"]
```

得到分割数组后，就可以随意处理了，比如 for of 输出，或者用 map ，示例如下

```js
const content = text.split(regex).map((current) => {
    if (allEmoji.includes(current)) {
      return <img className="emoji_icon" src={emojiMap[current]} alt={current} />
    }
    return current
});
```

或者用 reduce ，完整代码如下：

```jsx
import React from "react";

const emojiMap = {
  "[aa]": "a.jpg",
  "[bb]": "b.jpg"
};
const SafeRender = ({ text }) => {
  const allEmoji = Object.keys(emojiMap);
  const regex = /(\[\S+?\])/g;
  const content = text.split(regex).reduce((prev, current) => {
    let target = current;
    if (allEmoji.includes(current)) {
      target = (
        <img className="emoji_icon" src={emojiMap[current]} alt={current} />
      );
    }
    return prev.concat(target);
  }, []);
  console.log({ text, content });
  return content;
};
export default function App() {
  const text = "hhh,b[aa]tt<img src=a onerror=alert(1)>[bb]";
  return (
    <div className="App">
      <h1>Hello CodeSandbox</h1>
      <SafeRender text={text} />
    </div>
  );
}
```
## 在线 demo

https://codesandbox.io/s/tender-blackburn-6d9o2?file=/src/App.js

## 后端方案

后端过滤，评论成功后返回过滤后的内容

此时前端是否用 dangerouslySetInnerHTML 还是自己构造组件都无所谓了

## 参考资料

[How to replace parts of a string with a component?#3386](https://github.com/facebook/react/issues/3386)