import ejs from 'ejs'

let Gitalk, Valine;

/**
 * Lazy load pkg
 * 
 * @param {String} name 
 */
export function loadScript(name) {
  if (name === 'valine') {
    // import('valine')
    // .then(pkg => Valine = pkg.default)
  } else if (name === 'gitalk') {
    import('gitalk/dist/gitalk.css')
      .then(() => import('gitalk'))
      .then(pkg => Gitalk = pkg.default)
  } else if (name === 'utterances') {
    // nothing todo
  }
}

/**
 * Render ejs strings in configuration
 * 
 * @param {Object} config 
 * @param {Object} data 
 */
export function renderConfig(config, data) {
  const result = {}

  Reflect.ownKeys(config)
    .forEach(key => {
      if (typeof config[key] === 'string') {
        try {
          result[key] = ejs.render(config[key], data)
        } catch (error) {
          console.warn(`Comment config option error at key named "${key}"`)
          console.warn(`More info: ${error.message}`)
          result[key] = config[key]
        }
      } else {
        result[key] = config[key]
      }
    })

  return result
}

/**
 * Support Gitalk and so on.
 */
export const provider = {
  gitalk: {
    render(frontmatter, commentDomID) {
      const commentDOM = document.createElement('div')
      commentDOM.id = commentDomID

      const parentDOM = document.querySelector(COMMENT_CONTAINER)
      parentDOM.appendChild(commentDOM)

      const gittalk = new Gitalk(renderConfig(COMMENT_OPTIONS, { frontmatter }))
      gittalk.render(commentDomID)
    },
    clear(commentDomID) {
      const last = document.querySelector(`#${commentDomID}`)
      if (last) {
        last.remove()
      }
      return true
    }
  },
  valine: {
    render(frontmatter, commentDomID) {
      const commentDOM = document.createElement('div')
      commentDOM.id = commentDomID

      const parentDOM = document.querySelector(COMMENT_CONTAINER)
      parentDOM.appendChild(commentDOM)

      new Valine({
        ...renderConfig(COMMENT_OPTIONS, { frontmatter }),
        el: `#${commentDomID}`
      })
    },
    clear(commentDomID) {
      const last = document.querySelector(`#${commentDomID}`)
      if (last) {
        last.remove()
      }
      return true
    }
  },
  utterances: {
    render(frontmatter, commentDomID) {
      const commentDOM = document.createElement('div')
      commentDOM.id = commentDomID

      const parentDOM = document.querySelector(COMMENT_CONTAINER)
      parentDOM.appendChild(commentDOM)

      const utterances = document.createElement('script')
      utterances.type = 'text/javascript'
      utterances.async = true
      utterances.setAttribute('issue-term', COMMENT_OPTIONS.issueTerm)
      utterances.setAttribute('issue-label', COMMENT_OPTIONS.issueTerm)
      utterances.setAttribute('theme', COMMENT_OPTIONS.theme)
      utterances.setAttribute('repo', COMMENT_OPTIONS.repo)
      utterances.setAttribute('comment-order', COMMENT_OPTIONS.commentOrder || 'desc')
      utterances.setAttribute('input-position', COMMENT_OPTIONS.inputPosition || 'top')
      utterances.setAttribute('loading', COMMENT_OPTIONS.loading || 'false')
      utterances.setAttribute('branch', COMMENT_OPTIONS.branch || 'master')
      utterances.crossorigin = 'anonymous'
      utterances.src =
        COMMENT_OPTIONS.service === 'beaudar'
          ? 'https://beaudar.lipk.org/client.js'
          : 'https://utteranc.es/client.js'
      if (commentDOM.hasChildNodes()) {
        commentDOM.innerHTML = ''
      }
      commentDOM.appendChild(utterances)
    },
    clear(commentDomID) {
      const last = document.querySelector(`#${commentDomID}`)
      if (last) {
        last.remove()
      }
      return true
    }
  }
}