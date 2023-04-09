---
title: React Context及换肤功能实现
date: 2019/07/01 01:00:00
tags: 
  - React
  - 换肤
permalink: /pages/bc4496/
categories: 
  - 随笔
---

## 前言

通过讲解 React Context 的用法，引出 React 换肤功能的实现

<!-- more -->

## Context 概念

在组件树中共享数据，避免逐层传递。

我们经常遇到这样的场景，数据需要传到子组件的子组件更甚至更下层组件，用props逐层传递的代码如下：


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

### Provider & Consumer
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

### Class 组件使用 Consumer

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

### Class 组件使用 contextType

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
> `static contextType = ThemeContext;` 也可以写在外面: `Button.contextType = ThemeContext;`
> 
> 挂载在 class 上的 contextType 属性会被重赋值为一个由 React.createContext() 创建的 Context 对象。这能让你使用 this.context 来消费最近 Context 上的那个值。你可以在任何生命周期中访问到它，包括 render 函数中。

参考：[Class.contextType](https://react.docschina.org/docs/context.html#classcontexttype)

### 消费多个 Context

可以看出来，如果是使用 contextType 的做法，只能消费一种 Context 且最近的那个 ，多 Context 还是得通过 Consumer 实现

举例：
```jsx
const ThemeContext = React.createContext('light');
const UserContext = React.createContext({
  name: 'Guest'
});
class App extends React.Component {
  render() {
    return (
      <ThemeContext.Provider value="dark">
        <ThemeContext.Provider value="blue">
          <UserContext.Provider value={{ name: 'gahing' }}>
            <Toolbar />
          </UserContext.Provider>
        </ThemeContext.Provider>
      </ThemeContext.Provider>
    );
  }
}

function Toolbar() {
  return (
    <div>
      <Button />
    </div>
  );
}

class Button extends React.Component {
  static contextType = ThemeContext;
  render() {
    let theme = this.context;
    console.log(theme)
    return (
      <button style={{ backgroundColor: theme === 'dark' ? 'black' : 'red' }}>
        <UserContext.Consumer>
          {(user) => (
            <span>{user.name}</span>
          )}
        </UserContext.Consumer>
      </button>
    )
  }
}
```
可以看到,theme 拿到的值为最近的 Provider 提供的 `blue` ,button里面的内容是 `gahing` 。

同时，要想使用 UserContext 值，需要使用 `Context.Consumer`


### 在嵌套组件中更新 Context

还是以最开始的 ThemeContext 为例，此时我们需要加个功能，点击 button 后 backgroundColor 会进行切换，

最简单的想法是就是 Provider 包组件的时候传一个 toggleTheme prop,然后一层层传上去，最后 button 点击的时候执行 toggleTheme 方法，

就又回到了最开始说 props 逐层传递的弊端，那应该怎么做呢？

把 toggleTheme 和 theme 都作为一个对象属性放在 React.createContext 中的默认值参数
```jsx
export const ThemeContext = React.createContext({
  theme: 'dark',
  toggleTheme: () => {},
});
```
具体例子
```jsx
const ThemeContext = React.createContext({
  theme: 'dark',
  toggleTheme: () => {},
});
class App extends React.Component {
  constructor(props) {
    super(props);
    this.toggleTheme = () => {
      this.setState((state) => ({
        theme:
          state.theme === 'dark'
            ? 'light'
            : 'dark',
      }));
    };
    this.state = {
      theme: 'light',
    };
  }
  render() {
    return (
      <ThemeContext.Provider value={{
        theme:this.state.theme,
        toggleTheme: this.toggleTheme,
      }}>
        <Toolbar />
      </ThemeContext.Provider>
    );
  }
}

function Toolbar() {
  return (
    <div>
      <Button />
    </div>
  );
}

class Button extends React.Component {
  static contextType = ThemeContext;
  render() {
    let {theme, toggleTheme} = this.context;
    return (
      <button style={{ backgroundColor: theme === 'dark' ? 'black' : 'white' }} onClick={toggleTheme}>
        test
      </button>
    )
  }
}
```
效果即默认白色按钮，点击后切换成黑色，再点又变成白色...

## Context 注意事项

> 写例子的时候用的是 tsx,不了解 typescript 的可以直接把 any 之类的删去

### 1.当传递对象给 value 时，检测变化的方式会导致一些问题

上面的例子中， ThemeContext value的值是这样的
```js
<ThemeContext.Provider value={{
  theme:this.state.theme,
  toggleTheme: this.toggleTheme,
}}>
```
当 provider 的父组件（App）进行重渲染（执行render方法）时，由于 provider 的`value`属性总是一个新的对象，导致 consumers 组件会触发意外的渲染

把上面的例子稍微改造下就知道了
```jsx
const ThemeContext = React.createContext({
  theme: 'dark',
  toggleTheme: () => {},
});
class App extends React.Component<any,any> {
  private toggleTheme:any;
  constructor(props: any) {
    super(props);
    this.toggleTheme = () => {
      this.setState((state: any) => ({
        themeContext: {
          theme: state.themeContext.theme === 'dark'
            ? 'light'
            : 'dark',
          toggleTheme: state.themeContext.toggleTheme
        }
      }));
    };
    this.state = {
      themeContext: {
        theme: 'light',
        toggleTheme: this.toggleTheme,
      },
      count: 1,
    };
  }
  componentDidMount(){
    setTimeout(() => {
      this.setState({
        count:2
      })
    }, 5000);
  }
  render() {
    console.log('render App')
    return (
      <ThemeContext.Provider value={{
        theme: this.state.themeContext.theme,
        toggleTheme: this.toggleTheme,
      }}>
        <Toolbar />
        <span>{this.state.count}</span>
      </ThemeContext.Provider>
    );
  }
}
// 使用memo,当props没有变动时不触发render
const Toolbar = React.memo(()=> {
  console.log('render Toolbar')
  return (
    <div>
      <Button />
    </div>
  );
})
// 使用 PureComponent,本来应该是 props没有变动时不触发render，但本例中还是触发了render
class Button extends React.PureComponent {
  static contextType = ThemeContext;
  render() {
    let {theme, toggleTheme} = this.context;
    console.log('render Button')
    return (
      <button style={{ backgroundColor: theme === 'dark' ? 'black' : 'white' }} onClick={toggleTheme}>
        test
      </button>
    )
  }
}
```
输出结果为
```sh
render App
render Toolbar
render Button
# 自动过5s后输出
render App
render Button
```
可以发现，App组件重渲染的时候，Button 这个 consumers 组件也发生了重渲染

Button 换成 Consumer 的实现
```jsx
class Button extends React.PureComponent {
  render() {
    console.log('render Button')
    return (
      <ThemeContext.Consumer>
        {({ theme, toggleTheme }) => {
          console.log('render Consumer')
          return (
            <button style={{ backgroundColor: theme === 'dark' ? 'black' : 'white' }} onClick={toggleTheme}>
              test
            </button>
          )
        }}
      </ThemeContext.Consumer>

    )
  }
}
```
输出结果为
```sh
render App
render Toolbar
render Button
render Consumer
# 自动过5s后输出
render App
render Consumer
```
此时没有输出 `render Button` 是因为 Button 并不是 Consumer 组件，只有底下的子组件(Consumer包住的部分) 才是，才会进行重渲染

改造 `value`,使得 consumers 组件不会重渲染
```jsx
// App render 修改为
<ThemeContext.Provider value={this.state.themeContext}>
```
输出结果为
```sh
render App
render Toolbar
render Button
render Consumer
# 自动过5s后输出
render App
# 点击按钮后输出
render App
render Consumer
```
这就说明，App组件进行重渲染，只要 provider 提供的 value 值不变，其下的 consumers 组件就不会意外的重渲染

**除了将 value 状态提升到父节点的 state 里，也可以利用 `memoization` 来实现**
```jsx
import memoize from "memoize-one";
class App extends React.Component<any, any> {
  private toggleTheme: any;
  constructor(props: any) {
    super(props);
    this.toggleTheme = () => {
      this.setState((state: any) => ({
        themeContext: {
          theme: state.themeContext.theme === 'dark'
            ? 'light'
            : 'dark',
        }
      }));
    };
    this.state = {
      themeContext: {
        theme: 'light',
      },
      count: 1,
    };
  }
  componentDidMount() {
    setTimeout(() => {
      this.setState({
        count: 2
      })
    }, 5000);
  }
  cacheThemeContext = memoize((theme)=>({
    theme,
    toggleTheme: this.toggleTheme
  }))
  render() {
    console.log('render App')
    return (
      <ThemeContext.Provider value={this.cacheThemeContext(this.state.themeContext.theme)}>
        <Toolbar />
      </ThemeContext.Provider>
    );
  }
}
```

### 2.什么情况下不该用 Context

> Context 主要应用场景在于**很多**不同层级的组件需要访问同样一些的数据

> 如果你只是想避免层层传递一些属性，[组件组合（component composition）](https://react.docschina.org/docs/composition-vs-inheritance.html)有时候是一个比 context 更好的解决方案

参考: [使用 Context 之前的考虑](https://react.docschina.org/docs/context.html#before-you-use-context)

大致意思就是把最底下需要用到 props 的组件提到最上层来，将组件包成一个prop往下传递，

这里有个疑问，那不还是得每个组件写一次 prop 而且这些高层组件变得更复杂了。。

当然有的说法是减少了传递的props数量，对高层组件更容易把控等等。。

所以，使用 `组件组合` 还是 `Context` 个人觉得没有详细的界限


## 换肤

需求很简单，换个主题色。

[React组件库主题设计](https://github.com/whinc/blog/issues/4) 的做法，主题色定义在js中，和上文一样，通过 Context 去设置或切换主题色

同样的，主题色定义在 css 中，context 值保存 className，切换 className 实现主题切换

（示例就不提供了，可以看上面的参考文献）

