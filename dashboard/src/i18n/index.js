const parse = require('csv-parse/lib/sync')
const fs = require('fs-extra')
const path = require('path')
const prettier = require('prettier')

function zhTmpl(record) {
  return `"${record.zh}": {
    "msgid": "${record.zh}",
    "msgstr": [""]
  }`
}

function enTmpl(record) {
  return `"${record.zh}": {
    "msgid": "${record.zh}",
    "msgstr": ["${record.en.replace(/"/g, '\\"')}"]
  }`
}

function langTmpl(lang, content = []) {
  return `"${lang}": {
    "charset": "utf-8",
    "translations": {
      "": {${content.join(',')}}
    }
  }`
}

function genI18nJson(recordList) {
  const LANG_TYPES = {'zh-CN': zhTmpl, en: enTmpl}
  const langs = Object.keys(LANG_TYPES)
  const result = []
  for (const lang of langs) {
    const formatList = recordList.map(r => LANG_TYPES[lang](r))
    result.push(langTmpl(lang, formatList))
  }
  return `{${result.join(',')}}`
}

async function main() {
  const transFile = path.join(__dirname, 'translated.csv')
  const content = await fs.readFile(transFile, 'utf8')
  const recordList = parse(content, {
    columns: ['zh', 'en'],
    delimiter: ',',
  })
  const result = genI18nJson(recordList)

  prettier.check(result, {parser: 'json'})
  await fs.writeFile(
    path.join(__dirname, '../assets/locales.json'),
    prettier.format(JSON.stringify(JSON.parse(result)), {parser: 'json'})
  )
  console.log('============== finish generate i18n locales.json file ==============')
}

if (typeof require !== 'undefined' && require.main === module) {
  main()
}
