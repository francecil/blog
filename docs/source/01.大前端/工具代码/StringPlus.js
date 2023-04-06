/**
 * 字符串每个字符的ascii码加1
 * 
 * @param {any} str 
 * @param {boolean} onlySimple 字符ascii码是否仅在33-126之间
 * @returns 
 * @example charPlusOne("abc") => bcd
 */
function charPlusOne(str,onlySimple){
  let asciiPlus = v=>onlySimple?(v-33+1)%94+33:v+1;
  return [...str].map(v=>String.fromCharCode(asciiPlus(v.charCodeAt(0)))).reduce((cur,sum)=>cur+sum)
}