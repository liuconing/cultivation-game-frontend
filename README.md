# Cultivation Game — Frontend

修仙放置遊戲前端。以 React 呈現畫面，遊戲狀態以後端為權威來源；前端負責查詢、快取、轉成畫面模型與操作播放，不自行重算戰鬥、掉落或資源結算。

## 技術棧

| 項目 | 選擇 |
| ---- | ---- |
| 框架 | React 19 + TypeScript + Vite |
| 樣式 | Tailwind CSS 4 |
| 路由 | React Router 7 |
| 資料請求 | Axios（`@/lib/axios`）+ TanStack React Query |
| 全域狀態 | Zustand（登入 token 等跨頁狀態） |
| 精確數值 | bignumber.js（經 `@/lib/bigNumber`） |
| 路徑別名 | `@/` → `src/` |

## 架構概要

```
畫面 View-Controller
        ↑ props
畫面 View-Model（狀態、副作用、呼叫 usecase）
        ↓
domain/usecase → domain/repository → apiClient → 後端 API
```

- **View**：`src/views/**`，採 View-Controller / View-Model 分層（見 `.cursor/rules/code-style/react-view-structure.md`）。
- **Domain**：畫面只透過 `@/domain` 的 usecase 呼叫 API，不直接使用 Axios。
- **Game Runtime**：`src/containers/GameRuntimeProvider` 查詢並快取後端 Game State，轉成畫面模型；不把完整 Game State 複製進 Zustand。
- **冪等**：除 Auth 外，資源異動 POST 需帶 `Idempotency-Key`；同一操作意圖在成功前重試必須沿用同一 key。

領域詞彙見 [CONTEXT.md](./CONTEXT.md)；Domain API 契約見 [src/domain/README.md](./src/domain/README.md)；Agent 規則入口見 [AGENTS.md](./AGENTS.md)。

## 目錄結構

```
src/
  assets/          靜態資源
  components/      跨頁共用 UI 元件
  containers/      Provider／runtime（如 GameRuntimeProvider）
  data/            mock／靜態資料
  domain/          repository + usecase
  error/           全域錯誤處理
  hook/            跨頁共用 hooks
  lib/             第三方套件隔離層
  router/          路由與存取控制
  session/         登入 session
  stores/          zustand 全域狀態
  types/           全域 .d.ts
  utils/           純函式
  views/           頁面（login、home、characterCreate、gameShell…）
```

新增或搬移檔案時，依 `.cursor/rules/code-style/project-structure.md` 放置。

## 環境變數

複製 `.env.example` 為 `.env`：

```env
VITE_API_BASE_URL=/api
API_PROXY_TARGET=http://localhost:3001
```

| 變數 | 說明 |
| ---- | ---- |
| `VITE_API_BASE_URL` | 前端 axios 的 baseURL（開發預設走 Vite proxy 的 `/api`） |
| `API_PROXY_TARGET` | Vite 開發伺服器將 `/api` 轉發到此後端位址 |

開發時 Vite 會把 `/api/*` rewrite 成後端實際路徑後轉發，因此本機需先啟動 backend。

## 快速開始

```bash
# 需 Node.js（建議 LTS）與已啟動的 backend
npm install
npm run dev
```

預設由 Vite 提供開發伺服器；API 經 proxy 連到 `API_PROXY_TARGET`。

## 常用腳本

| 指令 | 說明 |
| ---- | ---- |
| `npm run dev` | 啟動開發伺服器 |
| `npm run build` | TypeScript 檢查後建置 |
| `npm run preview` | 預覽建置結果 |
| `npm run lint` | ESLint |
| `npm run test:auth` | 登入／註冊／登出相關單元測試 |
| `npm run test:error` | 全域錯誤處理測試 |
| `npm run test:routes` | 路由存取與導覽測試 |
| `npm run test:character` | 創角流程測試 |
| `npm run test:breakthrough` | 突破機率相關測試 |
| `npm run test:game-mutation` | 遊戲 mutation／冪等相關測試 |
| `npm run test:game-state` | Game State adapter 測試 |
| `npm run test:exploration` | 探索結果與播放測試 |
| `npm run test:skills` | 技能裝備測試 |
| `npm run test:architecture` | 架構文件一致性測試 |
| `npm run test:api-smoke` | 對後端跑 endpoint smoke（需後端可連） |

## 開發約定（精簡）

- 畫面邏輯放 View-Model；View-Controller 只負責 UI。
- 跨頁 hook → `src/hook/`；單頁 hook → `views/<view>/hook/`。
- 跨頁純函式 → `src/utils/`；單頁 adapter → 平放於該 view，檔名 camelCase。
- 第三方套件經 `src/lib/<package>/` 封裝後再引用（見 `.cursor/skills/lib-isolation`）。
- 命名、檔案放置與 View 結構細節以 `.cursor/rules/` 與 `AGENTS.md` 為準。

## 與後端的關係

1. 啟動 backend（見 `../backend/README.md`）。
2. 確認 `.env` 的 `API_PROXY_TARGET` 指向 backend（預設 `http://localhost:3001`）。
3. `npm run dev` 後，瀏覽器請求 `/api/...` 會由 Vite proxy 轉發。
4. 登入後 JWT 由 auth store 持久化，axios interceptor 自動帶入 `Authorization`。
