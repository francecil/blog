---
title: Chrome 拓展开发笔记
date: 2022-05-06 20:40:35
permalink: /pages/9ce6c1/
categories: 
  - 大前端
  - 前端基础
  - 浏览器生态
  - Extension
tags: 
  - 
titleTag: 草稿
---
content-scripts, background 代码更新，需要到拓展详情页刷新下

content-scripts 代码的输出，在页面的 console 面板下查看，可以理解为注入到页面中的代码

## options background 间通信

chrome.runtime.onMessage.addListener
chrome.runtime.sendMessage


## 短连接 sendMessage callback 回调注意事项

### 1. 异步回调处理

background 处理消息
```js
// background
function handleMessage1(request, sender, sendResponse) {
  console.log(`content script sent a message: ${request.content}`);
  setTimeout(() => {
    sendResponse("handleMessage1");
  }, 100);
}
function handleMessage2(request, sender, sendResponse) {
  console.log(`content script sent a message: ${request.content}`);
  setTimeout(() => {
    sendResponse("handleMessage2");
  }, 1000);
  return true;
}

async function handleMessage3(request, sender, sendResponse) {
  console.log(`content script sent a message: ${request.content}`);
  await new Promise((resolve)=>{
      setTimeout(resolve, 1000)
  })

  sendResponse("handleMessage3");
  return true;
}
async function handleMessage4(request, sender, sendResponse) {
  console.log(`content script sent a message: ${request.content}`);
  await Promise.resolve(1)
  sendResponse("handleMessage4");
  return true;
}

async function handleMessage5(request, sender, sendResponse) {
  console.log(`content script sent a message: ${request.content}`);
  await new Promise((resolve)=>{
      chrome.storage.local.get("a",()=>{
          // 会在后面的 event loop 中调用
          resolve()
      })
  })
  sendResponse("handleMessage5");
  return true;
}

chrome.runtime.onMessage.addListener(handleMessage1);
// ...test
chrome.runtime.onMessage.removeListener(handleMessage1)
chrome.runtime.onMessage.addListener(handleMessage2);
chrome.runtime.onMessage.addListener(handleMessage3);
chrome.runtime.onMessage.addListener(handleMessage4);
chrome.runtime.onMessage.addListener(handleMessage5);
```

content-script 发送事件
```js
// 期望能打印消息接收者 sendResponse 传入的数据
chrome.runtime.sendMessage(msg, console.log)
```


对监听器进行单一或组合设置，可以得到以下结果：

0. 未设置监听器，报错 `Unchecked runtime.lastError: Could not establish connection. Receiving end does not exist` （内部输出错误信息，非异常抛出，下同）
1. 仅设置第一个监听器，报错 `Unchecked runtime.lastError: The message port closed before a response was received.`
2. 仅设置第二个监听器， 1s 后成功打印消息："handleMessage2"
3. 仅设置第三个监听器，报错 `Unchecked runtime.lastError: The message port closed before a response was received.`
4. 仅设置第四个监听器，成功打印消息："handleMessage4"
5. 仅设置第五个监听器，报错 `Unchecked runtime.lastError: The message port closed before a response was received.`
6. 设置1，2监听器， 100ms 后打印消息："handleMessage1"

结论：
1. 所有监听器的回调在同一个 event-loop 中执行
2. sendResponse 若不在当前 event-loop 中调用，需要在当前 event loop 中的某个监听器中返回 true ，否则后续再调用，发送者回调将报错
3. 多次执行 sendResponse ，仅处理第一次，即发送者回调仅收到第一次执行时传入的参数



### 2. sendMessage callback 回调执行时机

```js
chrome.runtime.sendMessage(msg, (res)=>{
    console.log('res:', res) //res: undefined
})
```
**回调必定执行**

即使接收方未执行 sendResponse ，或者因为各种原因导致发送方没收到消息，发送方也会执行（其中的回调参数为 undefined）

因此如果想根据不同情况执行 sendMessage 回调，应该判断回调中参数取值，而不是在接收方中做 sendResponse 的执行控制

