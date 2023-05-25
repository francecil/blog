<template>
    <div class="km">
        <div class="km__header">
            <h1 class="header-title">知识体系：知识地图 x 观测维度</h1>
            <p class="header-desc">
                个人知识体系由
                <span style="font-weight: bold;">知识领域、基础能力和核心标签</span>
                三个维度构成，维度中的每个子项是一个独立的知识地图
                <span style="font-style:italic;">（知识地图间亦有交叉</span>）
                ，点击查看详情。
            </p>
        </div>
        <div class="km__body">
            <div class="container" :key="index" v-for="(config, index) in knowledgeConfigs">
                <div class="container-header">
                    <span>{{ config.name }}</span>
                </div>
                <div class="blocks">
                    <KnowledgeMapBlock v-for="(block, index) in config.children" :title="block.title" :key="index"
                        :desc="block.desc" :link="block.path">
                    </KnowledgeMapBlock>
                </div>
            </div>
        </div>
        <div class="km__footer">
            <hr />
            <h3>其他知识地图项目</h3>
            <li>
                <a href="https://github.com/kamranahmedse/developer-roadmap" target="_blank"
                    rel="noopener noreferrer">developer-roadmap</a>
                <span>：Github 最火的知识图谱项目</span>
            </li>
        </div>
    </div>
</template>

<script>
const cataloguePrefix = '00.目录页'
export default {
    name: "KnowledgeSystem",
    data() {
        return {
        }
    },
    created() {
    },
    mounted() {
        // console.log('knowledgeConfigs', this.$site, this.knowledgeConfigs)
    },
    methods: {

    },
    computed: {
        // 目录页
        catalogues() {
            return this.$site.pages.filter(d => d.relativePath.startsWith(cataloguePrefix))
        },
        knowledgeConfigs() {
            const configs = [{
                name: '知识领域',
            }, {
                name: '基础能力',
            }]
            configs.forEach((config, index) => {
                config.children = this.catalogues.filter(d => new RegExp(`^${cataloguePrefix}\/${index}.*$`).test(d.relativePath)).map(block => ({
                    title: block.title,
                    path: block.path,
                    desc: block.frontmatter.pageComponent.data.description || ''
                }))
            })
            configs.push({
                name: '核心标签',
                children: ['最佳实践', '复盘总结', '奇技淫巧', '行业调研', '规划'].map((t) => ({
                    title: t,
                    path: `/tags/?tag=${t}`,
                    desc: `标签：${t}`
                }))
            })
            return configs
        }
    }
}
</script>

<style lang="css" scoped>
.km__header {
    text-align: center;
}

.header-title {
    background-clip: text;
    color: transparent;
    background-image: linear-gradient(rgb(255, 251, 235), rgb(95 60 95));
}

.header-desc {
    font-size: 14px;
}

.km__body {
    margin: 48px 0px;
}

.container {
    border-top-width: 1px;
    border-top-style: solid;
    border-top-color: var(--borderColor);
    position: relative;
    display: flex;
    flex-wrap: wrap;
    margin-bottom: 48px;
}

.container-header {
    height: 30px;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    transform: translateY(-15px);
}

.container-header>span {
    border: 1px var(--borderColor) solid;
    background-color: var(--customBlockBg);
    border-radius: 8px;
    padding: 2px 8px;
    font-size: 16px;
    font-weight: 500;
}

.blocks {
    display: grid;
    width: 100%;
    grid-template-columns: repeat(3, 1fr);
    grid-gap: 24px;
}
</style>
<style lang="stylus" scoped>
@media (max-width $MQMobile) 
    .blocks 
        grid-template-columns repeat(2, 1fr)

</style>