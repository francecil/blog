## redux-thunk 中间件
 将store.dispatch方法中的参数  由对象变成支持函数

##　Dva model对象
educers: Action 处理器，处理同步动作，用来算出最新的 State
> 相当于vuex的mutation
effects：Action 处理器，处理异步动作
> 相当于vuex的action

相比vuex,redux何时需要让每个页面的state抽离出来 放到model中？