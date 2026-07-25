import assert from 'node:assert/strict'
import test from 'node:test'
import {
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
