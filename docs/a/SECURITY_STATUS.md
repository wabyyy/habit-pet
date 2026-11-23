# 安全檢查狀態

已於 2026-11-23 檢查 Supabase 資料表與權限。13 張表均啟用 RLS，但不代表所有功能已能存取或已完成完整資安驗收。

habits／habit_schedules 已限制本人讀取；units 供登入帳號讀取。習慣新增／修改僅透過 save_habit_settings，函式以 auth.uid() 判斷本人，驗證輸入、版本及請求識別碼。已用真實資料庫角色與交易回滾確認跨帳號、未登入及直接寫表拒絕，並驗證本人儲存與重送去重。測試後 habits、habit_schedules 維持 0 筆。

目前有 6 張啟用 RLS 但尚無政策的表：activity_logs、food_transactions、habit_checkins、pet_interactions、pet_types、pets。對一般帳號會拒絕資料列存取，由 C／D 依後續功能補政策。

最新 advisor 仍提醒既有 rls_auto_enable 可由 anon 以 SECURITY DEFINER 執行，以及 Auth 洩漏密碼防護尚未開啟；由 C／D 檢查。其他好友函式與新 save_habit_settings 也會出現在登入者可執行 SECURITY DEFINER 的提醒中；後者是刻意設計的受限交易入口，已撤銷 public／anon 執行權、固定空 search_path 並驗證身分及所有權。advisory 不等於函式已確認有漏洞，也不代表可以省略檢查。

user_consents 目前有本人查閱政策，尚無同意紀錄；B／D 仍須確認同意寫入函式／後端入口及註冊整合，不能只靠前端勾選框。這次未修改該表、好友或 Auth 設定。

參考：

- https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy
- https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable
- https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable
- https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
