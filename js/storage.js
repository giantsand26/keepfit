/* storage.js — IndexedDB wrapper for workout app */

const DB_NAME = 'workout-app';
const DB_VERSION = 1;

export function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('workouts')) {
        db.createObjectStore('workouts', { keyPath: 'date' });
      }
      if (!db.objectStoreNames.contains('feedback')) {
        db.createObjectStore('feedback', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('meals')) {
        db.createObjectStore('meals', { keyPath: 'date' });
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onblocked = () => reject(new Error('IndexedDB 被阻塞（可能处于隐私模式）'));
  });
}

async function dbPut(storeName, data) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).put(data);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function dbGet(storeName, key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const req = tx.objectStore(storeName).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbGetAll(storeName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const req = tx.objectStore(storeName).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function dbDelete(storeName, key) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    tx.objectStore(storeName).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// === Workout helpers ===

export async function saveWorkout(date, data) {
  await dbPut('workouts', { date, ...data, updatedAt: new Date().toISOString() });
}

export async function getWorkout(date) {
  return dbGet('workouts', date);
}

export async function getAllWorkouts() {
  return dbGetAll('workouts');
}

// === Activity check helpers (cycling, walking, stairs) ===

export async function saveActivityCheck(date, activityId, done) {
  const existing = await getWorkout(date) || { date };
  const checks = existing.activityChecks || {};
  checks[activityId] = done;
  await saveWorkout(date, { ...existing, activityChecks: checks });
}

export async function getActivityChecks(date) {
  const record = await getWorkout(date);
  return record ? (record.activityChecks || {}) : {};
}

// === Meal helpers ===

export async function saveMeal(date, mealData) {
  await dbPut('meals', { date, ...mealData, updatedAt: new Date().toISOString() });
}

export async function getMeal(date) {
  return dbGet('meals', date);
}

// === Meal check helpers ===

export async function saveMealCheck(date, mealType, done) {
  const existing = await getMeal(date) || { date };
  const checks = existing.mealChecks || {};
  checks[mealType] = done;
  await saveMeal(date, { ...existing, mealChecks: checks });
}

export async function getMealChecks(date) {
  const record = await getMeal(date);
  return record ? (record.mealChecks || {}) : {};
}

// === Feedback helpers ===

export async function saveFeedback(feedback) {
  await dbPut('feedback', { ...feedback, createdAt: new Date().toISOString() });
}

export async function getAllFeedback() {
  return dbGetAll('feedback');
}

// === Settings helpers ===

export async function saveSetting(key, value) {
  await dbPut('settings', { key, value });
}

export async function getSetting(key, defaultValue = null) {
  const result = await dbGet('settings', key);
  return result ? result.value : defaultValue;
}
