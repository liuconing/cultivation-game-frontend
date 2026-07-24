# Frontend Domain API Reference

本目錄集中管理 frontend 對 backend 公開 API 的型別、repository 與 usecase。
畫面與 ViewModel 只應從 `@/domain` 使用 usecase，不直接操作 Axios。

## 分層

- `repository/`：定義 request、response DTO，並透過共用 `apiClient` 呼叫 API。
- `usecase/`：提供畫面層使用的業務入口與 DTO aliases。
- `repository/endpoints.ts`：集中管理 23 條公開 API 的 method、path 與 smoke test 行為。
- `repository/common.ts`：定義 envelope、ISO 日期與冪等請求設定。

## 共通契約

- 成功：`{ ok: true, data }`
- 失敗：`{ ok: false, code, message, details? }`
- backend 的 `Date` 在 JSON response 中一律使用 ISO 日期字串。
- JWT 由 `src/lib/axios/apiClient` 的 interceptor 從 auth store 加入。
- 除 Auth 外，所有資源異動 POST 都要另外傳入
  `MutationOptions { idempotencyKey }`，repository 會轉成 `Idempotency-Key`
  header，不會寫進 request body。

## Domain 對應

- Auth：註冊、登入。
- Character／GameState：目前角色、建立角色、完整遊戲狀態。
- Cultivation／Rest：領取修為、立即完成休養。
- Exploration：探索、戰鬥紀錄與獎勵結果。
- Equipment：比較、穿戴、出售裝備 instance。
- CultivationMethod／Skill：裝備功法與配置技能。
- Pill：商店列表、購買、使用丹藥。
- Breakthrough／SpiritualRoot：突破與靈根升級。
- Catalog：道具與怪物圖鑑。
- Health：後端與 MongoDB 健康狀態。

## 驗證

`npm run test:api-smoke` 會讀取與 repository 相同的 endpoint registry：

- 公開 GET 驗證成功 envelope。
- Auth 以無效 body 驗證 `VALIDATION_ERROR`，不建立帳號。
- 受保護 API 不帶 JWT，驗證 `UNAUTHORIZED`，不進入資源異動流程。

本層目前不接入既有 UI Mock。正式畫面串接前，還需要處理瀏覽器 CORS
或 Vite proxy。
