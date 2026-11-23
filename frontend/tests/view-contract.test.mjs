import test from "node:test";
import assert from "node:assert/strict";
import { createHabitRowRenderer } from "../src/components/habit-row.js";
import { createTodayPage } from "../src/pages/today-page.js";
import { createSettingsPage } from "../src/pages/settings-page.js";
const habit = {
  id: "h",
  name: "<script>unsafe</script>",
  iconId: "book",
  period: "morning",
  weekdays: [1, 2, 3, 4, 5, 6, 7],
  goal: { type: "quantity", target: 60, unitId: "minute" },
  createdOn: "2026-11-01",
  todayProgress: { value: 25, isCompleted: false },
};
const state = {
  date: "2026-11-23",
  habits: [habit],
  units: [{ id: "minute", label: "分鐘" }],
};
test("shared row escapes user content and retains edit actions", () => {
  const row = createHabitRowRenderer({ state })(habit);
  assert.ok(row.includes("&lt;script&gt;"));
  assert.ok(!row.includes("<script>"));
  assert.ok(row.includes('data-action="edit"'));
  assert.ok(row.includes("25"));
});
test("today page keeps all three periods and uses the original cat component", () => {
  const render = createTodayPage({
    state,
    today: () => state.date,
    dateLabel: () => "11 月 23 日",
    habitRow: createHabitRowRenderer({ state }),
  });
  const html = render();
  for (const label of [
    "早上",
    "中午",
    "晚上",
    "今天也陪著你。",
    "sleeping-cat.png",
  ])
    assert.ok(html.includes(label), label);
});
test("settings page retains the same row component and schedule", () => {
  const html = createSettingsPage({
    state,
    habitRow: createHabitRowRenderer({ state }),
  })();
  assert.ok(html.includes("每天"));
  assert.ok(html.includes("60 分鐘"));
  assert.ok(html.includes('data-action="new"'));
});
