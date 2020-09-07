
```js
import CodeMirror from "@uiw/react-codemirror";
import "codemirror/keymap/sublime";
import "codemirror/theme/monokai.css";

// 括号匹配和补全
import 'codemirror/addon/edit/closebrackets.js';
import 'codemirror/addon/edit/matchbrackets.js';

// 进行错误提示
import 'codemirror/addon/lint/lint.js';
import 'codemirror/addon/lint/lint.css';
import 'codemirror/addon/lint/javascript-lint.js';
(window as any).JSHINT = require('jshint').JSHINT;


  const codeMirrorConfig = useMemo(() => ({
    theme: "monokai",
    keyMap: "sublime",
    mode: "javascript",
    lineNumbers: true,
    autoCloseBrackets: true,
    matchBrackets: true,
    lint: {
      esversion: 6
    },
  }), [])

  <CodeMirror
            value={config.value}
            onChange={onEditorChange}
            options={codeMirrorConfig}
          />
```
