```json
// 将设置放入此文件中以覆盖默认设置
{
    "editor.fontSize": 12,
    "editor.tabSize": 2,
    "files.associations": {
        "*.vue": "vue"
    },
    "eslint.autoFixOnSave": true,
    "eslint.options": {
        "extensions": [
            ".js",
            ".vue"
        ]
    },
    "eslint.validate": [
        "javascript",
        "javascriptreact",
        "html",
        {
            "language": "vue",
            "autoFix": true
        }
    ],
    "vetur.validation.template": false,
    "vetur.format.defaultFormatterOptions": {
        "js-beautify-html": {
            // 属性列太长才折行,默认的force-expand-multiline不美观
            "wrap_attributes": "auto"
        },
        "prettier": {
          //去掉代码结尾分号
          "semi": false,
          //使用eslint的代码格式进行校验
          "eslintIntegration": true,
          //采用单引号
          "singleQuote": true
        }
    },
    //格式化.vue中html，js
    "vetur.format.defaultFormatter.html": "js-beautify-html",
    "vetur.format.defaultFormatter.js": "vscode-typescript",
    //让函数(名)和后面的括号之间加个空格
    "javascript.format.insertSpaceBeforeFunctionParenthesis": true,
    "search.exclude": {
        "**/Node_modules": true,
        "**/bower_components": true,
        "**/dist": true
    },
    "git.confirmSync": false,
    "window.zoomLevel": 0,
    "editor.renderWhitespace": "boundary",
    "editor.cursorBlinking": "smooth",
    "editor.minimap.enabled": true,
    "editor.minimap.renderCharacters": false,
    "editor.fontFamily": "'Droid Sans Mono', 'Courier New', monospace, 'Droid Sans Fallback'",
    "window.title": "${dirty}${activeEditorMedium}${separator}${rootName}",
    "editor.codeLens": true,
    "editor.snippetSuggestions": "top",
    "workbench.colorTheme": "Solarized Light",
    "extensions.ignoreRecommendations": false,
    // py
    "python.pythonPath": "D:/python36/python.exe",
    "python.linting.flake8Enabled": true,
    "python.formatting.provider": "yapf",
    "git.enableSmartCommit": true,
    "explorer.confirmDelete": false,
    "files.autoSave": "off",
    "breadcrumbs.enabled": true
}
```
