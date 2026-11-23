import { createLocalHabitService } from "./local-habit-service.js";
/** C 對接點：實作同樣的四個非同步方法，再透過 mountHabitApp({service}) 注入。
 * 畫面不直接存取 Supabase，也不接收 user_id、service_role 或資料庫密碼。
 * 參閱 contracts.d.ts 與 INTEGRATION.md。未確認資料表與 RLS 前，不對真實專案寫入。
 */
export function getHabitService() {
  return createLocalHabitService();
}
