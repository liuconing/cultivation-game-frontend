# Frontend Domain API Reference

本資料夾集中 frontend 對 backend API 的參照。後續 AI 需要查 API 時，優先讀本文件與相對應的 domain 檔案；只有契約疑似變更時才回頭掃 `backend/src/routes`、`backend/src/controllers`、`backend/src/types`。

## 分層架構

依 `.cursor/rules/code-style/domain-agents.md`，domain 拆為 repository 與 usecase 兩層：

- `repository/`：串接 API 取得原始資料，回傳型別以 `Res` 結尾、參數以 `Params` 結尾、函式以動詞開頭（如 `getHealth`）。
- `usecase/`：從 repository 取得資料後做整理或商業邏輯，對外型別以 `Dto`、`ParamsDto` 結尾、函式以 `Usecase` 結尾（如 `getHealthUsecase`）。
- View 層預設從 `@/domain` 匯入 usecase，不直接依賴 repository 介面。
- repository 是底層 API 存取層；只有 domain 內部或明確需要底層 API 時，才從 `@/domain/repository` 匯入。

## 查詢順序

1. 先讀 `src/domain/README.md` 判斷 API 類別、路由、JWT 需求。
2. 若要接 UI 或 ViewModel，優先讀 `usecase/*.usecase.ts` 並從 `@/domain` 匯入。
3. 若要確認底層 request/response，讀對應的 `repository/*.repo.ts`，並用 `@/domain/repository` 明確匯入。
4. 只有 backend contract 可能已變更時，才查 backend 的 route/controller/type。

## 共用規則

- 所有 API 函式共用 `src/lib/axios/apiClient`，base URL 由 `VITE_API_BASE_URL` 提供。
- frontend 不直接 import backend 檔案，避免跨 repo 或 Vite bundling 問題。
- backend 的 `Date` 欄位在 JSON response 會變成字串，因此 domain response 型別使用 `string`。
- 錯誤 response 共用 `ApiErrorResponse`：`{ ok: false; message: string }`。Axios 在非 2xx response 會 throw，呼叫端需自行 catch。
- JWT protected API 由函式參數接收 `token`，單次 request 帶 `Authorization: Bearer <token>`；目前沒有全域 token storage 或 interceptor。

## 檔案作用

| 檔案 | 作用 | Backend API | JWT |
| --- | --- | --- | --- |
| `repository/common.ts` | 共用錯誤型別與 Authorization header helper | 無 | 無 |
| `repository/health.repo.ts` | 後端健康檢查 | `GET /health` | 否 |
| `repository/auth.repo.ts` | 註冊、登入與 auth response 型別 | `POST /auth/register`, `POST /auth/login` | 否 |
| `repository/character.repo.ts` | 目前使用者角色讀取與建立 | `GET /characters/me`, `POST /characters` | 是 |
| `repository/itemCatalog.repo.ts` | item catalog 型別、常數與查詢 | `GET /items` | 否 |
| `repository/monsterCatalog.repo.ts` | monster catalog 型別、常數與查詢 | `GET /monsters` | 否 |
| `usecase/*.usecase.ts` | 對應 repository 的 usecase 包裝層 | 同上 | 同上 |
| `repository/index.ts` | 底層 API 層集中 export；需用 `@/domain/repository` 明確匯入 | 無 | 無 |
| `usecase/index.ts`、`index.ts` | View 預設使用的 usecase 集中 export；`@/domain` 只輸出 usecase | 無 | 無 |

## API 摘要

### Health

- `getHealth()`
- Route：`GET /health`
- Response：`{ ok: true; status: 'healthy'; mongo: number }`

### Auth

- `registerUser({ email, password, username })`
- `loginUser({ email, password })`
- Routes：`POST /auth/register`、`POST /auth/login`
- Success response：`{ ok: true; token: string; user: AuthUser }`
- 已知錯誤：註冊 email 重複為 `409 { ok: false; message: 'email already exists' }`；登入失敗為 `401 { ok: false; message: 'email or password is incorrect' }`

### Character

- `getMyCharacter({ token })`
- `createCharacter({ name, gender, spiritualRootType, token })`
- Routes：`GET /characters/me`、`POST /characters`
- Header：`Authorization: Bearer <token>`
- `GET /characters/me` response：`{ ok: true; character: CharacterResponse | null }`
- `POST /characters` body 不可傳 `spiritualRootQuality`，該欄位由 backend 產生。
- 已知錯誤：未授權為 `401 { ok: false; message: 'unauthorized' }`；重複建立角色為 `409 { ok: false; message: 'character already exists' }`

### Item Catalog

- `getItems(filters?)`
- Route：`GET /items`
- Filters：`category`、`usableRealm`、`quality`、`slot`
- Filters 為 backend exact-match query string。
- Response：`{ ok: true; total: number; items: ItemCatalogResponse[] }`

### Monster Catalog

- `getMonsters(filters?)`
- Route：`GET /monsters`
- Filters：`mapId`、`realm`、`quality`、`type`、`isBoss`
- Filters 為 backend exact-match query string；`isBoss` 使用 boolean，axios 會序列化成 query string。
- Response：`{ ok: true; total: number; monsters: MonsterCatalogResponse[] }`

## 範圍限制

- 本層目前只提供 API 參照，不會改 login/home ViewModel 的 mock 資料流。
- 若要把畫面接上 API，請先從 ViewModel 呼叫對應 usecase（如 `loginUserUsecase`、`getMyCharacterUsecase`），不要在 component 內直接操作 axios 或 repository。
- `@/domain` 僅作為 usecase 對外入口；repository API 保留在 `@/domain/repository`。
