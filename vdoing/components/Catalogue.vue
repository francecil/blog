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
      <div class="tabs-wrapper">
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
          <div class="catalogue-content">
            <template v-for="(item, index) in catalogueList">
              <dl v-if="type(item) === 'array'" :key="index" class="inline">
                <dt>
                  <router-link :to="item[2]">{{ `${index + 1}. ${item[1]}` }}
                    <span class="title-tag" v-if="item[3]">
                      {{ item[3] }}
                    </span>
                  </router-link>
                </dt>
              </dl>
              <dl v-else-if="type(item) === 'object'" :key="index">
                <!-- 一级目录 -->
                <dt :id="(anchorText = item.title)">
                  <a :href="`#${anchorText}`" class="header-anchor">#</a>
                  {{ `${index + 1}. ${item.title}` }}
                </dt>
                <dd>
                  <!-- 二级目录 -->
                  <template v-for="(c, i) in item.children">
                    <template v-if="type(c) === 'array'">
                      <router-link :to="c[2]" :key="i">{{ `${index + 1}-${i + 1}. ${c[1]}` }}
                        <span class="title-tag" v-if="c[3]">
                          {{ c[3] }}
                        </span>
                      </router-link>
                    </template>
                    <!-- 三级目录 -->
                    <div v-else-if="type(c) === 'object'" :key="i" class="sub-cat-wrap">
                      <div :id="(anchorText = c.title)" class="sub-title">
                        <a :href="`#${anchorText}`" class="header-anchor">#</a>
                        {{ `${index + 1}-${i + 1}. ${c.title}` }}
                      </div>
                      <template v-for="(cc, ii) in c.children">
                        <router-link v-if="cc.title" :to="`${cc.children && cc.children[0] && !cc.children[0].title
                          ? cc.children[0][2]
                          : '/categories/?category=' + cc.title
                          }`" :key="`${index + 1}-${i + 1}-${ii + 1}`">
                          {{ `${index + 1}-${i + 1}-${ii + 1}. ${cc.title}` }}
                        </router-link>
                        <router-link v-else :to="cc[2]" :key="`${index + 1}-${i + 1}-${ii + 1}`">
                          {{ `${index + 1}-${i + 1}-${ii + 1}. ${cc[1]}` }}
                          <span class="title-tag" v-if="cc[3]">
                            {{ cc[3] }}
                          </span>
                        </router-link>
                      </template>
                    </div>
                  </template>
                </dd>
              </dl>
            </template>
          </div>
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
import { Markmap } from 'markmap-view/dist/index.esm';

import { getScopedCatalogueList, getMdContent } from '../util/catalogue'

const MOBILE_DESKTOP_BREAKPOINT = 720 // refer to config.styl
const transformer = new Transformer();

export default {
  data() {
    return {
      pageData: null,
      isStructuring: true,
      catalogueList: [],
      tabs: [{
        label: '大纲模式',
      }, {
        label: '脑图模式',
      }],
      activeTab: 0,
      loading: true
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
    if (document.documentElement.clientWidth > MOBILE_DESKTOP_BREAKPOINT) {
      this.activeTab = 1
      this.loading = false
    }
    this.$nextTick(() => {
      this.mm = Markmap.create(this.$refs.mindmapRef, {
        /** 初始展开层级 */
        initialExpandLevel: 3,
        /** 节点展开动画时间 */
        duration: 100,
        /** 是否开启平移 */
        pan: false
      });
      this.initMarkData()
    })

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
      this.catalogueList = getScopedCatalogueList(key, sidebar)
    },
    async initMarkData() {
      const mdContent = getMdContent(this.pageData.title, this.catalogueList);
      const { root } = transformer.transform(mdContent)
      // console.log({ mdContent, root, mm: this.mm })
      this.mm.setData(root);
      const svgEl = this.$refs.mindmapRef
      // 设定初始宽高
      await this.mm.rescale(1)
      svgEl.parentElement.style.height = (svgEl.getBBox().height + 10) + "px";
      this.$nextTick(() => {
        this.mm.fit();
      })
    },
    type(o) { // 数据类型检查
      return Object.prototype.toString.call(o).match(/\[object (.*?)\]/)[1].toLowerCase()
    },
    changeTab(index) {
      this.activeTab = index
    }
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
.title-tag
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
    margin-bottom 2rem
  .catalogue-content
    dl
      margin-bottom 1.8rem
      &.inline
        display inline-block
        width 50%
        margin-bottom 1rem
        @media (max-width $MQMobileNarrow)
          width 100%
        a
          width 100%
      &:not(.inline)
        dt
          margin-top -($navbarHeight)
          padding-top $navbarHeight
      dt
        font-size 1.1rem
        &:hover .header-anchor
          opacity 1
      dd
        margin-top 0.7rem
        margin-left 1rem
        a:not(.header-anchor)
          margin-bottom 0.5rem
          display inline-block
          width 50%
          &:hover
            color $activeColor
            text-decoration none
          @media (max-width 720px)
            width 100%
      .sub-cat-wrap
        margin 5px 0 8px 0
        font-size 0.95rem
        &> a
          padding-left 1rem
          box-sizing border-box
        .sub-title
          margin-top -($navbarHeight)
          padding-top $navbarHeight
          margin-bottom 6px
          font-size 1rem
        &:hover
          .header-anchor
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
}

.mindmap-wrapper>svg {
  display: block;
  width: 100%;
  height: 100%;
}
</style>