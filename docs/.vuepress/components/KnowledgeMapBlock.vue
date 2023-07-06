<template>
    <router-link tag="div" class="block" :to="this.link">
        <div class="title">{{ this.title }}</div>
        <div class="desc">{{ this.desc }} </div>
    </router-link>
</template>

<script>

export default {
    name: "KnowledgeMapBlock",
    props: {
        title: String,
        desc: String,
        link: String,
    },
}
</script>

<style lang="css" scoped>
.block {
    border: 1px solid var(--borderColor);
    border-radius: 8px;
    height: 100px;
    cursor: pointer;
    padding: 8px;
}

.block:hover {
    box-shadow: 0 0 12px var(--shadowColor)
}

.title {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 8px;
}

.desc {
    font-size: 12px;
    overflow: hidden;
    -webkit-line-clamp: 3;
    display: -webkit-box;
    word-break: break-all;
    -webkit-box-orient: vertical;
}
</style>