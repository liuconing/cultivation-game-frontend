# Vue 程式碼風格規則

## 適用範圍

- 適用於 `*.vue`。
- 適用於 Vue Composition API。
- 修改 `ref`、`reactive`、`computed`、`emit` 時讀取本規則。
- JS / TS 通用規則仍需遵守；本檔只補充 Vue 專屬規則。
- 優先沿用既有 Vue 版本、Composition API 寫法、狀態管理與命名模式。
- 不為了套用規則重構無關元件。
- 不要在 React、Node、純 TypeScript 檔案中套用此命名規則。

## Vue 響應式狀態命名

- Vue 檔案中使用 `ref` 宣告的響應式狀態，變數名稱需以 `Ref` 結尾。
- Vue 檔案中使用 `reactive` 宣告的響應式狀態，變數名稱需以 `Reactive` 結尾。
- 後綴需對應實際 API。
- 不混用 `Ref` 與 `Reactive` 後綴。

```ts
const borrowRowsRef = ref<BorrowRow[]>([])

const settingsReactive = reactive<SettingsState>({
  theme: 'light',
  pageSize: 20,
})
```

## Vue 衍生資料命名

- `computed` 衍生資料使用描述性名稱。
- Vue `computed` 衍生資料可使用描述性名稱，必要時才加 `List`。
- 原始集合資料不加 `List`。
- 避免用 `data`、`list`、`items` 表示不明確資料。

```ts
const usersRef = ref<User[]>([])

const activeUserList = computed(() => {
  return usersRef.value.filter((user) => user.status === 'active')
})
```

## Vue 事件命名

- 元件內部事件處理函式使用 `handle` 開頭。
- Vue emit / props 命名需與專案既有慣例一致。
- 對外 emit 事件使用既有專案定義的事件名稱。
- 事件名稱需描述實際行為，不使用模糊的 `handleClick`。

```ts
/**
 * 處理建立按鈕點擊。
 */
const handleCreateButtonClick = (): void => {
  emit('create')
}
```

## AI Agent 執行規則

- 修改 `*.vue` 前需同時套用本規則與 `.cursor/rules/code-style/js-ts-code-style.md`。
- 若專案已有更接近元件的 Vue 規則，優先遵守局部規則。
- 不要在 React、Node、純 TypeScript 檔案中套用 Vue `Ref` / `Reactive` 命名規則。
- 不主動把 Options API 改成 Composition API，除非使用者明確要求。
- 不因命名規則重構無關 reactive/ref 狀態。
