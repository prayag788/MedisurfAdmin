const fs = require('fs')
const path = require('path')
const glob = require('glob')
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const generator = require('@babel/generator').default

function transformFile(file) {
  const src = fs.readFileSync(file, 'utf8')
  let ast
  try {
    ast = parser.parse(src, {
      sourceType: 'module',
      plugins: ['jsx', 'classProperties'],
    })
  } catch (e) {
    console.error('Parse error:', file, e.message)
    return false
  }
  let changed = false
  const t = require('@babel/types')

  traverse(ast, {
    ImportDeclaration(pathNode) {
      const val = pathNode.node.source && pathNode.node.source.value
      if (typeof val === 'string' && val.startsWith('tinymce/plugins/')) {
        // replace import with try { require('tinymce/plugins/...') } catch(e) {}
        const requireCall = t.callExpression(t.identifier('require'), [
          t.stringLiteral(val),
        ])
        const expr = t.expressionStatement(requireCall)
        const tryStmt = t.tryStatement(
          t.blockStatement([expr]),
          t.catchClause(t.identifier('e'), t.blockStatement([]))
        )
        pathNode.replaceWithMultiple([tryStmt])
        changed = true
      }
    },
  })

  if (changed) {
    const out = generator(ast, { retainLines: true }).code
    fs.writeFileSync(file, out, 'utf8')
    console.log('Patched', file)
  }
  return changed
}

function addJestMappings() {
  const pkgPath = path.resolve(process.cwd(), 'package.json')
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
  pkg.jest = pkg.jest || {}
  pkg.jest.moduleNameMapper = pkg.jest.moduleNameMapper || {}
  const mappings = {
    '^@src/(.*)$': '<rootDir>/src/$1',
    '^@assets/(.*)$': '<rootDir>/src/@core/assets/$1',
    '^@components/(.*)$': '<rootDir>/src/@core/components/$1',
    '^@layouts/(.*)$': '<rootDir>/src/@core/layouts/$1',
    '^@store/(.*)$': '<rootDir>/src/redux/$1',
    '^@styles/(.*)$': '<rootDir>/src/@core/scss/$1',
    '^@configs/(.*)$': '<rootDir>/src/configs/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@hooks/(.*)$': '<rootDir>/src/utility/hooks/$1',
    '^@fake-db/(.*)$': '<rootDir>/src/@fake-db/$1',
  }
  let added = false
  for (const k of Object.keys(mappings)) {
    if (!pkg.jest.moduleNameMapper[k]) {
      pkg.jest.moduleNameMapper[k] = mappings[k]
      added = true
    }
  }
  if (added) {
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8')
    console.log('Updated package.json with jest.moduleNameMapper')
  } else {
    console.log('package.json already contains mappings')
  }
}

function run() {
  console.log('Searching for tinymce plugin imports...')
  const files = glob.sync('src/**/*.{js,jsx}', { nodir: true })
  let patched = 0
  for (const f of files) {
    try {
      const ok = transformFile(f)
      if (ok) patched++
    } catch (e) {
      console.error('Error processing', f, e.message)
    }
  }
  console.log('Patched files:', patched)
  addJestMappings()
}

run()
