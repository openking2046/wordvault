/* eslint-disable react-hooks/exhaustive-deps */ // v3.9-noimport
/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback, useRef } from "react";
import LOGO_VIDEO from './WordCombo Logo 动画.mp4';
import COMBO_CAT from './combo-cat.webp';
import COMBO_CAT_HEAD from './combo-cat-head.webp';
import CAT_CLAW from './cat-claw.webp';
import COMBO_CAT_FIGHTING from './Combo-cat-fighting.webp';
import COMBOCAT_1 from './combocat-1.webp';
import COMBOCAT_2 from './combocat-2.webp';
import COMBOCAT_3 from './combocat-3.webp';
import COMBOCAT_4 from './combotcat-4.webp';
import COMBOCAT_5 from './combotcat-5.webp';
import COMBOCAT_6 from './combotcat-6.webp';
import COMBOCAT_7 from './combotcat-7.webp';
import COMBOCAT_8 from './combotcat-8.webp';
import COMBOCAT_9 from './combotcat-9.webp';
// SVG stat icons — add files to src/ then uncomment imports below:
import MAX_WORDS_PNG from './max-words.webp';
import CORRECT_RATE_PNG from './correct-rate.webp';
import MAX_COMBO_PNG from './max-combo.webp';
import MAX_XP_PNG from './max-xp.webp';

const SAMPLE_WORDS = [
  { id: 1, word: "Serendipity", meaning: "意外发现美好事物的运气", example: "Finding that book was pure serendipity.", mastery: 0, tags: ["生活"] },
  { id: 2, word: "Ephemeral", meaning: "短暂的，转瞬即逝的", example: "Fame can be ephemeral.", mastery: 0, tags: ["形容词"] },
  { id: 3, word: "Resilient", meaning: "有弹性的，能快速恢复的", example: "She is remarkably resilient.", mastery: 0, tags: ["形容词"] },
  { id: 4, word: "Eloquent", meaning: "口才流利的，雄辩的", example: "He gave an eloquent speech.", mastery: 0, tags: ["形容词"] },
  { id: 5, word: "Ambiguous", meaning: "模棱两可的，含糊不清的", example: "The instructions were ambiguous.", mastery: 0, tags: ["形容词"] },
];

const DEFAULT_TAGS = ["形容词", "名词", "动词", "生活", "商务", "学术", "口语", "写作"];
const AVATARS = (() => {
  // Sprite sheet: avatars.png — 10 cols × 3 rows, display size 64×64
  const positions = [
    [0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[9,0],
    [0,1],[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[7,1],[8,1],[9,1],
    [0,2],[1,2],[2,2],[3,2],[4,2],[5,2],[6,2],[7,2],[8,2],[9,2],
  ];
  return positions.map(([c, r], i) => ({
    id: i,
    x: -c * 64,
    y: -r * 81,
  }));
})();

// ── Task Definitions ──────────────────────────────────────────
// type: "daily" resets each day | "achievement" one-time unlock
// progress(ctx) returns current value; target is goal value
const TASKS = [
  // ── 每日任务 ──
  {
    id: "daily_quiz_5", type: "daily", icon: "🎯",
    title: "答题热身", desc: "今日答对 5 题",
    target: 5, xp: 20,
    progress: ctx => ctx.todayCorrect,
  },
  {
    id: "daily_quiz_20", type: "daily", icon: "🔥",
    title: "题海冲浪", desc: "今日答对 20 题",
    target: 20, xp: 50,
    progress: ctx => ctx.todayCorrect,
  },
  {
    id: "daily_add_1", type: "daily", icon: "➕",
    title: "收录新词", desc: "今日添加 1 个单词",
    target: 1, xp: 15,
    progress: ctx => ctx.todayWords,
  },
  {
    id: "daily_add_3", type: "daily", icon: "📚",
    title: "词汇扩充", desc: "今日添加 3 个单词",
    target: 3, xp: 40,
    progress: ctx => ctx.todayWords,
  },
  {
    id: "daily_streak", type: "daily", icon: "📅",
    title: "坚持打卡", desc: "保持连续学习不断签",
    target: 1, xp: 30,
    progress: ctx => ctx.streakToday ? 1 : 0,
  },
  {
    id: "daily_battle", type: "daily", icon: "⚡",
    title: "今日对战", desc: "完成一局限时对战",
    target: 1, xp: 35,
    progress: ctx => ctx.todayBattle,
  },
  // ── 成就任务（一次性）──
  {
    id: "ach_words_10", type: "achievement", icon: "🌱",
    title: "初出茅庐", desc: "词库收录 10 个单词",
    target: 10, xp: 50,
    progress: ctx => ctx.totalWords,
  },
  {
    id: "ach_words_30", type: "achievement", icon: "🌿",
    title: "词汇猎人", desc: "词库收录 30 个单词",
    target: 30, xp: 100,
    progress: ctx => ctx.totalWords,
  },
  {
    id: "ach_words_100", type: "achievement", icon: "🌳",
    title: "百词大师", desc: "词库收录 100 个单词",
    target: 100, xp: 300,
    progress: ctx => ctx.totalWords,
  },
  {
    id: "ach_correct_50", type: "achievement", icon: "🎖️",
    title: "答题达人", desc: "累计答对 50 题",
    target: 50, xp: 80,
    progress: ctx => ctx.totalCorrect,
  },
  {
    id: "ach_correct_200", type: "achievement", icon: "🏅",
    title: "刷题狂魔", desc: "累计答对 200 题",
    target: 200, xp: 200,
    progress: ctx => ctx.totalCorrect,
  },
  {
    id: "ach_streak_7", type: "achievement", icon: "🔥",
    title: "一周无间", desc: "连续学习 7 天",
    target: 7, xp: 150,
    progress: ctx => ctx.streakCount,
  },
  {
    id: "ach_streak_30", type: "achievement", icon: "💎",
    title: "月度传说", desc: "连续学习 30 天",
    target: 30, xp: 500,
    progress: ctx => ctx.streakCount,
  },
  {
    id: "ach_mastery_5", type: "achievement", icon: "⭐",
    title: "精通初探", desc: "精通 5 个单词（掌握度满级）",
    target: 5, xp: 100,
    progress: ctx => ctx.masteredWords,
  },
  {
    id: "ach_mastery_20", type: "achievement", icon: "🌟",
    title: "词汇宗师", desc: "精通 20 个单词",
    target: 20, xp: 250,
    progress: ctx => ctx.masteredWords,
  },
];
const NAV_SVGS = {
  wordlib: `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
  <!-- Shadow -->
  <rect x="4" y="7" width="32" height="30" rx="9" fill="#c05000"/>
  <!-- Main face -->
  <rect x="4" y="4" width="32" height="30" rx="9" fill="#FF8000"/>
  <!-- Top highlight -->
  <rect x="8" y="6" width="24" height="9" rx="5" fill="rgba(255,255,255,0.28)"/>
  <!-- Book left page -->
  <rect x="10" y="13" width="9" height="12" rx="2" fill="rgba(255,255,255,0.9)"/>
  <rect x="11" y="15" width="6" height="1.5" rx="1" fill="rgba(255,128,0,0.5)"/>
  <rect x="11" y="18" width="5" height="1.5" rx="1" fill="rgba(255,128,0,0.35)"/>
  <rect x="11" y="21" width="6" height="1.5" rx="1" fill="rgba(255,128,0,0.35)"/>
  <!-- Book right page -->
  <rect x="21" y="13" width="9" height="12" rx="2" fill="rgba(255,255,255,0.75)"/>
  <rect x="22" y="15" width="6" height="1.5" rx="1" fill="rgba(255,128,0,0.4)"/>
  <rect x="22" y="18" width="5" height="1.5" rx="1" fill="rgba(255,128,0,0.3)"/>
  <!-- Spine -->
  <rect x="19" y="12" width="2" height="14" rx="1" fill="rgba(255,255,255,0.5)"/>
  <!-- Cat ear bookmark -->
  <polygon points="27,10 31,10 31,14 29,12.5" fill="#FFD700"/>
</svg>`,
  add: `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
  <!-- Shadow -->
  <rect x="4" y="7" width="32" height="30" rx="9" fill="#2a8a85"/>
  <!-- Main face -->
  <rect x="4" y="4" width="32" height="30" rx="9" fill="#45B7B8"/>
  <!-- Top highlight -->
  <rect x="8" y="6" width="24" height="9" rx="5" fill="rgba(255,255,255,0.28)"/>
  <!-- Pencil body -->
  <rect x="17" y="11" width="6" height="16" rx="2" fill="rgba(255,255,255,0.95)" transform="rotate(15,20,19)"/>
  <!-- Pencil tip -->
  <polygon points="15,25 18,28 21,25" fill="#FFD700" transform="rotate(15,18,26)"/>
  <!-- Pencil eraser top -->
  <rect x="17" y="10" width="6" height="4" rx="1.5" fill="rgba(255,180,180,0.9)" transform="rotate(15,20,12)"/>
  <!-- Plus sparkle -->
  <rect x="24" y="11" width="7" height="2.5" rx="1.2" fill="rgba(255,255,255,0.9)"/>
  <rect x="26.75" y="8.5" width="2.5" height="7" rx="1.2" fill="rgba(255,255,255,0.9)"/>
  <!-- Star dot -->
  <circle cx="12" cy="24" r="2" fill="rgba(255,255,255,0.6)"/>
</svg>`,
  progress: `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
  <!-- Shadow -->
  <rect x="4" y="7" width="32" height="30" rx="9" fill="#4a35a0"/>
  <!-- Main face -->
  <rect x="4" y="4" width="32" height="30" rx="9" fill="#7C6CF5"/>
  <!-- Top highlight -->
  <rect x="8" y="6" width="24" height="9" rx="5" fill="rgba(255,255,255,0.28)"/>
  <!-- Bar 1 (short) -->
  <rect x="10" y="22" width="5" height="8" rx="2" fill="rgba(255,255,255,0.6)"/>
  <!-- Bar 2 (medium) -->
  <rect x="18" y="18" width="5" height="12" rx="2" fill="rgba(255,255,255,0.8)"/>
  <!-- Bar 3 (tall) -->
  <rect x="26" y="13" width="5" height="17" rx="2" fill="rgba(255,255,255,0.95)"/>
  <!-- Upward arrow -->
  <polygon points="28.5,10 31,14 26,14" fill="#FFD700"/>
  <!-- Base line -->
  <rect x="9" y="30" width="23" height="2" rx="1" fill="rgba(255,255,255,0.4)"/>
</svg>`,
  settings: `<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
  <!-- Shadow -->
  <rect x="4" y="7" width="32" height="30" rx="9" fill="#666"/>
  <!-- Main face -->
  <rect x="4" y="4" width="32" height="30" rx="9" fill="#999"/>
  <!-- Top highlight -->
  <rect x="8" y="6" width="24" height="9" rx="5" fill="rgba(255,255,255,0.28)"/>
  <!-- Gear outer ring -->
  <circle cx="20" cy="19" r="9" fill="rgba(255,255,255,0.2)"/>
  <circle cx="20" cy="19" r="9" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="3" stroke-dasharray="4 2"/>
  <!-- Gear center -->
  <circle cx="20" cy="19" r="5" fill="rgba(255,255,255,0.9)"/>
  <!-- Cat ears on gear -->
  <polygon points="15,12 13,8 17,10" fill="rgba(255,255,255,0.85)"/>
  <polygon points="25,12 27,8 23,10" fill="rgba(255,255,255,0.85)"/>
  <!-- Cat face in center -->
  <circle cx="18.5" cy="18.5" r="1" fill="#888"/>
  <circle cx="21.5" cy="18.5" r="1" fill="#888"/>
  <path d="M18.5 21 Q20 22.5 21.5 21" stroke="#888" stroke-width="1" fill="none" stroke-linecap="round"/>
</svg>`,
};

const NAV = [
  { icon: "wordlib", label: "单词库" },
  { icon: "add", label: "添加" },
  { icon: "◎", label: "Combo" },
  { icon: "progress", label: "进度" },
  { icon: "settings", label: "设置" },
];

// Ebbinghaus forgetting curve intervals in days
const REVIEW_INTERVALS = [1, 2, 4, 7, 15, 30, 60];

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

function getDueWords(words) {
  const today = new Date(); today.setHours(0,0,0,0);
  return words.filter(w => {
    if (!w.nextReview) return false;
    const due = new Date(w.nextReview); due.setHours(0,0,0,0);
    return due <= today;
  });
}

function scheduleReview(word, correct) {
  const level = correct ? Math.min((word.reviewLevel || 0) + 1, REVIEW_INTERVALS.length - 1) : 0;
  const days = REVIEW_INTERVALS[level];
  const nextReview = Date.now() + days * 86400000;
  return { ...word, reviewLevel: level, nextReview, lastReviewed: Date.now() };
}

function speak(word) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(word);
  u.lang = "en-US"; u.rate = 0.85;
  window.speechSynthesis.speak(u);
}

// Weighted pick: new words & wrong words get higher probability
function weightedPick(pool, wrongBankWords) {
  const weights = pool.map(w => {
    let weight = 1;
    if (!w.nextReview) weight += 4;
    else if (w.mastery <= 1) weight += 3;
    else if (w.mastery === 2) weight += 1;
    if (wrongBankWords.includes(w.word)) weight += 5;
    return weight;
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i];
    if (r <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

function generateMCQ(words, target) {
  const distractors = shuffle(words.filter(w => w.id !== target.id)).slice(0, 3);
  const options = shuffle([target, ...distractors]);
  return { question: target.word, correct: target.meaning, options: options.map(o => o.meaning), example: target.example, correctWord: target.word, isListen: false };
}

// Spell mode: show meaning, user types the word
function generateSpellQ(words, target) {
  return { question: target.meaning, correct: target.word, example: target.example, correctWord: target.word, isSpell: true, isListen: false };
}

// Listen mode: play audio, pick the correct Chinese meaning from options
function generateListenMCQ(words, target) {
  const distractors = shuffle(words.filter(w => w.id !== target.id)).slice(0, 3);
  const options = shuffle([target, ...distractors]);
  return { question: target.word, correct: target.meaning, options: options.map(o => o.meaning), meaning: target.meaning, example: target.example, correctWord: target.word, isListen: true };
}

// ── EQUIPMENT CATALOG ──────────────────────────────────────────────
const EQUIPMENT = [
  // HATS
  { id: "cap_basic",   type: "hat",       name: "学习帽",   emoji: "🧢", xpRequired: 0,    xpCost: 0,   desc: "默认装备，免费获得",     rarity: "common"   },
  { id: "cap_star",    type: "hat",       name: "星星帽",   emoji: "⭐", xpRequired: 200,  xpCost: 150, desc: "答对200题后解锁",         rarity: "uncommon" },
  { id: "crown",       type: "hat",       name: "金色皇冠", emoji: "👑", xpRequired: 500,  xpCost: 400, desc: "词汇大师的象征",          rarity: "rare"     },
  { id: "wizard_hat",  type: "hat",       name: "魔法帽",   emoji: "🎩", xpRequired: 1000, xpCost: 800, desc: "传说级学习者专属",        rarity: "epic"     },
  // OUTFITS
  { id: "none",        type: "outfit",    name: "无装备",   emoji: "✖️", xpRequired: 0,    xpCost: 0,   desc: "裸猫",                    rarity: "common"   },
  { id: "hoodie",      type: "outfit",    name: "卫衣",     emoji: "👕", xpRequired: 100,  xpCost: 80,  desc: "舒适休闲风",              rarity: "common"   },
  { id: "school_uni",  type: "outfit",    name: "校服",     emoji: "🎒", xpRequired: 300,  xpCost: 200, desc: "认真学习的模样",          rarity: "uncommon" },
  { id: "wizard_robe", type: "outfit",    name: "魔法袍",   emoji: "🌟", xpRequired: 800,  xpCost: 600, desc: "满是星光的魔法师长袍",    rarity: "rare"     },
  { id: "armor",       type: "outfit",    name: "战甲",     emoji: "⚔️", xpRequired: 1500, xpCost: 1200,desc: "词汇战士的荣耀",          rarity: "epic"     },
  // ACCESSORIES
  { id: "book",        type: "accessory", name: "单词书",   emoji: "📚", xpRequired: 50,   xpCost: 40,  desc: "随身带着单词书",          rarity: "common"   },
  { id: "wand",        type: "accessory", name: "魔法棒",   emoji: "✨", xpRequired: 400,  xpCost: 300, desc: "点亮记忆的魔法棒",        rarity: "uncommon" },
  { id: "medal",       type: "accessory", name: "冠军奖牌", emoji: "🏅", xpRequired: 700,  xpCost: 500, desc: "连续30天打卡获得",        rarity: "rare"     },
  { id: "wings",       type: "accessory", name: "天使翅膀", emoji: "🦋", xpRequired: 2000, xpCost: 1500,desc: "达到传说段位解锁",        rarity: "legendary"},
  // FOOD & WATER (consumables)
  { id: "kibble",      type: "food",      name: "普通猫粮", emoji: "🍚", xpRequired: 0,    xpCost: 20,  desc: "恢复饥饿度+30",          rarity: "common",  hungerRestore: 30 },
  { id: "sashimi",     type: "food",      name: "三文鱼",   emoji: "🐟", xpRequired: 200,  xpCost: 60,  desc: "恢复饥饿度+70",          rarity: "uncommon",hungerRestore: 70 },
  { id: "water",       type: "drink",     name: "清水",     emoji: "💧", xpRequired: 0,    xpCost: 10,  desc: "恢复口渴度+40",          rarity: "common",  thirstRestore: 40 },
  { id: "milk",        type: "drink",     name: "猫咪牛奶", emoji: "🥛", xpRequired: 100,  xpCost: 30,  desc: "恢复口渴度+80",          rarity: "uncommon",thirstRestore: 80 },
];

const RARITY_COLORS = {
  common:    { color: "#888",    bg: "#f5f5f5",   label: "普通" },
  uncommon:  { color: "#2d8a4e", bg: "#f0faf4",   label: "优秀" },
  rare:      { color: "#2d6bcf", bg: "#eff6ff",   label: "稀有" },
  epic:      { color: "#7c3aed", bg: "#f5f3ff",   label: "史诗" },
  legendary: { color: "#FF8000", bg: "#fff8ee",   label: "传说" },
};

// Cat growth stages based on total XP
const CAT_STAGES = [
  { lv:1, minXp:0,    stage:"lv1", name:"初生雏猫", emoji:"🐣", desc:"刚睁开眼睛的小猫咪，对世界充满好奇",   color:"#aaa"    },
  { lv:2, minXp:200,  stage:"lv2", name:"蹒跚幼猫", emoji:"🐱", desc:"迈出第一步，开始探索词汇的世界",       color:"#4ade80" },
  { lv:3, minXp:500,  stage:"lv3", name:"好奇顽童", emoji:"😸", desc:"对所有单词都充满热情，精力旺盛",       color:"#45B7B8" },
  { lv:4, minXp:1000, stage:"lv4", name:"敏捷少年", emoji:"😺", desc:"身手矫健，学习速度超越同龄人",         color:"#4facfe" },
  { lv:5, minXp:2000, stage:"lv5", name:"优雅青年", emoji:"🦁", desc:"举手投足间散发着学识的光芒",           color:"#a78bfa" },
  { lv:6, minXp:3500, stage:"lv6", name:"威严领主", emoji:"👑", desc:"词汇量令人叹服，统御一方",             color:"#f59e0b" },
  { lv:7, minXp:5500, stage:"lv7", name:"幻兽觉醒", emoji:"🔥", desc:"突破次元壁，掌握语言的神秘力量",       color:"#f97316" },
  { lv:8, minXp:8000, stage:"lv8", name:"宇宙主宰", emoji:"🌟", desc:"词汇宇宙的最终掌控者，无所不知",       color:"#FF8000" },
];

function getCatStage(totalXp) {
  let stage = CAT_STAGES[0];
  for (const s of CAT_STAGES) { if (totalXp >= s.minXp) stage = s; }
  return stage;
}
function getCatLv(totalXp) { return getCatStage(totalXp).lv; }

// Rank system - 23 ranks, based on words + streak days
const RANKS = [
  // 青铜铲屎官 (3)
  { id:"b3", tier:"青铜铲屎官", name:"铲屎官 Ⅲ", color:"#a0522d", bg:"#fdf3ec", words:0,     days:0   },
  { id:"b2", tier:"青铜铲屎官", name:"铲屎官 Ⅱ", color:"#a0522d", bg:"#fdf3ec", words:34,    days:20  },
  { id:"b1", tier:"青铜铲屎官", name:"铲屎官 Ⅰ", color:"#a0522d", bg:"#fdf3ec", words:67,    days:40  },
  // 白银撸猫师 (3)
  { id:"s3", tier:"白银撸猫师", name:"撸猫师 Ⅲ", color:"#7a8fa6", bg:"#f0f4f8", words:100,   days:60  },
  { id:"s2", tier:"白银撸猫师", name:"撸猫师 Ⅱ", color:"#7a8fa6", bg:"#f0f4f8", words:234,   days:80  },
  { id:"s1", tier:"白银撸猫师", name:"撸猫师 Ⅰ", color:"#7a8fa6", bg:"#f0f4f8", words:367,   days:100 },
  // 黄金猫语者 (3)
  { id:"g3", tier:"黄金猫语者", name:"猫语者 Ⅲ", color:"#c8900a", bg:"#fffbec", words:500,   days:120 },
  { id:"g2", tier:"黄金猫语者", name:"猫语者 Ⅱ", color:"#c8900a", bg:"#fffbec", words:667,   days:150 },
  { id:"g1", tier:"黄金猫语者", name:"猫语者 Ⅰ", color:"#c8900a", bg:"#fffbec", words:834,   days:165 },
  // 铂金猫医师 (3)
  { id:"p3", tier:"铂金猫医师", name:"猫医师 Ⅲ", color:"#2a9d8f", bg:"#edfaf8", words:1000,  days:180 },
  { id:"p2", tier:"铂金猫医师", name:"猫医师 Ⅱ", color:"#2a9d8f", bg:"#edfaf8", words:2334,  days:200 },
  { id:"p1", tier:"铂金猫医师", name:"猫医师 Ⅰ", color:"#2a9d8f", bg:"#edfaf8", words:3667,  days:220 },
  // 钻石繁育专家 (5)
  { id:"d5", tier:"钻石繁育专家", name:"繁育专家 Ⅴ", color:"#1565c0", bg:"#e8f0fe", words:5000,  days:240 },
  { id:"d4", tier:"钻石繁育专家", name:"繁育专家 Ⅳ", color:"#1565c0", bg:"#e8f0fe", words:6200,  days:252 },
  { id:"d3", tier:"钻石繁育专家", name:"繁育专家 Ⅲ", color:"#1565c0", bg:"#e8f0fe", words:7400,  days:264 },
  { id:"d2", tier:"钻石繁育专家", name:"繁育专家 Ⅱ", color:"#1565c0", bg:"#e8f0fe", words:8600,  days:276 },
  { id:"d1", tier:"钻石繁育专家", name:"繁育专家 Ⅰ", color:"#1565c0", bg:"#e8f0fe", words:9800,  days:288 },
  // 星耀训猫大师 (5)
  { id:"m5", tier:"星耀训猫大师", name:"训猫大师 Ⅴ", color:"#6a1b9a", bg:"#f5eeff", words:10000, days:300 },
  { id:"m4", tier:"星耀训猫大师", name:"训猫大师 Ⅳ", color:"#6a1b9a", bg:"#f5eeff", words:12000, days:306 },
  { id:"m3", tier:"星耀训猫大师", name:"训猫大师 Ⅲ", color:"#6a1b9a", bg:"#f5eeff", words:14000, days:312 },
  { id:"m2", tier:"星耀训猫大师", name:"训猫大师 Ⅱ", color:"#6a1b9a", bg:"#f5eeff", words:16000, days:318 },
  { id:"m1", tier:"星耀训猫大师", name:"训猫大师 Ⅰ", color:"#6a1b9a", bg:"#f5eeff", words:18000, days:324 },
  // 最强王者
  { id:"king", tier:"猫之守护神", name:"猫之守护神", color:"#FF8000", bg:"#fff8ee", words:20000, days:365 },
];

function getRank(wordCount, days) {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (wordCount >= r.words && days >= r.days) rank = r;
    else break;
  }
  return rank;
}

function getNextRank(wordCount, days) {
  for (let i = 0; i < RANKS.length; i++) {
    if (wordCount < RANKS[i].words || days < RANKS[i].days) return RANKS[i];
  }
  return null;
}

const FREE_LIMIT = 36;

export default function VocabApp() {
  const [tab, setTab] = useState(0);
  const [words, setWords] = useState(() => { try { const s = localStorage.getItem("wv_words"); return s ? JSON.parse(s) : SAMPLE_WORDS; } catch { return SAMPLE_WORDS; } });
  const [score, setScore] = useState(() => { try { const s = localStorage.getItem("wv_score"); return s ? JSON.parse(s) : { correct: 0, total: 0 }; } catch { return { correct: 0, total: 0 }; } });
  const [globalCombo, setGlobalCombo] = useState(0);
  const [globalMaxCombo, setGlobalMaxCombo] = useState(() => { try { return parseInt(localStorage.getItem("wv_max_combo") || "0"); } catch { return 0; } });
  const [totalComboSum, setTotalComboSum] = useState(() => { try { return parseInt(localStorage.getItem("wv_total_combo_sum") || "0"); } catch { return 0; } });
  // ── 猫咪养成 ──
  const [catName, setCatName] = useState(() => { try { return localStorage.getItem("wv_cat_name") || "Combo"; } catch { return "Combo"; } });
  const [catLevel, setCatLevel] = useState(() => { try { return parseInt(localStorage.getItem("wv_cat_level") || "1"); } catch { return 1; } });
  const [catHunger, setCatHunger] = useState(() => { try { return parseInt(localStorage.getItem("wv_cat_hunger") || "80"); } catch { return 80; } });
  const [catMood, setCatMood] = useState(() => { try { return parseInt(localStorage.getItem("wv_cat_mood") || "80"); } catch { return 80; } });
  const [catFeedsToday, setCatFeedsToday] = useState(() => {
    try {
      const d = JSON.parse(localStorage.getItem("wv_cat_feeds") || "{}");
      const today = new Date().toISOString().slice(0,10);
      return d.date === today ? d.count : 0;
    } catch { return 0; }
  });
  const [editingCatName, setEditingCatName] = useState(false);
  const [catBreed, setCatBreed] = useState(() => { try { return localStorage.getItem("wv_cat_breed") || "橙猫"; } catch { return "橙猫"; } });
  const [showBreedPicker, setShowBreedPicker] = useState(false);
  const [tempCatName, setTempCatName] = useState("");
  // Cat equipment system
  const [catEquipment, setCatEquipment] = useState(() => {
    try { return JSON.parse(localStorage.getItem("wv_cat_equipment") || "{}"); } catch { return {}; }
  }); // { hat: "crown", outfit: "hoodie", accessory: "wand" }
  const [catUnlocked, setCatUnlocked] = useState(() => {
    try { return JSON.parse(localStorage.getItem("wv_cat_unlocked") || "[]"); } catch { return []; }
  }); // array of unlocked item ids
  const [catThirst, setCatThirst] = useState(() => {
    try { return parseInt(localStorage.getItem("wv_cat_thirst") || "80"); } catch { return 80; }
  });
  const [catHealth, setCatHealth] = useState(() => { try { return parseInt(localStorage.getItem("wv_cat_health") || "80"); } catch { return 80; } });
  const [showCatRoom, setShowCatRoom] = useState(false);
  const [catRoomTab, setCatRoomTab] = useState("status"); // "status" | "wardrobe" | "shop"

  // Profile
  const [profile, setProfile] = useState(() => { try { const s = localStorage.getItem("wv_profile"); return s ? JSON.parse(s) : null; } catch { return null; } });
  const [showProfileSetup, setShowProfileSetup] = useState(() => !localStorage.getItem("wv_profile"));
  const [setupStep, setSetupStep] = useState(0); // 0=avatar, 1=name, 2=done
  const [setupAvatar, setSetupAvatar] = useState(0); // avatar id
  const [setupName, setSetupName] = useState("");
  const [setupBirthYear, setSetupBirthYear] = useState("");
  const [setupBirthMonth, setSetupBirthMonth] = useState("");
  const [setupOccupation, setSetupOccupation] = useState("");
  const [editingProfile, setEditingProfile] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [showRankSheet, setShowRankSheet] = useState(false);
  const [headerExpanded, setHeaderExpanded] = useState(false);

  // XP & Tasks
  const [xp, setXp] = useState(() => parseInt(localStorage.getItem("wv_xp") || "0"));
  const [fishCoins, setFishCoins] = useState(() => { try { return parseInt(localStorage.getItem("wv_fish_coins") || "0"); } catch { return 0; } });
  const [showBackpack, setShowBackpack] = useState(false);
  const [backpackTab, setBackpackTab] = useState("overview"); // "overview" | "log"
  const [transactionLog, setTransactionLog] = useState(() => { try { return JSON.parse(localStorage.getItem("wv_transactions") || "[]"); } catch { return []; } });
  // Track fish coins awarded per streak day
  const [lastFishCoinDate, setLastFishCoinDate] = useState(() => { try { return localStorage.getItem("wv_last_fish_date") || ""; } catch { return ""; } });
  const [completedTasks, setCompletedTasks] = useState(() => { try { return JSON.parse(localStorage.getItem("wv_tasks_done") || "{}"); } catch { return {}; } });
  const [taskTab, setTaskTab] = useState("daily");
  const [showTaskReward, setShowTaskReward] = useState(null); // {title, xp, icon}
  const [todayBattle, setTodayBattle] = useState(() => { try { const d = JSON.parse(localStorage.getItem("wv_today_battle")||"{}"); return d.date === new Date().toISOString().slice(0,10) ? 1 : 0; } catch { return 0; } });
  const [newWord, setNewWord] = useState("");
  const [newMeaning, setNewMeaning] = useState("");
  const [newExample, setNewExample] = useState("");
  const [newTags, setNewTags] = useState([]);
  const [customTag, setCustomTag] = useState("");
  const [editingTag, setEditingTag] = useState(null);
  const [editingWordTags, setEditingWordTags] = useState(null);
  const [confirmDeleteTag, setConfirmDeleteTag] = useState(null); // tag name pending global delete
  const [confirmDeleteWordTag, setConfirmDeleteWordTag] = useState(null); // { wordId, tag } pending word-level delete
  const [expandedMasteryGroup, setExpandedMasteryGroup] = useState(null);
  const [groupByTag, setGroupByTag] = useState(false);
  const [expandedTagGroup, setExpandedTagGroup] = useState({});
  const [userTags, setUserTags] = useState(() => { try { const s = localStorage.getItem("wv_user_tags"); return s ? JSON.parse(s) : [...DEFAULT_TAGS]; } catch { return [...DEFAULT_TAGS]; } });
  const [msg, setMsg] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [quizState, setQuizState] = useState(null);
  const [quizResult, setQuizResult] = useState(null);
  const [streakData, setStreakData] = useState(() => {
    try {
      const s = localStorage.getItem("wv_streak");
      return s ? JSON.parse(s) : { count: 0, lastDate: null, showBroken: false };
    } catch { return { count: 0, lastDate: null, showBroken: false }; }
  });
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [flippedBadges, setFlippedBadges] = useState(new Set());
  const [quizMode, setQuizMode] = useState("normal"); // "normal" | "review" | "wrong" | "listen" | "spell"
  const [quizLobby, setQuizLobby] = useState(true); // true = show game selection cards

  // Combo Pair Game state
  const [pairActive, setPairActive] = useState(false);
  const [pairCards, setPairCards] = useState([]);
  const [pairSelected, setPairSelected] = useState(null);
  const [pairMatched, setPairMatched] = useState([]);
  const [pairTimer, setPairTimer] = useState(60);
  const [pairCombo, setPairCombo] = useState(0);
  const [pairMaxCombo, setPairMaxCombo] = useState(0);
  const [pairDone, setPairDone] = useState(false);
  const [pairScore, setPairScore] = useState(0);
  const [pairTotalMatched, setPairTotalMatched] = useState(0);
  const pairTimerRef = useRef(null);
  const pairPoolRef = useRef([]);
  const pairPoolIdxRef = useRef(0);
  const pairCardCounterRef = useRef(0);
  const pairSoundRef = useRef(null);
  const quizSoundRef = useRef(null);

  // Fill-in-the-blank game state
  const [fillActive, setFillActive] = useState(false);
  const [fillQuestion, setFillQuestion] = useState(null); // {sentence, blank, answer, meaning, options, wordObj}
  const [fillSelected, setFillSelected] = useState(null); // chosen tile
  const [fillResult, setFillResult] = useState(null); // 'correct'|'wrong'
  const [fillScore, setFillScore] = useState(0);
  const [fillTotal, setFillTotal] = useState(0);
  const [fillCombo, setFillCombo] = useState(0);
  const [fillMaxCombo, setFillMaxCombo] = useState(0);
  const [fillQueue, setFillQueue] = useState([]); // remaining words
  const [isPro, setIsPro] = useState(() => localStorage.getItem("wv_pro") === "1");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [spellingInput, setSpellingInput] = useState("");
  const [hintRevealed, setHintRevealed] = useState(0); // number of letters revealed
  const [wrongBank, setWrongBank] = useState(() => {
    try { return JSON.parse(localStorage.getItem("wv_wrong_bank") || "[]"); } catch { return []; }
  }); // array of word strings (English words)
  const [wrongCounts, setWrongCounts] = useState(() => {
    try { return JSON.parse(localStorage.getItem("wv_wrong_counts") || "{}"); } catch { return {}; }
  }); // { word: errorCount }
  const [unlockedAchievements, setUnlockedAchievements] = useState(() => {
    try { return JSON.parse(localStorage.getItem("wv_achievements") || "[]"); } catch { return []; }
  });
  const [newAchievement, setNewAchievement] = useState(null); // shows popup
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0, wrongWords: [] });
  const [showSummary, setShowSummary] = useState(false);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [filterTag, setFilterTag] = useState("全部");
  const [searchQuery, setSearchQuery] = useState(null); // null=hidden, ""=open empty
  const [sortOrder, setSortOrder] = useState("newest"); // newest | oldest | alpha
  const [notifStatus, setNotifStatus] = useState("unknown");
  const [notifTime, setNotifTime] = useState(() => localStorage.getItem("wv_ntime") || "09:00");
  const [soundEnabled, setSoundEnabled] = useState(() => localStorage.getItem("wv_sound") !== "0");
  
  const [importMsg, setImportMsg] = useState("");
  const [importSnapshot, setImportSnapshot] = useState(null);
  const [dailyGoal, setDailyGoal] = useState(() => parseInt(localStorage.getItem("wv_daily_goal") || "5"));
  const [editingGoal, setEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(5);
  const [expandedWord, setExpandedWord] = useState(null);
  const [editingWord, setEditingWord] = useState(null); // { id, word, meaning, example }
  const [swipedWord, setSwipedWord] = useState(null);
  const touchStartX = useRef(0);

  // Battle Mode
  const [battleActive, setBattleActive] = useState(false);
  const [battleTimeLeft, setBattleTimeLeft] = useState(60);
  const [battleStats, setBattleStats] = useState({ correct: 0, total: 0, words: [] });
  const [battleQuestion, setBattleQuestion] = useState(null);
  const [battleAnswered, setBattleAnswered] = useState(null);
  const [showBattleResult, setShowBattleResult] = useState(false);
  const [battleFinalStats, setBattleFinalStats] = useState(null);
  const [showUnlock, setShowUnlock] = useState(false);
  const [unlockWord, setUnlockWord] = useState("");
  const battleTimerRef = useRef(null);
  const battleCanvasRef = useRef(null);

  // Challenge Link Mode
  const [challengeMode, setChallengeMode] = useState(false); // receiving a challenge
  const [challengeWords, setChallengeWords] = useState([]); // words in the challenge
  const [challengeFrom, setChallengeFrom] = useState(""); // sender name
  const [challengeIdx, setChallengeIdx] = useState(0);
  const [challengeAnswers, setChallengeAnswers] = useState([]); // {word, correct, chosen}
  const [challengeAnswered, setChallengeAnswered] = useState(null);
  const [challengeDone, setChallengeDone] = useState(false);
  const [showCreateChallenge, setShowCreateChallenge] = useState(false);
  const [challengeSelectedWords, setChallengeSelectedWords] = useState([]);
  const [challengeSenderName, setChallengeSenderName] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");

  useEffect(() => { try { localStorage.setItem("wv_words", JSON.stringify(words)); } catch {} }, [words]);
  useEffect(() => { try { localStorage.setItem("wv_wrong_bank", JSON.stringify(wrongBank)); } catch {} }, [wrongBank]);
  useEffect(() => { try { localStorage.setItem("wv_wrong_counts", JSON.stringify(wrongCounts)); } catch {} }, [wrongCounts]);
  // Check rank up whenever relevant data changes
  useEffect(() => {
    const currentRank = getRank(words.length, streakData.count);
    const savedRankId = localStorage.getItem("wv_rank_id") || "b3";
    if (currentRank.id !== savedRankId) {
      const savedIdx = RANKS.findIndex(r => r.id === savedRankId);
      const newIdx = RANKS.findIndex(r => r.id === currentRank.id);
      if (newIdx > savedIdx) {
        setNewAchievement(currentRank);
        localStorage.setItem("wv_rank_id", currentRank.id);
      }
    }
  }, [words.length, streakData.count]);
  useEffect(() => { try { localStorage.setItem("wv_score", JSON.stringify(score)); } catch {} }, [score]);
  useEffect(() => { try { localStorage.setItem("wv_ntime", notifTime); } catch {} }, [notifTime]);
  useEffect(() => { try { localStorage.setItem("wv_user_tags", JSON.stringify(userTags)); } catch {} }, [userTags]);
  useEffect(() => { if ("Notification" in window) setNotifStatus(Notification.permission); }, []);

  // 预加载 Combo 页所有 PNG，防止点击猫爪后图片才开始加载导致卡顿
  useEffect(() => {
    const srcs = [
      COMBOCAT_1, COMBOCAT_2, COMBOCAT_3, COMBOCAT_4, COMBOCAT_5,
      COMBOCAT_6, COMBOCAT_7, COMBOCAT_8, COMBOCAT_9,
      COMBO_CAT_FIGHTING, MAX_COMBO_PNG, CORRECT_RATE_PNG,
    ];
    srcs.forEach(src => { const img = new Image(); img.src = src; });
  }, []);

  // Streak logic - runs on mount
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    setStreakData(prev => {
      let next;
      if (prev.lastDate === today) {
        // Already visited today, no change
        next = prev;
      } else if (prev.lastDate === yesterday) {
        // Consecutive day - increment
        next = { count: prev.count + 1, lastDate: today, showBroken: false };
        localStorage.setItem("wv_streak", JSON.stringify(next));
        setShowStreakModal(true);
        // 🐟 Award fish coins for consecutive login
        const fishReward = next.count >= 30 ? 10 : next.count >= 14 ? 7 : next.count >= 7 ? 5 : next.count >= 3 ? 3 : 2;
        setFishCoins(f => { const n = f + fishReward; try { localStorage.setItem("wv_fish_coins", String(n)); } catch {} return n; });
        setTransactionLog(log => {
          const entry = { id: Date.now(), type: "earn_fish", amount: fishReward, desc: `连续登录第 ${next.count} 天奖励`, date: today };
          const n = [entry, ...log].slice(0, 100);
          try { localStorage.setItem("wv_transactions", JSON.stringify(n)); } catch {}
          return n;
        });
        return next;
      } else if (!prev.lastDate) {
        // First time ever
        next = { count: 1, lastDate: today, showBroken: false };
        localStorage.setItem("wv_streak", JSON.stringify(next));
        setShowStreakModal(true);
        setFishCoins(f => { const n = f + 1; try { localStorage.setItem("wv_fish_coins", String(n)); } catch {} return n; });
        setTransactionLog(log => {
          const entry = { id: Date.now(), type: "earn_fish", amount: 1, desc: "首次登录奖励 🐟", date: today };
          const n = [entry, ...log].slice(0, 100);
          try { localStorage.setItem("wv_transactions", JSON.stringify(n)); } catch {}
          return n;
        });
        return next;
      } else {
        // Streak broken
        next = { count: 1, lastDate: today, showBroken: prev.count > 1 };
        localStorage.setItem("wv_streak", JSON.stringify(next));
        if (prev.count > 1) setShowStreakModal(true);
        return next;
      }
      return next;
    });
  }, []);

  const allTags = ["全部", ...Array.from(new Set(words.flatMap(w => w.tags || [])))];
  const filteredWords = [...words]
    .filter(w => filterTag === "全部" || (w.tags || []).includes(filterTag))
    .filter(w => !searchQuery || !searchQuery.trim() || w.word.toLowerCase().includes(searchQuery.toLowerCase()) || w.meaning.includes(searchQuery))
    .sort((a, b) => {
      if (sortOrder === "alpha") return a.word.localeCompare(b.word);
      if (sortOrder === "oldest") return a.id - b.id;
      return b.id - a.id; // newest first (default)
    });

  const startQuiz = useCallback((mode) => {
    const m = mode || quizMode;
    let pool, target;
    if (m === "review") {
      const due = getDueWords(words);
      if (due.length === 0 || words.length < 4) return;
      pool = words; target = weightedPick(due, wrongBank);
    } else if (m === "wrong") {
      // Use top 20 most-wrong words sorted by error count
      const allWrong = words.filter(w => wrongBank.includes(w.word));
      if (allWrong.length === 0 || words.length < 4) return;
      const top20 = [...allWrong].sort((a, b) => (wrongCounts[b.word] || 0) - (wrongCounts[a.word] || 0)).slice(0, 20);
      pool = words; target = weightedPick(top20, wrongBank);
    } else if (m === "listen") {
      pool = filterTag === "全部" ? words : words.filter(w => (w.tags || []).includes(filterTag));
      if (pool.length < 4) return;
      target = weightedPick(pool, wrongBank);
    } else if (m === "spell") {
      pool = filterTag === "全部" ? words : words.filter(w => (w.tags || []).includes(filterTag));
      if (pool.length < 1) return;
      target = weightedPick(pool, wrongBank);
    } else {
      pool = filterTag === "全部" ? words : words.filter(w => (w.tags || []).includes(filterTag));
      if (pool.length < 4) return;
      target = weightedPick(pool, wrongBank);
    }
    const state = m === "listen" ? generateListenMCQ(pool, target)
      : m === "spell" ? generateSpellQ(pool, target)
      : generateMCQ(pool, target);
    setQuizState(state);
    setQuizResult(null);
    setSpellingInput("");
    setHintRevealed(0);
    // listen mode: do NOT auto-play, user taps the button
  }, [words, filterTag, quizMode, wrongBank]);

  const prevTabRef = useRef(tab);
  useEffect(() => {
    if (tab === 2 && prevTabRef.current !== 2) {
      setQuizLobby(true);
      setPairActive(false);
      setFillActive(false);
      clearInterval(pairTimerRef.current);
    }
    prevTabRef.current = tab;
  }, [tab]);

  const showMsg = (text) => { setMsg(text); setTimeout(() => setMsg(""), 2500); };

  function saveProfile(avatar, name) {
    const p = {
      avatar, name: name.trim() || "匿名学习者",
      joinDate: profile?.joinDate || new Date().toISOString().slice(0,10),
      birthYear: setupBirthYear, birthMonth: setupBirthMonth,
      occupation: setupOccupation,
    };
    setProfile(p);
    localStorage.setItem("wv_profile", JSON.stringify(p));
    setShowProfileSetup(false);
    setEditingProfile(false);
    setShowAvatarPicker(false);
  }

  // Render sprite avatar — size in px
  const SpriteAvatar = ({ id, size = 56 }) => {
    const av = AVATARS[id] || AVATARS[0];
    const scale = size / 64;
    return (
      <div style={{
        width: size, height: size, borderRadius: size * 0.28,
        overflow: "hidden", flexShrink: 0, background: "#f5f5f5",
        position: "relative",
      }}>
        <div style={{
          width: 64, height: 64,
          backgroundImage: "url(/avatars.png)",
          backgroundSize: "640px 244px",
          backgroundPosition: `${av.x}px ${av.y}px`,
          backgroundRepeat: "no-repeat",
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          position: "absolute", top: 0, left: 0,
        }} />
      </div>
    );
  };

  // Build task progress context from current state
  function getTaskCtx() {
    const todayKey = new Date().toISOString().slice(0,10);
    const todayQuizData = (() => { try { return JSON.parse(localStorage.getItem("wv_daily_quiz")||"{}"); } catch { return {}; } });
    return {
      todayWords: words.filter(w => w.id && new Date(w.id).toISOString().slice(0,10) === todayKey).length,
      todayCorrect: (() => { try { const d = JSON.parse(localStorage.getItem("wv_today_correct")||"{}"); return d.date === todayKey ? d.count : 0; } catch { return 0; } })(),
      totalWords: words.length,
      totalCorrect: score.correct,
      streakCount: streakData.count,
      streakToday: streakData.lastDate === todayKey,
      masteredWords: words.filter(w => w.mastery >= 5).length,
      todayBattle,
    };
  }

  // Award XP and mark task done, show reward popup
  // ── CAT EQUIPMENT FUNCTIONS ─────────────────────────────────────
  function equipItem(item) {
    if (item.type === "hat" || item.type === "outfit" || item.type === "accessory") {
      setCatEquipment(prev => {
        const next = { ...prev, [item.type]: prev[item.type] === item.id ? null : item.id };
        try { localStorage.setItem("wv_cat_equipment", JSON.stringify(next)); } catch {}
        return next;
      });
    }
  }

  function buyItem(item, useFish = false) {
    const cost = item.xpCost;
    if (useFish) {
      const fishCost = Math.ceil(cost / 10); // 10 XP = 1 fish coin
      if (fishCoins < fishCost) return;
      setFishCoins(f => { const n = f - fishCost; try { localStorage.setItem("wv_fish_coins", String(n)); } catch {} return n; });
      const today = new Date().toISOString().slice(0,10);
      setTransactionLog(log => { const e = { id:Date.now(), type:"spend_fish", amount:-fishCost, desc:`购买 ${item.name}`, date:today }; const n=[e,...log].slice(0,100); try{localStorage.setItem("wv_transactions",JSON.stringify(n))}catch{} return n; });
    } else {
      if (xp < cost) return;
      setXp(x => { const n = x - cost; try { localStorage.setItem("wv_xp", String(n)); } catch {} return n; });
      const today = new Date().toISOString().slice(0,10);
      setTransactionLog(log => { const e = { id:Date.now(), type:"spend_xp", amount:-cost, desc:`购买 ${item.name}`, date:today }; const n=[e,...log].slice(0,100); try{localStorage.setItem("wv_transactions",JSON.stringify(n))}catch{} return n; });
    }
    setCatUnlocked(prev => {
      const next = [...prev, item.id];
      try { localStorage.setItem("wv_cat_unlocked", JSON.stringify(next)); } catch {}
      return next;
    });
  }

  function feedCatItem(item, useFish = false) {
    const cost = item.xpCost;
    const today = new Date().toISOString().slice(0,10);
    if (useFish) {
      const fishCost = Math.ceil(cost / 10);
      if (fishCoins < fishCost) return;
      setFishCoins(f => { const n = f - fishCost; try { localStorage.setItem("wv_fish_coins", String(n)); } catch {} return n; });
      setTransactionLog(log => { const e = { id:Date.now(), type:"spend_fish", amount:-fishCost, desc:`投喂 ${item.name} 给 ${catName}`, date:today }; const n=[e,...log].slice(0,100); try{localStorage.setItem("wv_transactions",JSON.stringify(n))}catch{} return n; });
    } else {
      if (xp < cost) return;
      setXp(x => { const n = x - cost; try { localStorage.setItem("wv_xp", String(n)); } catch {} return n; });
      setTransactionLog(log => { const e = { id:Date.now(), type:"spend_xp", amount:-cost, desc:`投喂 ${item.name} 给 ${catName}`, date:today }; const n=[e,...log].slice(0,100); try{localStorage.setItem("wv_transactions",JSON.stringify(n))}catch{} return n; });
    }
    if (item.hungerRestore) {
      setCatHunger(h => { const v = Math.min(100, h + item.hungerRestore); try { localStorage.setItem("wv_cat_hunger", String(v)); } catch {} return v; });
      setCatHealth(h => { const v = Math.min(100, h + Math.round(item.hungerRestore * 0.3)); try { localStorage.setItem("wv_cat_health", String(v)); } catch {} return v; });
    }
    if (item.thirstRestore) {
      setCatThirst(t => { const v = Math.min(100, t + item.thirstRestore); try { localStorage.setItem("wv_cat_thirst", String(v)); } catch {} return v; });
      setCatHealth(h => { const v = Math.min(100, h + Math.round(item.thirstRestore * 0.2)); try { localStorage.setItem("wv_cat_health", String(v)); } catch {} return v; });
    }
  }

  function isUnlocked(item) {
    if (item.xpCost === 0 && item.xpRequired === 0) return true;
    return catUnlocked.includes(item.id);
  }

  function canUnlock(item) { return xp >= item.xpRequired; }

    function addXpLog(amount, desc) {
    const today = new Date().toISOString().slice(0,10);
    setTransactionLog(log => {
      const e = { id:Date.now(), type:"earn_xp", amount:+amount, desc, date:today };
      const n = [e, ...log].slice(0, 100);
      try { localStorage.setItem("wv_transactions", JSON.stringify(n)); } catch {}
      return n;
    });
  }

  function claimTask(task) {
    const todayKey = new Date().toISOString().slice(0,10);
    const key = task.type === "daily" ? `${task.id}_${todayKey}` : task.id;
    if (completedTasks[key]) return;
    const next = { ...completedTasks, [key]: true };
    setCompletedTasks(next);
    localStorage.setItem("wv_tasks_done", JSON.stringify(next));
    const newXp = xp + task.xp;
    setXp(newXp);
    localStorage.setItem("wv_xp", String(newXp));
    setShowTaskReward({ title: task.title, xp: task.xp, icon: task.icon });
    setTimeout(() => setShowTaskReward(null), 2000);
  }

  function isTaskDone(task) {
    const todayKey = new Date().toISOString().slice(0,10);
    const key = task.type === "daily" ? `${task.id}_${todayKey}` : task.id;
    return !!completedTasks[key];
  }

  // Haptic feedback helper
  const haptic = (type = "light") => {
    if (!navigator.vibrate) return;
    if (type === "light") navigator.vibrate(8);
    else if (type === "medium") navigator.vibrate(15);
    else if (type === "success") navigator.vibrate([8, 40, 8]);
    else if (type === "error") navigator.vibrate([12, 30, 12, 30, 12]);
  };

  async function handleAIGenerate() {
    if (!newWord.trim()) { showMsg("请先填写单词"); return; }
    setAiLoading(true);
    try {
      const apiKey = process.env.REACT_APP_ANTHROPIC_KEY;
      if (!apiKey) { showMsg("未配置 API Key"); setAiLoading(false); return; }
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514", max_tokens: 300,
          messages: [{ role: "user", content: `For the English word "${newWord.trim()}", respond ONLY in JSON: {"meaning": "中文释义", "example": "Example sentence."}` }]
        })
      });
      const data = await res.json();
      const text = data.content?.map(i => i.text || "").join("") || "";
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      setNewMeaning(parsed.meaning || ""); setNewExample(parsed.example || "");
      showMsg("AI 生成完成");
    } catch { showMsg("AI 生成失败，请手动填写"); }
    setAiLoading(false);
  }

  function handleAddWord() {
    if (!newWord.trim() || !newMeaning.trim()) { showMsg("请填写单词和释义"); return; }
    if (words.find(w => w.word.toLowerCase() === newWord.trim().toLowerCase())) { showMsg("单词已存在"); return; }
    if (!isPro && words.length >= FREE_LIMIT) { setShowUpgrade(true); return; }
    const word = newWord.trim();
    setWords(ws => [...ws, { id: Date.now(), word, meaning: newMeaning.trim(), example: newExample.trim() || `${word} is a useful word.`, mastery: 0, tags: newTags }]);
    setNewWord(""); setNewMeaning(""); setNewExample(""); setNewTags([]);
    setUnlockWord(word);
    setShowUnlock(true);
    setTimeout(() => { setShowUnlock(false); setTab(0); }, 2200);
  }

  function toggleNewTag(tag) { setNewTags(ts => ts.includes(tag) ? ts.filter(t => t !== tag) : [...ts, tag]); }
  function addCustomTag() {
    const tag = customTag.trim();
    if (!tag) return;
    if (!newTags.includes(tag)) setNewTags(ts => [...ts, tag]);
    if (!userTags.includes(tag)) setUserTags(ts => [...ts, tag]);
    setCustomTag("");
  }
  function deleteUserTag(tag) {
    setUserTags(ts => ts.filter(t => t !== tag));
    setNewTags(ts => ts.filter(t => t !== tag));
    setWords(ws => ws.map(w => ({ ...w, tags: (w.tags || []).filter(t => t !== tag) })));
    showMsg("标签已删除");
  }
  function renameTag(oldTag, newTag) {
    const t = newTag.trim();
    if (!t || t === oldTag || userTags.includes(t)) { setEditingTag(null); return; }
    setUserTags(ts => ts.map(x => x === oldTag ? t : x));
    setNewTags(ts => ts.map(x => x === oldTag ? t : x));
    setWords(ws => ws.map(w => ({ ...w, tags: (w.tags||[]).map(x => x === oldTag ? t : x) })));
    setEditingTag(null);
    showMsg("标签已更新");
  }

  function submitSpelling() {
    if (!spellingInput.trim() || !quizState) return;
    const correct = spellingInput.trim().toLowerCase() === quizState.correct.toLowerCase();
    haptic(correct ? "success" : "error");
    setQuizResult(correct ? "correct" : "wrong");
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    updateGlobalCombo(correct);
    if (correct) {
      try {
        const d = JSON.parse(localStorage.getItem("wv_today_correct") || "{}");
        const todayKey2 = new Date().toISOString().slice(0, 10);
        localStorage.setItem("wv_today_correct", JSON.stringify({ date: todayKey2, count: (d.date === todayKey2 ? d.count : 0) + 1 }));
      } catch {}
      setTimeout(() => { setSpellingInput(""); setHintRevealed(0); setQuizResult(null); startQuiz(); }, 1200);
    }
  }

  function addWrongCount(wordStr) {
    setWrongCounts(prev => {
      const next = { ...prev, [wordStr]: (prev[wordStr] || 0) + 1 };
      localStorage.setItem("wv_wrong_counts", JSON.stringify(next));
      return next;
    });
  }

  function updateGlobalCombo(correct) {
    if (correct) {
      setGlobalCombo(c => {
        const next = c + 1;
        playQuizSound(next);
        setGlobalMaxCombo(m => {
          const newMax = Math.max(m, next);
          try { localStorage.setItem("wv_max_combo", String(newMax)); } catch {}
          return newMax;
        });
        return next;
      });
      setTotalComboSum(t => {
        const next = t + 1;
        try { localStorage.setItem("wv_total_combo_sum", String(next)); } catch {}
        return next;
      });
      // Feed cat on correct answer
      setCatHunger(h => { const v = Math.min(100, h + 2); try { localStorage.setItem("wv_cat_hunger", String(v)); } catch {} return v; });
      setCatMood(m => { const v = Math.min(100, m + 2); try { localStorage.setItem("wv_cat_mood", String(v)); } catch {} return v; });
      setCatHealth(h => { const v = Math.min(100, h + 1); try { localStorage.setItem("wv_cat_health", String(v)); } catch {} return v; });
      setCatFeedsToday(f => {
        const today = new Date().toISOString().slice(0,10);
        const next = f + 1;
        try { localStorage.setItem("wv_cat_feeds", JSON.stringify({ date: today, count: next })); } catch {}
        // Level up cat every 50 correct answers
        const newTotal = (parseInt(localStorage.getItem("wv_total_combo_sum") || "0")) + 1;
        const newLevel = Math.floor(newTotal / 50) + 1;
        setCatLevel(l => { if (newLevel > l) { try { localStorage.setItem("wv_cat_level", String(newLevel)); } catch {} return newLevel; } return l; });
        return next;
      });
    } else {
      setGlobalCombo(0);
    }
  }

  function handleMCQ(option) {
    const correct = option === quizState.correct;
    haptic(correct ? "success" : "error");
    if (correct) {
      const todayKey = new Date().toISOString().slice(0,10);
      try { const d = JSON.parse(localStorage.getItem("wv_today_correct")||"{}"); localStorage.setItem("wv_today_correct", JSON.stringify({ date: todayKey, count: (d.date === todayKey ? d.count : 0) + 1 })); } catch {}
    }
    setQuizResult(correct ? "correct" : "wrong");
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    updateGlobalCombo(correct);
    setWords(ws => ws.map(w => {
      if (w.word !== quizState.correctWord) return w;
      const updated = scheduleReview(w, correct);
      return { ...updated, mastery: correct ? Math.min(5, w.mastery + 1) : Math.max(0, w.mastery - 1) };
    }));

    // Update wrong bank (store word string for reliability)
    if (!correct) {
      const wStr = quizState.correctWord;
      addWrongCount(wStr);
      setWrongBank(prev => {
        const next = [...new Set([...prev, wStr])];
        localStorage.setItem("wv_wrong_bank", JSON.stringify(next));
        return next;
      });
    } else {
      // Remove from wrong bank only in wrong/review mode
      if (quizMode === "wrong" || quizMode === "listen" || quizMode === "review") {
        const wStr = quizState.correctWord;
        setWrongBank(prev => {
          const next = prev.filter(w => w !== wStr);
          localStorage.setItem("wv_wrong_bank", JSON.stringify(next));
          return next;
        });
      }
    }

    // Track daily quiz count
    try {
      const d = JSON.parse(localStorage.getItem("wv_daily_quiz") || "{}");
      d[todayKey] = (d[todayKey] || 0) + 1;
      localStorage.setItem("wv_daily_quiz", JSON.stringify(d));
    } catch {}
    setConsecutiveCorrect(c => {
      const next = correct ? c + 1 : 0;
      if (next === 20) {
        setTimeout(() => { playCelebrationSound(); setShowSummary(true); }, 600);
        return 0;
      }
      return next;
    });
    setSessionStats(s => {
      const newTotal = s.total + 1;
      const newCorrect = s.correct + (correct ? 1 : 0);
      const newWrong = correct ? s.wrongWords : [...new Set([...s.wrongWords, quizState.question])];
      return { correct: newCorrect, total: newTotal, wrongWords: newWrong };
    });
  }

  function handleSpell(input) {
    const answer = input.trim();
    const correct = answer.toLowerCase() === quizState.correct.toLowerCase();
    haptic(correct ? "success" : "error");
    setQuizResult(correct ? "correct" : "wrong");
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    setWords(ws => ws.map(w => {
      if (w.word !== quizState.correctWord) return w;
      const updated = scheduleReview(w, correct);
      return { ...updated, mastery: correct ? Math.min(5, w.mastery + 1) : Math.max(0, w.mastery - 1) };
    }));
    if (!correct) {
      const wStr = quizState.correctWord;
      addWrongCount(wStr);
      setWrongBank(prev => { const n = [...new Set([...prev, wStr])]; localStorage.setItem("wv_wrong_bank", JSON.stringify(n)); return n; });
    } else if (quizMode === "spell") {
      const wStr = quizState.correctWord;
      setWrongBank(prev => { const n = prev.filter(w => w !== wStr); localStorage.setItem("wv_wrong_bank", JSON.stringify(n)); return n; });
    }
    try {
      const d = JSON.parse(localStorage.getItem("wv_daily_quiz") || "{}");
      d[todayKey] = (d[todayKey] || 0) + 1;
      localStorage.setItem("wv_daily_quiz", JSON.stringify(d));
    } catch {}
    setConsecutiveCorrect(c => {
      const next = correct ? c + 1 : 0;
      if (next === 20) {
        setTimeout(() => { playCelebrationSound(); setShowSummary(true); }, 600);
        return 0;
      }
      return next;
    });
    setSessionStats(s => {
      const newTotal = s.total + 1;
      const newCorrect = s.correct + (correct ? 1 : 0);
      const newWrong = correct ? s.wrongWords : [...new Set([...s.wrongWords, quizState.correct])];
      return { correct: newCorrect, total: newTotal, wrongWords: newWrong };
    });
  }

  function deleteWord(id) { setWords(ws => ws.filter(w => w.id !== id)); }
  function saveEditWord() {
    if (!editingWord.word.trim() || !editingWord.meaning.trim()) { showMsg("单词和释义不能为空"); return; }
    setWords(ws => ws.map(w => w.id === editingWord.id ? { ...w, word: editingWord.word.trim(), meaning: editingWord.meaning.trim(), example: editingWord.example.trim() } : w));
    setEditingWord(null);
    showMsg("已保存");
  }

  function resetSession() {
    setSessionStats({ correct: 0, total: 0, wrongWords: [] });
    setShowSummary(false);
    setConsecutiveCorrect(0);
    startQuiz(quizMode);
  }

  function pickBattleQuestion() {
    if (words.length < 4) return null;
    const target = weightedPick(words, wrongBank);
    return generateMCQ(words, target);
  }

  function startBattle() {
    if (words.length < 4) { showMsg("至少需要 4 个单词才能对战"); return; }
    clearInterval(battleTimerRef.current);
    setBattleQuestion(pickBattleQuestion());
    setBattleAnswered(null);
    setBattleStats({ correct: 0, total: 0, words: [] });
    setBattleTimeLeft(60);
    setBattleActive(true);
    setShowBattleResult(false);
    battleTimerRef.current = setInterval(() => {
      setBattleTimeLeft(t => {
        if (t <= 1) {
          clearInterval(battleTimerRef.current);
          setBattleActive(false);
          setBattleStats(s => { setBattleFinalStats(s); setShowBattleResult(true); return s; });
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  function handleBattleMCQ(opt) {
    if (battleAnswered) return;
    const correct = opt === battleQuestion.correct;
    haptic(correct ? "success" : "error");
    setBattleAnswered(correct ? "correct" : "wrong");
    setBattleStats(s => ({
      correct: s.correct + (correct ? 1 : 0),
      total: s.total + 1,
      words: [...s.words, { word: battleQuestion.question, correct }]
    }));
    setTimeout(() => {
      setBattleQuestion(pickBattleQuestion());
      setBattleAnswered(null);
    }, 400);
  }

  function endBattle() {
    clearInterval(battleTimerRef.current);
    setBattleActive(false);
    setBattleStats(s => { setBattleFinalStats(s); setShowBattleResult(true); return s; });
    setBattleTimeLeft(0);
    const todayKey = new Date().toISOString().slice(0,10);
    setTodayBattle(1);
    try { localStorage.setItem("wv_today_battle", JSON.stringify({ date: todayKey })); } catch {}
  }

  function drawBattleCard() {
    const canvas = battleCanvasRef.current;
    if (!canvas || !battleFinalStats) return;
    const ctx = canvas.getContext("2d");
    const W = 600, H = 360;
    canvas.width = W; canvas.height = H;
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#0f0f0f");
    grad.addColorStop(1, "#16213e");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(40, 40, 4, H - 80);
    ctx.fillStyle = "#888";
    ctx.font = "bold 12px sans-serif";
    ctx.fillText("WORDVAULT  ·  限时对战", 60, 68);
    const acc = battleFinalStats.total > 0 ? Math.round(battleFinalStats.correct / battleFinalStats.total * 100) : 0;
    ctx.font = "bold 90px serif";
    ctx.fillStyle = acc >= 80 ? "#4ade80" : acc >= 60 ? "#facc15" : "#f87171";
    ctx.fillText(String(battleFinalStats.correct), 60, 200);
    const scoreW = ctx.measureText(String(battleFinalStats.correct)).width;
    ctx.font = "bold 26px serif";
    ctx.fillStyle = "#888";
    ctx.fillText("/ " + battleFinalStats.total + " 题", 60 + scoreW + 10, 190);
    const stats2 = [["正确率", acc + "%"], ["用时", "60 秒"], ["词库", words.length + " 词"]];
    stats2.forEach(([label, val], i) => {
      const x = 60 + i * 150;
      ctx.font = "12px sans-serif"; ctx.fillStyle = "#666"; ctx.fillText(label, x, 248);
      ctx.font = "bold 20px sans-serif"; ctx.fillStyle = "#fff"; ctx.fillText(val, x, 272);
    });
    const wrongWords = battleFinalStats.words.filter(w => !w.correct).slice(0, 5).map(w => w.word);
    if (wrongWords.length > 0) {
      ctx.font = "12px sans-serif"; ctx.fillStyle = "#555";
      ctx.fillText("需加强：" + wrongWords.join("  ·  "), 60, 315);
    }
    ctx.textAlign = "right"; ctx.fillStyle = "#333"; ctx.font = "11px sans-serif";
    ctx.fillText("wordvault-woad.vercel.app", W - 36, H - 24);
  }

  // ── Combo Pair Game ──

  function playQuizSound(comboCount) {
    try {
      if (!quizSoundRef.current) quizSoundRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = quizSoundRef.current;
      if (ctx.state === "suspended") ctx.resume();
      const t = ctx.currentTime;

      if (comboCount > 0 && comboCount % 6 === 0) {
        // 🎉 Combo ×6 celebration — 6-note ascending fanfare + shimmer burst
        const freqs = [523, 587, 659, 784, 880, 1047, 1319];
        freqs.forEach((freq, i) => {
          const osc = ctx.createOscillator(); const g = ctx.createGain();
          osc.type = i < 4 ? "triangle" : "sine";
          osc.frequency.setValueAtTime(freq, t + i * 0.07);
          g.gain.setValueAtTime(0.0001, t + i * 0.07);
          g.gain.exponentialRampToValueAtTime(0.2, t + i * 0.07 + 0.06);
          g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.07 + 0.28);
          osc.connect(g); g.connect(ctx.destination);
          osc.start(t + i * 0.07); osc.stop(t + i * 0.07 + 0.32);
        });
        // Noise shimmer burst on top
        const buf = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.04));
        const src = ctx.createBufferSource(); const ng = ctx.createGain();
        const nf = ctx.createBiquadFilter(); nf.type = "bandpass"; nf.frequency.value = 4000;
        src.buffer = buf; src.connect(nf); nf.connect(ng); ng.connect(ctx.destination);
        ng.gain.setValueAtTime(0.12, t + 0.35); ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
        src.start(t + 0.35);
      } else {
        // ✅ Regular correct — soft two-note chime (pitch rises slightly with combo)
        const base = 523 + Math.min(comboCount, 8) * 30; // C5 → rises with combo
        [[base, 0], [base * 1.5, 0.1]].forEach(([freq, delay]) => {
          const osc = ctx.createOscillator(); const g = ctx.createGain();
          osc.type = "sine"; osc.frequency.value = freq;
          g.gain.setValueAtTime(0.0001, t + delay);
          g.gain.exponentialRampToValueAtTime(0.16, t + delay + 0.03);
          g.gain.exponentialRampToValueAtTime(0.0001, t + delay + 0.22);
          osc.connect(g); g.connect(ctx.destination);
          osc.start(t + delay); osc.stop(t + delay + 0.25);
        });
      }
    } catch {}
  }

  function playCelebrationSound() {
    try {
      if (!quizSoundRef.current) quizSoundRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = quizSoundRef.current;
      if (ctx.state === "suspended") ctx.resume();
      const t = ctx.currentTime;
      // 🎊 Big celebration fanfare — ascending arpeggio + bells + noise burst
      const melody = [523,659,784,1047,1319,1568,2093,1568,1319,1047];
      melody.forEach((freq, i) => {
        const osc = ctx.createOscillator(); const g = ctx.createGain();
        osc.type = i > 6 ? "sine" : "triangle";
        osc.frequency.setValueAtTime(freq, t + i * 0.08);
        g.gain.setValueAtTime(0.0001, t + i * 0.08);
        g.gain.exponentialRampToValueAtTime(0.22, t + i * 0.08 + 0.05);
        g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.08 + 0.3);
        osc.connect(g); g.connect(ctx.destination);
        osc.start(t + i * 0.08); osc.stop(t + i * 0.08 + 0.35);
      });
      // Bell chord at peak
      [1047,1319,1568].forEach((freq, i) => {
        const osc = ctx.createOscillator(); const g = ctx.createGain();
        osc.type = "sine"; osc.frequency.value = freq;
        g.gain.setValueAtTime(0.0001, t + 0.82);
        g.gain.exponentialRampToValueAtTime(0.18, t + 0.88);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
        osc.connect(g); g.connect(ctx.destination);
        osc.start(t + 0.82); osc.stop(t + 1.65);
      });
      // Noise shimmer confetti burst
      const buf = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.08));
      const src = ctx.createBufferSource(); const ng = ctx.createGain();
      const nf = ctx.createBiquadFilter(); nf.type = "bandpass"; nf.frequency.value = 5000;
      src.buffer = buf; src.connect(nf); nf.connect(ng); ng.connect(ctx.destination);
      ng.gain.setValueAtTime(0.18, t + 0.7); ng.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
      src.start(t + 0.7);
    } catch {}
  }

    function playPairSound(type) {
    try {
      if (!pairSoundRef.current) pairSoundRef.current = new (window.AudioContext || window.webkitAudioContext)();
      const ctx = pairSoundRef.current;
      if (ctx.state === "suspended") ctx.resume();
      const gain = ctx.createGain();
      gain.connect(ctx.destination);

      if (type === "match") {
        // Two-note success chime
        [0, 0.12].forEach((t, i) => {
          const osc = ctx.createOscillator();
          osc.connect(gain);
          osc.frequency.value = i === 0 ? 523 : 784; // C5, G5
          osc.type = "sine";
          gain.gain.setValueAtTime(0.18, ctx.currentTime + t);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.22);
          osc.start(ctx.currentTime + t);
          osc.stop(ctx.currentTime + t + 0.25);
        });
      } else if (type === "combo") {
        // Ascending 3-note combo fanfare
        [0, 0.1, 0.2].forEach((t, i) => {
          const osc = ctx.createOscillator();
          osc.connect(gain);
          osc.frequency.value = [523, 659, 1047][i];
          osc.type = "triangle";
          gain.gain.setValueAtTime(0.15, ctx.currentTime + t);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.18);
          osc.start(ctx.currentTime + t);
          osc.stop(ctx.currentTime + t + 0.2);
        });
      } else if (type === "wrong") {
        const osc = ctx.createOscillator();
        osc.connect(gain);
        osc.frequency.value = 200;
        osc.type = "sawtooth";
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.18);
      } else if (type === "end") {
        [0, 0.15, 0.3, 0.5].forEach((t, i) => {
          const osc = ctx.createOscillator();
          osc.connect(gain);
          osc.frequency.value = [523, 659, 784, 1047][i];
          osc.type = "sine";
          gain.gain.setValueAtTime(0.14, ctx.currentTime + t);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.28);
          osc.start(ctx.currentTime + t);
          osc.stop(ctx.currentTime + t + 0.3);
        });
      }
    } catch {}
  }

  function makePairFromPool() {
    const pool = pairPoolRef.current;
    if (!pool.length) return null;
    const idx = pairPoolIdxRef.current % pool.length;
    pairPoolIdxRef.current++;
    const w = pool[idx];
    const key = ++pairCardCounterRef.current;
    return {
      wordCard: { id: "w" + key, text: w.word, type: "word", pairKey: key, matched: false, selected: false, entering: true, wrong: false },
      meaningCard: { id: "m" + key, text: w.meaning.split("；")[0].split(";")[0].replace(/[，,。.]/g, "").slice(0, 14), type: "meaning", pairKey: key, matched: false, selected: false, entering: true, wrong: false },
    };
  }

  function startPairGame() {
    if (words.length < 4) { showMsg("至少需要 4 个单词才能配对"); return; }
    // Build shuffled infinite pool
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    pairPoolRef.current = shuffled;
    pairPoolIdxRef.current = 0;
    pairCardCounterRef.current = 0;

    // Build initial 5 slots: left=words, right=meanings (shuffled independently)
    const initial = Array.from({ length: 5 }, () => makePairFromPool()).filter(Boolean);
    const leftCards  = initial.map(p => p.wordCard);
    const rightCards = [...initial.map(p => p.meaningCard)].sort(() => Math.random() - 0.5);
    const allCards = [...leftCards, ...rightCards].map(c => ({ ...c, entering: false }));

    setPairCards(allCards);
    setPairSelected(null);
    setPairMatched([]);
    setPairCombo(0);
    setPairMaxCombo(0);
    setPairScore(0);
    setPairTotalMatched(0);
    setPairTimer(60);
    setPairDone(false);
    setPairActive(true);

    clearInterval(pairTimerRef.current);
    pairTimerRef.current = setInterval(() => {
      setPairTimer(t => {
        if (t <= 1) {
          clearInterval(pairTimerRef.current);
          setPairDone(true);
          playPairSound("end");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  function handlePairTap(card) {
    if (card.matched || card.entering || pairDone) return;

    setPairCards(cards => {
      // Deselect same-type cards, select tapped card
      const after = cards.map(c => ({
        ...c,
        selected: c.id === card.id ? !c.selected : (c.type === card.type ? false : c.selected),
      }));

      const wordSel    = after.find(c => c.type === "word"    && c.selected && !c.matched);
      const meaningSel = after.find(c => c.type === "meaning" && c.selected && !c.matched);

      if (!wordSel || !meaningSel) return after;

      if (wordSel.pairKey === meaningSel.pairKey) {
        // ✅ Match
        haptic("success");
        setPairTotalMatched(n => n + 1);
        setPairCombo(c => {
          const nc = c + 1;
          setPairMaxCombo(mx => Math.max(mx, nc));
          setPairScore(s => s + 10 + nc * 3);
          if (nc >= 3) playPairSound("combo"); else playPairSound("match");
          return nc;
        });
        updateGlobalCombo(true);

        // Mark matched with flash
        const matched = after.map(c =>
          c.id === wordSel.id || c.id === meaningSel.id
            ? { ...c, matched: true, selected: false }
            : c
        );

        // After delay, replace matched pair with new cards
        setTimeout(() => {
          const next = makePairFromPool();
          if (!next) return;
          // Insert new word in same position as matched word card, new meaning in random meaning slot
          setPairCards(cs => {
            const newWord    = { ...next.wordCard,    entering: true };
            const newMeaning = { ...next.meaningCard, entering: true };
            // Replace matched word slot
            let replaced = cs.map(c => c.id === wordSel.id ? newWord : c);
            // Replace matched meaning slot
            replaced = replaced.map(c => c.id === meaningSel.id ? newMeaning : c);
            // Clear entering after animation
            setTimeout(() => setPairCards(cs2 => cs2.map(c =>
              c.id === newWord.id || c.id === newMeaning.id ? { ...c, entering: false } : c
            )), 350);
            return replaced;
          });
        }, 380);

        return matched;
      } else {
        // ❌ Wrong
        haptic("error");
        playPairSound("wrong");
        setPairCombo(0);
        updateGlobalCombo(false);
        const wrong = after.map(c =>
          c.id === wordSel.id || c.id === meaningSel.id
            ? { ...c, wrong: true, selected: false }
            : c
        );
        setTimeout(() => setPairCards(cs => cs.map(c => ({ ...c, wrong: false }))), 500);
        return wrong;
      }
    });
  }

  function endPairGame() {
    clearInterval(pairTimerRef.current);
    setPairActive(false);
    setPairDone(false);
    setQuizLobby(true);
  }

  function buildFillQuestion(wordObj, allWords) {
    const sentence = wordObj.example || "";
    const word = wordObj.word;
    // Replace word in sentence (case-insensitive) with blank
    const regex = new RegExp(word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    if (!sentence || !regex.test(sentence)) return null;
    const blank = "___________";
    const displayed = sentence.replace(regex, blank);
    // Pick 3 distractors from other words
    const others = allWords.filter(w => w.word !== word && w.word.length > 0);
    const shuffled = [...others].sort(() => Math.random() - 0.5).slice(0, 3);
    const options = [...shuffled.map(w => w.word), word].sort(() => Math.random() - 0.5);
    return { sentence: displayed, answer: word, meaning: wordObj.meaning, options, wordObj };
  }

  function startFillGame() {
    const valid = words.filter(w => w.example && w.example.toLowerCase().includes(w.word.toLowerCase()));
    if (valid.length < 2) { showMsg("需要至少 2 个带例句的单词"); return; }
    const shuffled = [...valid].sort(() => Math.random() - 0.5);
    setFillQueue(shuffled.slice(1));
    const q = buildFillQuestion(shuffled[0], words);
    if (!q) return;
    setFillQuestion(q);
    setFillSelected(null);
    setFillResult(null);
    setFillScore(0);
    setFillTotal(0);
    setFillCombo(0);
    setFillMaxCombo(0);
    setFillActive(true);
    setQuizLobby(false);
  }

  function nextFillQuestion() {
    if (fillQueue.length === 0) {
      // Reshuffle and continue
      const valid = words.filter(w => w.example && w.example.toLowerCase().includes(w.word.toLowerCase()));
      const reshuffled = [...valid].sort(() => Math.random() - 0.5);
      const q = buildFillQuestion(reshuffled[0], words);
      if (q) { setFillQuestion(q); setFillQueue(reshuffled.slice(1)); }
    } else {
      const [next, ...rest] = fillQueue;
      const q = buildFillQuestion(next, words);
      if (q) { setFillQuestion(q); setFillQueue(rest); }
      else { setFillQueue(rest); setTimeout(nextFillQuestion, 0); }
    }
    setFillSelected(null);
    setFillResult(null);
  }

  function handleFillTap(option) {
    if (fillResult) return;
    setFillSelected(option);
    const correct = option.toLowerCase() === fillQuestion.answer.toLowerCase();
    setFillResult(correct ? "correct" : "wrong");
    setFillTotal(t => t + 1);
    updateGlobalCombo(correct);
    if (correct) {
      setFillScore(s => s + 10);
      setFillCombo(c => { const n = c + 1; setFillMaxCombo(m => Math.max(m, n)); return n; });
      haptic("success");
      setTimeout(nextFillQuestion, 900);
    } else {
      setFillCombo(0);
      haptic("error");
    }
  }

  // ── Challenge Link functions ──
  function generateChallengeLink() {
    if (challengeSelectedWords.length === 0) { showMsg("请至少选择 1 个单词"); return; }
    if (!challengeSenderName.trim()) { showMsg("请填写你的名字"); return; }
    const payload = {
      from: challengeSenderName.trim(),
      words: challengeSelectedWords.map(w => ({ word: w.word, meaning: w.meaning, example: w.example || "" }))
    };
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload))));
    const link = window.location.origin + window.location.pathname + "?c=" + encoded;
    setGeneratedLink(link);
  }

  function copyLink() {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink).then(() => showMsg("链接已复制！")).catch(() => {
      const el = document.createElement("textarea");
      el.value = generatedLink; document.body.appendChild(el); el.select();
      document.execCommand("copy"); document.body.removeChild(el);
      showMsg("链接已复制！");
    });
  }

  function toggleChallengeWord(w) {
    setChallengeSelectedWords(prev =>
      prev.find(x => x.id === w.id) ? prev.filter(x => x.id !== w.id) : [...prev, w]
    );
  }

  function getChallengeQuestion(idx, cWords) {
    const target = cWords[idx];
    // Build distractors from all app words + challenge words
    const allPool = [...words, ...cWords.filter(cw => !words.find(w => w.word === cw.word))];
    const distractors = shuffle(allPool.filter(w => w.word !== target.word)).slice(0, 3);
    const options = shuffle([target, ...distractors]);
    return { question: target.word, correct: target.meaning, options: options.map(o => o.meaning), example: target.example };
  }

  function handleChallengeAnswer(opt) {
    if (challengeAnswered) return;
    const q = getChallengeQuestion(challengeIdx, challengeWords);
    const correct = opt === q.correct;
    haptic(correct ? "success" : "error");
    setChallengeAnswered(correct ? "correct" : "wrong");
    setChallengeAnswers(prev => [...prev, { word: q.question, correct, chosen: opt, rightAnswer: q.correct }]);
    setTimeout(() => {
      const nextIdx = challengeIdx + 1;
      if (nextIdx >= challengeWords.length) {
        setChallengeDone(true);
      } else {
        setChallengeIdx(nextIdx);
        setChallengeAnswered(null);
      }
    }, 500);
  }

  // Global click sound + haptic on every interactive element
  const soundEnabledRef = useRef(soundEnabled);
  useEffect(() => { soundEnabledRef.current = soundEnabled; }, [soundEnabled]);

  useEffect(() => {
    let ctx = null;
    const playClick = () => {
      if (!soundEnabledRef.current) return;
      try {
        if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (ctx.state === "suspended") ctx.resume();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.04);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.06);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.06);
      } catch {}
    };
    const handler = (e) => {
      const el = e.target.closest("button, .tag-pill, .opt-btn, .nav-item, [role='button']");
      if (el) {
        navigator.vibrate && navigator.vibrate(6);
        playClick();
      }
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, []);
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const c = params.get("c");
      if (c) {
        const payload = JSON.parse(decodeURIComponent(escape(atob(c))));
        if (payload.words && payload.words.length > 0) {
          setChallengeWords(payload.words);
          setChallengeFrom(payload.from || "朋友");
          setChallengeMode(true);
        }
      }
    } catch {}
  }, []);
  // Check OneSignal permission status on load
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const OS = window.OneSignal;
        if (OS) {
          // Wait for OneSignal to be ready
          await new Promise(r => setTimeout(r, 1500));
          const perm = Notification.permission;
          setNotifStatus(perm);
        } else if ("Notification" in window) {
          setNotifStatus(Notification.permission);
        }
      } catch {}
    };
    checkStatus();
  }, []);

  async function requestNotification() {
    try {
      // Must be added to home screen on iOS first
      const OS = window.OneSignal;
      if (!OS) {
        showMsg("通知服务还在加载，请稍后重试");
        return;
      }
      // Request permission via OneSignal (handles SW registration automatically)
      await OS.Notifications.requestPermission();
      await new Promise(r => setTimeout(r, 800));
      const perm = Notification.permission;
      setNotifStatus(perm);
      if (perm === "granted") {
        // Tag user with their preferred hour so OneSignal can target them
        const [h] = notifTime.split(":").map(Number);
        try {
          await OS.User.addTags({
            wv_remind_hour: String(h),
            wv_remind_time: notifTime,
          });
        } catch {}
        showMsg("通知已开启！");
      } else {
        showMsg("请在系统设置中允许通知权限");
      }
    } catch(e) {
      showMsg("开启失败，请检查系统通知权限");
    }
  }

  async function saveNotifTime() {
    localStorage.setItem("wv_ntime", notifTime);
    // Update OneSignal user tag so server knows the right send time
    try {
      const OS = window.OneSignal;
      if (OS && Notification.permission === "granted") {
        const [h] = notifTime.split(":").map(Number);
        await OS.User.addTags({
          wv_remind_hour: String(h),
          wv_remind_time: notifTime,
        });
      }
    } catch {}
    showMsg("提醒时间已保存：" + notifTime);
  }

  // Service Worker heartbeat — fires local notification at exact saved time
  // (fallback for when app is open in foreground)
  useEffect(() => {
    const check = () => {
      if (Notification.permission !== "granted") return;
      const saved = localStorage.getItem("wv_ntime");
      if (!saved) return;
      const now = new Date();
      const [h, m] = saved.split(":").map(Number);
      if (now.getHours() !== h || now.getMinutes() !== m) return;
      const todayKey = now.toISOString().slice(0, 10);
      const last = localStorage.getItem("wv_last_notif");
      if (last === todayKey) return;
      localStorage.setItem("wv_last_notif", todayKey);
      new Notification("WordCombo · 该学单词了", {
        body: "每天坚持，词汇量会飞速增长 ✓",
        icon: "/logo192.png",
        tag: "wv-daily",
        requireInteraction: true,
      });
    };
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  function exportJSON() {
    const blob = new Blob([JSON.stringify(words, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "wordvault.json"; a.click();
  }

  function exportCSV() {
    const rows = words.map(w => [`"${w.word}"`, `"${w.meaning}"`, `"${(w.example||"").replace(/"/g,'""')}"`, `"${(w.tags||[]).join(';')}"`, w.mastery].join(","));
    const blob = new Blob(["\uFEFFword,meaning,example,tags,mastery\n" + rows.join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "wordvault.csv"; a.click();
  }

  function handleImportFile(e) {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target.result; let imported = [];
        if (file.name.endsWith(".json")) { const p = JSON.parse(text); imported = Array.isArray(p) ? p : []; }
        else if (file.name.endsWith(".csv")) {
          text.split("\n").slice(1).filter(Boolean).forEach(line => {
            const cols = (line.match(/(".*?"|[^,]+)(?=,|$)/g) || []).map(c => c.replace(/^"|"$/g,"").replace(/""/g,'"'));
            if (cols[0]) imported.push({ id: Date.now()+Math.random(), word: cols[0], meaning: cols[1]||"", example: cols[2]||"", tags: cols[3]?cols[3].split(";").filter(Boolean):[], mastery: parseInt(cols[4])||0 });
          });
        } else { setImportMsg("仅支持 .json 或 .csv"); return; }
        const existing = words.map(w => w.word.toLowerCase());
        const newW = imported.filter(w => w.word && !existing.includes(w.word.toLowerCase())).map(w => ({ ...w, id: Date.now()+Math.random() }));
        if (!newW.length) { setImportMsg("所有单词已存在"); return; }
        if (!isPro && words.length + newW.length > FREE_LIMIT) {
          const allowed = newW.slice(0, Math.max(0, FREE_LIMIT - words.length));
          if (allowed.length === 0) { setShowUpgrade(true); setImportMsg(""); return; }
          setImportSnapshot(words); setWords(ws => [...ws, ...allowed]);
          setImportMsg(`已导入 ${allowed.length} 个（免费版上限 ${FREE_LIMIT} 词）`);
          setShowUpgrade(true); return;
        }
        setImportSnapshot(words); setWords(ws => [...ws, ...newW]);
        setImportMsg(`已导入 ${newW.length} 个单词`);
        setTimeout(() => setImportMsg(""), 4000);
      } catch { setImportMsg("文件格式有误"); }
    };
    reader.readAsText(file, "utf-8"); e.target.value = "";
  }

  // Today's date key for tracking daily progress
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayWords = words.filter(w => w.id && new Date(w.id).toISOString().slice(0, 10) === todayKey).length;
  const todayQuizzes = (() => { try { const d = JSON.parse(localStorage.getItem("wv_daily_quiz") || "{}"); return d[todayKey] || 0; } catch { return 0; } })();

  const masteryColor = (m) => ["#888","#d4a017","#c47a1e","#b05a10","#2d8a4e","#1a6e3c"][m];
  const masteryLabel = (m) => ["未学","初识","认识","熟悉","掌握","精通"][m];
  const correctRate = score.total ? Math.round(score.correct / score.total * 100) : 0;

  // Splash screen state: "in" | "out" | "done"
  const logoVideoRef = useRef(null);
  const [splash, setSplash] = useState("in");
  const [typedText, setTypedText] = useState("");
  const [typedLine2, setTypedLine2] = useState("");
  const [splashPhase, setSplashPhase] = useState(0);
  // 0=idle, 1=typing line1, 2=typing line2, 3=show logo, 4=done

  const LINE1 = "The more you hit,";
  const LINE2 = "the less you forget.";

  const [splashStarted, setSplashStarted] = useState(false);

  const startSplashAnim = useCallback(() => {
    if (splashStarted) return;
    setSplashStarted(true);

    // Unmute and replay the logo video now that user has interacted
    if (logoVideoRef.current) {
      logoVideoRef.current.muted = false;
      logoVideoRef.current.currentTime = 0;
      logoVideoRef.current.play().catch(() => {});
    }

    let audioCtx = null;
    const getCtx = () => {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === "suspended") audioCtx.resume();
      return audioCtx;
    };
    // Boot whoosh — low rumble sweep up
    const playBoot = () => {
      try {
        const ctx = getCtx(); const t = ctx.currentTime;
        const osc = ctx.createOscillator(); const gain = ctx.createGain(); const filter = ctx.createBiquadFilter();
        filter.type = "bandpass"; filter.frequency.setValueAtTime(80, t); filter.frequency.exponentialRampToValueAtTime(600, t + 0.7);
        osc.type = "sawtooth"; osc.frequency.setValueAtTime(40, t); osc.frequency.exponentialRampToValueAtTime(220, t + 0.7);
        gain.gain.setValueAtTime(0.0001, t); gain.gain.exponentialRampToValueAtTime(0.18, t + 0.15); gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.8);
        osc.connect(filter); filter.connect(gain); gain.connect(ctx.destination); osc.start(t); osc.stop(t + 0.85);
      } catch {}
    };
    // Mechanical key click
    const playKey = () => {
      try {
        const ctx = getCtx(); const t = ctx.currentTime;
        const buf = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.008));
        const src = ctx.createBufferSource(); const g1 = ctx.createGain(); const f1 = ctx.createBiquadFilter();
        f1.type = "highpass"; f1.frequency.value = 2200;
        src.buffer = buf; src.connect(f1); f1.connect(g1); g1.connect(ctx.destination);
        g1.gain.setValueAtTime(0.28, t); g1.gain.exponentialRampToValueAtTime(0.0001, t + 0.04); src.start(t);
        const osc = ctx.createOscillator(); const g2 = ctx.createGain();
        osc.type = "square"; osc.frequency.setValueAtTime(1800, t); osc.frequency.exponentialRampToValueAtTime(900, t + 0.02);
        g2.gain.setValueAtTime(0.09, t); g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.025);
        osc.connect(g2); g2.connect(ctx.destination); osc.start(t); osc.stop(t + 0.03);
      } catch {}
    };
    // WordCombo reveal chord
    const playReveal = () => {
      try {
        const ctx = getCtx(); const t = ctx.currentTime;
        [261.6, 329.6, 392, 523.2].forEach((freq, idx) => {
          const osc = ctx.createOscillator(); const gain = ctx.createGain();
          osc.type = "sine"; osc.frequency.value = freq;
          const delay = idx * 0.07;
          gain.gain.setValueAtTime(0.0001, t + delay); gain.gain.exponentialRampToValueAtTime(0.18 - idx * 0.02, t + delay + 0.12); gain.gain.exponentialRampToValueAtTime(0.0001, t + delay + 1.0);
          osc.connect(gain); gain.connect(ctx.destination); osc.start(t + delay); osc.stop(t + delay + 1.1);
        });
        const shimmer = ctx.createOscillator(); const sg = ctx.createGain();
        shimmer.type = "triangle"; shimmer.frequency.setValueAtTime(1046, t + 0.28); shimmer.frequency.exponentialRampToValueAtTime(1200, t + 0.6);
        sg.gain.setValueAtTime(0.0001, t + 0.28); sg.gain.exponentialRampToValueAtTime(0.12, t + 0.4); sg.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
        shimmer.connect(sg); sg.connect(ctx.destination); shimmer.start(t + 0.28); shimmer.stop(t + 1.0);
      } catch {}
    };

    const SPEED1 = 55, SPEED2 = 50, PAUSE = 320;
    playBoot();
    setSplashPhase(1);
    let i = 0;
    const iv1 = setInterval(() => {
      i++; setTypedText(LINE1.slice(0, i)); playKey();
      if (i >= LINE1.length) {
        clearInterval(iv1);
        setTimeout(() => {
          setSplashPhase(2);
          let j = 0;
          const iv2 = setInterval(() => {
            j++; setTypedLine2(LINE2.slice(0, j)); playKey();
            if (j >= LINE2.length) {
              clearInterval(iv2);
              setTimeout(() => { setSplashPhase(3); playReveal(); }, 500);
            }
          }, SPEED2);
        }, PAUSE);
      }
    }, SPEED1);

    const totalMs = LINE1.length * SPEED1 + PAUSE + LINE2.length * SPEED2 + 500 + 1200;
    setTimeout(() => setSplash("out"),  totalMs);
    setTimeout(() => setSplash("done"), totalMs + 650);
  }, [splashStarted]);

  return (
    <div style={{ fontFamily: "Inter, -apple-system, sans-serif", minHeight: "100vh", background: "#FCFDE8", color: "#111", display: "flex", flexDirection: "column" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input, textarea { background: #f7f7f7; border: 1px solid #e0e0e0; border-radius: 8px; color: #111; padding: 10px 14px; font-family: inherit; font-size: 14px; outline: none; width: 100%; transition: border 0.15s; }
        input:focus, textarea:focus { border-color: #FF8000; background: #fff; box-shadow: 0 0 0 3px rgba(255,128,0,0.1); }
        input::placeholder, textarea::placeholder { color: #777; }
        .btn { border-radius: 8px; padding: 10px 20px; cursor: pointer; font-family: inherit; font-size: 14px; font-weight: 500; border: none; transition: all 0.15s; display: inline-block; }
        .btn-dark { background: #FF8000; color: #fff; }
        .btn-dark:hover { background: #e07000; }
        .btn-dark:disabled { background: #777; cursor: not-allowed; }
        .btn-outline { background: #fff; color: #111; border: 1.5px solid #ddd; }
        .btn-outline:hover { background: #f5f5f5; }
        .btn-sm { padding: 7px 14px; font-size: 13px; }
        .tag-pill { display: inline-block; padding: 5px 12px; border-radius: 20px; font-size: 12px; cursor: pointer; border: 1px solid #e0e0e0; background: #fff; color: #777; transition: all 0.12s; }
        .tag-pill.active { background: #FF8000; color: #fff; border-color: #FF8000; }
        .word-row { border-bottom: 1px solid #f2f2f2; padding: 9px 0; cursor: pointer; }
        .word-row:last-child { border-bottom: none; }
        .opt-btn { width: 100%; background: #fafafa; border: 1.5px solid #ebebeb; border-radius: 10px; padding: 14px 16px; text-align: left; font-family: inherit; font-size: 14px; color: #111; cursor: pointer; transition: all 0.12s; margin-bottom: 8px; }
        .opt-btn:hover:not(:disabled) { border-color: #FF8000; background: #fff8ee; }
        .opt-btn.correct { background: #f0faf4; border-color: #2d8a4e; color: #2d8a4e; position: relative; padding-right: 40px; } .opt-btn.correct::after { content: "✓"; position: absolute; right: 14px; top: 50%; transform: translateY(-50%); font-size: 16px; font-weight: 700; color: #2d8a4e; }
        .opt-btn.wrong { background: #fff5f5; border-color: #e53e3e; }
.bottom-nav { position: fixed; bottom: 0; left: 0; right: 0; background: #DC7286; border-top: none; display: flex; justify-content: center; z-index: 100; height: calc(68px + env(safe-area-inset-bottom, 0px)); padding-bottom: env(safe-area-inset-bottom, 0px); }
        .bottom-nav-inner { display: flex; width: 100%; max-width: 520px; align-items: center; height: 68px; }
        .nav-item { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0 0 6px; cursor: pointer; gap: 4px; border: none; background: none; font-family: inherit; height: 68px; }
        .nav-item-center { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0 0 6px; cursor: pointer; border: none; background: none; font-family: inherit; position: relative; height: 68px; }
        .nav-center-btn { width: 64px; height: 64px; border-radius: 50%; background: #DC7286; display: flex; align-items: center; justify-content: center; margin-bottom: 4px; margin-top: -22px; border: 3px solid #fff; box-shadow: 0 4px 16px rgba(220,114,134,0.4); transition: transform 0.15s; }
        .nav-item-center:active .nav-center-btn { transform: scale(0.9); }
        .nav-center-icon { font-size: 22px; line-height: 1; color: #fff; font-style: normal; }
        .nav-icon { font-size: 30px; line-height: 1; color: rgba(255,255,255,0.65); font-style: normal; display: none; }
        .nav-label { font-size: 10px; color: #888; font-weight: 400; }
        .nav-item.active .nav-icon { color: #fff; }
        .nav-item-center .nav-label { color: #888; font-size: 10px; }
        
        .nav-item-center.active .nav-center-btn { background: #DC7286; }
        .toast { position: fixed; top: 64px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg,#FF8000,#FFB347); color: #fff; padding: 9px 18px; border-radius: 20px; font-size: 13px; z-index: 999; white-space: nowrap; box-shadow: 0 4px 16px rgba(255,128,0,0.4); }
        .sec-title { font-size: 11px; font-weight: 600; letter-spacing: 1.2px; text-transform: uppercase; color: #666; margin-bottom: 14px; }
        .mastery-bar { height: 3px; background: #f0f0f0; border-radius: 2px; overflow: hidden; margin-top: 5px; }
        .swipe-container { position: relative; overflow: hidden; }
        .swipe-content { transition: transform 0.25s ease; }
        .swipe-content.swiped { transform: translateX(-72px); }
        .swipe-delete { position: absolute; right: 0; top: 0; bottom: 0; width: 72px; background: #e53e3e; display: flex; align-items: center; justify-content: center; color: white; font-size: 13px; font-weight: 500; cursor: pointer; border-radius: 0 0 0 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #eee; }
        .tab-content { background: #FCFDE8; padding: 16px 16px 120px; flex: 1; overflow-y: auto; }

        /* ── Press feedback — Duolingo-style spring ── */
        button, .tag-pill, .word-row, .opt-btn, .nav-item, .game-card, [role="button"] {
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }

        /* Default state: spring back with overshoot */
        button, .tag-pill, .opt-btn, .nav-item {
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
                      background 0.15s ease,
                      border-color 0.15s ease,
                      box-shadow 0.15s ease;
          transform: scale(1);
          will-change: transform;
        }

        /* Press down: quick compress */
        button:active, .tag-pill:active, .nav-item:active {
          transform: scale(0.91);
          transition: transform 0.1s cubic-bezier(0.4, 0, 0.6, 1);
        }

        /* Opt-btn: slightly larger press area, deeper press */
        .opt-btn {
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
                      background 0.12s ease, border-color 0.12s ease;
        }
        .opt-btn:active:not(:disabled) {
          transform: scale(0.95);
          transition: transform 0.09s cubic-bezier(0.4, 0, 0.6, 1);
        }

        /* Fill tile */
        .fill-tile { -webkit-tap-highlight-color: transparent; touch-action: manipulation; transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), border-color 0.1s, box-shadow 0.1s; }
        .fill-tile:active { transform: scale(0.92); border-color: #111 !important; transition: transform 0.09s ease; }

        /* Game card buttons */
        .game-card-btn {
          -webkit-tap-highlight-color: transparent;
          touch-action: pan-y;
          user-select: none;
          -webkit-user-select: none;
          transition: transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.1s ease;
        }
        .game-card-btn:active {
          transform: scale(0.94);
          opacity: 0.88;
          box-shadow: 0 2px 20px rgba(0,0,0,0.13) !important;
          transition: transform 0.08s ease, opacity 0.08s ease, box-shadow 0.08s ease;
        }

        /* Nav center button bounce */
        .nav-item-center:active .nav-center-btn {
          transform: scale(0.85);
          transition: transform 0.1s cubic-bezier(0.4, 0, 0.6, 1);
        }
        .nav-center-btn {
          transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        /* Primary black buttons: big spring */
        .btn-dark:active {
          transform: scale(0.92);
          transition: transform 0.1s cubic-bezier(0.4, 0, 0.6, 1) !important;
        }
        .btn-dark {
          transition: transform 0.4s cubic-bezier(0.34, 1.7, 0.64, 1),
                      background 0.15s ease !important;
        }

        /* Word Unlock */
        @keyframes unlockBgIn    { from { opacity:0 } to { opacity:1 } }
        @keyframes unlockBgOut   { from { opacity:1 } to { opacity:0 } }
        @keyframes unlockWordIn  { 0%{opacity:0;transform:scale(0.4) translateY(20px)} 60%{transform:scale(1.08) translateY(-4px)} 100%{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes unlockBadge   { 0%{opacity:0;transform:scale(0) rotate(-15deg)} 60%{transform:scale(1.15) rotate(4deg)} 100%{opacity:1;transform:scale(1) rotate(0deg)} }
        @keyframes correctPop    { 0%{transform:scale(1)} 30%{transform:scale(1.06)} 60%{transform:scale(0.97)} 100%{transform:scale(1)} }
        @keyframes wrongShake    { 0%{transform:translateX(0)} 18%{transform:translateX(-7px)} 36%{transform:translateX(7px)} 54%{transform:translateX(-5px)} 72%{transform:translateX(5px)} 100%{transform:translateX(0)} }
        .opt-btn.correct { animation: correctPop 0.4s cubic-bezier(0.34,1.56,0.64,1) both; }
        .opt-btn.wrong   { animation: wrongShake 0.4s ease both; }
        @keyframes unlockSub     { 0%{opacity:0;transform:translateY(10px)} 100%{opacity:1;transform:translateY(0)} }
        @keyframes cardSlideIn   { 0%{opacity:0;transform:translateY(18px) scale(0.96)} 100%{opacity:1;transform:translateY(0) scale(1)} }
        .game-card-enter { animation: cardSlideIn 0.38s cubic-bezier(0.22,1,0.36,1) both; }

        /* Badge scroll strip */
        .badge-scroll { display:flex; gap:10px; overflow-x:auto; scroll-snap-type:x mandatory; scroll-behavior:smooth; -webkit-overflow-scrolling:touch; padding-bottom:6px; margin-bottom:18px; scrollbar-width:none; -ms-overflow-style:none; }
        .badge-scroll::-webkit-scrollbar { display:none; }
        @keyframes badgePop { 0%{opacity:0;transform:scale(0.82) translateY(8px)} 70%{transform:scale(1.04) translateY(-2px)} 100%{opacity:1;transform:scale(1) translateY(0)} }

        /* Badge 3D flip card */
        .badge-flip-wrap { scroll-snap-align:start; flex-shrink:0; width:84px; height:84px; perspective:600px; cursor:pointer; animation: badgePop 0.4s cubic-bezier(0.34,1.56,0.64,1) both; }
        .badge-flip-wrap:active .badge-flip-inner { transform: scale(0.93) rotateY(var(--flip-deg,0deg)); }
        .badge-flip-inner { position:relative; width:100%; height:100%; transition:transform 0.52s cubic-bezier(0.34,1.2,0.64,1); transform-style:preserve-3d; }
        .badge-flip-inner.flipped { transform:rotateY(180deg); }
        .badge-flip-front, .badge-flip-back { position:absolute; inset:0; border-radius:20px; backface-visibility:hidden; -webkit-backface-visibility:hidden; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; padding:8px 6px; }
        .badge-flip-back { transform:rotateY(180deg); }

        /* Fire glow animation for max-combo icon */
        @keyframes fireGlow {
          0%   { filter: drop-shadow(0 0 4px rgba(255,120,0,0.5)) drop-shadow(0 0 10px rgba(255,60,0,0.3)); transform: scale(1); }
          25%  { filter: drop-shadow(0 0 10px rgba(255,160,0,0.8)) drop-shadow(0 0 22px rgba(255,80,0,0.5)); transform: scale(1.04) translateY(-2px); }
          50%  { filter: drop-shadow(0 0 6px rgba(255,100,0,0.6)) drop-shadow(0 0 16px rgba(255,40,0,0.4)); transform: scale(1.01); }
          75%  { filter: drop-shadow(0 0 12px rgba(255,180,0,0.9)) drop-shadow(0 0 26px rgba(255,90,0,0.5)); transform: scale(1.05) translateY(-3px); }
          100% { filter: drop-shadow(0 0 4px rgba(255,120,0,0.5)) drop-shadow(0 0 10px rgba(255,60,0,0.3)); transform: scale(1); }
        }
        @keyframes starPulse {
          0%,100% { filter: drop-shadow(0 0 4px rgba(100,180,255,0.5)) drop-shadow(0 0 10px rgba(60,120,255,0.3)); transform: scale(1); }
          50%      { filter: drop-shadow(0 0 10px rgba(120,200,255,0.9)) drop-shadow(0 0 22px rgba(80,140,255,0.6)); transform: scale(1.04); }
        }
        @keyframes bookFloat {
          0%,100% { filter: drop-shadow(0 0 4px rgba(80,200,120,0.5)) drop-shadow(0 0 10px rgba(40,160,80,0.3)); transform: scale(1) translateY(0); }
          50%      { filter: drop-shadow(0 0 10px rgba(100,220,140,0.8)) drop-shadow(0 0 20px rgba(60,180,100,0.5)); transform: scale(1.03) translateY(-3px); }
        }
        .stat-anim-fire { animation: fireGlow 1.8s ease-in-out infinite; transform-origin: center bottom; }
        .stat-anim-star { animation: starPulse 2.2s ease-in-out infinite; transform-origin: center; }
        .stat-anim-book { animation: bookFloat 2.6s ease-in-out infinite; transform-origin: center; }
        @keyframes particleFly {
          0%   { transform: translate(0,0) scale(1); opacity: 1; }
          100% { transform: translate(var(--dx), var(--dy)) scale(0); opacity: 0; }
        }

        /* Splash */
        @keyframes splashLogoIn {
          0%   { opacity: 0; transform: scale(0.6) translateY(10px); filter: blur(8px); }
          60%  { opacity: 1; transform: scale(1.06) translateY(-2px); filter: blur(0); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes splashWelcomeIn {
          0%   { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes splashWordComboIn {
          0%   { opacity: 0; transform: scale(0.75) translateY(16px); filter: blur(6px); }
          65%  { opacity: 1; transform: scale(1.04) translateY(-3px); filter: blur(0); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes splashScanline {
          0%   { transform: translateY(-100%); opacity: 0.06; }
          100% { transform: translateY(100vh); opacity: 0.06; }
        }
        @keyframes splashGlow {
          0%, 100% { text-shadow: 0 0 20px rgba(255,255,255,0.2); }
          50%       { text-shadow: 0 0 40px rgba(255,255,255,0.5), 0 0 80px rgba(255,255,255,0.2); }
        }
        @keyframes splashExit {
          0%   { opacity: 1; transform: scale(1); filter: blur(0); }
          40%  { opacity: 1; transform: scale(1.04); filter: blur(0); }
          100% { opacity: 0; transform: scale(1.12); filter: blur(12px); }
        }
        @keyframes cursorBlink {
          0%, 100% { opacity: 1; } 50% { opacity: 0; }
        }
        @keyframes splashBadgeIn {
          0%   { opacity: 0; transform: translateY(16px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .splash-logo-anim { animation: splashLogoIn 0.8s cubic-bezier(0.22,1,0.36,1) 0.1s both, splashGlow 2.5s ease-in-out 1s infinite; }
        .splash-exit      { animation: splashExit 0.6s cubic-bezier(0.4,0,0.6,1) forwards; }
        .splash-cursor    { display: inline-block; width: 2px; height: 1em; background: #fff; margin-left: 2px; vertical-align: text-bottom; animation: cursorBlink 0.7s step-end infinite; }
        .splash-badge     { animation: splashBadgeIn 0.5s ease 0.3s both; }
      `}</style>

      {/* Profile Setup */}
      {showProfileSetup && (
        <div style={{ position: "fixed", inset: 0, background: "#111", zIndex: 900, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 20px" }}>
          {setupStep === 0 && (
            <div style={{ width: "100%", maxWidth: 420, textAlign: "center", display: "flex", flexDirection: "column", height: "100%", justifyContent: "center" }}>
              {/* Preview */}
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                <div style={{ position: "relative" }}>
                  <SpriteAvatar id={setupAvatar} size={88} />
                  <div style={{ position: "absolute", bottom: -4, right: -4, width: 24, height: 24, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>✓</div>
                </div>
              </div>
              <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 26, color: "#fff", marginBottom: 4 }}>选择你的角色</div>
              <div style={{ fontSize: 12, color: "#555", marginBottom: 24 }}>选一个代表你的角色</div>

              {/* Avatar grid — scrollable */}
              <div style={{ flex: 1, overflowY: "auto", marginBottom: 20, maxHeight: "55vh" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, padding: "4px 4px 16px" }}>
                  {AVATARS.map(av => (
                    <div key={av.id} onClick={() => setSetupAvatar(av.id)}
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
                        borderRadius: 16, padding: 4,
                        border: setupAvatar === av.id ? "2.5px solid #fff" : "2.5px solid transparent",
                        background: setupAvatar === av.id ? "rgba(255,255,255,0.08)" : "transparent",
                        transform: setupAvatar === av.id ? "scale(1.08)" : "scale(1)",
                        transition: "all 0.15s cubic-bezier(0.34,1.56,0.64,1)" }}>
                      <SpriteAvatar id={av.id} size={52} />
                    </div>
                  ))}
                </div>
              </div>

              <button style={{ width: "100%", background: "#fff", color: "#111", fontSize: 15, fontWeight: 700, padding: "15px 0", borderRadius: 14, border: "none", cursor: "pointer", fontFamily: "inherit" }}
                onClick={() => setSetupStep(1)}>下一步 →</button>
            </div>
          )}

          {setupStep === 1 && (
            <div style={{ width: "100%", maxWidth: 360, textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
                <SpriteAvatar id={setupAvatar} size={80} />
              </div>
              <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 28, color: "#fff", marginBottom: 6 }}>你想叫什么？</div>
              <div style={{ fontSize: 13, color: "#555", marginBottom: 28 }}>可以是匿名，没人知道是你</div>
              <input value={setupName} onChange={e => setSetupName(e.target.value)}
                placeholder="输入昵称（可留空）" maxLength={16}
                onKeyDown={e => e.key === "Enter" && saveProfile(setupAvatar, setupName)}
                style={{ background: "#1e1e1e", border: "1.5px solid #333", color: "#fff", borderRadius: 12, padding: "14px 16px", fontSize: 16, marginBottom: 16, textAlign: "center" }} />
              <div style={{ fontSize: 11, color: "#444", marginBottom: 24 }}>最多 16 个字符</div>
              <button style={{ width: "100%", background: "#fff", color: "#111", fontSize: 15, fontWeight: 700, padding: "15px 0", borderRadius: 14, border: "none", cursor: "pointer", fontFamily: "inherit", marginBottom: 12 }}
                onClick={() => saveProfile(setupAvatar, setupName)}>开始学习 🎉</button>
              <button onClick={() => setSetupStep(0)} style={{ background: "none", border: "none", color: "#444", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>← 重新选角色</button>
            </div>
          )}
        </div>
      )}

      {/* Splash Screen */}
      {splash !== "done" && (
        <div className={splash === "out" ? "splash-exit" : ""}
          onTouchEnd={!splashStarted ? startSplashAnim : undefined}
          onClick={!splashStarted ? startSplashAnim : undefined}
          style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden",
            background: "linear-gradient(135deg, #0a0a0a 0%, #111 50%, #0d0d1a 100%)",
            cursor: !splashStarted ? "pointer" : "default" }}>

          {/* Grid overlay */}
          <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)", backgroundSize: "40px 40px", pointerEvents: "none" }} />

          {/* Scanline */}
          <div style={{ position: "absolute", left: 0, right: 0, height: "30%", background: "linear-gradient(transparent, rgba(255,255,255,0.03), transparent)", animation: "splashScanline 3s linear infinite", pointerEvents: "none" }} />

          {/* HUD corners */}
          {[0,1,2,3].map(i => (
            <div key={i} style={{ position: "absolute", width: 22, height: 22,
              top: i < 2 ? 32 : "auto", bottom: i >= 2 ? 32 : "auto",
              left: i % 2 === 0 ? 28 : "auto", right: i % 2 === 1 ? 28 : "auto",
              borderTop:    i < 2  ? "1.5px solid rgba(255,255,255,0.18)" : "none",
              borderBottom: i >= 2 ? "1.5px solid rgba(255,255,255,0.18)" : "none",
              borderLeft:   i % 2 === 0 ? "1.5px solid rgba(255,255,255,0.18)" : "none",
              borderRight:  i % 2 === 1 ? "1.5px solid rgba(255,255,255,0.18)" : "none",
            }} />
          ))}

          {/* Tap to start — video logo + pulse */}
          {!splashStarted && (
            <div style={{ textAlign: "center", position: "relative", zIndex: 1, animation: "splashWelcomeIn 0.8s ease both" }}>
              <video
                ref={logoVideoRef}
                src={LOGO_VIDEO}
                autoPlay loop muted playsInline
                style={{ width: 220, height: 220, objectFit: "contain", marginBottom: 28,
                  filter: "drop-shadow(0 0 30px rgba(0,255,180,0.4)) drop-shadow(0 0 70px rgba(0,200,255,0.25))" }}
              />
              <div style={{ fontSize: 10, letterSpacing: "5px", color: "#444", textTransform: "uppercase",
                animation: "cursorBlink 1.4s ease-in-out infinite" }}>
                TAP TO START
              </div>
            </div>
          )}

          {/* Typewriter + logo — shown after tap */}
          {splashStarted && (
          <div style={{ textAlign: "center", padding: "0 40px", position: "relative", zIndex: 1, width: "100%" }}>

            {/* Phase 1-2: Typewriter lines */}
            <div style={{ minHeight: 120, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginBottom: splashPhase >= 3 ? 32 : 0, transition: "margin 0.4s ease" }}>
              {splashPhase >= 1 && (
                <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 28, color: "#fff", lineHeight: 1.3, letterSpacing: "-0.3px", marginBottom: 2 }}>
                  {typedText}
                  {splashPhase === 1 && <span className="splash-cursor" />}
                </div>
              )}
              {splashPhase >= 2 && (
                <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 28, color: "#aaa", lineHeight: 1.3, letterSpacing: "-0.3px" }}>
                  {typedLine2}
                  {splashPhase === 2 && <span className="splash-cursor" />}
                </div>
              )}
            </div>

            {/* Phase 3: Logo video + WordCombo reveal */}
            {splashPhase >= 3 && (
              <div>
                <video
                  src={LOGO_VIDEO}
                  autoPlay muted playsInline
                  style={{ width: 160, height: 160, objectFit: "contain", marginBottom: 4,
                    filter: "drop-shadow(0 0 24px rgba(0,255,180,0.55)) drop-shadow(0 0 55px rgba(0,200,255,0.35))",
                    animation: "splashWordComboIn 0.8s cubic-bezier(0.22,1,0.36,1) both" }}
                />
                <div style={{ fontSize: 11, letterSpacing: "4px", color: "#555", textTransform: "uppercase", marginBottom: 8,
                  animation: "splashWelcomeIn 0.5s ease 0.15s both" }}>
                  Welcome
                </div>
                <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 44, color: "#fff", letterSpacing: "-1px", lineHeight: 1,
                  animation: "splashWordComboIn 0.7s cubic-bezier(0.22,1,0.36,1) 0.1s both",
                  textShadow: "0 0 40px rgba(255,255,255,0.2)" }}>
                  WordCombo
                </div>
                <div style={{ marginTop: 28, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  {[0,1,2].map(i => (
                    <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: "#333",
                      animation: `cursorBlink 1s ease ${i * 0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
          </div>
          )}
        </div>
      )}

      {msg && <div className="toast">{msg}</div>}

      {/* Upgrade Modal */}
      {showUpgrade && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: "#fff", borderRadius: 24, padding: 36, width: "100%", maxWidth: 340, textAlign: "center" }}>
            <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 32, color: "#111", marginBottom: 6 }}>解锁完整版</div>
            <div style={{ fontSize: 13, color: "#888", marginBottom: 28, lineHeight: 1.7 }}>
              免费版最多保存 <strong style={{ color: "#111" }}>{FREE_LIMIT} 个单词</strong><br/>
              升级后无限添加，继续你的词汇之旅
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {[
                "无限单词库",
                "完整遗忘曲线追踪",
                "听音辨词 · 拼写练习",
                "数据导出 / 导入",
                "所有段位解锁",
              ].map(f => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#444" }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#111", color: "#fff", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>✓</div>
                  {f}
                </div>
              ))}
            </div>
            <button
              style={{ width: "100%", background: "#111", color: "#fff", border: "none", borderRadius: 12, padding: "14px 0", fontSize: 16, fontWeight: 700, cursor: "pointer", marginBottom: 10, fontFamily: "inherit", letterSpacing: "0.3px" }}
              onClick={() => { setIsPro(true); localStorage.setItem("wv_pro", "1"); setShowUpgrade(false); showMsg("已解锁完整版！"); }}
            >
              立即解锁
            </button>
            <button style={{ background: "none", border: "none", color: "#aaa", fontSize: 13, cursor: "pointer", padding: "6px 0" }} onClick={() => setShowUpgrade(false)}>
              稍后再说
            </button>
          </div>
        </div>
      )}

      {/* Rank Up Popup */}
      {newAchievement && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: newAchievement.bg, border: "2px solid " + newAchievement.color, borderRadius: 24, padding: 40, width: "100%", maxWidth: 320, textAlign: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase", color: newAchievement.color, marginBottom: 12 }}>段位晋升</div>
            <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 13, color: "#888", marginBottom: 4 }}>{newAchievement.tier}</div>
            <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 36, color: newAchievement.color, fontWeight: 700, marginBottom: 16, letterSpacing: "-0.5px" }}>{newAchievement.name}</div>
            <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 28 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#111" }}>{words.length}</div>
                <div style={{ fontSize: 11, color: "#888" }}>单词数</div>
              </div>
              <div style={{ width: 1, background: "#e0e0e0" }} />
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#111" }}>{streakData.count}</div>
                <div style={{ fontSize: 11, color: "#888" }}>连续天数</div>
              </div>
            </div>
            <button style={{ width: "100%", background: newAchievement.color, color: "#fff", border: "none", borderRadius: 10, padding: "12px 0", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }} onClick={() => setNewAchievement(null)}>继续冲段</button>
          </div>
        </div>
      )}

      {/* Streak Modal */}
      {showStreakModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: 36, width: "100%", maxWidth: 320, textAlign: "center" }}>
            {streakData.showBroken ? (
              <>
                <div style={{ fontSize: 56, marginBottom: 12 }}>◇</div>
                <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 24, color: "#111", marginBottom: 8 }}>连续记录中断了</div>
                <div style={{ fontSize: 14, color: "#777", marginBottom: 6 }}>没关系，今天重新开始</div>
                <div style={{ fontSize: 13, color: "#aaa", marginBottom: 28 }}>当前连续：第 1 天</div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 56, marginBottom: 12, lineHeight: 1 }}>
                  {streakData.count >= 30 ? "★" : streakData.count >= 14 ? "★" : streakData.count >= 7 ? "★" : streakData.count >= 3 ? "◆" : "◇"}
                </div>
                <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 26, color: "#111", marginBottom: 8 }}>
                  {streakData.count === 1 ? "学习开始了！" : `连续 ${streakData.count} 天`}
                </div>
                <div style={{ fontSize: 14, color: "#777", marginBottom: 6 }}>
                  {streakData.count === 1 && "每天坚持，词汇量会飞速增长"}
                  {streakData.count === 3 && "3天连续，好习惯正在养成"}
                  {streakData.count === 7 && "整整一周！你真的很拼"}
                  {streakData.count === 14 && "两周连续，令人钦佩！"}
                  {streakData.count === 30 && "一个月！你是真正的学霸"}
                  {![1,3,7,14,30].includes(streakData.count) && "继续保持，别断掉！"}
                </div>
                <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 28, flexWrap: "wrap" }}>
                  {Array.from({ length: Math.min(streakData.count, 14) }).map((_, i) => (
                    <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: i < streakData.count ? "#111" : "#eee" }} />
                  ))}
                  {streakData.count > 14 && <div style={{ fontSize: 11, color: "#aaa", alignSelf: "center" }}>+{streakData.count - 14}</div>}
                </div>
              </>
            )}
            <button className="btn btn-dark" onClick={() => setShowStreakModal(false)} style={{ width: "100%" }}>
              {streakData.count === 1 ? "开始学习" : "继续"}
            </button>
          </div>
        </div>
      )}

      {/* Header Card */}
      {(tab === 2 || tab === 3) && (() => {
        const r = getRank(words.length, streakData.count);
        const catStage = getCatStage(xp);
        const catLv = getCatLv(xp);
        const catOverallHealth = Math.round((catHunger + catThirst + catMood + catHealth) / 4);
        const GREEN = "#45B7B8";
        const GREEN2 = "#5dd6d7";
        const nextR = getNextRank(words.length, streakData.count);
        const progressPct = nextR ? Math.min(100, Math.round(Math.max(words.length - r.words, 0) / Math.max(nextR.words - r.words, 1) * 100)) : 100;
        return (
          <div style={{ position: "sticky", top: 0, zIndex: 50, padding: "48px 16px 14px", background: "#FCFDE8" }}>
            <div style={{ maxWidth: 520, margin: "0 auto" }}>
              <div style={{ display: "flex", gap: 10 }}>

                {/* LEFT: User card */}
                <div style={{ flex: 1, background: `linear-gradient(145deg, ${GREEN}, ${GREEN2})`, borderRadius: 22, padding: "14px 14px 12px", boxShadow: `0 6px 20px ${GREEN}55`, position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.1)", pointerEvents: "none" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    {profile && (
                      <div style={{ position: "relative", flexShrink: 0 }}>
                        <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 0 2px rgba(255,255,255,0.7)" }}>
                          <SpriteAvatar id={profile.avatar} size={38} />
                        </div>
                        {streakData.count >= 2 && (
                          <div style={{ position: "absolute", bottom: -2, right: -2, background: "#ff6b00", borderRadius: 8, padding: "1px 4px", fontSize: 8, fontWeight: 800, color: "#fff", border: "1.5px solid #fff" }}>🔥{streakData.count}</div>
                        )}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", lineHeight: 1.2, marginBottom: 1 }}>{profile?.name || "学员"}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.75)" }}>{profile?.occupation || "学习者"}</div>
                    </div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.22)", borderRadius: 10, padding: "5px 10px", display: "inline-flex", alignItems: "center", gap: 5, border: "1px solid rgba(255,255,255,0.4)", marginBottom: 8 }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff" }} />
                    <div style={{ fontSize: 11, fontWeight: 800, color: "#fff" }}>{r.name}</div>
                  </div>
                  <div style={{ height: 5, background: "rgba(0,0,0,0.22)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", background: "linear-gradient(90deg, #0a4a25 0%, #16a34a 100%)", borderRadius: 3, width: progressPct + "%", transition: "width 0.6s ease" }} />
                  </div>
                </div>

                {/* RIGHT: Pet card */}
                <div style={{ flex: 1, background: `linear-gradient(145deg, ${GREEN}, ${GREEN2})`, borderRadius: 22, padding: "14px 14px 12px", boxShadow: `0 6px 20px ${GREEN}55`, cursor: "pointer", position: "relative", overflow: "hidden" }}
                  onClick={() => setShowCatRoom(true)}>
                  <div style={{ position: "absolute", top: -20, left: -20, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.1)", pointerEvents: "none" }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <img src={COMBO_CAT_HEAD} alt="猫" decoding="async" style={{ width: 44, height: 44, objectFit: "contain", filter: catHunger < 30 ? "brightness(0.7) saturate(0.4)" : "none" }} />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>{catName}</div>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.75)", marginTop: 2 }}>{catStage.name}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.8)" }}>❤️ 综合健康</span>
                    <span style={{ fontSize: 10, color: "#fff", fontWeight: 700 }}>{catOverallHealth}%</span>
                  </div>
                  <div style={{ height: 4, background: "rgba(0,0,0,0.18)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", background: catOverallHealth > 60 ? "rgba(255,255,255,0.85)" : catOverallHealth > 30 ? "#FFD700" : "#ff6b6b", borderRadius: 2, width: catOverallHealth + "%", transition: "width 0.5s" }} />
                  </div>
                </div>

              </div>

              {/* Expanded panel */}
            </div>
          </div>
        );
      })()}
      {/* Content */}
      <div className="tab-content">
        <div style={{ maxWidth: 520, margin: "0 auto" }}>

        {/* Tab 0 */}
        {tab === 0 && (
          <div>

            {/* ── BADGE SCROLL STRIP ── */}
            {(() => {
              const accuracy = score.total > 0 ? Math.round(score.correct / score.total * 100) : 0;
              const masteredCount = words.filter(w => w.mastery >= 5).length;
              const catHealth = Math.round((catHunger + catMood) / 2);
              const currentRank = getRank(words.length, streakData.count);
              const badges = [
                {
                  icon: "📚", value: words.length, label: "总词数",
                  bg: "linear-gradient(145deg,#667eea,#764ba2)",
                  delay: 0,
                },
                {
                  icon: "🔥", value: globalMaxCombo, label: "最高连击",
                  bg: "linear-gradient(145deg,#f7971e,#ff4e50)",
                  delay: 50,
                },
                {
                  icon: "⭐", value: xp, label: "总 XP",
                  bg: "linear-gradient(145deg,#f6c90e,#e8a000)",
                  delay: 100,
                },
                {
                  icon: "🎯", value: accuracy + "%", label: "正确率",
                  bg: "linear-gradient(145deg,#11998e,#38ef7d)",
                  delay: 150,
                },
                {
                  icon: "📅", value: streakData.count, label: "连续天数",
                  bg: "linear-gradient(145deg,#4facfe,#00f2fe)",
                  delay: 200,
                },
                {
                  icon: "📕", value: wrongBank.length, label: "错词数",
                  bg: wrongBank.length === 0
                    ? "linear-gradient(145deg,#a8edea,#78c7c7)"
                    : "linear-gradient(145deg,#fc5c7d,#6a3093)",
                  delay: 250,
                },
                {
                  icon: "😺", value: catHealth + "%", label: "猫咪状态",
                  bg: catHealth >= 60
                    ? "linear-gradient(145deg,#56ab2f,#a8e063)"
                    : catHealth >= 30
                    ? "linear-gradient(145deg,#f7b733,#fc4a1a)"
                    : "linear-gradient(145deg,#bdc3c7,#2c3e50)",
                  delay: 300,
                },
                {
                  icon: "🏆", value: masteredCount, label: "精通词数",
                  bg: "linear-gradient(145deg,#c471f5,#fa71cd)",
                  delay: 350,
                },
                {
                  icon: "🎖️", value: currentRank.name, label: "主人等级",
                  bg: "linear-gradient(145deg,#373b44,#4286f4)",
                  isText: true,
                  delay: 400,
                },
                {
                  icon: "👥", value: "—", label: "好友排名",
                  bg: "linear-gradient(145deg,#d3cce3,#9fa8da)",
                  locked: true,
                  delay: 450,
                },
              ];
              const playFlipSound = () => {
                try {
                  const ctx = new (window.AudioContext || window.webkitAudioContext)();
                  const play = () => {
                    const t = ctx.currentTime;
                    // Layer 1: crisp noise swoosh
                    const bufLen = Math.floor(ctx.sampleRate * 0.07);
                    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate);
                    const data = buf.getChannelData(0);
                    for (let i = 0; i < bufLen; i++) {
                      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufLen, 1.8);
                    }
                    const noise = ctx.createBufferSource();
                    noise.buffer = buf;
                    const hpf = ctx.createBiquadFilter();
                    hpf.type = "highpass";
                    hpf.frequency.value = 1800;
                    const noiseGain = ctx.createGain();
                    noiseGain.gain.setValueAtTime(0.28, t);
                    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
                    noise.connect(hpf); hpf.connect(noiseGain); noiseGain.connect(ctx.destination);
                    noise.start(t); noise.stop(t + 0.08);
                    // Layer 2: short tonal click
                    const osc = ctx.createOscillator();
                    osc.type = "sine";
                    osc.frequency.setValueAtTime(900, t);
                    osc.frequency.exponentialRampToValueAtTime(400, t + 0.04);
                    const oscGain = ctx.createGain();
                    oscGain.gain.setValueAtTime(0.12, t);
                    oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
                    osc.connect(oscGain); oscGain.connect(ctx.destination);
                    osc.start(t); osc.stop(t + 0.05);
                  };
                  // resume() 解决浏览器默认 suspended 状态
                  if (ctx.state === "suspended") {
                    ctx.resume().then(play);
                  } else {
                    play();
                  }
                } catch(e) {}
              };
              const toggleBadge = (label) => {
                playFlipSound();
                setFlippedBadges(prev => {
                  const next = new Set(prev);
                  next.has(label) ? next.delete(label) : next.add(label);
                  return next;
                });
              };
              return (
                <div className="badge-scroll">
                  {badges.map((b) => {
                    const isFlipped = flippedBadges.has(b.label);
                    return (
                      <div
                        key={b.label}
                        className="badge-flip-wrap"
                        style={{ animationDelay: b.delay + "ms", opacity: b.locked ? 0.55 : 1 }}
                        onClick={() => !b.locked && toggleBadge(b.label)}
                      >
                        <div className={`badge-flip-inner${isFlipped ? " flipped" : ""}`}>
                          {/* FRONT — icon only */}
                          <div className="badge-flip-front" style={{ background: b.bg }}>
                            <div style={{ fontSize: 36, lineHeight: 1, filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.18))" }}>
                              {b.icon}
                            </div>
                            {b.locked && (
                              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.7)", marginTop: 2 }}>🔒 即将开放</div>
                            )}
                          </div>
                          {/* BACK — value + label */}
                          <div className="badge-flip-back" style={{ background: b.bg }}>
                            <div style={{
                              fontSize: b.isText ? 9 : 22,
                              fontWeight: 900,
                              color: "#fff",
                              lineHeight: 1,
                              textAlign: "center",
                              textShadow: "0 1px 6px rgba(0,0,0,0.25)",
                              letterSpacing: b.isText ? 0 : "-1px",
                              wordBreak: "keep-all",
                              maxWidth: 70,
                            }}>{b.value}</div>
                            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.88)", textAlign: "center", lineHeight: 1.3 }}>
                              {b.label}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* ── REVIEW REMINDER ── */}
            {(() => {
              const due = getDueWords(words);
              if (due.length === 0) return null;
              return (
                <div onClick={() => { setQuizMode("review"); setTab(2); startQuiz("review"); }}
                  style={{ display:"flex", alignItems:"center", gap:12, background:"#fff8ee", border:"1.5px solid #FFB347", borderRadius:16, padding:"12px 16px", marginBottom:14, cursor:"pointer", boxShadow:"0 2px 10px rgba(255,128,0,0.12)" }}>
                  <div style={{ width:36, height:36, borderRadius:12, background:"linear-gradient(135deg,#FF8000,#FFB347)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>🧠</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:"#c05800" }}>{due.length} 个单词待复习</div>
                    <div style={{ fontSize:11, color:"#e07800", marginTop:1 }}>艾宾浩斯曲线 · 现在复习效果最佳</div>
                  </div>
                  <div style={{ fontSize:18, color:"#FF8000" }}>›</div>
                </div>
              );
            })()}

            {/* ── FREE LIMIT BANNER ── */}
            {!isPro && words.length >= FREE_LIMIT - 3 && (
              <div onClick={() => setShowUpgrade(true)}
                style={{ display:"flex", alignItems:"center", gap:12, background: words.length >= FREE_LIMIT ? "#fff0f0" : "#fff8ee", border:"1.5px solid " + (words.length >= FREE_LIMIT ? "#e53e3e" : "#FFB347"), borderRadius:16, padding:"12px 16px", marginBottom:14, cursor:"pointer" }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:700, color: words.length >= FREE_LIMIT ? "#e53e3e" : "#c05800" }}>
                    {words.length >= FREE_LIMIT ? "已达免费上限" : `还能免费添加 ${FREE_LIMIT - words.length} 个词`}
                  </div>
                  <div style={{ fontSize:11, color:"#aaa", marginTop:1 }}>升级完整版，无限添加单词</div>
                </div>
                <div style={{ fontSize:12, fontWeight:700, color:"#FF8000", background:"rgba(255,128,0,0.1)", borderRadius:8, padding:"4px 10px" }}>升级 Pro →</div>
              </div>
            )}

            {/* ── CONTROLS ROW: sort/tags left, search icon right ── */}
            <div style={{ display:"flex", gap:8, marginBottom:16, alignItems:"flex-start" }}>

              {/* Left: sort pills + tag filter stacked */}
              <div style={{ flex:1, display:"flex", flexDirection:"column", gap:8 }}>
                {/* Sort pills */}
                <div style={{ display:"flex", gap:6 }}>
                  {[["newest","最新"],["oldest","最早"],["alpha","A→Z"]].map(([val, label]) => (
                    <button key={val} onClick={() => setSortOrder(val)} style={{ fontSize:12, padding:"5px 12px", borderRadius:20, border:"1px solid "+(sortOrder===val ? "#FF8000" : "#e0e0e0"), background: sortOrder===val ? "#FF8000" : "#fff", color: sortOrder===val ? "#fff" : "#777", cursor:"pointer", fontFamily:"inherit", fontWeight: sortOrder===val ? 700 : 400, transition:"all 0.15s" }}>{label}</button>
                  ))}
                </div>
                {/* Tag filter pills */}
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {allTags.map(tag => <span key={tag} className={`tag-pill ${filterTag === tag ? "active" : ""}`} onClick={() => setFilterTag(tag)}>{tag}</span>)}
                </div>
              </div>

              {/* Right: search + group-by-tag stacked, matching nav SVG badge style */}
              <div style={{ display:"flex", flexDirection:"row", gap:8, flexShrink:0 }}>
                {/* Search icon button */}
                <div style={{ position:"relative" }}>
                  <button onClick={() => setSearchQuery(searchQuery === null ? "" : (searchQuery === "" ? null : ""))}
                    style={{ width:42, height:42, borderRadius:14, background: searchQuery !== null ? "#FF8000" : "#f5f5f5", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s", boxShadow: searchQuery !== null ? "0 4px 12px rgba(255,128,0,0.35)" : "none" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={searchQuery !== null ? "#fff" : "#888"} strokeWidth="2.5" strokeLinecap="round">
                      <circle cx="11" cy="11" r="7"/><line x1="16.5" y1="16.5" x2="22" y2="22"/>
                    </svg>
                  </button>
                </div>
                {/* Group by tag icon button */}
                <button onClick={() => setGroupByTag(g => !g)}
                  style={{ width:42, height:42, borderRadius:14, background: groupByTag ? "#FF8000" : "#f5f5f5", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s", boxShadow: groupByTag ? "0 4px 12px rgba(255,128,0,0.35)" : "none" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={groupByTag ? "#fff" : "#888"} strokeWidth="2.5" strokeLinecap="round">
                    <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Search input — shown when search active */}
            {searchQuery !== null && (
              <div style={{ position:"relative", marginBottom:14 }}>
                <input autoFocus value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="搜索单词或释义…"
                  style={{ paddingLeft:40, background:"#fff", border:"1.5px solid #FF8000", borderRadius:14, boxShadow:"0 2px 8px rgba(255,128,0,0.12)" }} />
                <span style={{ position:"absolute", left:13, top:"50%", transform:"translateY(-50%)", color:"#FF8000", fontSize:16, pointerEvents:"none" }}>⌕</span>
                {searchQuery && <button onClick={() => setSearchQuery("")} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#aaa", fontSize:18 }}>×</button>}
              </div>
            )}

            {/* ── EMPTY STATE ── */}
            {filteredWords.length === 0 && (
              <div style={{ textAlign:"center", padding:"50px 0 30px" }}>
                <div style={{ width:80, height:80, margin:"0 auto 16px", opacity:0.6 }} dangerouslySetInnerHTML={{ __html:`<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg"><circle cx="40" cy="40" r="32" fill="#FFE0A0"/><path d="M28 36 Q31 32 34 36" stroke="#c05000" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M46 36 Q49 32 52 36" stroke="#c05000" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M33 48 Q40 54 47 48" stroke="#c05000" stroke-width="2" fill="none" stroke-linecap="round"/><polygon points="26,26 20,12 34,22" fill="#FFA020"/><polygon points="54,26 60,12 46,22" fill="#FFA020"/></svg>` }} />
                <div style={{ fontSize:16, fontWeight:700, color:"#333", marginBottom:6 }}>还没有单词</div>
                <div style={{ fontSize:13, color:"#aaa" }}>点下方「+」让 Combo猫帮你记单词！</div>
              </div>
            )}

            {/* ── WORD CARDS ── */}
            {(() => {
              const masteryDot = (m) => {
                const colors = ["#ddd","#FFD080","#FFB347","#4a9d6f","#2d8a4e","#1a6e3c"];
                const labels = ["未学","初识","认识","熟悉","掌握","精通"];
                return { color: colors[m], label: labels[m] };
              };

              const renderCard = (w) => {
                const dot = masteryDot(w.mastery);
                const isExpanded = expandedWord === w.id;
                const isWrong = wrongBank.includes(w.word);
                return (
                  <div key={w.id}
                    onClick={() => { if (swipedWord === w.id) { setSwipedWord(null); return; } setExpandedWord(isExpanded ? null : w.id); }}
                    style={{
                      background: "#fff",
                      borderRadius: 18,
                      padding: "16px 14px",
                      marginBottom: 10,
                      boxShadow: isExpanded ? "0 8px 28px rgba(255,128,0,0.18)" : "0 2px 10px rgba(0,0,0,0.06)",
                      border: isExpanded ? "1.5px solid #FF8000" : "1.5px solid transparent",
                      transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)",
                      cursor: "pointer",
                      position: "relative",
                      breakInside: "avoid",
                    }}>

                    {/* Mastery dot top-right */}
                    <div style={{ position:"absolute", top:12, right:12, display:"flex", alignItems:"center", gap:4 }}>
                      {isWrong && <div style={{ width:6, height:6, borderRadius:"50%", background:"#e53e3e" }} />}
                      <div style={{ width:8, height:8, borderRadius:"50%", background: dot.color, boxShadow: isExpanded ? `0 0 0 2px ${dot.color}44` : "none" }} title={dot.label} />
                    </div>

                    {/* Word */}
                    <div style={{ fontFamily:"DM Serif Display, serif", fontSize:20, color:"#111", lineHeight:1.15, marginBottom:4, paddingRight:20 }}>
                      {w.word}
                    </div>

                    {/* Phonetic + play */}
                    <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
                      {w.phonetic && <span style={{ fontSize:11, color:"#aaa", fontStyle:"italic" }}>{w.phonetic}</span>}
                      <button onClick={e => { e.stopPropagation(); speak(w.word); }}
                        style={{ width:24, height:24, borderRadius:"50%", background: isExpanded ? "#FF8000" : "#f5f5f5", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:9, color: isExpanded ? "#fff" : "#555", transition:"all 0.2s" }}>
                        ▶
                      </button>
                    </div>

                    {/* Meaning */}
                    <div style={{ fontSize:12, color:"#555", lineHeight:1.5, marginBottom: w.example ? 8 : 0 }}>
                      {w.meaning}
                    </div>

                    {/* Example */}
                    {w.example && (
                      <div style={{ fontSize:11, color:"#aaa", fontStyle:"italic", lineHeight:1.5, borderLeft:"2px solid #FFE0A0", paddingLeft:8, marginBottom:10 }}>
                        {w.example}
                      </div>
                    )}

                    {/* Tags */}
                    {(w.tags||[]).length > 0 && (
                      <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginTop:6 }}>
                        {(w.tags||[]).map(t => (
                          <span key={t} style={{ fontSize:10, padding:"2px 7px", borderRadius:8, background:"#fff5e0", color:"#c07000", fontWeight:600 }}>{t}</span>
                        ))}
                      </div>
                    )}

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div onClick={e => e.stopPropagation()} style={{ marginTop:14, paddingTop:14, borderTop:"1px solid #fff0d0" }}>
                        {editingWord?.id === w.id ? (
                          <div>
                            <input value={editingWord.word} onChange={e => setEditingWord(x => ({ ...x, word: e.target.value }))} placeholder="英文单词" style={{ marginBottom:6, fontFamily:"DM Serif Display, serif", fontSize:15 }} />
                            <input value={editingWord.meaning} onChange={e => setEditingWord(x => ({ ...x, meaning: e.target.value }))} placeholder="中文释义" style={{ marginBottom:6, fontSize:13 }} />
                            <input value={editingWord.example} onChange={e => setEditingWord(x => ({ ...x, example: e.target.value }))} placeholder="例句（可选）" style={{ marginBottom:10, fontSize:13 }} />
                            <div style={{ display:"flex", gap:8 }}>
                              <button className="btn btn-dark btn-sm" onClick={saveEditWord}>保存</button>
                              <button className="btn btn-outline btn-sm" onClick={() => setEditingWord(null)}>取消</button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            {/* Review schedule */}
                            {(() => {
                              if (!w.nextReview) return <div style={{ fontSize:11, color:"#bbb", marginBottom:10 }}>尚未测验 · 答题后开始记忆追踪</div>;
                              const d = new Date(w.nextReview); d.setHours(0,0,0,0);
                              const t = new Date(); t.setHours(0,0,0,0);
                              const diff = Math.round((d - t) / 86400000);
                              const lvl = w.reviewLevel || 0;
                              return (
                                <div style={{ marginBottom:12 }}>
                                  <div style={{ display:"flex", gap:3, marginBottom:5 }}>
                                    {REVIEW_INTERVALS.map((_, i) => (
                                      <div key={i} style={{ flex:1, height:3, borderRadius:2, background: i <= lvl ? "#FF8000" : "#f0f0f0" }} />
                                    ))}
                                  </div>
                                  <div style={{ fontSize:11, color: diff <= 0 ? "#e53e3e" : "#aaa" }}>
                                    {diff <= 0 ? "今天需要复习" : `${diff} 天后复习`}
                                  </div>
                                </div>
                              );
                            })()}
                            {/* Tag management */}
                            <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginBottom:10 }}>
                              {(w.tags||[]).map(t => (
                                <span key={t} style={{ fontSize:11, padding:"3px 8px", borderRadius:8, background:"#fff5e0", color:"#c07000", display:"inline-flex", alignItems:"center", gap:4 }}>
                                  {t}
                                  {confirmDeleteWordTag?.wordId === w.id && confirmDeleteWordTag?.tag === t ? (
                                    <>
                                      <span onClick={e => { e.stopPropagation(); setWords(ws => ws.map(x => x.id === w.id ? { ...x, tags: x.tags.filter(tg => tg !== t) } : x)); setConfirmDeleteWordTag(null); }} style={{ fontSize:12, color:"#e53e3e", cursor:"pointer", fontWeight:700 }}>✓</span>
                                      <span onClick={e => { e.stopPropagation(); setConfirmDeleteWordTag(null); }} style={{ fontSize:12, color:"#888", cursor:"pointer" }}>✗</span>
                                    </>
                                  ) : (
                                    <span onClick={e => { e.stopPropagation(); setConfirmDeleteWordTag({ wordId: w.id, tag: t }); }} style={{ cursor:"pointer", opacity:0.4, fontSize:12 }}>×</span>
                                  )}
                                </span>
                              ))}
                              {editingWordTags === w.id ? (
                                <select defaultValue="" autoFocus onClick={e => e.stopPropagation()}
                                  onChange={e => { const tag = e.target.value; if (tag && !(w.tags||[]).includes(tag)) setWords(ws => ws.map(x => x.id === w.id ? { ...x, tags: [...(x.tags||[]), tag] } : x)); setEditingWordTags(null); }}
                                  onBlur={() => setEditingWordTags(null)}
                                  style={{ fontSize:11, padding:"3px 6px", borderRadius:8, border:"1px solid #FFD080", background:"#fff", fontFamily:"inherit" }}>
                                  <option value="">+ 标签</option>
                                  {userTags.filter(tg => !(w.tags||[]).includes(tg)).map(tg => <option key={tg} value={tg}>{tg}</option>)}
                                </select>
                              ) : (
                                <span onClick={e => { e.stopPropagation(); setEditingWordTags(w.id); }} style={{ fontSize:11, padding:"3px 8px", borderRadius:8, border:"1px dashed #FFD080", color:"#FF8000", cursor:"pointer" }}>+ 标签</span>
                              )}
                            </div>
                            <div style={{ display:"flex", gap:8 }}>
                              <button className="btn btn-outline btn-sm" style={{ flex:1, borderColor:"#FFE0A0", color:"#c07000" }} onClick={() => setEditingWord({ id: w.id, word: w.word, meaning: w.meaning, example: w.example || "" })}>编辑</button>
                              <button className="btn btn-outline btn-sm" style={{ color:"#e53e3e", borderColor:"#fecaca" }} onClick={() => deleteWord(w.id)}>删除</button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              };

              const renderMasonry = (words) => {
                const left = words.filter((_, i) => i % 2 === 0);
                const right = words.filter((_, i) => i % 2 === 1);
                return (
                  <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                    <div style={{ flex:1 }}>{left.map(w => renderCard(w))}</div>
                    <div style={{ flex:1 }}>{right.map(w => renderCard(w))}</div>
                  </div>
                );
              };

              if (groupByTag && filterTag === "全部") {
                const groups = {};
                filteredWords.forEach(w => {
                  const tags = (w.tags||[]).length > 0 ? w.tags : ["未分类"];
                  tags.forEach(t => { if (!groups[t]) groups[t] = []; if (!groups[t].find(x => x.id === w.id)) groups[t].push(w); });
                });
                return Object.entries(groups).map(([tag, tagWords]) => (
                  <div key={tag} style={{ marginBottom:24 }}>
                    <div onClick={() => setExpandedTagGroup(g => ({ ...g, [tag]: g[tag] === false ? true : false }))}
                      style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10, cursor:"pointer" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{ width:4, height:16, borderRadius:2, background:"#FF8000" }} />
                        <span style={{ fontSize:12, fontWeight:800, letterSpacing:"0.5px", color:"#111" }}>{tag}</span>
                      </div>
                      <span style={{ fontSize:11, color:"#FF8000", background:"#fff5e0", borderRadius:8, padding:"2px 8px", fontWeight:600 }}>{tagWords.length} 词 {expandedTagGroup[tag] === false ? "▼" : "▲"}</span>
                    </div>
                    {expandedTagGroup[tag] !== false && renderMasonry(tagWords)}
                  </div>
                ));
              }
              return renderMasonry(filteredWords);
            })()}
          </div>
        )}
        {/* Tab 1 */}
        {tab === 1 && (
          <div style={{ maxWidth: 480 }}>

            {/* Combo header bar */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 24, color: "#111", letterSpacing: "-0.5px", fontWeight: 800 }}>收录新词</div>
              </div>
              {/* Combo badge */}
              <div style={{ textAlign: "center", background: todayWords >= 3 ? "linear-gradient(135deg,#FF8000,#FFB347)" : "#f0f0f0", borderRadius: 14, width: 64, height: 64, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background 0.3s", boxShadow: todayWords >= 3 ? "0 4px 14px rgba(255,128,0,0.35)" : "none" }}>
                <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 26, color: todayWords >= 3 ? "#fff" : "#111", lineHeight: 1 }}>
                  {todayWords >= 10 ? "🔥" : todayWords >= 5 ? "⚡" : todayWords >= 3 ? "✦" : "＋"}
                  {todayWords}
                </div>
                <div style={{ fontSize: 9, color: todayWords >= 3 ? "rgba(255,255,255,0.85)" : "#bbb", letterSpacing: "1.5px", marginTop: 2 }}>
                  {todayWords >= 10 ? "ON FIRE" : todayWords >= 5 ? "COMBO" : todayWords >= 3 ? "STREAK" : "TODAY"}
                </div>
              </div>
            </div>

            {/* Live word card preview */}
            {(newWord || newMeaning) && (
              <div style={{ background: "linear-gradient(135deg,#FF8000,#FFB347)", borderRadius: 18, padding: "18px 20px", marginBottom: 20, animation: "unlockSub 0.3s ease both" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 26, color: "#fff", letterSpacing: "-0.3px" }}>
                    {newWord || "单词"}
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.8)", letterSpacing: "2px", background: "rgba(0,0,0,0.15)", borderRadius: 6, padding: "3px 8px" }}>PREVIEW</div>
                </div>
                {newMeaning ? (
                  <div style={{ fontSize: 14, color: "rgba(255,255,255,0.9)", marginBottom: newExample ? 10 : 0 }}>{newMeaning}</div>
                ) : (
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontStyle: "italic" }}>释义将出现在这里…</div>
                )}
                {newExample && (
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", fontStyle: "italic", borderLeft: "2px solid rgba(255,255,255,0.4)", paddingLeft: 10, marginTop: 8, lineHeight: 1.5 }}>
                    {newExample}
                  </div>
                )}
                {newTags.length > 0 && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
                    {newTags.map(t => <span key={t} style={{ fontSize: 10, color: "#fff", background: "rgba(0,0,0,0.18)", borderRadius: 6, padding: "3px 8px" }}>{t}</span>)}
                  </div>
                )}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Word input + AI */}
              <div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input value={newWord} onChange={e => setNewWord(e.target.value)}
                    placeholder="e.g. Tenacious"
                    style={{ flex: 1, fontSize: 15, fontFamily: "DM Serif Display, serif", background: "#fff", border: "1.5px solid #ffe0b2", borderRadius: 12 }}
                    onKeyDown={e => e.key === "Enter" && !aiLoading && newWord.trim() && handleAIGenerate()} />
                  <button onClick={handleAIGenerate} disabled={aiLoading || !newWord.trim()}
                    style={{ background: (!aiLoading && newWord.trim()) ? "linear-gradient(135deg,#FF8000,#FFB347)" : "#f0f0f0", color: (!aiLoading && newWord.trim()) ? "#fff" : "#ccc", border: "none", borderRadius: 14, width: 64, height: 50, fontSize: 13, fontWeight: 700, cursor: (!aiLoading && newWord.trim()) ? "pointer" : "not-allowed", fontFamily: "inherit", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, gap: 4 }}>
                    {aiLoading ? (
                      <span style={{ display: "inline-block", animation: "cursorBlink 0.6s ease infinite" }}>✦</span>
                    ) : "✦ AI"}
                  </button>
                </div>
                {!newWord && <div style={{ fontSize: 11, color: "#ccc", marginTop: 5 }}>输入后按 Enter 让 AI 自动填写</div>}
              </div>

              {/* Meaning */}
              <div>
                <input value={newMeaning} onChange={e => setNewMeaning(e.target.value)}
                  placeholder="e.g. 坚韧的，顽强的"
                  style={{ background: "#fff", border: "1.5px solid #ffe0b2", borderRadius: 12, fontSize: 14, color: "#555" }} />
              </div>

              {/* Example — collapsible hint */}
              <div>
                <textarea value={newExample} onChange={e => setNewExample(e.target.value)}
                  placeholder="e.g. She was tenacious in pursuing her goals." rows={2}
                  style={{ resize: "none", background: "#fff", border: "1.5px solid #ffe0b2", borderRadius: 12, lineHeight: 1.5, fontSize: 13, fontStyle: "italic", color: "#888" }} />
              </div>

              {/* Tags — compact */}
              <div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                  {userTags.map(tag => (
                    <span key={tag} style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 4 }} className={`tag-pill ${newTags.includes(tag) ? "active" : ""}`}>
                      {editingTag?.old === tag ? (
                        <input autoFocus defaultValue={tag}
                          onBlur={e => renameTag(tag, e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") renameTag(tag, e.target.value); if (e.key === "Escape") setEditingTag(null); }}
                          onClick={e => e.stopPropagation()}
                          style={{ width: Math.max(40, tag.length * 14) + "px", padding: "0 4px", fontSize: 12, border: "none", borderBottom: "1px solid #111", background: "transparent", outline: "none", fontFamily: "inherit" }} />
                      ) : (
                        <span onClick={() => toggleNewTag(tag)} onDoubleClick={e => { e.stopPropagation(); setEditingTag({ old: tag }); }}>{tag}</span>
                      )}
                      {confirmDeleteTag === tag ? (
                        <>
                          <span style={{ fontSize: 11, color: "#e53e3e", whiteSpace: "nowrap" }}>删除?</span>
                          <span onClick={e => { e.stopPropagation(); deleteUserTag(tag); setConfirmDeleteTag(null); }} style={{ fontSize: 12, color: "#e53e3e", cursor: "pointer", fontWeight: 700 }}>✓</span>
                          <span onClick={e => { e.stopPropagation(); setConfirmDeleteTag(null); }} style={{ fontSize: 12, color: "#888", cursor: "pointer", fontWeight: 700 }}>✗</span>
                        </>
                      ) : (
                        <span onClick={e => { e.stopPropagation(); setConfirmDeleteTag(tag); }} style={{ fontSize: 13, opacity: 0.5, cursor: "pointer" }}>×</span>
                      )}
                    </span>
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input value={customTag} onChange={e => setCustomTag(e.target.value)}
                    placeholder="新标签…" style={{ flex:1, background: "#fff", border: "1.5px solid #ebebeb", borderRadius: 10 }}
                    onKeyDown={e => e.key === "Enter" && addCustomTag()} />
                  <button onClick={addCustomTag} style={{ width:38, height:38, borderRadius:"50%", background:"linear-gradient(135deg,#FF8000,#FFB347)", color:"#fff", border:"none", fontSize:22, fontWeight:300, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, boxShadow:"0 3px 10px rgba(255,128,0,0.3)" }}>+</button>
                </div>
              </div>

              {/* Unlock button */}
              <button onClick={handleAddWord}
                disabled={!newWord.trim() || !newMeaning.trim()}
                style={{ width: "100%", marginTop: 4, padding: "17px 0", borderRadius: 16, border: "none", fontFamily: "inherit", fontWeight: 700, fontSize: 16, cursor: (!newWord.trim() || !newMeaning.trim()) ? "not-allowed" : "pointer",
                  background: (!newWord.trim() || !newMeaning.trim()) ? "#f0f0f0" : "linear-gradient(135deg,#FF8000,#FFB347)",
                  color: (!newWord.trim() || !newMeaning.trim()) ? "#ccc" : "#fff",
                  transition: "all 0.2s", letterSpacing: "0.3px" }}>
                {(!newWord.trim() || !newMeaning.trim()) ? "单词解锁" : `🔓 收录「${newWord.trim()}」`}
              </button>

              {/* Word count bar */}
              {!isPro && (
                <div style={{ textAlign: "center" }}>
                  <div style={{ height: 3, background: "#f0f0f0", borderRadius: 2, overflow: "hidden", marginBottom: 6 }}>
                    <div style={{ height: "100%", background: words.length >= FREE_LIMIT ? "#e53e3e" : "#FF8000", borderRadius: 2, width: Math.min(100, words.length / FREE_LIMIT * 100) + "%", transition: "width 0.4s" }} />
                  </div>
                  <div onClick={() => words.length >= FREE_LIMIT && setShowUpgrade(true)}
                    style={{ fontSize: 11, color: words.length >= FREE_LIMIT ? "#e53e3e" : "#bbb", cursor: words.length >= FREE_LIMIT ? "pointer" : "default" }}>
                    词库 {words.length}/{FREE_LIMIT} 词{words.length >= FREE_LIMIT ? " · 升级 Pro 解锁无限" : ""}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2 */}
        {tab === 2 && (
          <div style={{ maxWidth: 480 }}>

          {/* ── GAME LOBBY ── */}
          {quizLobby && !pairActive && !fillActive && (
            <div style={{ paddingBottom: 20 }}>

              {/* ── HERO STATS CARD ── */}
              {(() => {
                const accuracy = score.total > 0 ? Math.round(score.correct / score.total * 100) : 0;
                return (
                  <div style={{ background: "linear-gradient(135deg, #FF7A00 0%, #FFB347 55%, #FFD080 100%)", borderRadius: 24, padding: "16px", marginBottom: 20, position: "relative", overflow: "hidden", boxShadow: "0 8px 28px rgba(255,128,0,0.35)" }}>
                    {/* Decorative circles */}
                    <div style={{ position:"absolute", top:-30, right:-30, width:140, height:140, borderRadius:"50%", background:"rgba(255,255,255,0.1)", pointerEvents:"none" }}/>
                    <div style={{ position:"absolute", bottom:-24, left:-16, width:90, height:90, borderRadius:"50%", background:"rgba(255,255,255,0.07)", pointerEvents:"none" }}/>
                    {/* Top row: title + cat */}
                    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:14 }}>
                      <div style={{ fontSize:22, fontWeight:900, color:"#fff", letterSpacing:"-0.5px", lineHeight:1, textShadow:"0 2px 8px rgba(0,0,0,0.12)", marginTop:4 }}>COMBO 挑战</div>
                      <img src={COMBO_CAT_FIGHTING} alt="Combo猫" decoding="async" style={{ width:86, height:94, objectFit:"contain", marginTop:-6, marginRight:-4, flexShrink:0, filter:"drop-shadow(0 4px 14px rgba(0,0,0,0.18))" }} />
                    </div>
                    {/* Stats row — WebP icons with value overlaid */}
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
                      <StatPNG src={MAX_COMBO_PNG}    value={globalMaxCombo}   size="100%" anim="fire" />
                      <StatPNG src={CORRECT_RATE_PNG} value={accuracy + "%"}   size="100%" anim="star" />
                      <StatPNG src={MAX_WORDS_PNG}    value={words.length}     size="100%" anim="book" />
                    </div>
                  </div>
                );
              })()}

              {/* ── MODE CARDS ── */}
              {(() => {
                const mascots = {
                  normal: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="68" rx="22" ry="18" fill="#fff" opacity="0.95"/><ellipse cx="28" cy="70" rx="10" ry="14" fill="#f0e8ff" transform="rotate(-15,28,70)"/><ellipse cx="72" cy="70" rx="10" ry="14" fill="#f0e8ff" transform="rotate(15,72,70)"/><circle cx="50" cy="46" r="20" fill="#fff" opacity="0.95"/><polygon points="36,30 33,18 42,27" fill="#f0e8ff"/><polygon points="64,30 67,18 58,27" fill="#f0e8ff"/><ellipse cx="50" cy="50" rx="14" ry="12" fill="#ffe0b2" opacity="0.7"/><circle cx="43" cy="47" r="8" fill="white"/><circle cx="57" cy="47" r="8" fill="white"/><circle cx="43" cy="47" r="8" fill="none" stroke="rgba(118,75,162,0.6)" stroke-width="1.5"/><circle cx="57" cy="47" r="8" fill="none" stroke="rgba(118,75,162,0.6)" stroke-width="1.5"/><line x1="51" y1="47" x2="49" y2="47" stroke="rgba(118,75,162,0.6)" stroke-width="1.5"/><circle cx="43" cy="47" r="4.5" fill="#2d1b5e"/><circle cx="57" cy="47" r="4.5" fill="#2d1b5e"/><circle cx="41.5" cy="45.5" r="1.8" fill="white"/><circle cx="55.5" cy="45.5" r="1.8" fill="white"/><polygon points="50,54 46,58 54,58" fill="#ffb74d"/><circle cx="37" cy="53" r="4" fill="rgba(255,100,100,0.18)"/><circle cx="63" cy="53" r="4" fill="rgba(255,100,100,0.18)"/><rect x="60" y="74" width="16" height="12" rx="2" fill="rgba(102,126,234,0.8)"/><rect x="34" y="28" width="32" height="5" rx="2" fill="rgba(50,30,100,0.85)"/><polygon points="50,20 38,29 62,29" fill="rgba(50,30,100,0.85)"/><circle cx="50" cy="21" r="2" fill="rgba(255,215,0,0.9)"/><line x1="50" y1="21" x2="60" y2="26" stroke="rgba(255,215,0,0.9)" stroke-width="1.5"/><circle cx="60" cy="27" r="2.5" fill="rgba(255,215,0,0.9)"/></svg>`,
                  listen: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="38" cy="22" rx="8" ry="22" fill="white" opacity="0.95"/><ellipse cx="38" cy="22" rx="4" ry="17" fill="rgba(255,182,193,0.7)"/><ellipse cx="62" cy="22" rx="8" ry="22" fill="white" opacity="0.95"/><ellipse cx="62" cy="22" rx="4" ry="17" fill="rgba(255,182,193,0.7)"/><ellipse cx="50" cy="70" rx="20" ry="17" fill="white" opacity="0.95"/><ellipse cx="50" cy="72" rx="11" ry="10" fill="rgba(255,230,240,0.8)"/><circle cx="50" cy="50" r="22" fill="white" opacity="0.95"/><path d="M22 48 Q22 30 50 30 Q78 30 78 48" fill="none" stroke="rgba(17,153,142,0.8)" stroke-width="5" stroke-linecap="round"/><circle cx="22" cy="50" r="11" fill="rgba(17,153,142,0.9)"/><circle cx="22" cy="50" r="7" fill="rgba(56,239,125,0.6)"/><circle cx="22" cy="50" r="3" fill="rgba(17,153,142,0.9)"/><circle cx="78" cy="50" r="11" fill="rgba(17,153,142,0.9)"/><circle cx="78" cy="50" r="7" fill="rgba(56,239,125,0.6)"/><circle cx="78" cy="50" r="3" fill="rgba(17,153,142,0.9)"/><circle cx="43" cy="48" r="4" fill="#1a3a3a"/><circle cx="41.5" cy="46.5" r="1.5" fill="white"/><circle cx="57" cy="48" r="4" fill="#1a3a3a"/><circle cx="55.5" cy="46.5" r="1.5" fill="white"/><ellipse cx="50" cy="54" rx="2.5" ry="1.5" fill="rgba(255,150,180,0.8)"/><path d="M44 59 Q50 65 56 59" stroke="#1a3a3a" stroke-width="2" fill="none" stroke-linecap="round"/><text x="83" y="35" font-size="12" fill="rgba(255,255,255,0.8)" font-family="Arial">&#9834;</text></svg>`,
                  spell: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><polygon points="30,35 22,18 42,30" fill="white" opacity="0.95"/><polygon points="32,34 26,22 39,30" fill="rgba(255,150,180,0.7)"/><polygon points="70,35 78,18 58,30" fill="white" opacity="0.95"/><polygon points="68,34 74,22 61,30" fill="rgba(255,150,180,0.7)"/><circle cx="50" cy="46" r="22" fill="white" opacity="0.95"/><ellipse cx="50" cy="50" rx="13" ry="11" fill="rgba(255,220,230,0.6)"/><ellipse cx="43" cy="44" rx="5" ry="6" fill="#1a1a2e"/><ellipse cx="57" cy="44" rx="5" ry="6" fill="#1a1a2e"/><circle cx="41.5" cy="42.5" r="2" fill="white"/><circle cx="55.5" cy="42.5" r="2" fill="white"/><polygon points="50,51 47,55 53,55" fill="rgba(255,100,150,0.85)"/><path d="M45 57 Q50 62 55 57" stroke="#1a1a2e" stroke-width="1.8" fill="none" stroke-linecap="round"/><circle cx="36" cy="52" r="4.5" fill="rgba(255,80,120,0.18)"/><circle cx="64" cy="52" r="4.5" fill="rgba(255,80,120,0.18)"/><ellipse cx="50" cy="76" rx="18" ry="13" fill="white" opacity="0.9"/><circle cx="68" cy="73" r="7" fill="rgba(255,220,200,0.9)"/><rect x="66" y="52" width="7" height="28" rx="2" fill="rgba(255,230,100,0.95)" transform="rotate(20,70,68)"/><polygon points="66,52 73,52 69.5,44" fill="rgba(255,180,50,0.8)" transform="rotate(20,70,68)"/><rect x="66" y="76" width="7" height="4" rx="1" fill="rgba(255,150,150,0.8)" transform="rotate(20,70,68)"/><circle cx="78" cy="55" r="2" fill="rgba(255,255,255,0.9)"/><circle cx="83" cy="48" r="1.5" fill="rgba(255,255,255,0.7)"/></svg>`,
                  pair: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="30" cy="55" r="18" fill="rgba(255,220,150,0.95)"/><circle cx="20" cy="38" r="7" fill="rgba(255,230,180,0.9)"/><circle cx="40" cy="38" r="7" fill="rgba(255,230,180,0.9)"/><circle cx="20" cy="38" r="4" fill="rgba(255,180,120,0.6)"/><circle cx="40" cy="38" r="4" fill="rgba(255,180,120,0.6)"/><circle cx="25" cy="52" r="3.5" fill="#1a1a2e"/><circle cx="23.5" cy="50.5" r="1.2" fill="white"/><circle cx="35" cy="52" r="3.5" fill="#1a1a2e"/><circle cx="33.5" cy="50.5" r="1.2" fill="white"/><path d="M25 60 Q30 65 35 60" stroke="#1a1a2e" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="22" cy="57" r="3.5" fill="rgba(255,100,100,0.2)"/><circle cx="38" cy="57" r="3.5" fill="rgba(255,100,100,0.2)"/><circle cx="70" cy="55" r="18" fill="rgba(200,235,255,0.95)"/><circle cx="60" cy="38" r="7" fill="rgba(210,240,255,0.9)"/><circle cx="80" cy="38" r="7" fill="rgba(210,240,255,0.9)"/><circle cx="60" cy="38" r="4" fill="rgba(150,200,255,0.6)"/><circle cx="80" cy="38" r="4" fill="rgba(150,200,255,0.6)"/><circle cx="65" cy="52" r="3.5" fill="#0d2a3a"/><circle cx="63.5" cy="50.5" r="1.2" fill="white"/><circle cx="75" cy="52" r="3.5" fill="#0d2a3a"/><circle cx="73.5" cy="50.5" r="1.2" fill="white"/><path d="M65 60 Q70 65 75 60" stroke="#0d2a3a" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M50 44 C50 41 46 38 46 42 C46 46 50 49 50 49 C50 49 54 46 54 42 C54 38 50 41 50 44Z" fill="rgba(255,100,130,0.9)"/><circle cx="50" cy="70" r="5" fill="rgba(255,255,255,0.8)"/></svg>`,
                  fill: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="72" rx="22" ry="18" fill="rgba(100,200,120,0.95)"/><ellipse cx="50" cy="74" rx="14" ry="11" fill="rgba(200,255,220,0.85)"/><ellipse cx="50" cy="46" rx="26" ry="22" fill="rgba(100,200,120,0.95)"/><circle cx="34" cy="33" r="10" fill="rgba(130,220,140,0.9)"/><circle cx="66" cy="33" r="10" fill="rgba(130,220,140,0.9)"/><circle cx="34" cy="33" r="7" fill="white"/><circle cx="66" cy="33" r="7" fill="white"/><circle cx="34" cy="33" r="4.5" fill="#0d3a1a"/><circle cx="66" cy="33" r="4.5" fill="#0d3a1a"/><circle cx="32.5" cy="31.5" r="1.8" fill="white"/><circle cx="64.5" cy="31.5" r="1.8" fill="white"/><rect x="26" y="26" width="48" height="7" rx="2" fill="rgba(30,60,30,0.85)"/><rect x="32" y="16" width="36" height="12" rx="4" fill="rgba(30,60,30,0.85)"/><path d="M30 55 Q50 65 70 55" stroke="#0d3a1a" stroke-width="2.5" fill="none" stroke-linecap="round"/><circle cx="76" cy="70" r="11" fill="none" stroke="rgba(255,255,255,0.9)" stroke-width="3.5"/><circle cx="76" cy="70" r="7.5" fill="rgba(200,255,230,0.4)"/><line x1="84" y1="78" x2="92" y2="86" stroke="rgba(255,255,255,0.9)" stroke-width="4" stroke-linecap="round"/><path d="M66 70 Q70 65 73 62" stroke="rgba(100,200,120,0.9)" stroke-width="5" stroke-linecap="round" fill="none"/></svg>`,
                  wrong: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="30" cy="28" r="12" fill="rgba(180,100,20,0.9)"/><circle cx="30" cy="28" r="7" fill="rgba(220,150,60,0.8)"/><circle cx="70" cy="28" r="12" fill="rgba(180,100,20,0.9)"/><circle cx="70" cy="28" r="7" fill="rgba(220,150,60,0.8)"/><ellipse cx="50" cy="74" rx="22" ry="16" fill="rgba(220,150,60,0.9)"/><circle cx="50" cy="50" r="26" fill="rgba(220,150,60,0.95)"/><ellipse cx="50" cy="58" rx="13" ry="9" fill="rgba(255,200,120,0.85)"/><ellipse cx="50" cy="53" rx="4" ry="2.5" fill="rgba(80,40,10,0.8)"/><circle cx="40" cy="46" r="7" fill="white"/><circle cx="60" cy="46" r="7" fill="white"/><circle cx="41" cy="46" r="4" fill="#1a0a00"/><circle cx="61" cy="46" r="4" fill="#1a0a00"/><circle cx="40" cy="44.5" r="1.5" fill="white"/><circle cx="60" cy="44.5" r="1.5" fill="white"/><path d="M33 38 L47 41" stroke="rgba(80,40,10,0.9)" stroke-width="3.5" stroke-linecap="round"/><path d="M53 41 L67 38" stroke="rgba(80,40,10,0.9)" stroke-width="3.5" stroke-linecap="round"/><path d="M43 62 Q50 60 57 62" stroke="rgba(80,40,10,0.8)" stroke-width="2" fill="none" stroke-linecap="round"/><rect x="72" y="30" width="5" height="35" rx="2" fill="rgba(255,255,255,0.9)" transform="rotate(20,74,47)"/><polygon points="74,30 72,18 76,18" fill="rgba(255,255,255,0.95)" transform="rotate(20,74,47)"/><path d="M22 35 Q20 40 24 42 Q28 40 22 35Z" fill="rgba(100,200,255,0.7)"/></svg>`,
                  battle: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="90" rx="8" ry="6" fill="rgba(255,180,0,0.8)"/><ellipse cx="50" cy="93" rx="5" ry="4" fill="rgba(255,100,0,0.7)"/><path d="M44 88 Q50 96 56 88" fill="rgba(255,220,0,0.6)"/><rect x="38" y="42" width="24" height="44" rx="8" fill="rgba(255,255,255,0.95)"/><path d="M38 42 Q38 20 50 14 Q62 20 62 42Z" fill="rgba(255,255,255,0.95)"/><circle cx="50" cy="48" r="11" fill="rgba(150,220,255,0.4)" stroke="rgba(255,255,255,0.8)" stroke-width="2"/><circle cx="50" cy="48" r="8" fill="rgba(220,240,255,0.7)"/><circle cx="46.5" cy="46" r="2.5" fill="#1a1a3e"/><circle cx="45.5" cy="45" r="1" fill="white"/><circle cx="53.5" cy="46" r="2.5" fill="#1a1a3e"/><circle cx="52.5" cy="45" r="1" fill="white"/><path d="M46 51 Q50 54 54 51" stroke="#1a1a3e" stroke-width="1.8" fill="none" stroke-linecap="round"/><polygon points="38,72 26,85 38,80" fill="rgba(255,255,255,0.85)"/><polygon points="62,72 74,85 62,80" fill="rgba(255,255,255,0.85)"/><path d="M18 30 L19.5 26 L21 30 L25 31.5 L21 33 L19.5 37 L18 33 L14 31.5Z" fill="rgba(255,255,255,0.9)"/><circle cx="80" cy="25" r="2.5" fill="rgba(255,255,255,0.8)"/><line x1="12" y1="50" x2="24" y2="50" stroke="rgba(255,255,255,0.5)" stroke-width="2" stroke-linecap="round"/><line x1="8" y1="58" x2="22" y2="58" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" stroke-linecap="round"/></svg>`,
                  review: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><ellipse cx="50" cy="82" rx="35" ry="12" fill="rgba(255,255,255,0.7)"/><circle cx="28" cy="76" r="10" fill="rgba(255,255,255,0.7)"/><circle cx="42" cy="73" r="12" fill="rgba(255,255,255,0.7)"/><circle cx="58" cy="73" r="12" fill="rgba(255,255,255,0.7)"/><circle cx="72" cy="76" r="10" fill="rgba(255,255,255,0.7)"/><polygon points="50,18 55,35 72,35 59,45 64,62 50,52 36,62 41,45 28,35 45,35" fill="rgba(255,255,255,0.95)"/><polygon points="50,24 54,36 66,36 57,43 60,56 50,49 40,56 43,43 34,36 46,36" fill="rgba(255,220,150,0.5)"/><path d="M40 40 Q43 37 46 40" stroke="#3a2000" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="M54 40 Q57 37 60 40" stroke="#3a2000" stroke-width="2.5" fill="none" stroke-linecap="round"/><circle cx="38" cy="45" r="4.5" fill="rgba(255,120,100,0.25)"/><circle cx="62" cy="45" r="4.5" fill="rgba(255,120,100,0.25)"/><path d="M45 48 Q50 52 55 48" stroke="#3a2000" stroke-width="1.8" fill="none" stroke-linecap="round"/><circle cx="18" cy="40" r="2.5" fill="rgba(255,255,255,0.8)"/><circle cx="22" cy="28" r="2" fill="rgba(255,255,255,0.7)"/></svg>`,
                  challenge: `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="26" cy="58" r="16" fill="rgba(255,210,160,0.95)"/><circle cx="16" cy="44" r="6" fill="rgba(255,220,180,0.9)"/><circle cx="36" cy="44" r="6" fill="rgba(255,220,180,0.9)"/><circle cx="21" cy="55" r="3" fill="#1a1a2e"/><circle cx="20" cy="54" r="1" fill="white"/><circle cx="31" cy="55" r="3" fill="#1a1a2e"/><circle cx="30" cy="54" r="1" fill="white"/><path d="M21 62 Q26 65 31 62" stroke="#1a1a2e" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M14 46 Q12 50 15 52 Q18 50 14 46Z" fill="rgba(100,200,255,0.7)"/><circle cx="50" cy="65" r="13" fill="rgba(255,255,255,0.9)"/><circle cx="50" cy="65" r="10" fill="rgba(196,113,245,0.3)"/><text x="50" y="69" text-anchor="middle" font-size="10" font-weight="900" fill="rgba(140,50,180,0.9)" font-family="Arial">VS</text><circle cx="74" cy="54" r="20" fill="rgba(200,225,255,0.95)"/><circle cx="62" cy="36" r="7" fill="rgba(215,235,255,0.9)"/><circle cx="86" cy="36" r="7" fill="rgba(215,235,255,0.9)"/><path d="M58 36 L64 26 L74 33 L84 24 L90 36 L88 43 L60 43Z" fill="rgba(255,215,0,0.95)"/><circle cx="74" cy="26" r="3" fill="rgba(255,80,80,0.9)"/><circle cx="63" cy="29" r="2.5" fill="rgba(100,220,100,0.9)"/><circle cx="85" cy="29" r="2.5" fill="rgba(100,150,255,0.9)"/><circle cx="68" cy="51" r="4" fill="#0d1a3a"/><circle cx="66.5" cy="49.5" r="1.5" fill="white"/><circle cx="80" cy="51" r="4" fill="#0d1a3a"/><circle cx="78.5" cy="49.5" r="1.5" fill="white"/><path d="M68 59 Q74 65 80 59" stroke="#0d1a3a" stroke-width="2.2" fill="none" stroke-linecap="round"/><rect x="70" y="74" width="8" height="8" rx="1" fill="rgba(255,215,0,0.85)"/><rect x="68" y="82" width="12" height="3" rx="1" fill="rgba(255,215,0,0.85)"/></svg>`,
                };
                const dueCount = getDueWords(words).length;
                const wrongCount = Object.keys(wrongCounts).filter(w => words.find(x => x.word === w) && wrongCounts[w] > 0).length;
                const games = [
                  { id: "normal",    num: 1, mascot: mascots.normal, catImg: COMBOCAT_1, icon: "📖", name: "释义选词",  desc: "看单词，选正确释义",       sub: "经典模式",   color: "#FF6B6B", btnColor: "rgba(0,0,0,0.12)" },
                  { id: "listen",    num: 2, mascot: mascots.listen, catImg: COMBOCAT_2, icon: "🎧", name: "听音辨词",  desc: "听发音，判断正确单词",     sub: "耳力训练",   color: "#45B7B8", btnColor: "rgba(0,0,0,0.12)" },
                  { id: "spell",     num: 3, mascot: mascots.spell,  catImg: COMBOCAT_3, icon: "✍️", name: "拼写练习",  desc: "看释义，打出完整单词",     sub: "手感养成",   color: "#FFD166", btnColor: "rgba(0,0,0,0.1)"  },
                  { id: "pair",      num: 4, mascot: mascots.pair,   catImg: COMBOCAT_4, icon: "🔗", name: "Combo配对", desc: "连击配对单词与释义",       sub: "连击模式",   color: "#6BCB77", btnColor: "rgba(0,0,0,0.12)" },
                  { id: "fill",      num: 5, mascot: mascots.fill,   catImg: COMBOCAT_5, icon: "📝", name: "句子填词",  desc: "看例句，选出缺失的单词",   sub: "语境记忆",   color: "#9B72CF", btnColor: "rgba(0,0,0,0.12)" },
                  { id: "wrong",     num: 6, mascot: mascots.wrong,  catImg: COMBOCAT_6, icon: "🎯", name: "错词研究",  desc: "专项攻克错误单词",         sub: wrongCount > 0 ? "🔥 立即挑战" : "暂无错词",  color: wrongCount > 0 ? "#FF8C42" : "#b0b0b0", btnColor: "rgba(0,0,0,0.12)", badge: wrongCount > 0 ? `⚡ ${wrongCount}词待攻克` : null },
                  { id: "battle",    num: 7, mascot: mascots.battle, catImg: COMBOCAT_7, icon: "⚡", name: "限时挑战",  desc: "60秒内答对最多题",         sub: "高压竞速",   color: "#FF6B9D", btnColor: "rgba(0,0,0,0.12)" },
                  { id: "review",    num: 8, mascot: mascots.review, catImg: COMBOCAT_8, icon: "🧠", name: "遗忘复习",  desc: "艾宾浩斯曲线追踪复习",    sub: dueCount > 0 ? `${dueCount}词待复习` : "记忆巩固", color: dueCount > 0 ? "#F6A623" : "#5BBFDE", btnColor: "rgba(0,0,0,0.1)", badge: dueCount > 0 ? `📅 ${dueCount}词到期` : null },
                  { id: "challenge", num: 9, mascot: mascots.challenge, catImg: COMBOCAT_9, icon: "👥", name: "好友挑战",  desc: "生成链接，发给朋友对战",   sub: "社交对战",   color: "#7C6CF5", btnColor: "rgba(0,0,0,0.12)" },
                ];
                const left = games.filter((_, i) => i % 2 === 0);
                const right = games.filter((_, i) => i % 2 === 1);
                const renderCard = (g, colIdx) => {
                  let touchStartY = 0, touchStartX = 0, touchMoved = false;
                  // stagger: left col uses odd steps, right col uses even steps
                  const delay = (g.num - 1) * 45;
                  return (
                    <div key={g.id}
                      onTouchStart={e => { touchStartY=e.touches[0].clientY; touchStartX=e.touches[0].clientX; touchMoved=false; }}
                      onTouchMove={e => { if(Math.abs(e.touches[0].clientY-touchStartY)>12||Math.abs(e.touches[0].clientX-touchStartX)>12) touchMoved=true; }}
                      onTouchEnd={e => {
                        if(touchMoved) return; e.preventDefault(); haptic("medium");
                        if(g.id==="pair"){startPairGame();setQuizLobby(false);}
                        else if(g.id==="fill"){startFillGame();}
                        else if(g.id==="challenge"){setShowCreateChallenge(true);setGeneratedLink("");setChallengeSelectedWords([]);}
                        else if(g.id==="battle"){setQuizMode("battle");setQuizLobby(false);if(!battleActive&&!showBattleResult)startBattle();}
                        else{setQuizMode(g.id);setQuizResult(null);setSpellingInput("");setHintRevealed(0);startQuiz(g.id);setQuizLobby(false);}
                      }}
                      onClick={() => {
                        haptic("medium");
                        if(g.id==="pair"){startPairGame();setQuizLobby(false);}
                        else if(g.id==="fill"){startFillGame();}
                        else if(g.id==="challenge"){setShowCreateChallenge(true);setGeneratedLink("");setChallengeSelectedWords([]);}
                        else if(g.id==="battle"){setQuizMode("battle");setQuizLobby(false);if(!battleActive&&!showBattleResult)startBattle();}
                        else{setQuizMode(g.id);setQuizResult(null);setSpellingInput("");setHintRevealed(0);startQuiz(g.id);setQuizLobby(false);}
                      }}
                      role="button"
                      className="game-card-btn game-card-enter"
                      style={{
                        width:"100%", fontFamily:"inherit", background: g.color,
                        borderRadius:20, marginBottom:10, cursor:"pointer",
                        position:"relative", overflow:"hidden", userSelect:"none",
                        display:"flex", flexDirection:"column",
                        boxShadow: `0 6px 20px ${g.color}55`,
                        minHeight: 160,
                        animationDelay: `${delay}ms`,
                      }}
                    >
                      {/* Badge (alert) */}
                      {g.badge && (
                        <div style={{ position:"absolute", top:10, left:"50%", transform:"translateX(-50%)", background:"#fff", borderRadius:20, padding:"3px 10px", fontSize:10, fontWeight:700, color:g.color, whiteSpace:"nowrap", boxShadow:"0 2px 8px rgba(0,0,0,0.12)", zIndex:3 }}>
                          {g.badge}
                        </div>
                      )}
                      {/* Big faded number */}
                      <div style={{ position:"absolute", top:-12, right:6, fontFamily:"DM Serif Display, serif", fontSize:88, fontWeight:900, lineHeight:1, color:"rgba(255,255,255,0.15)", userSelect:"none", pointerEvents:"none" }}>{g.num}</div>
                      {/* Mascot illustration */}
                      <img src={g.catImg} alt="Combo猫" decoding="async" style={{ position:"absolute", bottom:-4, right:-4, width:88, height:88, objectFit:"contain", pointerEvents:"none", zIndex:1, filter:"drop-shadow(0 4px 12px rgba(0,0,0,0.18))" }} />
                      {/* Content */}
                      <div style={{ padding:"20px 14px 14px", flex:1, position:"relative", zIndex:2, display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>
                        <div style={{ fontSize:22, marginBottom:5, lineHeight:1 }}>{g.icon}</div>
                        <div style={{ fontSize:16, fontWeight:800, color:"#fff", letterSpacing:"-0.3px", textShadow:"0 1px 3px rgba(0,0,0,0.15)", maxWidth:"68%", lineHeight:1.2 }}>{g.name}</div>
                      </div>
                    </div>
                  );
                };
                return (
                  <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                    <div style={{ flex:1 }}>{left.map((g, i) => renderCard(g, i))}</div>
                    <div style={{ flex:1 }}>{right.map((g, i) => renderCard(g, i))}</div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ── COMBO PAIR GAME ── */}
          {pairActive && (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <button onClick={endPairGame} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#aaa", padding: "4px 8px 4px 0" }}>✕</button>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {pairCombo >= 2 && (
                    <div style={{ fontSize: 11, fontWeight: 700, color: pairCombo >= 4 ? "#d97706" : "#0891b2", background: pairCombo >= 4 ? "#fffbeb" : "#e0f2fe", borderRadius: 8, padding: "4px 10px", animation: "unlockBadge 0.3s ease both" }}>
                      COMBO ×{pairCombo}
                    </div>
                  )}
                  <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 24, color: "#111" }}>{pairScore}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, background: pairTimer <= 20 ? "#fff5f5" : "#f5f5f5", borderRadius: 10, padding: "6px 12px" }}>
                    <span style={{ fontSize: 13 }}>⏱</span>
                    <span style={{ fontFamily: "DM Serif Display, serif", fontSize: 20, color: pairTimer <= 20 ? "#e53e3e" : "#111", transition: "color 0.3s" }}>{pairTimer}</span>
                  </div>
                </div>
              </div>
              <div style={{ height: 3, background: "#f0f0f0", borderRadius: 2, overflow: "hidden", marginBottom: 22 }}>
                <div style={{ height: "100%", background: pairTimer <= 20 ? "#e53e3e" : "#0891b2", borderRadius: 2, width: (pairTimer / 90 * 100) + "%", transition: "width 1s linear, background 0.3s" }} />
              </div>
              {!pairDone ? (
                <div>
                  <div style={{ fontSize: 11, color: "#aaa", letterSpacing: "1px", textAlign: "center", marginBottom: 16, textTransform: "uppercase" }}>点击左右配对匹配</div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                      {pairCards.filter(c => c.type === "word").map(card => (
                        <div key={card.id} onClick={() => handlePairTap(card)}
                          style={{ padding: "16px 12px", borderRadius: 14, textAlign: "center", cursor: card.matched ? "default" : "pointer",
                            background: card.matched ? "#f0faf4" : card.wrong ? "#fff0f0" : card.selected ? "#111" : "#fff",
                            border: "2px solid " + (card.matched ? "#2d8a4e" : card.wrong ? "#e53e3e" : card.selected ? "#111" : "#ebebeb"),
                            color: card.matched ? "#2d8a4e" : card.selected ? "#fff" : "#111",
                            fontFamily: "DM Serif Display, serif", fontSize: 15, letterSpacing: "-0.2px",
                            opacity: card.matched ? 0 : card.entering ? 0 : 1,
                            transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)",
                            transform: card.entering ? "scale(0.85) translateY(8px)" : card.selected ? "scale(1.04)" : "scale(1)" }}>
                          {card.text}
                        </div>
                      ))}
                    </div>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                      {pairCards.filter(c => c.type === "meaning").map(card => (
                        <div key={card.id} onClick={() => handlePairTap(card)}
                          style={{ padding: "16px 10px", borderRadius: 14, textAlign: "center", cursor: card.matched ? "default" : "pointer",
                            background: card.matched ? "#f0faf4" : card.wrong ? "#fff0f0" : card.selected ? "#0891b2" : "#fff",
                            border: "2px solid " + (card.matched ? "#2d8a4e" : card.wrong ? "#e53e3e" : card.selected ? "#0891b2" : "#ebebeb"),
                            color: card.matched ? "#2d8a4e" : card.selected ? "#fff" : "#555",
                            fontSize: 12, lineHeight: 1.4,
                            opacity: card.matched ? 0 : card.entering ? 0 : 1,
                            transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)",
                            transform: card.entering ? "scale(0.85) translateY(8px)" : card.selected ? "scale(1.04)" : "scale(1)" }}>
                          {card.text}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: "center" }}>
                  <div style={{ background: "#111", borderRadius: 20, padding: "28px 24px", color: "#fff", marginBottom: 20 }}>
                    <div style={{ fontSize: 11, letterSpacing: "3px", color: "#555", marginBottom: 16 }}>COMBO PAIR · 结果</div>
                    <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 72, color: pairTotalMatched >= 10 ? "#4ade80" : pairTotalMatched >= 5 ? "#facc15" : "#fff", lineHeight: 1 }}>{pairScore}</div>
                    <div style={{ fontSize: 13, color: "#555", marginTop: 6, marginBottom: 20 }}>
                      {pairTotalMatched >= 10 ? "🔥 词汇达人！" : pairTotalMatched >= 5 ? "⚡ 干得不错！" : "继续加油 💪"} · 配对 {pairTotalMatched} 对
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                      {[["配对数", pairTotalMatched + "对"], ["最高连击", "×" + pairMaxCombo], ["每秒得分", (pairScore / 60).toFixed(1)]].map(([label, val]) => (
                        <div key={label} style={{ background: "#1a1a1a", borderRadius: 10, padding: "10px 8px" }}>
                          <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 20, color: "#fff" }}>{val}</div>
                          <div style={{ fontSize: 10, color: "#555", marginTop: 3 }}>{label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button style={{ flex: 1, padding: "14px 0", background: "#111", color: "#fff", border: "none", borderRadius: 14, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }} onClick={startPairGame}>再来一局</button>
                    <button style={{ flex: 1, padding: "14px 0", background: "#f5f5f5", color: "#111", border: "none", borderRadius: 14, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }} onClick={endPairGame}>返回大厅</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── FILL-IN-THE-BLANK GAME ── */}
          {fillActive && fillQuestion && (
            <div>
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <button onClick={() => { setFillActive(false); setQuizLobby(true); }}
                  style={{ background: "#f5f5f5", border: "none", borderRadius: 10, padding: "6px 14px 6px 10px", fontSize: 12, color: "#555", cursor: "pointer", fontFamily: "inherit" }}>
                  ‹ 游戏大厅
                </button>
                <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 15, color: "#111" }}>句子填词</div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {fillCombo >= 2 && (
                    <div style={{ fontSize: 11, fontWeight: 700, color: fillCombo >= 5 ? "#d97706" : "#059669", background: fillCombo >= 5 ? "#fffbeb" : "#ecfdf5", borderRadius: 8, padding: "4px 10px", animation: "unlockBadge 0.3s ease both" }}>
                      COMBO ×{fillCombo}
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: "#aaa" }}>{fillTotal} 题</div>
                </div>
              </div>

              {/* Progress dots */}
              <div style={{ display: "flex", gap: 4, marginBottom: 24, flexWrap: "wrap" }}>
                {Array.from({ length: Math.min(fillTotal + 1, 12) }).map((_, i) => (
                  <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: i < fillTotal ? "#059669" : "#e0e0e0" }} />
                ))}
              </div>

              {/* Chinese meaning — hidden until answered */}
              {fillResult ? (
                <div style={{ fontSize: 13, color: fillResult === "correct" ? "#059669" : "#888", marginBottom: 10, letterSpacing: "0.3px", animation: "unlockBadge 0.3s ease both" }}>
                  🀄 {fillQuestion.meaning}
                </div>
              ) : (
                <div style={{ fontSize: 12, color: "#ddd", marginBottom: 10, letterSpacing: "0.3px", userSelect: "none" }}>
                  🀄 ···
                </div>
              )}

              {/* Sentence card */}
              <div style={{ background: "#fff", borderRadius: 18, padding: "24px 20px", marginBottom: 24, boxShadow: "0 2px 12px rgba(0,0,0,0.07)", minHeight: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 22, color: "#111", lineHeight: 1.6, textAlign: "center", letterSpacing: "-0.2px" }}>
                  {fillQuestion.sentence.split("___________").map((part, i, arr) => (
                    <span key={i}>
                      {part}
                      {i < arr.length - 1 && (
                        <span style={{
                          display: "inline-block", minWidth: 120, borderBottom: "3px solid",
                          borderColor: fillResult === "correct" ? "#059669" : fillResult === "wrong" ? "#e53e3e" : "#111",
                          margin: "0 4px", verticalAlign: "bottom", textAlign: "center",
                          color: fillResult === "correct" ? "#059669" : fillResult === "wrong" ? "#e53e3e" : "#111",
                          fontWeight: 700, fontSize: 22, transition: "all 0.2s",
                          paddingBottom: 2
                        }}>
                          {fillSelected || ""}
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>

              {/* Result feedback */}
              {fillResult && (
                <div style={{ marginBottom: 16, padding: "14px 18px", borderRadius: 14, textAlign: "center",
                  background: fillResult === "correct" ? "#f0faf4" : "#fff5f5",
                  border: "1.5px solid " + (fillResult === "correct" ? "#2d8a4e" : "#e53e3e"),
                  animation: "unlockBadge 0.3s ease both" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: fillResult === "correct" ? "#2d8a4e" : "#e53e3e", marginBottom: 4 }}>
                    {fillResult === "correct" ? "✓ 正确！" : "✗ 正确答案是：" + fillQuestion.answer}
                  </div>
                  {fillResult === "wrong" && (
                    <button onClick={nextFillQuestion}
                      style={{ marginTop: 8, padding: "10px 28px", borderRadius: 12, border: "none", background: "#111", color: "#fff", fontFamily: "inherit", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
                      下一题 →
                    </button>
                  )}
                </div>
              )}

              {/* Word tiles */}
              {!fillResult && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
                  {fillQuestion.options.map((opt, i) => (
                    <button key={i} onClick={() => handleFillTap(opt)}
                      className="fill-tile"
                      style={{ padding: "12px 22px", borderRadius: 14, border: "2.5px solid #e0e0e0", background: "#fff",
                        fontFamily: "DM Serif Display, serif", fontSize: 17, color: "#111", cursor: "pointer",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)", letterSpacing: "-0.3px" }}>
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {/* Score bar */}
              <div style={{ marginTop: 32, display: "flex", justifyContent: "space-around", padding: "14px 0", borderTop: "1px solid #f0f0f0" }}>
                {[["得分", fillScore], ["最高连击", "×" + fillMaxCombo], ["正确率", fillTotal > 0 ? Math.round(fillScore / fillTotal) + "%" : "—"]].map(([label, val]) => (
                  <div key={label} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 10, color: "#bbb", marginBottom: 3, letterSpacing: "0.5px", textTransform: "uppercase" }}>{label}</div>
                    <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 20, color: "#111" }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── ACTIVE QUIZ ── */}
          {!quizLobby && !pairActive && !fillActive && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <button onClick={() => { setQuizLobby(true); setBattleActive(false); setShowBattleResult(false); }}
                  style={{ background: "#f5f5f5", border: "none", borderRadius: 10, padding: "6px 14px 6px 10px", fontSize: 12, color: "#555", cursor: "pointer", fontFamily: "inherit" }}>
                  ‹ 游戏大厅
                </button>
                <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 16, color: "#111" }}>
                  {quizMode === "normal" ? "释义选词" : quizMode === "listen" ? "听音辨词" : quizMode === "spell" ? "拼写练习" : quizMode === "review" ? "遗忘复习" : quizMode === "wrong" ? "错词研究" : "限时挑战"}
                </div>
              </div>

              {quizMode === "review" && getDueWords(words).length === 0 && (
                <div style={{ textAlign: "center", padding: "48px 0" }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: "#111", marginBottom: 6 }}>今日复习完成</div>
                  <div style={{ fontSize: 13, color: "#888" }}>所有单词都在记忆中，明天再来巩固</div>
                </div>
              )}
              {quizMode === "wrong" && (() => {
                const allTracked = words
                  .filter(w => wrongCounts[w.word] && wrongCounts[w.word] > 0)
                  .sort((a, b) => (wrongCounts[b.word] || 0) - (wrongCounts[a.word] || 0));
                if (allTracked.length === 0) return (
                  <div style={{ textAlign: "center", padding: "48px 0" }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
                    <div style={{ fontSize: 15, fontWeight: 500, color: "#111", marginBottom: 6 }}>错词库是空的</div>
                    <div style={{ fontSize: 13, color: "#888" }}>做题时答错的词会自动加入这里</div>
                  </div>
                );
                const top20 = allTracked.slice(0, 20);
                const maxCount = wrongCounts[allTracked[0].word] || 1;
                const canTrain = wrongBank.length > 0;
                return (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <div style={{ fontSize: 12, color: "#777" }}>共 {allTracked.length} 个错词 · 前20重点训练</div>
                      <button onClick={() => startQuiz("wrong")} className="btn btn-dark btn-sm"
                        style={{ opacity: canTrain ? 1 : 0.4, pointerEvents: canTrain ? "auto" : "none" }}>
                        {canTrain ? "开始训练" : "已全部掌握 ✓"}
                      </button>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {top20.map((w, idx) => {
                        const count = wrongCounts[w.word] || 0;
                        const barW = Math.round(count / maxCount * 100);
                        const rankColor = idx === 0 ? "#e53e3e" : idx < 3 ? "#dd6b20" : idx < 10 ? "#d69e2e" : "#888";
                        const mastered = !wrongBank.includes(w.word);
                        return (
                          <div key={w.word} style={{ background: "#fff", border: "1px solid " + (mastered ? "#e8e8e8" : "#fee2e2"), borderRadius: 12, padding: "10px 14px", opacity: mastered ? 0.5 : 1 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 5 }}>
                              <div style={{ fontSize: 12, fontWeight: 700, color: mastered ? "#ccc" : rankColor, width: 22, textAlign: "center", flexShrink: 0 }}>{idx + 1}</div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <span style={{ fontFamily: "DM Serif Display, serif", fontSize: 15, color: "#111" }}>{w.word}</span>
                                <span style={{ fontSize: 11, color: "#aaa", marginLeft: 8 }}>{w.meaning}</span>
                              </div>
                              {mastered
                                ? <div style={{ fontSize: 11, color: "#22c55e", fontWeight: 600 }}>✓ 已掌握</div>
                                : <div style={{ flexShrink: 0, background: "#fff5f5", border: "1px solid #fecaca", borderRadius: 8, padding: "3px 8px", fontSize: 12, fontWeight: 700, color: "#e53e3e" }}>×{count}</div>
                              }
                            </div>
                            <div style={{ marginLeft: 32, height: 3, background: "#f0f0f0", borderRadius: 2, overflow: "hidden" }}>
                              <div style={{ height: "100%", borderRadius: 2, background: mastered ? "#22c55e" : rankColor, width: barW + "%" }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {(quizMode === "normal" || quizMode === "listen" || quizMode === "spell") && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 16 }}>
                  {allTags.map(tag => <span key={tag} className={"tag-pill " + (filterTag === tag ? "active" : "")} onClick={() => setFilterTag(tag)}>{tag}</span>)}
                </div>
              )}

              {quizState && (((quizMode === "normal" || quizMode === "listen" || quizMode === "spell") && (filterTag === "全部" ? words : words.filter(w => (w.tags||[]).includes(filterTag))).length >= 4) || (quizMode === "review" && getDueWords(words).length > 0) || (quizMode === "wrong" && wrongBank.length > 0)) && (
                <div>
                  {quizMode === "review" && (() => {
                    const w = words.find(x => x.word === quizState.question);
                    const level = w?.reviewLevel || 0;
                    const nextDays = REVIEW_INTERVALS[Math.min(level + 1, REVIEW_INTERVALS.length - 1)];
                    return (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                        <div style={{ fontSize: 11, color: "#888" }}>复习间隔</div>
                        <div style={{ display: "flex", gap: 3 }}>{REVIEW_INTERVALS.map((_, i) => <div key={i} style={{ width: 20, height: 4, borderRadius: 2, background: i <= level ? "#111" : "#e8e8e8" }} />)}</div>
                        <div style={{ fontSize: 11, color: "#888" }}>答对后 {nextDays} 天后复习</div>
                      </div>
                    );
                  })()}

                  {quizState.isSpell ? (
                    <div>
                      <div style={{ fontSize: 11, color: "#aaa", marginBottom: 10, letterSpacing: "0.5px", textTransform: "uppercase" }}>看释义，拼出英文单词</div>
                      <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 22, color: "#111", marginBottom: 8, lineHeight: 1.3 }}>{quizState.question}</div>

                      {quizState.example && (
                        <div style={{ fontSize: 13, color: "#aaa", fontStyle: "italic", marginBottom: 16, lineHeight: 1.6, background: "#f9f9f9", borderRadius: 10, padding: "10px 14px", borderLeft: "3px solid #e0e0e0" }}>
                          {quizResult ? quizState.example : quizState.example.replace(new RegExp(quizState.correct, "gi"), "＿".repeat(quizState.correct.length))}
                        </div>
                      )}

                      {/* Letter boxes */}
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 14 }}>
                        {quizState.correct.split("").map((letter, i) => {
                          const isHinted = i < hintRevealed;
                          const typed = spellingInput[i] || "";
                          const isDone = !!quizResult;
                          const isCorrectLetter = typed.toLowerCase() === letter.toLowerCase();
                          let bg = "#f5f5f5", borderColor = "#e0e0e0", color = "#bbb";
                          if (isHinted) { bg = "#fffbec"; borderColor = "#c8900a"; color = "#c8900a"; }
                          else if (isDone && quizResult === "correct") { bg = "#f0faf4"; borderColor = "#2d8a4e"; color = "#2d8a4e"; }
                          else if (isDone && quizResult === "wrong" && typed) {
                            bg = isCorrectLetter ? "#f0faf4" : "#fff5f5";
                            borderColor = isCorrectLetter ? "#2d8a4e" : "#e53e3e";
                            color = isCorrectLetter ? "#2d8a4e" : "#e53e3e";
                          } else if (!isDone && typed) { bg = "#fff8ee"; borderColor = "#FF8000"; color = "#111"; }
                          return (
                            <div key={i} style={{ width: 28, height: 34, borderRadius: 7, background: bg, border: "2px solid " + borderColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color, fontFamily: "DM Serif Display, serif", transition: "all 0.15s" }}>
                              {isHinted ? letter : (typed || "")}
                            </div>
                          );
                        })}
                        {!spellingInput && !quizResult && (
                          <div style={{ fontSize: 11, color: "#ccc", alignSelf: "center", marginLeft: 4 }}>{quizState.correct.length} 个字母</div>
                        )}
                      </div>

                      {/* Input + buttons (before submit) */}
                      {!quizResult && (() => {
                        const isComplete = spellingInput.trim().length >= quizState.correct.length;
                        return (
                          <div>
                            {/* ✅ Confirm button ABOVE input — always visible above keyboard */}
                            {isComplete && (
                              <button onClick={() => { if (spellingInput.trim()) submitSpelling(); }}
                                style={{ width: "100%", padding: "15px 0", borderRadius: 14, border: "none", fontFamily: "inherit", fontWeight: 700, fontSize: 16, marginBottom: 10,
                                  background: "linear-gradient(135deg,#FF8000,#FFB347)",
                                  color: "#fff",
                                  transition: "all 0.2s", cursor: "pointer", boxShadow: "0 4px 14px rgba(255,128,0,0.35)" }}>
                                ✓  确认答案
                              </button>
                            )}
                            <div style={{ display: "flex", gap: 8 }}>
                              <input
                                value={spellingInput}
                                onChange={e => {
                                  const val = e.target.value.replace(/[^a-zA-Z\-']/g, "");
                                  setSpellingInput(val);
                                  // Auto-submit when full length reached — pass val directly to avoid stale state
                                  if (val.length >= quizState.correct.length) {
                                    setTimeout(() => {
                                      const isCorrect = val.trim().toLowerCase() === quizState.correct.toLowerCase();
                                      haptic(isCorrect ? "success" : "error");
                                      setQuizResult(isCorrect ? "correct" : "wrong");
                                      setScore(s => ({ correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 }));
                                      updateGlobalCombo(isCorrect);
                                      if (isCorrect) {
                                        try { const d = JSON.parse(localStorage.getItem("wv_today_correct")||"{}"); const todayKey2 = new Date().toISOString().slice(0,10); localStorage.setItem("wv_today_correct", JSON.stringify({ date: todayKey2, count: (d.date===todayKey2?d.count:0)+1 })); } catch {}
                                        setTimeout(() => { setSpellingInput(""); setHintRevealed(0); setQuizResult(null); startQuiz(); }, 1200);
                                      }
                                    }, 280);
                                  }
                                }}
                                placeholder=""
                                maxLength={quizState.correct.length + 1}
                                autoCapitalize="none" autoCorrect="off" spellCheck={false}
                                onKeyDown={e => { if (e.key === "Enter" && spellingInput.trim()) submitSpelling(); }}
                                style={{ flex: 1, fontSize: 18, fontWeight: 600, letterSpacing: "3px", textAlign: "center", borderRadius: 12, border: "2px solid #e0e0e0", padding: "12px 10px", fontFamily: "DM Serif Display, serif", background: "#fff", boxSizing: "border-box", outline: "none" }} onFocus={e => e.target.style.borderColor="#FF8000"} onBlur={e => e.target.style.borderColor="#e0e0e0"}
                              />
                              <button onClick={() => setHintRevealed(h => Math.min(h + 1, quizState.correct.length))}
                                style={{ padding: "12px 14px", borderRadius: 12, border: "1.5px solid #e0e0e0", background: "#fff", color: "#888", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
                                💡 提示
                              </button>
                            </div>
                          </div>
                        );
                      })()}

                      {/* ✅ Correct — show 下一题 next to meaning */}
                      {quizResult === "correct" && (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f0faf4", border: "2px solid #2d8a4e", borderRadius: 14, padding: "12px 16px", animation: "unlockBadge 0.3s ease both" }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#2d8a4e" }}>✓ 拼写正确！</div>
                          <button className="btn btn-dark" onClick={() => { setSpellingInput(""); setHintRevealed(0); setQuizResult(null); startQuiz(); }} style={{ padding: "4px 14px", fontSize: 12, borderRadius: 20 }}>下一题 →</button>
                        </div>
                      )}

                      {/* ❌ Wrong — show answer only, then next button */}
                      {quizResult === "wrong" && (
                        <div>
                          <div style={{ background: "#fff5f5", border: "2px solid #e53e3e", borderRadius: 14, padding: "16px 18px", marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div>
                              <div style={{ fontSize: 12, color: "#e53e3e", fontWeight: 600, marginBottom: 6 }}>✗ 拼写有误，正确答案：</div>
                              <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 26, color: "#111", letterSpacing: "2px", fontWeight: 700 }}>{quizState.correct}</div>
                            </div>
                            <button className="btn btn-dark" onClick={() => { setSpellingInput(""); setHintRevealed(0); setQuizResult(null); startQuiz(); }} style={{ padding: "6px 16px", fontSize: 13, borderRadius: 20, flexShrink: 0 }}>下一题 →</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : quizState.isListen ? (
                    <div>
                      <div style={{ marginBottom: 16, textAlign: "center" }}>
                        <button onClick={() => speak(quizState.question)} style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#FF8000,#FFB347)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px", transition: "transform 0.1s", boxShadow: "0 6px 20px rgba(255,128,0,0.4)" }} onMouseDown={e => e.currentTarget.style.transform = "scale(0.93)"} onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}>
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                        </button>
                        <div style={{ fontSize: 12, color: "#aaa" }}>点击喇叭播放，可重复收听</div>
                        {quizResult && <div style={{ marginTop: 16, padding: "12px 20px", background: "#f7f7f7", borderRadius: 12, display: "block", position: "relative" }}>
                          <button className="btn btn-dark" onClick={() => startQuiz()} style={{ position: "absolute", top: 10, right: 12, padding: "4px 12px", fontSize: 12, borderRadius: 20 }}>下一题 →</button>
                          <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 28, color: "#111" }}>{quizState.question}</div>
                          <div style={{ fontSize: 13, color: "#777", marginTop: 4 }}>{quizState.meaning}</div>
                          {quizState.example && <div style={{ fontSize: 12, color: "#aaa", fontStyle: "italic", marginTop: 4 }}>{quizState.example}</div>}
                        </div>}
                      </div>
                      <div key={quizState.question + quizState.options.join()}>
                        {quizState.options.map((opt, i) => { let cls = "opt-btn"; if (quizResult) { if (opt === quizState.correct) cls += " correct"; else if (quizResult === "wrong") cls += " wrong"; } return <button key={i} className={cls} disabled={!!quizResult} onClick={e => { e.currentTarget.blur(); handleMCQ(opt); }}><span style={{ color: "#777", marginRight: 10, fontSize: 12, fontWeight: 500 }}>{String.fromCharCode(65+i)}</span>{opt}</button>; })}
                      </div>
                      {quizResult && quizResult !== "correct" && <div style={{ marginTop: 16, textAlign: "center" }}><div style={{ fontSize: 14, fontWeight: 500, color: "#e53e3e" }}>正确答案：{quizState.correct}</div></div>}
                    </div>
                  ) : (
                    <div>
                      <div style={{ marginBottom: 28 }}>
                        <div style={{ fontSize: 11, color: "#777", marginBottom: 10, letterSpacing: "0.5px", textTransform: "uppercase" }}>选择正确的中文释义</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, position: "relative" }}>
                          <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 36, color: "#111", lineHeight: 1.1 }}>{quizState.question}</div>
                          <button onClick={() => speak(quizState.question)} style={{ background: "#f2f2f2", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, color: "#444", padding: "4px 10px", fontWeight: 500 }}>▶</button>
                          {quizResult && <button className="btn btn-dark" onClick={() => startQuiz()} style={{ position: "absolute", top: 0, right: 0, padding: "4px 12px", fontSize: 12, borderRadius: 20 }}>下一题 →</button>}
                        </div>
                        {quizState.example && <div style={{ fontSize: 13, color: "#777", fontStyle: "italic", lineHeight: 1.5 }}>{quizState.example}</div>}
                      </div>
                      <div key={quizState.question + quizState.options.join()}>
                        {quizState.options.map((opt, i) => { let cls = "opt-btn"; if (quizResult) { if (opt === quizState.correct) cls += " correct"; else if (quizResult === "wrong") cls += " wrong"; } return <button key={i} className={cls} disabled={!!quizResult} onClick={e => { e.currentTarget.blur(); handleMCQ(opt); }}><span style={{ color: "#777", marginRight: 10, fontSize: 12, fontWeight: 500 }}>{String.fromCharCode(65+i)}</span>{opt}</button>; })}
                      </div>
                      {quizResult && quizResult !== "correct" && <div style={{ marginTop: 16, textAlign: "center" }}><div style={{ fontSize: 14, fontWeight: 500, color: "#e53e3e" }}>答案是：{quizState.correct}</div></div>}
                    </div>
                  )}
                </div>
              )}

              {(quizMode === "normal" || quizMode === "listen" || quizMode === "spell") && (filterTag === "全部" ? words : words.filter(w => (w.tags||[]).includes(filterTag))).length < 4 && (
                <div style={{ textAlign: "center", padding: "60px 0" }}>
                  <div style={{ fontSize: 14, marginBottom: 16, color: "#777" }}>至少需要 4 个单词才能测验</div>
                  <button className="btn btn-dark btn-sm" onClick={() => setTab(1)}>去添加单词</button>
                </div>
              )}

              {quizMode === "battle" && !showBattleResult && (
                <div>
                  {!battleActive && !battleQuestion ? (
                    <div style={{ textAlign: "center", padding: "40px 0" }}>
                      <div style={{ fontSize: 52, marginBottom: 12 }}>⚡</div>
                      <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 26, color: "#111", marginBottom: 8 }}>限时挑战</div>
                      <div style={{ fontSize: 14, color: "#888", marginBottom: 32, lineHeight: 1.7 }}>60 秒内答对尽可能多的题<br/>结束后生成战绩图分享给朋友</div>
                      <button className="btn btn-dark" style={{ padding: "14px 40px", fontSize: 16, borderRadius: 12 }} onClick={startBattle}>开始挑战</button>
                    </div>
                  ) : battleActive && battleQuestion ? (
                    <div>
                      <div style={{ marginBottom: 20 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}><span style={{ fontFamily: "DM Serif Display, serif", fontSize: 42, color: battleTimeLeft <= 10 ? "#e53e3e" : "#111", lineHeight: 1, transition: "color 0.3s" }}>{battleTimeLeft}</span><span style={{ fontSize: 13, color: "#aaa" }}>秒</span></div>
                          <div style={{ textAlign: "right" }}><div style={{ fontFamily: "DM Serif Display, serif", fontSize: 28, color: "#111" }}>{battleStats.correct}</div><div style={{ fontSize: 11, color: "#aaa" }}>答对 / {battleStats.total} 题</div></div>
                        </div>
                        <div style={{ height: 5, background: "#f0f0f0", borderRadius: 3, overflow: "hidden" }}><div style={{ height: "100%", width: (battleTimeLeft / 60 * 100) + "%", background: battleTimeLeft <= 10 ? "#e53e3e" : "#111", transition: "width 1s linear, background 0.3s" }} /></div>
                      </div>
                      <div style={{ marginBottom: 24 }}>
                        <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 36, color: "#111", marginBottom: 6, lineHeight: 1.1 }}>{battleQuestion.question}</div>
                        {battleQuestion.example && <div style={{ fontSize: 13, color: "#aaa", fontStyle: "italic" }}>{battleQuestion.example}</div>}
                      </div>
                      <div key={battleQuestion.question + battleQuestion.options.join()}>
                        {battleQuestion.options.map((opt, i) => { let bg = "#fafafa", border = "#ebebeb", color = "#111"; if (battleAnswered) { if (opt === battleQuestion.correct) { bg = "#f0faf4"; border = "#2d8a4e"; color = "#2d8a4e"; } else if (battleAnswered === "wrong") { bg = "#fff5f5"; border = "#e53e3e"; color = "#e53e3e"; } } return <button key={i} disabled={!!battleAnswered} onClick={e => { e.currentTarget.blur(); handleBattleMCQ(opt); }} style={{ width: "100%", background: bg, border: "1.5px solid " + border, borderRadius: 10, padding: "13px 16px", textAlign: "left", fontFamily: "inherit", fontSize: 14, color, cursor: battleAnswered ? "default" : "pointer", marginBottom: 8, transition: "all 0.15s" }}><span style={{ color: battleAnswered ? "inherit" : "#aaa", marginRight: 10, fontSize: 12, fontWeight: 500, opacity: 0.7 }}>{String.fromCharCode(65+i)}</span>{opt}</button>; })}
                      </div>
                      <div style={{ marginTop: 16, textAlign: "center" }}><button onClick={endBattle} style={{ background: "none", border: "none", color: "#ccc", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>结束挑战</button></div>
                    </div>
                  ) : null}
                </div>
              )}

              {quizMode === "battle" && showBattleResult && battleFinalStats && (
                <div>
                  <div style={{ background: "#0f0f0f", borderRadius: 16, padding: "28px 24px", marginBottom: 16, color: "#fff" }}>
                    <div style={{ fontSize: 11, letterSpacing: "2px", color: "#666", marginBottom: 16, fontWeight: 600 }}>WORDCOMBO · 限时挑战</div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 20 }}>
                      <span style={{ fontFamily: "DM Serif Display, serif", fontSize: 72, lineHeight: 1, color: battleFinalStats.total > 0 && Math.round(battleFinalStats.correct / battleFinalStats.total * 100) >= 80 ? "#4ade80" : battleFinalStats.total > 0 && Math.round(battleFinalStats.correct / battleFinalStats.total * 100) >= 60 ? "#facc15" : "#f87171" }}>{battleFinalStats.correct}</span>
                      <span style={{ fontSize: 20, color: "#555" }}>/ {battleFinalStats.total} 题</span>
                    </div>
                    <div style={{ display: "flex" }}>{[["正确率", battleFinalStats.total > 0 ? Math.round(battleFinalStats.correct / battleFinalStats.total * 100) + "%" : "0%"], ["用时", "60 秒"], ["词库", words.length + " 词"]].map(([label, val]) => <div key={label} style={{ flex: 1 }}><div style={{ fontSize: 11, color: "#555", marginBottom: 4 }}>{label}</div><div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>{val}</div></div>)}</div>
                    {battleFinalStats.words.filter(w => !w.correct).length > 0 && <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #222" }}><div style={{ fontSize: 11, color: "#444", marginBottom: 8 }}>需加强</div><div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>{battleFinalStats.words.filter(w => !w.correct).slice(0, 6).map((w, i) => <span key={i} style={{ fontSize: 12, padding: "3px 10px", borderRadius: 20, background: "#1a1a1a", color: "#f87171", border: "1px solid #2a2a2a", fontFamily: "DM Serif Display, serif" }}>{w.word}</span>)}</div></div>}
                  </div>
                  <canvas ref={battleCanvasRef} style={{ display: "none" }} />
                  <div style={{ display: "flex", gap: 10 }}>
                    <button className="btn btn-dark" style={{ flex: 1 }} onClick={() => { drawBattleCard(); setTimeout(() => { const canvas = battleCanvasRef.current; if (!canvas) return; const link = document.createElement("a"); link.download = "wordcombo-battle.png"; link.href = canvas.toDataURL("image/png"); link.click(); }, 100); }}>保存战绩图</button>
                    <button className="btn btn-outline" style={{ flex: 1 }} onClick={startBattle}>再战一局</button>
                  </div>
                </div>
              )}
            </div>
          )}
          </div>
        )}

        {/* Tab 3 */}
        {tab === 3 && (
          <div style={{ maxWidth: 480 }}>

            {/* XP Bar */}
            {(() => {
              const level = Math.floor(xp / 100) + 1;
              const progress = xp % 100;
              return (
                <div style={{ background: "linear-gradient(135deg, #FF8000, #FFB347)", borderRadius: 16, padding: "16px 20px", marginBottom: 24, display: "flex", alignItems: "center", gap: 14, boxShadow: "0 6px 20px rgba(255,128,0,0.35)" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 18, color: "#fff" }}>Lv{level}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <div style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>{xp} XP</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)" }}>下一级 {100 - progress} XP</div>
                    </div>
                    <div style={{ height: 5, background: "rgba(255,255,255,0.3)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: progress + "%", background: "#fff", borderRadius: 3, transition: "width 0.6s cubic-bezier(0.34,1.56,0.64,1)" }} />
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Task Tabs */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {[["daily","每日任务"]].map(([key, label]) => (
                <button key={key} onClick={() => setTaskTab(key)}
                  style={{ flex: 1, padding: "9px 0", borderRadius: 10, border: "1.5px solid " + (taskTab === key ? "#FF8000" : "#e8e8e8"), background: taskTab === key ? "linear-gradient(135deg,#FF8000,#FFB347)" : "#fff", color: taskTab === key ? "#fff" : "#888", fontFamily: "inherit", fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.15s", boxShadow: taskTab === key ? "0 4px 12px rgba(255,128,0,0.3)" : "none" }}>
                  {label}
                  {key === "daily" && (() => {
                    const ctx = getTaskCtx();
                    const claimable = TASKS.filter(t => t.type === "daily" && !isTaskDone(t) && t.progress(ctx) >= t.target).length;
                    return claimable > 0 ? <span style={{ marginLeft: 6, background: "#e53e3e", color: "#fff", borderRadius: 10, padding: "1px 6px", fontSize: 10 }}>{claimable}</span> : null;
                  })()}
                </button>
              ))}
            </div>

            {/* Task List — 4-per-row grid for daily, list for achievement */}
            <div style={{ marginBottom: 28 }}>
              {(() => {
                const ctx = getTaskCtx();
                const tasks = TASKS.filter(t => t.type === taskTab);
                if (taskTab === "daily") {
                  return (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, width: "100%" }}>
                      {tasks.map(task => {
                        const done = isTaskDone(task);
                        const prog = Math.min(task.progress(ctx), task.target);
                        const pct = Math.round(prog / task.target * 100);
                        const claimable = !done && prog >= task.target;
                        return (
                          <div key={task.id}
                            onClick={() => claimable && claimTask(task)}
                            style={{
                              borderRadius: 16, padding: "12px 8px 10px",
                              background: done ? "linear-gradient(135deg,#6BCB77,#8FD16A)" : claimable ? "#fff8ee" : "#fff",
                              border: "1.5px solid " + (done ? "transparent" : claimable ? "#FF8000" : "#ebebeb"),
                              opacity: 1, transition: "all 0.2s",
                              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                              cursor: claimable ? "pointer" : "default",
                              boxShadow: done ? "0 4px 14px rgba(107,203,119,0.45)" : claimable ? "0 4px 12px rgba(255,128,0,0.15)" : "0 2px 8px rgba(0,0,0,0.05)",
                              aspectRatio: "1",
                            }}>
                            {/* Icon */}
                            <div style={{ fontSize: 26, lineHeight: 1 }}>{task.icon}</div>
                            {/* Title */}
                            <div style={{ fontSize: 10, fontWeight: 700, color: done ? "#fff" : "#111", textAlign: "center", lineHeight: 1.2 }}>{task.title}</div>
                            {/* Progress ring / bar */}
                            <div style={{ width: "100%", height: 3, background: done ? "rgba(255,255,255,0.3)" : "#f0f0f0", borderRadius: 2, overflow: "hidden" }}>
                              <div style={{ height: "100%", width: pct + "%", background: done ? "#fff" : "#FF8000", borderRadius: 2, transition: "width 0.5s ease" }} />
                            </div>
                            {/* XP or done */}
                            {done
                              ? <div style={{ fontSize: 9, fontWeight: 800, color: "#fff" }}>✓ 完成</div>
                              : <div style={{ fontSize: 9, fontWeight: 700, color: "#FF8000", background: "rgba(255,128,0,0.1)", borderRadius: 6, padding: "2px 6px" }}>+{task.xp} XP</div>
                            }
                          </div>
                        );
                      })}
                    </div>
                  );
                }
                // Achievement tab: keep list layout
                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {tasks.map(task => {
                      const done = isTaskDone(task);
                      const prog = Math.min(task.progress(ctx), task.target);
                      const pct = Math.round(prog / task.target * 100);
                      const claimable = !done && prog >= task.target;
                      return (
                        <div key={task.id} style={{ border: "1.5px solid " + (done ? "#ffe0b2" : claimable ? "#FF8000" : "#ebebeb"), borderRadius: 14, padding: "14px 16px", background: done ? "#fff8ee" : "#fff", opacity: done ? 0.85 : 1, transition: "all 0.2s" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ fontSize: 28, flexShrink: 0, width: 40, textAlign: "center" }}>{task.icon}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                                <div style={{ fontSize: 14, fontWeight: 600, color: done ? "#FF8000" : "#111" }}>{task.title}</div>
                                {done && <span style={{ fontSize: 11, color: "#FF8000" }}>✓ 已完成</span>}
                              </div>
                              <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>{task.desc}</div>
                              <div style={{ height: 4, background: "#f0f0f0", borderRadius: 2, overflow: "hidden", marginBottom: 4 }}>
                                <div style={{ height: "100%", width: pct + "%", background: done ? "#FF8000" : claimable ? "#FF8000" : "#ddd", borderRadius: 2, transition: "width 0.5s ease" }} />
                              </div>
                              <div style={{ fontSize: 11, color: "#aaa" }}>{prog} / {task.target}</div>
                            </div>
                            <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                              <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", background: "linear-gradient(135deg,#FF8000,#FFB347)", borderRadius: 8, padding: "3px 8px" }}>+{task.xp} XP</div>
                              {claimable && (
                                <button onClick={() => claimTask(task)}
                                  style={{ background: "linear-gradient(135deg,#FF8000,#FFB347)", color: "#fff", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                                  领取
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
            <div style={{ background: "linear-gradient(135deg,#45B7B8,#5dd6d7)", borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: "0 6px 20px #45B7B844" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 22, color: "#fff" }}>
                    {todayWords >= dailyGoal ? "目标完成 ✓" : `今天还差 ${Math.max(0, dailyGoal - todayWords)} 个单词`}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 3 }}>已添加 {todayWords} / 目标 {dailyGoal} 个新单词</div>
                </div>
                {!editingGoal ? (
                  <button className="btn btn-outline btn-sm" onClick={() => { setTempGoal(dailyGoal); setEditingGoal(true); }}>修改目标</button>
                ) : (
                  <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    <input
                      type="number" min="1" max="50"
                      value={tempGoal === 0 ? "" : tempGoal}
                      onChange={e => {
                        const val = e.target.value;
                        if (val === "" || val === "0") { setTempGoal(0); return; }
                        const n = parseInt(val);
                        if (!isNaN(n)) setTempGoal(Math.min(50, n));
                      }}
                      onBlur={e => { if (!tempGoal || tempGoal < 1) setTempGoal(1); }}
                      style={{ width: 64, textAlign: "center", padding: "6px 8px", fontSize: 16, fontWeight: 500 }}
                    />
                    <button className="btn btn-dark btn-sm" onClick={() => {
                      const g = Math.max(1, Math.min(50, tempGoal || 1));
                      setDailyGoal(g);
                      setTempGoal(g);
                      localStorage.setItem("wv_daily_goal", g);
                      setEditingGoal(false);
                      showMsg("目标已保存");
                    }}>保存</button>
                    <button className="btn btn-outline btn-sm" onClick={() => { setTempGoal(dailyGoal); setEditingGoal(false); }}>取消</button>
                  </div>
                )}
              </div>

              {/* Word goal progress bar */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(255,255,255,0.85)", marginBottom: 6 }}>
                  <span>新增单词</span>
                  <span>{todayWords}/{dailyGoal}</span>
                </div>
                <div style={{ height: 8, background: "rgba(255,255,255,0.25)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min(100, todayWords / dailyGoal * 100)}%`, background: todayWords >= dailyGoal ? "#fff" : "rgba(255,255,255,0.7)", borderRadius: 4, transition: "width 0.4s" }} />
                </div>
              </div>

              {/* Quiz goal progress bar */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(255,255,255,0.85)", marginBottom: 6 }}>
                  <span>今日答题</span>
                  <span>{todayQuizzes}/{dailyGoal * 4}</span>
                </div>
                <div style={{ height: 8, background: "rgba(255,255,255,0.25)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min(100, todayQuizzes / (dailyGoal * 4) * 100)}%`, background: todayQuizzes >= dailyGoal * 4 ? "#fff" : "rgba(255,255,255,0.7)", borderRadius: 4, transition: "width 0.4s" }} />
                </div>
              </div>

              {todayWords >= dailyGoal && todayQuizzes >= dailyGoal * 4 && (
                <div style={{ marginTop: 14, fontSize: 13, color: "#2d8a4e", fontWeight: 500, textAlign: "center" }}>
                   今日所有目标已完成！
                </div>
              )}
            </div>

            {/* Stats */}
            {/* Review Stats */}
            {(() => {
              const due = getDueWords(words);
              const wrongCount = Object.keys(wrongCounts).filter(w => words.find(x => x.word === w) && wrongCounts[w] > 0).length;
              if (due.length === 0 && wrongCount === 0) return null;
              return (
                <div style={{ marginBottom: 28 }}>
                  <div style={{ display: "flex", gap: 10 }}>
                    {due.length > 0 && (
                      <div onClick={() => { setQuizMode("review"); setTab(2); startQuiz("review"); }}
                        style={{ flex: 1, border: "1.5px solid #45B7B8", borderRadius: 12, padding: 14, background: "#45B7B818", cursor: "pointer" }}>
                        <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 28, color: "#45B7B8" }}>{due.length}</div>
                        <div style={{ fontSize: 11, color: "#45B7B8", fontWeight: 600 }}>词待复习</div>
                        <div style={{ fontSize: 10, color: "#45B7B8", marginTop: 4 }}>点击开始</div>
                      </div>
                    )}
                    {wrongCount > 0 && (
                      <div onClick={() => { setQuizMode("wrong"); setTab(2); startQuiz("wrong"); }}
                        style={{ flex: 1, border: "1.5px solid #DC7286", borderRadius: 12, padding: 14, background: "#DC728618", cursor: "pointer" }}>
                        <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 28, color: "#DC7286" }}>{wrongCount}</div>
                        <div style={{ fontSize: 11, color: "#DC7286", fontWeight: 600 }}>词在错词库</div>
                        <div style={{ fontSize: 10, color: "#DC7286", marginTop: 4 }}>点击开始</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            <div className="sec-title">学习概览</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 28 }}>
              {[["单词总数", words.length], ["答题总数", score.total], ["正确率", score.total ? correctRate+"%" : "—"], ["连续天数", streakData.count + "天"]].map(([label, val]) => (
                <div key={label} style={{ border: "1px solid #ebebeb", borderRadius: 10, padding: 16 }}>
                  <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 30, color: "#111" }}>{val}</div>
                  <div style={{ fontSize: 11, color: "#666", marginTop: 4, fontWeight: 500, letterSpacing: "0.3px" }}>{label}</div>
                </div>
              ))}
            </div>

            <div className="sec-title">掌握情况</div>
            {words.length === 0 ? <div style={{ color: "#888", fontSize: 14 }}>还没有单词</div> : (() => {
              const groups = {};
              words.forEach(w => {
                const tags = (w.tags || []).length > 0 ? w.tags : ["未分类"];
                tags.forEach(t => {
                  if (!groups[t]) groups[t] = [];
                  if (!groups[t].find(x => x.id === w.id)) groups[t].push(w);
                });
              });
              return Object.entries(groups).map(([tag, tagWords]) => {
                const avgMastery = Math.round(tagWords.reduce((s, w) => s + w.mastery, 0) / tagWords.length);
                const masteredCount = tagWords.filter(w => w.mastery >= 4).length;
                const isOpen = expandedMasteryGroup === tag;
                return (
                  <div key={tag} style={{ marginBottom: 10, border: "1px solid #ebebeb", borderRadius: 12, overflow: "hidden" }}>
                    <div onClick={() => setExpandedMasteryGroup(isOpen ? null : tag)}
                      style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", cursor: "pointer", background: isOpen ? "#fafafa" : "#fff" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <span style={{ fontSize: 14, fontWeight: 500, color: "#111" }}>{tag}</span>
                          <span style={{ fontSize: 11, color: "#aaa" }}>{tagWords.length} 个单词</span>
                          <span style={{ fontSize: 11, color: "#2d8a4e", marginLeft: "auto" }}>已掌握 {masteredCount}/{tagWords.length}</span>
                        </div>
                        <div className="mastery-bar" style={{ height: 5 }}>
                          <div style={{ height: "100%", width: avgMastery/5*100 + "%", background: "#111", borderRadius: 2, transition: "width 0.3s" }} />
                        </div>
                      </div>
                      <span style={{ fontSize: 11, color: "#bbb", marginLeft: 8 }}>{isOpen ? "▲" : "▼"}</span>
                    </div>
                    {isOpen && (
                      <div style={{ borderTop: "1px solid #f2f2f2", padding: "8px 16px 12px" }}>
                        {tagWords.map(w => (
                          <div key={w.id} style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 10 }}>
                            <div style={{ width: 110, fontSize: 13, fontFamily: "DM Serif Display, serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#111", flexShrink: 0 }}>{w.word}</div>
                            <div style={{ flex: 1 }}>
                              <div className="mastery-bar" style={{ height: 4 }}>
                                <div style={{ height: "100%", width: w.mastery/5*100 + "%", background: masteryColor(w.mastery), transition: "width 0.3s" }} />
                              </div>
                            </div>
                            <div style={{ fontSize: 11, color: masteryColor(w.mastery), width: 28, textAlign: "right", fontWeight: 500 }}>{masteryLabel(w.mastery)}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              });
            })()}
          </div>
        )}

        {/* Tab 4 */}
        {tab === 4 && (
          <div style={{ maxWidth: 480, display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Profile Card */}
            {profile && (
              <div>
                <div style={{ background: "linear-gradient(135deg,#45B7B8,#5dd6d7)", borderRadius: 20, padding: 24, color: "#fff", position: "relative", boxShadow: "0 8px 24px rgba(69,183,184,0.4)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                    <SpriteAvatar id={profile.avatar} size={64} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 22, color: "#fff", marginBottom: 3 }}>{profile.name}</div>
                      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>加入于 {profile.joinDate}</div>
                    </div>
                    <button onClick={() => { setSetupAvatar(profile.avatar); setSetupName(profile.name); setSetupBirthYear(profile.birthYear||""); setSetupBirthMonth(profile.birthMonth||""); setSetupOccupation(profile.occupation||""); setShowAvatarPicker(false); setEditingProfile(true); }}
                      style={{ background: "rgba(255,255,255,0.22)", border: "1px solid rgba(255,255,255,0.4)", borderRadius: 8, color: "#fff", fontSize: 12, padding: "6px 12px", cursor: "pointer", fontFamily: "inherit" }}>编辑</button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                    {[
                      ["词库", words.length + " 词"],
                      ["连续", streakData.count + " 天"],
                      ["正确率", (score.total ? Math.round(score.correct/score.total*100) : 0) + "%"],
                    ].map(([label, val]) => (
                      <div key={label} style={{ background: "rgba(255,255,255,0.18)", borderRadius: 12, padding: "12px 10px", textAlign: "center" }}>
                        <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 20, color: "#fff", marginBottom: 2 }}>{val}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>{label}</div>
                      </div>
                    ))}
                  </div>
                  {/* Rank badge — tap to open rank sheet */}
                  {(() => {
                    const r = getRank(words.length, streakData.count);
                    return (
                      <div onClick={() => setShowRankSheet(true)} style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "rgba(255,255,255,0.18)", borderRadius: 12, cursor: "pointer" }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: r.color, flexShrink: 0 }} />
                        <div style={{ fontSize: 13, color: r.color, fontWeight: 600 }}>{r.name}</div>
                        <div style={{ fontSize: 11, color: "#555", marginLeft: "auto" }}>{r.tier}</div>
                        <div style={{ fontSize: 12, color: "#555" }}>›</div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* ── CAT ROOM ENTRY CARD ── */}
            {(() => {
              const stage = getCatStage(xp);
              const hat = catEquipment.hat ? EQUIPMENT.find(e => e.id === catEquipment.hat) : null;
              const outfit = catEquipment.outfit ? EQUIPMENT.find(e => e.id === catEquipment.outfit) : null;
              const accessory = catEquipment.accessory ? EQUIPMENT.find(e => e.id === catEquipment.accessory) : null;
              const hungerColor = catHunger > 60 ? "#FF8000" : catHunger > 30 ? "#FFB347" : "#e53e3e";
              const thirstColor = catThirst > 60 ? "#4facfe" : catThirst > 30 ? "#a0d4ff" : "#e53e3e";
              return (
                <div style={{ background: "linear-gradient(135deg,#45B7B8,#5dd6d7,#7de8e8)", borderRadius: 24, overflow: "hidden", boxShadow: "0 8px 28px rgba(69,183,184,0.4)" }}>
                  {/* Top row */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 18px 8px" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.75)", letterSpacing: "0.5px", textTransform: "uppercase", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                        <span>我的 Combo猫</span>
                        {/* Currency quick display */}
                        <div style={{ display:"flex", gap:6 }}>
                          <div style={{ background:"rgba(255,255,255,0.2)", borderRadius:10, padding:"2px 8px", fontSize:10, fontWeight:700, color:"#fff", display:"flex", alignItems:"center", gap:3 }}>
                            ⚡ {xp}
                          </div>
                          <div style={{ background:"rgba(255,255,255,0.2)", borderRadius:10, padding:"2px 8px", fontSize:10, fontWeight:700, color:"#fff", display:"flex", alignItems:"center", gap:3, cursor:"pointer" }}
                            onClick={() => setShowBackpack(true)}>
                            🐟 {fishCoins}
                          </div>
                          <div onClick={() => setShowBackpack(true)} style={{ background:"rgba(255,255,255,0.25)", borderRadius:10, padding:"2px 8px", fontSize:10, fontWeight:700, color:"#fff", cursor:"pointer", border:"1px solid rgba(255,255,255,0.4)" }}>
                            🎒
                          </div>
                        </div>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:2 }}>
                        {editingCatName ? (
                          <input autoFocus value={tempCatName}
                            onChange={e => setTempCatName(e.target.value)}
                            onBlur={() => { const n = tempCatName.trim() || catName; setCatName(n); try { localStorage.setItem("wv_cat_name", n); } catch {} setEditingCatName(false); }}
                            onKeyDown={e => { if (e.key === "Enter") { const n = tempCatName.trim() || catName; setCatName(n); try { localStorage.setItem("wv_cat_name", n); } catch {} setEditingCatName(false); } }}
                            style={{ fontFamily:"DM Serif Display, serif", fontSize:20, fontWeight:900, color:"#fff", background:"rgba(255,255,255,0.2)", border:"none", borderBottom:"2px solid rgba(255,255,255,0.8)", outline:"none", width:100, padding:"0 4px", borderRadius:"4px 4px 0 0" }}
                          />
                        ) : (
                          <div style={{ fontFamily:"DM Serif Display, serif", fontSize:20, fontWeight:900, color:"#fff", cursor:"pointer", borderBottom:"1.5px dashed rgba(255,255,255,0.5)" }}
                            onClick={() => { setTempCatName(catName); setEditingCatName(true); }}>
                            {catName}
                          </div>
                        )}
                        <div style={{ background:"rgba(255,255,255,0.25)", borderRadius:10, padding:"2px 10px", fontSize:12, fontWeight:800, color:"#fff" }}>Lv.{getCatLv(xp)}</div>
                        <div style={{ fontSize:18 }}>{stage.emoji}</div>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:4 }}>
                        <div style={{ fontSize:11, color:"rgba(255,255,255,0.8)" }}>{stage.name} · {catBreed}</div>
                        <button onClick={() => setShowBreedPicker(v => !v)}
                          style={{ fontSize:9, color:"rgba(255,255,255,0.7)", background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.3)", borderRadius:8, padding:"1px 6px", cursor:"pointer", fontFamily:"inherit" }}>
                          换品种
                        </button>
                      </div>
                      {showBreedPicker && (
                        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:8, padding:"8px 10px", background:"rgba(0,0,0,0.2)", borderRadius:12 }}>
                          {["橙猫","蓝猫","布偶","暹罗","无毛","波斯","机器猫"].map(breed => (
                            <button key={breed} onClick={() => { setCatBreed(breed); try { localStorage.setItem("wv_cat_breed", breed); } catch {} setShowBreedPicker(false); }}
                              style={{ fontSize:11, fontWeight: catBreed===breed ? 800 : 400, color:"#fff", background: catBreed===breed ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.12)", border: catBreed===breed ? "1.5px solid rgba(255,255,255,0.7)" : "1px solid rgba(255,255,255,0.2)", borderRadius:10, padding:"4px 10px", cursor:"pointer", fontFamily:"inherit" }}>
                              {breed}
                            </button>
                          ))}
                        </div>
                      )}
                      <div style={{ fontSize:11, color:"rgba(255,255,255,0.8)", marginTop:4 }}>今日喂食 {catFeedsToday} 次 🍖</div>
                    </div>
                    <button onClick={() => setShowCatRoom(true)}
                      style={{ background: "rgba(255,255,255,0.25)", border: "1.5px solid rgba(255,255,255,0.6)", borderRadius: 14, padding: "8px 14px", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", backdropFilter: "blur(8px)", flexShrink:0, marginLeft:10 }}>
                      进入猫屋 🏠
                    </button>
                  </div>
                  {/* Cat display + status */}
                  <div style={{ display: "flex", alignItems: "flex-end", padding: "0 18px 16px" }}>
                    {/* Cat image with equipment badges */}
                    <div style={{ position: "relative", width: 110, flexShrink: 0 }}>
                      <img src={COMBO_CAT} alt="Combo猫" style={{ width: 110, height: 110, objectFit: "contain", filter: catHunger < 30 ? "brightness(0.75) saturate(0.5)" : "none", transition: "filter 0.5s" }} />
                      {/* Equipment badges */}
                      {hat && <div style={{ position: "absolute", top: -4, left: "50%", transform: "translateX(-50%)", fontSize: 20 }}>{hat.emoji}</div>}
                      {accessory && <div style={{ position: "absolute", bottom: 8, right: -4, fontSize: 18 }}>{accessory.emoji}</div>}
                    </div>
                    {/* Status bars */}
                    <div style={{ flex: 1, marginLeft: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                      {/* Outfit badge */}
                      {outfit && (
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "rgba(255,255,255,0.2)", borderRadius: 10, padding: "3px 8px", width: "fit-content" }}>
                          <span style={{ fontSize: 14 }}>{outfit.emoji}</span>
                          <span style={{ fontSize: 11, color: "#fff", fontWeight: 600 }}>{outfit.name}</span>
                        </div>
                      )}
                      {/* 4 stat bars */}
                      {[
                        { label:"🍖 饱食度", val:catHunger, barColor: catHunger>60?"#fff":catHunger>30?"#FFD700":"#ff6b6b" },
                        { label:"💧 口渴度", val:catThirst, barColor: catThirst>60?"#b3f0ff":catThirst>30?"#FFD700":"#ff6b6b" },
                        { label:"😊 心情值", val:catMood,   barColor: catMood>60?"#a8f0c0":catMood>30?"#FFD700":"#ff6b6b"  },
                        { label:"❤️ 健康值", val:catHealth, barColor: catHealth>60?"#ffc0c0":catHealth>30?"#FFD700":"#ff6b6b"},
                      ].map(s => (
                        <div key={s.label}>
                          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:3 }}>
                            <span style={{ fontSize:11, color:"rgba(255,255,255,0.85)" }}>{s.label}</span>
                            <span style={{ fontSize:11, color:"#fff", fontWeight:700 }}>{s.val}%</span>
                          </div>
                          <div style={{ height:5, background:"rgba(0,0,0,0.2)", borderRadius:3, overflow:"hidden", marginBottom:6 }}>
                            <div style={{ height:"100%", width:s.val+"%", background:s.barColor, borderRadius:3, transition:"width 0.5s" }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}


            {/* Edit Profile Modal */}
            {editingProfile && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 700, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
                onClick={() => { setEditingProfile(false); setShowAvatarPicker(false); }}>
                <div style={{ background: "#fff", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 520, padding: "24px 20px 36px", maxHeight: "90vh", display: "flex", flexDirection: "column" }}
                  onClick={e => e.stopPropagation()}>

                  {/* Title */}
                  <div style={{ fontSize: 17, fontWeight: 700, color: "#111", marginBottom: 20, textAlign: "center" }}>编辑资料</div>

                  <div style={{ flex: 1, overflowY: "auto" }}>
                    {/* Avatar — tap to toggle picker */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20 }}>
                      <div onClick={() => setShowAvatarPicker(v => !v)} style={{ cursor: "pointer", position: "relative" }}>
                        <SpriteAvatar id={setupAvatar} size={80} />
                        <div style={{ position: "absolute", bottom: 0, right: 0, background: "#111", borderRadius: "50%", width: 22, height: 22, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff" }}>✎</div>
                      </div>
                      <div style={{ fontSize: 11, color: "#aaa", marginTop: 6 }}>点击头像更换</div>

                      {/* Avatar picker — shown only after tap */}
                      {showAvatarPicker && (
                        <div style={{ marginTop: 14, width: "100%" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
                            {AVATARS.map(av => (
                              <div key={av.id} onClick={() => { setSetupAvatar(av.id); setShowAvatarPicker(false); }}
                                style={{ display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 12, padding: 3, cursor: "pointer",
                                  border: setupAvatar === av.id ? "2.5px solid #111" : "2.5px solid transparent",
                                  background: setupAvatar === av.id ? "#f0f0f0" : "transparent",
                                  transform: setupAvatar === av.id ? "scale(1.08)" : "scale(1)",
                                  transition: "all 0.15s" }}>
                                <SpriteAvatar id={av.id} size={48} />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Fields */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {/* Name */}
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#888", marginBottom: 5 }}>昵称</div>
                        <input value={setupName} onChange={e => setSetupName(e.target.value)}
                          placeholder="你的昵称" maxLength={16}
                          style={{ width: "100%", fontSize: 15, padding: "10px 14px", borderRadius: 12, border: "1.5px solid #e8e8e8", background: "#fafafa", boxSizing: "border-box" }} />
                      </div>

                      {/* Birth */}
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#888", marginBottom: 5 }}>出生年月</div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <input value={setupBirthYear} onChange={e => setSetupBirthYear(e.target.value)}
                            placeholder="年份 (如 1995)" maxLength={4} type="number"
                            style={{ flex: 1, fontSize: 15, padding: "10px 14px", borderRadius: 12, border: "1.5px solid #e8e8e8", background: "#fafafa" }} />
                          <select value={setupBirthMonth} onChange={e => setSetupBirthMonth(e.target.value)}
                            style={{ flex: 1, fontSize: 15, padding: "10px 14px", borderRadius: 12, border: "1.5px solid #e8e8e8", background: "#fafafa", color: setupBirthMonth ? "#111" : "#aaa" }}>
                            <option value="">月份</option>
                            {["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月"].map((m,i) => (
                              <option key={i} value={String(i+1)}>{m}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Occupation */}
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#888", marginBottom: 5 }}>职业</div>
                        <input value={setupOccupation} onChange={e => setSetupOccupation(e.target.value)}
                          placeholder="如：学生、工程师、设计师…" maxLength={20}
                          style={{ width: "100%", fontSize: 15, padding: "10px 14px", borderRadius: 12, border: "1.5px solid #e8e8e8", background: "#fafafa", boxSizing: "border-box" }} />
                      </div>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                    <button className="btn btn-dark" style={{ flex: 1 }} onClick={() => saveProfile(setupAvatar, setupName)}>保存</button>
                    <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => { setEditingProfile(false); setShowAvatarPicker(false); }}>取消</button>
                  </div>
                </div>
              </div>
            )}

            {/* ── CAT ROOM MODAL ── */}
            {showCatRoom && (() => {
              const stage = getCatStage(xp);
              const equipTypes = ["hat","outfit","accessory"];
              const typeLabels = { hat: "帽子", outfit: "衣服", accessory: "配件" };
              return (
                <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:800, display:"flex", alignItems:"flex-end", justifyContent:"center" }}
                  onClick={() => setShowCatRoom(false)}>
                  <div style={{ background:"#fff", borderRadius:"24px 24px 0 0", width:"100%", maxWidth:520, maxHeight:"92vh", display:"flex", flexDirection:"column", overflow:"hidden" }}
                    onClick={e => e.stopPropagation()}>

                    {/* Header */}
                    <div style={{ background:"linear-gradient(135deg,#45B7B8,#5dd6d7)", padding:"18px 20px 14px", position:"relative" }}>
                      <button onClick={() => setShowCatRoom(false)} style={{ position:"absolute", top:14, right:16, background:"rgba(255,255,255,0.25)", border:"none", borderRadius:"50%", width:32, height:32, color:"#fff", fontSize:16, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
                      <div style={{ fontSize:11, color:"rgba(255,255,255,0.75)", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:4 }}>Combo猫屋</div>
                      <div style={{ fontSize:20, fontWeight:800, color:"#fff" }}>{catName} · {stage.name} {stage.emoji}</div>
                      <div style={{ fontSize:11, color:"rgba(255,255,255,0.75)", marginTop:2 }}>当前 XP: {xp} · 可用于购买装备</div>
                    </div>

                    {/* Tabs */}
                    <div style={{ display:"flex", borderBottom:"1.5px solid #f0f0f0", background:"#fff" }}>
                      {[["status","状态"],["wardrobe","衣橱"],["shop","商店"]].map(([key,label]) => (
                        <button key={key} onClick={() => setCatRoomTab(key)}
                          style={{ flex:1, padding:"11px 0", border:"none", background:"none", fontSize:13, fontWeight: catRoomTab===key ? 700 : 400, color: catRoomTab===key ? "#FF8000" : "#aaa", borderBottom: catRoomTab===key ? "2.5px solid #FF8000" : "2.5px solid transparent", cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s" }}>
                          {label}
                        </button>
                      ))}
                    </div>

                    <div style={{ flex:1, overflowY:"auto", padding:"18px 16px 32px" }}>

                      {/* ── STATUS TAB ── */}
                      {catRoomTab === "status" && (
                        <div>
                          {/* Cat display */}
                          <div style={{ textAlign:"center", marginBottom:20 }}>
                            <div style={{ position:"relative", display:"inline-block" }}>
                              <img src={COMBO_CAT} alt="Combo猫" style={{ width:140, height:140, objectFit:"contain",
                                filter: catHunger < 30 ? "brightness(0.7) saturate(0.4)" : catHunger < 60 ? "brightness(0.9)" : "none",
                                transition:"filter 0.5s"
                              }} />
                              {catEquipment.hat && (() => { const h = EQUIPMENT.find(e=>e.id===catEquipment.hat); return h ? <div style={{ position:"absolute", top:-10, left:"50%", transform:"translateX(-50%)", fontSize:28 }}>{h.emoji}</div> : null; })()}
                              {catEquipment.accessory && (() => { const a = EQUIPMENT.find(e=>e.id===catEquipment.accessory); return a ? <div style={{ position:"absolute", bottom:0, right:-10, fontSize:24 }}>{a.emoji}</div> : null; })()}
                              {catEquipment.outfit && (() => { const o = EQUIPMENT.find(e=>e.id===catEquipment.outfit); return o ? <div style={{ position:"absolute", bottom:0, left:-10, fontSize:22 }}>{o.emoji}</div> : null; })()}
                            </div>
                            <div style={{ fontSize:15, fontWeight:700, color:"#111", marginTop:8 }}>{catName}</div>
                            <div style={{ fontSize:12, color:"#aaa" }}>{stage.desc}</div>
                          </div>

                          {/* Status bars */}
                          {[
                            { label:"🍚 饥饿度", val:catHunger, color: catHunger>60?"#FF8000":catHunger>30?"#FFB347":"#e53e3e", action:"喂食", tab:"shop", filter:"food" },
                            { label:"💧 口渴度", val:catThirst, color: catThirst>60?"#4facfe":catThirst>30?"#a0d4ff":"#e53e3e", action:"喝水", tab:"shop", filter:"drink" },
                            { label:"😊 心情值", val:catMood, color: catMood>60?"#4ade80":catMood>30?"#FFB347":"#e53e3e", action:"去答题", tab:null },
                          ].map(s => (
                            <div key={s.label} style={{ marginBottom:14 }}>
                              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
                                <span style={{ fontSize:13, fontWeight:600, color:"#333" }}>{s.label}</span>
                                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                                  <span style={{ fontSize:13, fontWeight:700, color: s.val<30?"#e53e3e":"#333" }}>{s.val}%</span>
                                  <button onClick={() => s.tab ? setCatRoomTab(s.tab) : setShowCatRoom(false)}
                                    style={{ fontSize:10, fontWeight:700, color:s.color, background: s.color+"18", border:`1px solid ${s.color}44`, borderRadius:10, padding:"2px 8px", cursor:"pointer", fontFamily:"inherit" }}>
                                    {s.action}
                                  </button>
                                </div>
                              </div>
                              <div style={{ height:8, background:"#f0f0f0", borderRadius:4, overflow:"hidden" }}>
                                <div style={{ height:"100%", width:s.val+"%", background:s.color, borderRadius:4, transition:"width 0.5s ease" }} />
                              </div>
                              {s.val < 30 && <div style={{ fontSize:10, color:"#e53e3e", marginTop:3 }}>⚠️ {s.label.split(" ")[1]}严重不足，快去{s.action}！</div>}
                            </div>
                          ))}

                          {/* Growth stage progress */}
                          <div style={{ background:"#fff8ee", borderRadius:16, padding:"14px 16px", marginTop:8, border:"1.5px solid #FFE0A0" }}>
                            <div style={{ fontSize:12, color:"#c07000", fontWeight:700, marginBottom:8 }}>🌱 成长阶段</div>
                            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                              {CAT_STAGES.map((s,i) => {
                                const active = xp >= s.minXp;
                                const current = getCatStage(xp).stage === s.stage;
                                return (
                                  <div key={s.stage} style={{ textAlign:"center", opacity: active?1:0.4 }}>
                                    <div style={{ fontSize:18, marginBottom:2 }}>{s.emoji}</div>
                                    <div style={{ fontSize:9, color: current?"#FF8000":"#888", fontWeight: current?700:400 }}>{s.name}</div>
                                  </div>
                                );
                              })}
                            </div>
                            {(() => {
                              const curStageIdx = CAT_STAGES.findIndex(s => getCatStage(xp).stage === s.stage);
                              const nextStage = CAT_STAGES[curStageIdx+1];
                              if (!nextStage) return <div style={{ fontSize:11, color:"#FF8000", textAlign:"center", fontWeight:700 }}>🏆 已达到最高阶段！</div>;
                              const pct = Math.round((xp - CAT_STAGES[curStageIdx].minXp) / (nextStage.minXp - CAT_STAGES[curStageIdx].minXp) * 100);
                              return (
                                <>
                                  <div style={{ height:6, background:"#FFE0A0", borderRadius:3, overflow:"hidden", marginBottom:4 }}>
                                    <div style={{ height:"100%", width:pct+"%", background:"linear-gradient(90deg,#FF8000,#FFD060)", borderRadius:3, transition:"width 0.6s" }} />
                                  </div>
                                  <div style={{ fontSize:10, color:"#c07000" }}>距 {nextStage.name} 还差 {nextStage.minXp-xp} XP</div>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      )}

                      {/* ── WARDROBE TAB ── */}
                      {catRoomTab === "wardrobe" && (
                        <div>
                          <div style={{ fontSize:12, color:"#aaa", marginBottom:14 }}>点击已解锁装备可穿戴/脱下</div>
                          {equipTypes.map(type => {
                            const items = EQUIPMENT.filter(e => e.type === type && isUnlocked(e));
                            if (items.length === 0) return (
                              <div key={type} style={{ marginBottom:20 }}>
                                <div style={{ fontSize:13, fontWeight:700, color:"#111", marginBottom:8, display:"flex", alignItems:"center", gap:6 }}>
                                  <div style={{ width:3, height:14, borderRadius:2, background:"#FF8000" }} />{typeLabels[type]}
                                </div>
                                <div style={{ fontSize:12, color:"#ccc", textAlign:"center", padding:"16px 0" }}>暂无解锁，去商店购买</div>
                              </div>
                            );
                            return (
                              <div key={type} style={{ marginBottom:20 }}>
                                <div style={{ fontSize:13, fontWeight:700, color:"#111", marginBottom:8, display:"flex", alignItems:"center", gap:6 }}>
                                  <div style={{ width:3, height:14, borderRadius:2, background:"#FF8000" }} />{typeLabels[type]}
                                </div>
                                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                                  {items.map(item => {
                                    const equipped = catEquipment[type] === item.id;
                                    const r = RARITY_COLORS[item.rarity];
                                    return (
                                      <div key={item.id} onClick={() => equipItem(item)}
                                        style={{ width:72, borderRadius:14, padding:"10px 6px", textAlign:"center", cursor:"pointer",
                                          background: equipped ? r.bg : "#f8f8f8",
                                          border: equipped ? `2px solid ${r.color}` : "2px solid #ebebeb",
                                          boxShadow: equipped ? `0 4px 12px ${r.color}33` : "none",
                                          transition:"all 0.2s" }}>
                                        <div style={{ fontSize:28, marginBottom:4 }}>{item.emoji}</div>
                                        <div style={{ fontSize:10, fontWeight:700, color: equipped?r.color:"#555" }}>{item.name}</div>
                                        {equipped && <div style={{ fontSize:9, color:r.color, marginTop:2 }}>✓ 穿戴中</div>}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* ── SHOP TAB ── */}
                      {catRoomTab === "shop" && (
                        <div>
                          <div style={{ display:"flex", alignItems:"center", gap:8, background:"#fff8ee", borderRadius:12, padding:"10px 14px", marginBottom:16, border:"1px solid #FFE0A0" }}>
                            <span style={{ fontSize:16 }}>⚡</span>
                            <div>
                              <div style={{ fontSize:12, color:"#c07000", fontWeight:700 }}>当前 XP 余额</div>
                              <div style={{ fontFamily:"DM Serif Display, serif", fontSize:22, color:"#FF8000", fontWeight:900 }}>{xp} XP</div>
                            </div>
                            <div style={{ fontSize:11, color:"#aaa", marginLeft:"auto", textAlign:"right" }}>答题获得XP<br/>用于购买装备</div>
                          </div>

                          {["hat","outfit","accessory","food","drink"].map(type => {
                            const typeNames = { hat:"帽子", outfit:"衣服", accessory:"配件", food:"食物", drink:"饮品" };
                            const items = EQUIPMENT.filter(e => e.type === type);
                            return (
                              <div key={type} style={{ marginBottom:22 }}>
                                <div style={{ fontSize:13, fontWeight:700, color:"#111", marginBottom:10, display:"flex", alignItems:"center", gap:6 }}>
                                  <div style={{ width:3, height:14, borderRadius:2, background:"#FF8000" }} />{typeNames[type]}
                                </div>
                                <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                                  {items.map(item => {
                                    const unlocked = isUnlocked(item);
                                    const affordable = xp >= item.xpCost;
                                    const meetsLevel = xp >= item.xpRequired;
                                    const r = RARITY_COLORS[item.rarity];
                                    const isConsumable = item.type === "food" || item.type === "drink";
                                    return (
                                      <div key={item.id} style={{ display:"flex", alignItems:"center", gap:12, background: unlocked&&!isConsumable ? r.bg : "#fff", borderRadius:14, padding:"12px 14px", border:`1.5px solid ${unlocked&&!isConsumable ? r.color+"44" : "#ebebeb"}`, opacity: meetsLevel?1:0.5 }}>
                                        <div style={{ fontSize:32, flexShrink:0 }}>{item.emoji}</div>
                                        <div style={{ flex:1, minWidth:0 }}>
                                          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
                                            <div style={{ fontSize:14, fontWeight:700, color:"#111" }}>{item.name}</div>
                                            <div style={{ fontSize:9, fontWeight:700, color:r.color, background:r.bg, borderRadius:6, padding:"1px 6px" }}>{r.label}</div>
                                          </div>
                                          <div style={{ fontSize:11, color:"#888" }}>{item.desc}</div>
                                          {!meetsLevel && <div style={{ fontSize:10, color:"#e53e3e", marginTop:2 }}>需要 {item.xpRequired} XP 才能解锁</div>}
                                        </div>
                                        <div style={{ flexShrink:0, textAlign:"center" }}>
                                          {isConsumable ? (
                                            <button onClick={() => feedCatItem(item)} disabled={!affordable}
                                              style={{ background: affordable?"linear-gradient(135deg,#FF8000,#FFB347)":"#f0f0f0", color: affordable?"#fff":"#ccc", border:"none", borderRadius:10, padding:"6px 12px", fontSize:11, fontWeight:700, cursor: affordable?"pointer":"not-allowed", fontFamily:"inherit" }}>
                                              {item.xpCost} XP
                                            </button>
                                          ) : unlocked ? (
                                            <div style={{ fontSize:11, color:r.color, fontWeight:700 }}>已拥有</div>
                                          ) : (
                                            <button onClick={() => meetsLevel && affordable && buyItem(item)} disabled={!meetsLevel || !affordable}
                                              style={{ background: meetsLevel&&affordable?"linear-gradient(135deg,#FF8000,#FFB347)":"#f0f0f0", color: meetsLevel&&affordable?"#fff":"#ccc", border:"none", borderRadius:10, padding:"6px 12px", fontSize:11, fontWeight:700, cursor: meetsLevel&&affordable?"pointer":"not-allowed", fontFamily:"inherit" }}>
                                              {item.xpCost} XP
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ── BACKPACK MODAL ── */}
            {showBackpack && (() => {
              const typeIcon = { earn_xp:"⚡", spend_xp:"🛒", earn_fish:"🐟", spend_fish:"🛒" };
              const typeColor = { earn_xp:"#FF8000", spend_xp:"#e53e3e", earn_fish:"#45B7B8", spend_fish:"#e53e3e" };
              const equippedItems = Object.entries(catEquipment).filter(([,v])=>v).map(([k,v]) => EQUIPMENT.find(e=>e.id===v)).filter(Boolean);
              const ownedItems = EQUIPMENT.filter(e => isUnlocked(e) && e.xpCost > 0);
              const catOverallHealth = Math.round((catHunger + catThirst + catMood + catHealth) / 4);
              return (
                <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.65)", zIndex:900, display:"flex", alignItems:"flex-end", justifyContent:"center" }}
                  onClick={() => setShowBackpack(false)}>
                  <div style={{ background:"#fff", borderRadius:"24px 24px 0 0", width:"100%", maxWidth:520, maxHeight:"92vh", display:"flex", flexDirection:"column", overflow:"hidden" }}
                    onClick={e => e.stopPropagation()}>

                    {/* Header */}
                    <div style={{ background:"linear-gradient(135deg,#FF8000,#FFB347)", padding:"18px 20px 16px", position:"relative" }}>
                      <button onClick={() => setShowBackpack(false)} style={{ position:"absolute", top:14, right:16, background:"rgba(255,255,255,0.25)", border:"none", borderRadius:"50%", width:32, height:32, color:"#fff", fontSize:18, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
                      <div style={{ fontSize:11, color:"rgba(255,255,255,0.75)", textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:4 }}>🎒 锦囊背包</div>
                      <div style={{ fontSize:18, fontWeight:800, color:"#fff", marginBottom:12 }}>{profile?.name || "学员"} 的背包</div>
                      {/* Currency pills */}
                      <div style={{ display:"flex", gap:10 }}>
                        <div style={{ background:"rgba(255,255,255,0.22)", borderRadius:14, padding:"8px 14px", display:"flex", alignItems:"center", gap:8, flex:1, backdropFilter:"blur(8px)" }}>
                          <span style={{ fontSize:20 }}>⚡</span>
                          <div>
                            <div style={{ fontFamily:"DM Serif Display, serif", fontSize:22, color:"#fff", fontWeight:900, lineHeight:1 }}>{xp}</div>
                            <div style={{ fontSize:9, color:"rgba(255,255,255,0.75)", letterSpacing:"0.5px" }}>XP 答题获得</div>
                          </div>
                        </div>
                        <div style={{ background:"rgba(255,255,255,0.22)", borderRadius:14, padding:"8px 14px", display:"flex", alignItems:"center", gap:8, flex:1, backdropFilter:"blur(8px)" }}>
                          <span style={{ fontSize:20 }}>🐟</span>
                          <div>
                            <div style={{ fontFamily:"DM Serif Display, serif", fontSize:22, color:"#fff", fontWeight:900, lineHeight:1 }}>{fishCoins}</div>
                            <div style={{ fontSize:9, color:"rgba(255,255,255,0.75)", letterSpacing:"0.5px" }}>小鱼干 连续登录获得</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tabs */}
                    <div style={{ display:"flex", borderBottom:"1.5px solid #f0f0f0" }}>
                      {[["overview","总览"],["log","收支记录"]].map(([key,label]) => (
                        <button key={key} onClick={() => setBackpackTab(key)}
                          style={{ flex:1, padding:"11px 0", border:"none", background:"none", fontSize:13, fontWeight: backpackTab===key?700:400, color: backpackTab===key?"#FF8000":"#aaa", borderBottom: backpackTab===key?"2.5px solid #FF8000":"2.5px solid transparent", cursor:"pointer", fontFamily:"inherit" }}>
                          {label}
                        </button>
                      ))}
                    </div>

                    <div style={{ flex:1, overflowY:"auto", padding:"16px 16px 32px" }}>

                      {/* ── OVERVIEW TAB ── */}
                      {backpackTab === "overview" && (
                        <div>
                          {/* Cat health summary */}
                          <div style={{ background:"linear-gradient(135deg,#45B7B8,#5dd6d7)", borderRadius:16, padding:"14px 16px", marginBottom:16, display:"flex", alignItems:"center", gap:12 }}>
                            <img src={COMBO_CAT} alt="猫" style={{ width:56, height:56, objectFit:"contain" }} />
                            <div style={{ flex:1 }}>
                              <div style={{ fontSize:13, fontWeight:800, color:"#fff", marginBottom:4 }}>{catName} · Lv.{getCatLv(xp)} {getCatStage(xp).emoji}</div>
                              <div style={{ height:6, background:"rgba(0,0,0,0.15)", borderRadius:3, overflow:"hidden", marginBottom:3 }}>
                                <div style={{ height:"100%", width:catOverallHealth+"%", background:"rgba(255,255,255,0.85)", borderRadius:3, transition:"width 0.5s" }} />
                              </div>
                              <div style={{ fontSize:10, color:"rgba(255,255,255,0.8)" }}>综合健康 {catOverallHealth}%</div>
                            </div>
                          </div>

                          {/* Earning tips */}
                          <div style={{ background:"#fff8ee", borderRadius:14, padding:"12px 14px", marginBottom:16, border:"1px solid #FFE0A0" }}>
                            <div style={{ fontSize:12, fontWeight:700, color:"#c07000", marginBottom:8 }}>💡 如何获得货币</div>
                            {[
                              { icon:"⚡", label:"答对一题", reward:"+任务XP", color:"#FF8000" },
                              { icon:"🐟", label:"每日登录", reward:"+1~10小鱼干", color:"#45B7B8" },
                              { icon:"🐟", label:"连续7天", reward:"+5小鱼干/天", color:"#45B7B8" },
                              { icon:"🐟", label:"连续30天", reward:"+10小鱼干/天", color:"#45B7B8" },
                              { icon:"⚡", label:"完成每日任务", reward:"+15~50 XP", color:"#FF8000" },
                            ].map(t => (
                              <div key={t.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"4px 0", borderBottom:"1px solid #fff0d0" }}>
                                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                                  <span style={{ fontSize:14 }}>{t.icon}</span>
                                  <span style={{ fontSize:12, color:"#555" }}>{t.label}</span>
                                </div>
                                <span style={{ fontSize:12, fontWeight:700, color:t.color }}>{t.reward}</span>
                              </div>
                            ))}
                          </div>

                          {/* Owned items */}
                          <div style={{ fontSize:13, fontWeight:700, color:"#111", marginBottom:10, display:"flex", alignItems:"center", gap:6 }}>
                            <div style={{ width:3, height:14, borderRadius:2, background:"#FF8000" }} />
                            已拥有装备 ({ownedItems.length} 件)
                          </div>
                          {ownedItems.length === 0 ? (
                            <div style={{ textAlign:"center", color:"#ccc", fontSize:13, padding:"16px 0" }}>还没有装备，去猫商城购买吧</div>
                          ) : (
                            <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                              {ownedItems.map(item => {
                                const equipped = Object.values(catEquipment).includes(item.id);
                                const r = RARITY_COLORS[item.rarity];
                                return (
                                  <div key={item.id} style={{ width:64, borderRadius:12, padding:"8px 6px", textAlign:"center", background: equipped?r.bg:"#f8f8f8", border:`1.5px solid ${equipped?r.color:"#eee"}` }}>
                                    <div style={{ fontSize:24 }}>{item.emoji}</div>
                                    <div style={{ fontSize:9, color: equipped?r.color:"#555", fontWeight: equipped?700:400 }}>{item.name}</div>
                                    {equipped && <div style={{ fontSize:8, color:r.color }}>穿戴中</div>}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {/* ── LOG TAB ── */}
                      {backpackTab === "log" && (
                        <div>
                          {transactionLog.length === 0 ? (
                            <div style={{ textAlign:"center", color:"#ccc", fontSize:13, padding:"40px 0" }}>暂无收支记录</div>
                          ) : (
                            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                              {transactionLog.map(entry => (
                                <div key={entry.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 14px", background:"#fff", borderRadius:12, border:"1px solid #f0f0f0", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
                                  <div style={{ width:36, height:36, borderRadius:12, background: entry.amount>0?"#f0faf4":"#fff5f5", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>
                                    {typeIcon[entry.type] || "💰"}
                                  </div>
                                  <div style={{ flex:1, minWidth:0 }}>
                                    <div style={{ fontSize:13, fontWeight:600, color:"#111", marginBottom:1 }}>{entry.desc}</div>
                                    <div style={{ fontSize:10, color:"#aaa" }}>{entry.date}</div>
                                  </div>
                                  <div style={{ fontFamily:"DM Serif Display, serif", fontSize:16, fontWeight:800, color: entry.amount>0?typeColor[entry.type]:"#e53e3e", flexShrink:0 }}>
                                    {entry.amount > 0 ? "+" : ""}{entry.amount}
                                    <span style={{ fontSize:11, marginLeft:2 }}>{entry.type.includes("fish")?"🐟":"⚡"}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              );
            })()}

            {showRankSheet && (() => {
              const curRank = getRank(words.length, streakData.count);
              const nextRank = getNextRank(words.length, streakData.count);
              const curIdx = RANKS.findIndex(r => r.id === curRank.id);
              const lastRank = RANKS[RANKS.length - 1];
              return (
                <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 700, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
                  onClick={() => setShowRankSheet(false)}>
                  <div style={{ background: "#fff", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 520, padding: "24px 20px 36px", maxHeight: "90vh", display: "flex", flexDirection: "column" }}
                    onClick={e => e.stopPropagation()}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                      <div style={{ fontSize: 17, fontWeight: 700, color: "#111" }}>段位系统</div>
                      <button onClick={() => setShowRankSheet(false)} style={{ background: "none", border: "none", fontSize: 22, color: "#aaa", cursor: "pointer", lineHeight: 1 }}>×</button>
                    </div>
                    <div style={{ flex: 1, overflowY: "auto" }}>
                      {/* Current rank */}
                      <div style={{ border: "2px solid " + curRank.color, borderRadius: 16, padding: 20, background: curRank.bg, marginBottom: 14, textAlign: "center" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "2px", color: curRank.color, marginBottom: 4 }}>当前段位</div>
                        <div style={{ fontSize: 13, color: "#888", marginBottom: 4 }}>{curRank.tier}</div>
                        <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 30, color: curRank.color, fontWeight: 700, marginBottom: 14 }}>{curRank.name}</div>
                        {nextRank ? (
                          <div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#888", marginBottom: 5 }}>
                              <span>距离 {nextRank.name}</span>
                              <span>还需 {Math.max(0, nextRank.words - words.length)} 词 · {Math.max(0, nextRank.days - streakData.count)} 天连续</span>
                            </div>
                            <div style={{ background: "#e8e8e8", borderRadius: 4, height: 6, overflow: "hidden" }}>
                              <div style={{ height: "100%", borderRadius: 4, background: curRank.color, transition: "width 0.5s", width: Math.min(100, Math.round(Math.max(words.length - curRank.words, 0) / Math.max(nextRank.words - curRank.words, 1) * 100)) + "%" }} />
                            </div>
                          </div>
                        ) : (
                          <div style={{ fontSize: 13, color: curRank.color, fontWeight: 700 }}>🏆 已达到最高段位！</div>
                        )}
                      </div>
                      {/* Distance to final rank */}
                      {nextRank && (
                        <div style={{ background: "#f7f7f7", borderRadius: 12, padding: "12px 16px", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <div style={{ fontSize: 11, color: "#aaa", marginBottom: 2 }}>距离最终段位</div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#b8860b" }}>{lastRank.name}</div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 11, color: "#aaa" }}>还需词数</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>{Math.max(0, lastRank.words - words.length)} 词</div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 11, color: "#aaa" }}>进度</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "#111" }}>{curIdx + 1} / {RANKS.length}</div>
                          </div>
                        </div>
                      )}
                      {/* All tiers */}
                      <div style={{ fontSize: 11, color: "#aaa", marginBottom: 10, fontWeight: 600, letterSpacing: "1px" }}>所有段位</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingBottom: 8 }}>
                        {["青铜铲屎官","白银撸猫师","黄金猫语者","铂金猫医师","钻石繁育专家","星耀训猫大师","猫之守护神"].map(tierName => {
                          const tierRanks = RANKS.filter(r => r.tier === tierName);
                          const tierColor = tierRanks[0].color;
                          const tierBg = tierRanks[0].bg;
                          const unlockedCount = tierRanks.filter(r => RANKS.indexOf(r) <= curIdx).length;
                          const anyUnlocked = unlockedCount > 0;
                          return (
                            <div key={tierName} style={{ border: "1px solid " + (anyUnlocked ? tierColor : "#ebebeb"), borderRadius: 12, padding: "12px 14px", background: anyUnlocked ? tierBg : "#fafafa", opacity: anyUnlocked ? 1 : 0.45 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: anyUnlocked ? 10 : 0 }}>
                                <span style={{ fontSize: 13, fontWeight: 700, color: anyUnlocked ? tierColor : "#bbb" }}>{tierName}</span>
                                <span style={{ fontSize: 11, color: anyUnlocked ? tierColor : "#ccc" }}>{unlockedCount}/{tierRanks.length}</span>
                              </div>
                              {anyUnlocked && (
                                <div style={{ display: "flex", gap: 6 }}>
                                  {tierRanks.map(r => {
                                    const unlocked = RANKS.indexOf(r) <= curIdx;
                                    const isCurrent = r.id === curRank.id;
                                    return (
                                      <div key={r.id} style={{ flex: 1, textAlign: "center", padding: "7px 4px", borderRadius: 8, background: isCurrent ? tierColor : unlocked ? "rgba(0,0,0,0.07)" : "transparent", border: isCurrent ? "none" : "1px solid " + (unlocked ? tierColor : "#e0e0e0"), opacity: unlocked ? 1 : 0.3 }}>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: isCurrent ? "#fff" : tierColor }}>{r.name.split(" ")[1] || "王者"}</div>
                                        {isCurrent && <div style={{ fontSize: 9, color: "rgba(255,255,255,0.85)" }}>当前</div>}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div>
              <div className="sec-title">点击音效</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#111" }}>按键音效</div>
                  <div style={{ fontSize: 12, color: "#999", marginTop: 3 }}>每次点击播放轻微音效</div>
                </div>
                <div onClick={() => { const next = !soundEnabled; setSoundEnabled(next); localStorage.setItem("wv_sound", next ? "1" : "0"); }}
                  style={{ width: 50, height: 28, borderRadius: 14, background: soundEnabled ? "#FF8000" : "#ddd", cursor: "pointer", position: "relative", transition: "background 0.25s", flexShrink: 0 }}>
                  <div style={{ position: "absolute", top: 3, left: soundEnabled ? 25 : 3, width: 22, height: 22, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.25)", transition: "left 0.25s" }} />
                </div>
              </div>
            </div>

            <div>
              <div className="sec-title">每日提醒</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#111" }}>每天提醒我练习</div>
                  <div style={{ fontSize: 12, color: "#999", marginTop: 3 }}>每晚 23:00 推送提醒</div>
                </div>
                <div onClick={notifStatus === "granted"
                    ? () => { setNotifStatus("off"); localStorage.setItem("wv_notif_off","1"); }
                    : requestNotification}
                  style={{ width: 50, height: 28, borderRadius: 14, background: notifStatus === "granted" ? "#FF8000" : "#ddd", cursor: "pointer", position: "relative", transition: "background 0.25s", flexShrink: 0 }}>
                  <div style={{ position: "absolute", top: 3, left: notifStatus === "granted" ? 25 : 3, width: 22, height: 22, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.25)", transition: "left 0.25s" }} />
                </div>
              </div>
              {notifStatus === "granted" && (
                <div style={{ background: "#f0fff4", border: "1px solid #c6f6d5", borderRadius: 10, padding: "12px 14px", fontSize: 13, color: "#276749" }}>
                  已开启 · 每晚 23:00 提醒你练习单词，锁屏也能收到 🔔
                </div>
              )}
              {notifStatus === "off" && (
                <div style={{ fontSize: 13, color: "#aaa" }}>提醒已关闭，点上方开关重新开启</div>
              )}
              {notifStatus === "denied" && (
                <div style={{ background: "#fff5f5", border: "1px solid #fecaca", borderRadius: 10, padding: "12px 14px", fontSize: 13, color: "#e53e3e", lineHeight: 1.7 }}>
                  通知权限被拒绝，请手动开启：<br/>
                  手机「设置」→「通知」→ 找到 WordCombo → 打开通知
                </div>
              )}
              {notifStatus !== "granted" && notifStatus !== "denied" && notifStatus !== "off" && (
                <div style={{ background: "#f7f7f7", borderRadius: 10, padding: "12px 14px", fontSize: 12, color: "#888", lineHeight: 1.8 }}>
                  <div style={{ fontWeight: 600, color: "#555", marginBottom: 4 }}>iOS 用户需先添加到主屏幕</div>
                  <div>Safari → 底部「分享」→「添加到主屏幕」</div>
                  <div>从主屏幕图标打开 → 再点上方开关开启</div>
                </div>
              )}
            </div>
            <div>
              <div className="sec-title">导出单词</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn btn-dark btn-sm" onClick={exportJSON}>导出 JSON</button>
                <button className="btn btn-outline btn-sm" onClick={exportCSV}>导出 CSV</button>
              </div>
            </div>
            <div>
              <div className="sec-title">导入单词</div>
              <div style={{ fontSize: 13, color: "#666", marginBottom: 12, lineHeight: 1.7 }}>
                支持 .json 或 .csv，重复单词自动跳过<br/>
                CSV 列：word, meaning, example, tags（分号分隔）, mastery
              </div>
              <label>
                <span className="btn btn-dark btn-sm">选择文件</span>
                <input type="file" accept=".json,.csv" onChange={handleImportFile} style={{ display: "none" }} />
              </label>
              {importMsg && <div style={{ marginTop: 10, fontSize: 13, color: importMsg.includes("已导入") ? "#2d8a4e" : "#e53e3e" }}>{importMsg}</div>}
              {importSnapshot && (
                <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 13, color: "#666" }}>已导入 {words.length - importSnapshot.length} 个单词</span>
                  <button className="btn btn-outline btn-sm" onClick={() => { if (window.confirm("确定撤销导入？")) { setWords(importSnapshot); setImportSnapshot(null); showMsg("已撤销"); } }}>撤销</button>
                </div>
              )}
            </div>
            <div>
              <div className="sec-title">数据管理</div>
              <button className="btn btn-outline btn-sm" onClick={() => { if (window.confirm("重置所有答题记录和掌握度？")) { setScore({ correct: 0, total: 0 }); setWords(ws => ws.map(w => ({ ...w, mastery: 0 }))); showMsg("已重置"); } }}>
                重置学习进度
              </button>
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Create Challenge Modal */}
      {showCreateChallenge && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 300, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 520, maxHeight: "85vh", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "20px 20px 0", flexShrink: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 20, color: "#111" }}>发起好友挑战</div>
                <button onClick={() => { setShowCreateChallenge(false); setGeneratedLink(""); }} style={{ background: "none", border: "none", fontSize: 22, color: "#aaa", cursor: "pointer", lineHeight: 1 }}>×</button>
              </div>
              <div style={{ fontSize: 12, color: "#888", marginBottom: 16 }}>选好词 → 生成链接 → 发给朋友，看他能答对几题</div>
              <input value={challengeSenderName} onChange={e => setChallengeSenderName(e.target.value)}
                placeholder="你的名字（朋友会看到）" style={{ marginBottom: 14 }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#444" }}>选择单词 <span style={{ color: "#aaa", fontWeight: 400 }}>（已选 {challengeSelectedWords.length} 个）</span></div>
                <button onClick={() => setChallengeSelectedWords(challengeSelectedWords.length === words.length ? [] : shuffle(words).slice(0, Math.min(10, words.length)))}
                  style={{ fontSize: 11, color: "#888", background: "none", border: "1px solid #e0e0e0", borderRadius: 6, padding: "3px 10px", cursor: "pointer", fontFamily: "inherit" }}>
                  随机选10个
                </button>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "0 20px" }}>
              {words.map(w => {
                const selected = !!challengeSelectedWords.find(x => x.id === w.id);
                return (
                  <div key={w.id} onClick={() => toggleChallengeWord(w)}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #f5f5f5", cursor: "pointer" }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, border: "1.5px solid " + (selected ? "#111" : "#ddd"), background: selected ? "#111" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
                      {selected && <span style={{ color: "#fff", fontSize: 12, lineHeight: 1 }}>✓</span>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 15, color: "#111" }}>{w.word}</div>
                      <div style={{ fontSize: 12, color: "#888", marginTop: 1 }}>{w.meaning}</div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ padding: 20, flexShrink: 0, borderTop: "1px solid #f0f0f0" }}>
              {!generatedLink ? (
                <button className="btn btn-dark" style={{ width: "100%" }} onClick={generateChallengeLink}>
                  生成挑战链接
                </button>
              ) : (
                <div>
                  <div style={{ background: "#f7f7f7", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#555", wordBreak: "break-all", marginBottom: 10, lineHeight: 1.6 }}>{generatedLink}</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button className="btn btn-dark" style={{ flex: 1 }} onClick={copyLink}>复制链接</button>
                    <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => { if (navigator.share) navigator.share({ title: `${challengeSenderName} 向你发起了 WordCombo 挑战！`, url: generatedLink }); else copyLink(); }}>分享</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Incoming Challenge Modal */}
      {challengeMode && (
        <div style={{ position: "fixed", inset: 0, background: "#fff", zIndex: 600, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "20px 20px 0", flexShrink: 0 }}>
            {!challengeDone ? (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <div style={{ fontSize: 12, color: "#888" }}>🔗 <strong style={{ color: "#111" }}>{challengeFrom}</strong> 向你发起挑战</div>
                  <div style={{ fontSize: 12, color: "#aaa" }}>{challengeIdx + 1} / {challengeWords.length}</div>
                </div>
                {/* Progress bar */}
                <div style={{ height: 4, background: "#f0f0f0", borderRadius: 2, marginBottom: 24, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: ((challengeIdx + (challengeAnswered ? 1 : 0)) / challengeWords.length * 100) + "%", background: "#111", transition: "width 0.3s" }} />
                </div>
                {(() => {
                  const q = getChallengeQuestion(challengeIdx, challengeWords);
                  return (
                    <div>
                      <div style={{ fontSize: 11, color: "#aaa", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.5px" }}>选择正确的中文释义</div>
                      <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 38, color: "#111", marginBottom: 8, lineHeight: 1.1 }}>{q.question}</div>
                      {q.example && <div style={{ fontSize: 13, color: "#aaa", fontStyle: "italic", marginBottom: 24, lineHeight: 1.5 }}>{q.example}</div>}
                      <div key={q.question + q.options.join()}>
                        {q.options.map((opt, i) => {
                          let bg = "#fafafa", border = "#ebebeb", color = "#111";
                          if (challengeAnswered) {
                            if (opt === q.correct) { bg = "#f0faf4"; border = "#2d8a4e"; color = "#2d8a4e"; }
                            else if (challengeAnswered === "wrong" && opt !== q.correct) { bg = "#fff5f5"; border = "#fecaca"; color = "#e53e3e"; }
                          }
                          return (
                            <button key={i} disabled={!!challengeAnswered}
                              onClick={e => { e.currentTarget.blur(); handleChallengeAnswer(opt); }}
                              style={{ width: "100%", background: bg, border: "1.5px solid " + border, borderRadius: 10, padding: "14px 16px", textAlign: "left", fontFamily: "inherit", fontSize: 14, color, cursor: challengeAnswered ? "default" : "pointer", marginBottom: 8, transition: "all 0.15s" }}>
                              <span style={{ marginRight: 10, fontSize: 12, opacity: 0.5 }}>{String.fromCharCode(65+i)}</span>{opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </>
            ) : (
              /* Challenge Result */
              <div style={{ paddingTop: 20 }}>
                <div style={{ fontSize: 12, color: "#888", marginBottom: 4 }}>🔗 <strong style={{ color: "#111" }}>{challengeFrom}</strong> 的挑战结果</div>
                <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 18, color: "#111", marginBottom: 24 }}>
                  {challengeAnswers.filter(a => a.correct).length >= challengeWords.length * 0.8 ? "太厉害了！" : challengeAnswers.filter(a => a.correct).length >= challengeWords.length * 0.6 ? "不错，继续加油！" : "加油，下次更好！"}
                </div>
                {/* Big score */}
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 24 }}>
                  <span style={{ fontFamily: "DM Serif Display, serif", fontSize: 64, color: "#111", lineHeight: 1 }}>{challengeAnswers.filter(a => a.correct).length}</span>
                  <span style={{ fontSize: 20, color: "#aaa" }}>/ {challengeWords.length} 题</span>
                </div>
                {/* Word by word breakdown */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28, maxHeight: "40vh", overflowY: "auto" }}>
                  {challengeAnswers.map((a, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, background: a.correct ? "#f0faf4" : "#fff5f5", border: "1px solid " + (a.correct ? "#c6f6d5" : "#fecaca") }}>
                      <span style={{ fontSize: 14, flexShrink: 0 }}>{a.correct ? "✓" : "✗"}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 15, color: "#111" }}>{a.word}</div>
                        {!a.correct && <div style={{ fontSize: 11, color: "#e53e3e", marginTop: 2 }}>正确：{a.rightAnswer}</div>}
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="btn btn-dark" style={{ flex: 1 }}
                    onClick={() => {
                      const correct = challengeAnswers.filter(a => a.correct).length;
                      const total = challengeWords.length;
                      const acc = Math.round(correct / total * 100);
                      const text = `我挑战了 ${challengeFrom} 的 WordCombo 词单！\n答对 ${correct}/${total} 题，正确率 ${acc}%\n快来挑战：${window.location.href}`;
                      if (navigator.share) navigator.share({ text }); else { navigator.clipboard.writeText(text).then(() => showMsg("结果已复制！")); }
                    }}>
                    分享结果
                  </button>
                  <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => { setChallengeMode(false); window.history.replaceState({}, "", window.location.pathname); }}>
                    进入词库
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Task Reward Popup */}
      {showTaskReward && (
        <div style={{ position: "fixed", top: 80, left: "50%", transform: "translateX(-50%)", zIndex: 900, pointerEvents: "none",
          animation: "unlockWordIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both" }}>
          <div style={{ background: "#111", borderRadius: 20, padding: "14px 24px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 8px 32px rgba(0,0,0,0.25)" }}>
            <span style={{ fontSize: 28 }}>{showTaskReward.icon}</span>
            <div>
              <div style={{ fontSize: 13, color: "#aaa" }}>任务完成</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{showTaskReward.title}</div>
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#FFD700", marginLeft: 8 }}>+{showTaskReward.xp} XP</div>
          </div>
        </div>
      )}

      {/* Word Unlock Animation */}
      {showUnlock && (() => {
        const COLORS = ["#FFD700","#FF6B6B","#4ECDC4","#45B7D1","#96CEB4","#FFEAA7","#DDA0DD","#98D8C8","#F7DC6F","#BB8FCE","#85C1E9","#82E0AA"];
        const particles = Array.from({ length: 28 }, (_, i) => {
          const angle = (i / 28) * 360 + Math.random() * 13;
          const dist = 80 + Math.random() * 120;
          const rad = angle * Math.PI / 180;
          return {
            dx: Math.cos(rad) * dist,
            dy: Math.sin(rad) * dist,
            color: COLORS[i % COLORS.length],
            size: 6 + Math.random() * 8,
            delay: Math.random() * 0.15,
            shape: i % 3 === 0 ? "star" : i % 3 === 1 ? "circle" : "rect",
          };
        });
        return (
          <div style={{ position: "fixed", inset: 0, zIndex: 800, display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(0,0,0,0.75)", animation: "unlockBgIn 0.25s ease forwards" }}>
            {/* Particles */}
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {particles.map((p, i) => (
                <div key={i} style={{
                  position: "absolute",
                  width: p.size, height: p.size,
                  background: p.color,
                  borderRadius: p.shape === "circle" ? "50%" : p.shape === "star" ? "2px" : "2px",
                  transform: p.shape === "star" ? "rotate(45deg)" : "none",
                  boxShadow: `0 0 6px ${p.color}`,
                  "--dx": p.dx + "px",
                  "--dy": p.dy + "px",
                  animation: `particleFly 0.9s cubic-bezier(0.2,0.8,0.4,1) ${p.delay}s both`,
                }} />
              ))}
            </div>

            {/* Card */}
            <div style={{ background: "#fff", borderRadius: 28, padding: "40px 36px", textAlign: "center", maxWidth: 300, width: "90%", position: "relative" }}>
              {/* Badge */}
              <div style={{ animation: "unlockBadge 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.1s both",
                width: 72, height: 72, borderRadius: "50%", background: "#111", margin: "0 auto 20px",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>
                🔓
              </div>

              {/* Word */}
              <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 32, color: "#111", lineHeight: 1.1, marginBottom: 10,
                animation: "unlockWordIn 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.2s both" }}>
                {unlockWord}
              </div>

              {/* Sub */}
              <div style={{ fontSize: 13, color: "#888", animation: "unlockSub 0.4s ease 0.5s both" }}>
                已解锁 · 加入词库 🎉
              </div>

              {/* Word count */}
              <div style={{ marginTop: 16, fontSize: 12, color: "#bbb", animation: "unlockSub 0.4s ease 0.65s both" }}>
                词库共 {words.length} 个单词
              </div>
            </div>
          </div>
        );
      })()}

      {/* Session Summary Modal */}
      {showSummary && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: "100%", maxWidth: 380 }}>
            <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 22, color: "#111", marginBottom: 4 }}>
              {sessionStats.correct >= 8 ? "太棒了！" : sessionStats.correct >= 6 ? "不错！继续加油" : "再练练这些词 "}
            </div>
            <div style={{ fontSize: 13, color: "#888", marginBottom: 24 }}>🎉 连续答对 20 题！共 {sessionStats.total} 题</div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 24 }}>
              {[
                ["答对", sessionStats.correct],
                ["答错", sessionStats.total - sessionStats.correct],
                ["正确率", Math.round(sessionStats.correct / sessionStats.total * 100) + "%"]
              ].map(([label, val]) => (
                <div key={label} style={{ textAlign: "center", border: "1px solid #ebebeb", borderRadius: 10, padding: "12px 8px" }}>
                  <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 24, color: "#111" }}>{val}</div>
                  <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>

            {sessionStats.wrongWords.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", color: "#888", marginBottom: 10 }}>需要加强</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {sessionStats.wrongWords.map(w => (
                    <span key={w} style={{ fontSize: 13, padding: "4px 12px", borderRadius: 20, background: "#fff5f5", color: "#e53e3e", border: "1px solid #fecaca", fontFamily: "DM Serif Display, serif" }}>{w}</span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-dark" style={{ flex: 1 }} onClick={resetSession}>继续答题</button>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => { setShowSummary(false); setTab(3); }}>查看进度</button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <nav className="bottom-nav">
        <div className="bottom-nav-inner">
        {NAV.map((item, i) => {
          if (i === 2) return (
            <button key={i} className={`nav-item-center ${tab === 2 ? "active" : ""}`} onClick={() => { haptic("light"); setTab(2); setQuizLobby(true); setPairActive(false); clearInterval(pairTimerRef.current); }}>
              <div className="nav-center-btn">
                <img src={CAT_CLAW} alt="猫爪" style={{ width: 90, height: 90, objectFit: "contain" }} />
              </div>
            </button>
          );
          return (
            <button key={i} className={`nav-item ${tab === i ? "active" : ""}`} onClick={() => { haptic("light"); setTab(i); }}>
              {/* Colored selection ring */}
              <div style={{
                position: "relative",
                width: 46, height: 46,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1)",
                transform: tab===i ? "scale(1.12)" : "scale(1)",
              }}>
                {/* Circle ring - only when active */}
                {tab === i && (
                  <div style={{
                    position: "absolute", inset: 0,
                    borderRadius: "50%",
                    border: "2.5px solid " + (
                      item.icon === "wordlib" ? "#FF8000" :
                      item.icon === "add" ? "#45B7B8" :
                      item.icon === "progress" ? "#7C6CF5" :
                      "#aaa"
                    ),
                    background: (
                      item.icon === "wordlib" ? "rgba(255,128,0,0.12)" :
                      item.icon === "add" ? "rgba(69,183,184,0.12)" :
                      item.icon === "progress" ? "rgba(124,108,245,0.12)" :
                      "rgba(170,170,170,0.12)"
                    ),
                    animation: "unlockBadge 0.3s ease both",
                  }} />
                )}
                <div style={{ width:38, height:38 }}
                  dangerouslySetInnerHTML={{ __html: NAV_SVGS[item.icon] || item.icon }} />
              </div>
            </button>
          );
        })}
        </div>
      </nav>
    </div>
  );
}
// ── Stat PNG card — PNG image with dynamic number centered on top ──
// anim: "fire" | "star" | "book" | undefined
function StatPNG({ src, value, size = 110, anim }) {
  const isPercent = typeof size === 'string';
  const animClass = anim === "fire" ? "stat-anim-fire" : anim === "star" ? "stat-anim-star" : anim === "book" ? "stat-anim-book" : "";
  return (
    <div style={{ position: "relative", width: isPercent ? size : size, aspectRatio: "1 / 1", flexShrink: 0 }}>
      <img src={src} alt="" className={animClass} style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }} />
      <div style={{
        position: "absolute",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        fontFamily: "'Arial Rounded MT Bold', 'Arial', sans-serif",
        fontSize: isPercent ? "clamp(18px, 6vw, 32px)" : size * 0.27,
        fontWeight: 900,
        color: "#fff",
        textShadow: "0 1px 4px rgba(0,0,0,0.18)",
        lineHeight: 1,
        whiteSpace: "nowrap",
        pointerEvents: "none",
        letterSpacing: "-1px",
      }}>
        {value}
      </div>
    </div>
  );
}
