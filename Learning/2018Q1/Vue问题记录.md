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