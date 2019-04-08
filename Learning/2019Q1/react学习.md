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