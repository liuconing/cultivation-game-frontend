---
description: domain 資料夾專用規則。只有任務涉及 domain 內容時才讀取。
globs:
  - 'domain/**'
  - '**/domain/**'
alwaysApply: false
---

# Domain 規則

## 套用條件

- 只有任務會讀取、修改、建立、刪除 `domain/**` 內容時，才讀取本規則。
- 任務未涉及 `domain/**` 時，略過本規則。
- 不因為專案存在 `domain` 資料夾就自動套用本規則。
- 若新增或修改 domain 內的 TS / JS 程式碼，同時套用 `.cursor/rules/code-style/js-ts-code-style.md`。

## 規則位置

- domain 專用 AI Agent 規則統一放在 `.cursor/rules/code-style/domain-agents.md`。
- 不再把 domain 專用規則維護在 `domain/AGENTS.md`。
- 若既有專案仍存在 `domain/AGENTS.md`，僅作為遷移來源。
- 修改 `domain/**` 前，優先讀取 `.cursor/rules/code-style/domain-agents.md`。

## 目標

- `domain` 資料夾負責資料存取邏輯與商業邏輯。
- `domain` 可包含 repository 層與 usecase 層。
- `domain` 不處理 UI 畫面狀態。
- View 狀態交由 View 層、View-Model hook 或 zustand store 管理。

## 架構分層

```txt
domain/
  repository/
    index.ts
    *.repo.ts
  usecase/
    index.ts
    *.usecase.ts
```

| 層級         | 職責                                                   | 限制             |
| ------------ | ------------------------------------------------------ | ---------------- |
| `repository` | 串接 API、Local Storage、Session Storage，取得原始資料 | 不做商業邏輯處理 |
| `usecase`    | 從 repository 取得資料後做格式整理或商業邏輯處理       | 不含 UI 邏輯     |

## Domain 邊界

- 不在 domain 層加入 UI component、router、zustand store、DOM 操作。
- 不在 domain 層處理框架生命週期。
- 不任意跨 domain 引用內部實作。
- 不將 View 專用格式直接寫入 repository。
- usecase 可為 View 提供穩定 DTO，但不依賴 View。
- domain 層優先保留純邏輯、型別、驗證、轉換、規則判斷。

## Repository 命名

| 項目         | 規則                                           | 範例                        |
| ------------ | ---------------------------------------------- | --------------------------- |
| 檔案名稱     | lower camel case + `.repo.ts`                  | `addWallet.repo.ts`         |
| 成功 payload | upper camel case + `Data` 結尾                 | `LoginUserData`             |
| 回傳型別     | upper camel case + `Res` 結尾（完整 envelope） | `LoginUserRes`              |
| 參數型別     | upper camel case + `Params` 結尾               | `SetFileServerConfigParams` |
| function     | lower camel case + 動詞開頭                    | `getEnvConfig`              |

## Repository 動詞前綴

| 動詞     | 用途                                          |
| -------- | --------------------------------------------- |
| `get`    | 取得資料                                      |
| `set`    | 儲存資料                                      |
| `add`    | 新增資源                                      |
| `update` | 更新資料                                      |
| `delete` | 刪除資料                                      |
| 其他     | 按照 API 實際用途命名，例如 `login`、`upload` |

## Repository 使用規則

- `repository/index.ts` 負責 re-export 所有 `*.repo.ts`。
- 每個 `*.repo.ts` 的 function 與對外型別都需要 `export`。
- function 使用 `export const` 搭配 arrow function。
- 不使用 `export function`，除非既有檔案架構已固定使用 function declaration。
- function 上方需加 JSDoc 說明用途。
- interface 每個欄位需加 JSDoc 或行內註解說明用途。
- 函式參數一律使用物件參數。
- TypeScript 參數需有明確型別。
- HTTP 請求應在 `res.ok === false` 時拋出錯誤。
- 錯誤處理方式以專案統一規範為準。
- 業務 payload 使用 `interface XxxData`；不要把 payload 欄位直接攤在 `XxxRes` 上。
- 完整成功回傳型別使用 `export interface XxxRes extends ApiSuccess<XxxData> {}`。
- 禁止 `export type XxxRes = ApiSuccess<XxxData>`；`Res` 一律用 `interface` 繼承。

## Repository 範例

```ts
import type { ApiSuccess } from './common'

/** 取得錢包詳情所需傳入參數。 */
export interface GetWalletDetailParams {
  /** 錢包 ID。 */
  walletId: string
}

/** 取得錢包詳情的成功 payload。 */
export interface GetWalletDetailData {
  /** 錢包 ID。 */
  id: string
  /** 錢包名稱。 */
  name: string
  /** 錢包餘額。 */
  balance: number
}

/** 取得錢包詳情 API 成功 envelope。 */
export interface GetWalletDetailRes extends ApiSuccess<GetWalletDetailData> {}

/**
 * 取得指定錢包的詳情。
 *
 * @param params - 傳入參數，包含錢包 ID。
 * @returns 錢包詳情成功 envelope。
 */
export const getWalletDetail = async ({ walletId }: GetWalletDetailParams): Promise<GetWalletDetailRes> => {
  const { data } = await apiClient.get<GetWalletDetailRes>(`/api/wallet/${walletId}`)

  return data
}
```

## Usecase 命名

| 項目     | 規則                                         | 範例                       |
| -------- | -------------------------------------------- | -------------------------- |
| 檔案名稱 | lower camel case + `.usecase.ts`             | `addWallet.usecase.ts`     |
| 回傳型別 | upper camel case + `Dto` 結尾                | `GetEnvConfigDto`          |
| 參數型別 | upper camel case + `ParamsDto` 結尾          | `GetWalletDetailParamsDto` |
| function | lower camel case + 動詞開頭 + `Usecase` 結尾 | `getEnvConfigUsecase`      |

## Usecase 使用規則

- `usecase/index.ts` 負責 re-export 所有 `*.usecase.ts`。
- 每個 `*.usecase.ts` 的 function 與對外型別都需要 `export`。
- function 使用 `export const` 搭配 arrow function。
- 不使用 `export function`，除非既有檔案架構已固定使用 function declaration。
- function 上方需加 JSDoc 說明用途。
- interface 每個欄位需加 JSDoc 或行內註解說明用途。
- 函式參數一律使用物件參數。
- TypeScript 參數需有明確型別。
- 如果 UI 沒有特殊需求，直接回傳 repository 取回的資料即可。
- 不為了形式建立無意義轉換。
- usecase 預設對外回傳完整 envelope 時：`interface XxxDto extends XxxRes`。
- usecase 若只對外暴露 payload：`interface XxxDto extends XxxData`（需在 JSDoc 註明）。
- `ParamsDto` 與 `Params` 欄位完全一致時，使用 `interface XxxParamsDto extends XxxParams`。
- 有需要新增欄位或改變型別形狀時，使用 `interface XxxDto extends …` 擴充對應來源。
- 保持 View 層依賴 usecase 介面，不直接依賴 repository 介面。

## Usecase 範例

```ts
import { getWalletDetail } from '../repository'
import type { GetWalletDetailParams, GetWalletDetailRes } from '../repository'

/** 取得錢包詳情 DTO（完整成功 envelope）。 */
export interface GetWalletDetailDto extends GetWalletDetailRes {}

/** 取得錢包詳情 usecase 傳入參數。 */
export interface GetWalletDetailParamsDto extends GetWalletDetailParams {}

/**
 * 取得指定錢包的詳情。
 *
 * @param params - 傳入參數，包含錢包 ID。
 * @returns 錢包詳情 DTO。
 */
export const getWalletDetailUsecase = async (params: GetWalletDetailParamsDto): Promise<GetWalletDetailDto> => {
  return getWalletDetail(params)
}
```

## Index Export

- 新增 `*.repo.ts` 後，同步更新 `repository/index.ts`。
- 新增 `*.usecase.ts` 後，同步更新 `usecase/index.ts`。
- 更名檔案或函式時，同步更新所有 re-export 與 import。
- 不保留無人使用且已失效的 export。

## 命名一致性

- 同一份資料在 repository、usecase、View 間需保持語意一致。
- repository 成功 payload 使用 `Data`；完整成功回傳使用 `Res`（`ApiSuccess<Data>`）。
- usecase 對外資料使用 `Dto`。
- repository 參數使用 `Params`。
- usecase 對外參數使用 `ParamsDto`。
- 集合資料優先使用複數名詞。
- 避免 `usersList`、`ordersList` 這類冗餘命名。
- `List` 僅用於衍生列表資料或 UI 顯示列表。

## 修改前確認清單

1. 任務是否真的涉及 `domain/**`。
2. 是否只修改 `domain/**` 下的檔案。
3. 是否需要同步更新 `repository/index.ts` 或 `usecase/index.ts`。
4. 新增的 function 與對外型別是否都有 `export`。
5. function 是否使用 `export const` 與 arrow function。
6. function 是否都有 JSDoc。
7. interface 欄位是否都有 JSDoc 或行內註解；空繼承的 `Res` / `Dto` 是否有用途註解。
8. 函式參數是否使用物件參數與明確型別。
9. 命名是否符合 `.repo.ts`、`.usecase.ts`、`Data`、`Res`、`Params`、`Dto`、`ParamsDto`。
10. `XxxRes` 是否為 `interface XxxRes extends ApiSuccess<XxxData> {}`，而非 `type` 別名。
11. usecase 是否正確 import 對應 repository function。
12. Dto / ParamsDto 是否維持 View 與 repository 解耦。
13. 是否避免加入 UI、router、store 或框架生命週期邏輯。
14. `xxxx.view-controller.tsx` 內需要使用 domain 定義型別一律使用 usecase export 的定義

## Codex / AI Agent 操作規則

- 任務涉及 `domain/**`：讀取本規則。
- 任務不涉及 `domain/**`：跳過本規則。
- 只修改 domain 以外檔案時，不主動讀取或套用 domain 規則。
- 未經明確要求，不要修改 `views/`、`router/`、`stores/` 或其他目錄。
- 如果任務涉及跨層修改，先說明原因，再等待確認。
- 若 domain 規則與更接近檔案的局部規則衝突，優先遵守更接近檔案的局部規則。
- 回覆保持簡短，只列修改的檔案、修改原因、是否需要確認。
