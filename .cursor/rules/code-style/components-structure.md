# Components 結構規則

## 適用範圍

- 新增或調整 `src/components/**` 內的 React 元件時讀取本規則。
- 與 `.cursor/rules/code-style/react-code-style.md`、`.cursor/rules/code-style/js-ts-code-style.md` 搭配使用。
- 不適用於 `src/views/**` 的頁面級元件，但頁面組合元件時仍從 `@/components` 匯入。
- 僅單一頁面（view）使用的元件，放在該頁面資料夾下（`src/views/<view>/components/`，依 `.cursor/rules/code-style/react-view-structure.md`），不放 `src/components/`，也不需遵守本規則與 HOC 規範。
- 元件被兩個以上頁面使用時，才提升到 `src/components/` 並套用本規則。

## 資料夾結構

- 每個元件一個同名資料夾，元件檔與資料夾同名。
- 每個元件資料夾需有 `index.ts` 對外 re-export。
- `src/components/index.ts` 統一 re-export 所有元件。

```
src/
  components/
    index.ts                 // 統一 re-export
    CharacterCard/
      CharacterCard.tsx      // 元件本體
      index.ts               // export { CharacterCard } from './CharacterCard'
    withAuthGuard/
      withAuthGuard.tsx      // 共用 HOC（見 HOC 規範）
      index.ts               // export { withAuthGuard } from './withAuthGuard'
```

## 命名

- 元件資料夾與檔案使用 PascalCase，與元件名稱一致。
- 元件以 named export 匯出，不使用 default export。

## 匯入規則

- 元件外部（`views`、`App` 等）一律從 `@/components` 匯入，不深入個別檔案路徑。
- 元件互相引用時，使用鄰近資料夾入口的相對路徑，例如 `../Panel`。
- 不直接 import 其他元件的 `.tsx` 檔，改用該元件資料夾的 `index.ts`。

```tsx
// ✅ 外部使用
import { CharacterCard, Panel } from '@/components'

// ✅ 元件之間
import { Panel } from '../Panel'

// ❌ 深入內部檔案
import { Panel } from '@/components/Panel/Panel'
```

## HOC 規範

### 適用對象

- 僅適用於放在 `src/components/` 的共用 High Order Component（HOC）。
- 僅單一頁面使用的 HOC，放在該 view 資料夾下（`src/views/<view>/components/`），不需遵守本規範。
- `src/utils/bind.tsx` 是 ViewModel 串接工具（依 `.cursor/rules/code-style/react-view-structure.md` 使用），不歸入本規範管理。

### 結構與命名

- 共用 HOC 與一般元件同層放置：`src/components/withXxx/`，內含 `withXxx.tsx` 與 `index.ts`。
- 函式、檔案、資料夾一律 `with` 開頭 camelCase（如 `withAuthGuard`）。
- 由 `src/components/index.ts` 統一 re-export。

```
src/
  components/
    withAuthGuard/
      withAuthGuard.tsx      // HOC 本體
      index.ts               // export { withAuthGuard } from './withAuthGuard'
```

### 內容要求

- HOC 為「接收元件、回傳新元件」的函式，需有中文 JSDoc 說明注入的內容與用途。
- 回傳的元件需透傳原始 props，使用泛型保留被包裝元件的 props 型別。
- 不在 HOC 內放業務邏輯（業務邏輯屬 `src/domain/`）。
- 不在 HOC 內執行 DOM 狀態以外的全域副作用。

### 範例

```tsx
// src/components/withAuthGuard/withAuthGuard.tsx
import type { ComponentType } from 'react'

/**
 * 注入登入狀態守衛，未登入時導向登入頁。
 *
 * @param WrappedComponent - 需要登入保護的元件。
 * @returns 包裝後的元件，透傳原始 props。
 */
export const withAuthGuard = <P extends object>(WrappedComponent: ComponentType<P>) => {
  return (props: P) => {
    // 守衛邏輯（呼叫 hook / usecase，不直接寫業務邏輯）
    return <WrappedComponent {...props} />
  }
}
```

```tsx
// ✅ 外部使用
import { withAuthGuard } from '@/components'

export default withAuthGuard(homeViewController)
```

## 新增元件流程

1. 在 `src/components/` 建立 `ComponentName/` 資料夾。
2. 新增 `ComponentName/ComponentName.tsx` 元件本體。
3. 新增 `ComponentName/index.ts` re-export 該元件。
4. 在 `src/components/index.ts` 補上對應 re-export。

## 修改前確認清單

1. 元件是否放在同名資料夾並含 `index.ts`。
2. 元件本體檔名是否與資料夾同名。
3. `src/components/index.ts` 是否已更新 re-export。
4. 外部是否透過 `@/components` 匯入，而非深入內部檔案。
5. 元件是否僅單一頁面使用；若是，應放在 `src/views/<view>/components/` 而非本資料夾。
6. HOC 是否符合 `withXxx` 命名並透傳原始 props。
