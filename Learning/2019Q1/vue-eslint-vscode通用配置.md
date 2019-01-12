## 前言

在vscode的vue项目中，关于代码检查和格式化，遇到各种各样的问题，比如：
1. 不清楚安装的拓展的功能，导致安装了重复功能的拓展
2. 右键格式化文档的时候，不是按eslint的规则来格式化，导致需要我再次手动调整
3. 保存时不能自动修复代码

以下通过自己的实践，进行了相应配置，目前可以实现：
- 仅安装2个推荐的拓展
- 右键格式化文档按照eslint规则，不会产生错误
- 保存时自动修复代码


<!--more-->

## vscode 拓展安装

### eslint 拓展

该拓展本身不带任何插件，当前项目要使用该拓展，需要安装相应的npm包（全局安装或当前项目安装）

对于 vue 项目，通常在 vscode 中做如下设置:

```js
    //保存时自动修复代码
    "eslint.autoFixOnSave": true,
    "eslint.options": {
        // 应检查代码的文件扩展名数组
        "extensions": [
            ".js",
            ".vue"
        ]
    },
    // 配置要验证的语言标识和自动修复选项，比前面两个配置的结合更为细粒度话。可以仅配置下面代码
    "eslint.validate": [
        "javascript",
        "javascriptreact",
        "html",
        {
            "language": "vue",
            "autoFix": true
        }
    ],
```




### vetur 拓展

vue 工具，主要有以下功能

- Syntax-highlighting 语法高亮
- Snippet 快速定义脚手架代码片段，如：写script后会跳出`export default{xxx}`,style 后面会带lang、scope等
- Emmet 仿css选择器快速生成 html/css 代码
- Linting / Error Checking vetur的 Linting 仅用于快速启动，对于规则配置需要用`eslint.validate`
  > Linting 不可配置，且自带了一个固定版本的`eslint-plugin-vue`，一般我们不用。而是采用以下配置：
  1. vscode中设置`"vetur.validation.template": false`
  2. 安装ESlint拓展，错误处理将走eslint
  3. 项目中安装`npm i -D eslint eslint-plugin-vue`插件
  4. 在`.eslintrc.*`设置eslint规则,后面会介绍eslintrc相关配置
- Formatting 即右键的`Format Document`功能，不支持格式化选中内容。
  > 可以在设置中配置`vetur.format.defaultFormatter` \
  > 如：默认`"vetur.format.defaultFormatter.html": "prettyhtml"`,也可将值设为 none 就不会格式化该类文件了 \
  > 这个默认设置非常难用，会将vue文件变得很乱，比如默认加分号，属性按列展开；我们在设置中进行如下配置即可实现格式化vue文件时按eslint的规则来
  ```json
  "vetur.format.defaultFormatterOptions": {
        "js-beautify-html": {
            // 属性列太长才折行,默认的force-expand-multiline不美观
            "wrap_attributes": "auto"
        },
        "prettier": {
          //去掉代码结尾分号
          "semi": false,
          //使用eslint的代码格式进行校验
          "eslintIntegration": true,
          //采用单引号
          "singleQuote": true
        }
    },
    //格式化.vue中html，js
    "vetur.format.defaultFormatter.html": "js-beautify-html",
    "vetur.format.defaultFormatter.js": "vscode-typescript",
    //让函数(名)和后面的括号之间加个空格
    "javascript.format.insertSpaceBeforeFunctionParenthesis": true,
  ```
- IntelliSense 智能感知vue文件结构,比如`<template>`中提供了html标签和属性的感知，当编辑`<template>`时如同编辑html文件一样，让其他插件可以如html支持一样进行支持`<template>`
- Debugging 调试功能
- Framework Support for Element UI and Onsen UI UI框架支持

如果想使用`Format Selection`功能，需要再下载` prettier-Code formatter `拓展。

但只要配置合理，全文格式化未尝不可

## eslintrc 配置

安装完上文两个拓展和进行相应配置后，还需要 对`.eslintrc.js` 进行配置。文件不存在或配置不当，编码时不会进行错误提示

若使用`@vue/cli` 初始化项目并选择支持eslint，则默认生成时就存在了。

否则需要手动生成：

详见<a href="https://eslint.vuejs.org/user-guide/#installation">Installation</a>

###　.eslintrc.js

早期的一个配置

```js
// http://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
  },
  // https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
  extends: 'standard',
  // required to lint *.vue files
  plugins: [
    'html'
  ],
  // add your custom rules here
  'rules': {
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow async-await
    'generator-star-spacing': 0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0
  }
}
```

**当前配置（主流）**：extends配置vue校验规则，parser移至parserOptions下，plugins中配置为vue
```js
// http://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  
  // parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module',
    parser: 'babel-eslint',
  },
  env: {
    browser: true,
  },
  // https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
  extends: [
    // 按从上往下的规则匹配
    //推荐校验
    "plugin:vue/recommended",
    //基本校验
    //"plugin:vue/essential",
    "standard"
  ],
  // required to lint *.vue files
  plugins: [
    'vue'
  ],
  // add your custom rules here
  'rules': {
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow async-await
    'generator-star-spacing': 0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0
  }
}
```

`plugin:vue/recommended` 下 wrap_attributes 的规则是force-expand-multiline

即按上述配置，格式化文档时，属性会变成一列（auto），但保存时的eslint 的autoFix会按 force-expand-multiline 多行展开。

觉得麻烦的，可以配置为`plugin:vue/essential` 

## 配置分享

**settings.json**
```json
// 将设置放入此文件中以覆盖默认设置
{
    "editor.fontSize": 12,
    "editor.tabSize": 2,
    "files.associations": {
        "*.vue": "vue"
    },
    "eslint.autoFixOnSave": true,
    "eslint.options": {
        "extensions": [
            ".js",
            ".vue"
        ]
    },
    "eslint.validate": [
        "javascript",
        "javascriptreact",
        {
            "language": "html",
            "autoFix": true
        },
        {
            "language": "vue",
            "autoFix": true
        }
    ],
    "vetur.validation.template": false,
    "vetur.format.defaultFormatterOptions": {
        "js-beautify-html": {
            // 属性列太长才折行,默认的force-expand-multiline不美观
            "wrap_attributes": "auto"
        },
        "prettier": {
          //去掉代码结尾分号
          "semi": false,
          //使用eslint的代码格式进行校验
          "eslintIntegration": true,
          //采用单引号
          "singleQuote": true
        }
    },
    //格式化.vue中html，js
    "vetur.format.defaultFormatter.html": "js-beautify-html",
    "vetur.format.defaultFormatter.js": "vscode-typescript",
    //让函数(名)和后面的括号之间加个空格
    "javascript.format.insertSpaceBeforeFunctionParenthesis": true,
    "search.exclude": {
        "**/Node_modules": true,
        "**/bower_components": true,
        "**/dist": true
    },
    "git.confirmSync": false,
    "window.zoomLevel": 0,
    "editor.renderWhitespace": "boundary",
    "editor.cursorBlinking": "smooth",
    "editor.minimap.enabled": true,
    "editor.minimap.renderCharacters": false,
    "editor.fontFamily": "'Droid Sans Mono', 'Courier New', monospace, 'Droid Sans Fallback'",
    "window.title": "${dirty}${activeEditorMedium}${separator}${rootName}",
    "editor.codeLens": true,
    "editor.snippetSuggestions": "top",
    "workbench.colorTheme": "Solarized Light",
    "extensions.ignoreRecommendations": false
}
```

##　参考 ： 
1. eslint-plugin-vue： https://eslint.vuejs.org/user-guide/