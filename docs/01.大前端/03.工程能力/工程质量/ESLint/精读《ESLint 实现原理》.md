本次精读的文章是：[Eslint 的实现原理，其实挺简单 - 掘金](https://juejin.cn/post/7025256331120476197)

# 引言

团队一旦变大，往往有定制团队 lint 规范的诉求：一是知道如何配置规则，二是知道如何编写规则。

目前前端领域最流行的 lint 工具是 eslint ，我们只有了解了它的实现原理，才能更好的制定规范。

  


本次精读的文章，详细介绍了 ESLint 的实现原理。「ESLint 执行步骤」一节会对这篇文章进行总结，然后精读思考部分会重点探讨 ESLint 的解析细节和性能优化策略。

<!-- more -->

# ESLint 执行步骤

  


eslint 校验文件的过程主要分为如下几步：

1.  读取配置
3.  解析配置
4.  预处理
5.  解析文件
6.  执行校验规则
7.  提示错误
8.  修复错误

  


## 1. **读取配置**

收集当前项目下的 eslint 配置。基于**约定大于配置**的原则，按照一定的优先级去寻找配置文件。如果有使用其他配置文件的需求，也可以在命令行工具中手动指定参数。

>   
>

## 2. **解析配置**

> 注：目前 eslint 已推出[新的配置系统](https://eslint.org/docs/latest/use/configure/configuration-files-new)，本文描述的还是传统那一套配置

配置选项整体主要如下部分：

1.  **解析器配置（parser）** ：包含处理器和解析器，目标是将一个文件解析成 AST

    1.  > 解析器用来将目标文件内容转换为 AST
        >
        > 处理器用来将解析器不可处理的文件转换为可解析的内容文本
        >
        > 比如利用处理器获取 md 文件中的 js 代码块，再交由解析器处理验证

1.  **环境配置（** **env** **）** ：包含开箱即用的环境配置项 env（比如 node、jest、browser 等）以及手动指定的 globals 全局变量，目标是为全局变量提供定义，避免提示未定义变量报错

1.  **插件配置（plugins）** ：定义一系列的校验规则，常以 `eslint-plugin-*` 命名，在 ESLint 配置文件中通过 plugins 选项引入。需要注意的是，插件仅定义规则，并不启用规则。规则是由 ESLint 配置的 rules 选项启用的。

1.  **规则使用配置（rules）** ：配置如何使用插件规则，包括是否开启、指定错误级别、配置规则所需参数

1.  **规则共享设置（** **settings** **）** ：所有规则都可以拿到此配置项设置的参数

1.  **可共享配置（extends）** ：每个 ESLint 配置文件都可以复用其他配置，被复用的这些配置被称为可共享配置。可共享配置一共有两种形式：`eslint-config-*` 这类的 `ESLint Config` 以及 ESLint 插件带配置（`Plugins with configs`）

<!---->

## 3. 预处理

在解析文件之前，要先知道**当前文件是否需要校验**，以及该文件**应该选择怎样的解析器和处理器**。

  


一个文件是否需要校验，需要满足两个条件：

-   **未被指定为忽略**：包括 `.eslintignore` 文件、配置文件的 `ignorePatterns` 配置项、package.json 的 `eslintIgnore` 配置项等等
-   **有相应的解析器和处理器可以处理**：通过配置文件的 files 字段，可以指定其他配置项的文件作用范围，包含插件配置、解析相关配置等等。如果一个文件未被包含在 files 字段，则该文件不做处理。

> 需要注意的是，由于存在继承机制，files 不一定需要在最外层配置配置，比如 `@typescript-eslint plugin/recomment` 就默认配置了 files 为 `['*.ts', '*.tsx', '*.mts', '*.cts']`

  


由于解析器只支持某种类型的文件，比如 ts 的解析器就只支持如上👆🏻 ts 相关文件，对于 Markdown 文件，**想要验证其文件中的 ts 代码块，怎么办？** 此时就需要引入处理器

```
// .eslintrc.js
module.exports = {
  extends: "plugin:markdown/recommended"
};
```

`plugin:markdown/recommended` 里面就配置了 files、processor（处理器）、rules 等等内容

  


处理器最终将得到若干份子文件，并供解析器进一步处理

## 4. **解析文件**

使用解析器将目标文件解析成 AST ，比如 ts 文件使用 `@typescript-eslint/parser` 解析器

  


## 5. **执行校验规则**

先对规则进行过滤，仅处理有开启校验的规则列表

  


整个校验是一个**发布订阅**的过程：

1.  每个规则会订阅 AST 节点
1.  校验的时候会遍历 AST 树，遇到 AST 节点就发布对应的事件
1.  规则收到 AST 节点事件后则执行校验逻辑，得到校验结果。如果校验失败，规则还可以返回修复手段逻辑。
1.  AST 遍历完毕后，所有校验也就做完了。

<!---->

## 6. **提示错误&修复错误**

得到一个校验错误列表，此时需要对外提示错误。

在此之前还有一步过滤的过程，即页面中使用注释忽略了 eslint 错误，那么对应的校验错误结果也会过滤掉。

接着将结果对外展示，可能是基于 IDE 展示在编辑框上，可能是基于 cli 工具输出在终端上。

  


也提供修复错误的手段，简单来讲就是一个文本替换操作。

  


# 精读思考

至此，我们已经熟悉了 eslint 的校验流程，接下来还有一些问题需要探讨。

  


## 解析机制

### 不同解析器的 AST 格式是否一致

  


比如社区上某些的 CSS 解析器，其得到的 AST ，能够直接供 ESLint 使用？

  


首先，AST 本身没有标准定义，不同解析器可以定制自己的 AST 节点规则，只要最后知道如何消费节点即可。

回到这个问题，社区的 CSS 解析器，**并不一定能供 ESLint 使用**，除非继承了 ESLint 定义的 AST 节点规则。

具体可以看 ESLint 关于 AST 规范的定义 [AST Specification](https://eslint.org/docs/latest/extend/custom-parsers#ast-specification)

  


另外，搜了下社区并没有 CSS 相关的 `ESLint Parser` ，猜测是 ESLint 提供的 AST 节点能力不够 CSS 使用，不如 Stylelint

  


  


### 单文件能否应用多种解析器

  


比如项目中有 Markdown 文件，我们想要校验 Markdown 的整体格式是否正确，同时还要校验 Markdown 里面 js 片段语法是否正确。

  


先说结论，这个是可行的，需要用到 2 个解析器

1.  校验整体格式：使用 [eslint-plugin-md](https://github.com/leo-buneev/eslint-plugin-md) 插件
1.  校验 JS 片段：使用 [eslint-plugin-markdown](https://github.com/eslint/eslint-plugin-markdown) 插件，里面带了 Markdown 的处理器来得到 js 片段

  


示例配置：

```js
module.exports = {
    extends: ['plugin:markdown/recommended', 'plugin:md/recommended'],
};

// 其中，这些共享配置具体是

// plugin:md/recommended
 {
    plugins: ['md'],
    rules: {
      'md/remark': ['error', { plugins: ['preset-lint-markdown-style-guide', 'frontmatter'] }],
    },
    overrides: [
      {
        files: ['*.md'],
        parser: 'markdown-eslint-parser',
      },
    ],
}

// plugin:markdown/recommended

{
            plugins: ["markdown"],
            overrides: [
                {
                    files: ["*.md"],
                    processor: "markdown/markdown"
                },
                {
                    files: ["**/*.md/**"],
                    parserOptions: {
                        ecmaFeatures: {

                            // Adding a "use strict" directive at the top of
                            // every code block is tedious and distracting, so
                            // opt into strict mode parsing without the
                            // directive.
                            impliedStrict: true
                        }
                    },
                    rules: {

                        // The Markdown parser automatically trims trailing
                        // newlines from code blocks.
                        "eol-last": "off",

                        // In code snippets and examples, these rules are often
                        // counterproductive to clarity and brevity.
                        "no-undef": "off",
                        "no-unused-expressions": "off",
                        "no-unused-vars": "off",
                        "padded-blocks": "off",

                        // Adding a "use strict" directive at the top of every
                        // code block is tedious and distracting. The config
                        // opts into strict mode parsing without the directive.
                        strict: "off",

                        // The processor will not receive a Unicode Byte Order
                        // Mark from the Markdown parser.
                        "unicode-bom": "off"
                    }
                }
            ]
}
```

  


## ESLint 性能优化策略

### 内部执行机制

1.  **按需执行校验规则**：没开启的规则不会执行，即使引入了 1w 个规则，但是仅启用了 1 个规则，也只会执行一次，这个 eslint 考虑到了
1.  **并行执行**：多线程执行校验。目前 eslint 没做
1.  **底层加速**：采用 rust 或 go 这类的语言加速执行。目前 eslint 没做，但计划在做了，见 [Complete rewrite of ESLint · eslint/eslint · Discussion #16557](https://github.com/eslint/eslint/discussions/16557)

### IDE 插件

预期应该有的优化

-   降低频率：防抖
-   并行校验：使用多线程进行校验
-   预校验：在空闲时对其他文件进行校验
-   提升解析速度：文本比对
-   提升校验速度：复用上一次校验结果

  


看了下 eslint vscode extension 的实现，上面的优化基本没做。

连防抖降频也都没做，目前每一次输入文本，都会跑一遍 ESLint 的校验逻辑。

  


从使用体验来看，eslint vscode extension 还有很大的优化空间。

  


### 语法解析失败的健壮性处理策略

预期是识别语法错误代码段，并对其他文本进行校验，譬如 vscode 的 ts 插件就能做到此效果

  


但目前来看 eslint 并没有这方面的能力，还有待优化。

  


### 用户配置优化

用户可以通过合理的配置，来提升 eslint 的校验速度。

  


我这边总结的有以下几点：

1.  避免重复

    1.  尽量避免重复解析校验，比如一个 js 文件，用了 ts 校验，也用了 js 校验
    1.  尽量避免重复作用的规则，比如 eslint 的代码风格化规则，和 prettier 的冲突了，应该只用其中的一种规则

1.  按需校验：配置作用范围，仅目标文件需要校验，如 node_modules 的 js 文件就不需要校验。

1.  ...

  


# 总结与展望

ESLint 是目前前端社区最流行的 lint 工具，但是由于历史包袱，也存在着性能等诸多问题点。

新的 lint 工具如果想挑战它，除了性能这个差异点，可能还需要提供完善的生态。

目前社区已有一些基于 Rust 的 lint 工具，比如 [rslint](https://github.com/rslint/rslint) ，但还不太完善。

于此同时，ESLint 也有计划使用 Rust 进行重构，详见这个[讨论](https://github.com/eslint/eslint/discussions/16557)