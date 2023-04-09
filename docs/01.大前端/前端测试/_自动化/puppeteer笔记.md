## 嵌套 iframe 如何寻找

1. 直接在所有的 frames 里进行寻找
```js
// 得到的是所有 iframe 包括嵌套的，以及顶级窗口
// iframe 的顺序是按照 bfs 顺序
// iframe url 不含 hash 值 
let frames = await page.frames() 
const result = frames.find(f=>f.url()==='xxx')
```

2. 得到某个 iframe 后，寻找其子 iframe
```js
let frames = await page.frames() 
const frame = frames.find(f=>f.url()==='xxx')
const childFrames = await frame.childFrames()
const result =  childFrames.find(f=>f.url()==='xxx')
```

## iframe 的 url 总是拿的最新值

```js
let frames = await page.frames();
frames.forEach(f => {
    // 输出的总是最新值
    console.log(f._url, f.url())
});
// 如果 frame 的 url 变更后 f._url 也会变更
```


## 插件升级，配置如何同步升级


## 查看页面的报错情况

```js
// 需要在页面导航前注册
page.on('pageerror', (error)=>{

})
page.goto('xxx')
```

在控制台上手动抛出的错误，不会触发 pageerror 回调

