/* views/week.js — Week plan view */

import { getAllWorkouts } from '../storage.js';
import { getWeekNumber, getPhase, getDayPlan, getPlanStartDate, EXERCISES } from '../data.js';
import { formatDate, today } from './today.js';

let selectedWeek = null;

async function getCurrentWeekAsync() {
  return getWeekNumber(today());
}

export async function renderWeekView() {
  const currentWeek = await getCurrentWeekAsync();
  if (!selectedWeek) selectedWeek = currentWeek;

  let html = `
    <div style="padding:0 20px">
      <div class="screen-title" style="font-size:22px;font-weight:700;font-family:Georgia,'Songti SC',serif;margin-bottom:4px">周计划</div>
      <div style="font-size:13px;color:var(--text2);margin-bottom:16px">12周训练总览 · 阶段${getPhase(selectedWeek)}</div>
    </div>

    <div class="cal-nav">
      <button onclick="changeWeek(-1)">◀</button>
      <span class="cal-week">第 ${selectedWeek} 周</span>
      <button onclick="changeWeek(1)">▶</button>
    </div>

    <div class="card">
      <div style="font-size:13px;font-weight:600;margin-bottom:8px">本周训练</div>
      <div class="week-grid">
        <div class="week-day-label">一</div><div class="week-day-label">二</div>
        <div class="week-day-label">三</div><div class="week-day-label">四</div>
        <div class="week-day-label">五</div>
        <div class="week-day-label">六</div><div class="week-day-label">日</div>`;

  for (let d = 1; d <= 7; d++) {
    const isRest = d >= 6;
    const isCurrentWeek = selectedWeek === currentWeek;
    const isToday = isCurrentWeek && today().getDay() === (d === 6 ? 6 : d === 7 ? 0 : d);

    let cls = 'week-cell';
    if (isRest) cls += ' rest';
    else if (isToday) cls += ' today';
    else cls += ' pending';

    const label = isRest ? '休' : d;
    html += `<div class="${cls}">${label}</div>`;
  }

  html += `</div></div>`;

  // Show exercises for each day
  html += `<div class="section-header"><h3>训练详情</h3></div>`;

  for (let d = 1; d <= 5; d++) {
    const plan = getDayPlan(selectedWeek, d);
    if (!plan) continue;
    const dayNames = ['', '周一', '周二', '周三', '周四', '周五'];
    html += `
      <div class="card">
        <div style="font-size:14px;font-weight:600;margin-bottom:8px">${dayNames[d]} · ${plan.theme}</div>
        ${plan.exercises.map(ex => {
          const def = EXERCISES[ex.exId];
          return def ? `<div style="font-size:12px;color:var(--accent);padding:3px 0;cursor:pointer;text-decoration:underline;text-underline-offset:2px" onclick="openExerciseDetail('${ex.exId}')">· ${def.name} ${ex.sets ? ex.sets+'组' : ''} ${ex.reps}</div>` : '';
        }).join('')}
      </div>`;
  }

  // Heatmap
  const allWorkouts = await getAllWorkouts();
  const completedDates = new Set(allWorkouts.filter(w => w.completed).map(w => w.date));

  html += `
    <div class="card" style="margin-top:12px">
      <div style="font-size:14px;font-weight:600;margin-bottom:8px">📈 12 周热力图</div>
      <div style="display:flex;flex-direction:column;gap:4px">`;

  const planStart = await getPlanStartDate();
  for (let w = 1; w <= 12; w++) {
    html += `<div class="heatmap-row">`;
    html += `<span class="heatmap-label">W${w}</span>`;
    for (let d = 1; d <= 7; d++) {
      const cellDate = new Date(planStart);
      cellDate.setDate(cellDate.getDate() + (w - 1) * 7 + (d - 1));
      const dateKey = cellDate.toISOString().split('T')[0];
      let cls = 'heatmap-cell';
      if (d >= 6) cls += ' rest';
      else if (completedDates.has(dateKey)) cls += ' done';
      else if (cellDate > today()) cls += ' pending';
      else cls += ' missed';
      html += `<div class="${cls}"></div>`;
    }
    html += `</div>`;
  }

  html += `
      </div>
      <div style="display:flex;gap:10px;margin-top:8px;font-size:10px;color:var(--text2);justify-content:center">
        <span>🟢 完成</span><span>🔴 缺勤</span><span>⬜ 休息</span>
      </div>
    </div>`;

  document.getElementById('view-week').innerHTML = html;
}

export async function changeWeek(delta) {
  if (!selectedWeek) selectedWeek = await getCurrentWeekAsync();
  selectedWeek = Math.max(1, Math.min(12, selectedWeek + delta));
  renderWeekView();
}
