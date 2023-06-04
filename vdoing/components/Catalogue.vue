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
      <transition v-if="!loading" name="fade">
        <div v-show="activeTab === 0">
          <div class="catalogue-title">目录</div>
          <a-tree :tree-data="catalogueTreeData" :defaultExpandedKeys="['0']" show-icon>
            <template slot="leftCustom" slot-scope="{ title, extra }">
              <a :title="title" target="_blank" :href="extra.link" class="leftnode--link">
                <span>📄 {{ title }}</span>
                <span class="catalogue__title-tag" v-if="extra.titleTag">{{ extra.titleTag }}</span>
              </a>
            </template>
            <template slot="dirCustom" slot-scope="{ title, key }">
              <span :id="title" :title="title" class="dirnode">
                <span>{{ key }}. {{ title }}</span>
                <a :href="`#${title}`" class="dirnode__header-anchor">#</a>
              </span>
            </template>
          </a-tree>
        </div>
      </transition>
      <transition v-if="!loading" name="fade">
        <div v-show="activeTab === 1" class="mindmap-wrapper">
          <svg ref="mindmapRef"></svg>
        </div>
      </transition>

    </div>
  </div>
</template>

<script>
import { Transformer } from 'markmap-lib';
import { Markmap } from 'markmap-view/dist/index.esm'
import { getScopedCatalogueTreeData, getMdContent } from '../util/catalogue'

const MOBILE_DESKTOP_BREAKPOINT = 720 // refer to config.styl
const transformer = new Transformer();

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
      // 大纲模式
      activeTab: 0,
      loading: true,
      // markmap 内部状态
      mmState: {},
      // 首次渲染时 svg 的高度
      initialSvgHeight: 0,
      isPC: true,
    }
  },
  created() {
    this.initPageData()
    this.initCatalogueList()
    const sidebar = this.$themeConfig.sidebar
    if (!sidebar || sidebar === 'auto') {
      this.isStructuring = false
      console.error("目录页数据依赖于结构化的侧边栏数据，请在主题设置中将侧边栏字段设置为'structuring'，否则无法获取目录数据。")
    }
  },
  mounted() {
    // PC 默认选择脑图模式
    this.isPC = document.documentElement.clientWidth > MOBILE_DESKTOP_BREAKPOINT
    this.loading = false
    if (this.isPC) {
      this.activeTab = 1
      this.$nextTick(() => {
        this.mm = Markmap.create(this.$refs.mindmapRef, {
          /** 初始展开层级 */
          initialExpandLevel: 2,
          /** 节点展开动画时间 */
          duration: 100,
          /** 是否开启平移 */
          pan: false
        });
        this.initMarkData()
        this.watchMmState()
      })
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
    async initMarkData() {
      if (!this.isPC) {
        return
      }
      const mdContent = getMdContent(this.pageData.title, this.catalogueTreeData);
      const { root } = transformer.transform(mdContent)
      // console.log({ mdContent, root, mm: this.mm })
      this.mm.setData(root);
      const svgEl = this.$refs.mindmapRef
      // 设定容器初始高度
      await this.mm.rescale(1)
      // svg 元素的初始宽高
      this.initialSvgHeight = this.mm.state.maxX - this.mm.state.minX + 10
      svgEl.style.height = this.initialSvgHeight + "px";
      svgEl.style.opacity = 0
      this.$nextTick(async () => {
        await this.mm.fit();
        svgEl.style.opacity = 1
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
    changeTab(index) {
      this.activeTab = index
    },
    onSelect(selectedKeys, info) {
      console.log('selected', selectedKeys, info);
    },
    onCheck(checkedKeys, info) {
      console.log('onCheck', checkedKeys, info);
    },
  },
  watch: {
    '$route.path'() {
      this.initPageData()
      this.initCatalogueList()
      this.initMarkData()
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
.catalogue-wrapper
  .catalogue-title
    font-size 1.45rem
    margin-bottom 1rem
.leftnode--link
  &:hover
    color: $activeColor;
    text-decoration: none!important;

.dirnode 
  display flex
  &__header-anchor
    opacity 0
    &:hover
      opacity 1
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

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter,
.fade-leave-to {
  opacity: 0;
}

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
  font-size 0.8rem
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
</style>