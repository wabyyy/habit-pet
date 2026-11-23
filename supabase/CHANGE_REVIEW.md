# 已套用：A 習慣設定 Supabase 變更

狀態：2026-11-23 經使用者明確同意後，已套用至正式資料庫，並完成下列交易回滾驗證。這份 migration 已執行，請勿再次貼入 SQL Editor 執行。

專案：habit-pet（hpfyjnxjkjjpkcwcdyrq）。沿用現有資料表；D 新增 user_consents 後共 13 張表。A migration 不新增業務資料表，也不修改 user_consents。

## 具體改動

1. habits 新增 goal_type、revision、created_at、updated_at、request_id 五個欄位、目標類型與版本檢查條件，以及使用者／請求識別碼唯一索引。
2. habits、habit_schedules、units 加入已登入使用者的讀取政策：習慣與排程限本人，單位為共用字典。
3. 移除 anon 對這三張表的直接權限；移除 authenticated 對習慣／排程的直接寫入權限。透過下一項函式一次寫入習慣與排程。
4. 新增 save_habit_settings 寫入函式，SECURITY DEFINER、固定空 search_path、伺服器以 auth.uid() 判斷本人；檢查名稱、時段、圖示、目標與星期。只有 authenticated 可執行，public／anon 無執行權。
5. 建立請求可重送而不重複新增；修改時驗證 revision，避免舊分頁覆蓋新資料。

不刪除資料表或既有業務資料，不改好友、日記、寵物或登入資料。檢查時 habits 與 habit_schedules 均為 0 筆。

## 需要確認的原因

這會改變 C 後端未來寫入習慣的入口，需使用 save_habit_settings，而非直接從前端分別寫兩張表。SECURITY DEFINER 以函式擁有者權限執行，因此特別依賴函式中的身分、所有權、輸入驗證與最小執行權限。需和 C 共用這份 migration 及規格。

完整 SQL：migrations/202611230001_a_habit_settings.sql。

已以交易回滾方式驗證本人新增／修改、排程去重與整筆更新、勾選型目標正規化、重送去重、版本衝突、無效目標拒絕、直接寫表拒絕、跨帳號讀寫拒絕與未登入拒絕。測試後 habits 與 habit_schedules 仍為 0 筆，未留下使用者習慣。

這不代表 A／B 畫面已合併：公開 A 前端仍使用本機 service，待共用登入 client 串接後再驗收完整流程。
