# 專案結構與檔案放置規則

## 適用範圍

- 新增檔案、搬移檔案、或不確定某段程式碼該放哪個資料夾時讀取本規則。
- 與 `.cursor/rules/code-style/js-ts-code-style.md`、`.cursor/rules/code-style/react-code-style.md` 搭配使用。

## src 資料夾地圖

| 資料夾            | 性質                                                       | 細部規則                                              |
| ----------------- | ---------------------------------------------------------- | ----------------------------------------------------- |
| `src/assets/`     | 靜態資源（圖片、SVG）                                      | —                                                     |
| `src/components/` | 跨頁共用 UI 元件、共用 HOC                                 | `.cursor/rules/code-style/components-structure.md`    |
| `src/containers/` | Provider／runtime 組合層（context provider、adapter）      | 見下方「containers 規則」                             |
| `src/data/`       | mock 資料、靜態資料表                                      | —                                                     |
| `src/domain/`     | repository（API 存取）＋ usecase（商業邏輯）               | `.cursor/rules/code-style/domain-agents.md`           |
| `src/error/`      | 全域錯誤處理（provider、notice、handler）                  | —                                                     |
| `src/hook/`       | 跨頁共用 React hooks                                       | `.cursor/rules/code-style/ui-logic-organization.md`   |
| `src/lib/`        | 第三方套件隔離封裝層                                       | `.cursor/skills/lib-isolation/SKILL.md`               |
| `src/router/`     | 路由設定與路由存取控制                                     | —                                                     |
| `src/session/`    | 登入 session 管理（provider、hook、policy）                | —                                                     |
| `src/stores/`     | zustand 全域狀態                                           | 見下方「stores 規則」                                 |
| `src/types/`      | 全域型別宣告（`*.d.ts`）                                   | —                                                     |
| `src/utils/`      | 純函式（格式化、轉換、mapping，不依賴 UI 生命週期）        | `.cursor/rules/code-style/ui-logic-organization.md`   |
| `src/views/`      | 頁面（View-Controller / View-Model 結構）                  | `.cursor/rules/code-style/react-view-structure.md`    |

## containers 規則

- 放置跨頁共用的 Provider、context 組合層與其專屬 adapter（如 `GameRuntimeProvider/`）。
- 一個 container 一個 PascalCase 資料夾，內含同名 `.tsx` 本體與 `index.ts` barrel。
- container 專屬的 adapter／純邏輯檔與本體同層，檔名 PascalCase（如 `GameStateAdapter.ts`）。
- `src/containers/index.ts` 統一 re-export。

```
src/
  containers/
    index.ts
    GameRuntimeProvider/
      GameRuntimeProvider.tsx
      GameStateAdapter.ts
      index.ts
```

## stores 規則

- zustand 全域狀態放 `src/stores/`，檔名 camelCase + `.store.ts`（如 `auth.store.ts`、`mockGame.store.ts`）。
- store hook 命名 `useXxxStore`（如 `useAuthStore`）。
- `src/stores/index.ts` 統一 re-export；外部從 `@/stores` 匯入。
- 只放全域跨頁狀態；單一畫面狀態留在該畫面的 view-model。

## 檔名總表

| 檔案性質                      | 命名規則                                | 範例                                             |
| ----------------------------- | --------------------------------------- | ------------------------------------------------ |
| 共用元件／container           | PascalCase 資料夾＋同名檔案             | `CharacterCard/CharacterCard.tsx`                |
| container 專屬 adapter        | PascalCase                              | `GameStateAdapter.ts`                            |
| hook（共用或 view 專用）      | `use` 開頭 camelCase                    | `useGameMutation.ts`、`useExplorationPlayback.ts` |
| view 主檔                     | `{資料夾名}.view-controller.tsx` 等     | `gameShell.view-controller.tsx`                  |
| view 專用純函式／adapter      | camelCase                               | `explorationResultAdapter.ts`、`loadoutActions.ts` |
| store                         | camelCase + `.store.ts`                 | `auth.store.ts`                                  |
| domain repository             | camelCase + `.repo.ts`                  | `cultivation.repo.ts`                            |
| domain usecase                | camelCase + `.usecase.ts`               | `cultivation.usecase.ts`                         |
| 其餘 TS 模組（utils、data 等）| camelCase                               | `mapStatus.ts`、`gameMutation.ts`                |

## 放置判斷順序

1. 是 UI 元件？→ 單頁用放 `views/<view>/components/`，跨頁用放 `src/components/`。
2. 是 Provider／context 組合層？→ `src/containers/`。
3. 是 hook？→ 單頁用放 `views/<view>/hook/`，跨頁用放 `src/hook/`。
4. 是純函式？→ 單頁用平放於該 view 資料夾，跨頁用放 `src/utils/`。
5. 是 API 存取或商業邏輯？→ `src/domain/`。
6. 是全域狀態？→ `src/stores/`。
7. 是第三方套件封裝？→ `src/lib/`（依 lib-isolation skill）。

## 既有檔案處理

- 少數舊檔仍為 kebab-case（如 `src/error/global-error.ts`、`src/session/logout-policy.ts`、`src/router/route-access.ts`、`views/characterCreate/character-create.*`）。
- 未經明確要求不主動改名這些舊檔；新增或搬移檔案時一律遵守本規則。
