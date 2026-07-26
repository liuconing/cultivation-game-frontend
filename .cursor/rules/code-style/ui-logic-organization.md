# UI 邏輯整理規則

## 套用條件

- 新增或調整前端程式碼時，若涉及 UI 顯示邏輯函式、互動流程函式或輸出內容邏輯函式，需讀取本規則。
- 單一檔案修改時，優先確認既有共用函式是否已存在。
- 多檔案修改時，完成後需整理可共用邏輯，並放到對應資料夾。
- 若同時修改 JS / TS / Vue / React 程式碼，需同步套用 `.cursor/rules/code-style/js-ts-code-style.md`。
- 若涉及 `src/components/**` 元件結構與匯出，需同步套用 `.cursor/rules/code-style/components-structure.md`。

## 單一檔案修改

- 新增 UI 顯示邏輯函式前，先搜尋 `src/hook/**` 與 `src/utils/**`。
- 新增輸出內容邏輯函式前，先搜尋 `src/hook/**` 與 `src/utils/**`。
- 新增 API 呼叫包裝、dialog 控制、router / navigator 行為、全域錯誤處理等互動流程前，先搜尋 `src/hook/**`。
- 新增格式化、轉換、延遲、顯示文字、百分比、金額、時間等輸出內容前，先搜尋 `src/utils/**`。
- 若已存在相同或可組合使用的功能，優先使用既有函式。
- 不為了局部方便複製既有邏輯。
- 若功能只服務目前檔案且不具共用價值，可保留在該檔案內。
- 若功能可能被其他檔案使用，應整理成共用函式，不應長期留在單一 UI 檔案中。

## 多檔案修改

- 新增或調整多個檔案後，需檢查是否出現重複或可共用的 UI 顯示邏輯、互動流程邏輯或輸出內容邏輯。
- 重複的 UI 狀態、dialog、fetch、mutation、navigator、error handler 等流程邏輯，應整理到 `src/hook/**`。
- 重複的格式化、轉換、顯示值計算、輸出文字、時間、金額、百分比等純函式，應整理到 `src/utils/**`。
- 重複的 UI 顯示結構（卡片外框、進度列等）應抽成 `src/components/**` 的共用元件。
- 可共用邏輯需依用途整理到對應資料夾。
- 不將相同邏輯分散保留在多個 component、view 或 page 檔案中。
- 新增共用檔案後，需同步更新對應資料夾的 `index.ts` re-export。

## 放置位置

- `src/hook/**`
  - 放置與 UI 狀態、互動流程、資料取得、資料提交、dialog 控制、navigator、全域錯誤處理、生命週期等相關的跨頁共用 React hook。
  - hook 使用 `use` 開頭命名，檔名與匯出名稱一致（如 `useGameMutation.ts`）。
  - 專案共用 hook 檔案應透過 `src/hook/index.ts` re-export。
  - 範例類型：`useFetch`、`useMutation`、`useGameMutation`。
  - 僅單一 view 使用的 hook 放該 view 的 `hook/` 子資料夾，不提前抽到 `src/hook/`。
- `src/utils/**`
  - 放置純函式、格式化、轉換、延遲、輸出文字、顯示值計算、資料 mapping 等不依賴 UI 生命週期的邏輯。
  - 函式應避免依賴 component state、DOM 或 framework instance。
  - 檔名使用 camelCase（如 `mapStatus.ts`、`gameMutation.ts`）。
  - 專案共用 util 檔案應透過 `src/utils/index.ts` re-export。
  - 範例類型：`delay`、`formatAmount`、`formatTime`、`formatRate`。
- `src/components/**`
  - 放置可重用的 UI 顯示元件，結構與匯出規則見 `.cursor/rules/code-style/components-structure.md`。
  - 每個元件使用同名資料夾，內含 `ComponentName.tsx` 與 `index.ts`。
  - 所有元件透過 `src/components/index.ts` 統一 re-export，外部從 `@/components` 匯入。
- `src/containers/**`
  - 放置跨頁共用的 Provider、context 組合層與其專屬 adapter（如 `GameRuntimeProvider/`）。
  - 不將 Provider 類組合層塞進 `src/hook/` 或 `src/components/`。
  - 結構規則見 `.cursor/rules/code-style/project-structure.md`。

## 判斷順序

1. 先搜尋 `src/hook/**` 是否已有可用 hook。
2. 再搜尋 `src/utils/**` 是否已有可用純函式。
3. 若沒有既有功能，判斷邏輯是否只屬於單一檔案。
4. 若可共用，依用途新增到 `src/hook/**` 或 `src/utils/**`。
5. 新增共用函式後，回頭替換原本重複或分散的局部邏輯。
6. 新增共用檔案後，更新 `index.ts` 對外匯出。

## 修改前確認清單

1. 是否已搜尋 `src/hook/**`。
2. 是否已搜尋 `src/utils/**`。
3. 是否有既有函式可直接使用或組合使用。
4. 新增邏輯是否真的只屬於單一檔案。
5. 多檔案修改後是否已整理可共用邏輯。
6. 共用邏輯是否放在正確資料夾。
7. 新增共用檔案後是否已更新 `index.ts`。
