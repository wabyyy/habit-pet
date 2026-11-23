import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "../config/supabase.js";
let sharedClient;
/** B 已有 client 時，請直接將它傳給 createSupabaseHabitService；不要再建立第二個。 */
export function getSharedSupabaseClient() {
  if (!sharedClient)
    sharedClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: "habit-pet-auth",
      },
    });
  return sharedClient;
}
