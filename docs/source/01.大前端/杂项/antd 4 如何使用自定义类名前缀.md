
## 1. 使用 ConfigProvider 组件配置
https://ant.design/components/config-provider-cn/

## 2. less-loader 修改 antd 变量

```js
module.exports = {
  rules: [{
    test: /\.less$/,
    use: [{
      loader: 'style-loader',
    }, {
      loader: 'css-loader', // translates CSS into CommonJS
    }, {
      loader: 'less-loader', // compiles Less to CSS
+     options: {
+       lessOptions: { // 如果使用less-loader@5，请移除 lessOptions 这一级，直接配置选项在 options 下。
+         modifyVars: {
+           'primary-color': '#1DA57A',
+           'link-color': '#1DA57A',
+           'border-radius-base': '2px',
+         },
+         javascriptEnabled: true,
+       },
+     },
    }],
    // ...other rules
  }],
  // ...other config
}
```




## 3. 处理 message 等组件的样式丢失问题

见官方 faq , https://ant.design/docs/react/faq-cn#ConfigProvider-%E8%AE%BE%E7%BD%AE-prefixCls-%E5%90%8E%EF%BC%8Cmessage/notification/Modal.confirm-%E7%94%9F%E6%88%90%E7%9A%84%E8%8A%82%E7%82%B9%E6%A0%B7%E5%BC%8F%E4%B8%A2%E5%A4%B1%E4%BA%86%EF%BC%9F