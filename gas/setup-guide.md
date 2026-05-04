# 婚禮記帳 GAS 部署指南

## 步驟一：建立 Google Sheets

1. 前往 [Google Sheets](https://sheets.google.com) 建立新試算表
2. 將試算表命名為「婚禮記帳」
3. 複製網址中的 Spreadsheet ID（格式：`1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms`）

## 步驟二：建立 Google Drive 資料夾

1. 前往 [Google Drive](https://drive.google.com) 建立新資料夾「婚禮記帳收據」
2. 開啟資料夾，複製網址中的 Folder ID

## 步驟三：建立 Google Apps Script

1. 前往 [Google Apps Script](https://script.google.com) → 新增專案
2. 將專案命名為「婚禮記帳後端」
3. 將以下檔案內容貼入 Apps Script 編輯器（點 + 新增檔案）：
   - `Code.gs` → 貼入 `gas/Code.gs` 的內容
   - `Sheets.gs` → 貼入 `gas/Sheets.gs` 的內容
   - `Transactions.gs` → 貼入 `gas/Transactions.gs` 的內容
   - `Settings.gs` → 貼入 `gas/Settings.gs` 的內容
   - `Dashboard.gs` → 貼入 `gas/Dashboard.gs` 的內容
   - `Stats.gs` → 貼入 `gas/Stats.gs` 的內容
   - `Receipt.gs` → 貼入 `gas/Receipt.gs` 的內容

## 步驟四：設定 Script Properties

1. 在 Apps Script 編輯器：「專案設定」→「指令碼屬性」→「新增屬性」

| 屬性名稱 | 值 |
|---------|---|
| `SPREADSHEET_ID` | 步驟一複製的 ID |
| `DRIVE_FOLDER_ID` | 步驟二複製的 ID |
| `GEMINI_API_KEY` | Gemini API 金鑰（收據掃描用，可選） |

### 取得 Gemini API Key
1. 前往 [Google AI Studio](https://aistudio.google.com)
2. 點擊「Get API Key」→「Create API Key」
3. 複製 API Key 貼入 `GEMINI_API_KEY`

## 步驟五：部署 Web App

1. 在 Apps Script 編輯器：「部署」→「新增部署作業」
2. 選擇類型：**網頁應用程式**
3. 設定：
   - 執行身分：**我**
   - 誰可以存取：**任何人**
4. 點擊「部署」，複製 Web App URL

> URL 格式：`https://script.google.com/macros/s/AKfycb.../exec`

## 步驟六：設定前端連線

1. 開啟婚禮記帳 App（GitHub Pages URL）
2. 選擇使用者後進入 App
3. 前往「說明書」頁（底部導覽列最右側）
4. 在「⚙️ 連線設定」貼入 Web App URL
5. 點「儲存並測試連線」

## 更新後端版本

修改 GAS 程式後需重新部署：
1. 「部署」→「管理部署作業」
2. 點「編輯」（鉛筆圖示）
3. 版本選「**建立新版本**」
4. 點「部署」

## GitHub Pages 部署

1. 在 GitHub 建立新 repository（例如 `wedding-budget`）
2. 推送程式碼：
   ```bash
   git init
   git add .
   git commit -m "Initial release v1.0.0"
   git remote add origin https://github.com/YOUR_USERNAME/wedding-budget.git
   git push -u origin main
   ```
3. 至 Repository Settings → Pages → Source 選 `gh-pages` branch
4. 之後每次 `git push origin main` 會自動部署

## 常見問題

**Q: 測試連線失敗？**
- 確認 Script Properties 的 SPREADSHEET_ID 正確
- 確認部署時「誰可以存取」設為「任何人」
- 確認 Sheets 試算表已建立且 GAS 帳號有存取權限

**Q: 收據掃描失敗？**
- 確認 GEMINI_API_KEY 已設定
- 確認 API Key 未超過免費額度
- 圖片建議 < 4MB，解析度 < 1600x1600

**Q: 兩人資料如何同步？**
- 資料儲存於 Google Sheets，兩人共用同一 GAS 後端
- 新增記帳後立即寫入 Sheets，另一方重新載入頁面即可看到最新資料
