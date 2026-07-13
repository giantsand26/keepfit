/* views/progress.js — Progress + feedback view */

import { openDB, getAllWorkouts, getAllFeedback, saveFeedback } from '../storage.js';
import { getWeekNumber, getPlanStartDate } from '../data.js';
import { getNutritionPhase } from '../nutrition.js';
import { today as getToday, formatDate } from './today.js';

export async function renderProgressView() {
  const week = await getWeekNumber(getToday());
  const date = getToday();
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

  loadProgressStats();
}

async function loadProgressStats() {
  const allWorkouts = await getAllWorkouts();
  const allFeedback = await getAllFeedback();

  const week = await getWeekNumber(getToday());
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

  if (allFeedback.length > 0) {
    const latest = allFeedback[allFeedback.length - 1];
    const weightEl = document.getElementById('stat-weight');
    const waistEl = document.getElementById('stat-waist');
    if (weightEl && latest.weight) weightEl.textContent = latest.weight;
    if (waistEl && latest.waist) waistEl.textContent = latest.waist;
  }
}

export function copySummary() {
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

export async function saveWeeklyFeedback() {
  const week = await getWeekNumber(getToday());
  const feedback = {
    week: week,
    date: getToday().toISOString().split('T')[0],
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
