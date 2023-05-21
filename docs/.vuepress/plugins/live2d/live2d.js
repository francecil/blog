export default () => {
    if (typeof window !== "undefined") {
        // 窄屏不展示
        if(window.innerWidth <= 800) {
            return;
        }
        // 页面 load 后再加载
        window.addEventListener('load', () => {
            const model = LIVE2D_MODEL
            const canvas = document.createElement('canvas')
            canvas.id = "live2d"
            canvas.style = "position: fixed; right: 50px; bottom: 40px";
            canvas.width = 180
            canvas.height = 150
            document.body.appendChild(canvas)
            
            const script = document.createElement('script')
            script.src = 'https://cdn.jsdelivr.net/gh/francecil-public/live2dDemo@latest/live2d.js'
            script.async = true
            script.onload = () => {
                window.loadlive2d("live2d", `https://cdn.jsdelivr.net/gh/francecil-public/live2dDemo/assets/${model}/${model}.model.json`);
            }
            document.body.appendChild(script)
        })
    }
}