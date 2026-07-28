import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
)

const homeControllerPath = path.join(
  projectRoot,
  'src/views/home/home.view-controller.tsx',
)

const expectedImages = [
  ['bamboo-shadow.jpg', 560, 1040],
  ['exploration-map.jpg', 1560, 900],
  ['hero-cultivator.jpg', 1200, 1200],
  ['hero-landscape.jpg', 2400, 1040],
]

const removedSvgPaths = [
  'public/icons.svg',
  'src/assets/react.svg',
  'src/assets/vite.svg',
  'src/assets/images/bamboo-shadow.svg',
  'src/assets/images/character-silhouette.svg',
  'src/assets/images/exploration-map.svg',
  'src/assets/images/ink-landscape.svg',
  'src/assets/images/meditation-silhouette.svg',
]

/**
 * 從 JPEG 的 SOF 標記讀取寬高，讓測試不需額外影像套件也能驗證輸出尺寸。
 *
 * @param {Buffer} buffer JPEG 檔案內容。
 * @returns {{ width: number, height: number }} 圖片的像素尺寸。
 */
function readJpegDimensions(buffer) {
  assert.equal(buffer[0], 0xff)
  assert.equal(buffer[1], 0xd8)

  let offset = 2
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1
      continue
    }

    const marker = buffer[offset + 1]
    if ([0xc0, 0xc1, 0xc2].includes(marker)) {
      return {
        height: buffer.readUInt16BE(offset + 5),
        width: buffer.readUInt16BE(offset + 7),
      }
    }

    if (marker === 0xd8 || marker === 0xd9) {
      offset += 2
      continue
    }

    const segmentLength = buffer.readUInt16BE(offset + 2)
    assert.ok(segmentLength >= 2, 'JPEG segment length must be valid')
    offset += segmentLength + 2
  }

  throw new Error('找不到 JPEG 尺寸標記')
}

test('首頁只引用最佳化後的點陣水墨素材', async () => {
  const controller = await readFile(homeControllerPath, 'utf8')

  assert.equal(controller.includes('.svg'), false)
  for (const [fileName] of expectedImages) {
    assert.ok(controller.includes(`@/assets/images/${fileName}`))
  }
  assert.equal(controller.includes('characterSilhouette'), false)
  assert.equal(controller.includes('meditationSilhouette'), false)
})

test('首頁水墨圖片尺寸符合各自版位', async () => {
  for (const [fileName, width, height] of expectedImages) {
    const imagePath = path.join(projectRoot, 'src/assets/images', fileName)
    const dimensions = readJpegDimensions(await readFile(imagePath))

    assert.deepEqual(dimensions, { width, height }, fileName)
  }
})

test('被替換或未引用的舊 SVG 已移除並保留品牌資產', async () => {
  for (const relativePath of removedSvgPaths) {
    await assert.rejects(access(path.join(projectRoot, relativePath)))
  }

  await Promise.all(
    ['public/favicon.svg', 'public/og-cover.svg'].map((relativePath) =>
      access(path.join(projectRoot, relativePath)),
    ),
  )
})
