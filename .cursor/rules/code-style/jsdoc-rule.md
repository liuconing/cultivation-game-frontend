# JSDoc 註解規則

## 適用範圍

- 適用於 `*.ts`、`*.tsx`、`*.js`、`*.jsx`。
- 作為 JavaScript / TypeScript 函式與變數的註解基礎規則。
- 與 `.cursor/rules/code-style/js-ts-code-style.md` 搭配使用。
- Vue / React 任務仍需再讀取對應框架規則。

## 語言規則

- JSDoc 以中文為主、英文為輔。
- 說明用途與意圖，不寫流水帳、不逐行翻譯程式碼。
- 沿用專案既有 domain language 描述。

## 函式註解

- 每個函式都需要 JSDoc，包含內部函式與事件處理函式。
- 第一行描述函式用途。
- 有參數時需描述參數用途。
- 有回傳值時需描述回傳內容。
- 非同步函式描述最終結果，不需特別標註 `Promise`。

```ts
/**
 * 驗證使用者登入並回傳含 JWT 的驗證結果。
 *
 * @param input - 登入所需的 email 與密碼。
 * @returns 驗證成功的結果；帳號不存在或密碼錯誤時回傳 null。
 */
const loginUser = async (input: LoginInput): Promise<AuthResponse | null> => {
  // ...
}
```

## 物件參數註解

- 函式使用物件參數時，`@param` 只描述整體用途。
- 各欄位描述寫在 interface / type 定義的欄位上方，作為型別文件。
- 不在函式 JSDoc 逐欄重複欄位描述，也不使用 `@property` 或 `@param params.x` 標籤（`@property` 僅用於 `@typedef`）。

```ts
interface VerifyPasswordParams {
  /** 待驗證的明文密碼。 */
  password: string
  /** 儲存的 `salt:hash` 雜湊字串。 */
  passwordHash: string
}

/**
 * 驗證明文密碼是否與儲存的雜湊相符。
 *
 * @param params - 待驗證的明文密碼與儲存的雜湊字串。
 * @returns 密碼是否相符。
 */
const verifyPassword = async ({ password, passwordHash }: VerifyPasswordParams) => {
  // ...
}
```

## 無參數與無回傳

- 沒有參數時不寫 `@param`。
- 沒有回傳值時不寫 `@returns`。
- 僅保留用途說明即可。

```ts
/**
 * 連線資料庫後啟動 HTTP 伺服器。
 */
const startServer = async () => {
  // ...
}
```

## 框架簽名函式

- Express handler 等框架固定簽名 `(request, response)` 仍需 JSDoc。
- 未使用的參數（如 `_request`）需在 `@param` 標註未使用。

```ts
/**
 * 回傳服務健康狀態與 MongoDB 連線狀態。
 *
 * @param _request - Express 請求物件（未使用）。
 * @param response - Express 回應物件。
 */
const getHealth = (_request: Request, response: Response) => {
  // ...
}
```

## 變數註解

- 需要說明意圖的模組層級變數與常數需加上 JSDoc。
- 命名已能清楚表達語意的區域變數可不加註解。
- 註解描述用途與限制，不重述型別。
- 數值常數（magic number）需說明數值代表的意義或單位。
- 單行說明可使用單行 JSDoc，不必展開多行。

```ts
/** scrypt 衍生金鑰的位元組長度。 */
const keyLength = 64
```

## AI Agent 執行規則

- 新增或修改函式時，同步建立 JSDoc。
- 進行 rename 時需同步更新 JSDoc 內的名稱描述。
- 不為了補註解而重複程式碼已表達的內容。
- 若既有局部規則與本規則衝突，優先遵守更接近該檔案的局部規則。
