# Habit Pet 🐾

習慣養成 × 寵物成長，四人共同開發的資料庫課程專案。

> 本次匯入 A 的 11/23–11/29 前端：今日習慣、新增／編輯、早中晚分類、內建圖示與兩種目標。公開畫面仍使用瀏覽器本機儲存。其他功能依 Pull Request 與實際驗收確認進度。

## 技術與目標

- 前端：原生 HTML、CSS、JavaScript。
- 資料庫與登入：Supabase。
- 網站部署：Vercel，現有展示 https://slow-days-companion.vercel.app 。Git 自動部署的設定與驗收見 [部署說明](docs/a/DEPLOYMENT.md)。
- 目標交付：2026/12/31。

## 功能範圍

- 習慣設定、活動紀錄、每日打卡與累積達標天數。
- 完成目標取得飼料、餵食寵物與寵物逐步成長。
- 日記、個人資料與好友互動。
- 各功能細節與成長規則由組內確認後實作。

## 四人分工

A–D 為工作代號，對應的 GitHub 帳號待組內填入。共用檔案修改前先告知其他人。

| 代號 | 主要工作     | 負責內容                                   | GitHub 帳號 |
| ---- | ------------ | ------------------------------------------ | ----------- |
| A    | 前端         | 首頁、習慣、活動紀錄、打卡、日記頁面       | wabyyy      |
| B    | 前端         | 登入、個人資料、寵物、餵食、好友頁面       | 待填        |
| C    | 後端／資料庫 | 習慣、活動、達標、飼料獎勵、寵物與餵食交易 | 待填        |
| D    | 後端／資料庫 | 登入、個人資料、日記、好友關係與資料權限   | 待填        |

## 第一次開始

1. 接受本專案的協作者邀請。
2. 用 GitHub Desktop 的 **File → Clone repository** 複製專案；也可使用下方指令。
3. 從最新的 `main` 建立自己的功能分支。
4. 進入 `frontend/`，依下方方式安裝並執行。

```bash
git clone https://github.com/wabyyy/habit-pet.git
cd habit-pet
git switch -c feat/your-name-habits
```

## 資料夾與本機執行

| 路徑                                               | 用途                                                |
| -------------------------------------------------- | --------------------------------------------------- |
| `frontend/src/pages/`                              | A 的今日與設定頁，之後供 B 加入登入、寵物、好友頁面 |
| `frontend/src/components/`、`frontend/src/styles/` | 共用畫面元件、插畫與響應式樣式                      |
| `frontend/src/services/`                           | 本機資料服務與 Supabase 串接介面                    |
| `frontend/scripts/`、`frontend/tests/`             | 開發、建置與測試                                    |
| `docs/a/`                                          | A 的串接、同步、部署與安全檢查狀態                  |
| `supabase/migrations/`                             | 已確認的資料庫變更紀錄，由 C／D 接續維護            |

使用 Node.js 22 或以上的支援版本：

```bash
cd frontend
npm ci
npm run dev
```

瀏覽器開啟 `http://localhost:5173`。此網址需要該台電腦的開發伺服器正在執行。

```bash
npm run check
npm test
npm run build
```

打包結果在 `frontend/dist/`，不提交產物與 node_modules。Vercel 的 Root Directory 應設定為 `frontend`。

目前 A 與 B 的登入流程尚未合併；B／D 提供同一個登入 client 後，依 [串接說明](docs/a/INTEGRATION.md) 掛載 A 模組。資料庫的習慣設定 migration 已套用，詳見 [變更紀錄](supabase/CHANGE_REVIEW.md)，請勿重複執行。前端設定僅含可公開的 publishable key。

## 每次協作流程

1. 開工前先更新 `main`，再從它建立新分支。
2. 分支依功能命名，例如 `feat/amy-login`、`feat/ben-pet`、`fix/checkin-date`。
3. 完成一小段可驗收的工作就 commit 並 push。
4. 到 GitHub 開 Pull Request，選擇合併至 `main`，填寫修改與測試方式。
5. 請一位組員檢查；處理衝突、確認可運作後再合併。
6. 合併後，其他組員更新自己的本機 `main`。

```bash
# 開始一項新功能前，先提交或妥善保存手上的修改
git switch main
git pull --ff-only origin main
git switch -c feat/your-name-feature

# 修改檔案後
git status
git add <這次要提交的檔案路徑>
git commit -m "feat: 新增習慣打卡"
git push -u origin feat/your-name-feature
```

上面的分支名稱與檔案路徑需換成自己的內容。GitHub Desktop 也可完成同樣操作。

## 共用檔案與資料庫

- `main` 作為整合版本；日常功能透過分支與 Pull Request 合併。這是協作約定，目前未設定強制分支保護。
- 改共用 CSS、導覽、Supabase client 或資料表欄位前，先在組內確認。
- Supabase 結構與 RLS 變更請保留版本化 SQL，建議放在 `supabase/migrations/`，並在 Pull Request 註明執行順序與影響。
- 已存在的 Supabase 資料表先確認現況，再修改；不要直接重建整個資料庫。
- 機密設定放在本機環境設定或部署平台中。不要提交資料庫密碼、service role／secret key、存取 token 或真實個資。
- 前端使用 Supabase publishable／anon key 時，資料存取由 RLS 政策限制；service role／secret key 僅可留在伺服器端。
- `.gitignore` 只會忽略尚未被追蹤的檔案。已提交的機密需移除並更換相關憑證。

## 待辦

- [x] 匯入 A 的本週程式碼；B／C／D 功能依後續 PR 加入。
- [x] 補上本機執行方式與不含機密值的設定範例。
- [ ] 確認 Supabase 既有結構並保存後續 SQL 變更。
- [ ] 建立各項功能的 Issue 與驗收條件。
- [ ] 串接 Vercel 並完成整合測試。
