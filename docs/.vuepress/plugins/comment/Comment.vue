<template>
  <div></div>
</template>

<script>
import { provider } from "./util";

const commentDomID = "vuepress-plugin-comment";
let timer = null;

export default {
  mounted() {
    window.addEventListener("load", () => {
      const frontmatter = {
        to: {},
        from: {},
        ...this.$frontmatter,
      };
      this.initComment(frontmatter);
    });

    this.$router.afterEach((to, from) => {
      if (to && from && to.path === from.path) {
        return;
      }
      const frontmatter = {
        to,
        from,
        ...this.$frontmatter,
      };
      this.initComment(frontmatter);
    });
  },
  methods: {
    initComment: function (frontmatter) {
      clear() && needComment(frontmatter) && renderComment(frontmatter);
    },
  },
};

/**
 * Clear last page comment dom
 */
function clear(frontmatter) {
  switch (COMMENT_CHOOSEN) {
    case "gitalk": {
      return provider.gitalk.clear(commentDomID);
    }

    case "valine":
    case "utterances": {
      let el = COMMENT_OPTIONS.el || commentDomID;
      if (el.startsWith("#")) {
        el = el.slice(1);
      }
      return provider[COMMENT_CHOOSEN].clear(el);
    }

    default:
      return false;
  }
}

/**
 * Check if current page needs render comment
 */
function needComment(frontmatter) {
  return frontmatter.comment !== false && frontmatter.comments !== false;
}

/**
 * Render comment dom and append it to container
 */
function renderComment(frontmatter) {
  clearTimeout(timer);

  const parentDOM = document.querySelector(COMMENT_CONTAINER);
  if (!parentDOM) {
    timer = setTimeout(() => renderComment(frontmatter), 200);
    return;
  }

  switch (COMMENT_CHOOSEN) {
    case "gitalk": {
      return provider.gitalk.render(frontmatter, commentDomID);
    }

    case "valine":
    case "utterances": {
      let el = COMMENT_OPTIONS.el || commentDomID;
      if (el.startsWith("#")) {
        el = el.slice(1);
      }
      return provider[COMMENT_CHOOSEN].render(frontmatter, el);
    }

    default:
      return false;
  }
}
</script>
