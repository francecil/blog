import Comment from './Comment.vue'
import { loadScript } from './util'

export default ({ Vue }) => {
  Vue.component('Comment', Comment)
  if (typeof window !== "undefined") {
    window.addEventListener('load', () => {
      loadScript(COMMENT_CHOOSEN)
    })
  }
}