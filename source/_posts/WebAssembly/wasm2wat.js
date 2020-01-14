/**
 * WebAssembly 的二进制格式转文本格式
 * 需要借助 libwabt.js
 * @param [Uint8Array] contents
 * @example 
 * compile(new Uint8Array( [0, 97, 115, 109, 1, 0, 0, 0, 1, 12, 2, 96, 2, 127, 127, 1, 127, 96, 1, 127, 1, 127, 3, 3, 2, 0, 1, 7, 16, 2, 3, 97, 100, 100, 0, 0, 6, 115, 113, 117, 97, 114, 101, 0, 1, 10, 19, 2, 8, 0, 32, 0, 32, 1, 106, 15, 11, 8, 0, 32, 0, 32, 0, 108, 15, 11]))
 */
async function compile (contents, options = {}) {
  if (!contents) {
    return;
  }
  await initWabtModule()
  const { readDebugNames = true, generateNames = true, foldExprs = true, inlineExport = true } = options

  WabtModule().then(function (wabt) {
    try {
      var module = wabt.readWasm(contents, { readDebugNames: readDebugNames });
      if (generateNames) {
        module.generateNames();
        module.applyNames();
      }
      var result = module.toText({ foldExprs: foldExprs, inlineExport: inlineExport });
      console.log(result)
      return result
    } catch (e) {
      console.warn(e)
    } finally {
      if (module) module.destroy();
    }
  });
}
async function initWabtModule () {
  return new Promise((resolve) => {
    if (typeof WabtModule !== "undefined") {
      resolve()
      return
    }
    let script = document.createElement("script")
    script.src = "https://fe-examples.github.io/WebAssembly/lib/libwabt.js"
    document.body.appendChild(script)
    script.onload = function () {
      resolve()
    }
  })
}
