const fs = require('fs')
const path = require('path')
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default
const generate = require('@babel/generator').default

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'build') continue
      walk(full)
    } else if (/\.(js|jsx)$/.test(entry.name)) {
      fixFile(full)
    }
  }
}

function fixFile(file) {
  const code = fs.readFileSync(file, 'utf8')
  let ast
  try {
    ast = parser.parse(code, {
      sourceType: 'module',
      plugins: [
        'jsx',
        'classProperties',
        'optionalChaining',
        'nullishCoalescingOperator',
        'decorators-legacy',
        'dynamicImport',
      ],
    })
  } catch (e) {
    // skip files that don't parse
    return
  }

  let changed = false
  traverse(ast, {
    enter(path) {
      const node = path.node
      if (node && node.type === 'BinaryExpression') {
        if ((node.operator === '==' || node.operator === '!=') &&
            node.left && node.right) {
          const leftIsNull = node.left.type === 'NullLiteral'
          const rightIsNull = node.right.type === 'NullLiteral'
          // handle comparisons to null explicitly: `x == null` => `(x === null || x === undefined)`
          if (leftIsNull || rightIsNull) {
            const other = leftIsNull ? node.right : node.left
            if (node.operator === '==') {
              const orExpr = {
                type: 'LogicalExpression',
                operator: '||',
                left: {
                  type: 'BinaryExpression',
                  operator: '===',
                  left: other,
                  right: { type: 'NullLiteral' },
                },
                right: {
                  type: 'BinaryExpression',
                  operator: '===',
                  left: other,
                  right: { type: 'Identifier', name: 'undefined' },
                },
              }
              path.replaceWith(orExpr)
              changed = true
            } else if (node.operator === '!=') {
              const andExpr = {
                type: 'LogicalExpression',
                operator: '&&',
                left: {
                  type: 'BinaryExpression',
                  operator: '!==',
                  left: other,
                  right: { type: 'NullLiteral' },
                },
                right: {
                  type: 'BinaryExpression',
                  operator: '!==',
                  left: other,
                  right: { type: 'Identifier', name: 'undefined' },
                },
              }
              path.replaceWith(andExpr)
              changed = true
            }
            return
          }
          // transform non-null comparisons
          if (node.operator === '==') {
            node.operator = '==='
            changed = true
          } else if (node.operator === '!=') {
            node.operator = '!=='
            changed = true
          }
        }
      }
    }
  })

  if (changed) {
    const out = generate(ast, { retainLines: true }, code).code
    fs.writeFileSync(file, out, 'utf8')
    console.log('Patched', file)
  }
}

const start = path.join(__dirname, '..', 'src')
walk(start)
console.log('Done')
