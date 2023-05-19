<template>
    <div class="block">this is test {{this.name}} {{this.desc}} {{this.link}}</div>
</template>

<script>

export default {
    props: {
        name: String,
        desc: String,
        link: String,
    },
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
.block {
    border: 1px solid rgb(30, 41, 59);
    border-radius: 8px;
}
</style>