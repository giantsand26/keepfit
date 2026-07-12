/* data.js — 12-week training plan */

// Maps day of week (0=Sun, 1=Mon, ... 6=Sat) to plan day index (1-5)
// Monday=day1, Tuesday=day2, Wednesday=day3, Thursday=day4, Friday=day5
function getPlanDay(date) {
  const dow = date.getDay(); // 0=Sun
  if (dow === 0 || dow === 6) return null; // rest day
  return dow; // 1=Mon=day1, 2=Tue=day2, ... 5=Fri=day5
}

// Plan start date — persisted to IndexedDB on first launch
let _cachedPlanStart = null;

async function getPlanStartDate() {
  if (_cachedPlanStart) return _cachedPlanStart;
  try {
    const saved = await getSetting('planStartDate', null);
    if (saved) {
      _cachedPlanStart = new Date(saved);
      return _cachedPlanStart;
    }
  } catch(e) {
    // IndexedDB unavailable — use computed date as fallback
    console.warn('IndexedDB unavailable, using computed start date:', e);
  }
  // Compute and try to save (non-critical if save fails)
  const now = new Date();
  const dow = now.getDay();
  const diff = dow === 0 ? 6 : dow - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - diff);
  monday.setHours(0, 0, 0, 0);
  _cachedPlanStart = monday;
  try { await saveSetting('planStartDate', monday.toISOString()); } catch(e) {}
  return monday;
}

async function getWeekNumber(date) {
  const startDate = await getPlanStartDate();
  const diff = date - startDate;
  const week = Math.floor(diff / (7 * 86400000)) + 1;
  return Math.max(1, Math.min(12, week));
}

function getPhase(week) {
  if (week <= 4) return 1;
  if (week <= 8) return 2;
  return 3;
}

// === Exercise definitions with metadata ===
const EXERCISES = {
  'wall-angel': {
    id: 'wall-angel', name: '靠墙天使', category: '体态纠正',
    instructions: [
      '背靠墙站立，脚后跟离墙约 15cm',
      '后脑勺、上背、臀部贴紧墙面',
      '双手举起，肘和手腕贴墙，呈「投降」姿势',
      '缓慢沿墙向上滑动手臂',
      '到最高点停顿 1 秒，再缓慢下放'
    ],
    tips: '全程保持下背贴墙。如果手臂无法贴墙，做到自己能到的最高点即可。',
    mistakes: '❌ 下背离墙 → 骨盆前倾代偿\n❌ 耸肩 → 上斜方肌帮倒忙\n❌ 手臂弯曲 → 力线不对',
    breathing: '手臂上滑时呼气，下滑时吸气。',
    why: '唤醒中下斜方肌和菱形肌，让肩胛骨重新学会「下沉后缩」。纠正肩内扣最重要的动作。'
  },
  'chest-stretch': {
    id: 'chest-stretch', name: '门框胸肌拉伸', category: '体态纠正',
    instructions: [
      '站在门框处，一侧前臂贴在门框边上',
      '手肘与肩同高，前臂竖直',
      '同侧脚向前迈一小步',
      '身体缓慢向前转动，感受胸肌和肩前侧的拉伸',
      '如果肩关节痛立刻停止'
    ],
    tips: '拉伸时保持肩胛骨微微后缩。呼气时可以加深拉伸。',
    mistakes: '❌ 手肘太高或太低\n❌ 身体转太快',
    breathing: '深呼吸，呼气时加深拉伸。',
    why: '胸小肌紧张是肩部内扣的主因。长期伏案让胸肌缩短，把肩膀往前拽。'
  },
  'ytw': {
    id: 'ytw', name: '俯卧 Y-T-W 字', category: '体态纠正',
    instructions: [
      '俯卧，额头下垫毛巾，保持颈椎中立',
      '双臂伸直举过头顶呈 Y 字形，拇指朝上',
      '抬起双臂 5-8cm，肩胛骨收紧即可',
      '缓慢下放，换 T 字形（双臂水平打开）',
      '再换 W 字形（屈肘，手背朝上）'
    ],
    tips: '重点是肩胛骨运动，不是手臂抬多高。下巴微收，眼望地面。',
    mistakes: '❌ 头后仰 → 颈椎压力\n❌ 手臂抬太高 → 腰部代偿\n❌ 耸肩',
    breathing: '抬起时呼气，下放时吸气。',
    why: '肩胛骨在 Y（上举）、T（水平）、W（后缩下沉）三个方向的独立控制。'
  },
  'dead-bug': {
    id: 'dead-bug', name: '死虫式', category: '核心',
    instructions: [
      '仰卧，双臂伸直指向天花板，双腿屈膝 90°',
      '下背紧贴地面——手可塞到腰下感受',
      '缓慢将对侧手和腿向地面下放（右手+左腿）',
      '下放到手脚离地 5cm 时暂停 1 秒',
      '缓慢收回，换另一侧'
    ],
    tips: '骨盆前倾的人第一要务是「腰不离开地面」。手脚下放幅度不重要——腰贴地比手脚放得远重要 10 倍。',
    mistakes: '❌ 下背离地 → 腹肌没发力\n❌ 动作太快 → 用惯性\n❌ 憋气 → 腹横肌无法收缩',
    breathing: '手脚下放时吸气，收回时呼气。',
    why: '教会核心在四肢运动时保持骨盆稳定。骨盆前倾人群重新激活腹横肌的最佳动作。'
  },
  'glute-bridge': {
    id: 'glute-bridge', name: '臀桥', category: '下肢',
    instructions: [
      '仰卧屈膝，双脚与髋同宽，脚掌踩实',
      '收紧腹部 → 夹紧臀部 → 将骨盆向上推',
      '推到身体从肩到膝呈一条直线',
      '顶峰夹臀停顿 2 秒',
      '缓慢下放，臀部轻触地面后立刻再起'
    ],
    tips: '骨盆前倾的人启动顺序：①先收腹（腹部收紧，骨盆微微后倾）→ ②再夹臀上推。不能用腰推。',
    mistakes: '❌ 腰推而非臀推\n❌ 下巴上扬\n❌ 下放太快',
    breathing: '上推时呼气，下放时吸气。',
    why: '纠正骨盆前倾的基石动作。臀肌学会发力 → 髋屈肌自然松解 → 骨盆回中立位。'
  },
  'squat': {
    id: 'squat', name: '自重深蹲', category: '下肢',
    instructions: [
      '双脚与肩同宽，脚尖微微朝外',
      '启动前先收紧腹部 + 骨盆微微后倾',
      '像坐椅子一样臀部向后向下坐',
      '下蹲到大腿与地面平行或稍高',
      '脚跟蹬地站起，臀肌在顶部夹紧'
    ],
    tips: '骨盆前倾的人下蹲时最易腰椎反弓。纠正：下蹲前先收紧腹部，全程保持。蹲不下去就浅蹲。',
    mistakes: '❌ 腰椎反弓\n❌ 膝盖内扣\n❌ 脚跟离地',
    breathing: '下蹲时吸气，站起时呼气。',
    why: '全身最大肌群的复合动作，代谢提升和骨骼密度不可替代。'
  },
  'bird-dog': {
    id: 'bird-dog', name: '鸟狗式', category: '核心',
    instructions: [
      '四足跪姿，手在肩下，膝在髋下',
      '收紧腹部，骨盆保持中立',
      '缓慢将对侧手和腿向两端延伸',
      '腿只抬到与身体同高，脚尖不超过臀部',
      '停顿 2 秒，缓慢收回，换另一侧'
    ],
    tips: '侧面放镜子检查——骨盆不能翻。腿抬 10cm 但骨盆不动 > 腿抬 30cm 但骨盆翻了。',
    mistakes: '❌ 骨盆翻转\n❌ 伸腿太高 → 腰椎反弓\n❌ 脖子后仰',
    breathing: '延伸时呼气，收回时吸气。',
    why: '训练躯干在四肢运动时保持稳定——所有日常动作的基础模式。'
  },
  'plank': {
    id: 'plank', name: '平板支撑', category: '核心',
    instructions: [
      '前臂撑地，肘在肩正下方',
      '双腿伸直，脚尖着地',
      '收紧腹部 → 夹臀 → 骨盆微微后倾',
      '下巴微收，眼睛看地面',
      '保持腹式呼吸，不憋气'
    ],
    tips: '骨盆前倾的人最忌塌腰。宁可只做 15 秒标准版，不做 30 秒塌腰版。侧面放手机录像检查。',
    mistakes: '❌ 塌腰 → 最需避免\n❌ 屁股翘太高\n❌ 头后仰',
    breathing: '保持腹式呼吸，呼和吸各 3-4 秒。',
    why: '核心抗伸展耐力训练，练的是深层稳定肌群而非六块腹肌。'
  },
  'hip-flexor-stretch': {
    id: 'hip-flexor-stretch', name: '髋屈肌拉伸', category: '活动度',
    instructions: [
      '单膝跪地，后腿膝盖下垫毛巾',
      '前腿屈膝 90°，双手放在前腿膝盖上',
      '收紧腹部 + 夹臀（后腿侧的臀）',
      '骨盆微微后倾——感受大腿前侧根部的拉伸',
      '保持 30-45 秒，深呼吸'
    ],
    tips: '骨盆前倾最重要的拉伸。拉伸感应在大腿前侧根部而非下背。腰酸说明骨盆没有后倾到位。',
    mistakes: '❌ 骨盆前倾位拉伸 → 拉伸的是腰\n❌ 身体前倾 → 逃避拉伸',
    breathing: '深呼吸，呼气时加深拉伸。',
    why: '髂腰肌过紧是骨盆前倾的核心原因。久坐 8 小时 = 髂腰肌持续缩短 8 小时。'
  },
  'pelvic-clock': {
    id: 'pelvic-clock', name: '骨盆时钟', category: '活动度',
    instructions: [
      '仰卧屈膝，双脚踩地',
      '想象骨盆是钟面——肚脐 12 点，耻骨 6 点',
      '缓慢将骨盆向前倾（12 点方向，腰离地）',
      '再缓慢向后倾（6 点方向，腰贴地）',
      '找到中立位——停留 10 秒'
    ],
    tips: '不是力量训练，是「感觉训练」。做 2 周后应能闭眼感知骨盆位置。',
    mistakes: '❌ 动作太快 → 变成晃动\n❌ 用腿推而非骨盆动',
    breathing: '前倾时吸气，后倾时呼气。',
    why: '骨盆前倾的人缺乏骨盆空间感知。建立感知是所有纠正训练的前提。'
  },
  'prone-raise': {
    id: 'prone-raise', name: '俯卧两头起（超人式）', category: '背部',
    instructions: [
      '俯卧，双臂前伸，双腿伸直',
      '同时抬起手臂、胸和双腿，离地 5-10cm',
      '顶峰停顿 1-2 秒',
      '缓慢下放'
    ],
    tips: '不是越高越好。重点是肩胛后缩 + 臀肌收紧。脖子保持中立，眼看地面。',
    mistakes: '❌ 头后仰\n❌ 抬太高 → 腰部压力\n❌ 憋气',
    breathing: '抬起时呼气，下放时吸气。',
    why: '强化整个后侧链——竖脊肌、臀肌、中下斜方肌。'
  },
  'shoulder-ext-rot': {
    id: 'shoulder-ext-rot', name: '肩外旋（毛巾抗阻）', category: '体态纠正',
    instructions: [
      '站姿，上臂贴紧身体，肘屈 90°',
      '双手握住毛巾两端，与肩同宽',
      '一侧手向外旋（手背向外打开）',
      '另一侧手提供轻微阻力',
      '缓慢收回，换侧'
    ],
    tips: '上臂全程贴紧身体不离开。动作幅度小——关键是肩袖肌群的激活感。',
    mistakes: '❌ 上臂离开身体\n❌ 动作太快\n❌ 耸肩',
    breathing: '外旋时呼气，收回时吸气。',
    why: '强化冈下肌和小圆肌——肩关节的「安全带」。'
  },
  'incline-pushup': {
    id: 'incline-pushup', name: '上斜俯卧撑', category: '上肢',
    instructions: [
      '双手撑在桌子或椅子边缘，与肩同宽',
      '身体呈一条直线，核心收紧',
      '缓慢下降，肘与身体呈 45°',
      '胸轻触桌面后推起',
      '推起时肩胛骨微微前引'
    ],
    tips: '比标准俯卧撑安全——肩胛骨可自由后缩，胸肌在较长位置工作。为真正俯卧撑铺路。',
    mistakes: '❌ 塌腰 → 核心没收紧\n❌ 肘打太开 → 肩膀压力\n❌ 头前伸',
    breathing: '下降时吸气，推起时呼气。',
    why: '体态纠正不等于不练胸。在「不缩短的位置」让胸肌学会发力。'
  },
  'cat-cow': {
    id: 'cat-cow', name: '猫牛式', category: '活动度',
    instructions: [
      '四足跪姿，手在肩下，膝在髋下',
      '吸气：骨盆前倾，胸椎伸展，头微抬（牛式）',
      '呼气：骨盆后倾，脊柱逐节拱起，下巴收（猫式）',
      '缓慢交替，感受脊柱逐节运动'
    ],
    tips: '不是手臂和腿在动——是脊柱在逐节运动。想象脊椎像一串珠子一颗一颗滚动。',
    mistakes: '❌ 只动腰不动胸椎\n❌ 动作太快\n❌ 手臂超伸',
    breathing: '牛式吸气，猫式呼气。',
    why: '脊柱活动和胸椎灵活性。肩部问题往往和胸椎僵硬相关。'
  },
  'kneeling-rotation': {
    id: 'kneeling-rotation', name: '四足胸椎旋转', category: '活动度',
    instructions: [
      '四足跪姿，一只手放在耳侧',
      '缓慢将肘向天花板方向旋转打开',
      '眼睛跟随肘部向上看',
      '到最大幅度停顿 2 秒',
      '缓慢回到起始位'
    ],
    tips: '旋转来自胸椎而非腰椎。骨盆保持不动——这是胸椎旋转训练，不是腰旋转。',
    mistakes: '❌ 骨盆跟着转\n❌ 强行转到痛\n❌ 头不跟着转',
    breathing: '旋转时呼气，回到时吸气。',
    why: '恢复胸椎旋转能力。胸椎僵 → 腰椎代偿旋转 → 下背痛。'
  },
  'side-plank': {
    id: 'side-plank', name: '侧平板支撑', category: '核心',
    instructions: [
      '侧卧，前臂撑地，肘在肩正下方',
      '双腿伸直叠放，身体呈一条直线',
      '髋部离地，核心收紧',
      '保持 15-30 秒',
      '换另一侧'
    ],
    tips: '髋部不能往下掉也不能往上翘。身体从侧面看是一条直线。降阶版：下方膝盖着地。',
    mistakes: '❌ 髋部下坠\n❌ 头侧歪\n❌ 憋气',
    breathing: '保持腹式呼吸。',
    why: '侧向核心稳定性——日常最少练但最重要的方向。'
  },
  'single-leg-bridge': {
    id: 'single-leg-bridge', name: '单腿臀桥', category: '下肢',
    instructions: [
      '仰卧，一侧腿屈膝踩地，另一侧腿抬起伸直',
      '收紧腹部 → 夹臀上推',
      '推到大腿与身体呈直线',
      '顶峰停顿 2 秒，缓慢下放',
      '完成一侧再换另一侧'
    ],
    tips: '骨盆不能歪——髋部两侧保持水平。如果骨盆倾斜了，幅度减小。',
    mistakes: '❌ 骨盆倾斜\n❌ 用腰推\n❌ 支撑腿膝盖内扣',
    breathing: '上推时呼气，下放时吸气。',
    why: '单侧训练——暴露和纠正左右臀肌不平衡。'
  },
  'bulgarian-split-squat': {
    id: 'bulgarian-split-squat', name: '保加利亚分腿蹲', category: '下肢',
    instructions: [
      '后脚搭在椅子或沙发边缘，前脚向前跨一步',
      '躯干直立，核心收紧',
      '缓慢下蹲，前腿膝盖不超过脚尖',
      '蹲到前大腿与地面平行',
      '前脚跟蹬地站起'
    ],
    tips: '重心在前脚脚跟。后腿只负责平衡，不负重。初次做可扶着墙。',
    mistakes: '❌ 前膝超过脚尖\n❌ 躯干前倾\n❌ 后腿发力',
    breathing: '下蹲时吸气，站起时呼气。',
    why: '单侧训练之王——矫正左右不平衡，同时练臀腿和核心稳定。'
  },
  'squat-jump': {
    id: 'squat-jump', name: '深蹲跳', category: '下肢',
    instructions: [
      '从深蹲位开始，核心收紧',
      '爆发向上跳起，手臂自然上摆',
      '落地时膝盖微弯缓冲',
      '落地后直接进入下一个深蹲',
      '连续完成，不求跳得高、求落地稳'
    ],
    tips: '落地要软——膝盖微弯、脚掌全踩实。45 岁需要维持骨骼密度，跳跃是最有效的刺激。',
    mistakes: '❌ 落地膝盖内扣\n❌ 落地腿伸直 → 膝盖冲击\n❌ 跳太高 → 落地失控',
    breathing: '跳起时呼气，落地时吸气。',
    why: '维持骨骼密度 + 提升爆发力。8 次足够，关键是每次落地质量。'
  },
  'mountain-climber': {
    id: 'mountain-climber', name: '登山者', category: '全身',
    instructions: [
      '俯卧撑起始位，核心收紧',
      '快速交替将膝盖拉向胸口',
      '保持躯干稳定，不上下晃动',
      '节奏由慢到快',
      '持续 30 秒'
    ],
    tips: '核心收紧是第一位——躯干不能上下弹跳。速度和幅度其次。',
    mistakes: '❌ 屁股上下弹跳\n❌ 核心松 → 腰塌\n❌ 憋气',
    breathing: '保持节奏呼吸，不憋气。',
    why: '核心抗伸展 + 心肺。代谢训练的高效动作。'
  },
  'jumping-jack': {
    id: 'jumping-jack', name: '开合跳', category: '全身',
    instructions: [
      '站姿，双脚并拢，双手放在体侧',
      '跳起，双脚打开与肩同宽，双手举过头顶',
      '落地后立刻跳回起始位',
      '保持节奏',
      '连续完成规定次数'
    ],
    tips: '落地膝盖微弯。核心微收，不塌腰。',
    mistakes: '❌ 腿伸直落地\n❌ 手臂无力\n❌ 节奏中断',
    breathing: '打开时呼气，合拢时吸气。',
    why: '最基础的心肺动作，零门槛。'
  },
  'burpee': {
    id: 'burpee', name: '波比跳（无俯卧撑版）', category: '全身',
    instructions: [
      '站姿，双脚与肩同宽',
      '下蹲，双手放在地面',
      '双脚向后跳至俯卧撑位',
      '双脚向前跳回蹲位',
      '站起（不加跳跃），直接进入下一个'
    ],
    tips: '无俯卧撑版——初学者友好。核心全程收紧。站起时不用跳，站起来就行。',
    mistakes: '❌ 塌腰 → 脚向后跳时核心松了\n❌ 脚落地太重\n❌ 节奏太快失控',
    breathing: '下蹲时吸气，站起时呼气。',
    why: '代谢之王。5 个高质量波比跳 > 20 个晃来晃去的波比跳。'
  },
  'v-up': {
    id: 'v-up', name: 'V 字举腿（屈膝版）', category: '核心',
    instructions: [
      '坐姿，双手撑在臀部后方，躯干微后倾',
      '双腿屈膝并拢抬起，膝盖靠近胸口',
      '缓慢向前伸直腿（不完全伸直，保持微弯）',
      '再收回膝盖靠近胸口',
      '全程核心收紧，不塌腰'
    ],
    tips: '屈膝版降低难度——重点是下腹发力感。如果腰酸，腿不要伸太远。',
    mistakes: '❌ 腰塌 → 下腹没发力\n❌ 腿伸太直 → 腰代偿\n❌ 憋气',
    breathing: '伸腿时吸气，收腿时呼气。',
    why: '下腹部训练。很多人练腹只做卷腹——下腹和腹横肌才是稳定骨盆的关键。'
  },
  'downward-dog': {
    id: 'downward-dog', name: '下犬式', category: '活动度',
    instructions: [
      '从四足位开始，手在肩前',
      '脚趾踩地，臀部向上向后推',
      '腿尽量伸直，脚跟向地面方向沉',
      '头和颈部放松，眼看膝盖方向',
      '保持 30 秒，深呼吸'
    ],
    tips: '脚跟不一定非要踩到地面。重点是脊柱拉长——从手到臀一条斜线。',
    mistakes: '❌ 背弓 → 膝盖微弯让脊柱先拉长\n❌ 头紧张\n❌ 手离身体太近',
    breathing: '保持深长呼吸。',
    why: '全身后侧链拉伸 + 肩胛骨上回旋。是猫牛式的最佳搭档。'
  }
};

// === 12-Week Plan Data ===
function getDayPlan(week, day) {
  const phase = getPhase(week);
  const dayNames = ['', '周一：体态纠正', '周二：下肢+核心', '周三：背部主导', '周四：全身循环', '周五：活动度+核心'];

  // Base exercises for each day across phases
  const plans = {
    1: { // Monday - Posture
      theme: '体态纠正日',
      exercises: [
        { exId: 'wall-angel', sets: 3, reps: '10次', restSeconds: 30 },
        { exId: 'chest-stretch', sets: 2, reps: '每侧30秒', restSeconds: 0 },
        { exId: 'ytw', sets: 3, reps: '每字母5次', restSeconds: 30 },
        { exId: 'dead-bug', sets: 3, reps: '每侧10次', restSeconds: 30 },
        { exId: 'hip-flexor-stretch', sets: 2, reps: '每侧45秒', restSeconds: 0 }
      ]
    },
    2: { // Tuesday - Lower body + core
      theme: '下肢+核心日',
      exercises: [
        { exId: 'glute-bridge', sets: 4, reps: '20次', restSeconds: 30 },
        { exId: 'squat', sets: 3, reps: '10次', restSeconds: 30 },
        { exId: 'bird-dog', sets: 2, reps: '每侧8次', restSeconds: 30 },
        { exId: 'plank', sets: 3, reps: '20-30秒', restSeconds: 30 }
      ]
    },
    3: { // Wednesday - Back
      theme: '背部主导日',
      exercises: [
        { exId: 'prone-raise', sets: 3, reps: '10次', restSeconds: 30 },
        { exId: 'shoulder-ext-rot', sets: 3, reps: '每侧12次', restSeconds: 0 },
        { exId: 'bird-dog', sets: 2, reps: '每侧8次', restSeconds: 30 },
        { exId: 'cat-cow', sets: 2, reps: '8次', restSeconds: 0 }
      ]
    },
    4: { // Thursday - Full body circuit
      theme: '全身循环日',
      isCircuit: true,
      rounds: 2,
      roundRest: 60,
      exercises: [
        { exId: 'squat', reps: '10次' },
        { exId: 'wall-angel', reps: '8次' },
        { exId: 'glute-bridge', reps: '12次' },
        { exId: 'dead-bug', reps: '每侧6次' }
      ]
    },
    5: { // Friday - Mobility + core
      theme: '活动度+核心日',
      exercises: [
        { exId: 'pelvic-clock', sets: 2, reps: '前后各5次', restSeconds: 0 },
        { exId: 'cat-cow', sets: 2, reps: '10次', restSeconds: 0 },
        { exId: 'kneeling-rotation', sets: 2, reps: '每侧8次', restSeconds: 0 },
        { exId: 'plank', sets: 3, reps: '20-30秒', restSeconds: 30 },
        { exId: 'side-plank', sets: 2, reps: '每侧15秒', restSeconds: 30 }
      ]
    }
  };

  const base = plans[day];
  if (!base) return null;

  // Phase-specific modifications
  if (phase === 2) {
    return getPhase2Plan(base, day);
  } else if (phase === 3) {
    return getPhase3Plan(base, day);
  }
  return base;
}

function getPhase2Plan(base, day) {
  const modified = JSON.parse(JSON.stringify(base));

  if (day === 1) {
    // Add incline pushup
    modified.exercises.splice(3, 0, { exId: 'incline-pushup', sets: 3, reps: '8-10次', restSeconds: 30 });
    // Increase wall angel
    modified.exercises[0].reps = '12次';
    modified.exercises[0].restSeconds = 20;
    // Increase dead bug
    modified.exercises[4].reps = '每侧12次';
  } else if (day === 2) {
    modified.exercises[0] = { exId: 'single-leg-bridge', sets: 3, reps: '每侧10次', restSeconds: 30 };
    modified.exercises[1].reps = '12次';
    modified.exercises[3].reps = '30-40秒';
  } else if (day === 3) {
    modified.exercises[0].reps = '12次';
    modified.exercises[1].reps = '每侧15次';
    modified.exercises[2].reps = '每侧10次（停顿3秒）';
  } else if (day === 4) {
    modified.rounds = 3;
    modified.roundRest = 45;
  } else if (day === 5) {
    modified.exercises[3].reps = '30-40秒';
    modified.exercises[4].reps = '每侧20秒';
  }

  modified.theme = base.theme + '（强化）';
  return modified;
}

function getPhase3Plan(base, day) {
  const modified = JSON.parse(JSON.stringify(base));

  if (day === 1) {
    modified.exercises[0] = { exId: 'wall-angel', sets: 3, reps: '15次（极度慢速）', restSeconds: 20 };
    modified.exercises[2] = { exId: 'ytw', sets: 3, reps: '每字母10次', restSeconds: 20 };
    modified.exercises.splice(3, 0, { exId: 'incline-pushup', sets: 3, reps: '8-10次', restSeconds: 45 });
    modified.exercises[4].reps = '每侧12次';
    modified.exercises[5].reps = '每侧60秒';
    modified.theme = '上肢力量+体态';
  } else if (day === 2) {
    modified.exercises[0] = { exId: 'squat-jump', sets: 3, reps: '8次', restSeconds: 45 };
    modified.exercises[1] = { exId: 'bulgarian-split-squat', sets: 3, reps: '每侧10次', restSeconds: 30 };
    modified.exercises[2] = { exId: 'single-leg-bridge', sets: 2, reps: '每侧12次（停顿2秒）', restSeconds: 30 };
    modified.exercises[3] = { exId: 'side-plank', sets: 2, reps: '每侧20秒', restSeconds: 30 };
    modified.theme = '下肢爆发力';
  } else if (day === 3) {
    modified.exercises[0] = { exId: 'prone-raise', sets: 3, reps: '12次', restSeconds: 20 };
    modified.exercises[1] = { exId: 'shoulder-ext-rot', sets: 3, reps: '每侧15次', restSeconds: 0 };
    modified.exercises.splice(2, 0, { exId: 'v-up', sets: 2, reps: '10次', restSeconds: 30 });
    modified.exercises.splice(3, 0, { exId: 'plank', sets: 3, reps: '40秒', restSeconds: 30 });
    modified.theme = '背部+核心组合';
  } else if (day === 4) {
    modified.isCircuit = false;
    modified.isAMRAP = true;
    modified.durationMin = 10;
    modified.exercises = [
      { exId: 'burpee', reps: '5次' },
      { exId: 'squat', reps: '10次' },
      { exId: 'mountain-climber', reps: '20次' },
      { exId: 'incline-pushup', reps: '5次' },
      { exId: 'jumping-jack', reps: '20次' }
    ];
    modified.theme = 'AMRAP 代谢日';
  } else if (day === 5) {
    modified.exercises = [
      { exId: 'cat-cow', sets: 1, reps: '3分钟流动', restSeconds: 0 },
      { exId: 'downward-dog', sets: 1, reps: '30秒×3次', restSeconds: 0 },
      { exId: 'kneeling-rotation', sets: 2, reps: '每侧8次', restSeconds: 0 },
      { exId: 'pelvic-clock', sets: 1, reps: '前后各5次', restSeconds: 0 }
    ];
    modified.theme = '流动训练+恢复';
  }

  return modified;
}
