/**
 *  读取所有md文件数据
 */
const path = require('path'); // 路径模块
const docsRoot = path.join(__dirname, '..', '..', 'docs'); // docs文件路径

const { globSync } = require('glob');

/**
 * 获取 blog 文件列表
 * @param {*} dir 
 * @param {*} patterns 
 * @returns 
 */
function readFileList(dir = docsRoot, patterns = ["**/!(_)*/!(README).md"]) {
  const files = globSync(patterns, { cwd: dir, ignore: ['node_modules/**', '.vuepress/**', '@pages/**', '@assets/**'] }).map((_filePath) => {
    const filePath = path.join(dir, _filePath)
    const filename = path.basename(filePath)
    const fileNameArr = filename.split('.')

    if (fileNameArr.length <= 2) {
      return {
        name: fileNameArr[0],
        type: fileNameArr[1],
        filePath
      }
    }
    const fileType = fileNameArr.pop()
    // 序号开头的文件
    if (/^\d+$/.test(fileNameArr[0])) {
      fileNameArr.shift();
    }
    return {
      name: fileNameArr.join('.'),
      type: fileType,
      filePath,
    }
  })
  return files
}

module.exports = readFileList;
