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