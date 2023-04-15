import path from 'path';

export default (opts, ctx) => ({
    define() {
        return {
            LIVE2D_MODEL: opts.model || 'hijiki',
        }
    },
    name: 'vuepress-plugin-live2d',
    enhanceAppFiles: path.resolve(__dirname, 'live2d.js'),
})