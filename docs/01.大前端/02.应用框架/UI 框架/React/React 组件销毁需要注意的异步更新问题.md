---
title: React 组件销毁需要注意的异步更新问题
date: 2023-08-19 00:54:07
permalink: /pages/4d1d04/
categories: 
  - 大前端
  - 应用框架
  - UI 框架
  - React
tags: 
  - 
titleTag: 笔记
---
## 问题描述

组件销毁，闭包内部的异步逻辑还会继续。存在什么问题？

1. 状态不会正常更新，这个符合预期。原因是 React 内部做了处理，在销毁的组件中更新状态不会成功会出警告：`Warning: Can't perform a React state update on an unmounted component`
2. 其他副作用会生效，可能影响页面状态。

如何解决这两个问题？

## 解决方案

包装一个 hook ，提供一个异步处理器，并在 unmount 状态下关闭这个处理器。

下面是一个简单的示例代码：

```js
export function useFetch = (config, deps) => {
  const abortController = new AbortController()
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState()

  useEffect(() => {
    setLoading(true)
    fetch({
      ...config,
      signal: abortController.signal
    }).then(res => setResult(res))
      .finally(_ => setLoading(false))
  }, deps)

  useEffect(() => {
    return () => abortController.abort()
  }, [])

  return { result, loading }
}

const { loading, result } = useFetch({ url: 'xxx' }, [])
```

上面是一个立即调用请求的 hook ，不一定好用，业务上一般是在特定时机下才发起请求。

生产环境下可以考虑使用 ahooks 的 [useRequest](https://ahooks.js.org/zh-CN/hooks/use-request/index)

## 拓展阅读
- [React报错之无法在未挂载的组件上执行React状态更新](https://cloud.tencent.com/developer/article/2077378?from=15425)
- [React 查漏补缺](https://heptaluan.github.io/2020/10/11/React/11/)