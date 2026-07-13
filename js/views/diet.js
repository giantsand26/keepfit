/* views/diet.js — Diet + water tracking view */

import { getMeal, saveMeal, getMealChecks, saveMealCheck } from '../storage.js';
import { getWeekNumber } from '../data.js';
import { getTodayMeals, getNutritionPhase, getWeeklyShoppingList, NUTRITION_PHASES } from '../nutrition.js';

let _cachedWeek = null;

function today() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function renderDietView() {
  const date = today();
  const week = await getWeekNumber(date);
  _cachedWeek = week;
  const meals = getTodayMeals(date, week);
  const phase = meals.phase;

  // Load persisted meal checks
  const mealChecks = await getMealChecks(date);

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

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];
  const mealList = [meals.breakfast, meals.lunch, meals.dinner, meals.snack];

  mealList.forEach((meal, idx) => {
    if (!meal) return;
    const mealType = mealTypes[idx];
    const checked = mealChecks[mealType] ? ' done' : '';
    html += `
      <div class="meal-row">
        <div class="meal-icon" style="background:var(--bg)">${meal.icon}</div>
        <div class="meal-detail">
          <div class="meal-name">${meal.name} <span style="font-size:11px;color:var(--text2);font-weight:400">${meal.time}</span></div>
          <div class="meal-food">${meal.foods}</div>
          <div class="meal-kcal">${meal.kcal} · 蛋白质 ${meal.protein}</div>
        </div>
        <div class="activity-check${checked}" onclick="toggleMealCheck('${mealType}', this)"></div>
      </div>`;
  });

  html += `</div>`;

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

  // Load persisted water data
  loadWaterData();
}

// === Meal Check Persistence ===
export async function toggleMealCheck(mealType, el) {
  el.classList.toggle('done');
  const done = el.classList.contains('done');
  try {
    await saveMealCheck(today(), mealType, done);
  } catch(e) {
    console.error('Meal check save error:', e);
  }
}

// === Water Tracking ===
async function loadWaterData() {
  const dateKey = today().toISOString().split('T')[0];
  let water = 0;
  try {
    const mealData = await getMeal(dateKey);
    if (mealData && typeof mealData.water === 'number') {
      water = mealData.water;
    }
  } catch(e) {
    try {
      const val = sessionStorage.getItem('water_' + dateKey);
      if (val) water = parseFloat(val);
    } catch(_) {}
  }

  if (water > 0) {
    const el = document.getElementById('water-drank');
    const fill = document.getElementById('water-fill');
    if (el) el.textContent = water + 'L';
    if (fill) {
      const phase = _cachedWeek ? getNutritionPhase(_cachedWeek) : NUTRITION_PHASES[1];
      const pct = Math.min(100, (water / phase.dailyWater) * 100);
      fill.style.width = pct + '%';
    }
  }
}

export async function addWater(ml) {
  const L = ml / 1000;
  const el = document.getElementById('water-drank');
  const fill = document.getElementById('water-fill');
  if (!el || !fill) return;

  const dateKey = today().toISOString().split('T')[0];

  let current = parseFloat(el.textContent) || 0;
  current = Math.round((current + L) * 10) / 10;
  el.textContent = current + 'L';

  // Persist to IndexedDB
  try {
    const existing = await getMeal(dateKey);
    await saveMeal(dateKey, { ...existing, water: current });
  } catch(e) {
    try { sessionStorage.setItem('water_' + dateKey, current); } catch(_) {}
  }

  const phase = _cachedWeek ? getNutritionPhase(_cachedWeek) : NUTRITION_PHASES[1];
  const pct = Math.min(100, (current / phase.dailyWater) * 100);
  fill.style.width = pct + '%';

  if (navigator.vibrate) navigator.vibrate(50);
}
