import path from 'path';

/**
 * 收集 pv/uv 并上报 vercel
 */
export default (opts, ctx) => ({
    name: 'vuepress-plugin-audiences',
    enhanceAppFiles: path.resolve(__dirname, 'audiences.js'),
})