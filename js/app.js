/* app.js — Main application logic */

// === State ===
let currentView = 'today';
let selectedWeek = null;
let timerRestSeconds = 30;

// === Init ===
document.addEventListener('DOMContentLoaded', () => {
  registerSW();
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('加载超时，请检查浏览器是否禁用了存储功能')), 5000)
  );
  Promise.race([renderAll(), timeout]).catch(err => {
    console.error('Render failed:', err);
    document.getElementById('view-today').innerHTML =
      '<div class="card" style="margin:40px 20px;text-align:center">' +
      '<p>⚠️ 加载失败</p>' +
      '<p style="font-size:12px;color:var(--text2);margin-top:8px">' + err.message + '</p>' +
      '</div>';
  });
  updateNav();
  setInterval(checkTimeBasedUpdates, 60000); // Check every minute
});

function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
}

// === VIEW ===
function navigate(view) {
  try {
    currentView = view;
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    const target = document.getElementById(`view-${view}`);
    if (target) target.classList.add('active');
    updateNav();
    if (view === 'progress') renderProgressView().catch(e => console.error(e));
    if (view === 'week') renderWeekView().catch(e => console.error(e));
  } catch(e) {
    console.error('Navigation error:', e);
  }
}

function updateNav() {
  document.querySelectorAll('.nav-item').forEach(item => {
    const navView = item.getAttribute('data-view');
    item.classList.toggle('active', navView === currentView);
  });
}

// === Today's date helpers ===
function today() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDate(date) {
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
async function renderAll() {
  await renderTodayView();
  await renderWeekView();
  await renderDietView();
  renderSettingsView();
}

// === TODAY VIEW ===
async function renderTodayView() {
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

  const activity = getDailyActivity(date);
  Object.values(activity).forEach(act => {
    html += `
      <div class="card" style="margin:0 20px 12px">
        <div class="activity-row">
          <div class="activity-icon" style="background:${act.color}">${act.icon}</div>
          <div style="flex:1">
            <div style="font-size:14px;font-weight:600">${act.label}</div>
            <div style="font-size:12px;color:var(--text2)">${act.detail}</div>
            <div style="font-size:11px;color:var(--text2)">${act.kcal}</div>
          </div>
          <div class="activity-check" onclick="this.classList.toggle('done')"></div>
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

async function completeWorkout() {
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

// === REST TIMER ===
function startRestTimer(seconds, btnElement) {
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

// === EXERCISE DETAIL MODAL ===
function openExerciseDetail(exId) {
  const ex = EXERCISES[exId];
  if (!ex) return;

  let html = `
    <div class="modal-overlay" onclick="if(event.target===this)closeExerciseDetail()">
      <div class="modal-sheet">
        <div class="modal-handle"></div>
        <div class="modal-title">${ex.name}</div>
        <span class="modal-category">${ex.category}</span>
        <div class="modal-illustration-lg">${getIllustration(exId)}</div>

        <div class="modal-section">
          <h4>📋 动作步骤</h4>
          ${ex.instructions.map((s, i) => `
            <div class="step-item">
              <span class="step-num">${i + 1}</span>
              <span>${s}</span>
            </div>
          `).join('')}
        </div>

        <div class="modal-section">
          <h4>🔑 关键要点</h4>
          <div class="tip-box">${ex.tips}</div>
        </div>

        <div class="modal-section">
          <h4>🚫 常见错误</h4>
          <div class="mistake-box">${ex.mistakes.replace(/\n/g, '<br>')}</div>
        </div>

        <div class="modal-section">
          <h4>🫁 呼吸节奏</h4>
          <div style="font-size:13px;line-height:1.5">${ex.breathing}</div>
        </div>

        <div class="modal-section">
          <h4>🧠 为什么做这个动作</h4>
          <div style="font-size:13px;color:var(--text2);line-height:1.6">${ex.why}</div>
        </div>

        <button class="btn-outline" onclick="closeExerciseDetail()">关闭</button>
      </div>
    </div>`;

  document.getElementById('modal-container').innerHTML = html;
  document.body.style.overflow = 'hidden';
}

function closeExerciseDetail() {
  document.getElementById('modal-container').innerHTML = '';
  document.body.style.overflow = '';
}

// === WEEK VIEW ===
async function renderWeekView() {
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
    const day = d <= 5 ? d : (d === 6 ? '六' : '日');
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

  // Show exercises for selected day
  html += `<div class="section-header"><h3>训练详情</h3><span>点击某天查看</span></div>`;

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

  // Heatmap - load actual workout data
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
      // Calculate the actual date for this cell
      const cellDate = new Date(planStart);
      cellDate.setDate(cellDate.getDate() + (w - 1) * 7 + (d - 1));
      const dateKey = cellDate.toISOString().split('T')[0];
      let cls = 'heatmap-cell';
      if (d >= 6) cls += ' rest';
      else if (completedDates.has(dateKey)) cls += ' done';
      else if (cellDate > today()) cls += ' pending'; // future
      else cls += ' missed'; // past but not completed
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

async function changeWeek(delta) {
  if (!selectedWeek) selectedWeek = await getCurrentWeekAsync();
  selectedWeek = Math.max(1, Math.min(12, selectedWeek + delta));
  renderWeekView();
}

// === DIET VIEW ===
async function renderDietView() {
  const date = today();
  const week = await getCurrentWeekAsync();
  _cachedWeek = week;
  const meals = getTodayMeals(date, week);
  const phase = meals.phase;

  let html = `
    <div style="padding:0 20px">
      <div class="screen-title" style="font-size:22px;font-weight:700;font-family:Georgia,'Songti SC',serif;margin-bottom:4px">今日饮食</div>
      <div style="font-size:13px;color:var(--text2);margin-bottom:16px">
        阶段${phase.phase} · 日目标 ${phase.dailyKcal} kcal · 蛋白质 ${phase.dailyProtein}g
      </div>
    </div>

    <!-- Target chips -->
    <div class="chip-row">
      <div class="chip">
        <span class="chip-icon">🔥</span>
        <div class="chip-val">0</div>
        <div class="chip-label">/ ${phase.dailyKcal} kcal</div>
      </div>
      <div class="chip">
        <span class="chip-icon">🥩</span>
        <div class="chip-val">0</div>
        <div class="chip-label">/ ${phase.dailyProtein}g 蛋白质</div>
      </div>
    </div>

    <div class="chip-row">
      <div class="chip">
        <span class="chip-icon">${meals.coffee.icon}</span>
        <div style="font-size:13px;font-weight:600">${meals.coffee.cups}</div>
        <div class="chip-label">咖啡 · ${meals.coffee.time}</div>
      </div>
      <div class="chip">
        <span class="chip-icon">${meals.water.icon}</span>
        <div style="display:flex;justify-content:space-between">
          <span style="font-size:13px;font-weight:600" id="water-drank">0L</span>
          <span class="chip-label">/ ${meals.water.target}L</span>
        </div>
        <div class="water-bar"><div class="fill" id="water-fill" style="width:0%"></div></div>
      </div>
    </div>

    <!-- Coffee & sleep info -->
    <div class="info-box coffee">
      ☕ <strong>咖啡建议</strong><br>
      美式加冰 · ${meals.coffee.cups}/天<br>
      时间窗口 <strong>7:00 - 15:00</strong><br>
      ${meals.coffee.note}
    </div>

    <div class="info-box sleep">
      😴 <strong>今晚目标睡眠：${meals.sleep.target}</strong><br>
      ${meals.sleep.note}
    </div>

    <!-- Meals -->
    <div class="section-header">
      <h3>🍽️ 今日餐食</h3>
      <span>${meals.isTrainingDay ? '训练日 · 有加餐' : '休息日 · 不加餐'}</span>
    </div>

    <div class="card">`;

  [meals.breakfast, meals.lunch, meals.dinner, meals.snack].forEach(meal => {
    if (!meal) return;
    html += `
      <div class="meal-row">
        <div class="meal-icon" style="background:var(--bg)">${meal.icon}</div>
        <div class="meal-detail">
          <div class="meal-name">${meal.name} <span style="font-size:11px;color:var(--text2);font-weight:400">${meal.time}</span></div>
          <div class="meal-food">${meal.foods}</div>
          <div class="meal-kcal">${meal.kcal} · 蛋白质 ${meal.protein}</div>
        </div>
        <div class="activity-check" onclick="this.classList.toggle('done')"></div>
      </div>`;
  });

  html += `</div>`;

  // Canteen tip on weekdays
  if (meals.lunch.canteenNote) {
    html += `
      <div class="card" style="margin-top:12px">
        <div style="font-size:12px;color:var(--text2);line-height:1.6">
          🏢 <strong>食堂午餐提示</strong><br>
          ${meals.lunch.canteenNote}
        </div>
      </div>`;
  }

  // Water tracker buttons
  html += `
    <div class="section-header"><h3>💧 饮水追踪</h3><span>点一下 +200ml</span></div>
    <div class="card" style="text-align:center">
      <button class="water-btn" onclick="addWater(200)">+200ml 💧</button>
      <button class="water-btn" onclick="addWater(300)">+300ml ☕</button>
      <button class="water-btn" onclick="addWater(500)">+500ml 🫗</button>
    </div>`;

  // Weekly shopping list
  html += `
    <div class="section-header"><h3>🛒 本周采购清单</h3></div>
    <div class="card">
      <div style="font-size:12px;color:var(--text2);line-height:1.8">
        ${getWeeklyShoppingList().map(i => `<div>${i}</div>`).join('')}
      </div>
    </div>`;

  document.getElementById('view-diet').innerHTML = html;
}

function addWater(ml) {
  const L = ml / 1000;
  const el = document.getElementById('water-drank');
  const fill = document.getElementById('water-fill');
  if (!el || !fill) return;

  let current = parseFloat(el.textContent) || 0;
  current = Math.round((current + L) * 10) / 10;
  el.textContent = current + 'L';
  // Persist in session
  _waterDrank = current;

  // Use cached week or default phase 1
  const phase = _cachedWeek ? getNutritionPhase(_cachedWeek) : NUTRITION_PHASES[1];
  const pct = Math.min(100, (current / phase.dailyWater) * 100);
  fill.style.width = pct + '%';

  if (navigator.vibrate) navigator.vibrate(50);
}

// Water tracking session variable
let _waterDrank = 0;
let _cachedWeek = null;

// === PROGRESS VIEW ===
async function renderProgressView() {
  const week = await getCurrentWeekAsync();
  const date = today();
  const phase = getNutritionPhase(week);

  let html = `
    <div style="padding:0 20px">
      <div class="screen-title" style="font-size:22px;font-weight:700;font-family:Georgia,'Songti SC',serif;margin-bottom:4px">进度</div>
      <div style="font-size:13px;color:var(--text2);margin-bottom:16px">第 ${week} 周 · ${formatDate(date)}</div>
    </div>

    <div class="card">
      <div style="font-size:14px;font-weight:600;margin-bottom:12px">📊 本周统计</div>
      <div class="progress-row">
        <div class="progress-item">
          <div class="p-val" id="stat-completed">-</div>
          <div class="p-label">训练完成</div>
        </div>
        <div class="progress-item">
          <div class="p-val" id="stat-weight">-</div>
          <div class="p-label">体重 kg</div>
        </div>
        <div class="progress-item">
          <div class="p-val" id="stat-waist">-</div>
          <div class="p-label">腰围 cm</div>
        </div>
      </div>
    </div>

    <!-- Weekly Summary -->
    <div class="card" style="margin-top:12px;border:2px solid var(--accent);background:#F8FAF6">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <div style="font-size:14px;font-weight:700;color:var(--accent);font-family:Georgia,serif">📋 周反馈摘要</div>
        <span style="font-size:11px;color:var(--text2)">自动生成</span>
      </div>

      <div class="summary-box" id="summary-text">
【第 ${week} 周反馈】${formatDate(date)}

📊 自动统计（App 生成）
1. 训练完成：X/5 天
2. 骑行：X 次，共 X 分钟
3. 爬楼：X 次，约 X 分钟
4. 饮食打卡：早餐 X/7 · 午餐 X/7 · 晚餐 X/7 · 加餐 X/5
5. 饮水：平均 XL / 目标 ${phase.dailyWater}L
6. 咖啡：平均 X 杯/天
7. 睡眠：平均 Xh / 目标 ≥7h
8. 体重：Xkg · 腰围：Xcm

✏️ 需要补充（主观感受）
9. 最吃力的动作：
10. 最轻松的动作：
11. 肩颈感受：改善了 / 不变 / 加重了
　　具体：
12. 骨盆感受：站立时腰还酸吗？
13. 精力/食欲/睡眠质量：
      </div>

      <button class="btn-primary" onclick="copySummary()">📋 一键复制摘要</button>
      <div class="copy-confirm" id="copy-confirm">✅ 已复制！粘贴到和教练的对话框即可</div>
    </div>

    <!-- Weekly feedback form -->
    <div class="card" style="margin-top:12px">
      <div style="font-size:14px;font-weight:600;margin-bottom:12px">📝 补充本周主观感受</div>
      <label class="feedback-label">最吃力的动作</label>
      <textarea class="feedback-input" id="fb-hard" rows="1" maxlength="200" placeholder="哪个动作做不完或不舒服？"></textarea>
      <label class="feedback-label">最轻松的动作</label>
      <textarea class="feedback-input" id="fb-easy" rows="1" maxlength="200" placeholder="哪个动作毫无压力？"></textarea>
      <label class="feedback-label">肩颈感受</label>
      <textarea class="feedback-input" id="fb-shoulder" rows="2" maxlength="500" placeholder="改善了 / 不变 / 加重了 — 具体描述"></textarea>
      <label class="feedback-label">骨盆感受</label>
      <textarea class="feedback-input" id="fb-pelvis" rows="1" maxlength="300" placeholder="站立时腰还酸吗？死虫式腰能贴地吗？"></textarea>
      <label class="feedback-label">精力/食欲/睡眠质量</label>
      <textarea class="feedback-input" id="fb-energy" rows="2" maxlength="500" placeholder="白天精力怎么样？有没有食欲失控？睡眠好吗？"></textarea>
      <label class="feedback-label">本周体重 (kg) 和腰围 (cm)</label>
      <div style="display:flex;gap:8px">
        <input type="number" class="feedback-input" id="fb-weight" placeholder="体重 kg" step="0.1" style="flex:1">
        <input type="number" class="feedback-input" id="fb-waist" placeholder="腰围 cm" step="0.1" style="flex:1">
      </div>
      <button class="btn-primary" style="margin-top:8px" onclick="saveWeeklyFeedback()">💾 保存反馈</button>
    </div>

    <!-- Trend chart placeholder -->
    <div class="card" style="margin-top:12px">
      <div style="font-size:14px;font-weight:600;margin-bottom:8px">📈 体重 & 腰围趋势</div>
      <div style="text-align:center;color:var(--text2);padding:20px;font-size:13px" id="trend-placeholder">
        随着每周录入数据，12周趋势图自动绘制
      </div>
    </div>`;

  document.getElementById('view-progress').innerHTML = html;

  // Load stats
  loadProgressStats();
}

async function loadProgressStats() {
  const allWorkouts = await getAllWorkouts();
  const allFeedback = await getAllFeedback();

  // Count completed this week
  const week = await getCurrentWeekAsync();
  const startDate = await getPlanStartDate();
  const weekStart = new Date(startDate);
  weekStart.setDate(weekStart.getDate() + (week - 1) * 7);

  let completedCount = 0;
  allWorkouts.forEach(w => {
    const wDate = new Date(w.date);
    if (wDate >= weekStart && wDate < new Date(weekStart.getTime() + 7 * 86400000) && w.completed) {
      completedCount++;
    }
  });

  const completedEl = document.getElementById('stat-completed');
  if (completedEl) completedEl.textContent = completedCount + '/5';

  // Load latest weight/waist
  if (allFeedback.length > 0) {
    const latest = allFeedback[allFeedback.length - 1];
    const weightEl = document.getElementById('stat-weight');
    const waistEl = document.getElementById('stat-waist');
    if (weightEl && latest.weight) weightEl.textContent = latest.weight;
    if (waistEl && latest.waist) waistEl.textContent = latest.waist;
  }
}

function copySummary() {
  const text = document.getElementById('summary-text').textContent;
  navigator.clipboard.writeText(text).then(() => {
    const confirm = document.getElementById('copy-confirm');
    if (confirm) {
      confirm.style.display = 'block';
      setTimeout(() => { confirm.style.display = 'none'; }, 3000);
    }
  }).catch(() => {
    alert('复制失败，请手动选中文字复制');
  });
}

async function saveWeeklyFeedback() {
  const week = await getCurrentWeekAsync();
  const feedback = {
    week: week,
    date: today().toISOString().split('T')[0],
    hardExercise: document.getElementById('fb-hard')?.value || '',
    easyExercise: document.getElementById('fb-easy')?.value || '',
    shoulder: document.getElementById('fb-shoulder')?.value || '',
    pelvis: document.getElementById('fb-pelvis')?.value || '',
    energy: document.getElementById('fb-energy')?.value || '',
    weight: parseFloat(document.getElementById('fb-weight')?.value) || null,
    waist: parseFloat(document.getElementById('fb-waist')?.value) || null
  };

  try {
    await saveFeedback(feedback);
    updateSummaryWithFeedback(feedback);
    alert('✅ 反馈已保存！');
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    loadProgressStats();
  } catch (err) {
    alert('❌ 保存失败，请检查浏览器存储空间。');
    console.error('Feedback save error:', err);
  }
}

function updateSummaryWithFeedback(feedback) {
  const summaryEl = document.getElementById('summary-text');
  if (!summaryEl) return;

  let text = summaryEl.textContent;
  text = text.replace('9. 最吃力的动作：', `9. 最吃力的动作：${feedback.hardExercise || '___'}`);
  text = text.replace('10. 最轻松的动作：', `10. 最轻松的动作：${feedback.easyExercise || '___'}`);
  text = text.replace('11. 肩颈感受：改善了 / 不变 / 加重了\n　　具体：', `11. 肩颈感受：${feedback.shoulder || '___'}`);
  text = text.replace('12. 骨盆感受：站立时腰还酸吗？', `12. 骨盆感受：${feedback.pelvis || '___'}`);
  text = text.replace('13. 精力/食欲/睡眠质量：', `13. 精力/食欲/睡眠质量：${feedback.energy || '___'}`);
  if (feedback.weight) {
    text = text.replace('8. 体重：Xkg · 腰围：Xcm', `8. 体重：${feedback.weight}kg · 腰围：${feedback.waist || 'X'}cm`);
  }

  summaryEl.textContent = text;
}

// === SETTINGS VIEW ===
function renderSettingsView() {
  const html = `
    <div style="padding:0 20px">
      <div class="screen-title" style="font-size:22px;font-weight:700;font-family:Georgia,'Songti SC',serif;margin-bottom:4px">设置</div>
      <div style="font-size:13px;color:var(--text2);margin-bottom:16px">应用偏好</div>
    </div>

    <div class="card">
      <div style="font-size:14px;font-weight:600;margin-bottom:12px">🔔 通知</div>
      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border)">
        <div>
          <div style="font-size:13px;font-weight:500">每日训练提醒</div>
          <div style="font-size:11px;color:var(--text2)">每天 19:30</div>
        </div>
        <div style="width:44px;height:26px;border-radius:13px;background:var(--accent);position:relative">
          <div style="width:20px;height:20px;border-radius:50%;background:#fff;position:absolute;top:3px;right:3px;box-shadow:0 1px 2px rgba(0,0,0,0.15)"></div>
        </div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border)">
        <div>
          <div style="font-size:13px;font-weight:500">周日反馈提醒</div>
          <div style="font-size:11px;color:var(--text2)">每周日 20:00</div>
        </div>
        <div style="width:44px;height:26px;border-radius:13px;background:var(--accent);position:relative">
          <div style="width:20px;height:20px;border-radius:50%;background:#fff;position:absolute;top:3px;right:3px;box-shadow:0 1px 2px rgba(0,0,0,0.15)"></div>
        </div>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0">
        <div>
          <div style="font-size:13px;font-weight:500">组间休息震动</div>
          <div style="font-size:11px;color:var(--text2)">计时结束震动提醒</div>
        </div>
        <div style="width:44px;height:26px;border-radius:13px;background:var(--accent);position:relative">
          <div style="width:20px;height:20px;border-radius:50%;background:#fff;position:absolute;top:3px;right:3px;box-shadow:0 1px 2px rgba(0,0,0,0.15)"></div>
        </div>
      </div>
    </div>

    <div class="card" style="margin-top:12px">
      <div style="font-size:14px;font-weight:600;margin-bottom:12px">📱 关于</div>
      <div style="font-size:12px;color:var(--text2);line-height:1.8">
        版本 1.0 · 12周居家训练计划<br>
        纯本地存储 · 完全离线可用<br>
        数据仅保存在您的设备上
      </div>
    </div>

    <div class="card" style="margin-top:12px">
      <div style="font-size:14px;font-weight:600;margin-bottom:12px">🔄 重置</div>
      <button class="btn-outline" onclick="resetAllData()" style="color:var(--danger);border-color:var(--danger)">
        🗑️ 清除所有本地数据
      </button>
    </div>`;

  document.getElementById('view-settings').innerHTML = html;
}

async function resetAllData() {
  if (confirm('确定要清除所有训练记录和反馈数据吗？此操作不可撤销。')) {
    const db = await openDB();
    const stores = ['workouts', 'feedback', 'meals', 'settings'];
    for (const store of stores) {
      await new Promise((resolve, reject) => {
        const tx = db.transaction(store, 'readwrite');
        tx.objectStore(store).clear();
        tx.oncomplete = resolve;
        tx.onerror = reject;
      });
    }
    alert('✅ 数据已清除');
    renderAll();
    navigate('today');
  }
}

// === Periodic Updates ===
function checkTimeBasedUpdates() {
  const now = new Date();
  // Refresh today view at midnight
  if (now.getHours() === 0 && now.getMinutes() === 0) {
    renderTodayView();
  }
  // Sunday 20:00 reminder
  if (now.getDay() === 0 && now.getHours() === 20 && now.getMinutes() === 0) {
    if (Notification.permission === 'granted') {
      new Notification('📋 周反馈提醒', {
        body: '本周训练结束了！花1分钟填写反馈，教练帮你调整下周方案。',
        icon: '/icons/icon-192.png'
      });
    }
    alert('📋 记得填写本周反馈！打开「进度」tab → 一键复制摘要 → 发给教练');
  }
}
