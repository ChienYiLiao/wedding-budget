# Changelog

All notable changes to this project will be documented in this file.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.0.1] - 2026-05-04
### Added
- 豬豬/滾滾預設頭像圖片（自訂 > 預設圖片 > emoji 三層 fallback）
### Changed
- 婚禮日期預設為 2027-05-03（可在 Dashboard 點擊倒數區塊修改）
- 婚禮總預算預設為 NT$1,000,000（可在 Dashboard 點擊預算進度條修改）

## [1.0.0] - 2026-05-04
### Added
- 初始版本發布
- Dashboard：婚禮倒數天數、總預算進度條、類別圓餅圖、今日/本月統計
- 手動記帳：底部 Sheet 滑入表單、支出（15 類）/ 收入（4 類）
- AI 收據辨識：雲端發票 + 紙本發票，Gemini API 繁體中文擷取店名/金額/品項/稅別
- 多人記帳：豬豬 / 滾滾，頭像自定義（拍攝 + Cropper.js 裁切）
- 退回功能：底部 Sheet + dirty-state 確認彈窗 + 5 秒 Toast 撤銷
- 歷史記錄：月份瀏覽、篩選（類別/支付/人員）、刪除
- 統計分析：逐月趨勢長條圖、類別占比圓餅圖、人員分析
- 說明書：各功能使用指引
- GitHub Actions 自動部署至 GitHub Pages
