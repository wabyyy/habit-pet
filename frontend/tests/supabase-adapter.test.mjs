import test from "node:test";
import assert from "node:assert/strict";
import {
  createSupabaseHabitService,
  mapDatabaseHabit,
} from "../src/services/supabase-habit-service.js";
const row = {
  id: 7,
  name: "讀書",
  time_slot: "morning",
  icon: "book",
  goal_type: "quantity",
  target_amount: "60",
  revision: 1,
  created_at: "2026-11-22T16:10:00.000Z",
  updated_at: "2026-11-23T01:00:00.000Z",
  habit_schedules: [{ weekday: 5 }, { weekday: 1 }],
  units: { code: "min", name: "分鐘" },
};
function fake({ user = true, rpcError = null, listError = null } = {}) {
  const calls = [];
  return {
    calls,
    auth: {
      async getUser() {
        return {
          data: { user: user ? { id: "signed-in-user" } : null },
          error: null,
        };
      },
    },
    from(table) {
      const chain = {
        select() {
          return chain;
        },
        eq(k, v) {
          calls.push({ filter: k, value: v });
          return chain;
        },
        async order() {
          return {
            data:
              table === "units"
                ? [
                    { id: 1, code: "min", name: "分鐘" },
                    { id: 3, code: "count", name: "次" },
                  ]
                : [row],
            error: listError,
          };
        },
      };
      return chain;
    },
    async rpc(name, args) {
      calls.push({ name, args });
      return { data: row, error: rpcError };
    },
  };
}
const input = {
  name: "讀書",
  period: "morning",
  iconId: "book",
  weekdays: [1, 3, 5],
  goal: { type: "quantity", target: 60, unitId: "min" },
};
test("database IDs, unit codes and timezone map to the A interface", () => {
  const result = mapDatabaseHabit(row, { date: "2026-11-23" });
  assert.equal(result.id, "7");
  assert.equal(result.goal.unitId, "min");
  assert.equal(result.goal.target, 60);
  assert.equal(result.createdOn, "2026-11-23");
  assert.deepEqual(result.weekdays, [1, 5]);
  assert.equal(result.todayProgress.value, 0);
});
test("no login means no data query and no write", async () => {
  const c = fake({ user: false }),
    s = createSupabaseHabitService(c);
  await assert.rejects(
    () => s.createHabit(input),
    (e) => e.code === "UNAUTHENTICATED",
  );
  assert.equal(c.calls.length, 0);
});
test("create strips supplied ownership and uses one atomic RPC", async () => {
  const c = fake(),
    s = createSupabaseHabitService(c);
  await s.createHabit(
    { ...input, user_id: "somebody-else" },
    { requestId: "cdb9c5af-244f-4394-9df1-11ba75eaf733" },
  );
  const writes = c.calls.filter((c) => c.name);
  assert.equal(writes.length, 1);
  assert.equal(writes[0].name, "save_habit_settings");
  assert.ok(!("user_id" in writes[0].args));
  assert.equal(writes[0].args.p_unit_code, "min");
});
test("check targets do not keep an old quantity unit", async () => {
  const c = fake(),
    s = createSupabaseHabitService(c);
  await s.createHabit({
    ...input,
    goal: { type: "check", target: 500, unitId: "min" },
  });
  const args = c.calls.find((c) => c.name).args;
  assert.equal(args.p_target_amount, 1);
  assert.equal(args.p_unit_code, "count");
});
test("a stale revision returns a conflict and is never reported as success", async () => {
  const s = createSupabaseHabitService(fake({ rpcError: { code: "40001" } }));
  await assert.rejects(
    () => s.updateHabit("7", input, { expectedRevision: 1 }),
    (e) => e.code === "CONFLICT",
  );
});
test("a missing migration stays an explicit setup error", async () => {
  const s = createSupabaseHabitService(fake({ listError: { code: "42703" } }));
  await assert.rejects(
    () => s.listHabits(),
    (e) => e.code === "CLOUD_SETUP_PENDING",
  );
});
test("reads filter the validated current user as well as relying on RLS", async () => {
  const c = fake(),
    s = createSupabaseHabitService(c);
  await s.listHabits();
  assert.ok(
    c.calls.some((c) => c.filter === "user_id" && c.value === "signed-in-user"),
  );
});
