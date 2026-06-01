# AGENTS.md

## 目標

# Agent Instructions

本專案的 AI Agent 規則以此檔案為主入口。

## Rule Loading Policy

修改程式碼前，先判斷任務涉及的檔案類型與資料夾，再讀取對應規則。

不要套用與目前任務無關的規則。

## Rules Index

### JS / TS 通用規則

讀取條件：

- 修改 `*.ts`
- 修改 `*.tsx`
- 修改 `*.js`
- 修改 `*.jsx`

規則檔案：

- `.cursor/rules/code-style/js-ts-code-style.md`
- `.cursor/rules/code-style/jsdoc-rule.md`

### React 規則

讀取條件：

- 修改 React 元件
- 修改 `*.tsx`
- 修改 `*.jsx`
- 修改 React hooks、props、event handler、component state

規則檔案：

- `.cursor/rules/code-style/react-code-style.md`

### Vue 規則

讀取條件：

- 修改 `*.vue`
- 修改 Vue Composition API
- 修改 `ref`、`reactive`、`computed`、`emit`

規則檔案：

- `.cursor/rules/code-style/vue-code-style.md`

不要在非 Vue 專案或非 Vue 檔案中套用 Vue 專屬命名規則。

## Priority

若規則衝突，依序遵守：

1. 使用者當前明確指令
2. 最接近被修改檔案的局部規則
3. 框架專屬規則
4. JS / TS 通用規則
5. 專案既有寫法

## General Rules

- 修改前先觀察既有命名、資料流、檔案結構。
- 不做與任務無關的重構。
- 新增命名時優先沿用專案 domain language。
- 修改命名時需同步檢查引用點。
- 若不確定某規則是否適用，優先避免套用框架專屬規則。
- 以最少必要閱讀與最小可行修改完成任務。
- 回覆精簡，只提供完成任務所需資訊。
- 非必要不要讀：`dist/`、`build/`、`coverage/`、`node_modules/`、鎖檔、圖片與產生檔。
- 涵式、變數需要加上 JavaScript Documentation 以中文為主英文為輔

## 除錯流程

- 先確認問題發生位置，再讀相關檔案；不一開始就全 repo 搜。
- 資訊不足時先問 1 個最關鍵的澄清問題，不連問多題。
- 能先做最小修正驗證就不做大改。

## 輸出規則

- 回覆精簡，依序回報：修改了哪些檔案、做了什麼改動、是否還需手動驗證。
- 不貼大段程式碼、不貼長篇 log / lint / build 輸出，除非明確要求。
- 不重述任務背景。

## 測試規則

- 只執行與當前任務最相關的檢查。
- template / style 小修非必要不跑整包測試；單元邏輯修正優先跑最小範圍驗證。
- 無法執行測試時明確指出原因，不編造結果。
