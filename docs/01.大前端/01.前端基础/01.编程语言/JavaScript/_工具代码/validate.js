// 验证账号格式 常见字符 6-12位
function validateAccount (str) {
  return isCommonChars(str) && checkLength(str, 12, 6)
}
// 验证密码格式 8-12位，至少使用大小写字母、数字和符号中的两种组合
function validatePassword (str) {
  let getStrong = (pw) => {
    let arr = new Array(4).fill(0);
    [...pw].forEach((item, index) => {
      if (isLowercaseChar(item)) {
        arr[0] = 1
      } else if (isUppercaseChar(item)) {
        arr[1] = 1
      } else if (isNumberChar(item)) {
        arr[2] = 1
      } else if (isOtherChar(item)) {
        arr[3] = 1
      }
    })
    return arr.reduce((next, cur) => next + cur)
  }
  return isCommonChars(str) && getStrong(str) >= 2 && checkLength(str, 12, 8)
}
function validateEmail (str) {
  if (notString(str)) return false
  const reg = /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/
  return reg.test(str)
}
/* 手机号 */
function validateCell (str) {
  if (notString(str)) return false
  const reg = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
  return reg.test(str)
}
/* 固话号码:(区号+)座机号码(+分机号码)  */
function validateTel (str) {
  if (notString(str)) return false
  const reg = /^(0[0-9]{2,3}-)?([2-9][0-9]{6,7})+(-[0-9]{1,4})?$/
  return reg.test(str)
}

/* 正数 */
function isPositiveNumber (str) {
  if (isNull(str)) return false
  const reg = /^\d+(?=\.{0,1}\d+$|$)/
  return reg.test(str)
}
/* 正整数 */
function isPositiveInteger (str) {
  if (isNull(str)) return false
  const reg = /^[0-9]+$/
  return reg.test(str)
}
/* 验证版本号 */
function validateVersion (str) {
  if (isNull(str)) return false
  const reg = /^\d+(\.\d+)*$/
  return reg.test(str)
}
/* 验证应用包名 xx.xx.xx */
function validatePackageName (str) {
  if (notString(str)) return false
  const reg = /^[a-zA-Z0-9]+(\.[a-zA-Z0-9]+)+$/
  return reg.test(str)
}
/* 验证url  */
function validateUrl (str) {
  if (notString(str)) return false
  const reg = /^(https?):/
  return reg.test(str)
}
/** 验证日期格式 yyyy-M(M)-d(d) or yyyy/M(M)/d(d) */
function validateDate (str) {
  if (notString(str)) return false
  // const reg = /^((((1[6-9]|[2-9]\d)\d{2})-(0?[13578]|1[02])-(0?[1-9]|[12]\d|3[01]))|(((1[6-9]|[2-9]\d)\d{2})-(0?[13456789]|1[012])-(0?[1-9]|[12]\d|30))|(((1[6-9]|[2-9]\d)\d{2})-0?2-(0?[1-9]|1\d|2[0-8]))|(((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|((16|[2468][048]|[3579][26])00))-0?2-29-))$/
  // return reg.test(str)
  // 上面的方法效率较低
  let result = str.match(/^(\d{4})(-|\/)(\d{1,2})\2(\d{1,2})$/) // '2016-11-16' =>["2016-11-16", "2016", "-", "11", "16"]
  if (!result) return false
  let d = new Date(result[1], result[3] - 1, result[4])
  return d.getFullYear() === parseInt(result[1]) && (d.getMonth() + 1) === parseInt(result[3]) && d.getDate() === parseInt(result[4])
}
function validateCompanyType (str) {
  let list = ['应用商店', '游戏厂商', '广告联盟', '其他类型']
  return list.indexOf(str) !== -1
}
/**
 * 验证角色是否拥有合适的权限
 * @param {*} role
 * @param {*} permissions
 */

function validateRoleMenus (role, permissions) {
  if (!Array.isArray(permissions)) return false
  let adminMenus = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
  let userMenus = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13]
  if (role === 'user') {
    return permissions.every((v) => userMenus.indexOf(v) !== -1)
  } else if (role === 'admin') {
    return permissions.every((v) => adminMenus.indexOf(v) !== -1)
  }
  return false
}
function validateRoleName (str) {
  return checkLength(str, 20, 1)
}
// 用户姓名
function validateUserName (str) {
  return checkLength(str, 45, 1)
}
// 客户类型
function isCompanyType (str) {
  if (notString(str)) return false
  let list = ['应用商店', '游戏厂商', '广告联盟', '其他类型']
  return list.indexOf(str) !== -1
}
module.exports = {
  validateAccount,
  validatePassword,
  validateEmail,
  validateCell,
  validateTel,
  isPositiveNumber,
  isPositiveInteger,
  validateVersion,
  validatePackageName,
  validateUrl,
  validateDate,
  validateCompanyType,
  validateRoleMenus,
  validateRoleName,
  validateUserName,
  checkLength,
  isCompanyType
}
/**
 * 工具方法
 *
 */
// 除空格外的常见字符串
function isCommonChars (str) {
  if (notString(str)) return false
  return /^[\x21-\x7E]+$/.test(str)
}
function notString (str) {
  return !(typeof str === 'string' || str instanceof String)
}
function isNull (str) {
  return str === null || str === undefined
}
function isLowercaseChar (c) {
  return /^[a-z]$/.test(c)
}
function isUppercaseChar (c) {
  return /^[A-Z]$/.test(c)
}
function isNumberChar (c) {
  return /^[0-9]$/.test(c)
}
// 匹配特殊字符
function isOtherChar (c) {
  return /^(?![a-zA-Z0-9])[\x21-\x7E]$/.test(c)
}
/**
 *
 * @param {*} str
 * @param {*} max 字符串最大长度
 * @param {*} min 字符串最短长度
 */

function checkLength (str, max = 255, min = 0) {
  if (notString(str)) return false
  let reg = new RegExp(`^.{${min},${max}}$`)
  return reg.test(str)
}
