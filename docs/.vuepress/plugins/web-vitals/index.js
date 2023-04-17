import path from 'path';

export default (opts, ctx) => ({
    define() {
        return {
            WEB_VITALS_OPTIONS: opts.options || {},
        }
    },
    name: 'vuepress-plugin-web-vitals',
    enhanceAppFiles: path.resolve(__dirname, 'web-vitals.js'),
})