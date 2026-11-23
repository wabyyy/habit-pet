import { illustration as art, sleepyCat } from "./illustrations.js";
import { escapeHTML as e, weekdayText } from "../utils/html.js";
import {
  PERIODS,
  ICONS,
  scheduledOn,
  shiftDate,
  weekday,
  scheduleLabel,
  targetLabel,
} from "../domain/habits.js";

export function createHabitRowRenderer({ state }) {
  function habitRow(h, manage = false) {
    const done = h.todayProgress?.isCompleted,
      value = h.todayProgress?.value || 0;
    return `<article class="habit-row ${done && !manage ? "completed" : ""}"><span class="habit-art ${h.iconId}">${art(h.iconId)}</span><button class="habit-description" data-action="edit" data-id="${e(h.id)}" aria-label="編輯${e(h.name)}"><strong>${e(h.name)}</strong><span>${manage ? e(scheduleLabel(h.weekdays)) + " · " : ""}${e(targetLabel(h, state.units))}${!manage && h.goal.type === "quantity" ? `<span class="quantity-caption"> · 已累積 ${value} ${e(state.units.find((u) => u.id === h.goal.unitId)?.label || "")}</span>` : ""}</span></button>${manage ? `<span class="period-tag ${h.period}">${PERIODS.find((p) => p.id === h.period).label}</span>` : h.goal.type === "quantity" ? `<span class="row-quantity"><strong>${value}</strong><span> / ${h.goal.target}</span></span>` : ""}${!manage ? `<span class="completion-mark ${done ? "checked" : ""}" role="img" aria-label="${done ? "已完成" : "尚未完成"}">${done ? art("check") : ""}</span>` : ""}<button class="row-edit" data-action="edit" data-id="${e(h.id)}" aria-label="修改${e(h.name)}">${art("edit")}</button></article>`;
  }

  return habitRow;
}
