/* views/settings.js — Settings view */

import { openDB } from '../storage.js';

export function renderSettingsView() {
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
        版本 1.1 · 12周居家训练计划<br>
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

export async function resetAllData() {
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
    // Reload app
    location.reload();
  }
}
