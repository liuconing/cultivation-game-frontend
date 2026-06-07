# View 結構規則

## 適用範圍

- 新增或調整 `src/view/**` 內的 React 元件時讀取本規則。
- 與 `.cursor/rules/code-style/react-code-style.md`、`.cursor/rules/code-style/js-ts-code-style.md` 搭配使用。

## 資料夾結構

- 每個元件資料夾需有 `index.ts` 對外 re-export。

```
src/
  view/
    home/
      home.view-controller.tsx
      home.view-model.ts
      index.ts              // 統一 re-export
```

## 1. 資料夾命名

| 類型         | 命名規則                                   | 範例                                   |
| ------------ | ------------------------------------------ | -------------------------------------- |
| 畫面（View） | CamelCase，一個畫面一個資料夾              | `sport/`、`withdrawalRecord/`、`home/` |
| 子元件集合   | 固定使用 `components/`                     | `sport/components/`                    |
| 單一子元件   | PascalCase，一個元件一個資料夾（較複雜時） | `components/SportHeader/`              |

- 簡單子元件可直接平放於 `components/` 下（如 `service/components/TextCopy.tsx`），較複雜者再各自開資料夾並附 `index.ts`。

## 2. 檔案命名

| 檔案                         | 用途                                             | 副檔名規則                        |
| ---------------------------- | ------------------------------------------------ | --------------------------------- |
| `Xxx.view-controller.tsx`    | View 層，只負責 UI 呈現，從 ViewModel 接收 props | 一律 `.tsx`                       |
| `Xxx.view-model.ts` / `.tsx` | 邏輯層（hooks、狀態、API）                       | 無 JSX 用 `.ts`，含 JSX 用 `.tsx` |
| `type.ts`                    | 該畫面專屬型別                                   | `.ts`                             |
| `index.ts`                   | 該層 barrel 匯出                                 | `.ts`                             |
| `ComponentName.tsx`          | 子元件                                           | `.tsx`                            |

## 3. 匯出方式

### View-Controller（`xxx.view-controller.tsx`）

- **具名匯出** UI 元件：`export function xxxViewController(props: IXxxViewModel) { ... }`
- **default 匯出** 由 `bind` 組裝 ViewModel + ViewController，必要時再包裝 HOC：

## 4. 核心原則

- ViewController 只管畫面、ViewModel 只管邏輯，靠 bind 串接。
- Controller 的 props 型別 = ViewModel 的 ReturnType（IXxxViewModel），確保兩層型別同步。
