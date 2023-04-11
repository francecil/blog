---
title: Antd Table 自适应和省略号
date: 2019/04/20 01:00:00
tags: 
  - ant-design
permalink: /pages/6edcdb/
categories: 
  - 大前端
  - 应用框架
  - 组件库
  - Ant Design
---

## 前言

之前写了一篇文章<a href="https://www.hongweipeng.com/index.php/archives/1724/">Antd Table组件 配置规范</a>

其主要利用x滚动条，让数据完全展现。

但是有的需求是数据一屏展示不滚动，当屏幕足够小时，单元格内容用省略号代替，然后用Tooltip展示内容


<!--more-->


参考：

https://github.com/ant-design/ant-design/issues/5753#issuecomment-451896473

https://github.com/ant-design/ant-design/issues/5753#issuecomment-457319869

## 实现方案

先创建一个工具组件 EllipsisTooltip
```js
import React from 'react'
import { Tooltip } from 'antd';

class EllipsisTooltip extends React.Component {
  state = {
    visible: false
  }
  handleVisibleChange = (visible) => {
    if (this.container.clientWidth < this.container.scrollWidth) {
      this.setState({
        visible: visible
      })
    }
  }
  render () {
    const style = {
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      ...this.props.style
    }
    return (
      <Tooltip visible={this.state.visible} onVisibleChange={this.handleVisibleChange} title={this.props.title}>
        <div ref={node => this.container = node} style={style}>{this.props.children}</div>
      </Tooltip>
    )
  }
}
export default EllipsisTooltip
```
当内容不能完全展示时，用省略号代替，鼠标移过去利用tooltip显示完整内容

然后在columns这样使用

```js
title: 'xxx',
dataIndex: 'name',
// 当表格不能完全展示时，该列大小至少是100px
onCell: () => ({
  style: {
    whiteSpace: 'nowrap',
    maxWidth: 100,
  }
}),
render: (text)=> (<EllipsisTooltip title={text}>{text}</EllipsisTooltip>)
```
可以看到数据能够自适应并且当页面足够小时显示省略号，但是表头却是折行的实现，能否也实现省略号呢？

**表头实现省略号**

未完待续。。