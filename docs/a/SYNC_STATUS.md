# 小組同步現況（2026-11-23）

## 已確認

- 資料庫：Supabase `habit-pet`，project ref `hpfyjnxjkjjpkcwcdyrq`。
- A 的 Vercel 專案網址：https://slow-days-companion.vercel.app ，由 A 的帳號管理，初次發布後需驗證公開存取。
- 先前的 Sites 展示網址：https://slow-days-companion.peacefuljoust16.chatgpt.site 。兩個來源各自的瀏覽器資料不會自動搬移。
- A 在自己電腦執行 npm run dev 的預設 Port：5173。
- A 畫面使用本機資料，尚未和 B 前端合併。
- 小組程式碼統一存放於 https://github.com/wabyyy/habit-pet ，本次 A 以功能分支與 PR 匯入；Google Drive 不再更新。
- A 前端位於 frontend/，文件位於 docs/a/，已套用的 SQL 紀錄位於 supabase/。
- 資料庫目前有 13 張表，包含 D 新增的 user_consents；與 A 習慣設定獨立。
- A 習慣設定 migration 已經使用者同意後套用，真實資料庫的本人讀寫、重送去重、版本衝突、跨帳號隔離與匿名拒絕已用交易回滾驗證。

## 尚未完成

- A 公開畫面的新增／編輯仍存於本機，待接 B／D 的共用登入 client 後，才會使用已備妥的 Supabase service。
- B 的登入頁、驗證完成頁及重設密碼頁尚未在這份 A 專案實作。
- 沒有已完成的 `/auth/callback` 或 `/reset-password` 路徑；不要先宣稱這些頁面可用。
- Vercel 既有正式版本採發布已建置網站檔案的方式。GitHub 自動部署尚待完成與驗證，不能把程式碼已上傳當成已自動部署。

## A、B、D 要共同決定

1. 開發時共用的前端 origin 與 Port。
2. 正式部署使用的 origin。
3. B 實作的信箱驗證與密碼重設回跳路徑。
4. D 依實際可用的頁面設定 Supabase Site URL 和 Redirect URLs，並確認郵件送出端傳入相同路徑。
5. A 與 B 在合併後共用同一個 Supabase client、登入使用者與時區。
6. C 的習慣新增與修改透過 save_habit_settings；一般前端帳號無法分別直接寫入 habits／habit_schedules。
7. B／D 在註冊流程儲存條款與隱私政策版本及同意時間，確認 user_consents 的寫入入口與權限；新增資料表不等於同意流程已串接完成。

Site URL 是預設回跳位置；Redirect URLs 是允許的回跳清單。換網域時也要更新；單純設定允許清單，不會自動建立前端頁面。
