import {
  PERIODS,
  ICONS,
  UNITS,
  normalizeHabit,
  dateInZone,
  shiftDate,
  weekday,
  scheduledOn,
  scheduleLabel,
  targetLabel,
  newId,
} from "./domain/habits.js";
import { getHabitService } from "./services/habit-service.js";
import {
  illustration as art,
  sleepyCat,
  vine,
} from "./components/illustrations.js";
import { escapeHTML, weekdayText } from "./utils/html.js";
import { createHabitRowRenderer } from "./components/habit-row.js";
import { createTodayPage } from "./pages/today-page.js";
import { createSettingsPage } from "./pages/settings-page.js";
import { createHabitEditor } from "./components/habit-editor.js";
/** 可掛載至共用前端容器；呼叫回傳的函式解除事件與還原捲動設定。 */
export function mountHabitApp(
  root,
  { service = getHabitService(), timezone = "Asia/Taipei" } = {},
) {
  if (!root) throw Error("Habit app requires a container");
  let state = {
    view: "today",
    date: dateInZone(new Date(), timezone),
    habits: [],
    units: UNITS,
    loading: true,
    error: null,
    modal: null,
    saving: false,
    message: "",
  };
  let disposed = false,
    loadSequence = 0,
    messageTimer,
    lastFocus = null,
    previousOverflow = "";
  const today = () => dateInZone(new Date(), timezone);
  const dateLabel = (d) =>
    new Intl.DateTimeFormat("zh-TW", {
      month: "long",
      day: "numeric",
      weekday: "long",
      timeZone: "UTC",
    }).format(new Date(d + "T12:00:00Z"));
  const e = escapeHTML;
  const habitRow = createHabitRowRenderer({ state });
  const todayView = createTodayPage({ state, today, dateLabel, habitRow });
  const settingsView = createSettingsPage({ state, habitRow });
  const renderModal = createHabitEditor({ root, state, draftSummary });

  const nav = () =>
    `<button class="nav-link ${state.view === "today" ? "active" : ""}" data-view="today" ${state.view === "today" ? 'aria-current="page"' : ""}>${art("sun")}<span>今日習慣</span></button><button class="nav-link ${state.view === "settings" ? "active" : ""}" data-view="settings" ${state.view === "settings" ? 'aria-current="page"' : ""}>${art("grid")}<span>習慣設定</span></button>`;
  function shell() {
    root.innerHTML = `<div class="habit-workspace"><aside class="sidebar"><a class="brand" href="#today" data-view="today">${art("sprout")}<span>慢慢日常<small>LITTLE STEPS, LOVELY DAYS</small></span></a><div class="sidebar-heading">我 的 生 活 小 本 本</div><nav aria-label="主要導覽">${nav()}</nav><div class="sidebar-bottom">${art("leaf")}<p>不用一下子變得很厲害，<br>每天一點點，就很好。</p><span class="byline">一份只屬於你的日常</span></div>${vine()}</aside><div class="workspace-main"><header class="topbar"><a href="#today" data-view="today" class="mobile-brand">${art("sprout")}慢慢日常</a><span class="breadcrumb">我的生活小本本 <span class="slash">／</span> ${state.view === "today" ? "今日習慣" : "習慣設定"}</span><span class="local-indicator">${art("pen")}本機草稿</span></header><div class="mobile-tabs"><nav aria-label="手機導覽">${nav()}</nav></div><main class="page-content" id="habit-main" aria-busy="${state.loading}">${pageBody()}</main><footer class="app-footer"><span>內含示範習慣；新設定保存在此瀏覽器。</span><a href="handoff.html" target="_blank" rel="noopener">專題交付說明</a></footer></div></div><div class="toast ${state.message ? "visible" : ""}" role="status" aria-live="polite">${e(state.message)}</div><div class="modal-layer"></div>`;
    renderModal(false);
  }
  function pageBody() {
    return `<div class="page-heading"><div><p class="eyebrow">${state.view === "today" ? "A LITTLE BETTER, EVERY DAY" : "MY LITTLE PROMISES"}</p><h1>${state.view === "today" ? (state.date === today() ? "今天，也慢慢來。" : "這天，也照自己的步調。") : "讓喜歡的日常，慢慢發生。"}</h1><p class="heading-caption">${state.view === "today" ? "照顧好每一件小事，也照顧好自己。" : "把想做的事，變成每天的小小約定。"}</p></div><button class="button primary" data-action="new">${art("plus")}新增習慣</button></div>${state.loading ? loading() : state.error ? errorView() : state.view === "today" ? todayView() : settingsView()}`;
  }
  function loading() {
    return `<div class="loading-state" role="status" aria-label="正在讀取習慣"><div class="skeleton wide"></div><div class="skeleton"></div><div class="skeleton"></div><p>正在翻開你的小本本……</p></div>`;
  }
  function errorView() {
    return `<section class="empty-card error-card"><span class="empty-art">${art("book")}</span><h2>小本本暫時沒翻開</h2><p role="alert">${e(state.error.message)}</p><button class="button secondary" data-action="reload">再試一次</button></section>`;
  }
  async function load() {
    const seq = ++loadSequence;
    state.loading = true;
    state.error = null;
    shell();
    try {
      const [units, habits] = await Promise.all([
        service.listUnits(),
        service.listHabits({ date: state.date }),
      ]);
      if (disposed || seq !== loadSequence) return;
      state.units = units;
      state.habits = habits;
      state.loading = false;
      shell();
    } catch (error) {
      if (disposed || seq !== loadSequence) return;
      state.error = error;
      state.loading = false;
      shell();
    }
  }
  function notify(message) {
    state.message = message;
    const box = root.querySelector(".toast");
    if (box) {
      box.textContent = message;
      box.classList.add("visible");
    }
    clearTimeout(messageTimer);
    messageTimer = setTimeout(() => {
      state.message = "";
      root.querySelector(".toast")?.classList.remove("visible");
    }, 3800);
  }
  function openEditor(id, period = "morning") {
    const h = id ? state.habits.find((h) => h.id === id) : null;
    if (id && !h) return;
    lastFocus = document.activeElement;
    previousOverflow = document.body.style.overflow;
    state.modal = {
      id: h?.id || null,
      revision: h?.revision,
      requestId: newId(),
      error: null,
      draft: h
        ? {
            name: h.name,
            period: h.period,
            iconId: h.iconId,
            weekdays: [...h.weekdays],
            goal: structuredClone(h.goal),
          }
        : {
            name: "",
            period,
            iconId: "book",
            weekdays: [1, 2, 3, 4, 5, 6, 7],
            goal: { type: "check" },
          },
      targetBuffer: h?.goal.type === "quantity" ? h.goal.target : 60,
      unitBuffer:
        h?.goal.type === "quantity"
          ? h.goal.unitId
          : state.units[0]?.id || "minute",
    };
    document.body.style.overflow = "hidden";
    renderModal(true);
  }
  function closeEditor() {
    if (state.saving) return;
    state.modal = null;
    document.body.style.overflow = previousOverflow;
    root.querySelector(".modal-layer").innerHTML = "";
    if (lastFocus?.isConnected) lastFocus.focus();
  }
  function draftSummary() {
    const d = state.modal.draft;
    return `${PERIODS.find((p) => p.id === d.period)?.label || "早上"} · ${scheduleLabel(d.weekdays)} · ${d.goal.type === "check" ? "完成即可勾選" : `${d.goal.target || "—"} ${state.units.find((u) => u.id === d.goal.unitId)?.label || ""}`}`;
  }
  function syncDraftFromForm() {
    if (!state.modal) return;
    const form = root.querySelector("#habit-form");
    if (!form) return;
    const m = state.modal;
    m.draft.name = form.elements.name.value;
    if (m.draft.goal.type === "quantity") {
      m.targetBuffer = Number(form.elements.target.value);
      m.unitBuffer = form.elements.unitId.value;
      m.draft.goal = {
        type: "quantity",
        target: m.targetBuffer,
        unitId: m.unitBuffer,
      };
    }
  }
  function refreshPreview() {
    const m = state.modal;
    if (!m) return;
    root.querySelector("[data-preview-name]").textContent =
      m.draft.name.trim() || "你的小小約定";
    root.querySelector("[data-preview-summary]").textContent = draftSummary();
  }
  async function saveForm() {
    if (state.saving || !state.modal) return;
    syncDraftFromForm();
    const m = state.modal;
    try {
      const input = normalizeHabit(m.draft, state.units);
      state.saving = true;
      m.error = null;
      renderModal(false);
      if (m.id)
        await service.updateHabit(m.id, input, {
          expectedRevision: m.revision,
        });
      else await service.createHabit(input, { requestId: m.requestId });
      if (disposed) return;
      state.saving = false;
      state.modal = null;
      document.body.style.overflow = previousOverflow;
      await load();
      notify(
        m.id
          ? "小約定更新好了，繼續照自己的步調來。"
          : "新的小約定，已放進你的日常。",
      );
      lastFocus?.isConnected && lastFocus.focus();
    } catch (error) {
      if (disposed) return;
      state.saving = false;
      if (state.modal) {
        state.modal.error = error;
        renderModal(false);
        const field =
          error.field &&
          [...root.querySelectorAll("[name]")].find(
            (el) => el.name === error.field,
          );
        if (field) {
          field.setAttribute("aria-invalid", "true");
          field.focus();
        }
      }
    }
  }
  async function onClick(event) {
    const button = event.target.closest("button,a");
    if (!button || !root.contains(button)) return;
    if (button.dataset.view) {
      event.preventDefault();
      if (state.saving) return;
      closeEditor();
      state.view = button.dataset.view;
      state.message = "";
      await load();
      return;
    }
    if (button.dataset.date) {
      state.date = button.dataset.date;
      await load();
      return;
    }
    const action = button.dataset.action;
    if (action === "new") {
      openEditor(null, button.dataset.period || "morning");
      return;
    }
    if (action === "edit") {
      openEditor(button.dataset.id);
      return;
    }
    if (action === "close") {
      closeEditor();
      return;
    }
    if (action === "reload") {
      await load();
      return;
    }
    if (action === "today") {
      state.date = today();
      await load();
      return;
    }
    if (action === "previous-week" || action === "next-week") {
      state.date = shiftDate(state.date, action === "previous-week" ? -7 : 7);
      await load();
      return;
    }
    if (!state.modal || state.saving) return;
    syncDraftFromForm();
    const d = state.modal.draft;
    if (button.dataset.icon) d.iconId = button.dataset.icon;
    if (button.dataset.periodChoice) d.period = button.dataset.periodChoice;
    if (button.dataset.weekday) {
      const day = Number(button.dataset.weekday);
      d.weekdays = d.weekdays.includes(day)
        ? d.weekdays.filter((n) => n !== day)
        : [...d.weekdays, day].sort((a, b) => a - b);
    }
    if (button.dataset.goal) {
      d.goal =
        button.dataset.goal === "check"
          ? { type: "check" }
          : {
              type: "quantity",
              target: state.modal.targetBuffer,
              unitId: state.modal.unitBuffer,
            };
    }
    if (
      button.dataset.icon ||
      button.dataset.periodChoice ||
      button.dataset.weekday ||
      button.dataset.goal
    ) {
      state.modal.error = null;
      const selector = button.dataset.icon
        ? `[data-icon="${button.dataset.icon}"]`
        : button.dataset.periodChoice
          ? `[data-period-choice="${button.dataset.periodChoice}"]`
          : button.dataset.weekday
            ? `[data-weekday="${button.dataset.weekday}"]`
            : `[data-goal="${button.dataset.goal}"]`;
      renderModal(false);
      root.querySelector(selector)?.focus();
    }
  }
  function onInput(event) {
    if (!event.target.closest("#habit-form")) return;
    syncDraftFromForm();
    refreshPreview();
  }
  function onSubmit(event) {
    if (event.target.id === "habit-form") {
      event.preventDefault();
      saveForm();
    }
  }
  function onKeydown(event) {
    if (!state.modal) return;
    if (event.key === "Escape") {
      event.preventDefault();
      closeEditor();
      return;
    }
    if (event.key === "Tab") {
      const elements = [
          ...root
            .querySelector(".habit-dialog")
            .querySelectorAll("button,input,select"),
        ].filter((el) => !el.disabled && el.getClientRects().length),
        first = elements[0],
        last = elements.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }
  function onStorage(event) {
    if (service.storageKey && event.key === service.storageKey) {
      if (state.modal) {
        notify("另一個分頁更新了草稿。儲存時會再次確認版本。");
      } else load();
    }
  }
  root.addEventListener("click", onClick);
  root.addEventListener("input", onInput);
  root.addEventListener("change", onInput);
  root.addEventListener("submit", onSubmit);
  document.addEventListener("keydown", onKeydown);
  window.addEventListener("storage", onStorage);
  load();
  return () => {
    disposed = true;
    loadSequence++;
    clearTimeout(messageTimer);
    root.removeEventListener("click", onClick);
    root.removeEventListener("input", onInput);
    root.removeEventListener("change", onInput);
    root.removeEventListener("submit", onSubmit);
    document.removeEventListener("keydown", onKeydown);
    window.removeEventListener("storage", onStorage);
    if (state.modal) document.body.style.overflow = previousOverflow;
    root.innerHTML = "";
  };
}
