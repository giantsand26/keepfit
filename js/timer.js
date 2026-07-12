/* timer.js — Rest timer with vibration */

let timerInterval = null;
let timerSeconds = 0;
let timerCallback = null;

function startTimer(seconds, onTick, onComplete) {
  stopTimer();
  timerSeconds = seconds;
  timerCallback = onComplete;

  if (onTick) onTick(timerSeconds);

  timerInterval = setInterval(() => {
    timerSeconds--;
    if (onTick) onTick(timerSeconds);

    if (timerSeconds <= 0) {
      stopTimer();
      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
      }
      if (onComplete) onComplete();
    }
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  timerSeconds = 0;
  timerCallback = null;
}

function getTimerSeconds() {
  return timerSeconds;
}

function isTimerRunning() {
  return timerInterval !== null;
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
