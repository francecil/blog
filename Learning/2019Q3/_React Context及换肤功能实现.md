## 前言

通过讲解 React Context 的用法，引出 React 换肤功能的实现

## Context 概念

在组件树中共享数据，避免逐层传递。

我们经常遇到这样的场景，数据需要传到子组件的子组件更甚至更下层组件，用props逐层传递的代码如下：

<!-- more -->

```jsx
class App extends React.Component {
  render() {
    return <Toolbar theme="dark" />;
  }
}
function Toolbar(props) {
  // Toolbar 组件接受一个额外的“theme”属性，然后传递给 Button 组件。
  // 如果应用中每一个单独的按钮都需要知道 theme 的值，这会是件很麻烦的事，
  // 因为必须将这个值层层传递所有组件。
  return (
    <div>
      <Button theme={props.theme} />
    </div>
  );
}
function Button(props){
  // Button 组件根据传递过来的 theme 决定 背景色
  return (
    <button style={{backgroundColor:props.theme==='dark'?'black':'white'}}>
      test
    </button>
  )
}
```

使用 context,可以避免中间组件传递props

## Context 基本使用

```jsx
// 为当前的 theme 创建一个 context（“light”为默认值）。
const ThemeContext = React.createContext('light');
class App extends React.Component {
  // 使用一个 Provider 来将当前的 theme 传递给以 Toolbar 开始的组件树
  // 本例使用 "dark" 值覆盖默认的 "light"值
  render() {
    return (
      <ThemeContext.Provider value="dark">
        <Toolbar />
      </ThemeContext.Provider>
    )
  }
}
function Toolbar() {
  // 无需再传递 theme值
  return (
    <div>
      <Button />
    </div>
  );
}
function Button(){
  // 在 Context.Consumer 中通过 RenderProps 的方式使用
  return (
    <ThemeContext.Consumer>
      {theme =>(
        <button style={{backgroundColor:theme==='dark'?'black':'white'}}>
          test
        </button>
      )}
    </ThemeContext.Consumer>
  )
}
```

Button 往上组件树寻找最近的 ThemeContext.Provider 提供的value值，如果没有对应的 Provider，使用 createContext 时的默认值

同时也说明了一个问题，数据是单向的自上而下，若 `ThemeContext.Provider` 定义在子组件， `ThemeContext.Consumer` 在父组件，子组件传的值传不到父组件中。这里就不举例了

在 Class 组件中也可以用 Consumer 的形式
```jsx
class Button extends React.Component {
  render() {
    return (
      <ThemeContext.Consumer>
        {theme => (
          <button style={{ backgroundColor: theme === 'dark' ? 'black' : 'white' }}>
            test
          </button>
        )}
      </ThemeContext.Consumer>
    )
  }
}
```

但是在 render 里这么写看着有点乱，如果 theme的值能像 props 那样使用就好了，

这使用就要利用 `Class.contextType` 来获取 `this.context` 值，举个例子
```jsx
class Button extends React.Component {
  static contextType = ThemeContext;
  render() {
    let theme = this.context;
    return (
      <button style={{ backgroundColor: theme === 'dark' ? 'black' : 'white' }}>
        test
      </button>
    )
  }
}
```
> 挂载在 class 上的 contextType 属性会被重赋值为一个由 React.createContext() 创建的 Context 对象。这能让你使用 this.context 来消费最近 Context 上的那个值。你可以在任何生命周期中访问到它，包括 render 函数中。

参考：[Class.contextType](https://react.docschina.org/docs/context.html#classcontexttype)

可以看出来，如果是使用 contextType 的做法，只能消费最近的一个 Context ，多 Context 还是得通过 Consumer 实现

## Context 注意事项

1. 当传递对象给 value 时，检测变化的方式会导致一些问题
2. 何时不用

## 换肤

未完待续。。