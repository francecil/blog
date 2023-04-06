const numStr = Symbol.for('numStr')
const commonLowercaseStr = Symbol.for('commonLowercaseStr')
const otherLowercaseStr = Symbol.for('otherLowercaseStr')
const commonCapital = Symbol.for('commonCapital')
const useConstructorCapital = Symbol.for('useConstructorCapital')
const commonSign = Symbol.for('commonSign')
const otherChar = Symbol.for('otherChar')
const string_null_error = Symbol.for('string_null_error')
const string_multitype_error = Symbol.for('string_multitype_error')

var StringBuilder = (function () {
  let instance
  let builder = {}
  let init = function (name) {
    builder[0] = '1^1'
    builder[1] = '1|1'
    builder[2] = '-~1'
    builder[3] = '-~1|1'
    builder[4] = '-~1<<1'
    builder[5] = '11>>1'
    builder[6] = '(11+1)>>1'
    builder[7] = '11>>1|-~1'
    builder[8] = '11^(-~1|1)'
    builder[9] = '11^(1<<1)'
    builder[12] = '11+1'
    builder['false'] = '!1+[]'
    builder['true'] = '!!1+[]'
    builder['Infinity'] = '1/[]+[]'
    builder['NaN'] = '[]/[]+[]'
    builder['[object Object]'] = '[]+{}'
    builder['undefined'] = '[]+/^/[1]'
    builder['a'] = `(${builder['false']})[${builder[1]}]`
    builder['b'] = `(${builder['[object Object]']})[${builder[2]}]`
    builder['c'] = `(${builder['[object Object]']})[${builder[5]}]`
    builder['d'] = `(${builder['undefined']})[${builder[2]}]`
    builder['e'] = `(${builder['true']})[${builder[3]}]`
    builder['f'] = `(${builder['false']})[${builder[0]}]`
    builder['i'] = `(${builder['undefined']})[${builder[5]}]`
    builder['j'] = `(${builder['[object Object]']})[${builder[3]}]`
    builder['l'] = `(${builder['false']})[${builder[2]}]`
    builder['n'] = `(${builder['Infinity']})[${builder[1]}]`
    builder['o'] = `(${builder['[object Object]']})[${builder[1]}]`
    builder['r'] = `(${builder['true']})[${builder[1]}]`
    builder['s'] = `(${builder['false']})[${builder[3]}]`
    builder['t'] = `(${builder['true']})[${builder[0]}]`
    builder['u'] = `(${builder['undefined']})[${builder[0]}]`
    builder['y'] = `(${builder['Infinity']})[${builder[7]}]`
    builder['I'] = `(${builder['Infinity']})[${builder[0]}]`
    builder['N'] = `(${builder['NaN']})[${builder[0]}]`
    builder['O'] = `(${builder['[object Object]']})[${builder[8]}]`
    builder['constructor'] = handleStrByType('constructor')
    //let $_$=builder['constructor']
    builder['A'] = `([][$_$}]+[])[${builder[9]}]`
    builder['B'] = `((!!1)[$_$]+[])[${builder[9]}]`
    builder['E'] = `(/\\/[$_$]+[])[${builder[9]}]`
    builder['F'] = `((()=>{})[$_$]+[])[${builder[9]}]`
    builder['R'] = `(/\\/[$_$]+[])[${builder[12]}]`
    builder['S'] = `(([]+1)[$_$]+[])[${builder[9]}]`
    builder['fromCodePoint'] = handleStrByType('fromCodePoint')
    return {
      handleStr: function (str) {
        let arr = split(str)
        let source = packArrToSource(arr)
        let result = getSign(source)
      }
    }
  }
  /**
   * 
   * 将字符串进行分割
   * 
   * @param {any} str 
   * @returns 分割后的数组
   */
  function split(str) {
    if (!str || str.length === 0) throw { type: string_null_error, message: '字符串为空' }
    let arr = []
    let last = ""
    for (let c of str) {
      try {
        let curType = getTypeOf(c)
        if (last.length === 0) {
          if (curType === numStr || curType === commonLowercaseStr || curType === otherLowercaseStr) {
            last = c
          } else {
            arr.push(c)
          }
        } else {
          //last必为数字或小写字母串
          let lastType = getTypeOf(last)
          if (curType === lastType || (lastType !== numStr && (curType === commonLowercaseStr || curType === otherLowercaseStr))) {
            last += c
          } else {
            arr.push(last)
            last = ""
            if (curType === numStr || curType === commonLowercaseStr || curType === otherLowercaseStr) {
              last = c
            } else {
              arr.push(c)
            }
          }
        }
      } catch (error) {
        console.error(`字符为${c}`)
        throw error
      }
    }
    if (last !== "") arr.push(last);
    return arr
  }
  /**
   * 将数组每个元素进行包装，生成数据源
   * 
   * @param {any} arr 
   */
  function packArrToSource(arr) {
    let obj = {
      [numStr]: 0,
      [commonLowercaseStr]: 0,
      [otherLowercaseStr]: 0,
      [commonCapital]: 0,
      [useConstructorCapital]: 0,
      [commonSign]: 0,
      [otherChar]: 0,
      arr: []
    }
    arr.forEach((e) => {
      let curTemp = getTypeOf(e)
      obj[curTemp] += 1
      obj.arr.push({
        oriStr: e,
        type: curTemp,
        transStr: ''
      })
    }, this);
    return obj
  }
  /**
   * 获取字符串所属类型
   * 
   * @param {any} str 
   * @returns 
   */
  function getTypeOf(str) {
    if (!str || str.length === 0) throw { type: string_null_error, message: '字符串为空' }
    if (/^\d+$/.test(str)) return numStr;
    if (/^[abcdefijlnorstuy]+$/.test(str)) return commonLowercaseStr;
    if (/^[a-z]+$/.test(str)) return otherLowercaseStr;
    if (/^[INO]+$/.test(str)) return commonCapital;
    if (/^[ABEFRS]+$/.test(str)) return useConstructorCapital;
    if (/^((?=[\x21-\x7e])[^A-Za-z0-9])$/.test(str)) return commonSign;
    //存在多个字符，报错：有多种类型，需要重新split
    if (Array.from(str).length !== 1) throw { type: string_multitype_error, message: '存在多种类型' }
    return otherChar;
  }
  /**
   * 获取初始化字符串，并对source进行2个属性的设置
   * otherLowercaseStr>0 初始化$_$=constructor的组合串
   * otherChar>0 初始化$_1=fromCodePoint的组合串
   * 
   * @param {any} source 
   */
  function getSign(source) {
    //otherLowercaseStr>0 初始化$_$=constructor的组合串
    //otherChar>0 初始化$_1=fromCodePoint的组合串
    let result = ""
    if (source[otherLowercaseStr] > 0 || source[useConstructorCapital] > 0 || source[otherChar] > 0) {
      source['useConstructor'] = '$_$=' + builder['constructor']
      result += source['useConstructor'] + ';'
    }
    if (source[otherChar] > 0) {
      source['useFromCodePoint'] = '$_1=' + builder['fromCodePoint']
      result += source['useFromCodePoint'] + ';'
    }
    return result
  }
  /**
   * 将原串根据类型生成返回组合串
   * 
   * @param {any} str 
   * @param {any} type 
   * @returns 
   */
  function handleStrByType(str, type) {
    type = type || getTypeOf(str)
    switch (type) {
      case numStr: return handleNumStr(str);
      case commonLowercaseStr: return handleCommonLowercaseStr(str);
      case otherLowercaseStr: return handleOtherLowercaseStr(str);
      case commonCapital: return handleCommonCapital(str);
      case useConstructorCapital: return handleUseConstructorCapital(str);
      case commonSign: return handleCommonSign(str);
      case otherChar: return handleOtherChar(str);
    }
  }
  function handleNumStr() {

  }
  function handleCommonLowercaseStr(str) {
    return Array.from(str, c => obj[c]).reduce((tot, cur) => tot + '+' + cur)
  }
  function handleOtherLowercaseStr() {

  }
  function handleCommonCapital() {

  }
  function handleUseConstructorCapital() {

  }
  function handleCommonSign() {

  }
  function handleOtherChar() {

  }
  //修改源的
  function setSourceBuilder(s,str){

  }
  return {
    getInstance: function () {
      return instance || (instance = init())
    }
  }
})()
export default StringBuilder