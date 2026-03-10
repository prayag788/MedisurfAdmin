const fs = require('fs')
const glob = require('glob')
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const generator = require('@babel/generator').default
const t = require('@babel/types')

function transformFile(file) {
  const src = fs.readFileSync(file, 'utf8')
  let ast
  try {
    ast = parser.parse(src, { sourceType: 'module', plugins: ['jsx', 'classProperties'] })
  } catch (e) {
    console.error('Parse error:', file, e.message)
    return false
  }
  let changed = false

  traverse(ast, {
    ImportDeclaration(path) {
      const srcVal = path.node.source.value
      if (srcVal === 'swiper') {
        // map named imports like Pagination -> swiper/modules/pagination/pagination.js
        const specifiers = path.node.specifiers
        const newDecls = []
        specifiers.forEach(spec => {
          if (t.isImportSpecifier(spec)) {
            const imported = spec.imported.name
            const lower = imported.toLowerCase()
            const modulePath = `swiper/modules/${lower}/${lower}.js`
            const newImport = t.importDeclaration([t.importDefaultSpecifier(t.identifier(imported))], t.stringLiteral(modulePath))
            newDecls.push(newImport)
          } else {
            // default import from 'swiper' — leave it
            newDecls.push(t.importDeclaration([spec], t.stringLiteral('swiper')))
          }
        })
        if (newDecls.length) {
          path.replaceWithMultiple(newDecls)
          changed = true
        }
      }
      // ensure react imports from 'swiper/react' remain but keep as-is
    }
  })

  if (changed) {
    const out = generator(ast, { retainLines: true }).code
    fs.writeFileSync(file, out, 'utf8')
    console.log('Patched', file)
  }
  return changed
}

function run() {
  const files = glob.sync('src/**/*.{js,jsx}', { nodir: true })
  let patched = 0
  for (const f of files) {
    try {
      if (transformFile(f)) patched++
    } catch (e) {
      console.error('Error processing', f, e.message)
    }
  }
  console.log('Swiper patches:', patched)
}

run()
