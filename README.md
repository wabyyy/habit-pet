# Habit Pet 🐾

習慣養成 × 寵物成長，四人共同開發的資料庫課程專案。

> 目前完成 GitHub 協作初始化，既有 App 程式碼待匯入。下方功能為開發範圍，完成狀態以 Pull Request 與實際驗收為準。

## 技術與目標

- 前端：原生 HTML、CSS、JavaScript。
- 資料庫與登入：Supabase。
- 預計部署：Vercel；匯入程式碼後設定。
- 目標交付：2026/12/31。

## 功能範圍

- 習慣設定、活動紀錄、每日打卡與累積達標天數。
- 完成目標取得飼料、餵食寵物與寵物逐步成長。
- 日記、個人資料與好友互動。
- 各功能細節與成長規則由組內確認後實作。

## 四人分工

A–D 為工作代號，對應的 GitHub 帳號待組內填入。共用檔案修改前先告知其他人。

| 代號 | 主要工作 | 負責內容 | GitHub 帳號 |
| --- | --- | --- | --- |
| A | 前端 | 首頁、習慣、活動紀錄、打卡、日記頁面 | 待填 |
| B | 前端 | 登入、個人資料、寵物、餵食、好友頁面 | 待填 |
| C | 後端／資料庫 | 習慣、活動、達標、飼料獎勵、寵物與餵食交易 | 待填 |
| D | 後端／資料庫 | 登入、個人資料、日記、好友關係與資料權限 | 待填 |

## 第一次開始

1. 接受本專案的協作者邀請。
2. 用 GitHub Desktop 的 **File → Clone repository** 複製專案；也可使用下方指令。
3. 從最新的 `main` 建立自己的功能分支。
4. 既有程式碼匯入後，補上實際執行方式與設定範例。

```bash
git clone https://github.com/wabyyy/habit-pet.git
cd habit-pet
git switch -c feat/your-name-habits
```

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

- [ ] 填入四位組員對應帳號並完成邀請。
- [ ] 匯入目前共用的 App 程式碼。
- [ ] 補上本機執行方式與不含機密值的設定範例。
- [ ] 確認 Supabase 既有結構並保存後續 SQL 變更。
- [ ] 建立各項功能的 Issue 與驗收條件。
- [ ] 串接 Vercel 並完成整合測試。
