# React 程式碼風格規則

## 適用範圍

- 適用於 `*.tsx`。
- 適用於 `*.jsx`。
- 適用於 React components、hooks、props、event handlers。
- JS / TS 通用規則仍需遵守；本檔只補充 React 專屬規則。
- 優先沿用既有 React 版本、hooks、狀態管理、路由與元件拆分模式。
- 不為了套用規則重構無關元件。
- 不要使用 Vue 的 `Ref` / `Reactive` 命名後綴。

## React 狀態命名

- React hook 回傳的狀態使用領域名詞，不加不必要後綴。
- `useState` setter 使用 `set` 加狀態名稱。
- 集合資料優先使用複數名詞。
- 避免 `usersList`、`ordersList` 這類冗餘命名。

```tsx
const [users, setUsers] = useState<User[]>([])
const [currentPage, setCurrentPage] = useState(1)
```

## React 事件命名

- React event handler props 使用 `on` 開頭。
- React component 內部事件處理使用 `handle` 開頭。
- 名稱需描述實際行為。
- 避免只寫 `handleClick`，除非語境已非常明確。

```tsx
type UserFormProps = {
  onSubmit: ({ values }: SubmitParams) => void
  onCancel: () => void
}

/**
 * 處理表單送出。
 */
const handleSubmit = ({ values }: SubmitParams): void => {
  onSubmit({ values })
}
```

## React 衍生資料命名

- `useMemo` 衍生資料使用描述性名稱。
- React `useMemo` 衍生資料可使用描述性名稱，必要時才加 `List`。
- 原始集合資料不加 `List`。
- 不混用 `users`、`userRows`、`userList` 表示同一份資料。

```tsx
const activeUserList = useMemo(() => {
  return users.filter((user) => user.status === 'active')
}, [users])
```

## React Ref 命名

- React `useRef` 命名應依用途命名。
- 不要套用 Vue 的 `Ref` 後綴規則。
- DOM ref 可使用描述用途的名稱，例如 `formElementRef` 或沿用專案既有慣例。

## AI Agent 執行規則

- 修改 `*.jsx`、`*.tsx` 前需同時套用本規則與 `.cursor/rules/code-style/js-ts-code-style.md`。
- 若專案已有更接近元件的 React 規則，優先遵守局部規則。
- 不要使用 Vue 的 `Ref` / `Reactive` 命名後綴。
- 不主動更換 state management、routing、component library。
- 不因命名規則重構無關 hooks 或元件。
