import path from 'path';

export default (opts, ctx) => ({
    define() {
        return {
            COMMENT_CHOOSEN: opts.choosen || 'gitalk',
            COMMENT_OPTIONS: opts.options || {},
            COMMENT_CONTAINER: opts.container || 'main.page'
        }
    },
    name: 'vuepress-plugin-comment',
    enhanceAppFiles: path.resolve(__dirname, 'comment.js'),
    globalUIComponents: 'Comment',
})