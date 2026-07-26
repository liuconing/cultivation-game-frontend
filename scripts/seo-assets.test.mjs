import assert from 'node:assert/strict'
import { access, readFile } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'

const siteOrigin = 'https://cultivation-game-frontend.zeabur.app/'
const projectRoot = path.resolve('.')

/** 讀取專案根目錄內的 UTF-8 文字檔。 */
const readProjectText = (relativePath) =>
  readFile(path.join(projectRoot, relativePath), 'utf8')

/**
 * 從 PNG IHDR 區塊讀取影像尺寸。
 *
 * @param relativePath - 相對於專案根目錄的 PNG 路徑。
 * @returns 圖片寬度、高度與是否具有 Alpha 色彩通道。
 */
const readPngMetadata = async (relativePath) => {
  const buffer = await readFile(path.join(projectRoot, relativePath))
  const signature = buffer.subarray(0, 8).toString('hex')

  assert.equal(signature, '89504e470d0a1a0a', `${relativePath} 不是有效 PNG`)
  assert.equal(buffer.subarray(12, 16).toString('ascii'), 'IHDR')

  const colorType = buffer.readUInt8(25)
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
    hasAlpha: colorType === 4 || colorType === 6,
  }
}

/** 從 index.html 取得 JSON-LD 文字內容。 */
const getJsonLdSource = (html) => {
  const match = html.match(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/u,
  )

  assert.ok(match, 'index.html 缺少 JSON-LD')
  return match[1]
}

test('首頁包含一致的搜尋與社群分享 metadata', async () => {
  const html = await readProjectText('index.html')
  const requiredFragments = [
    '<html lang="zh-Hant-TW">',
    '<title>問仙｜文字放置修仙</title>',
    'name="description"',
    'name="robots"',
    'rel="canonical"',
    `href="${siteOrigin}"`,
    'property="og:type" content="website"',
    'property="og:url"',
    `content="${siteOrigin}"`,
    `${siteOrigin}og-cover.png`,
    'name="twitter:card" content="summary_large_image"',
    'rel="manifest" href="/site.webmanifest"',
  ]

  for (const fragment of requiredFragments) {
    assert.ok(html.includes(fragment), `index.html 缺少：${fragment}`)
  }

  const jsonLd = JSON.parse(getJsonLdSource(html))
  assert.equal(jsonLd['@type'], 'VideoGame')
  assert.equal(jsonLd.url, siteOrigin)
  assert.equal(jsonLd.inLanguage, 'zh-Hant-TW')
  assert.equal(jsonLd.image, `${siteOrigin}og-cover.png`)
})

test('favicon、Apple 圖示、PWA 圖示與分享圖尺寸正確', async () => {
  const expectedImages = [
    ['public/favicon-32x32.png', 32, 32, true],
    ['public/apple-touch-icon.png', 180, 180, true],
    ['public/icon-192.png', 192, 192, true],
    ['public/icon-512.png', 512, 512, true],
    ['public/og-cover.png', 1200, 630, false],
  ]

  for (const [relativePath, width, height, hasAlpha] of expectedImages) {
    const metadata = await readPngMetadata(relativePath)
    assert.equal(metadata.width, width, `${relativePath} 寬度錯誤`)
    assert.equal(metadata.height, height, `${relativePath} 高度錯誤`)
    assert.equal(
      metadata.hasAlpha,
      hasAlpha,
      `${relativePath} Alpha 色彩通道錯誤`,
    )
  }

  const favicon = await readProjectText('public/favicon.svg')
  assert.ok(favicon.includes('問仙印章'))
  assert.ok(favicon.includes('#070908'))
  assert.ok(favicon.includes('#c3a968'))
  assert.ok(favicon.includes('#87c6a5'))
  assert.ok(favicon.includes('#b95f50'))
})

test('manifest、robots 與 sitemap 使用正式 HTTPS 網址', async () => {
  const manifest = JSON.parse(
    await readProjectText('public/site.webmanifest'),
  )
  const robots = await readProjectText('public/robots.txt')
  const sitemap = await readProjectText('public/sitemap.xml')

  assert.equal(manifest.lang, 'zh-Hant-TW')
  assert.equal(manifest.start_url, '/')
  assert.deepEqual(
    manifest.icons.map((icon) => icon.sizes),
    ['192x192', '512x512'],
  )
  assert.ok(robots.includes(`Sitemap: ${siteOrigin}sitemap.xml`))
  assert.ok(robots.includes('Disallow: /game/'))
  assert.ok(sitemap.includes(`<loc>${siteOrigin}</loc>`))

  await Promise.all(
    [
      'public/favicon.svg',
      'public/og-cover.svg',
      'public/site.webmanifest',
      'public/robots.txt',
      'public/sitemap.xml',
    ].map((relativePath) =>
      access(path.join(projectRoot, relativePath)),
    ),
  )
})
