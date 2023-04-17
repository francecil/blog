import path from 'path';

/**
 * 收集性能数据并上报 vercel
 */
export default (opts, ctx) => ({
    define() {
        return {
            WEB_VITALS_OPTIONS: opts.options || {},
        }
    },
    name: 'vuepress-plugin-web-vitals',
    enhanceAppFiles: path.resolve(__dirname, 'web-vitals.js'),
})