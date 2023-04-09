---
title: Chrome v84 固定视区新特性，列表「加载更多」功能将出问题
date: 2020-08-03 10:12:40
tags: 
  - Chromium
  - HTML
permalink: /pages/04ff1c/
categories: 
  - 随笔
---

## 背景

我们的网站有个「点击加载更多」的功能，就像这样

![](https://sf1-dycdn-tos.pstatp.com/obj/eden-cn/nupohneh7nupehpqnulog/img/loadmore_common.gif)

> 点击按钮，拉取数据填充列表，用户自行滚动到下方，继续点击加载更多……

这种场景是不是很常见？？我浏览了几个网站，都有这种场景，国内最流行的 Ant Design 组件库更是直接封装了[这个功能](https://ant.design/components/list-cn/#components-list-demo-loadmore)

<!--more-->

## 本来只是没啥问题的，直到 Chrome V84 的出现…

> 确切的说，是 chromium 84 出了问题，因为最新的 edge 用的 chromium 内核，也出了相同的问题


有一天，收到用户反馈：在点击加载更多后，列表内容像是原地刷新，体验实在不在，就像这样

![](https://sf1-dycdn-tos.pstatp.com/obj/eden-cn/nupohneh7nupehpqnulog/img/loadmore.gif)

[在线体验链接,需要 Chrome 84 哦>](https://usb6m.csb.app/)

> 点击加载更多，按钮位置始终不变，列表填充后自行向上滚动 😵

看这个 gif 你可能觉得还行，真实场景是会加载更多内容的，这种自行滚动会让用户突然找不到刚刚浏览项的位置，极大破坏用户体验。

或者说，这种做法有一定场景，但是行为控制应该交给前端开发者来定不是？

（废话好像有点多，想看解决方案的直接拉到文末~

## 怎么发现是 chromium 的 bug/feature ?

收到的反馈，说的是偶现，然后部分用户高频出现。所以我一开始并没有往浏览器层面想，而是自己的代码有没有逻辑漏洞。

在几个浏览器上跑了一遍，发现确实有些浏览器能复现。在确认自己代码天衣无缝之后，我怀疑起了 react 🤣

为了验证和框架无关，我关闭了 JavaScript ，手动复制列表元素到父节点，还是能够稳定复现。。为了严谨，自己又用原生代码写了一个 [demo](https://codesandbox.io/s/elegant-poincare-usb6m) ，还是能够复现。那么问题就出在这些浏览器身上了。。

这一晚搞到了 11 点多，先回去睡个觉。。

第二天醒来，脑子清醒多了。

先确定复现浏览器的版本，同事装的 Chrome 83 没问题，而自己的 84 出了问题，看来是这次 Chrome 更新的锅。


接着去网络上搜搜有没有人遇到类似的问题。恰好，前一天也有个网友遇到了同样的问题，见 [给你代码：chrome84追加元素的问题](https://baijiahao.baidu.com/s?id=1673335174799894188&wfr=spider&for=pc&isFailFlag=1)


最后去看下更新文档（在此之前我只知道 Chrome 84 调整了 same-site 策略

在 [Chrome 84 新特性](https://www.chromestatus.com/features#milestone%3D84) 文中，并没有提到这个功能。

看来对于官方来说，这种功能改动是很小的，不足以放到 feature 列表中 🙂，更多细节提示需要到 commit log 里查看 

看来只能去[版本提交日志](https://chromium.googlesource.com/chromium/src/+log/83.0.4103.116..84.0.4147.89?pretty=fuller&n=20000)里查下了，在输入了 scroll 关键字后，跳出来的结果有数千条，着实劝退，我还是去提 [bug](https://bugs.chromium.org/p/chromium/issues/detail?id=1112040) 等待官方解答吧。

## 影响范围

目前使用 chromium 84 内核的浏览器都受到了影响，包括：

1. Chrome 84
2. Edge 84
3. Android Chrome 84
4. Android Webview (默认跟随本地 Chrome 升级而升级，也可以独立维护版本)

啥，没有 iOS ? 因为 iOS 的 Chrome 用的不是 chromium 内核 😀

## 滚动偏移重置的解决方案

既然浏览器做了滚动，那我们「记住上次滚动位置，加载完后滚回去」不就行了？

试了一下，还真的有效。

完整代码：

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        .container {
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .items {
            width: 100%;
        }

        .item {
            margin-top: 10px;
            height: 100px;
            width: 100%;
            background-color: #FF142B;
        }

        .btn {
            width: 200px;
            height: 44px;
            margin-bottom: 40px;
            background: #BCCFFF;
            box-shadow: 0 0 3px 0 rgba(0, 0, 0, 0.05);
            border: none;
            border-radius: 22px;
            font-size: 15px;
            font-weight: 500;
            color: #FF142B;
            -webkit-transition: 150ms all;
            transition: 150ms all;
        }
    </style>
    <script>
        function genRandomColor() {
            const fn = () => parseInt(Math.random() * (255 + 1), 10)
            return `rgb(${fn()},${fn()},${fn()})`
        }
        function showMore() {
            let items = document.querySelector('.items')
            let tmp = document.createElement('div')
            // 记住当前位置
            const currentScrollTop = document.documentElement.scrollTop || document.body.scrollTop
            
            tmp.className = "item"
            tmp.style = `background-color: ${genRandomColor()}`;
            items.appendChild(tmp)
            // 滚回到之前位置
            window.scrollTo({
                top: currentScrollTop
            })
        }
        function showMoreWithTimeout(){
            setTimeout(showMore,10)
        }
    </script>
</head>

<body>
    <div class="container">
        <div class="items">
            <div class="item"></div>
            <div class="item"></div>
            <div class="item"></div>
            <div class="item"></div>
            <div class="item"></div>
            <div class="item"></div>
            <div class="item"></div>
            <div class="item"></div>
        </div>
        <button class="btn" onclick="showMore()">点击展开更多</button>
    </div>
    
</body>

</html>
```

虽然可以了，但还是会有以下几个疑问：
1. Chrome 84 内部滚动的时机是什么时候？
2. 一次事件循环中多次执行 scrollTo ，会发生什么情况？
3. 已经执行了 scrollTo ，在 setTimeout 里执行 scrollTo 和在 rAF 里执行 scrollTo ，有什么区别？
4. scrollTo 和 scrollBy 同时执行，会发生什么情况？

问题 1 比较复杂，先看其他几个问题

### 多次执行 scrollTo

```js
window.addEventListener("scroll",()=>{console.log("scroll")})
window.scrollTo(0,50) 
console.log(document.documentElement.scrollTop) // 50
window.scrollTo(0,150) 
console.log(document.documentElement.scrollTop) // 150

// 输出一次 scroll
```

```js
window.scrollTo(0,50) 
window.requestAnimationFrame(()=>{
    window.scrollTo(0,150) 
})

// 输出两次 scroll
```

由以上例子可以看出：
- 每次进行 scrollTo ，读取 scrollTop 能够实时反应
- 触发 scroll 事件之前，无论执行了多少次 scrollTo ，最后也仅执行一次 scroll 事件，并以最后的 scrollTop 位置为准
- 在 rAF 里执行 scrollTo ，还能再次触发 scroll 事件

以上结论也可以从 HTML 规范的[事件循环描述](https://html.spec.whatwg.org/multipage/webappapis.html#update-the-rendering)得知。在一次事件循环中，执行滚动步骤（触发 scroll 事件） 是发生在 rAF 之前的。

但值得注意的是，界面更新是事件循环的最后一步，所以无论前面执行了多少次 scrollTo ，最后只会看到一次滚动更新

### 在 setTimeout 和 rAF 里再次执行的异同点

```js
window.scrollTo(0,50) 
window.setTimeout(()=>{
    window.scrollTo(0,150) 
},0)

// 输出两次 scroll
```

相同点很简单，就是都是会再次触发 scroll 事件

不同点则是，由于 setTimeout 是另一次的事件渲染，所以界面上反应的滚动更新会有两次，也就是抖一下然后偏移到 150 位置。 

### 说说 scrollTo 和 scrollBy

区别很简单，一个是绝对位置滚动，一个相对位置滚动，更多详见 [csswg](https://drafts.csswg.org/cssom-view/#dom-window-scroll)

然后触发 scroll 事件的时机，和上面的一样。

- 先执行 scrollTo(x1) 再执行 scrollBy(x2) 最终位置为 `x1+x2`
- 先执行 scrollBy(x1) 再执行 scrollTo(x2) 最终位置为 `x2`

### Chrome 84 内部滚动的时机是什么时候

每次调整元素的 scrollTop 输出结果是可以实时反应的，因此我们写出以下代码

```js
function getScrollTop(){
    return document.documentElement.scrollTop || document.body.scrollTop
}
function showMore() {
    let items = document.querySelector('.items')
    let tmp = document.createElement('div')
    const lastScrollTop = getScrollTop()
    console.log("lastScrollTop:",lastScrollTop) // 529
    tmp.className = "item"
    tmp.style = `background-color: ${genRandomColor()}`;
    items.appendChild(tmp)
    console.log("currentScrollTop:",getScrollTop()) // 639
    window.scrollTo(0,lastScrollTop) 
    console.log("changeScrollTop:",getScrollTop()) // 529
}
```

可以发现，在列表容器 appendChild 元素之时，浏览器内部调用了类似 scrollTo 的方法去变更偏移量。由于最后我们还原了 scrollTop ，所以本次浏览器内部的调整将不会影响到。

问题1得到了解答~😁

## react 应用中的处理 

上面说的都是原生代码的写法，那么 react 代码里应该怎么处理呢？

将上面的代码改造成 react 组件

```js
import React, { useState } from "react";
import "./styles.css";

function genRandomColor() {
  const fn = () => parseInt(Math.random() * (255 + 1), 10);
  return `rgb(${fn()},${fn()},${fn()})`;
}
const Item = ({ item }) => {
  return <div className="item" style={{ backgroundColor: item.color }} />;
};
const getScrollTop = () => {
  return document.documentElement.scrollTop || document.body.scrollTop;
};
const fetch = async () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        color: genRandomColor()
      });
    }, 0);
  });
};
export default function List() {
  const [list, setList] = useState(
    new Array(6).fill().map(v => ({ color: "red" }))
  );
  const showMore = async () => {
    const scrollTop = getScrollTop();
    let data = await fetch(); // 包装了 promise ，其后的代码都是异步执行的
    // 异步执行的 state 变更，会同步执行 useLayoutEffect 和 re-render
    setList([...list, data]);
    // 偏移重置
    window.scrollTo({
      top: scrollTop
    });
  };
  return (
    <div className="container">
      <div className="items">
        {list.map((item, i) => (
          <Item item={item} key={i} />
        ))}
      </div>
      <button className="btn" onClick={showMore}>
        点击展开更多
      </button>
    </div>
  );
}

```

> 异步执行的 state 变更，会同步执行 useLayoutEffect 和 re-render：这句话说的是，在 promise 或 定时器等不受 react 控制的异步代码中，执行状态变更方法之后，内部直接进行 diff 并重新 render，并不会等到所有状态变更方法执行之后才更新。

<details>
<summary>更多相关例子</summary>

```js
  useLayoutEffect(() => {
    console.log("useLayoutEffect");
  });
  const showMore = async () => {
    setLoading(true);
    console.log(0); // output: 0
    // 在异步等待过程中，处理了状态变更
    // output: useLayoutEffect
    let data = await fetch();
    console.log(1); // output:1
    setList([...list, data]); // output: useLayoutEffect
    console.log(2); // output:2
    setLoading(false); // output: useLayoutEffect
    console.log(3); // output:3
  };
```

具体输出的是：
```
0
useLayoutEffect 
1
useLayoutEffect 
2
useLayoutEffect 
3
```
</details>


对于同步函数来说，`setList` 执行是异步的，所以不能马上进行 `window.scrollTo`

```js
const showMore = () => {
    const scrollTop = getScrollTop();
    let data = { color: genRandomColor() };
    setList([...list, data]);
    // 无效
    window.scrollTo({
        top: scrollTop
    });
};
```

我们需要编写一个能同时支持异步更新和同步更新的方法，封装成 react hook 以供复用

```js
function useScrollReset() {
  const lastScrollTopRef = useRef(0);
  const [scrollTop, setScrollTop] = useState(0);
  useLayoutEffect(() => {
    console.log("async: chromium v84+ need reset scroller");
    window.scrollTo({
      top: scrollTop
    });
  }, [scrollTop]);
  const remainLastScrollTop = useCallback(() => {
    lastScrollTopRef.current = getScrollTop();
  }, []);

  const resetScroller = useCallback(isAsyncStateChange => {
    if (isAsyncStateChange) {
      // 适合异步变更状态的场景
      setScrollTop(lastScrollTopRef.current);
    } else {
      // 适合同步变更状态的场景
      console.log("sync: chromium v84+ need reset scroller");
      window.scrollTo({
        top: lastScrollTopRef.current
      });
    }
  }, []);

  return [remainLastScrollTop, resetScroller];
}
```

导出2个方法，第一个方法 `remainLastScrollTop` 在列表填充数据项前使用，用来记住当前滚动位置。第二个方法根据数据状态变更是否异步，传入相应的布尔值进行处理。

比如上面的两个例子，应该这么使用

```js
  const showMore = async () => {
    let data = await fetch();
    remainLastScrollTop();
    // 状态是同步变更的，执行后已重新 render
    setList([...list, data]);
    // 故这里设置 false 去直接调整进度条
    resetScroller(false);
  };

  const showMore = () => {
    let data = { color: genRandomColor() };
    remainLastScrollTop();
    // 状态是异步变更的，所以调整进度条需要等到 useLayoutEffect 中进行
    setList([...list, data]);
    // 故这里设置 true 去变更 scroll state 使得之后会执行 useLayoutEffect
    resetScroller(true);
  };
```

[在线demo](https://codesandbox.io/s/fix-load-more-scroll-cxzfu)


### 加上浏览器判断

一开始的想法是，担心其他浏览器会因为「浏览器偏移重置」多耗费了性能，于是加了以下判断


```js
import Bowser from 'bowser'
const browserInfo = Bowser.getParser(window.navigator.userAgent)
const needReset = browserInfo.satisfies({
    chrome: '>=84'
})
function useScrollReset() {
  const lastScrollTopRef = useRef(0);
  const [scrollTop, setScrollTop] = useState(0);
  useLayoutEffect(() => {
    console.log("async: chromium v84+ need reset scroller");
    window.scrollTo({
      top: scrollTop
    });
  }, [scrollTop]);
  const remainLastScrollTop = useCallback(() => {
    lastScrollTopRef.current = getScrollTop();
  }, []);

  const resetScroller = useCallback(isAsyncStateChange => {
    if (isAsyncStateChange) {
      // 适合异步变更状态的场景
      setScrollTop(lastScrollTopRef.current);
    } else {
      // 适合同步变更状态的场景
      console.log("sync: chromium v84+ need reset scroller");
      window.scrollTo({
        top: lastScrollTopRef.current
      });
    }
  }, []);

  return [remainLastScrollTop, needReset?resetScroller:()=>{}];
}
```

后来想想也没太必要，而且这样可维护性很差，要是后面国产浏览器支持上了 chromium ，这里可能还得改，而且上面这个还没加上 Edge，于是就去掉了。

## 从 Ant Design List load more demo 里发现的新解法

在找到解法的时候，想着说这些组件库是不是这次更新的处理，没有的话是不是可以 pr 一波

于是我打开了 and design 组件文档，体验了下 List load more 的 [demo](https://codesandbox.io/s/gk0jc)

令人惊喜的是，这个 demo 居然可以正常的「点击加载更多」

难道官方团队早就发现这个问题并修复了？

在看了相关组件的提交日志和源码后，我否定了这种想法，确定问题出在了这个 demo 上
```js
import React from 'react';
import ReactDOM from 'react-dom';
import 'antd/dist/antd.css';
import './index.css';
import { List, Avatar, Button, Skeleton } from 'antd';

import reqwest from 'reqwest';

const count = 3;
const fakeDataUrl = `https://randomuser.me/api/?results=${count}&inc=name,gender,email,nat&noinfo`;

class LoadMoreList extends React.Component {
  state = {
    initLoading: true,
    loading: false,
    data: [],
    list: [],
  };

  componentDidMount() {
    this.getData(res => {
      this.setState({
        initLoading: false,
        data: res.results,
        list: res.results,
      });
    });
  }

  getData = callback => {
    reqwest({
      url: fakeDataUrl,
      type: 'json',
      method: 'get',
      contentType: 'application/json',
      success: res => {
        callback(res);
      },
    });
  };

  onLoadMore = () => {
    this.setState({
      loading: true,
      list: this.state.data.concat([...new Array(count)].map(() => ({ loading: true, name: {} }))),
    });
    this.getData(res => {
      const data = this.state.data.concat(res.results);
      this.setState(
        {
          data,
          list: data,
          loading: false,
        },
        () => {
          // Resetting window's offsetTop so as to display react-virtualized demo underfloor.
          // In real scene, you can using public method of react-virtualized:
          // https://stackoverflow.com/questions/46700726/how-to-use-public-method-updateposition-of-react-virtualized
          window.dispatchEvent(new Event('resize'));
        },
      );
    });
  };

  render() {
    const { initLoading, loading, list } = this.state;
    const loadMore =
      !initLoading && !loading ? (
        <div
          style={{
            textAlign: 'center',
            marginTop: 12,
            height: 32,
            lineHeight: '32px',
          }}
        >
          <Button onClick={this.onLoadMore}>loading more</Button>
        </div>
      ) : null;

    return (
      <List
        className="demo-loadmore-list"
        loading={initLoading}
        itemLayout="horizontal"
        loadMore={loadMore}
        dataSource={list}
        renderItem={item => (
          <List.Item
            actions={[<a key="list-loadmore-edit">edit</a>, <a key="list-loadmore-more">more</a>]}
          >
            <Skeleton avatar title={false} loading={item.loading} active>
              <List.Item.Meta
                avatar={
                  <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
                }
                title={<a href="https://ant.design">{item.name.last}</a>}
                description="Ant Design, a design language for background applications, is refined by Ant UED Team"
              />
              <div>content</div>
            </Skeleton>
          </List.Item>
        )}
      />
    );
  }
}

ReactDOM.render(<LoadMoreList />, document.getElementById('container'));
```

可以发现，在加载数据时，会移除按钮，因为本身用了一些 loading 占位项，所以移除按钮并不会让布局看起来有较大的抖动

我们稍微改动下代码，精简如下：
```js
import React from 'react';
import ReactDOM from 'react-dom';
import 'antd/dist/antd.css';
import './index.css';
import { List, Avatar, Button, Skeleton } from 'antd';

import reqwest from 'reqwest';

const count = 3;
const fakeDataUrl = `https://randomuser.me/api/?results=${count}&inc=name,gender,email,nat&noinfo`;

class LoadMoreList extends React.Component {
  state = {
    loading: false,
    data: [],
    list: [],
  };

  componentDidMount() {
    this.getData(res => {
      this.setState({
        data: res.results,
        list: res.results,
      });
    });
  }

  getData = callback => {
    reqwest({
      url: fakeDataUrl,
      type: 'json',
      method: 'get',
      contentType: 'application/json',
      success: res => {
        callback(res);
      },
    });
  };

  onLoadMore = () => {
    this.setState({
      loading: true
    });
    this.getData(res => {
      const data = this.state.data.concat(res.results);
      this.setState(
        {
          data,
          list: data,
          loading: false,
        }
      );
    });
  };

  render() {
    const { loading, list } = this.state;
    const loadMore =
      !loading ? (
        <div
          style={{
            textAlign: 'center',
            marginTop: 12,
            height: 32,
            lineHeight: '32px',
          }}
        >
          <Button onClick={this.onLoadMore}>loading more</Button>
        </div>
      ) : null;

    return (
      <>
      <List
        className="demo-loadmore-list"
        itemLayout="horizontal"
        dataSource={list}
        renderItem={item => (
          <List.Item
            actions={[<a key="list-loadmore-edit">edit</a>, <a key="list-loadmore-more">more</a>]}
          >
            <Skeleton avatar title={false} loading={item.loading} active>
              <List.Item.Meta
                avatar={
                  <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
                }
                title={<a href="https://ant.design">{item.name.last}</a>}
                description="Ant Design, a design language for background applications, is refined by Ant UED Team"
              />
              <div>content</div>
            </Skeleton>
          </List.Item>
        )}
      />
      {loadMore}
      </>
    );
  }
}

ReactDOM.render(<LoadMoreList />, document.getElementById('container'));
```

点击之后，去除了按钮，所以列表居底，填充列表并展示按钮后，列表回到了原来的位置。

并且，在去除了 loading 这个状态后，即
```js
const loadMore = <div
    style={{
      textAlign: 'center',
      marginTop: 12,
      height: 32,
      lineHeight: '32px',
    }}
  >
    <Button onClick={this.onLoadMore}>loading more</Button>
  </div>;
```

点击加载更多的 bug 复现了,而且由于删除按钮还出现了新的偏移抖动。。

![](https://sf1-dycdn-tos.pstatp.com/obj/eden-cn/nupohneh7nupehpqnulog/img/loadmore_antd.gif)

由此，我们可以得到一个结论：

**如果列表下方没有元素(移除或 display none 都行，只要不占位置)，浏览器将不会自行调整上方内容的滚动偏移值**
> 更确切的说，是「触发点击等事件的那个元素直至与列表容器平级的上级元素」都要被去除，其他「平级的下方元素」不需要处理

所以，只要在加载的时候将按钮隐藏，加载后再显示回来。但是隐藏按钮会改动布局，如果没有 loading item 占位的话，数据列表一开始会向下滚，也是挺影响体验的。


综合了下，想到一个骚操作：在拿到数据后，append 到列表的同时隐藏按钮，在填充之后立刻显示它。欺骗浏览器，让其在渲染之时当无事发生。

原生代码如下：

```js
// 三处 getScrollTop() 值均一致
function showMore() {
    let items = document.querySelector('.items')
    let btn = document.querySelector('.btn')
    let tmp = document.createElement('div')
    const lastScrollTop = getScrollTop()
    console.log("lastScrollTop:",lastScrollTop)
    tmp.className = "item"
    tmp.style = `background-color: ${genRandomColor()}`;
    // 先进行隐藏
    btn.style.display = "none";
    items.appendChild(tmp)
    console.log("currentScrollTop:",getScrollTop())
    // 重新显示
    btn.style.display = "block";
    console.log("changeScrollTop:",getScrollTop())
}
```

react 里的写法：

```js
export default function List() {
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState(
    new Array(6).fill().map(v => ({ color: "red" }))
  );
  useLayoutEffect(() => {
    console.log("useLayoutEffect");
  });
  const showMore = async () => {
    let data = await fetch();
    // 每次设置状态都会 re-render
    setLoading(true);
    setList([...list, data]);
    setLoading(false);
  };
  return (
    <div className="container">
      <div className="items">
        {list.map((item, i) => (
          <Item item={item} key={i} />
        ))}
      </div>
      {!loading && (
        <button className="btn" onClick={showMore}>
          点击展开更多
        </button>
      )}
    </div>
  );
}
```


## 怎么模拟 Chrome v84 这种固定视区的效果

这种效果有点像移动端的下拉刷新场景，所以我猜这个更新可能是为移动端准备的。

那么话说回来，其他浏览器要怎么模拟这个功能呢？

可以想到的做法有：
1. 使用 MutationObserver 监听 DOM 变更（新增元素），计算前后 offsetHeight 的差值，使用 scrollBy 进行滚动偏移
2. 点击前后记录按钮的 offsetTop ，其后计算差值并使用 scrollBy 进行滚动偏移


第二种做法 demo 如下

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
        .container {
            width: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .items {
            width: 100%;
        }

        .item {
            margin-top: 10px;
            height: 100px;
            width: 100%;
            background-color: #FF142B;
        }

        .btn {
            width: 200px;
            height: 44px;
            margin-bottom: 40px;
            background: #BCCFFF;
            box-shadow: 0 0 3px 0 rgba(0, 0, 0, 0.05);
            border: none;
            border-radius: 22px;
            font-size: 15px;
            font-weight: 500;
            color: #FF142B;
            -webkit-transition: 150ms all;
            transition: 150ms all;
        }

        .bottom {
            width: 100%;
            height: 1200px;
        }
    </style>
    <script>
        function genRandomColor() {
            const fn = () => parseInt(Math.random() * (255 + 1), 10)
            return `rgb(${fn()},${fn()},${fn()})`
        }
        function getScrollTop() {
            return document.documentElement.scrollTop || document.body.scrollTop
        }
        function showMore() {
            let items = document.querySelector('.items')
            let btn = document.querySelector('.btn')
            let tmp = document.createElement('div')
            const lastOffsetTop = btn.offsetTop
            console.log("lastOffsetTop:", lastOffsetTop)
            tmp.className = "item"
            tmp.style = `background-color: ${genRandomColor()}`;
            items.appendChild(tmp)
            // 放在 rAF 中处理，防止读取 offsetTop 会造成回流，浏览器立刻渲染了 items ，其后调整 scroll 会造成页面闪动
            requestAnimationFrame(() => {
                const currentOffsetTop = btn.offsetTop
                console.log("currentOffsetTop:", currentOffsetTop)
                window.scrollBy({
                    top: currentOffsetTop - lastOffsetTop
                })
            })
        }
        function showMoreWithTimeout() {
            setTimeout(showMore, 10)
        }
    </script>
</head>

<body>
    <div class="container">
        <div class="items">
            <div class="item"></div>
            <div class="item"></div>
            <div class="item"></div>
            <div class="item"></div>
            <div class="item"></div>
            <div class="item"></div>
            <div class="item"></div>
            <div class="item"></div>
            <div class="item"></div>
            <div class="item"></div>
            <div class="item"></div>
            <div class="item"></div>
        </div>

    </div>
    <button class="btn" onclick="showMore()">点击展开更多</button>
    <div class="bottom">
        固定视区
    </div>
</body>

</html>
```

注意这里为了防止回流重绘，放在了 rAF 中处理

如果有其他更好的做法，欢迎评论分享~

## 总结

chrome v84+ 的浏览器具体固定视区的新特性，但同时造成了「点击加载更多」这种场景将不符合预期。

为了解决这个问题，本文提出了两种解决方案，分别是：
1. 滚动偏移重置
2. 隐藏下方元素

两种均能满足大部分场景，不过也有各自的限制：
- 第一种会重置滚动条，所以如果点击按钮后，在列表未填充时，用户继续向下滚动很远；待列表填充后，重置了滚动条，体验也很不好
- 第二种的布局情况还没完全搞清，暂不清楚会不会有某种布局限制

当前，最好还是能看下内核源码是怎么处理的，之后会持续关注该 [bug](https://bugs.chromium.org/p/chromium/issues/detail?id=1112040) 的进展 👻
> 目前状态：已被官方确认

最后，我们尝试调研了该 feature 的实现，以备不时之需


## 后记

显示滚动条瞄点规范，没实现好