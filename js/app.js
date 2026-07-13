/* app.js — Main application entry point */

import { renderTodayView, completeWorkout, startRestTimer, toggleActivityCheck } from './views/today.js';
import { renderWeekView, changeWeek } from './views/week.js';
import { renderDietView, addWater, toggleMealCheck } from './views/diet.js';
import { renderProgressView, saveWeeklyFeedback, copySummary } from './views/progress.js';
import { renderSettingsView, resetAllData } from './views/settings.js';
import { openExerciseDetail, closeExerciseDetail } from './views/modal.js';

// === State ===
let currentView = 'today';

// === Expose onclick handlers to window (module top-level, before DOMContentLoaded) ===
window.navigate = navigate;
window.completeWorkout = completeWorkout;
window.startRestTimer = startRestTimer;
window.openExerciseDetail = openExerciseDetail;
window.closeExerciseDetail = closeExerciseDetail;
window.changeWeek = changeWeek;
window.addWater = addWater;
window.toggleMealCheck = toggleMealCheck;
window.toggleActivityCheck = toggleActivityCheck;
window.saveWeeklyFeedback = saveWeeklyFeedback;
window.copySummary = copySummary;
window.resetAllData = resetAllData;

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
  setInterval(checkTimeBasedUpdates, 60000);
});

function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

// === Navigation ===
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

// === Main Render ===
async function renderAll() {
  await renderTodayView();
  await renderWeekView();
  await renderDietView();
  renderSettingsView();
}

// === Periodic Updates ===
function checkTimeBasedUpdates() {
  const now = new Date();
  if (now.getHours() === 0 && now.getMinutes() === 0) {
    renderTodayView();
  }
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
