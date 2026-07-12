# 🏋️ KeepFit · 12 周居家训练计划

面向长期伏案工作者的 12 周居家训练 PWA 应用。针对**骨盆前倾、核心薄弱、肩部内扣**的体态问题，提供每日训练指导、饮食建议、活动追踪和教练反馈闭环。

## ✨ 功能

| 模块 | 功能 |
|------|------|
| 🏋️ **今日训练** | 自动匹配星期，展示当天动作 + SVG 关节小人插图 |
| ⏱️ **组间计时** | 内置休息倒计时，结束自动震动提醒 |
| 📅 **周计划** | 12 周训练总览，三阶段递进（激活→强化→整合） |
| 🍽️ **饮食建议** | 每日三餐模板 + 食堂选餐策略 + 咖啡/饮水/睡眠追踪 |
| 📊 **进度追踪** | 每周反馈摘要一键复制，发给教练获取调整方案 |
| 📱 **PWA** | 可安装到手机主屏幕，完全离线可用 |

## 🎯 适用人群

- 长期伏案工作者
- 骨盆前倾 / 肩部内扣 / 核心力量薄弱
- 新手健身，无器械居家训练
- 每天 10 分钟，每周 5 天

## 🏗️ 技术栈

| 技术 | 用途 |
|------|------|
| HTML5 + CSS3 + Vanilla JS | 零依赖，纯前端 |
| IndexedDB | 本地数据持久化 |
| Service Worker | 离线缓存 |
| PWA Manifest | 可安装到主屏幕 |
| SVG 内联生成 | 关节小人动作插图 |
| GitHub Pages | 部署 |

## 📦 本地运行

```bash
# 克隆仓库
git clone https://github.com/giantsand26/keepfit.git
cd keepfit

# 启动本地服务器（二选一）
npx serve -s .
# 或
python3 -m http.server 3456

# 浏览器打开 http://localhost:3456
```

## 📱 安装到手机

1. iPhone：Safari 打开 → 分享按钮 → 添加到主屏幕
2. Android：Chrome 打开 → 菜单 → 添加到主屏幕

## 📁 项目结构

```
keepfit/
├── index.html              # 应用入口
├── manifest.json           # PWA 配置
├── sw.js                   # Service Worker 离线缓存
├── .gitignore
├── LICENSE                 # MIT
├── README.md
├── css/
│   └── style.css           # Notion 极简风格
├── js/
│   ├── app.js              # 主应用逻辑（829 行）
│   ├── data.js             # 12 周 × 3 阶段训练数据
│   ├── nutrition.js        # 饮食模板 + 营养建议
│   ├── illustrations.js    # SVG 关节小人插图生成
│   ├── storage.js          # IndexedDB 封装
│   └── timer.js            # 组间休息计时器
├── icons/
│   └── icon-192.svg        # PWA 图标
└── preview.html            # 静态设计预览
```

## 🔄 训练三阶段

| 阶段 | 周次 | 重点 |
|------|------|------|
| 激活期 | 1-4 周 | 骨盆复位 + 核心激活 + 肩部纠正 |
| 强化期 | 5-8 周 | 力量进阶 + HIIT 代谢训练 |
| 整合期 | 9-12 周 | AMRAP 爆发 + 全身整合 |

## 🔒 隐私

所有数据存储在设备本地（IndexedDB），不上传到任何服务器。纯前端，无后端，无追踪。

## 📄 许可

MIT License
