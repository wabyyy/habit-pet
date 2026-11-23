import { illustration as art, sleepyCat } from "../components/illustrations.js";
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

export function createSettingsPage({ state, habitRow }) {
  function settingsView() {
    return `<div class="settings-intro"><span class="small-illustration">${art("pen")}</span><p>每個習慣都可以設定時段、圖示與重複日。<br><span>完成即可勾選，或用時間與數量慢慢累積。</span></p></div><section class="management-list"><div class="list-caption"><span>我的小約定</span><span>${state.habits.length} 個習慣</span></div>${state.habits.map((h) => habitRow(h, true)).join("")}</section><button class="add-another" data-action="new">${art("plus")}再加一個小約定</button>`;
  }

  return settingsView;
}
