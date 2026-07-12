/* nutrition.js — Daily diet templates and nutrition advice */

const NUTRITION_PHASES = {
  1: {
    phase: 1,
    weeks: '1-4周',
    dailyKcal: 1550,
    dailyProtein: 65,
    dailyWater: 1.6,
    carbRatio: '50%',
    tip: '阶段一不改变热量，先让身体适应训练节奏。晚餐去主食，休息日不加餐。'
  },
  2: {
    phase: 2,
    weeks: '5-8周',
    dailyKcal: 1650,
    dailyProtein: 80,
    dailyWater: 1.8,
    carbRatio: '45%',
    tip: '微增热量支持肌肉生长。蛋白质提高到每公斤 1.5g。'
  },
  3: {
    phase: 3,
    weeks: '9-12周',
    dailyKcal: 1500,
    dailyProtein: 80,
    dailyWater: 1.9,
    carbRatio: '40%',
    tip: '利用代谢提升自然减脂。维持高蛋白保住肌肉。'
  }
};

// Breakfast options (4-day rotation)
const BREAKFASTS = [
  { main: '蒸红薯 1个（拳头大小）', icon: '🍠' },
  { main: '杂粮饭 小半碗（~80g）', icon: '🍚' },
  { main: '蒸玉米 半根', icon: '🌽' },
  { main: '全麦面包 2片', icon: '🍞' }
];

// Lunch protein options
const LUNCH_PROTEINS = {
  mon: { main: '鸡胸肉 100g 炒西兰花', icon: '🍗' },
  tue: { main: '清蒸小黄鱼 2条', icon: '🐟' },
  wed: { main: '清蒸小黄鱼 2条', icon: '🐟' },
  thu: { main: '清蒸小黄鱼 2条', icon: '🐟' },
  fri: { main: '清蒸小黄鱼 2条', icon: '🐟' },
  sat: { main: '鸡胸肉 100g 炒菌菇', icon: '🍗' },
  sun: { main: '去皮鸡腿 1个', icon: '🍗' }
};

const DINNER_PROTEINS = {
  mon: { main: '老豆腐 200g 炖白菜 + 菌菇汤', icon: '🫘' },
  tue: { main: '鸡胸肉 100g 炒豆角 + 凉拌黄瓜', icon: '🍗' },
  wed: { main: '去皮鸡腿 1个 + 炒小油菜', icon: '🍗' },
  thu: { main: '番茄豆腐煲', icon: '🫘' },
  fri: { main: '鸡胸肉 100g 炒菌菇 + 凉拌豆角', icon: '🍗' },
  sat: { main: '番茄菌菇豆腐汤', icon: '🫘' },
  sun: { main: '老豆腐 200g 炖白菜', icon: '🫘' }
};

function getNutritionPhase(week) {
  if (week <= 4) return NUTRITION_PHASES[1];
  if (week <= 8) return NUTRITION_PHASES[2];
  return NUTRITION_PHASES[3];
}

function getTodayMeals(date, week) {
  const dow = date.getDay(); // 0=Sun, 1=Mon ... 6=Sat
  const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  const dayKey = dayNames[dow];
  const isTrainingDay = dow >= 1 && dow <= 5; // Mon-Fri
  const isRestDay = !isTrainingDay;

  // Rotate breakfast by day of year
  const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
  const breakfast = BREAKFASTS[dayOfYear % 4];

  const lunchProtein = LUNCH_PROTEINS[dayKey] || LUNCH_PROTEINS.mon;
  const dinnerProtein = DINNER_PROTEINS[dayKey] || DINNER_PROTEINS.mon;

  const phase = getNutritionPhase(week);

  return {
    isTrainingDay,
    isRestDay,
    breakfast: {
      time: '7:00-8:30',
      name: '早餐',
      icon: '🥣',
      foods: `${breakfast.main} · 煮鸡蛋 2个`,
      kcal: '~350 kcal',
      protein: '15g'
    },
    lunch: {
      time: '12:00-13:00',
      name: '午餐',
      icon: '🍱',
      foods: `半碗米饭 · ${lunchProtein.main} · 时蔬`,
      kcal: '~500 kcal',
      protein: '26g',
      canteenNote: '食堂：清蒸/白切优先，米饭拨掉一半，太油的菜涮汤'
    },
    dinner: {
      time: '18:00-19:00',
      name: '晚餐（无主食）',
      icon: '🍽️',
      foods: dinnerProtein.main,
      kcal: '~400 kcal',
      protein: '22g'
    },
    snack: isTrainingDay ? {
      time: '训练后30分钟内',
      name: '加餐',
      icon: '🥛',
      foods: '无糖酸奶 200g',
      kcal: '~120 kcal',
      protein: '8g'
    } : null,
    coffee: {
      cups: '1-2杯',
      time: '7:00 - 15:00',
      note: '美式加冰 · 先吃早餐再喝咖啡',
      icon: '☕'
    },
    water: {
      target: phase.dailyWater,
      unit: 'L',
      icon: '💧'
    },
    sleep: {
      target: '≥7小时',
      note: '减脂期睡眠不足 → 第二天食欲失控',
      icon: '😴'
    },
    phase
  };
}

function getWeeklyShoppingList() {
  return [
    '🐟 小黄鱼 8条（仅周二到周五午餐）',
    '🍗 鸡胸肉 400g',
    '🍗 鸡腿（去皮）2个',
    '🫘 老豆腐 3块',
    '🥚 鸡蛋 14个（每天2个）',
    '🥛 无糖酸奶 5杯',
    '🍠 红薯/紫薯 3个',
    '🌽 玉米 1-2根',
    '🍞 全麦面包 1袋',
    '🥦 西兰花 2颗',
    '🥬 菠菜/小油菜 各1把',
    '🫘 豆角 1把',
    '🥒 黄瓜 2-3根',
    '🍅 番茄 3-4个',
    '🍄 菌菇（香菇+金针菇+杏鲍菇）',
    '🍎 苹果 2个 · 猕猴桃 3个',
    '🫐 蓝莓/草莓 1盒 · 圣女果 1盒'
  ];
}

function getDailyActivity(date) {
  const dow = date.getDay();
  const isWeekday = dow >= 1 && dow <= 5;
  const isSaturday = dow === 6;

  return {
    cycling: {
      label: '骑行通勤',
      detail: isWeekday ? '早晚各 10分钟 · 地铁站接驳' : '自由骑行或休息',
      icon: '🚴',
      kcal: isWeekday ? '~120 kcal' : '0',
      color: '#E3F2FD',
      active: isWeekday
    },
    walking: {
      label: '步行（地铁衔接）',
      detail: isWeekday ? '出站到公司 · 来回各 10-15分钟' : '自由',
      icon: '🚶',
      kcal: isWeekday ? '~90 kcal' : '0',
      color: '#E8F5E9',
      active: isWeekday
    },
    stairs: {
      label: '跨步爬楼',
      detail: isWeekday ? '上下班不坐电梯' : (isSaturday ? '周六 10分钟挑战' : '休息'),
      icon: '🪜',
      kcal: isWeekday ? '~50 kcal' : (isSaturday ? '~100 kcal' : '0'),
      color: '#FFF3E0',
      active: isWeekday || isSaturday
    }
  };
}
