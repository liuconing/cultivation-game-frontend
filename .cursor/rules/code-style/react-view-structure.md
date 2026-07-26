# View 結構規則

## 適用範圍

- 新增或調整 `src/views/**` 內的 React 元件時讀取本規則。
- 與 `.cursor/rules/code-style/react-code-style.md`、`.cursor/rules/code-style/js-ts-code-style.md` 搭配使用。

## 資料夾結構

- 每個 view 資料夾需有 `index.ts` 對外 re-export。
- View 可巢狀：父 view（如 `gameShell/`）下可再放子 view（如 `cave/`、`explore/`），每個子 view 各自為完整 view 結構。

```
src/
  views/
    home/
      home.view-controller.tsx
      home.view-model.ts
      index.ts                        // 統一 re-export
    gameShell/
      gameShell.view-controller.tsx
      gameShell.view-model.ts
      gameShell.navigation.tsx        // 該 view 專屬的導覽設定
      index.ts
      explore/                        // 巢狀子 view，結構與一般 view 相同
        explore.view-controller.tsx
        explore.view-model.ts
        explorationResultAdapter.ts   // view 專用純函式／adapter
        hook/
          useExplorationPlayback.ts   // view 專用 hook
        index.ts
```

## 1. 資料夾命名

| 類型         | 命名規則                                       | 範例                                |
| ------------ | ---------------------------------------------- | ----------------------------------- |
| 畫面（View） | camelCase（小寫開頭），一個畫面一個資料夾      | `cave/`、`gameShell/`、`home/`      |
| 子元件集合   | 固定使用 `components/`                         | `explore/components/`               |
| 單一子元件   | PascalCase，一個元件一個資料夾（較複雜時）     | `components/ExploreHeader/`         |
| view 專用 hook | 固定使用 `hook/`                             | `explore/hook/`                     |

- 簡單子元件可直接平放於 `components/` 下，較複雜者再各自開資料夾並附 `index.ts`。

## 2. 檔案命名

- View 主檔前綴一律等於資料夾名（camelCase），如 `gameShell/` 內為 `gameShell.view-controller.tsx`。

| 檔案                                 | 用途                                             | 副檔名規則                        |
| ------------------------------------ | ------------------------------------------------ | --------------------------------- |
| `{資料夾名}.view-controller.tsx`     | View 層，只負責 UI 呈現，從 ViewModel 接收 props | 一律 `.tsx`                       |
| `{資料夾名}.view-model.ts` / `.tsx`  | 邏輯層（hooks、狀態、API）                       | 無 JSX 用 `.ts`，含 JSX 用 `.tsx` |
| `{資料夾名}.navigation.tsx`          | 該 view 專屬的導覽／tab 設定（需要時才建）       | `.tsx`                            |
| `type.ts`                            | 該畫面專屬型別                                   | `.ts`                             |
| `index.ts`                           | 該層 barrel 匯出                                 | `.ts`                             |
| `ComponentName.tsx`                  | 子元件                                           | `.tsx`                            |
| `hook/useXxx.ts`                     | view 專用 hook                                   | `.ts` / `.tsx`                    |
| `xxxAdapter.ts`、`xxxActions.ts` 等  | view 專用純函式／adapter，camelCase 命名         | `.ts`                             |

## 3. View 專用檔案放置

- **view 專用 hook**：放該 view 的 `hook/` 子資料夾（如 `explore/hook/useExplorationPlayback.ts`）；兩個以上 view 共用時才提升到 `src/hook/`。
- **view 專用純函式／adapter**：平放於該 view 資料夾，camelCase 命名（如 `explorationResultAdapter.ts`、`loadoutActions.ts`）；跨頁共用時才提升到 `src/utils/`。
- 跨頁共用邏輯的判斷依 `.cursor/rules/code-style/ui-logic-organization.md`。

## 4. 匯出方式

### View-Controller（`{資料夾名}.view-controller.tsx`）

- **具名匯出** UI 元件：`export function xxxViewController(props: IXxxViewModel) { ... }`
- **default 匯出** 由 `bind` 組裝 ViewModel + ViewController，必要時再包裝 HOC。
- `index.ts` 以 `XxxView` 對外（如 `export { default as ExploreView } from './explore.view-controller'`）。

## 5. 核心原則

- ViewController 只管畫面、ViewModel 只管邏輯，靠 bind 串接。
- Controller 的 props 型別 = ViewModel 的 ReturnType（IXxxViewModel），確保兩層型別同步。
