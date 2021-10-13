const fs = require('fs')
const path = require('path')

const contents = fs.readFileSync(path.resolve(__dirname, '../node_modules/jsonlint/web/jsonlint.js'))
const str = contents.toString()
const code = str.replace('var jsonlint', '/* eslint-disable */\nwindow.jsonlint')
fs.writeFileSync(path.resolve(__dirname, '../src/visual/components/json-code/jsonlint.js'), code)
