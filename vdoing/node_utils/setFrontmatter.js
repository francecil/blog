const fs = require('fs'); // 文件模块
const matter = require('gray-matter'); // FrontMatter解析器 https://github.com/jonschlinkert/gray-matter
const jsonToYaml = require('json2yaml')
const chalk = require('chalk') // 命令行打印美化
// const arg = process.argv.splice(2)[0]; // 获取命令行传入的参数
const readFileList = require('./modules/readFileList');
const { type, repairDate, dateFormat } = require('./modules/fn');
const log = console.log
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

const PREFIX = '/pages/'

/**
 * 给 .md 文件设置 frontmatter(标题、日期、永久链接等数据)
 */
async function setFrontmatter(sourceDir, themeConfig) {
  const { category: isCategory, tag: isTag, categoryText = '随笔', extendFrontmatter, patterns, ignoreCategories = [] } = themeConfig
  const files = readFileList(sourceDir, patterns) // 读取所有md文件数据
  // 扩展自定义生成frontmatter
  const extendFrontmatterStr = extendFrontmatter ?
    jsonToYaml.stringify(extendFrontmatter)
      .replace(/\n\s{2}/g, "\n")
      .replace(/"|---\n/g, "")
    : '';
  for (const file of files) {
    let dataStr = fs.readFileSync(file.filePath, 'utf8');// 读取每个md文件内容
    const fileMatterObj = matter(dataStr, {});
    // 是否为草稿文件
    const isDraft = file.name.startsWith('_');
    // 是否为知识卡片
    const isCard = file.filePath.includes('docs/知识卡片');
    // 未定义FrontMatter数据
    if (Object.keys(fileMatterObj.data).length === 0) {
      // 文件的创建时间
      const dateStr = dateFormat(getFileBirthtime(file.filePath));
      const categories = getCategories(
        file,
        categoryText,
        ignoreCategories
      );

      const fmArray = [
        ['title', isDraft ? file.name.slice(1) : file.name],
        ['date', dateStr],
        ['permalink', getPermalink()]
      ]
      if (file.filePath.includes('_posts')) {
        fmArray.push(['sidebar', 'auto'])
      }
      if (!(isCategory === false)) {
        fmArray.push(['categories', categories.reduce((pre, cur) => pre + os.EOL + '  - ' + cur, '')])
      };
      if (!(isTag === false)) {
        fmArray.push(['tags', `${os.EOL}  - `])
      }
      
      if (isCard) {
        fmArray.push(['titleTag', '卡片'])
      } else if (isDraft) {
        fmArray.push(['titleTag', '草稿'])
      }

      let fmData = fmArray.reduce((pre, [key, val]) => {
        return pre + (pre ? os.EOL : '') + `${key}: ${val}`
      }, '')
      if(extendFrontmatterStr) {
        fmData += os.EOL + extendFrontmatterStr
      }

      const finalFmData = `---${os.EOL}${fmData}${os.EOL}---`

      fs.writeFileSync(file.filePath, `${finalFmData}${os.EOL}${fileMatterObj.content}`); // 写入
      log(chalk.blue('tip ') + chalk.green(`write frontmatter(写入frontmatter)：${file.filePath} `))

    } else {
      // 已有FrontMatter
      let matterData = fileMatterObj.data;
      let hasChange = false;

      // 已有FrontMatter，但是没有title、date、permalink、categories、tags数据的
      if (!matterData.hasOwnProperty('title')) { // 标题
        matterData.title = file.name;
        hasChange = true;
      }

      if (!matterData.hasOwnProperty('date')) { // 日期
        matterData.date = dateFormat(getFileBirthtime(file.filePath));
        hasChange = true;
      }

      if (!matterData.hasOwnProperty('permalink')) { // 永久链接
        matterData.permalink = getPermalink();
        hasChange = true;
      }

      if (file.filePath.indexOf('_posts') > -1 && !matterData.hasOwnProperty('sidebar')) { // auto侧边栏，_posts文件夹特有
        matterData.sidebar = "auto";
        hasChange = true;
      }

      // 草稿特殊处理
      if(isDraft && matterData.titleTag !== '草稿') {
        hasChange = true;
        matterData.titleTag = "草稿"
      } 
      if(!isDraft && matterData.titleTag === "草稿") {
        delete matterData.titleTag
        hasChange = true;
      }

      if(isCard &&  matterData.titleTag !== "卡片") {
        hasChange = true;
        matterData.titleTag = "卡片"
      }

      if (!matterData.hasOwnProperty('pageComponent') && matterData.article !== false) { // 是文章页才添加分类和标签
        if (isCategory !== false && !matterData.hasOwnProperty('categories')) { // 分类
          matterData.categories = getCategories(file, categoryText, ignoreCategories)
          hasChange = true;
        }
        if (isTag !== false && !matterData.hasOwnProperty('tags')) { // 标签
          matterData.tags = [''];
          hasChange = true;
        }
      }

      // 扩展自动生成frontmatter的字段
      if (type(extendFrontmatter) === 'object') {
        Object.keys(extendFrontmatter).forEach(keyName => {
          if (!matterData.hasOwnProperty(keyName)) {
            matterData[keyName] = extendFrontmatter[keyName]
            hasChange = true;
          }
        })
      }

      if (hasChange) {
        if (matterData.date && type(matterData.date) === 'date') {
          matterData.date = repairDate(matterData.date) // 修复时间格式
        }
        if(Array.isArray(matterData.tags) && matterData.tags.includes(null)) {
          // 修复 tag 格式
          matterData.tags = matterData.tags.map(v => v === null ? '' : v)
        }
        const newData = jsonToYaml.stringify(matterData).replace(/\n\s{2}/g, "\n").replace(/"/g, "") + '---' + os.EOL + fileMatterObj.content;
        fs.writeFileSync(file.filePath, newData); // 写入
        log(chalk.blue('tip ') + chalk.green(`write frontmatter(写入frontmatter)：${file.filePath} `))
      }

    }
  }

}

// 
/**
 * 获取分类数据
 * @param {*} file 
 * @param {*} categoryText 碎片化文章分类名
 * @param {*} ignoreCategories 忽略的分类名
 * @returns 
 */
function getCategories(file, categoryText, ignoreCategories) {
  let categories = []
  if (file.filePath.indexOf('_posts') === -1) {
    // 不在_posts文件夹
    let filePathArr = file.filePath.split(path.sep) // path.sep用于兼容不同系统下的路径斜杠
    filePathArr.pop()

    let ind = filePathArr.indexOf('docs')
    if (ind !== -1) {
      while (filePathArr[++ind] !== undefined) {
        const item = filePathArr[ind]
        const firstDotIndex = item.indexOf('.');
        categories.push(item.substring(firstDotIndex + 1) || '') // 获取分类
      }
    }
  } else {
    // 碎片化文章的分类生成
    const matchResult = file.filePath.match(/_posts\/(\S*)\//);
    const resultStr = matchResult ? matchResult[1] : ''
    const resultArr = resultStr.split('/').filter(Boolean)

    if (resultArr.length) {
      categories.push(categoryText, ...resultArr)
    } else {
      categories.push(categoryText)
    }
  }
  return categories.filter((cg => !ignoreCategories.some(ignReg => ignReg.test(cg))))
}

// 获取系统文件创建时间
function getSystemBirthtime(stat) {
  // 在一些系统下无法获取birthtime属性的正确时间，使用atime代替
  return stat.birthtime.getFullYear() != 1970 ? stat.birthtime : stat.atime
}

// 定义永久链接数据
function getPermalink() {
  return `${PREFIX + (Math.random() + Math.random()).toString(16).slice(2, 8)}/`
}

/** 获取文件创建时间 */
function getFileBirthtime(filePath) {
  const gitFileInitTime = execSync(`git log --follow --format=%ad -- "${filePath.replace(/"/g, '\\"')}" | tail -1`, {
    encoding: 'utf8'
  })
  if (gitFileInitTime) {
    return new Date(gitFileInitTime)
  }
  const stat = fs.statSync(filePath);
  return getSystemBirthtime(stat)
}


module.exports = setFrontmatter;
module.exports.getCategories = getCategories