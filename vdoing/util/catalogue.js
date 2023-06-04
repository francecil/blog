/**
 * 找到指定目录路径的目录数据
 * @param {*} catalogueKey
 * @param {*} sidebar
 * @returns
 */
export const getScopedCatalogueTreeData = (catalogueKey, sidebar) => {
  let keyArray = catalogueKey.split("/");
  // 第一维度的目录列表
  let currentCatalogueList = sidebar[`/${keyArray[0]}/`];
  keyArray.shift();
  for (const currentKey of keyArray) {
    // 如有数字前置则进行过滤
    const dirKey = currentKey.match(/(\d+\.)?(.*)/)[2];
    const currentCatalogue = currentCatalogueList.find(
      (cata) => cata.title === dirKey
    );
    currentCatalogueList = currentCatalogue && currentCatalogue.children;
  }

  if (!currentCatalogueList) {
    console.error(
      "未获取到目录数据，请查看 front matter 中设置的path是否正确。"
    );
    return [];
  }
  return convertTreeData(currentCatalogueList);
};

export const convertTreeData = (currentCatalogueList, keyLevel = "") => {
  return currentCatalogueList.reduce((newArr, cur, index) => {
    const item = {
      key: keyLevel ? `${keyLevel}-${index + 1}` : `${index + 1}`,
      title: Array.isArray(cur) ? cur[1] : cur.title,
    };
    // 叶子节点
    if (Array.isArray(cur)) {
      item.isLeaf = true;
      item.extra = {
        link: cur[2],
        titleTag: cur[3],
      };
      item.scopedSlots = {
        title: "leftCustom",
      };
      item.selectable = false;
    } else {
      // 目录节点
      item.scopedSlots = {
        title: "dirCustom",
      };
      if (cur.children && cur.children.length > 0) {
        item.children = convertTreeData(cur.children, item.key);
      }
    }
    newArr.push(item);
    return newArr;
  }, []);
};

const getMdNodeContent = (catalogue) => {
  if (catalogue.isLeaf) {
    return `<a class="m-markmap-pagenode" target="_blank" href="${
      catalogue.extra.link
    }">📄 ${catalogue.title} ${
      catalogue.extra.titleTag
        ? `  <span class="catalogue__title-tag">${catalogue.extra.titleTag}</span>`
        : ""
    }<a>`;
  } else {
    return `<div class="m-markmap-dirnode">${catalogue.title}</div>`;
  }
};
const getLevelMdContent = (level) => {
  const maxMdLevel = 6;
  if (level <= maxMdLevel) {
    return "#".repeat(level) + " ";
  }
  return "\r".repeat(maxMdLevel - 6) + "-";
};

/**
 * 将目录信息转为 Markdown 内容
 * @param {*} title
 * @param {*} catalogueTreeData
 * @returns
 */
export const getMdContent = (title, catalogueTreeData) => {
  let content = `# ${title}\n`;
  const dfsCatalogue = (catalogue, level) => {
    content += getLevelMdContent(level) + getMdNodeContent(catalogue) + "\n";
    if (catalogue.children) {
      catalogue.children.forEach((c) => {
        dfsCatalogue(c, level + 1);
      });
    }
  };
  catalogueTreeData.forEach((catalogue) => {
    dfsCatalogue(catalogue, 2);
  });
  return content;
};

/**
 * 获取包含搜索关键字的父节点
 * @param {*} keyword
 * @param {*} tree
 */
export const getParentKeysContainKeywork = (keyword, tree) => {
  const keys = [];
  if (tree.children && tree.children.length > 0) {
    if (tree.children.some((sub) => sub.title.includes(keyword))) {
      keys.push(tree.key);
    }
    const childrenKeys = tree.children.reduce((pre, cur) => {
      return [...pre, ...getParentKeysContainKeywork(keyword, cur)]
    }, [])
    
    keys.push(...childrenKeys);
  }
  return keys;
};
