# A 前端部署與更新

## 現有網站

- Vercel project：slow-days-companion。
- 專案 ID：prj_ejd5PSj0BmqXT9EkUxu6BWOv2lQF。
- 管理範圍：katty930126-3392，由 A 的帳號管理。
- 公開網址：https://slow-days-companion.vercel.app 。
- GitHub：https://github.com/wabyyy/habit-pet 。程式碼改以此儲存庫為主，Google Drive 不再更新。
- 目前範圍：A 的 11/23–11/29 前端，本機草稿模式。

既有網站已透過上傳建置完成的檔案發布，平台狀態為 READY，且已確認首頁、JavaScript、CSS 與睡貓圖片可匿名取得。這次把可維護的原始碼分類匯入 GitHub，Git 自動部署須另外完成連接及驗證。

## GitHub 版本的建置設定

| 設定             | 值                                 |
| ---------------- | ---------------------------------- |
| Root Directory   | frontend                           |
| Framework        | Other／無框架                      |
| Node.js          | 22.x                               |
| Install Command  | npm ci                             |
| Build Command    | npm run build                      |
| Output Directory | dist                               |
| 正式分支         | main，依 README 完成組員檢查後合併 |

frontend/vercel.json 已保存安裝、建置、輸出與回應標頭設定。從 GitHub 發布時，不能沿用第一次直接發布 dist 產物時的空白建置設定；需使用上表。

在既有 slow-days-companion 專案的 Settings → Git 連接 wabyyy/habit-pet，並確認 Root Directory 為 frontend。第一次連接後，驗證確實使用預期的 Git commit 建置；只有 Git Source 的單次部署不代表後續 push 已會自動觸發。

目前為 Hobby 方案，私人儲存庫的自動部署會檢查 Git commit 作者權限。組員透過 PR 協作，由網站管理者安排正式發布；若平台拒絕其他作者的部署，先確認帳號與方案限制，不直接變更儲存庫公開性或升級付費方案。

## 開發與驗收

```sh
cd frontend
npm ci
npm run check
npm test
npm run build
```

frontend/dist 為產物，不提交至 Git。首頁沿用原有畫面；handoff.html 改連到 GitHub，避免原始碼 ZIP 遺失造成失效下載連結。

本專案原 README 規定合併前請一位組員檢查，因此匯入先開 PR。尚未合併的程式碼可先以該分支部署預覽；主分支更新與正式發布依組內流程執行。

## 帳號與資料

公開網站訪客不需 Vercel 帳號。網站目前使用 localStorage，手機與電腦不會同步，舊 Sites 與新 Vercel 網域的草稿也各自獨立。沒有自動匯入本機草稿至 Supabase。

B／D 合併登入流程時，共用同一個 Supabase client，再依 INTEGRATION.md 掛載 A 模組。資料庫已準備好，但這次部署不會自動啟用登入、條款同意或雲端同步。

B 實作實際的驗證與重設密碼頁面後，D 再設定 Supabase Site URL 與 Redirect URLs；正式環境使用實際的完整路徑。目前沒有已可用的 /auth/callback 或 /reset-password 頁面，不應直接宣稱已完成設定。

## 公開存取

發布後應在未登入 Vercel 的情況確認首頁、JavaScript、CSS 與睡貓圖片可取得。不同螢幕寬度沿用既有響應式樣式；HTTP 檢查不等於瀏覽器操作驗收。
