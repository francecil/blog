<template>
    <div class="km">
        <div class="km__header">
            <h1 class="header-title">知识体系：知识地图 x 观测维度</h1>
            <p class="header-desc">
                个人知识体系由
                <span style="font-weight: bold;">领域知识、基础技能和最佳实践</span>
                三个维度构成，维度中的每个子项是一个独立的知识地图
                <span style="font-style:italic;">（知识地图间亦有交叉</span>）
                ，可以点击进入查看具体内容。
            </p>
        </div>
        <div class="km__body">
            <div class="container">
                <div class="container-header">
                    <span>领域知识</span>
                </div>
                <div class="list">
                    <KnowledgeMapBlock name="前端" desc="111" link="1"></KnowledgeMapBlock>
                    <KnowledgeMapBlock name="服务端" desc="111" link="1"></KnowledgeMapBlock>
                    <KnowledgeMapBlock name="服务端" desc="111" link="1"></KnowledgeMapBlock>
                </div>
            </div>
            <div class="container">
                <div class="container-header">
                    <span>基础技能</span>
                </div>
                <div class="list">
                    <KnowledgeMapBlock name="前端" desc="111" link="1"></KnowledgeMapBlock>
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

export default {
    data() {
        return {

        }
    },
    created() {

    },
    mounted() {

    },
    methods: {

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
.container-header > span {
    border: 1px var(--borderColor) solid;
    background-color: var(--customBlockBg);
    border-radius: 8px;
    padding: 4px 8px;
    font-size: 18px;
    font-weight: 500;
}


</style>
<style lang="css">
.content-wrapper:has(.km)>h1 {
    display: none;
}
</style>