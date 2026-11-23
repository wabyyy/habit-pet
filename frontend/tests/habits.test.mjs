import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeHabit,
  dateInZone,
  weekday,
  scheduledOn,
  shiftDate,
  HabitError,
} from "../src/domain/habits.js";
import { createLocalHabitService } from "../src/services/local-habit-service.js";
const clock = () => new Date("2026-11-23T03:00:00.000Z");
const memory = () => {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, v),
    map,
  };
};
const input = (extra = {}) => ({
  name: "讀書",
  period: "morning",
  iconId: "book",
  weekdays: [1, 3, 5],
  goal: { type: "quantity", target: 60, unitId: "minute" },
  ...extra,
});
test("creates both target types and survives service reinitialization", async () => {
  const storage = memory(),
    a = createLocalHabitService({ storage, now: clock });
  await a.createHabit(input(), { requestId: "one" });
  await a.createHabit(
    input({
      name: "伸展",
      goal: { type: "check", target: 999, unitId: "ignored" },
    }),
    { requestId: "two" },
  );
  const b = createLocalHabitService({ storage, now: clock }),
    list = await b.listHabits();
  assert.equal(list.length, 6);
  assert.deepEqual(list.at(-1).goal, { type: "check" });
  assert.deepEqual(list.at(-2).goal, {
    type: "quantity",
    target: 60,
    unitId: "minute",
  });
});
test("retrying a create with the same request ID does not duplicate a habit", async () => {
  const service = createLocalHabitService({ storage: memory(), now: clock });
  const first = await service.createHabit(input(), { requestId: "retry" }),
    second = await service.createHabit(input(), { requestId: "retry" });
  assert.equal(first.id, second.id);
  assert.equal((await service.listHabits()).length, 5);
});
test("edits name, period, icon, days, and goal while preserving ID", async () => {
  const storage = memory(),
    s = createLocalHabitService({ storage, now: clock });
  const old = await s.createHabit(input());
  const edited = await s.updateHabit(
    old.id,
    input({
      name: "睡前看書",
      period: "evening",
      iconId: "moon",
      weekdays: [2, 4, 6],
      goal: { type: "quantity", target: 10, unitId: "page" },
    }),
    { expectedRevision: old.revision },
  );
  const list = await createLocalHabitService({
    storage,
    now: clock,
  }).listHabits();
  const actual = list.find((h) => h.id === old.id);
  assert.equal(actual.name, "睡前看書");
  assert.equal(actual.period, "evening");
  assert.equal(actual.iconId, "moon");
  assert.deepEqual(actual.weekdays, [2, 4, 6]);
  assert.equal(actual.goal.unitId, "page");
  assert.equal(edited.revision, 2);
});
test("a stale tab cannot silently overwrite newer settings", async () => {
  const storage = memory(),
    a = createLocalHabitService({ storage, now: clock }),
    b = createLocalHabitService({ storage, now: clock });
  const h = await a.createHabit(input());
  await a.updateHabit(h.id, input({ name: "新的名字" }), {
    expectedRevision: 1,
  });
  await assert.rejects(
    () =>
      b.updateHabit(h.id, input({ name: "過期修改" }), { expectedRevision: 1 }),
    (e) => e.code === "CONFLICT",
  );
  assert.equal(
    (await a.listHabits()).find((x) => x.id === h.id).name,
    "新的名字",
  );
});
test("invalid or hostile configuration never reaches storage", async () => {
  const storage = memory(),
    s = createLocalHabitService({ storage, now: clock });
  await s.listHabits();
  const before = [...storage.map.values()][0];
  for (const bad of [
    input({ name: "  " }),
    input({ name: "字".repeat(41) }),
    input({ weekdays: [] }),
    input({ weekdays: [0, 8] }),
    input({ period: "midnight" }),
    input({ iconId: "<script>" }),
    input({ goal: { type: "quantity", target: NaN, unitId: "minute" } }),
    input({ goal: { type: "quantity", target: -1, unitId: "minute" } }),
    input({ goal: { type: "quantity", target: 1.234, unitId: "minute" } }),
    input({ goal: { type: "quantity", target: 100001, unitId: "minute" } }),
    input({ goal: { type: "quantity", target: 5, unitId: "unknown" } }),
  ])
    await assert.rejects(() => s.createHabit(bad), HabitError);
  assert.equal([...storage.map.values()][0], before);
});
test("normalization strips extra client properties and deduplicates weekdays", () => {
  const clean = normalizeHabit(
    input({ weekdays: [5, 1, 5, 3], user_id: "another-user", food: 999 }),
  );
  assert.deepEqual(clean.weekdays, [1, 3, 5]);
  assert.ok(!("user_id" in clean));
  assert.ok(!("food" in clean));
});
test("changing units does not relabel sample minutes as pages", async () => {
  const s = createLocalHabitService({ storage: memory(), now: clock });
  const read = (await s.listHabits()).find((h) => h.id === "demo-read");
  assert.equal(read.todayProgress.value, 25);
  await s.updateHabit(
    read.id,
    { ...read, goal: { type: "quantity", target: 10, unitId: "page" } },
    { expectedRevision: 1 },
  );
  assert.equal(
    (await s.listHabits()).find((h) => h.id === read.id).todayProgress.value,
    0,
  );
});
test("invalid storage is preserved, not silently replaced", async () => {
  const storage = memory();
  storage.setItem("slow-days:a-week2:v1", "broken original data");
  const s = createLocalHabitService({ storage, now: clock });
  await assert.rejects(
    () => s.listHabits(),
    (e) => e.code === "STORAGE_INVALID",
  );
  assert.equal(storage.getItem("slow-days:a-week2:v1"), "broken original data");
});
test("failed writes reject without returning false success", async () => {
  const storage = memory(),
    s = createLocalHabitService({ storage, now: clock });
  await s.listHabits();
  const before = storage.getItem("slow-days:a-week2:v1");
  storage.setItem = () => {
    throw Error("quota");
  };
  await assert.rejects(
    () => s.createHabit(input()),
    (e) => e.code === "STORAGE_UNAVAILABLE",
  );
  assert.equal(storage.getItem("slow-days:a-week2:v1"), before);
});
test("schedule and Taiwan date boundaries are explicit", async () => {
  assert.equal(dateInZone(new Date("2026-11-23T16:00:00Z")), "2026-11-24");
  assert.equal(weekday("2026-11-23"), 1);
  assert.equal(shiftDate("2026-11-30", 1), "2026-12-01");
  const s = createLocalHabitService({ storage: memory(), now: clock });
  const h = await s.createHabit(input());
  assert.equal(scheduledOn(h, "2026-11-23"), true);
  assert.equal(scheduledOn(h, "2026-11-24"), false);
  assert.equal(scheduledOn(h, "2026-11-22"), false);
  const tuesday = await s.listHabits({
    date: "2026-11-24",
    scheduledOnly: true,
  });
  assert.ok(!tuesday.some((x) => x.id === h.id));
});
