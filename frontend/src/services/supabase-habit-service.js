import {
  HabitError,
  normalizeHabit,
  scheduledOn,
  dateInZone,
  newId,
} from "../domain/habits.js";

export function mapDatabaseHabit(row, { date, timezone = "Asia/Taipei" } = {}) {
  const units = Array.isArray(row.units) ? row.units[0] : row.units;
  const goal =
    row.goal_type === "check"
      ? { type: "check" }
      : {
          type: "quantity",
          target: Number(row.target_amount),
          unitId: units?.code,
        };
  return {
    id: String(row.id),
    name: row.name,
    period: row.time_slot,
    iconId: row.icon,
    weekdays: (row.habit_schedules || [])
      .map((s) => Number(s.weekday))
      .sort((a, b) => a - b),
    goal,
    revision: row.revision,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    createdOn: dateInZone(new Date(row.created_at), timezone),
    // 活動與達標由 C 的下一階段實作；不把本機示範進度帶入真實帳號。
    todayProgress: {
      date: date || dateInZone(new Date(), timezone),
      value: 0,
      isCompleted: false,
    },
  };
}
function failure(error) {
  if (error?.code === "40001")
    return new HabitError("CONFLICT", "這個習慣已被更新，請重新開啟後再編輯。");
  if (["42703", "PGRST202", "PGRST204"].includes(error?.code))
    return new HabitError(
      "CLOUD_SETUP_PENDING",
      "雲端習慣功能尚未完成設定，請稍後再試。",
    );
  if (error?.code === "42501")
    return new HabitError("FORBIDDEN", "目前沒有操作這份資料的權限。");
  if (error?.code === "22023")
    return new HabitError(
      "VALIDATION_ERROR",
      "設定內容不符合規則，請確認名稱、目標與重複日。",
    );
  return new HabitError("CLOUD_ERROR", "雲端操作未完成，請確認網路後再試。");
}
/** 注入 B／D 共用的已登入 client。資料庫 RLS 與 RPC 再驗證所有權。 */
export function createSupabaseHabitService(
  client,
  { timezone = "Asia/Taipei" } = {},
) {
  if (!client?.auth || !client?.from || !client?.rpc)
    throw new TypeError("A shared Supabase client is required");
  let unitCache;
  async function currentUser() {
    const { data, error } = await client.auth.getUser();
    if (error || !data?.user)
      throw new HabitError("UNAUTHENTICATED", "請先登入，才能使用雲端習慣。");
    return data.user;
  }
  async function listUnits() {
    await currentUser();
    if (unitCache) return structuredClone(unitCache);
    const { data, error } = await client
      .from("units")
      .select("id,code,name")
      .order("id");
    if (error) throw failure(error);
    if (!data?.length)
      throw new HabitError("CLOUD_SETUP_PENDING", "雲端計量單位尚未設定完成。");
    unitCache = data.map((u) => ({ id: u.code, label: u.name }));
    return structuredClone(unitCache);
  }
  async function save(id, input, options = {}) {
    const units = await listUnits();
    const safe = normalizeHabit(input, units);
    const { data, error } = await client.rpc("save_habit_settings", {
      p_habit_id: id,
      p_name: safe.name,
      p_time_slot: safe.period,
      p_icon: safe.iconId,
      p_goal_type: safe.goal.type,
      p_target_amount: safe.goal.type === "check" ? 1 : safe.goal.target,
      p_unit_code: safe.goal.type === "check" ? "count" : safe.goal.unitId,
      p_weekdays: safe.weekdays,
      p_expected_revision: options.expectedRevision ?? null,
      p_request_id: options.requestId ?? (id ? null : newId()),
    });
    if (error) throw failure(error);
    if (!data)
      throw new HabitError(
        "CLOUD_ERROR",
        "雲端未回傳儲存結果，請重新讀取清單。",
      );
    return mapDatabaseHabit(data, { timezone });
  }
  return {
    mode: "supabase",
    listUnits,
    async listHabits({
      date = dateInZone(new Date(), timezone),
      scheduledOnly = false,
    } = {}) {
      const user = await currentUser();
      const { data, error } = await client
        .from("habits")
        .select(
          "id,user_id,name,time_slot,icon,goal_type,target_amount,revision,created_at,updated_at,habit_schedules(weekday),units(code,name)",
        )
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at");
      if (error) throw failure(error);
      return (data || [])
        .map((row) => mapDatabaseHabit(row, { date, timezone }))
        .filter((h) => !scheduledOnly || scheduledOn(h, date));
    },
    createHabit(input, options) {
      return save(null, input, options);
    },
    updateHabit(id, input, options) {
      if (!/^\d+$/.test(String(id)))
        throw new HabitError("NOT_FOUND", "習慣編號無效。");
      return save(String(id), input, options);
    },
  };
}
