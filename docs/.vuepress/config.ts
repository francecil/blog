/**
 * 提示：如您想使用JS版本的配置文件可参考：https://github.com/xugaoyi/vuepress-theme-vdoing/tree/a2f03e993dd2f2a3afdc57cf72adfc6f1b6b0c32/docs/.vuepress
 */
import { resolve } from "path";
import { defineConfig4CustomTheme, UserPlugins } from "vuepress/config";
import { VdoingThemeConfig } from "vuepress-theme-vdoing/types";
import dayjs from "dayjs";
import baiduCode from "./config/baiduCode"; // 百度统计hm码
import htmlModules from "./config/htmlModules"; // 自定义插入的html块
import commonPlugin from "./plugins/comment";
import live2dPlugin from "./plugins/live2d";
import webVitalsPlugin from "./plugins/web-vitals";
import audiencesPlugin from "./plugins/audiences";

const DOMAIN_NAME = "gahing.top"; // 域名 (不带https)
const WEB_SITE = `https://${DOMAIN_NAME}`; // 网址

export default defineConfig4CustomTheme<VdoingThemeConfig>({
  // theme: 'vdoing', // 使用npm主题包
  theme: resolve(__dirname, "../../vdoing"), // 使用本地主题包

  locales: {
    "/": {
      lang: "zh-CN",
      title: "Gahing's blog",
      description: "前端技术博客。包括大前端、服务端、通用技术",
    },
  },
  patterns: ["**/*.vue", "*.md", "**/!(_)*/!(README).md"],
  // base: '/', // 默认'/'。如果你想将你的网站部署到如 https://foo.github.io/bar/，那么 base 应该被设置成 "/bar/",（否则页面将失去样式等文件）
  // 主题配置
  themeConfig: {
    // 导航配置
    nav: [
      { text: "首页", link: "/" },
      { text: "知识体系", link: "/knowledge/" },
      {
        text: "大前端",
        link: "/fe/", //目录页链接，此处link是 vdoing 主题新增的配置项，有二级导航时，可以点击一级导航跳到目录页
        items: [
          {
            text: "前端基础",
            items: [
              { text: "JavaScript", link: "/pages/2e58d1/" },
              { text: "HTML", link: "/pages/7d9673/" },
              { text: "CSS", link: "/pages/c1c6f3/" },
              { text: "TypeScript", link: "/pages/df8030/" },
              { text: "WebAssembly", link: "/pages/25ca35/" },
            ],
          },
          {
            text: "UI 框架",
            items: [
              { text: "React", link: "/react/" },
              { text: "Vue", link: "/vue/" },
            ],
          },
        ],
      },
      {
        text: "技术",
        link: "/technology/",
        items: [
          {
            text: "Git",
            link: "/git/",
          },
          {
            text: "网络基础",
            link: "/network/",
          },
          {
            text: "算法",
            link: "/algorithm/",
          },
          {
            text: "数据结构",
            link: "/data-structure/",
          },
          {
            text: "编程范式",
            link: "/programming-paradigm/",
          },
          {
            text: "编解码",
            link: "/codec/",
          },
          {
            text: "Linux",
            link: "/linux/",
          },
          {
            text: "AIGC",
            link: "/aigc/",
          },
          {
            text: "其他领域",
            items: [
              {
                text: "客户端",
                link: "/app/",
              },
              {
                text: "服务端",
                link: "/server/",
              },
              {
                text: "产品设计",
                link: "/design/",
              },
            ],
          },
        ],
      },
      { text: "软素质", link: "/soft-quality/" },
      {
        text: "生活 & More",
        link: "/life/",
        items: [
          { text: "面试经验", link: "/interviews/" },
          { text: "人生总结", link: "/life-summary/" },
          { text: "个人简历", link: "/resume/" },
          {
            text: "灵感记录",
            link: "/pages/ideas/",
          },
          {
            text: "实用技巧",
            link: "/practical-tips/",
          },
          {
            text: "知识科普",
            link: "/knowledge-popularization/",
          },
          {
            text: "友情链接",
            link: "/friends/",
          },
          {
            text: "美食推荐",
            link: "https://itoutiao.feishu.cn/base/COJCbzvJ5axnrTsOSIvcTYY7nmc",
          },
          {
            text: "收藏夹",
            // 更新频率高，用在线文档维护
            items: [
              {
                text: "优质前端信息源",
                link: "https://itoutiao.feishu.cn/docx/SAdidmcozohUmlxp29wcQtTXn2b",
              },
            ],
          },
        ],
      },
      {
        text: "关于",
        link: "/about/",
      },
      {
        text: "索引",
        link: "/archives/",
        items: [
          { text: "分类", link: "/categories/" },
          { text: "标签", link: "/tags/" },
          { text: "归档", link: "/archives/" },
        ],
      },
    ],
    patterns: ["**/!(_)*/!(README).md"], // 需要解析的文件
    sidebarDepth: 2, // 侧边栏显示深度，默认1，最大2（显示到h3标题）
    logo: "/img/logo.png", // 导航栏logo
    repo: "francecil/blog", // 导航栏右侧生成Github链接
    search: true,
    searchMaxSuggestions: 10, // 搜索结果显示最大数
    algolia: {
      apiKey: "9697875d39432384a444b570563811be",
      indexName: "gahing",
      appId: "0QTGLFRP72",
    },
    lastUpdated: "上次更新", // 开启更新时间，并配置前缀文字   string | boolean (取值为git提交时间)
    docsDir: "docs", // 编辑的文件夹
    sidebarDir: "", // 侧边栏文档目录 add by gahing
    // docsBranch: 'master', // 编辑的文件所在分支，默认master。 注意：如果你的分支是main则修改为main
    editLinks: true, // 启用编辑
    editLinkText: "编辑",
    ignoreCategories: [/(source)/], // 忽略自动生成的分类名

    //*** 以下是Vdoing主题相关配置，文档：https://doc.xugaoyi.com/pages/a20ce8/ ***//

    // category: false, // 是否打开分类功能，默认true
    // tag: false, // 是否打开标签功能，默认true
    // archive: false, // 是否打开归档功能，默认true
    categoryText: "随笔", // 碎片化文章（_posts文件夹的文章）预设生成的分类值，默认'随笔'

    // pageStyle: 'line', // 页面风格，可选值：'card'卡片 | 'line' 线（未设置bodyBgImg时才生效）， 默认'card'。 说明：card时背景显示灰色衬托出卡片样式，line时背景显示纯色，并且部分模块带线条边框

    bodyBgImg: [
      "/img/bg.jpeg",
      // 'https://fastly.jsdelivr.net/gh/xugaoyi/image_store/blog/20200507175845.jpeg',
      // 'https://fastly.jsdelivr.net/gh/xugaoyi/image_store/blog/20200507175846.jpeg'
    ], // body背景大图，默认无。 单张图片 String | 多张图片 Array, 多张图片时隔bodyBgImgInterval切换一张。
    bodyBgImgOpacity: 0.5, // body背景图透明度，选值 0.1~1.0, 默认0.5
    bodyBgImgInterval: 15, // body多张背景图时的切换间隔, 默认15，单位s
    // bodyBgPreviewImg: '/img/bg-small.jpeg',
    // titleBadge: false, // 文章标题前的图标是否显示，默认true
    // titleBadgeIcons: [ // 文章标题前图标的地址，默认主题内置图标
    //   '图标地址1',
    //   '图标地址2'
    // ],
    // contentBgStyle: 1, // 文章内容块的背景风格，默认无. 1 方格 | 2 横线 | 3 竖线 | 4 左斜线 | 5 右斜线 | 6 点状

    // updateBar: { // 最近更新栏
    //   showToArticle: true, // 显示到文章页底部，默认true
    //   moreArticle: '/archives' // “更多文章”跳转的页面，默认'/archives'
    // },
    // rightMenuBar: false, // 是否显示右侧文章大纲栏，默认true (屏宽小于1300px下无论如何都不显示)
    // sidebarOpen: false, // 初始状态是否打开左侧边栏，默认true
    // pageButton: false, // 是否显示快捷翻页按钮，默认true

    // 默认外观模式（用户未在页面手动修改过模式时才生效，否则以用户设置的模式为准），可选：'auto' | 'light' | 'dark' | 'read'，默认'auto'。
    // defaultMode: 'auto',

    // 侧边栏  'structuring' | { mode: 'structuring', collapsable: Boolean} | 'auto' | <自定义>    温馨提示：目录页数据依赖于结构化的侧边栏数据，如果你不设置为'structuring',将无法使用目录页
    sidebar: "structuring",

    // 文章默认的作者信息，(可在md文件中单独配置此信息) string | {name: string, link?: string}
    author: {
      name: "gahing", // 必需
      link: "https://github.com/francecil", // 可选的
    },

    // 博主信息 (显示在首页侧边栏)
    blogger: {
      avatar: "/img/avatar.jpeg",
      name: "Gahing",
      slogan: "To be best",
    },

    // 社交图标 (显示于博主信息栏和页脚栏。内置图标：https://doc.xugaoyi.com/pages/a20ce8/#social)
    social: {
      // iconfontCssFile: '//at.alicdn.com/t/xxx.css', // 可选，阿里图标库在线css文件地址，对于主题没有的图标可自己添加。阿里图片库：https://www.iconfont.cn/
      icons: [
        {
          iconClass: "icon-youjian",
          title: "发邮件",
          link: "mailto:396324491@qq.com",
        },
        {
          iconClass: "icon-github",
          title: "GitHub",
          link: "https://github.com/francecil",
        },
      ],
    },

    // 页脚信息
    footer: {
      createYear: 2016, // 博客创建年份
      copyrightInfo:
        'Gahing | <a href="http://www.beian.gov.cn" target="__blank">闽ICP备19024221号-1</a>', // 博客版权信息、备案信息等，支持a标签或换行标签</br>
    },

    // 扩展自动生成frontmatter。（当md文件的frontmatter不存在相应的字段时将自动添加。不会覆盖已有的数据。）
    // extendFrontmatter: {
    //   author: {
    //     name: 'gahing',
    //     link: 'https://github.com/francecil'
    //   }
    // },

    // 自定义hmtl(广告)模块
    htmlModules,
  },

  // 注入到页面<head>中的标签，格式[tagName, { attrName: attrValue }, innerHTML?]
  head: [
    ["link", { rel: "icon", href: "/img/favicon.ico" }], //favicons，资源放在public文件夹
    ["link", { rel: "manifest", href: "/manifest.json" }],
    ["meta", { name: "apple-mobile-web-app-capable", content: "yes" }],
    [
      "meta",
      { name: "apple-mobile-web-app-status-bar-style", content: "black" },
    ],
    ["link", { rel: "apple-touch-icon", href: "/img/logo.png" }],
    ["meta", { name: "msapplication-TileImage", content: "/img/logo.png" }],
    ["meta", { name: "msapplication-TileColor", content: "#000000" }],
    [
      "meta",
      {
        name: "keywords",
        content: "前端博客",
      },
    ],
    // 移动浏览器主题颜色
    [
      "meta",
      {
        name: "theme-color",
        media: "(prefers-color-scheme: light)",
        content: "#d1fbf9e6",
      },
    ],
    [
      "meta",
      {
        name: "theme-color",
        media: "(prefers-color-scheme: dark)",
        content: "#1e1e22cc",
      },
    ],
    // 站长统计验证
    ["meta", { name: "baidu-site-verification", content: "codeva-SokyIFDMe9" }],
    [
      "meta",
      {
        name: "google-site-verification",
        content: "4k3G9ZEl7_r-tXh5BDu5MBGg5Yd5DUVfn-6hoynqvZ8",
      },
    ],
  ],

  // 插件配置
  plugins: <UserPlugins>[
    [
      "sitemap", // 网站地图
      {
        hostname: WEB_SITE,
      },
    ],
    [
      "@vuepress/pwa",
      {
        // 仅做安装， 不做 sw 缓存
        serviceWorker: false,
        updatePopup: false,
      },
    ],
    "vuepress-plugin-baidu-autopush", // 百度自动推送

    [
      "vuepress-plugin-baidu-tongji", // 百度统计
      {
        hm: baiduCode,
      },
    ],

    // 全文搜索。 ⚠️注意：此插件会在打开网站时多加载部分js文件用于搜索，导致初次访问网站变慢。如在意初次访问速度的话可以不使用此插件！（推荐：vuepress-plugin-thirdparty-search）
    // 'fulltext-search',

    // 可以添加第三方搜索链接的搜索框（继承原官方搜索框的配置参数）
    // [
    //   'thirdparty-search',
    //   {
    //     thirdparty: [
    //       {
    //         title: '在MDN中搜索',
    //         frontUrl: 'https://developer.mozilla.org/zh-CN/search?q=', // 搜索链接的前面部分
    //         behindUrl: '', // 搜索链接的后面部分，可选，默认 ''
    //       },
    //       {
    //         title: '在Runoob中搜索',
    //         frontUrl: 'https://www.runoob.com/?s=',
    //       },
    //       {
    //         title: '在Vue API中搜索',
    //         frontUrl: 'https://cn.vuejs.org/v2/api/#',
    //       },
    //       {
    //         title: '在Bing中搜索',
    //         frontUrl: 'https://cn.bing.com/search?q=',
    //       },
    //       {
    //         title: '通过百度搜索本站的',
    //         frontUrl: `https://www.baidu.com/s?wd=site%3A${DOMAIN_NAME}%20`,
    //       },
    //     ],
    //   }
    // ],

    [
      "one-click-copy", // 代码块复制按钮
      {
        copySelector: [
          'div[class*="language-"] pre',
          'div[class*="aside-code"] aside',
        ], // String or Array
        copyMessage: "复制成功", // default is 'Copy successfully and then paste it for use.'
        duration: 1000, // prompt message display time.
        showInMobile: false, // whether to display on the mobile side, default: false.
      },
    ],

    [
      "demo-block", // demo演示模块 https://github.com/xiguaxigua/vuepress-plugin-demo-block
      {
        settings: {
          // jsLib: ['http://xxx'], // 在线示例(jsfiddle, codepen)中的js依赖
          // cssLib: ['http://xxx'], // 在线示例中的css依赖
          // vue: 'https://fastly.jsdelivr.net/npm/vue/dist/vue.min.js', // 在线示例中的vue依赖
          jsfiddle: false, // 是否显示 jsfiddle 链接
          codepen: true, // 是否显示 codepen 链接
          horizontal: false, // 是否展示为横向样式
        },
      },
    ],
    [
      "vuepress-plugin-zooming", // 放大图片
      {
        selector: ".theme-vdoing-content img:not(.no-zoom)", // 排除class是no-zoom的图片
        options: {
          bgColor: "rgba(0,0,0,0.6)",
        },
      },
    ],
    [
      commonPlugin,
      {
        choosen: "utterances",
        options: {
          repo: "francecil-public/blog-comments-utterances",
          theme: "preferred-color-scheme",
          issueTerm: "pathname",
          // service: 'beaudar',
          branch: "main",
          // clientID: '5c2a2bb4f2d2936f93cb',
          // clientSecret: 'a889b19b7b97609e2de9e446f7f9f6219417aa90',
          // repo: 'blog-gitalk-comment', // GitHub 仓库
          // owner: 'francecil', // GitHub仓库所有者
          // admin: ['francecil'], // 对仓库有写权限的人
          // // gitalk 跨域代理问题可以看这个帖子 https://prohibitorum.top/7cc2c97a15b4.html
          // proxy: 'https://safe-cors-server.vercel.app//github_access_token',
          // // distractionFreeMode: true,
          // pagerDirection: 'last', // 'first'正序 | 'last'倒序
          // id: '<%- (frontmatter.permalink || frontmatter.to.path).slice(-16) %>', //  页面的唯一标识,长度不能超过50
          // title: '「评论」<%- frontmatter.title %>', // GitHub issue 的标题
          // labels: ['Gitalk', 'Comment'], // GitHub issue 的标签
          // body:
          //   '页面：<%- window.location.origin + (frontmatter.to.path || window.location.pathname) %>', // GitHub issue 的内容
        },
      },
    ],
    [
      live2dPlugin,
      {
        options: {
          model: "hijiki",
        },
      },
    ],
    [
      webVitalsPlugin,
      {
        options: {
          analyticsId: process.env.VERCEL_ANALYTICS_ID || "",
          debug: process.env.NODE_ENV !== "production",
        },
      },
    ],
    [audiencesPlugin],
    [
      "@vuepress/last-updated", // "上次更新"时间格式
      {
        transformer: (timestamp, lang) => {
          return dayjs(timestamp).format("YYYY/MM/DD, HH:mm:ss");
        },
      },
    ],
  ],

  markdown: {
    lineNumbers: true,
    // @ts-ignore
    extractHeaders: ["h1", "h2", "h3", "h4", "h5", "h6"], // 提取标题到侧边栏的级别，默认['h2', 'h3']
  },

  // 监听文件变化并重新构建
  extraWatchFiles: [".vuepress/config.ts", ".vuepress/config/htmlModules.ts"],

  chainWebpack(config, isServer) {
    // fix antdv 使用高版本 core-js 导致报错的问题 https://github.com/zpfz/vuepress-theme-antdocs/issues/5
    config.resolve.alias.set("core-js/library/fn", "core-js/features");
    // 按需加载
    config.module
      .rule("js") // Find the rule.
      .use("babel-loader") // Find the loader
      .tap((options) =>
        Object.assign(options, {
          // Modifying options
          plugins: [
            [
              "import",
              {
                libraryName: "ant-design-vue",
                libraryDirectory: "es",
                style: "css",
              },
            ],
          ],
        })
      );
  },
});
