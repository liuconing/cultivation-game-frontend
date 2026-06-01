---
name: lib-isolation
description: >-
  為此專案新增第三方套件時，透過 src/lib/ 建立隔離封裝層的完整流程。
  包含辨識封裝模式、建立資料夾與 index.ts、更新既有 import 路徑。
  當使用者提到「安裝套件」、「新增依賴」、「import 第三方」、「加入 lib」時使用。
  **排除**：VUE、REACT、VITE、react-router、vue-router、tailwindcss、nuxt、nextJS。

  Guides creating an isolation wrapper in src/lib/ whenever a third-party package
  is installed in this project. Covers pattern selection, folder/index.ts creation,
  and import path updates. Use when the user mentions "install package", "add dependency",
  "import third-party", or "add to lib".
  **Excludes**: VUE, REACT, VITE, react-router, vue-router, tailwindcss, nuxt, nextJS.
---

# lib-isolation

安裝新套件時，**一律**在 `src/lib/<package-name>/index.ts` 建立封裝層，其他模組只從 `@/lib/<package-name>` import，不直接 import 原始套件。

## 封裝模式速查

依套件特性選擇一種模式，可混用：

| 模式 | 適用場景 | 範例套件 |
|------|----------|----------|
| **A — 全量 re-export** | API 穩定、不需 tree-shaking | pinia |
| **B — 選擇性 re-export** | tree-shaking / 限制對外 API | lodash, bignumber.js |
| **C — 重命名 / alias** | 統一命名、隱藏原始 API | uuid |
| **D — 設定實例** | 需要初始化 config 或 interceptor | axios |
| **E — CSS 副作用 + 選擇性匯出** | UI 元件需要 import 樣式 | element-plus |

## 各模式範本

### A — 全量 re-export
```ts
// src/lib/some-pkg/index.ts
export * from 'some-pkg'
```

### B — 選擇性 re-export（cherry-pick）
```ts
// src/lib/some-pkg/index.ts
export { methodA } from 'some-pkg'
export { methodB } from 'some-pkg'
// 只匯出此專案實際使用的方法
```

### C — 重命名 / alias
```ts
// src/lib/some-pkg/index.ts
import { originalFn } from 'some-pkg'
export const projectFriendlyName = originalFn
```

### D — 設定實例
```ts
// src/lib/some-pkg/index.ts
import SomePkg from 'some-pkg'

const instance = SomePkg.create({
  // 專案級設定
})

export { SomePkg, instance }
```

### E — CSS 副作用 + 選擇性匯出
```ts
// src/lib/some-pkg/index.ts
import 'some-pkg/dist/index.css'
import SomePkg, { ComponentA } from 'some-pkg'

export { SomePkg, ComponentA }
```

## 安裝流程

```
1. npm install <package>
2. 建立 src/lib/<package-name>/index.ts
3. 套用上方對應模式
4. 全專案將 import 'package' 改為 import '@/lib/<package-name>'
5. 若有自訂型別，另建 interface.ts 並在 index.ts 中 import
```

## 既有 lib 對應表

| 路徑 | 原始套件 | 模式 |
|------|----------|------|
| `@/lib/axios` | axios | D |
| `@/lib/vue-query` | @tanstack/vue-query | A + 額外型別 |
| `@/lib/pinia` | pinia | A |
| `@/lib/lodash` | lodash | B |
| `@/lib/bigNumber` | bignumber.js | B |
| `@/lib/uuid` | uuid | C |
| `@/lib/element-plus` | element-plus | E |
| `@/lib/local-storage` | — | 自訂實作（無第三方） |

## 注意事項

- 排除下列套件，**不需要** `src/lib` 封裝：VUE、REACT、VITE、react-router、vue-router、tailwindcss、nuxt、nextJS
- `local-storage` 是自訂實作，不對應第三方套件，不套用此流程
- 若套件有自訂型別需求，在同資料夾建立 `interface.ts`，參考 `src/lib/local-storage/interface.ts`
- 封裝層只做「隔離與配置」，不放業務邏輯；業務邏輯屬於 `src/domain/`
