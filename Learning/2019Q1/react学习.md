## redux-thunk 中间件
 将store.dispatch方法中的参数  由对象变成支持函数

##　Dva model对象
educers: Action 处理器，处理同步动作，用来算出最新的 State
> 相当于vuex的mutation
effects：Action 处理器，处理异步动作
> 相当于vuex的action

相比vuex,redux何时需要让每个页面的state抽离出来 放到model中？
> 数据仅当页面使用 用state即可
## react的module.hot

页面不刷新，自动热更新

## antd table onFilter

- 过程

- 可优化点

## 组件方法编写规范

自定义的方法 用 `方法名 = function(){}`
原生方法和渲染组件方法用 `方法名()`

## 启用css module

https://www.jianshu.com/p/0246794ac0c3

在build目录  utils中 将
```js
var cssLoader = {
    loader: 'css-loader',
    options: {
      minimize: process.env.NODE_ENV === 'production',
      sourceMap: options.sourceMap
    }
  }
```
改为
```js
var cssLoader = {
    loader: 'css-loader',
    options: {
      modules: true,
      minimize: process.env.NODE_ENV === 'production',
      sourceMap: options.sourceMap
    }
  }
```

当启用module时，原来的`import 'xxx.less'` 将不会生效；

使用 `import styles from 'xxx.less'`  以及 `<Button className={styles.button}>`

## antd Select组件 value为空时显示placeholder

把value对应的变量初始设为undefined 或者不定义