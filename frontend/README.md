# 慢慢日常｜A 前端（11/23–11/29）

這份資料夾只放 A 的今日習慣與設定功能，供組員合併到同一個前端專案。沿用核可的奶油白、鼠尾草綠與手繪風格，保留手機版貓咪上方文字的位置。

## 目前狀態

- 今日清單、新增／編輯、早中晚、內建圖示、兩種目標與重複日已完成。
- 公開展示仍使用各瀏覽器的本機資料，不是跨裝置同步。
- Supabase 專案與 13 張表已確認，包含 D 新增的 user_consents；雲端 service adapter 已準備。
- 正式資料庫 SQL 已經使用者明確同意後套用，並以交易回滾驗證本人儲存、重送去重、版本衝突、跨帳號隔離及匿名拒絕。請閱讀 `../supabase/CHANGE_REVIEW.md`，勿重複執行該 migration。
- A、B 前端尚未合併；A 將接 B／D 的共用登入 client，不建立第二套帳號流程。
- Vercel 專案已建立，由 A 的帳號管理；部署網址為 https://slow-days-companion.vercel.app 。發布與更新方式見 `../docs/a/DEPLOYMENT.md`。驗證信與密碼重設回跳路徑仍待 B／D 確認。

## 資料夾分類

| 路徑              | 內容／負責人                                               |
| ----------------- | ---------------------------------------------------------- |
| `src/pages/`      | 今日與習慣設定畫面，A                                      |
| `src/components/` | 習慣列、設定表單、共用插畫，A／B 可共用                    |
| `src/styles/`     | 基礎、版面、今日、設定、表單、手機版分開保存               |
| `src/assets/`     | 原創睡貓 PNG、網站標記                                     |
| `src/domain/`     | 習慣資料格式、目標與日期驗證                               |
| `src/services/`   | 本機儲存、Supabase adapter、client 與型別介面；C／D 串接點 |
| `src/config/`     | 專案 API URL、可公開的 publishable key；沒有管理金鑰       |
| `src/utils/`      | 共用文字轉義與顯示工具                                     |
| `../supabase/`    | 已套用 SQL 與影響範圍，供 C／D 串接                        |
| `../docs/a/`      | 串接說明、目前同步狀態、前端網址對齊事項                   |
| `tests/`          | 本機邏輯、adapter 與畫面輸出合約測試                       |
| `scripts/`        | 開發、檢查與打包工具                                       |

`src/habit-app.js` 只處理畫面掛載、事件與狀態；各畫面的 HTML 與表單已拆到 pages／components。

## 在自己的電腦執行

使用目前支援的 Node.js 版本後：

```sh
npm ci
npm run dev
```

預設網址：`http://localhost:5173`。每位組員的 localhost 都是自己的電腦。

```sh
npm run check
npm test
npm run build
```

`dist/` 是自動產生的網站發布檔，直接修改 src，再重新 build。`npm run format` 可整理排版。

## 與其他組員合併

請先共用一份程式庫、頁面導覽及 B／D 的登入狀態，再把 A 模組掛進容器。範例在 `../docs/a/INTEGRATION.md`；不要把 A、B 各自部署的網站當成已合併完成。

小組程式碼統一放在 https://github.com/wabyyy/habit-pet ，Google Drive 不再更新。依主 README 的分支與 PR 流程合併；網站使用者資料仍需透過登入與 Supabase 服務串接。
