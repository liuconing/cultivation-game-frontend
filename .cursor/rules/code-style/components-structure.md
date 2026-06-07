# Components 結構規則

## 適用範圍

- 新增或調整 `src/components/**` 內的 React 元件時讀取本規則。
- 與 `.cursor/rules/code-style/react-code-style.md`、`.cursor/rules/code-style/js-ts-code-style.md` 搭配使用。
- 不適用於 `src/views/**` 的頁面級元件，但頁面組合元件時仍從 `@/components` 匯入。

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
