import {
  normalizeHabit,
  UNITS,
  newId,
  dateInZone,
  scheduledOn,
  HabitError,
} from "../domain/habits.js";
const KEY = "slow-days:a-week2:v1";
const copy = (v) => structuredClone(v);
function initial(today) {
  const now = new Date().toISOString();
  const make = (id, name, period, iconId, goal) => ({
    id,
    name,
    period,
    iconId,
    goal,
    weekdays: [1, 2, 3, 4, 5, 6, 7],
    createdOn: today,
    createdAt: now,
    updatedAt: now,
    revision: 1,
  });
  return {
    version: 1,
    revision: 1,
    requests: [],
    habits: [
      make("demo-water", "給自己一杯水", "morning", "cup", { type: "check" }),
      make("demo-read", "讀一點喜歡的書", "morning", "book", {
        type: "quantity",
        target: 60,
        unitId: "minute",
      }),
      make("demo-back", "讓背部好好動一動", "noon", "dumbbell", {
        type: "check",
      }),
      make("demo-stretch", "睡前，留一點時間給自己", "evening", "leaf", {
        type: "check",
      }),
    ],
    sampleProgress: [
      { habitId: "demo-water", date: today, value: 1, goalType: "check" },
      {
        habitId: "demo-read",
        date: today,
        value: 25,
        goalType: "quantity",
        unitId: "minute",
      },
    ],
  };
}
export function createLocalHabitService({
  storage = globalThis.localStorage,
  now = () => new Date(),
  zone = "Asia/Taipei",
} = {}) {
  function read() {
    let raw;
    try {
      raw = storage.getItem(KEY);
    } catch {
      throw new HabitError(
        "STORAGE_UNAVAILABLE",
        "瀏覽器目前無法讀取草稿，請確認隱私與儲存設定。",
      );
    }
    if (raw === null) {
      const s = initial(dateInZone(now(), zone));
      write(s);
      return s;
    }
    try {
      const s = JSON.parse(raw);
      if (
        s.version !== 1 ||
        !Array.isArray(s.habits) ||
        !Array.isArray(s.sampleProgress) ||
        !Array.isArray(s.requests)
      )
        throw Error();
      for (const h of s.habits) {
        normalizeHabit(h);
        if (
          typeof h.id !== "string" ||
          !Number.isInteger(h.revision) ||
          !/^\d{4}-\d{2}-\d{2}$/.test(h.createdOn)
        )
          throw Error();
      }
      return s;
    } catch {
      throw new HabitError(
        "STORAGE_INVALID",
        "這份本機草稿暫時讀不到，請保留資料並聯絡組員協助。",
      );
    }
  }
  function write(s) {
    try {
      storage.setItem(KEY, JSON.stringify(s));
    } catch {
      throw new HabitError(
        "STORAGE_UNAVAILABLE",
        "草稿沒有儲存成功，請確認瀏覽器儲存空間後再試一次。",
      );
    }
  }
  return {
    mode: "local",
    storageKey: KEY,
    async listUnits() {
      return copy(UNITS);
    },
    async listHabits({
      date = dateInZone(now(), zone),
      scheduledOnly = false,
    } = {}) {
      const s = read();
      return s.habits
        .filter((h) => !scheduledOnly || scheduledOn(h, date))
        .map((h) => {
          const value = s.sampleProgress
            .filter(
              (p) =>
                p.habitId === h.id &&
                p.date === date &&
                p.goalType === h.goal.type &&
                (h.goal.type === "check" || p.unitId === h.goal.unitId),
            )
            .reduce((v, p) => v + p.value, 0);
          return {
            ...copy(h),
            todayProgress: {
              date,
              value,
              isCompleted:
                h.goal.type === "check" ? value >= 1 : value >= h.goal.target,
            },
          };
        });
    },
    async createHabit(input, { requestId } = {}) {
      const normalized = normalizeHabit(input);
      const s = read();
      if (requestId) {
        const prior = s.requests.find((r) => r.key === requestId);
        if (prior) return copy(s.habits.find((h) => h.id === prior.id));
      }
      const at = now();
      const h = {
        id: newId(),
        ...normalized,
        revision: 1,
        createdOn: dateInZone(at, zone),
        createdAt: at.toISOString(),
        updatedAt: at.toISOString(),
      };
      s.habits.push(h);
      s.revision++;
      if (requestId) s.requests.push({ key: requestId, id: h.id });
      s.requests = s.requests.slice(-100);
      write(s);
      return copy(h);
    },
    async updateHabit(id, input, { expectedRevision } = {}) {
      const normalized = normalizeHabit(input);
      const s = read(),
        index = s.habits.findIndex((h) => h.id === id);
      if (index < 0)
        throw new HabitError("NOT_FOUND", "這個習慣已不存在，請重新整理清單。");
      const previous = s.habits[index];
      if (
        expectedRevision !== undefined &&
        previous.revision !== expectedRevision
      )
        throw new HabitError(
          "CONFLICT",
          "另一個分頁已更新這個習慣。請關閉表單，重新開啟後再編輯。",
        );
      const h = {
        ...previous,
        ...normalized,
        revision: previous.revision + 1,
        updatedAt: now().toISOString(),
      };
      s.habits[index] = h;
      s.revision++;
      write(s);
      return copy(h);
    },
  };
}
