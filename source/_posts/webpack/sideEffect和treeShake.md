纯粹的 esm 可以很方便的进行  tree-shake ，去除无用代码。

但实际应用时，很难分析一个模块是否完全没有副作用（现在可以自动分析一部分了么？）。因此需要借助 sideEffects 配置来显式声明是否存在副作用

## sideEffect

设置为 false ，表示都没有副作用，可以安全地删除没有用到的 export

如果部分文件存在副作用，可以自行配置文件列表
```json
"sideEffects": ["./src/some-side-effectful-file.js", "*.css"]
```

也可以自行会文件进行标记，声明一个模块或方法没有副作用。
> 这样打包时没有用到的话会自动去除？

```
/*#__PURE__*/
```

https://webpack.docschina.org/guides/tree-shaking/