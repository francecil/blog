
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

见官方 faq , https://ant.design/docs/react/faq-cn