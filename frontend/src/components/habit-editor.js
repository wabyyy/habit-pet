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

export function createHabitEditor({ root, state, draftSummary }) {
  function renderModal(focus) {
    const layer = root.querySelector(".modal-layer");
    if (!layer || !state.modal) return;
    const m = state.modal,
      d = m.draft,
      quantity = d.goal.type === "quantity";
    layer.innerHTML = `<div class="dialog-backdrop"><section class="habit-dialog" role="dialog" aria-modal="true" aria-labelledby="habit-dialog-title"><div class="dialog-header"><div><span class="eyebrow">A SMALL PROMISE</span><h2 id="habit-dialog-title">${m.id ? "編輯小約定" : "新增一個小約定"}</h2></div><button class="icon-button close-dialog" data-action="close" aria-label="關閉習慣設定" ${state.saving ? "disabled" : ""}>${art("close")}</button></div><form id="habit-form" novalidate><fieldset class="form-fields" ${state.saving ? "disabled" : ""}><label class="field"><span>想養成什麼小習慣？</span><input name="name" maxlength="80" value="${e(d.name)}" placeholder="例如：每天讀一點書" autocomplete="off" required><small>取個簡單的名字，讓自己一眼就懂。</small></label><div class="field"><span id="icon-label">選一個習慣圖示</span><div class="icon-options" role="group" aria-labelledby="icon-label">${ICONS.map((i) => `<button type="button" class="icon-option ${i.id === d.iconId ? "selected" : ""}" data-icon="${i.id}" aria-label="${i.label}圖示" aria-pressed="${i.id === d.iconId}">${art(i.id)}<span>${i.label}</span></button>`).join("")}</div></div><div class="field"><span id="period-label">放在哪個時段？</span><div class="period-options" role="group" aria-labelledby="period-label">${PERIODS.map((p) => `<button type="button" data-period-choice="${p.id}" class="period-choice ${d.period === p.id ? "selected" : ""}" aria-pressed="${d.period === p.id}">${art(p.icon)}${p.label}</button>`).join("")}</div></div><div class="field"><span id="goal-label">怎麼記錄這個習慣？</span><div class="goal-options" role="group" aria-labelledby="goal-label"><button type="button" class="goal-choice ${!quantity ? "selected" : ""}" data-goal="check" aria-pressed="${!quantity}"><span class="choice-radio"></span><span><strong>完成即可勾選</strong><small>做到了，就給自己一個勾。</small></span></button><button type="button" class="goal-choice ${quantity ? "selected" : ""}" data-goal="quantity" aria-pressed="${quantity}"><span class="choice-radio"></span><span><strong>數量累積達標</strong><small>用分鐘、頁數或次數累積。</small></span></button></div></div><div class="quantity-fields" ${!quantity ? "hidden" : ""}><label class="field"><span>每日目標量</span><input name="target" type="number" min="0.01" max="100000" step="0.01" inputmode="decimal" value="${quantity ? e(d.goal.target) : m.targetBuffer}" ${quantity ? "required" : ""}></label><label class="field"><span>單位</span><select name="unitId">${state.units.map((u) => `<option value="${e(u.id)}" ${(quantity ? d.goal.unitId : m.unitBuffer) === u.id ? "selected" : ""}>${e(u.label)}</option>`).join("")}</select></label></div><div class="field"><span id="days-label">哪些日子，一起努力？</span><div class="weekday-options" role="group" aria-labelledby="days-label">${weekdayText
      .slice(1)
      .map(
        (t, i) =>
          `<button type="button" data-weekday="${i + 1}" class="weekday ${d.weekdays.includes(i + 1) ? "selected" : ""}" aria-pressed="${d.weekdays.includes(i + 1)}" aria-label="星期${t}">${t}</button>`,
      )
      .join(
        "",
      )}</div><small>至少選一天；沒有安排的日子，可以好好休息。</small></div><div class="habit-preview"><span class="habit-art">${art(d.iconId)}</span><div><strong data-preview-name>${e(d.name.trim() || "你的小小約定")}</strong><p data-preview-summary>${e(draftSummary())}</p></div></div></fieldset><div class="form-error" role="alert" ${!m.error ? "hidden" : ""}>${e(m.error?.message || "")}</div><div class="dialog-actions"><button class="button ghost" type="button" data-action="close" ${state.saving ? "disabled" : ""}>先收起來</button><button class="button primary" type="submit" ${state.saving ? "disabled" : ""}>${state.saving ? '<span class="spinner" aria-hidden="true"></span>正在儲存…' : art("check") + "儲存習慣"}</button></div></form></section></div>`;
    if (focus)
      requestAnimationFrame(() => layer.querySelector("[name=name]")?.focus());
  }

  return renderModal;
}
