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

export function createTodayPage({ state, today, dateLabel, habitRow }) {
  function dateStrip() {
    const monday = shiftDate(state.date, 1 - weekday(state.date));
    return `<section class="week-calendar" aria-label="習慣日期"><div class="calendar-heading"><span>${art("calendar")}${dateLabel(state.date)}</span><div class="calendar-actions"><button class="icon-button" data-action="previous-week" aria-label="上一週">${art("arrow")}</button><button class="text-button" data-action="today">今天</button><button class="icon-button next" data-action="next-week" aria-label="下一週">${art("arrow")}</button></div></div><div class="week-days">${Array.from(
      { length: 7 },
      (_, i) => {
        const date = shiftDate(monday, i),
          selected = date === state.date,
          isToday = date === today();
        return `<button class="day ${selected ? "selected" : ""} ${isToday ? "current-day" : ""}" data-date="${date}" aria-pressed="${selected}" aria-label="${dateLabel(date)}${isToday ? "，今天" : ""}"><span>週${weekdayText[i + 1]}</span><strong>${Number(date.slice(-2))}</strong><i aria-hidden="true"></i></button>`;
      },
    ).join("")}</div></section>`;
  }
  function todayView() {
    const habits = state.habits.filter((h) => scheduledOn(h, state.date)),
      done = habits.filter((h) => h.todayProgress?.isCompleted).length,
      pct = habits.length ? Math.round((done / habits.length) * 100) : 0;
    return `<section class="welcome-banner"><div class="welcome-copy"><span class="handwritten">給生活一點溫柔。</span><h2>慢慢累積，也是一種前進。</h2><p>好好吃飯、讀一點書、讓身體動一動。<br>你的小小約定，都值得被記得。</p><span class="tiny-leaf">${art("leaf")}不用完美，有開始就很好。</span></div><div class="welcome-illustration">${sleepyCat()}<span class="cat-caption">今天也陪著你。</span></div></section><div class="today-layout"><section class="habit-column">${dateStrip()}<div class="progress-heading"><span>這天的小約定</span><strong>${done}<span> / ${habits.length} 完成</span></strong></div><div class="daily-track" role="progressbar" aria-label="所選日期的習慣完成比例" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><i style="width:${pct}%"></i></div><div class="habit-groups">${PERIODS.map(
      (p) => {
        const group = habits.filter((h) => h.period === p.id);
        return `<section class="habit-group ${p.id}" aria-label="${p.label}習慣"><div class="group-title"><h2><span class="period-icon">${art(p.icon)}</span>${p.label}</h2><span>${group.filter((h) => h.todayProgress?.isCompleted).length} / ${group.length}</span></div>${group.length ? group.map((h) => habitRow(h)).join("") : `<div class="empty-period"><p>這個時段，留一點空白。</p><button class="text-button" data-action="new" data-period="${p.id}">${art("plus")}新增${p.label}習慣</button></div>`}</section>`;
      },
    ).join(
      "",
    )}</div></section><aside class="daily-aside"><section class="small-note"><div class="note-illustration">${art("book")}${art("cup")}</div><span class="eyebrow">LITTLE REMINDER</span><h2>把想做的事，<br>放進日常裡。</h2><p>讓習慣有一個適合的時段，<br>也給自己一點彈性。</p><button class="button secondary" data-view="settings">${art("grid")}整理我的習慣</button></section><div class="daily-note"><span>慢慢來的小練習</span><p>先從一件簡單的小事開始，<br>不必一次改變所有事情。</p>${art("plant")}</div></aside></div>`;
  }

  return todayView;
}
