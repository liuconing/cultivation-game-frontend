import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { test } from 'node:test'
import ts from 'typescript'

const chinesePattern = /\p{Script=Han}/u
const sourceRoot = path.resolve('src')
const architectureFiles = [
  'session/SessionProvider.tsx',
  'session/session.types.ts',
  'components/Modal/Modal.tsx',
  'views/gameShell/GameRuntimeProvider.tsx',
  'views/gameShell/game-mutation.ts',
  'views/gameShell/use-game-mutation.ts',
  'views/gameShell/use-game-runtime.ts',
  'views/gameShell/cultivation/breakthrough-chance.view.ts',
  'views/gameShell/explore/exploration-playback.ts',
  'views/gameShell/explore/use-exploration-playback.ts',
]

test('架構模組的公開介面、欄位與函式具中文用途註解', async () => {
  const failures = []

  for (const relativeFile of architectureFiles) {
    const file = path.join(sourceRoot, relativeFile)
    const content = await readFile(file, 'utf8')
    const source = ts.createSourceFile(
      file,
      content,
      ts.ScriptTarget.Latest,
      true,
      relativeFile.endsWith('.tsx')
        ? ts.ScriptKind.TSX
        : ts.ScriptKind.TS,
    )

    const visit = (node) => {
      if (isPublicDeclaration(node)) {
        recordMissingComment(
          failures,
          relativeFile,
          source,
          content,
          node,
          node.name?.getText(source) ?? '公開宣告',
        )
      }

      if (ts.isInterfaceDeclaration(node)) {
        for (const member of node.members) {
          recordMissingComment(
            failures,
            relativeFile,
            source,
            content,
            member,
            member.name?.getText(source) ?? '介面欄位',
          )
        }
      }

      ts.forEachChild(node, visit)
    }

    visit(source)
  }

  assert.deepEqual(
    failures,
    [],
    `缺少中文架構註解：\n${failures.join('\n')}`,
  )
})

test('GameState 投影流程說明資料轉換順序', async () => {
  const content = await readFile(
    path.join(
      sourceRoot,
      'views/gameShell/GameRuntimeProvider.tsx',
    ),
    'utf8',
  )

  assert.ok(
    content.includes('投影集中在 Runtime'),
    'Game Runtime 缺少 GameState 投影順序說明',
  )
})

const isPublicDeclaration = (node) => {
  if (
    !ts.isFunctionDeclaration(node) &&
    !ts.isInterfaceDeclaration(node) &&
    !ts.isTypeAliasDeclaration(node)
  ) {
    return false
  }

  return node.modifiers?.some(
    (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
  )
}

const recordMissingComment = (
  failures,
  relativeFile,
  source,
  content,
  node,
  name,
) => {
  const ranges =
    ts.getLeadingCommentRanges(content, node.getFullStart()) ?? []
  const hasChineseComment = ranges.some((range) =>
    chinesePattern.test(content.slice(range.pos, range.end)),
  )

  if (hasChineseComment) {
    return
  }

  const position = source.getLineAndCharacterOfPosition(
    node.getStart(source),
  )
  failures.push(`${relativeFile}:${position.line + 1} ${name}`)
}
