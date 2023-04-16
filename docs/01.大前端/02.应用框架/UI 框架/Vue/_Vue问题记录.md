---
title: Vue问题记录
date: 2018-04-18 15:52:24
permalink: /pages/092b57/
categories: 
  - 大前端
  - 应用框架
  - UI 框架
  - Vue
tags: 
  - 
titleTag: 草稿
---
# 1. element ui 创建多行表单

将 form 设置成 inline ，每一行用 el-form-item 包装

例如 要固定2行的表单，可以这样

```html
      <el-form :inline="true">
        <el-form-item>
          <el-form-item label="11" >
            <el-input></el-input>
          </el-form-item>
          <el-form-item label="12" >
            <el-input ></el-input>
          </el-form-item>
        </el-form-item>
        <el-form-item>
          <el-form-item label="21" >
            <el-input ></el-input>
          </el-form-item>
          <el-form-item label="22" >
            <el-input ></el-input>
          </el-form-item>
        </el-form-item>
      </el-form>
```

# 2.Vue Router 中定义的hidden是用来干嘛的？

可以确定的是，hidden是用户自定义的属性，就和自己再定义label一样，

一般自定义了hidden，是用于呈现菜单时，将hidden=false的router呈现出现，呈现的名字可以写在name,或者自己定义label

但是，当用户用到`this.$route` 时，`$route.matched`的对象中，属性没有hidden,label之类 只有name

# 3. Element UI 中table控件的 `el-table-column` prop列，控制其是否显示

```js
<el-table-column prop="download_state" label="下载情况" v-if="form.state!=='待审核'" >
   <template slot-scope="scope">xxx</template>
</el-table-column>
```

form的初始值是{},其值是通过http请求得到的。

所以`form.state!=='待审核'`的值一开始会是true,当得到的form.state值为`待审核`时，其值为false

对于该控件来说，增加列不会出现问题，减少列会导致布局错乱。

所以正确的方式应该是`v-if="form.state&&form.state!=='待审核'"`

而对于`type="selection"`的 `el-table-column` 列，减少列不会出现问题而增加会有问题。

源码需继续跟进，待续...

# 3. 编辑详情时，一般会用一个temp 作为临时对象，防止取消保存时污染源数据

Vue 不允许在已经创建的实例上动态添加新的根级响应式属性 (root-level reactive property)。然而它可以使用 Vue.set(object, key, value) 方法将响应属性添加到嵌套的对象上：
```js
Vue.set(vm.someObject, 'b', 2)
```
您还可以使用 vm.$set 实例方法，这也是全局 Vue.set 方法的别名：
```js
this.$set(this.someObject,'b',2)
```
有时你想向一个已有对象添加多个属性，例如使用` Object.assign() 或 _.extend()` 方法来添加属性。但是，这样添加到对象上的新属性不会触发更新。在这种情况下可以创建一个新的对象，让它包含原对象的属性和新的属性：
```js
// 代替 `Object.assign(this.someObject, { a: 1, b: 2 })`
this.someObject = Object.assign({}, this.someObject, { a: 1, b: 2 })
```

# 4. axios 请求重发时 请求url不正确的问题

首先，`const service = axios.create(xxx)` 创建实例的时候， baseURL 用的是相对路径，比如`/api`

然后准备进行某个请求`如：GET /user` 时，发现 token 过期需要用refresh token去获取新的token；

此时利用`axios.Cancel`取消该请求的发送，并在token重新获取后再次发送该请求`service(request.config)`，此时config里面的请求url是带上`/api`的。

然后再次请求时，经 baseURL 又加上了`/api` ,此时请求是这样的 `GET /api/api/user` 导致响应失败


# 5. element 弹窗+表单（新增/修改）的代码

首先，data中定义：
```js
tempDialog: {
  //弹窗标题
  title: '',
  //新增/修改
  isEdit: false,
  //是否显示弹框
  show: false,
  //表单实体内容；以往做法是把所有字段定义出来，实在麻烦，此处仅定义一个空对象
  entity: {}
},
```

在template中这样定义的弹框
```html
<el-dialog :title="tempDialog.title" :visible.sync="tempDialog.show" width="35%">
      <el-form :model="tempDialog.entity" :rules="rules" ref="tempDialog" label-width="134px" label-position="left">
        <el-form-item class="edit-form require-label" :label="table.relation_type" prop="type">
          <el-input v-model="tempDialog.entity.type" :disabled="tempDialog.isEdit"></el-input>
        </el-form-item>
        <el-form-item class="edit-form require-label" :label="table.relation_entity" prop="lastName">
          <el-row>
            <el-col :span="8">
              <el-input v-model="tempDialog.entity.firstName" :disabled="tempDialog.isEdit"></el-input>
            </el-col>
            <el-col :span="8">
              <el-input v-model="tempDialog.entity.lastName" :disabled="tempDialog.isEdit"></el-input>
            </el-col>
          </el-row>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="tempSubmit">
          {{ $t('save') }}
        </el-button>
        <el-button @click="tempDialog.show=false">
          {{ $t('cancel') }}
        </el-button>
      </span>
    </el-dialog>
```

可以看到，entity中主要有3个元素：`type,firstName,lastName`

但是由于需求，prop中只有`type、lastName`

当采用`this.$refs['tempDialog'].resetFields()` 时，仅会清空以上两个字段，`firstName`不会重置

因此，在新增的初始化时，我们可以选择以下一种方式解决

**推荐：**
```js
//先清空原表单关联字段和校验规则
if (this.$refs['tempDialog']) {
  this.$refs['tempDialog'].resetFields()
}
let temp = this.tempDialog
//重新绑定一个新对象，并且含有所有属性，避免后面表单校验会出现各种bug
temp.entity = {
  type: '',
  firstName:'',
  lastName:''
}
```

或者

```js
//先清空原表单关联字段和校验规则，
if (this.$refs['tempDialog']) {
  this.$refs['tempDialog'].resetFields()
}
let temp = this.tempDialog
//重新绑定一个新对象，仅含不存在prop的属性，这样当往该字段写入值时，entity会自动增加元素
// 需要注意的是，如果校验firstName的时候需要用到其他prop字段，将会出错，需要把用到的字段也定义在下面
temp.entity = {
  firstName:''
}
```

修改的话，一般就这样
```js
handleEdit (row) {
        if (this.$refs['tempDialog']) {
          this.$refs['tempDialog'].resetFields()
        }
        this.tempDialog.title = 'table.update_property'
        this.tempDialog.isEdit = true
        this.tempDialog.entity = Object.assign({},row)
        this.tempDialog.show = true
      },
```

#6 i18n 在工具类的使用

在vue里面可以用 `this.$t('key')`

在工具类里不能这样用，因为此时的this不是vue

可以采用
```js
//i18n 是一个 VueI18n 实例
import i18n from '@/lang'
// t是VueI18n的原型方法
i18n.t('key')
```
的方式

# 7 组件的props中对于B数据的校验需要用到A数据，有什么方法吗？

<a href="https://github.com/vuejs/vue/issues/3495">Is there any possible to read other props in a specific validator function</a>

1. 验证，就算不通过，后面vue还是照样继续处理，只是给个报错而已,直接在create中给报错好了


# 8 element-ui 的tab控件，切换tab时显示不同的表格，在火狐和ie下el-table控件会有布局闪烁的bug

分析：未配置的tab控件，采用v-show的做法去控制各个tab的显示，即给内容应用了`display：none`

在ie和火狐下，el-table控件会闪烁下然后正常

el-tab-pane 有个lazy属性延迟渲染，估计是初次渲染用的v-if，后面用的v-show,这样做初始不会闪烁 但后面还是会闪烁。

目前的做法是给每个有el-table的el-tab-pane下面内容加一个`v-if="activeName==='tabPaneName'"`的判断，每次都重新渲染。

但由于每次都重新渲染，每次都会进行表格数据的请求，

https://github.com/ElemeFE/element/issues/13242

https://github.com/ElemeFE/element/issues/14263

最后的解决方案：

利用el-tab-pane的lazy属性，和table的$ready属性解决。。

# 9 v-on 对象语法 传参

## event参数

由于对象语法中，事件名对应的是方法而不是执行函数，那么在对应的处理方法中，唯一的参数就是event。

```js
<div v-on="listenersComputed"></div>

computed:{
  listenersComputed(){
    return {
      click:this.handleClick
    }
  }
}

handleClick (e) {
  console.log(e)
}
```

不写参数的话直接获取event的话，在非firefox的浏览器，也可以拿到event，因为window.event的原因
```js
handleClick () {
  console.log(event)
}
```
但是firefox没有window.event,这里event会是 undefined

## 其他参数

对于非对象语法，可以这么传

```js
<div v-on：click="handleClick(name,$event)"></div>


handleClick (name,event) {
  console.log(name,event)
}
```

那对于对象语法，怎么传参呢
```js
<div v-on="listenersComputed"></div>

computed:{
  listenersComputed(){
    return {
      click:(event) => this.handleClick('gahing',event)
    }
  }
}

handleClick (name,event) {
  console.log(name,event)
}
```

# vue动态引入组件 refs 找不到的问题

## 问题描述：

> 父组件为A.vue,子组件为child.vue通过动态引入得到

```html
<template>
  <div>
    <child ref="child"></child>
  </div>
</template>
<script>
export default {
  mounted () {
    console.log(this.$refs['child'])
  },
  components: {
    child': () => import('@/components/child')
  }
}
</script>

```
在 mounted 生命周期时想获取到 child 组件的引入，输出得到 `undefined`

## 原因分析

动态引入原理：

1. Vue 仅在该组件被使用时才引入（一般配合 component 的 `is` 或者 `v-if` 等使用）。这里会被使用到，所以延时200ms(默认值)加载
2. 父组件的 mounted 不会等待异步组件的 mounted 完成。

## 解决方案

1. 动态引入改为静态引入

```js
import child from '@/components/child'
export default {
  mounted () {
    console.log(this.$refs['child'])
  },
  components: {
    child': child
  }
}
```

2. 设置延时
```js
mounted () {
  // 500ms大概是加载完成了
  setTimeout(()=>console.log(this.$refs['child']),500)
},
```

由于网络不稳定，一般采用动态引入的方法