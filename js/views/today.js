/* views/today.js — Today's workout view */

import { getWorkout, saveWorkout, getActivityChecks, saveActivityCheck } from '../storage.js';
import { getWeekNumber, getPhase, getDayPlan, EXERCISES } from '../data.js';
import { getIllustration } from '../illustrations.js';
import { getDailyActivity } from '../nutrition.js';
import { startTimer, stopTimer, isTimerRunning } from '../timer.js';

// === Today's date helpers ===
export function today() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function formatDate(date) {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return `${y}年${m}月${d}日 ${weekDays[date.getDay()]}`;
}

function getCurrentWeekAsync() {
  return getWeekNumber(today());
}

// === Main Render ===
export async function renderTodayView() {
  const date = today();
  const week = await getCurrentWeekAsync();
  const dow = date.getDay();
  const isRestDay = (dow === 0 || dow === 6);
  const planDay = isRestDay ? null : dow;

  let html = '';

  if (isRestDay) {
    html += `
      <div class="today-card">
        <div class="week-label">${formatDate(date)} · 第 ${week} 周</div>
        <div class="theme">🌿 休息日</div>
        <div class="meta">${dow === 6 ? '周六：可骑行 + 10分钟跨步爬楼' : '周日：完全休息，恢复身体'}</div>
        <div class="stats">
          <div><strong>放松</strong> 让身体恢复</div>
          <div><strong>散步</strong> 可选</div>
        </div>
      </div>`;
  } else {
    const plan = getDayPlan(week, planDay);
    if (plan) {
      html += `
        <div class="today-card">
          <div class="week-label">${formatDate(date)} · 第 ${week} 周 · 阶段${getPhase(week)}</div>
          <div class="theme">${plan.theme}</div>
          <div class="stats">
            <div><strong>${plan.exercises.length}</strong> 动作</div>
            <div><strong>10</strong> 分钟</div>
            <div><strong>~50</strong> kcal</div>
          </div>
        </div>

        <div class="section-header">
          <h3>🏋️ 今日训练</h3>
          <span>点击动作查看详情</span>
        </div>`;

      if (plan.isCircuit) {
        html += `
          <div class="card" style="margin:0 20px 12px;background:#F0F7EE;border-color:var(--accent-soft)">
            <div style="font-size:12px;color:var(--accent);font-weight:600;margin-bottom:4px">🔁 循环训练 · ${plan.rounds} 轮</div>
            <div style="font-size:11px;color:var(--text2)">轮间休息 ${plan.roundRest}秒</div>
          </div>`;
      }

      if (plan.isAMRAP) {
        html += `
          <div class="card" style="margin:0 20px 12px;background:#FFF3E0;border-color:var(--accent-warm)">
            <div style="font-size:12px;color:var(--accent-warm);font-weight:600;margin-bottom:4px">⏱️ AMRAP · ${plan.durationMin} 分钟</div>
            <div style="font-size:11px;color:var(--text2)">尽可能多轮——记录完成的轮数</div>
          </div>`;
      }

      plan.exercises.forEach(ex => {
        const exDef = EXERCISES[ex.exId];
        if (!exDef) return;
        html += `
          <div class="card exercise-card" onclick="openExerciseDetail('${ex.exId}')">
            <div class="ex-row">
              <div class="ex-illustration">${getIllustration(ex.exId)}</div>
              <div class="ex-info">
                <div class="ex-name">${exDef.name}</div>
                <div class="ex-tags">
                  <span>${ex.sets ? ex.sets + '组' : ''}</span>
                  <span>${ex.reps}</span>
                  ${ex.restSeconds ? `<span>休${ex.restSeconds}s</span>` : ''}
                </div>
              </div>
              ${ex.restSeconds ? `<button class="timer-btn" onclick="event.stopPropagation();startRestTimer(${ex.restSeconds}, this)" data-rest="${ex.restSeconds}">▶ ${ex.restSeconds}s</button>` : '<span style="font-size:11px;color:var(--text2);flex-shrink:0">无间歇</span>'}
            </div>
          </div>`;
      });

      html += `
        <button class="complete-btn" id="complete-btn" onclick="completeWorkout()">
          ✅ 完成今日训练
        </button>`;
    }
  }

  // Activity section
  html += `
    <div class="section-header">
      <h3>🚶 今日活动</h3>
      <span>${isRestDay ? '休息日' : '工作日通勤'}</span>
    </div>`;

  // Load persisted activity checks
  const checks = await getActivityChecks(today());

  const activity = getDailyActivity(date);
  Object.keys(activity).forEach(key => {
    const act = activity[key];
    const checked = checks[key] ? ' done' : '';
    html += `
      <div class="card" style="margin:0 20px 12px">
        <div class="activity-row">
          <div class="activity-icon" style="background:${act.color}">${act.icon}</div>
          <div style="flex:1">
            <div style="font-size:14px;font-weight:600">${act.label}</div>
            <div style="font-size:12px;color:var(--text2)">${act.detail}</div>
            <div style="font-size:11px;color:var(--text2)">${act.kcal}</div>
          </div>
          <div class="activity-check${checked}" onclick="toggleActivityCheck('${key}', this)"></div>
        </div>
      </div>`;
  });

  if (!isRestDay) {
    html += `
      <div class="info-box cycling">
        🚴 <strong>骑行姿势提醒</strong><br>
        调高座垫 · 手肘微弯不耸肩 · 10分钟是安全线
      </div>`;
  }

  document.getElementById('view-today').innerHTML = html;

  // Check if already completed today
  checkWorkoutCompleted();
}

// === Activity Check Persistence ===
export async function toggleActivityCheck(activityId, el) {
  el.classList.toggle('done');
  const done = el.classList.contains('done');
  try {
    await saveActivityCheck(today(), activityId, done);
  } catch(e) {
    console.error('Activity check save error:', e);
  }
}

// === Workout Completion ===
async function checkWorkoutCompleted() {
  const dateKey = today().toISOString().split('T')[0];
  const record = await getWorkout(dateKey);
  if (record && record.completed) {
    const btn = document.getElementById('complete-btn');
    if (btn) {
      btn.textContent = '✅ 今日已完成 ✓';
      btn.classList.add('done');
      btn.onclick = null;
    }
  }
}

export async function completeWorkout() {
  const dateKey = today().toISOString().split('T')[0];
  const week = await getCurrentWeekAsync();
  try {
    await saveWorkout(dateKey, {
      week: week,
      day: today().getDay(),
      completed: true,
      completedAt: new Date().toISOString()
    });
    const btn = document.getElementById('complete-btn');
    if (btn) {
      btn.textContent = '✅ 今日已完成 ✓';
      btn.classList.add('done');
      btn.onclick = null;
    }
    if (navigator.vibrate) navigator.vibrate(100);
  } catch (err) {
    alert('❌ 保存失败，请检查浏览器存储空间。');
    console.error('Workout save error:', err);
  }
}

// === Rest Timer ===
export function startRestTimer(seconds, btnElement) {
  if (isTimerRunning()) {
    stopTimer();
    if (btnElement) {
      btnElement.textContent = `▶ ${seconds}s`;
      btnElement.classList.remove('running');
    }
    return;
  }

  if (btnElement) {
    btnElement.classList.add('running');
  }

  startTimer(seconds,
    (remaining) => {
      if (btnElement) {
        btnElement.textContent = `⏸ ${remaining}s`;
      }
    },
    () => {
      if (btnElement) {
        btnElement.textContent = `▶ ${seconds}s`;
        btnElement.classList.remove('running');
      }
      alert('⏰ 休息时间到！准备下一组');
    }
  );
}
