## 前言

Refs 转发：将父组件创建的 ref 传递给子组件的某个dom元素（或组件）。让父组件可以直接操作该dom元素（或组件）

一开始使用该技术的时候，分不清传 自定义 ref prop 和 转发ref 有什么区别，本文稍微探讨下

<!--more-->

## Demo: 父组件触发子组件的input元素获取焦点

InputChild 为子组件,App 为父组件

```jsx
const InputChild = (props) => (
  <input></input>
));
class App extends React.Component {
  constructor() {
    super()
    this.icRef = React.createRef();
  }
  render () {
    <InputChild ref={this.icRef}>Click me!</InputChild>;
  }
}
```

按上面的操作,icRef 拿到的是 InputChild 组件，拿不到 InputChild 下的 input 元素。

比如想在父组件上让 InputChild 的 input 获取焦点，是不行的。

```js
this.icRef.current.focus() //报错
```

### InputChild 创建 ref 绑定 input

在 InputChild 上，利用`inputRef = React.createRef()` 绑定 input,

然后父组件通过 `ref.current.inputRef.current.focus()` 获取焦点

```jsx
class InputChild extends React.Component{
  constructor(){
    super()
    this.inputRef = React.createRef()
  }
  render(){
    return (
      <input ref={this.inputRef}></input>
    )
  } 
}
class App extends React.Component {
  constructor() {
    super()
    this.icRef = React.createRef();
  }
  render () {
    <InputChild ref={this.icRef}>Click me!</InputChild>;
  }
}
```

```js
this.ref.current.inputRef.current.focus() // input 获取焦点
```

### Refs 转发

#### 函数组件使用
```jsx
const InputChild = React.forwardRef((props, ref) => (
  <input ref={ref}>
  </input>
));
class App extends React.Component {
  constructor() {
    super()
    this.icRef = React.createRef();
  }
  handleClick = () => {
    this.icRef.current.focus()
  }
  render () {
     <>
      <button onClick={this.handleClick}>Learn React</button>
      <InputChild ref={this.icRef}>Click me!</InputChild>;
     </>
  }
}
```
> 点击 button 后，input 可以获取到焦点

#### Class 组件使用
```jsx
function refProps(Component) {
  return React.forwardRef((props, ref) => {
    return <Component {...props} forwardedRef={ref} />;
  });
}

@refProps
class InputChild extends React.Component{
  render(){
    const { forwardedRef } = this.props;
    return (
      <input ref={forwardedRef}></input>
    )
  }
}
```
> 效果同上，但是这里是 将 ref 绑定到新的prop上

尚未知道还有没有更好的做法

### 自定义 prop 属性

其实也可以直接定义一个 非ref 的prop，如下

```jsx
class InputChild extends React.Component{
  render(){
    const { forwardedRef } = this.props;
    return (
      <input ref={forwardedRef}></input>
    )
  }
}
// 父组件使用
<InputChild forwardRef={this.ref} />
```

**注意：**函数式组件不能提供ref，否则对ref的访问将会失败，只能用`React.forwardRef()`传递 ref

> 效果是一样，但是对于组件使用者（不知道子组件代码的）来说， ref是透明的
> 第一想法是用 ref 绑定子组件而不是其他额外prop (forwardRef)，作为高阶组件封装时，这样做更加友好.

参考 [浅谈 React Refs](https://imweb.io/topic/5b6136a06025939b125f45ff)

## 高阶组件上使用 refs 转发

需求：我们有一个 LogProps 高阶组件用于记录 props log，但是对 上层用户是不可见的

用户使用 `<Child ref={this.ref}/>` 。 ref 拿到的应该是 Child 而不是 高阶组件

**错误使用**

```jsx
function logProps(WrappedComponent) {
  class LogProps extends React.Component {
    componentDidUpdate(prevProps) {
      console.log('old props:', prevProps);
      console.log('new props:', this.props);
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  }

  return LogProps;
}

@logProps
class Child extends React.Component{
  render(){
    <div/>
  }
}
<Child ref={this.ref}>Click me!</Child>;
```
`this.ref` 拿到的是 LogProps 组件，ref prop被消化，不会被传递到 Child

**正确使用**

```jsx
function logProps(WrappedComponent) {
  class LogProps extends React.Component {
    componentDidUpdate(prevProps) {
      console.log('old props:', prevProps);
      console.log('new props:', this.props);
    }

    render() {
      const {forwardedRef, ...rest} = this.props;

      // Assign the custom prop "forwardedRef" as a ref
      return <WrappedComponent ref={forwardedRef} {...rest} />;
    }
  }
  
  return React.forwardRef((props, ref) => {
    return <LogProps {...props} forwardedRef={ref} />;
  });
}
@logProps
class Child extends React.Component{
  render(){
    <div/>
  }
}
<Child ref={this.ref}>Click me!</Child>;
```
`this.ref` 拿到的是 Child 组件

### Child 组件使用高阶组件，并且父组件的 ref 要绑定 Child下的 input元素

在以上的基础上，再转发一次

```jsx
const InputChild = React.forwardRef((props, ref) => (
  <input ref={ref}>
  </input>
));

// 使用高阶组件对其进行封装
export default logProps(InputChild);
// 父组件中
<Child ref={this.ref}>Click me!</Child>;
```

> 父组件 this.ref.current.focus() 即可让 input 获取焦点

## 参考

1. [转发 Refs](http://react.html.cn/docs/forwarding-refs.html)
2. [React 中的转发ref](https://www.jianshu.com/p/ea89610dbbfd)

## React.forwardRef 源码解析

```jsx
export default function forwardRef<Props, ElementType: React$ElementType>(
  render: (props: Props, ref: React$Ref<ElementType>) => React$Node,
) {
  // ... 一些检测代码
  return {
    $$typeof: REACT_FORWARD_REF_TYPE,
    render,
  };
}
```

举个demo
```jsx
const InputChild = React.forwardRef((props, ref) => (
  <input ref={ref}>
  </input>
));
<InputChild ref={this.icRef}>Click me!</InputChild>;
```
那 InputChild 组件上的 icRef 是怎么传到 forwardRef 里面的呢？

InputChild 组件其实就是 ReactElement, 我们先看下 src/ReactElement.js 的代码

实际上我们写的 jsx ，调用的是 createElement 方法，该方法最后又实例化一个 ReactElement 对象

```jsx
var InputChild = React.forwardRef(function (props, ref) {
  return React.createElement("input", {
    ref: ref
  });
});
=>
var InputChild = React.forwardRef(function (props, ref) {
  return ReactElement(
    "input",//ref
    "",//key
    ref,
    null,//self
    null,//source
    ReactCurrentOwner.current,
    {},//props
  );
});
=>
var InputChild = React.forwardRef(function (props, ref) {
  return {
    // This tag allows us to uniquely identify this as a React Element
    $$typeof: REACT_ELEMENT_TYPE,

    // Built-in properties that belong on the element
    type: "input",
    key: "",
    ref: ref,
    props: {},

    // Record the component responsible for creating this element.
    _owner: ReactCurrentOwner.current,
  };
});
=>
var InputChild = (function render(props, ref){
    return {
      $$typeof: REACT_ELEMENT_TYPE,
      type: "input",
      key: "",
      ref: ref,
      props: {},
      _owner: ReactCurrentOwner.current,
    };
  })=>({
  $$typeof: REACT_FORWARD_REF_TYPE,
  render
});
```

至于组件怎么渲染的，在 `react\packages\react-dom\src\server\ReactPartialRenderer.js`中定义，
```js
case REACT_FORWARD_REF_TYPE: {
            const element: ReactElement = ((nextChild: any): ReactElement);
            let nextChildren;
            const componentIdentity = {};
            prepareToUseHooks(componentIdentity);
            nextChildren = elementType.render(element.props, element.ref);
            nextChildren = finishHooks(
              elementType.render,
              element.props,
              nextChildren,
              element.ref,
            );
            nextChildren = toArray(nextChildren);
            const frame: Frame = {
              type: null,
              domNamespace: parentNamespace,
              children: nextChildren,
              childIndex: 0,
              context: context,
              footer: '',
            };
            if (__DEV__) {
              ((frame: any): FrameDev).debugElementStack = [];
            }
            this.stack.push(frame);
            return '';
          }
```
创建了一个frame，children就是 InputChild的render



createElement 是怎么和dom联系在一起的？

分析的有点乱。。未完待续。。