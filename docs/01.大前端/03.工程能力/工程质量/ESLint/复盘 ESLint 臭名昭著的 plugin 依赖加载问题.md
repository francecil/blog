---
title: 复盘 ESLint 臭名昭著的 plugin 依赖加载问题
date: 2023-05-16 23:29:11
permalink: /pages/5af3b6/
categories: 
  - 大前端
  - 工程能力
  - 工程质量
  - ESLint
tags: 
  - 
---


# 1. 前言

ESLint 是前端最流行的代码校验工具，它提供了许多插件 (plugins) 和共享配置 (extends) 来扩展其功能。然而，在安装某些共享配置时，用户常常还需要安装一些插件依赖项。

以 `eslint-config-airbnb`（最流行的可共享配置之一）为例，除了安装 `eslint-config-airbnb` 外，还需要安装众多对等依赖（peerDependencies），比如 `eslint-plugin-import`、`eslint-plugin-jsx-a11y` 、`eslint-plugin-react`、`eslint-plugin-react-hooks` 等等。

你是否会疑惑，为什么要额外装这些依赖，为何 `eslint-config-airbnb` 不把这些依赖作为直接依赖（dependencies）？

也有同学疑惑，安装 `@antfu/eslint-config` 时并不需要额外安装 plugin 依赖，这又是为什么？


再或者，如果你曾经发布过 ESLint 插件或可共享配置，那么你很可能面临过 ESLint 如何解析插件和可共享配置的难题。

本文将来探讨这些问题，讲明白 ESLint 共享配置的设计初衷，并给出 ESLint 可共享配置的最佳实践。


对于大多数人来说，并不需要知道这些知识点。但是当你构建自己的 ESLint 插件或可共享配置时，它会变得非常有用。

<!-- more -->

> **摘要 / TL;DR** ：如果觉得文章太长，也可以直接看结论：
> -   在安装 ESLint Config 时，若包含 ESLint Plugin ，通常还需要安装这些 Plugin 依赖。
> -   这与 ESLint 的插件加载机制有关，**ESLint 始终基于用户的配置文件进行解析**，而不是 node 模块逐层加载方式。
> -   ESLint 设计的初衷是**每次运行只会加载同一个插件示例**，而当时 peerDependencies 正好能满足这个要求。但 peerDependencies 在 npm v3 之后不再自动安装，导致 ESLint Config 使用变得繁琐。
> -   使用 dependencies 代替 peerDependencies ，**绝大部分情况可用**，但在`yarn pnp` 场景在会找不到依赖，以及 monorepo 场景可能无法找到正确的版本。故 `@antfu/eslint-config` 这类的可共享配置在某些情况下会有问题。
> -   若调整 Plugin 加载机制为「相对被引用位置」加载，**可以解决**无法正确查找 dependencies 的问题，但**当涉及多版本 Plugin 时将引入破坏性变更**。解决破坏性变更需要解决「加载同一个 Plugin 不同版本」的难题，但 ESLint **并未找到一个完美的解决方案**，**最终选择了构建新的配置系统**。
> -   一部分人认为，多版本 Plugin 始终只是一个边缘 case，不必因为这个不常见的边缘 case，导致最常见的用例变得不那么方便。于是社区有了 **ESLint Patch 这一解决方案**，该方案调整了 ESLint Plugin 的加载逻辑。
> -   2022 年，我们也等到了官方的解决方案 - 新的配置系统。但由于**周边生态、稳定性和 ESLint 版本覆盖率**的问题，目前短期内不建议使用。
> 
> 在文章的最后，我们对可共享配置的维护者和使用者给出了**最佳实践**，并**复盘**了 ESLint 的这套设计问题。

# 2. 名词解释

本文假设你对 ESLint 配置有基础的了解，这里再简单说明下几个概念：

-   **ESLint 插件**: 定义一系列的校验规则，常以 `eslint-plugin-*` 命名，在 ESLint 配置文件中通过 plugins 选项引入。需要注意的是，插件仅定义规则，并不启用规则。规则是由 ESLint 配置的 rules 选项启用的。

-   **可共享配置（** Shareable Configs **）** ：每个 ESLint 配置文件都可以复用其他配置，被复用的这些配置被称为可共享配置。可共享配置一共有两种形式：

    -   **ESLint Config**：纯粹的配置，包含各个 ESLint 配置选项，常用 `eslint-config-*` 命名发布
    -   > 注：若无特殊说明，本文的 ESLint Config 均指的 `eslint-config-*` 这种形式，可共享配置则不区分是哪种形式
    -   **ESLint 插件带配置（** Plugins with configs **）** ：在原先的 **ESLint 插件**上导出 configs 对象，configs 等价于 ESLint Config。拓展此类插件的可共享配置时需要在前面增加 `plugin:` 前缀，比如 `plugin:prettier/recommended`


# 3. 可共享配置两种形式的区别

或许你会好奇，为什么会存在两种形式，两种形式又有什么差别？


> **先说结论：**
> 
> 1.  **从效果上来说**，两种形式的拓展效果并无差别，都是提供 ESLint 配置的各个选项
> 1.  **最早支持的是** ESLint Config 形式，ESLint 插件带配置是后加的，用于解决插件不带默认配置需额外维护一个ESLint 配置的问题
> 1.  由于**约定俗成的使用习惯**，ESLint 插件带配置**不能完全取代** ESLint Config。对于配置维护者，如果只是想给插件提供默认配置，建议采用 **ESLint 插件带配置**的形式；如果是要提供聚合的插件和默认配置选项，比如 `eslint-config-airbnb` 这种，建议采用 **ESLint Config** 的形式

## 3.1 ESLint 插件带配置的来源

在 ESLint 插件不提供配置之前，想引入一个 `eslint-plugin-*` ，还需要额外提供 `eslint-config-*` 去提供配置（对配置维护者不友好）；此外，由于 ESLint 的设计，`eslint-config-*` 需要将 `eslint-plugin-*` 作为 peerDependencies ，由用户安装（对配置使用者不友好）。

基于这种种原因，ESLint 作者发现，**只要让 ESLint 插件增加上配置功能（configs）** ，那么将解决上面的两个问题：配置维护者只需提供带配置的 ESLint 的插件，而用户也只需安装 ESLint 插件这一依赖

> 详见 https://github.com/eslint/eslint/issues/3458#issuecomment-257161846

### **之前：ESLint 配置**

配置维护者：
```js
// ./node_modules/eslint-config-react/index.js
module.exports = {
  plugins: ['react'],
  rules: {'react/rule1': 'error'}
};

// ./node_modules/eslint-config-react/package.json
{
    "peerDependencies": {
        "eslint-plugin-react": "*"
    }
}

// ./node_modules/eslint-plugin-react/index.js
module.exports = {
  rules: {
    rule1: require('./rule1')
  }
};
```
配置使用者：
```js
// 用户配置 ./.eslintrc.js
module.exports = {
  extends: ['react'],
  rules: {
    'react/rule1': 'warn'
  }
};
```
```sh
# 安装依赖
npm i eslint-config-react eslint-config-plugin
```
### **之后：带配置的 ESLint 插件**

配置维护者：
```js
// ./node_modules/eslint-plugin-react/index.js
module.exports = {
  configs: {
    recommended: {
      plugins: ['react'],
      rules: {'react/rule1': 'error'}
    }
  }
  rules: {
    rule1: require('./rule1')
  }
};
```

配置使用者：
```js
// 用户配置 ./.eslintrc.js
module.exports = {
  extends: ['plugin:react/recommended'],
  rules: {
    'react/rule1': 'warn'
  }
};
```

```sh
# 安装依赖
npm i eslint-config-plugin
```

## 3.2 ESLint 插件带配置不能完全取代 ESLint Config

ESLint 插件带配置能力更强，那么是否可以完全取代 ESLint Config ？实际上是可以的，但是社区上为何还保留着大量的 ESLint Config ？

  


除去历史遗留问题，还有一个**用户理解和习惯问题** -- 用户习惯于安装 plugin 用于增强某个领域的规则检测，安装 config 用于增加配置。倘若 ESLint 插件，不提供任何校验规则，仅仅只是提供各种聚合配置，会让用户带来困扰。

  


因此，我们对于配置维护者给出的建议如下：

1.  如果只是想给插件提供默认配置，建议采用 **ESLint 插件带配置**的形式；
1.  如果是要提供聚合的插件和默认配置选项，建议采用 **ESLint Config** 的形式

  

还有另外一种场景，团队需要基于社区的各种插件和配置制定自己的共享配置，同时还会自定义少量插件规则的诉求。

部分团队的实践是采用 **ESLint 插件带配置** 的方案，规则和配置都集中在一个 `eslint-plugin-*` 包中。

但更推荐的是分成 `eslint-config` 和 `eslint-plugin` 两个模块，增强可维护性，两个模块各司其职，同时 `eslint-plugin` 也可以提供默认的规则配置。

> 下文的「最佳实践」章节会再次提到


# 4. ESLint Plugin 加载机制

前面反复在提到一个问题：安装 ESLint Config 时同时需要安装其依赖的 ESLint Plugin。为何不把这些 Plugin 作为直接依赖（dependencies）？

  


> **先说结论，这与 ESLint Plugin 的加载机制有关。**
> 
> 1.  ESLint Config 的加载机制则同 node 模块一致，从引用处开始向上逐层查询 node_modules 。
> 1.  对于 ESLint Plugin，**ESLint 始终基于用户的配置文件进行解析。** ESLint 希望开发者手动安装 eslint-config 的 plugin 依赖，这也就是为什么 `eslint-config-airbnb` 包含了 peerDependency
> 1.  由于**早期 peerDependencies 可以自动安装**，ESLint 并不担心 ESLint Config 的 Plugin 依赖安装问题。同时采用 peerDependencies 后，可以保证每次运行只会加载同一个插件示例。但**由于后续 peerDependencies 不再自动安装**，导致 ESLint 插件作为 peerDependencies 的方案不再好用。
> 1.  将可共享配置的 ESLint Plugin 依赖方式由 peerDependencies 改成 dependencies，**在大部分情况下可行**。但当可共享配置足够流行，就需要考虑所有场景，包括 `yarn pnp`。同时 monorepo 场景可能无法找到正确的版本。
> 1.  若调整 Plugin 加载机制为「相对被引用位置」加载，**可以解决**无法正确查找 dependencies 的问题，但**当涉及多版本 Plugin 时将引入破坏性变更**。解决破坏性变更需要解决「加载同一个 Plugin 不同版本」的难题，但 ESLint **并未找到一个完美的解决方案**，最终选择了构建新的配置系统。

## 4.1 特殊的 ESLint Plugin 加载机制

```
// 用户配置 ./.eslintrc.js
module.exports = {
  extends: ['eslint-config-airbnb'],
};

// ./node_modules/eslint-config-airbnb/index.js
module.exports = {
  extends: ['eslint-config-prettier'],
  plugins: ['eslint-plugin-react'],
};
```

  


观察上面这个示例，用户配置 extends 了 `eslint-config-airbnb` ，而 `eslint-config-airbnb` extends 了 `eslint-config-prettier` ，并依赖了 `eslint-plugin-react`

  


根据官方文档的描述，我们知道：

-   **对于共享配置，ESLint 会从它们出现的配置文件位置进行解析**。

> 示例：对于 eslint-config-prettier ，eslint 会搜索 `your-project/node_modules/eslint-config-airbnb/node_modules/eslint-config-prettier`
>
> 参考：*[https ://eslint.org/docs/user-guide/configuring/configuration-files#extending-configuration-files](https://eslint.org/docs/user-guide/configuring/configuration-files#extending-configuration-files)*

-   **对于 Plugin，ESLint 始终基于用户的配置文件进行解析**。

> 示例：对于 eslint-plugin-react ，eslint 会搜索 `your-project/node_modules/eslint-plugin-react`
>
> 参考：*[https ://](https://eslint.org/docs/user-guide/configuring/plugins#configuring-plugins)* *[eslint.org/docs/user-guide/configuring/plugins#configuring-plugins](http://eslint.org/docs/user-guide/configuring/plugins#configuring-plugins)*

  


因此，若 extends 的可共享配置依赖了 plugin，需要将配置包中的插件依赖指定为 peerDependency（**插件将相对于最终用户的项目加载，因此最终用户需要安装他们需要的插件**），确保百分百能在顶层 node_modules 中找到

若可共享配置依赖于第三方解析器或其他可共享配置，可以直接将这些包指定为 *dependencies*

> 参考：*[https ://eslint.org/docs/developer-guide/shareable-configs#publishing-a-shareable-config](https://eslint.org/docs/developer-guide/shareable-configs#publishing-a-shareable-config)*

  


至于 ESLint 是如何实现**始终基于用户的配置文件进行解析**，可以看 `@eslint/eslintrc` 的 _loadPlugin 逻辑

下面贴出重点代码，详见注释部分

```js
// https://github.com/eslint/eslintrc/blob/main/lib/config-array-factory.js#L1023

/**
 * The factory of `ConfigArray` objects.
 */
class ConfigArrayFactory {
    /**
     * Load a given plugin.
     * @param {string} name The plugin name to load.
     * @param {ConfigArrayFactoryLoadingContext} ctx The loading context.
     * @returns {DependentPlugin} The loaded plugin.
     * @private
     */
    _loadPlugin(name, ctx) {
        // ctx.filePath 指的是插件引用的配置文件所在位置
        debug("Loading plugin %j from %s", name, ctx.filePath);

        const { additionalPluginPool, resolver } = internalSlotsMap.get(this);
        const request = naming.normalizePackageName(name, "eslint-plugin");
        const id = naming.getShorthandName(request, "eslint-plugin");
        
        // 这里得到的是用户配置的目录
        const relativeTo = path.join(ctx.pluginBasePath, "__placeholder__.js");

        ...

        // 读取缓存池
        const plugin =
            additionalPluginPool.get(request) ||
            additionalPluginPool.get(id);

        if (plugin) {
            return new ConfigDependency({
                definition: normalizePlugin(plugin),
                filePath: "", // It's unknown where the plugin came from.
                id,
                importerName: ctx.name,
                importerPath: ctx.filePath
            });
        }

        let filePath;
        let error;

        try {
            // 注意这里，不是用的 ctx.filePath 而是用 relativeTo ，导致始终基于用户的配置文件进行解析
            filePath = resolver.resolve(request, relativeTo);
        } catch (resolveError) {
            error = resolveError;
            /* istanbul ignore else */
            if (error && error.code === "MODULE_NOT_FOUND") {
                error.messageTemplate = "plugin-missing";
                error.messageData = {
                    pluginName: request,
                    resolvePluginsRelativeTo: ctx.pluginBasePath,
                    importerName: ctx.name
                };
            }
        }

        if (filePath) {
            try {
                writeDebugLogForLoading(request, relativeTo, filePath);

                const startTime = Date.now();
                // 引入 插件模块
                const pluginDefinition = require(filePath);

                debug(`Plugin ${filePath} loaded in: ${Date.now() - startTime}ms`);

                return new ConfigDependency({
                    definition: normalizePlugin(pluginDefinition),
                    filePath,
                    id,
                    importerName: ctx.name,
                    importerPath: ctx.filePath
                });
            } catch (loadError) {
                error = loadError;
            }
        }

        debug("Failed to load plugin '%s' declared in '%s'.", name, ctx.name);
        error.message = `Failed to load plugin '${name}' declared in '${ctx.name}': ${error.message}`;
        return new ConfigDependency({
            error,
            id,
            importerName: ctx.name,
            importerPath: ctx.filePath
        });
    }
}
```

  


> 总结：对于 ESLint Plugin，ESLint 始终基于用户的配置文件进行解析 。ESLint 希望开发者手动安装 `eslint-config` 的 `plugin` 依赖，这也就是为什么 `eslint-config-airbnb` 包含了 peerDependency

## 4.2 为什么是 peerDependencies

为什么可共享配置需要将 ESLint 插件作为 peerDependencies ，这与插件的设计初衷有关

> 参考： <https://github.com/eslint/eslint/issues/3458#issuecomment-252068708>


ESLint 先是支持的插件，后来才创建的可共享配置。当时（2015 年之前），ESLint 鼓励人们通过 peerDependencies 关系来定义可共享配置和插件之间的关系。这很有效，因为 **npm** **（v3 版本之前）会自动安装 peerDependencies**，并且当 peerDependencies 的版本与用户指定的版本不同时，以用户版本为准。在当时，如果开发人员提供了一个可共享配置，用户仅需安装一个可共享配置即可。

  


此外，ESLint 的早期设定之一是，**每次运行只能加载同一个插件实例**。这很重要，决定着我们如何查找插件规则。以下面这个配置为例，我们需要确保 `myplugin/rule` 引用的是确定的 plugin ，而不是一种可能性：可能是用户配置的 myplugin 或者 myconfig 中引用的 myplugin 。如果 myconfig 遵守 peerDependencies 规范，那么 ESLint 将始终在最外层找到唯一的 myplugin 插件。

```yaml
extends:
  - myconfig
plugins:
  - myplugin
rules:
  myplugin/rule: "error"
```

  


因此，基于「**peerDependencies 自动安装**」和「**每次运行只能加载同一个插件实例**」这两点，ESLint 在当时选择了 **peerDependencies 方案**。

  


然而，npm v3 决定停止默认安装 peerDependencies，而是**依赖用户手动安装这些依赖项**。随着这个变化，将 ESLint 插件作为 peerDependencies 的方案将不再是最佳的。

> PS: npm v7 已改回默认安装的逻辑，但已对 ESLint 整个生态造成巨大影响

  


> 总结：由于早期 peerDependencies 可以自动安装，ESLint 并不担心 ESLint Config 的 Plugin 依赖安装问题。同时采用 peerDependencies 后，可以保证每次运行只会加载同一个插件示例。但由于后续 peerDependencies 不再自动安装，导致 ESLint 插件作为 peerDependencies 的方案不再好用。

## 4.3 dependencies 依赖与包管理方案

在 ESLint 能在最外层 node_module 找到 plugin 模块的前提下，我们**希望用户不必手动依赖这些依赖项**。

  


如果将可共享配置的 ESLint Plugin 依赖方式由 peerDependencies 改成 dependencies ，你可能会发现，ESLint 大多数情况下可以正常运行！

  


这个由于目前大部分的包管理方案，会将 eslint 模块提升（hoist）到顶部 node_modules 中。

-   npm v3 and later — flat node_modules ✅
-   yarn v1— flat node_modules ✅
-   yarn v2 — Plug’n’Play ❌
-   pnpm — [hoists ESLint plugins/configs](https://pnpm.io/npmrc#public-hoist-pattern) （默认行为，pnpm 针对 eslint 特意开的口子） ✅

  


对于团队内小范围使用的可共享配置可以采用 dependencies，但对于具有较大用户体量的开源可共享配置，**需要考虑所有场景。**

  


同时，当遇到 monorepo 场景，可能会存在多个版本的 plugin ，由于 npm 的扁平化，ESLint 使用哪个版本的 plugin 将变得随机。

  


> 总结：将可共享配置的 ESLint Plugin 依赖方式由 peerDependencies 改成 dependencies，**在大部分情况下可行**。但当可共享配置足够流行，就需要考虑所有场景，包括 `yarn pnp` 。同时 monorepo 场景可能无法找到正确的版本。

## 4.4 基于被引用位置加载 Plugin

能否调整 plugin 的加载机制，改为「按所定义的配置文件出现位置目录」进行解析？这可以解决**某些包管理方案无法正确查询 dependencies 依赖的问题。**

> 参考：https://github.com/eslint/rfcs/pull/5

  


答案是：**当不存在多版本 Plugin 的情况下可以，如果存在多个版本的 Plugin ，可能会导致破坏性变更。**

```yaml
- node_modules
  - myconfig
    - node_modules
      - myplugin@v2
  - myplugin@v1
```

  


以下面这个例子为例：

```js
// 用户配置 ./.eslintrc.js
module.exports = {
  extends: ['myconfig'],
  // myplugin@v2
  plugins: ['myplugin']
  rules: {
    'myplugin/rule0': 'warn',
    // myplugin@v2 才有的规则
    'myplugin/rule2': 'warn'
  }
};

// ./node_modules/eslint-config-myconfig/index.js
module.exports = {
  {
      // myplugin@v1 ，采用 dependencies 依赖
      plugins: ['myplugin'],
      rules: {
        'myplugin/rule0': 'error'
        'myplugin/rule1': 'error'
      }
  }
};
```

> 用户配置中引用了一个 `myplugin@v2` 才有的规则。

  


对于原先的加载方案，始终选择 **`myplugin@v2`** 去执行规则，这没有问题。

但当采用「按所定义的配置文件出现位置目录」寻找依赖的方式，执行 `myplugin/rule1` 我们将选择 `myplugin@v1` ，那么执行 `myplugin/rule2` 我们还是选择 `myplugin@v1`么？

若保持「同一 Plugin 仅加载一次」的特性，继续选择 `myplugin@v1` ，将由于缺少 rule2 规则导致报错；若选择 `myplugin@v2`，那么我们将需要想办法解决**加载同一个 Plugin 的不同版本**。

  


然而，这是一件非常困难的事情：

1.  首先，我们**很难快速的找到某一个 Plugin 的具体版本依赖**，由于 npm node_modules 扁平化，我们无法真正知道要查找的包的正确位置，这需要大量地搜索包才能确认（逐层往上查询 node_modules）。
1.  其次，我们还需要想出一些方法来确保最终用户在任何给定时间都**知道他们正在配置哪个版本的插件**，这可能意味着我们需要一个不同的命名方案来配置通过共享配置包含的插件与由用户安装的插件。比如 [Support having plugins as dependencies in shareable config · Issue #3458 · eslint/eslint](https://github.com/eslint/eslint/issues/3458#issuecomment-253968468)
1.  最后，该解决方案将引入新的复杂性，现有生态已足够庞大，任何破坏性变更都将造成巨大影响，除非找到一个完美的无破坏性变更的方案。

  


显然，ESLint 最终并未找到一个良好的解决方案，而是打算重新构建一套新的配置系统（[Config File Simplification by nzakas · Pull Request #9 · eslint/rfcs](https://github.com/eslint/rfcs/pull/9)）。

> 总结：若调整 Plugin 加载机制为「相对被引用位置」加载，可以解决无法正确查找 dependencies 的问题，但当涉及多版本 Plugin 时将引入破坏性变更。解决破坏性变更需要解决「加载同一个 Plugin 不同版本」的难题，但 ESLint 并未找到一个完美的解决方案，最终选择构建新的配置系统。
> 
# 5. 多版本 Plugin 只是边缘 CASE

前面提到，「支持将插件作为可共享配置中的依赖项」这个问题一直停滞不前，主要是没有找到一个完美的方案解决「加载多版本 Plugin」的问题。

  


有一部分人认为，**多版本 Plugin 始终只是一个边缘 case**，不必因为这个不常见的边缘 case ，导致最常见的用例变得不那么方便。可以选择让用户仅在特殊情况下（即安装两个版本时）特殊处理依赖，这比让用户在每次安装可共享配置时都考虑依赖要好得多。

> 参考：https://github.com/eslint/eslint/issues/3458#issuecomment-268713080



本节将介绍 ESLint Patch 这一解决方案，该方案调整了 ESLint Plugin 的加载逻辑，但不考虑多版本这种边缘情况，用于解决大多数情况下的 ESLint 配置开发和使用问题。

## 5.1 Monorepo 的问题

在此之前，一个仓库用户安装 ESLint Config 顺便安装几个 ESLint Plugin 还能接受。

但 Monorepo 架构变得逐渐流行，假设有 20 个包，每个包各自维护 ESLint 配置，并且需要安装 5 个 ESLint Plugin，那么总共需要安装 20 * 5 个 Plugin 的包，这对用户来说是无法接受的。


## 5.2 ESLint Patch 方案

基于 monorepo 这个问题，Pete Gonzalez（rush.js 的核心开发者之一 ，目前在 Tik Tok ）提供了一套 ESLint Patch 的解决方案 - [@rushstack/eslint-patch](https://www.npmjs.com/package/@rushstack/eslint-patch)。


核心代码如下，将 Plugin 的解析逻辑改成了从「被引用位置处」加载。

```js
        try {
            // filePath = ModuleResolver.resolve(request, relativeTo);
            filePath = ModuleResolver.resolve(request, importerPath);
        } catch (resolveError) {
```

  


目前这套 Patch 方案在大多数情况下可以稳定运行，但当 ESLint 配置存在多版本 Plugin 时，ESLint 会进行报错（Plugin 不唯一错误）。

  


在 Pete Gonzalez 看来，人们一般不会重复加载插件，而重复这个事情是用户可以自己解决的问题，不需要等待 ESLint 提供复杂的多版本消歧方案。

> 参考：https://github.com/eslint/eslint/issues/3458#issuecomment-516666620

  


目前社区上已经有一些包使用了这套方案，比如 CRA 的 [eslint-config-react-app](https://github.com/facebook/create-react-app/blob/main/packages/eslint-config-react-app/package.json)

```json
{
  "name": "eslint-config-react-app",
  "version": "7.0.1",
  "peerDependencies": {
    "eslint": "^8.0.0"
  },
  "dependencies": {
    "@babel/core": "^7.16.0",
    "@babel/eslint-parser": "^7.16.3",
    "@rushstack/eslint-patch": "^1.1.0",
    "@typescript-eslint/eslint-plugin": "^5.5.0",
    "@typescript-eslint/parser": "^5.5.0",
    "babel-preset-react-app": "^10.0.1",
    "confusing-browser-globals": "^1.0.11",
    "eslint-plugin-flowtype": "^8.0.3",
    "eslint-plugin-import": "^2.25.3",
    "eslint-plugin-jest": "^25.3.0",
    "eslint-plugin-jsx-a11y": "^6.5.1",
    "eslint-plugin-react": "^7.27.1",
    "eslint-plugin-react-hooks": "^4.3.0",
    "eslint-plugin-testing-library": "^5.0.1"
  }
}
```

  


> 总结：使用 `@rushstack/eslint-patch` 方案，ESLint 配置维护者可以将 ESLint Plugin 作为直接依赖。如果用户使用时遇到多版本 Plugin 的报错，需要自行修改配置和依赖，配置维护者仅保证自己的配置包没有问题。


## 5.3 ESLint Patch 引入时机


另外你可能会发现，[eslint-config-react-app](https://github.com/facebook/create-react-app/blob/main/packages/eslint-config-react-app/package.json) 内置了 `@rushstack/eslint-patch` ，不需要用户再手动安装并引入。

```
// https://github.com/facebook/create-react-app/blob/main/packages/eslint-config-react-app/base.js#L11
require('@rushstack/eslint-patch/modern-module-resolution');
```

这个是因为 [eslint-config-react-app](https://github.com/facebook/create-react-app/blob/main/packages/eslint-config-react-app/package.json) 一般只会在 CRA 上使用，CRA 初始化时就定制好了 ESLint 的一切。

  


你是否会疑惑，`@rushack/eslint-patch` 应该由谁引入，是配置维护者还是配置使用者？

  


这里我请教了 Pete Gonzalez ，他给出的建议是 - **由用户引入**，有两个原因：

1.  **避免奇怪的加载时序问题**：由用户引入，可以**确保在 ESLint 引擎执行模块解析前已完成 ESLint Patch 处理**，避免了可能取决于 ESLint插件 / 配置加载顺序的奇怪行为。
1.  **避免黑盒**：对于查看项目 `.eslintrc.js` 文件的任何人，可以立即清楚地看到正在应用 ESLint Patch

  


此外，可以让配置包增加一个 `modern-module-resolution.js` 文件，该文件重新导出 `@rushstack/eslint-patch/modern-module-resolution` 模块，这样可以**消除用户项目直接依赖于** **`@rushstack/eslint-patch`的问题**。示例：

```js
// myconfig/modern-module-resolution.js
require("@rushstack/eslint-patch/modern-module-resolution")


// 用户项目/.eslintrc.js 
require("@myconfig/modern-module-resolution");
module.exports = {
    extends: ['@myconfig'],
}
```

# 6. ESLint 新的配置系统

ESLint 从 2019 年开始逐步构建新的配置系统，直到 2022.07 （[v8.21.0](https://eslint.org/blog/2022/08/eslint-v8.21.0-released/)）才完成 MVP 版本

> 参考：
>
> -   https://github.com/eslint/rfcs/pull/9
> -   https://eslint.org/blog/2022/08/new-config-system-part-1/

  


那么 ESLint 新的配置系统是如何解决 plugin 依赖加载问题的？以及后续编写 ESLint 配置是否应该使用新配置系统？本节将对这些问题进行讨论

  


> 先给出结论：新的配置系统采用了**扁平化+配置解析即加载模块**的方案，解决了 plugin 依赖加载问题。同时这套配置系统还提供了兼容方案，方便复用原来的 ESLint 生态。但由于**周边生态、稳定性和 ESLint 版本覆盖率**的问题，目前短期内不建议使用。

  


## 6.1 扁平化配置系统

> 参考：
>
> -   [ESLint's new config system, Part 2: Introduction to flat config - ESLint - Pluggable JavaScript Lint](https://eslint.org/blog/2022/08/new-config-system-part-2/)
> -   https://eslint.org/docs/latest/use/configure/configuration-files-new

  


ESLint 新增了 `eslint.config.js` 配置文件，当使用此配置文件，将应用新的配置系统。


当使用 ESLint CLI 时，`eslint.config.js`从当前工作目录开始搜索，如果没有找到，将继续向上搜索目录的祖先，直到找到文件或找到根目录。

ESLint 运行时，`eslint.config.js`文件包含了所有配置信息，并完成所有模块的加载。因此与 eslintrc 相比，它大大减少了所需的磁盘访问，后者必须检查从配置文件位置到根目录的每个目录以获取任何其他配置文件。



下面是一个新的配置示例，包含了可共享配置、插件以及规则

```js
import jsdoc from "eslint-plugin-jsdoc";
import customConfig from "eslint-config-custom";
export default [
    ...customConfig,
    {
        files: ["**/*.js"],
        plugins: {
            jsdoc
        }
        rules: {
            "semi": "error",
            "no-unused-vars": "error"
            "jsdoc/require-description": "error",
            "jsdoc/check-values": "error"
        } 
    }
];

// eslint-config-custom
export default [
    {
        files: ["**/*.js"],
        plugins: {
            jsdoc
        }
        rules: {
            "jsdoc/require-description": "warn",
        } 
    },
    {
        files: ["**/*.js"],
        plugins: {
            react
        }
        rules: {
            "react/rule1": "error",
        } 
    }
];
```


可以发现，一切配置都是扁平化的，ESLint 在解析时会选择对应文件所满足的配置选项。

以上面的例子为例，js 文件可以应用所有规则，同时将生效较后定义的规则 `"jsdoc/require-description": "error"`

  


  


## 6.2 向后兼容的方案

> 参考：https://eslint.org/blog/2022/08/new-config-system-part-2/#backwards-compatibility-utility

ESLint 提供了一个兼容过渡方案，以允许现有生态系统缓慢转换为扁平配置。

  


`@eslint/eslintrc`包提供了一个`FlatCompat`类，可以轻松地在平面配置文件中继续使用 eslintrc 样式的共享配置和设置。这是一个例子：

```js
import { FlatCompat } from "@eslint/eslintrc";
import path from "path";
import { fileURLToPath } from "url";

// mimic CommonJS variables -- not needed if using CommonJS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname
});

export default [

    // mimic ESLintRC-style extends
    ...compat.extends("standard", "example"),

    // mimic environments
    ...compat.env({
        es2020: true,
        node: true
    }),

    // mimic plugins
    ...compat.plugins("airbnb", "react"),

    // translate an entire config
    ...compat.config({
        plugins: ["airbnb", "react"],
        extends: "standard",
        env: {
            es2020: true,
            node: true
        },
        rules: {
            semi: "error"
        }
    })
];
```

使用该类`FlatCompat`允许你继续使用所有现有的 eslintrc 文件，同时优化它们以用于平面配置。

## 6.3 使用建议

> 参考： https://eslint.org/blog/2022/08/new-config-system-part-3/


虽然 ESLint 新的配置系统已经可用，但我还是推荐短期内（2023年内）不要使用。主要是以下原因：

1.  处于试验阶段：ESLint 新的配置系统还处于试验阶段，一些 API 随时都可能调整。
1.  周边配套兼容：比如 vscode-eslint 等 IDE 插件，目前兼容仍存在一些[问题](https://github.com/microsoft/vscode-eslint/issues/1620)
1.  项目 ESLint 版本：使用新的配置系统需要用户升级 ESLint 版本，但有些项目受限于 ESLint v8 的 breakchange 还在使用 ESLint v7。


# 7. 最佳实践

> 对于可共享配置，维护者和使用者的最佳实践是什么？

  


长期来看，ESLint 生态会逐步接入新的 ESLint 配置系统。在此之前，我们建议配置维护者和使用者还是继续使用原有的配置方案。

  


1.  **对于配置维护者**

    1.  只是想给插件提供默认配置，采用 **ESLint 插件带配置**的形式；如果是要提供聚合的插件和默认配置选项，比如 `eslint-config-airbnb` 这种，采用 **ESLint Config** 的形式
    1.  plugin 依赖方式选择 dependencies ，并暴露 `@rushstack/eslint-patch` 的 `modern-module-resolution`模块
    1.  需先保证配置自身不会出现多版本 Plugin 问题

1.  **对于团队规范配置的维护者**

    1.  满足「配置维护者」最佳实践
    1.  若同时存在维护插件规则和提供默认配置的诉求，拆成 **ESLint Config** 和 **ESLint Plugin** 而不是耦合成 **ESLint 插件带配置**。
    1.  除了提供原子配置，还需提供组合配置，满足用户一次引入实现需求的目的。比如提供 `@myconfig/ts-react` 而不仅仅是 `@myconfig/ts` + `@myconfig/react`

1.  **对于配置使用者**

    1.  新增插件需谨慎，先查看可共享配置中是否已存在插件，避免多版本插件问题。
    1.  如果遇到插件找不到的问题，先尝试引入 `eslint-patch` 解决


# 8. 问题复盘

重新回顾下 ESLint 的这个问题，从 2015 年存在至今，里面有一些可以探讨的点。

## 8.1 考虑边界情况还是继续向前

ESLint 在这个问题上一直停滞不前，主要还是在考虑边界情况带来的破坏性变更问题。

我们日常开发中也经常会遇到这个问题，提供的方案，是应该**大多数情况下易用，少数失败**？还是**所有情况可用但不好用**。

  


这里我的想法是，和用户反馈解决速度以及需求迭代诉求相关。

-   对于内部团队项目，我们会选择更快的反馈机制，即使少数情况下用户使用失败，但也可以通过 oncall 快速得到解决方案。与此同时，我们需要快速迭代方案功能，若一直考虑极少部分用户的体验，很难实现业务价值。
-   但对于外部有一定体量的开源项目，任何破坏性变更都会带来负面影响，此时可以根据问题解决速度来评估选择哪种方案。此外，在思考方案时，也应该考虑全面，避免特殊处理导致又出现历史债务

  


## 8.2 如何设计一套可拓展的插件系统



ESLint 在设计可共享配置之初，并没有考虑到拓展自闭环（定义和配置放在一起），还依赖了 npm 管理方案的一些特性。

另外，ESLint 插件的规则定义和规则启用是分开的，导致跨层级使用规则会出现混乱。

  

而 babel 这类插件系统是自闭环的，和 ESLint 还不太一样，不能修改 babel 预设的某个插件的配置



因此，在设计插件系统的拓展功能时我们应该考虑两点：

1.  插件可自闭环，类似 babel 的插件结构，则允许采用树状层级的拓展体系
1.  插件无法自闭环，应该采用扁平化的结构进行拓展

# 9. 总结

本文从「可共享配置无法将插件作为直接依赖」这个问题入手，介绍了 ESLint Plugin 的加载机制，以及 ESLint 为何不将这些 Plugin 作为直接依赖的原因。

然后我们探讨了多版本 Plugin 的问题。一部分人认为多版本 Plugin 始终只是一个边缘 case，不必因为这个不常见的边缘 case，导致最常见的用例变得不那么方便。

接着介绍了 ESLint 新配置系统如何解决 plugin 依赖加载问题，并对可共享配置的维护者和使用者给出了最佳实践。

最后，我们重新复盘了 ESLint 的这个问题，在「考虑边界情况还是继续向前」和「如何设计一套可拓展的插件系统」两个问题上给出了结论。

  


# 拓展阅读

-   [How ESLint Resolves Plugins And Shareable Configs](https://levelup.gitconnected.com/how-eslint-resolves-plugins-and-shareable-configs-87194bca7b02)
-   [What is the difference between extends and plugins in ESLint config](https://prateeksurana.me/blog/difference-between-eslint-extends-and-plugins/)
