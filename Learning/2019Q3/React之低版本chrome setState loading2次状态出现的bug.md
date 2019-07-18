## 前言
需求是这样的， RadioGroup 每次切换，要去请求数据并填充 Table

然后 Table 加了 loding 状态，切换时 设置 true,拿到数据时设置 false

```js
this.setState({loading:true})
let data = await getList()
this.setState({
  loading:false,
  data:data
})
```
结果快速切换 RadioGroup 时 多个 RadioButton 都变成 check 样式

控件用的 antd

chrome 59,高版本不会出现

## 原因分析