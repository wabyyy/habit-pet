export const PERIODS = Object.freeze([
  {
    id: "morning",
    label: "早上",
    subtitle: "給一天一個溫柔的開始",
    icon: "sunrise",
  },
  {
    id: "noon",
    label: "中午",
    subtitle: "忙碌裡，也照顧一下自己",
    icon: "sun",
  },
  { id: "evening", label: "晚上", subtitle: "把今天，慢慢收好", icon: "moon" },
]);
export const ICONS = Object.freeze([
  { id: "cup", label: "喝水" },
  { id: "book", label: "閱讀" },
  { id: "dumbbell", label: "運動" },
  { id: "leaf", label: "伸展" },
  { id: "pen", label: "書寫" },
  { id: "sun", label: "戶外" },
  { id: "headphones", label: "聆聽" },
  { id: "plant", label: "照顧植物" },
  { id: "moon", label: "休息" },
]);
export const UNITS = Object.freeze([
  { id: "minute", label: "分鐘" },
  { id: "page", label: "頁" },
  { id: "count", label: "次" },
  { id: "ml", label: "毫升" },
]);
export class HabitError extends Error {
  constructor(code, message, field) {
    super(message);
    this.name = "HabitError";
    this.code = code;
    this.field = field;
  }
}
export function dateInZone(date = new Date(), zone = "Asia/Taipei") {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}
export function shiftDate(date, days) {
  const d = new Date(date + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
export function weekday(date) {
  return new Date(date + "T12:00:00Z").getUTCDay() || 7;
}
export function normalizeHabit(input, units = UNITS) {
  const name = typeof input.name === "string" ? input.name.trim() : "";
  if (!name || Array.from(name).length > 40)
    throw new HabitError(
      "INVALID_NAME",
      "請填寫 1～40 個字的習慣名稱。",
      "name",
    );
  if (!PERIODS.some((p) => p.id === input.period))
    throw new HabitError(
      "INVALID_PERIOD",
      "請選擇早上、中午或晚上。",
      "period",
    );
  if (!ICONS.some((i) => i.id === input.iconId))
    throw new HabitError("INVALID_ICON", "請從內建圖示中選一個。", "iconId");
  const weekdays = Array.isArray(input.weekdays)
    ? [...new Set(input.weekdays)].sort((a, b) => a - b)
    : [];
  if (
    !weekdays.length ||
    weekdays.some((d) => !Number.isInteger(d) || d < 1 || d > 7)
  )
    throw new HabitError(
      "INVALID_SCHEDULE",
      "至少選擇一天，作為你的小約定。",
      "weekdays",
    );
  let goal;
  if (input.goal?.type === "check") goal = { type: "check" };
  else if (input.goal?.type === "quantity") {
    const target = input.goal.target;
    if (
      typeof target !== "number" ||
      !Number.isFinite(target) ||
      target <= 0 ||
      target > 100000 ||
      Math.round(target * 100) / 100 !== target
    )
      throw new HabitError(
        "INVALID_TARGET",
        "請填寫大於 0、最多兩位小數的目標量（上限 100,000）。",
        "target",
      );
    if (!units.some((u) => u.id === input.goal.unitId))
      throw new HabitError("INVALID_UNIT", "請選擇計量單位。", "unitId");
    goal = { type: "quantity", target, unitId: input.goal.unitId };
  } else
    throw new HabitError(
      "INVALID_GOAL_TYPE",
      "請選擇完成勾選或數量累積。",
      "goalType",
    );
  return { name, period: input.period, iconId: input.iconId, weekdays, goal };
}
export function targetLabel(h, units = UNITS) {
  return h.goal.type === "check"
    ? "完成即可勾選"
    : `${h.goal.target} ${units.find((u) => u.id === h.goal.unitId)?.label || h.goal.unitId}`;
}
export function scheduleLabel(days) {
  return days.length === 7
    ? "每天"
    : days.join(",") === "1,2,3,4,5"
      ? "每週一至五"
      : `每週${days.map((d) => ["", "一", "二", "三", "四", "五", "六", "日"][d]).join("、")}`;
}
export function scheduledOn(h, date) {
  return date >= h.createdOn && h.weekdays.includes(weekday(date));
}
export function newId() {
  return (
    globalThis.crypto?.randomUUID?.() ||
    `local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
  );
}
