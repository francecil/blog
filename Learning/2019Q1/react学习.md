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

后记：其实是绑定上下文的关系，自定义的方法 用箭头函数，上下文属于该组件

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

## antd Select组件 设置100% width时 option选项过长时样式错乱

由form-item包裹住，设置
```css
.ant-form-item-control-wrapper{
  width: 10%; //随便设置小的宽度
}
```

## antd FormItem 组件 设置label样式

官方文档写了可以定义labelCol，其用法和Col组件一样，

但是其是支持style属性的，文档上没写
```
<FormItem label="序列号" labelCol={{style:{width:'80px'}}}>
```
可以定义固定宽度的label

from:https://github.com/ant-design/ant-design/issues/6113

## Antd Table组件 配置规范

### 前言

开发的时候遇到了这样的几个问题：
1. 左侧菜单收缩时出现行不对齐
2. 某列数据过长挤压其他列，导致显示不美观

官方文档讲的较为模糊，网上也没有相应的配置文章，width的设置也较为随意，故把一些经验和实践进行了记录。


<!--more-->


### 官方配置文档

https://ant.design/components/table-cn/

### 定义：
column: antd中table的columns列表属性中的一项

column-width: column 的width属性

style-width: column render时祖先节点style的 width 属性

style-maxWidth: column render时祖先节点style的 maxWidth 属性

### 设置规则
一般来说，当列多于7列（经验值）或者某列的列数据长度不固定且可能很长，则需要根据下述规则来进行设置

style-width 值设置效果：数据超出其宽度可以折行显示，且有固定数据折行行数的效果保证组件行对齐

style-maxWidth 值设置效果：在style-width的优点上增加了一个自适应

1. 配置fixed列，一般是 columnKey列和操作列。
2. 非fixed的最后一列不设置column-width, 保证自适应；其余都设置column-width属性
3. 当非fixed最后一列数据长度不固定时，设置style-maxWidth，避免Table组件拉大时，列数据行数变动导致组件行不对齐；
> 这里其实也可以将style-maxWidth改为style-width,因为该列是自适应的，不会出现style-width空占宽度的效果
4. column-width 的设置规则：需要根据列头和列数据来判断
> 4.1 当列数据长度固定时，取max(列头,列数据长度);
> 可以通过测量或者用公式计算：15*(中文字体个数)+12*(大写字母个数)+8*(小写字母或特殊字符个数)+14(有筛选)+14(有排序)+x(拓宽列，值为0+，一般是为了让最后结果可以整十再加上x)
> 注：列需要margin（margin:0 16px），最后结果为上述值加上32
> 
> 4.2 当列数据长度不固定时，取列头，同上最后结果需要加上32;
> 并设置 style-maxWidth 值，这里不设置style-width 是因为style-width会固定某个宽度，如果当页数据宽度较小时，该列占了很多空白空间，不能自适应，效果不好
> 该列数据显示长度就控制在[column-width,style-maxWidth]中，
5. 需要设置scroll.x 值，具体值的计算如下：

```js
let scrollX = 0
if(配置了rowSelection){
  scrollX+=62 //多选框时，其占62px，30width+32margin
}
for(每一列){ 
  if(该列仅设置column-width){
    scrollX += column-width
  } else {
    // 该列值取三者的最大值，未设置则为0，style相关属性需要加上margin的32
    scrollX += Math.max(column-width,style-width+32,style-maxWidth+32)
  }
}
```
以上操作之后，就会得到一个好看的Table了

当Table组件的宽度小于scroll.x时就会出现滚动条。

我们有个原则，即在1920页面宽度尽量不出现滚动条，且最好是左侧菜单不收缩的情况下不出现滚动条。仅在小屏才显示

我们以以下一个例子讲述：
> 左侧菜单栏占256px,Table组件1530-15(总页面存在y滚动条)px,

scroll.x 最大应该为1515， 当大于这个数，就可能会出现滚动条

再多，左侧菜单栏收缩到只剩80px scroll.x 最大应该为 1691

若scroll.x计算值较大，则考虑看能不能继续压缩每一列的宽度或采用其他展现方式（Tooltip）=，=

### 优化：如何在大屏的时候将 `overflow:scroll` 去掉

多了一个滚动条（即使不能滚动），不美观，能动态获取页面size并进行scroll.x的设置与否不？

### **简易配置**

列数据宽度都是确定的，只设置scroll.x为通用值1500 最后一列操作列设置fixed right 和column-width。

看下大小屏展示效果，不行再具体调列

### 采用`word-break：break-all` 代替 style-maxWidth

### 使用省略号 ellipsis

https://github.com/ant-design/ant-design/issues/5753#issuecomment-451896473

https://github.com/ant-design/ant-design/issues/5753#issuecomment-457319869

## antd Modal 组件

destroyOnClose 每次都重建，避免上次校验和数据的影响

## Form 组件

定义校验触发时机：
```
validateTrigger: ['onChange', 'onBlur'],
```

### 校验某个输入框的值是否为数字
因为输入框的值是string,如果在rules中用`type:"number"`是没有效果的

可以配合transform使用，transform只影响验证 不影响实际值
```js
{
                  type: 'number',
                  message: '必须为数字',
                  transform: (value) => {
                    return Number(value) ? Number(value) : value;
                  }
                }
```

或者自已写个 validator 来控制。

对于简单的类型 validator 比较快，如果是 float regexp 等等 validator还得自己写正则判断，不如 transform 快

https://github.com/yiminghe/async-validator#type

https://github.com/ant-design/ant-design/issues/731

## InputNumber 组件

### 只允许输入整数,大小在1~1000之间

```js
<InputNumber style={{ width: '100%' }}
                            min={1}
                            max={1000}
                            formatter={value => value&&parseInt(value)}
                            placeholder="请输入数量，仅限于阿拉伯数字"
                        />
```

## react 高阶组件使用时遇到的问题

layout组件render 遍历输出页面组件（Route包装），为了在页面组件上加一个鉴权，在输出页面组件的时候改成authHOC(页面组件)，使其变成高阶组件。

但是layout每次render的时候根据diff会用重新authHOC(页面组件)，而不是复用原来的，导致挂载了多次页面组件。

解决办法就是在layout引入页面组件时（import childRoutes from xx），该childRoutes 里的页面组件就是高阶组件的了。

```js
export const childRoutes = [
  {
    'path': '/',
    'component': Home,
    'exact': true,
  },
  {
    'path': '/projects',
    'component': ProjectList
  }
]
childRoutes.forEach(route => route.component = authHOC(route.component))
```

## 列表查询 规范
关于列表查询中 搜索项、筛选、排序、分页，我这边做个规范，你看下可行不。

1. 点击查询按钮：带上 搜索项、筛选、排序参数，分页为第一页
2. 增删改操作后的列表刷新：带上 搜索项、筛选、排序参数，分页为第一页
3. 点击重置按钮：清空搜索项、筛选、排序参数，啥都不带，分页为第一页
4. 修改筛选 排序 分页参数：带上 搜索项、筛选、排序参数，分页为当前页

## 组件unmount时 仍对state进行操作造成的内存泄漏

参考：https://segmentfault.com/a/1190000017186299

拦截unmounted方法，触发时设置flag变量为true，并拦截setState方法，在触发时先判断是否unmounted

同时学习了修饰器语法

## antd 自定义表单控件

https://ant.design/components/form-cn/#components-form-demo-customized-form-controls

## antd form 在change和blur时做不同的校验

https://github.com/react-component/form#option-object 

```js
<Form.Item label="私网DNS服务（首选）" {...formItemLayout}>
            {form.getFieldDecorator('dns', {
              validate: [
                {
                  trigger: 'onBlur',
                  rules: [{
                    required: true,
                    validator: validateIpNotExistNull,
                    message: '请输入私网DNS服务（首选）'
                  }]
                }, {
                  trigger: ['onChange','onBlur'],
                  rules: [{
                    validator: validateIpArray,
                    message: '格式错误'
                  }]
                }
              ],
            })(
              <IpInput></IpInput>
            )}
          </Form.Item>
```

判空提示仅在 blur 时，
格式校验在blur和change时都做

## antd 覆盖组件默认样式

只影响当前某个父节点下(.parant-div)的antd组件，

less中这么写，无需配置css module
```css
.parant-div {
  :global(.ant-input){
    width:11px;
  }
}
```

20190507后记：这个貌似只在css module中起作用，

普通的话，其实只需要 外面包一层class就行了
```css
.parant-div {
  > .ant-input {
    width:11px;
  }
}
```
https://segmentfault.com/q/1010000012379541/a-1020000012392115

## antd TreeSelect 自动获得焦点并展开列表

使用Select中的属性 ：defaultOpen

TreeSelect 的文档里没写。。

## antd Pagination 修改 `每页显示多少条选择框` 中的文字描述

中文默认是 ' 条/页'，即 `xx 条/页`

配置 `locale:{ items_per_page: '行/页' } ` 可以变成 `xx 行/页`

## select 组件：Option 值(id) 框中值(name) 下拉选项值（Icon+name）各不一样

提交时使用id

关键在于使用了自定义的属性temp(也可以使用其他的名字)

```html
<Select
                showSearch
                allowClear
                placeholder="请输入，并选择"
                optionLabelProp="temp"
                optionFilterProp="temp"
                filterOption={(input, option) => (option.props.temp||"").toLowerCase().indexOf(input.toLowerCase()) >= 0}
              >
                {labelList.map(d => <Select.Option key={d.id} value={d.id} temp={d.name}>{`Icon-${d.name}`}</Select.Option>)}
              </Select>
```

## antd Select 焦点问题

在设置 showSearch 的情况下，autofocus 或者 focus 方法没有效果

> 其实是有效果的，这个组件还需要按 enter or ↓ 键 进入搜索模式,交互上好像没法避免

issue:https://github.com/ant-design/ant-design/issues/8269

不知道能不能找到最终显示的搜索框的input 让他获取焦点
`this.selector.rcSelect.inputRef.focus()` 仍然没有效果

采用Input+Dropdown实现同样效果，然后对Input做focus

## antd Select dropdownRender 触发事件

https://github.com/ant-design/ant-design/issues/14639

https://github.com/ant-design/ant-design/issues/13448

## antd select 大数据量的解决方案

官方issue:open

https://github.com/ant-design/ant-design/issues/3789

## antd form 校验，使用getFieldDecorator 的校验 又有warning提示
help=xxx?undefined:warningHelp
## antd form 表单出现字段改变 则显示某个按钮

## 何时使用非受控组件？
受控：组件的值是从state或者props处获得，值的设置是通过onchange并更新state的值实现的
一般情况下都用受控组件，在满足以下条件的情况下可以用非受控
1. 无需validation
2. 其他组件依赖该表单组件的值
3. 数据格式化

或者是file表单组件，大部分情况都是用非受控

## antd tree-select 点击父节点只做展开-收缩处理

https://github.com/ant-design/ant-design/issues/11013

```css
.ant-select-tree-switcher {
  position: relative;
}
.ant-select-tree-switcher_open::before, .ant-select-tree-switcher_close::before {
  content: '';
  position: absolute;
  right: -190px;
  top: 0;
  left: 0;
  bottom: 0;
}
```
用css扩大了左边箭头的点击范围，使得点击箭头右边的文字就相当于点在了箭头上

## antd form 收起查询项再展开，查询条件消失

getFieldDecorator里面有个配置选项`preserve`

将其配置为true后，即便字段不再使用，也保留该字段的值，这样隐藏再展示值就还存在

## 页面离开拦截&提示

```jsx
import { Link, Prompt } from 'react-router-dom'
this.state = {
  isPrompt: true
}
render () {
    const { isPrompt } = this.state
    return (
      <div>
        <p>我是页面内容</p>
        <Prompt
          when={isPrompt}
          message={(location) => {
            if (!isPrompt) {
              return true;
            }
            Modal.confirm({
              title: '放弃编辑',
              content: (
                <div className="priNetSeg-remove-modal">
                  <p className="priNetSeg-remove-modal-warn">以下操作将不可逆:</p>
                  <p className="priNetSeg-remove-modal-warn">- 当前编辑内容将被丢失</p>
                  <p className="priNetSeg-remove-modal-prompt">确定放弃本次编辑内容？</p>
                </div>
              ),
              icon: <Icon type="exclamation-circle" theme="filled" />,
              okText: '确认',
              cancelText: '取消',
              onOk: () => {
                this.setState({
                  isPrompt: false,
                }, () => {
                  this.props.history.push(location.pathname)
                })
              },
              maskClosable: true,
            });
            return false;
          }
          }
        />
      </div>
    )
  }
```

## create-react-app 中使用css modules

对于js环境，默认支持无需配置，css文件名改成 `*.module.css` 即可，项目中通过 `import styles from '*.module.css'` 使用即可。

> 于此同时，对于 `*.module.css` 采用 `import '*.module.css'` 这种全局引入的方式是没有效果的

对于ts环境

创建项目的时候不要用 `create-react-app my-app --scripts-version=react-scripts-ts` 

要用 `npx create-react-app antd-virtualized-select --typescript`

这样 `*.module.css` 文件就是支持 css modules 的

## react state 修改对象数组

```js
this.state = {
  list:[{
    al:[{a:1},{a:2}],
    bl:[{b:1},{b:2}]
  }]
}
```
然后要修改list[0].a1中a=1的元素，应该怎么做?

~~首先要明确的是 state 是 immuteable 的~~

子先改，再父改


## create-react-app 中 使用less/sass

使用 sass/scss 的话，cra 默认支持，只是需要再`npm i node-sass -D`一样

less 的话 参考 https://ant.design/docs/react/use-with-create-react-app#Customize-Theme 配置

## 发布一个组件

cra: 不适合

nwb: 不支持ts，配置略坑（可能是我没弄对

