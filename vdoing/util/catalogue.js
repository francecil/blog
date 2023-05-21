

/**
 * 找到指定目录路径的目录数据
 * @param {*} catalogueKey 
 * @param {*} sidebar 
 * @returns 
 */
export const getScopedCatalogueList = (catalogueKey, sidebar) => {
    let keyArray = catalogueKey.split('/');
    // 第一维度的目录列表
    let currentCatalogueList = sidebar[`/${keyArray[0]}/`]
    keyArray.shift();
    for (const currentKey of keyArray) {
        // 如有数字前置则进行过滤
        const dirKey = currentKey.match(/(\d+\.)?(.*)/)[2]
        currentCatalogueList = currentCatalogueList.find(cata => cata.title === dirKey)
    }

    if (!currentCatalogueList) {
        console.error('未获取到目录数据，请查看 front matter 中设置的path是否正确。')
    }
    return currentCatalogueList
}

const getMdNodeContent = (catalogue) => {
    if (Array.isArray(catalogue)) {
        return `<a class="m-markmap-pagenode" href="${catalogue[2]}">${catalogue[1]}<a>`
    } else {
        return `<div class="m-markmap-dirnode">${catalogue.title}</div>`
    }
}
const getLevelMdContent = (level) => {
    const maxMdLevel = 6
    if (level <= maxMdLevel) {
        return "#".repeat(level) + ' '
    }
    return "\r".repeat(maxMdLevel - 6) + '-'
}

/**
 * 将目录信息转为 Markdown 内容
 * @param {*} title 
 * @param {*} catalogueList 
 * @returns 
 */
export const getMdContent = (title, catalogueList) => {
    let content = `# ${title}\n`
    const dfsCatalogue = (catalogue, level) => {
        content += getLevelMdContent(level) + getMdNodeContent(catalogue) + '\n'
        if (!Array.isArray(catalogue) && catalogue.children) {
            catalogue.children.forEach((c) => {
                dfsCatalogue(c, level + 1)
            })
        }

    }
    catalogueList.forEach((catalogue) => {
        dfsCatalogue(catalogue, 2)
    })
    return content
}