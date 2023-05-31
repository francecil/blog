<template>
    <div class="catalogue-tree">
        <template v-for="(item, index) in list">
            <!-- 文件 -->
            <dl v-if="type(item) === 'array'" :key="index" class="inline">
                <dt>
                    <router-link :to="item[2]">{{ `${prefix}${index + 1}. ${item[1]}` }} 📄
                        <span class="catalogue__title-tag" v-if="item[3]">
                            {{ item[3] }}
                        </span>
                    </router-link>
                </dt>
            </dl>
            <!-- 目录 -->
            <dl v-else-if="type(item) === 'object'" :key="index">
                <dt :id="(anchorText = item.title)" :class="`level-${level}`">
                    <a :href="`#${anchorText}`" class="header-anchor">#</a>
                    {{ `${prefix}${index + 1}. ${item.title}` }}
                </dt>
                <dd>
                    <CatalogueTree v-if="item.children" :prefix="`${prefix}${index + 1}-`" :list="item.children" :level="level+1">
                    </CatalogueTree>
                </dd>
            </dl>
        </template>
    </div>
</template>
  
<script>
export default {
    name: "CatalogueTree",
    props: {
        list: {
            type: Array,
            default: () => {
                return [];
            },
        },
        prefix: {
            type: String,
            default: '',
        },
        level: {
            type: Number,
            default: 1
        }
    },
    methods: {
        type(o) { // 数据类型检查
            return Object.prototype.toString.call(o).match(/\[object (.*?)\]/)[1].toLowerCase()
        },
    }
};
</script>
<style lang="stylus" scoped rel="stylesheet/stylus">
.catalogue-tree
    dl
      margin-bottom 1.8rem
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
</style>