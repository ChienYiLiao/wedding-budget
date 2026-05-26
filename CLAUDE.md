# 廖千儀 ♥ 陳郁諠 婚禮記帳 App

## 使用者

| 暱稱 | 真實姓名 | 角色 |
|------|---------|------|
| 豬豬 🐷 | 廖千儀 | 新郎（男方） |
| 滾滾 🧚‍♀️ | 陳郁諠 | 新娘（女方） |

- **計劃婚期**：2026 年底至 2027 年中（App 預設 2027-05-03）
- **婚宴形式**：簡化版，僅結婚宴（無訂婚宴）
- **婚禮總預算**：NT$1,000,000（可在 Dashboard 修改）

---

## 專案規則（必須遵守）

1. 所有內容依照**台灣本土習俗**，不採用中國大陸習俗
2. 語言：**繁體中文**
3. 貨幣：**新台幣（NT$）**
4. 兩位使用者的暱稱固定為「豬豬」和「滾滾」，不可更改

---

## 技術架構

```
前端：純 HTML + CSS + JavaScript（無框架）
後端：Google Apps Script (GAS)，部署為 Web App
資料庫：Google Sheets（透過 GAS 讀寫）
頭像儲存：Google Drive
AI 功能：Gemini API（收據辨識，瀏覽器直接呼叫）
部署：GitHub Actions → GitHub Pages（自動）
```

### API 通訊規則（重要）
- **讀取**：`GET ?action=xxx`
- **寫入**：`GET ?payload=JSON`（不用 POST，避免 GAS 302 redirect 問題）
- GAS URL 由使用者在「說明書」頁設定，儲存於 `localStorage('gasUrl')`

---

## 目前版本：v1.0.6

### 已實作功能
- **Dashboard**：婚禮倒數天數、總預算進度條、類別圓餅圖、今日/本月統計
- **手動記帳**：底部 Sheet 滑入表單、支出（15 類）/ 收入（4 類）、撤銷 Toast
- **AI 收據辨識**：雲端發票 + 紙本發票，Gemini API 擷取店名/金額/品項/稅別
- **多人記帳**：豬豬 / 滾滾，頭像自定義（拍攝 + Cropper.js 裁切）
- **歷史記錄**：月份瀏覽、篩選（類別/支付/人員）、刪除
- **統計分析**：逐月趨勢長條圖、類別圓餅圖、人員分析、自訂日期範圍
- **說明書**：功能指引、GAS URL 設定、Gemini API Key 設定

---

## 檔案結構

```
wedding-budget/
├── index.html                    # 入口頁（使用者選擇）
├── app.html                      # 主 App（SPA，含所有頁面）
├── CLAUDE.md                     # 本說明文件
├── CHANGELOG.md                  # 版本記錄
├── css/
│   ├── variables.css             # 色彩、間距等 CSS 變數
│   ├── layout.css                # 頁面佈局、卡片、底部導覽列
│   └── components.css            # 按鈕、表單、Toast、Modal 等元件
├── js/
│   ├── config.js                 # 全域設定（使用者/類別/付款方式/顏色）
│   ├── state.js                  # 全域狀態管理（currentUser、settings 等）
│   ├── router.js                 # 單頁路由（hash-based）
│   ├── api.js                    # 與 GAS 溝通的 API 層
│   ├── utils.js                  # 通用工具函式（頭像、日期格式等）
│   ├── components/
│   │   ├── navbar.js             # 底部導覽列
│   │   ├── modal.js              # 通用 Modal
│   │   ├── toast.js              # Toast 通知（含撤銷）
│   │   ├── loader.js             # 載入動畫
│   │   └── avatar-cropper.js    # 頭像裁切（Cropper.js）
│   └── pages/
│       ├── dashboard.js          # Dashboard 頁
│       ├── add-transaction.js    # 新增記帳頁
│       ├── history.js            # 歷史記錄頁
│       ├── stats.js              # 統計分析頁
│       ├── receipt-scan.js       # AI 收據辨識頁
│       └── guide.js              # 說明書頁
├── gas/
│   ├── Code.gs                   # GAS 入口（doGet/doPost 路由）
│   ├── Sheets.gs                 # Google Sheets 讀寫底層
│   ├── Transactions.gs           # 記帳新增/刪除邏輯
│   ├── Settings.gs               # 設定讀寫（婚期、總預算）
│   ├── Dashboard.gs              # Dashboard 資料彙整
│   ├── Stats.gs                  # 統計分析（跨月範圍查詢）
│   ├── Receipt.gs                # AI 收據辨識（Gemini）
│   └── setup-guide.md            # GAS 部署說明（給人看的）
├── assets/
│   └── default-avatars/
│       ├── pigpig.png            # 豬豬預設頭像
│       └── gungun.png            # 滾滾預設頭像
└── .github/
    └── workflows/deploy.yml      # GitHub Actions → GitHub Pages
```

---

## 開發工作流程

### 修改前端（HTML/CSS/JS）
```bash
git add .
git commit -m "描述改了什麼"
git push origin main
# GitHub Actions 自動部署到 GitHub Pages（約 1 分鐘）
```

### 修改 GAS 後端（gas/*.gs）
1. 到 [script.google.com](https://script.google.com) 開啟「婚禮記帳後端」專案
2. 將修改後的 `.gs` 內容貼入對應檔案
3. 「部署」→「管理部署作業」→「編輯」→「建立新版本」→「部署」
4. ⚠️ **GAS 修改後必須重新部署才會生效**，不像前端 push 就好

### GAS Script Properties（環境變數）
| 屬性名稱 | 說明 |
|---------|------|
| `SPREADSHEET_ID` | Google Sheets 的 ID |
| `DRIVE_FOLDER_ID` | Drive 頭像存放資料夾 ID |
| `GEMINI_API_KEY` | Gemini AI API 金鑰（收據掃描用） |

---

## 費用類別（config.js 定義）

### 支出（15 類）
聘金、結婚對戒、喜餅/訂婚餅、婚宴飯店、嫁妝、喜帖、結婚小物、婚紗攝影、新娘秘書/造型、婚禮布置/花藝、蜜月旅遊、婚車、主持人/音響、訂婚戒指、其他

### 收入（4 類）
贊助、禮金、彩禮回禮、其他

---

## Preparation item 資料夾

`Preparation item/` 資料夾放著婚禮規劃工具（由 Cowork 製作），作為**費用資料來源與設計參考**：

### `wedding_checklist_v2.xlsx`（主要參考）
Excel 婚禮規劃表，共 5 個工作表：
- **甘特圖**：43 個待辦事項，C2 格為婚期輸入（預設 2026/12/06）。隱藏欄 R/S/T 用 EDATE 公式計算每列起訖日，共 825 個公式，修改婚期後圖列自動連動
- **完整 Checklist**：52 個項目，含到期日（連動婚期）、逾期狀態（🔴🟡🟢）、台灣習俗備註、預算參考
- **男方（廖千儀）**：18 個男方專屬項目（聘禮、婚房、迎娶流程、聘金等）
- **女方（陳郁諠）**：17 個女方專屬項目（婚紗、嫁妝、出嫁儀式、歸寧等）
- **使用說明**：台灣習俗說明（聘金/六禮/嫁妝/迎娶/歸寧）、操作說明、Q&A

### `wedding_planner.html`（設計參考）
互動式 HTML 婚禮規劃頁（826 行），功能：
- 5 個 Tab：完整 Checklist、甘特圖、時間軸、男方清單、女方清單
- 頂部婚期日期輸入框（修改後所有 deadline 自動連動）
- 甘特圖用相對婚期偏移（0 = 婚禮月，-7 = 婚禮前 7 個月）
- 色系：深紫 `#4A1942`、粉紅 `#C9506E`、藍 `#3A6EA5`、紫 `#6A4C93`
- 可借用此頁的台灣婚禮費用項目清單與台灣習俗說明文字

### `wedding_checklist.xlsx`（舊版，忽略）
已被 v2 取代，請忽略。

---

## 相關姐妹專案

位置：`C:\ClarkLiao\2026\01. GPT class\Claude cowork area\Wedding plan\Wedding project\`

- `wedding_checklist_v2.xlsx`：同上（正本存放於此）
- `wedding_planner.html`：同上（正本存放於此）

---

## 給 Claude Code 的注意事項

- 修改費用類別時，同步更新 `config.js` 的 `EXPENSE_CATEGORIES`
- GAS 後端採用 GET + payload 寫入，不用 POST（見 `api.js` 實作方式）
- Stats.gs 的日期欄位需用 `_getYM()` 處理，Google Sheets 會把文字日期轉成 Date 物件
- 頭像有三層 fallback：自訂圖片 → 預設圖片（assets/）→ emoji
- 修改完記得更新 `CHANGELOG.md`，格式參考現有條目

## 版本紀錄

| 日期 | 說明 |
|------|------|
| 2026/05/04 | v1.0.0 初始版本發布 |
| 2026/05/05 | v1.0.4 修復時間格式、AI 收據辨識改瀏覽器直呼 Gemini |
| 2026/05/05 | v1.0.5–1.0.6 統計頁新增跨月範圍查詢 |
| 2026/05/26 | CLAUDE.md 全面更新，整合真實專案架構 |
