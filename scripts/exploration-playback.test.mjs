import assert from 'node:assert/strict'
import test from 'node:test'
import {
  advanceExplorationPlayback,
  createExplorationPlaybackState,
  explorationPlaybackIntervalMs,
  getInitialPlaybackCount,
  getNextPlaybackCount,
} from '../src/views/gameShell/explore/exploration-playback.ts'

test('探索播放固定每 450ms 顯示下一筆', () => {
  assert.equal(explorationPlaybackIntervalMs, 450)
})

test('有戰鬥紀錄時先顯示第一筆', () => {
  assert.equal(getInitialPlaybackCount(8), 1)
  assert.equal(getInitialPlaybackCount(0), 0)
})

test('播放每次只增加一筆且不超過總數', () => {
  assert.equal(getNextPlaybackCount(1, 8), 2)
  assert.equal(getNextPlaybackCount(8, 8), 8)
  assert.equal(getNextPlaybackCount(0, 0), 0)
})

test('最後一筆戰報後保留一個結算刻度才揭示結果', () => {
  let playback = createExplorationPlaybackState(3)

  assert.deepEqual(playback, {
    phase: 'playing',
    visibleCount: 1,
  })

  playback = advanceExplorationPlayback(playback, 3)
  assert.deepEqual(playback, {
    phase: 'playing',
    visibleCount: 2,
  })

  playback = advanceExplorationPlayback(playback, 3)
  assert.deepEqual(playback, {
    phase: 'settling',
    visibleCount: 3,
  })

  playback = advanceExplorationPlayback(playback, 3)
  assert.deepEqual(playback, {
    phase: 'revealed',
    visibleCount: 3,
  })
})

test('空戰報立即揭示且單筆戰報仍等待結算刻度', () => {
  assert.deepEqual(createExplorationPlaybackState(0), {
    phase: 'revealed',
    visibleCount: 0,
  })
  assert.deepEqual(createExplorationPlaybackState(1), {
    phase: 'settling',
    visibleCount: 1,
  })
})
