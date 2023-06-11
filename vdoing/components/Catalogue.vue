<!-- 目录页 -->
<template>
  <div class="theme-vdoing-content">
    <div class="column-wrapper">
      <img v-if="pageData.imgUrl" :src="$withBase(pageData.imgUrl)" />
      <dl class="column-info">
        <dt class="title">{{ pageData.title }}</dt>
        <dd class="description" v-html="pageData.description"></dd>
      </dl>
    </div>
    <div class="catalogue-wrapper" v-if="isStructuring">
      <div v-if="this.isPC" class="tabs-wrapper">
        <ul class="tabs">
          <li v-for="(tab, index) in tabs" :key="index" :class="['tab', { active: activeTab === index }]"
            @click="changeTab(index)">
            {{ tab.label }}
          </li>
        </ul>
      </div>
      <div v-show="activeTab === TAB_MAIN_POINT" class="catalogue__main-point">
        <div class="catalogue__header">
          <div class="catalogue__title">目录</div>
          <a-input-search v-if="isPC" v-model="searchValue" class="catalogue__search" placeholder="搜索目录或文章"
            @change="onInputChange" />
        </div>
        <a-tree ref="catalogueTree" class="catalogue-tree" :auto-expand-parent="autoExpandParent"
          :tree-data="catalogueTreeData" :expanded-keys="expandedKeys" show-line show-icon @select="onTreeNodeSelect"
          @expand="onExpand">
          <template slot="leftCustom" slot-scope="{ title, extra }">
            <a :title="title" target="_blank" :href="extra.link" class="leftnode--link">
              <span v-if="searchValue && title.indexOf(searchValue) > -1">
                {{ title.substr(0, title.indexOf(searchValue)) }}
                <span class="leftnode--active">{{ searchValue }}</span>
                {{ title.substr(title.indexOf(searchValue) + searchValue.length) }}
              </span>
              <span v-else>{{ title }}</span>

              <span class="catalogue__title-tag" v-if="extra.titleTag">{{ extra.titleTag }}</span>
            </a>
          </template>
          <template slot="dirCustom" slot-scope="{ title, key }">
            <span :id="title" :title="title" class="dirnode">
              <span>{{ key }}.</span>
              <span v-if="searchValue && title.indexOf(searchValue) > -1">
                {{ title.substr(0, title.indexOf(searchValue)) }}
                <span class="leftnode--active">{{ searchValue }}</span>
                {{ title.substr(title.indexOf(searchValue) + searchValue.length) }}
              </span>
              <span v-else>{{ title }}</span>
              <a :href="`#${title}`" v-on:click.capture.stop class="dirnode__header-anchor">#</a>
            </span>
          </template>
        </a-tree>
      </div>
      <a-spin v-show="activeTab === TAB_MINDMAP" :spinning="loading">
        <div class="mindmap-wrapper">
          <svg ref="mindmapRef"></svg>
        </div>
      </a-spin>
    </div>

  </div>
</template>

<script>
import { Transformer } from 'markmap-lib';
import { Markmap } from 'markmap-view/dist/index.esm'
import { getScopedCatalogueTreeData, getMdContent, getParentKeysContainKeywork } from '../util/catalogue'
import { getQuery, setQuery } from '../util/url'

const MOBILE_DESKTOP_BREAKPOINT = 720 // refer to config.styl
const transformer = new Transformer();

const TAB_MAIN_POINT = 0
const TAB_MINDMAP = 1
const QUERY_KEY_TAB = 'tab'

export default {
  data() {
    return {
      pageData: null,
      isStructuring: true,
      catalogueTreeData: [],
      tabs: [{
        label: '大纲模式',
      }, {
        label: '脑图模式',
      }],
      activeTab: TAB_MAIN_POINT,
      // 数据是否未完成加载和解析
      loading: true,
      // markmap 内部状态
      mmState: {},
      // 首次渲染时 svg 的高度
      initialSvgHeight: 0,
      isPC: true,
      searchValue: '',
      expandedKeys: ['1'],
      autoExpandParent: true
    }
  },
  created() {
    this.TAB_MAIN_POINT = TAB_MAIN_POINT
    this.TAB_MINDMAP = TAB_MINDMAP
    this.initPageData()
    this.initCatalogueList()
    const sidebar = this.$themeConfig.sidebar
    if (!sidebar || sidebar === 'auto') {
      this.isStructuring = false
      console.error("目录页数据依赖于结构化的侧边栏数据，请在主题设置中将侧边栏字段设置为'structuring'，否则无法获取目录数据。")
    }
  },
  beforeMount() {
    // PC 默认选择脑图模式
    this.isPC = document.documentElement.clientWidth > MOBILE_DESKTOP_BREAKPOINT
    if (this.isPC) {
      // 有 hash 直接展示大纲
      if(location.hash) {
        this.activeTab = TAB_MAIN_POINT
        return
      }
      // 根据不同的 query 展示
      const queryTab = getQuery(QUERY_KEY_TAB)
      this.activeTab = queryTab ? Number(queryTab) : TAB_MINDMAP
    }

  },
  async mounted() {
    if (this.isPC) {
      this.mm = Markmap.create(this.$refs.mindmapRef, {
        /** 初始展开层级 */
        initialExpandLevel: 2,
        /** 节点展开动画时间 */
        duration: 100,
        /** 是否开启平移 */
        pan: false
      });
      this.initMarkData()
      if (this.activeTab === TAB_MINDMAP) {
        await this.renderMarkData()
        this.loading = false
      }
      this.watchMmState()
    } else {
      this.loading = false
    }

  },
  methods: {
    // 目录页基本数据
    initPageData() {
      const pageComponent = this.$frontmatter.pageComponent
      if (pageComponent && pageComponent.data) {
        this.pageData = {
          ...pageComponent.data,
          title: this.$frontmatter.title
        }
      } else {
        console.error('请在front matter中设置pageComponent和pageComponent.data数据')
      }
    },
    initCatalogueList() {
      const { sidebar } = this.$site.themeConfig
      const { data } = this.$frontmatter.pageComponent
      const key = data.path || data.key
      this.catalogueTreeData = getScopedCatalogueTreeData(key, sidebar)
    },
    initMarkData() {
      const mdContent = getMdContent(this.pageData.title, this.catalogueTreeData);
      const { root } = transformer.transform(mdContent)
      this.mmData = root
    },
    async renderMarkData() {
      this.mm.setData(this.mmData);
      const svgEl = this.$refs.mindmapRef
      // 设定容器初始高度
      await this.mm.rescale(1)
      // svg 元素的初始宽高
      this.initialSvgHeight = this.mm.state.maxX - this.mm.state.minX + 10
      svgEl.style.height = this.initialSvgHeight + "px";
      svgEl.style.opacity = 0
      await new Promise((resolve) => {
        this.$nextTick(async () => {
          await this.mm.fit();
          svgEl.style.opacity = 1
          resolve()
        })
      })
    },
    watchMmState() {
      const tmpData = { ...this.mm.state }
      Object.defineProperties(this.mm.state, ['minX', 'maxX', 'minY', 'maxY'].reduce((obj, prop) => {
        obj[prop] = {
          get() {
            return tmpData[prop]
          },
          set: (val) => {
            if (val === tmpData[prop]) {
              return
            }
            tmpData[prop] = val
            this.fitSvgStyle(tmpData)
          }
        }
        return obj
      }, {}))
    },
    /* svg 宽高自适应 */
    fitSvgStyle({ minX, maxX, minY, maxY }) {
      // console.log('fitSvgStyle', minX, maxX, minY, maxY)
      const svgHeight = maxX - minX + 10
      const svgWidth = maxY - minY
      const svgEl = this.$refs.mindmapRef
      // svg 高度只增不减
      svgEl.style.height = Math.max(this.initialSvgHeight, svgHeight) + 'px'
      this.$nextTick(() => {
        this.mm.fit();
      })
    },
    type(o) { // 数据类型检查
      return Object.prototype.toString.call(o).match(/\[object (.*?)\]/)[1].toLowerCase()
    },
    resetState() {
      this.loading = true
      this.searchValue = ''
      this.expandedKeys = ['1']
    },
    async changeTab(index) {
      this.activeTab = index
      setQuery(QUERY_KEY_TAB, index)
      // 渲染知识地图
      if (index === TAB_MINDMAP && this.loading) {
        await this.renderMarkData()
        this.loading = false
      }
    },
    onExpand(expandedKeys) {
      this.expandedKeys = expandedKeys;
      this.autoExpandParent = false;
    },
    onInputChange(e) {
      // 找到所有含有 searchValue 的父节点
      const expandedKeys = this.searchValue ? this.catalogueTreeData.reduce((pre, cur) => {
        return [...pre, ...getParentKeysContainKeywork(this.searchValue, cur)]
      }, []) : []
      this.expandedKeys = expandedKeys
      this.autoExpandParent = true
    },
    onTreeNodeSelect(selectedKeys, { node }) {
      node.onExpand()
    },
  },
  watch: {
    async '$route.path'() {
      this.resetState()
      this.initPageData()
      this.initCatalogueList()
      if (this.isPC) {
        this.initMarkData()
        if (this.activeTab === TAB_MINDMAP) {
          await this.renderMarkData()
          this.loading = false
        }
      } else {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
.theme-vdoing-content
  margin-bottom $navbarHeight
dl, dd
  margin 0
.column-wrapper
  margin-top 1rem
  display flex
  padding-bottom 2rem
  border-bottom 1px solid var(--borderColor)
  img
    width 80px
    height 80px
    border-radius 2px
    margin-right 1rem
  .column-info
    .title
      font-size 1.6rem
    .description
      color var(--textColor)
      opacity 0.8
      margin 0.5rem 0
    
.catalogue__header 
  margin-bottom 1rem
  display flex
  justify-content space-between
  .catalogue__title
    font-size 1.45rem
  .catalogue__search
    width 200px
.leftnode--link
  &:hover
    text-decoration: none!important;
.leftnode--active
  color $activeColor
  opacity 0.6
.dirnode 
  display flex
  color var(--textColor)
  &:hover
    .dirnode__header-anchor
      opacity 1
  &__header-anchor
    opacity 0
    padding-left 4px
</style>
<style lang="css" scoped>
.tabs-wrapper {
  display: flex;
  justify-content: flex-end;
  margin: 12px;
}

.tabs {
  border-radius: 5px;
  background: var(--customBlockBg);
  color: var(--textSecondaryColor);
  padding: 1px;
  border: 1px solid var(--borderSecondaryColor);
  list-style: none;
  display: flex;
  justify-content: center;
  align-items: center;
}

.tab {
  display: inline-block;
  border-radius: 4px;
  padding: 4px 8px;
  cursor: pointer;
  list-style: none;
  font-size: 12px;
}

.tab.active {
  background: var(--mainBg);
  font-weight: 500;
}

/* .fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
} */

.mindmap-wrapper {
  width: 100%;
  min-height: 1em;
  overflow: auto;
  border: 1px solid rgba(150, 150, 150, 0.25);
  border-radius: 8px;
  box-sizing: content-box;
  display: flex;
}

.mindmap-wrapper>svg {
  display: block;
  opacity: 0;
  width: 100%;
  height: 100%;
}
</style>
<style lang="stylus">
.catalogue__title-tag
  // height 1.1rem
  // line-height 1.1rem
  border 1px solid $activeColor
  color $activeColor
  font-size 0.6rem
  line-height 1.5
  padding 0 0.35rem
  border-radius 0.2rem
  margin-left 0rem
  transform translate(0, -0.05rem)
  display inline-block

.m-markmap-pagenode
  &:hover
    color: $activeColor!important;
    text-decoration: none!important;

.m-markmap-dirnode
  // cursor pointer
.catalogue__main-point
  .catalogue-tree.ant-tree
    .ant-tree-switcher
      background-color var(--mainBg) 
      color var(--textColor)
    .ant-tree-node-selected
      background-color var(--mainBg) 
</style>