# A 模組串接說明

以下程式路徑以 `frontend/` 為工作目錄；共用文件位於儲存庫的 `docs/a/`，SQL 位於 `supabase/`。

## 已完成的 service 介面

- listUnits()
- listHabits({ date, scheduledOnly })
- createHabit(input, { requestId })
- updateHabit(id, input, { expectedRevision })

型別見 `src/services/contracts.d.ts`。本機版本用 `local-habit-service.js`；Supabase 版本用 `supabase-habit-service.js`。

## B／D 共用登入 client，C 提供資料權限

SQL 已確認、套用並通過資料庫權限驗證。下列程式仍需整合到小組共用的登入後頁面：

```js
import { mountHabitApp } from "./src/habit-app.js";
import { createSupabaseHabitService } from "./src/services/supabase-habit-service.js";

// sharedSupabaseClient 由 B／D 的登入模組提供；不是另一個新帳號系統。
const unmount = mountHabitApp(container, {
  timezone: currentProfile.timezone,
  service: createSupabaseHabitService(sharedSupabaseClient, {
    timezone: currentProfile.timezone,
  }),
});
// 路由離開時執行 unmount()。
```

正式 adapter 使用 auth.getUser() 確認登入；所有權仍由伺服器 auth.uid()、RLS 和寫入函式驗證。表單不接受 user_id。登入切換後應解除舊畫面再掛載，避免顯示上一位使用者的資料。

## 現有資料表對照

- habits：name、icon、time_slot、target_amount、unit_id、is_active。
- habit_schedules：habit_id、weekday（1～7 代表週一至週日）。
- units：實際 code 為 min／page／count，不是本機示範用的 minute。
- 已套用 SQL 加入 goal_type、revision、created_at、updated_at、request_id。
- 建立／修改透過 save_habit_settings，習慣與排程同一交易處理。
- 一般前端帳號僅能讀取自己的習慣與排程，不能直接新增、修改或刪除這兩張表；C 的新增／編輯需使用上述 RPC。
- 小組目前共 13 張表；user_consents 由 B／D 串接，A 不修改同意紀錄。

勾選型使用 count 單位與目標 1，介面只顯示「完成即可勾選」；數量型使用所選單位與目標。不得把閱讀分鐘改標成頁數。真實活動提交與達標計算仍依後續週排程由 C 實作；adapter 不把本機示範進度匯入帳號。

## 安全與設定

`src/config/supabase.js` 只有 API URL 和可公開的 publishable key，沒有 service_role 或資料庫密碼。`HABIT_CLOUD_SETUP_APPROVED` 為 true，代表資料庫變更已核可並套用；這個標記不會自動切換 service，目前入口仍使用本機 service。

已在真實資料庫以兩個既有帳號的身分，驗證本人新增／修改、排程去重與整筆更新、勾選型目標正規化、重送去重、版本衝突、無效目標拒絕、直接寫表拒絕、跨帳號讀寫隔離及匿名拒絕，全部以交易回滾，不留下測試習慣。另有 client adapter 的模擬測試。這些結果尚不包含 B 登入畫面與公開 A 前端的瀏覽器整合驗收。
