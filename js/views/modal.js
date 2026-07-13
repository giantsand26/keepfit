/* views/modal.js — Exercise detail modal */

import { EXERCISES } from '../data.js';
import { getIllustration } from '../illustrations.js';

export function openExerciseDetail(exId) {
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

export function closeExerciseDetail() {
  document.getElementById('modal-container').innerHTML = '';
  document.body.style.overflow = '';
}
