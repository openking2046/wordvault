/* eslint-disable react-hooks/exhaustive-deps */ // v3.9-noimport
/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/anchor-is-valid */
import { useState, useEffect, useCallback, useRef } from "react";

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
const NAV = [
  { icon: "☰", label: "单词库" },
  { icon: "+", label: "添加" },
  { icon: "◎", label: "Combo" },
  { icon: "▦", label: "进度" },
  { icon: "⊙", label: "设置" },
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

// Rank system - 23 ranks, based on words + streak days
const RANKS = [
  // 倔强青铜 (3)  0~100词, 0~60天
  { id:"b3", tier:"倔强青铜", name:"青铜 Ⅲ", color:"#a0522d", bg:"#fdf3ec", words:0,     days:0   },
  { id:"b2", tier:"倔强青铜", name:"青铜 Ⅱ", color:"#a0522d", bg:"#fdf3ec", words:34,    days:20  },
  { id:"b1", tier:"倔强青铜", name:"青铜 Ⅰ", color:"#a0522d", bg:"#fdf3ec", words:67,    days:40  },
  // 秩序白银 (3)  100~500词, 60~120天
  { id:"s3", tier:"秩序白银", name:"白银 Ⅲ", color:"#7a8fa6", bg:"#f0f4f8", words:100,   days:60  },
  { id:"s2", tier:"秩序白银", name:"白银 Ⅱ", color:"#7a8fa6", bg:"#f0f4f8", words:234,   days:80  },
  { id:"s1", tier:"秩序白银", name:"白银 Ⅰ", color:"#7a8fa6", bg:"#f0f4f8", words:367,   days:100 },
  // 荣耀黄金 (3)  500~1000词, 120~180天
  { id:"g3", tier:"荣耀黄金", name:"黄金 Ⅲ", color:"#c8900a", bg:"#fffbec", words:500,   days:120 },
  { id:"g2", tier:"荣耀黄金", name:"黄金 Ⅱ", color:"#c8900a", bg:"#fffbec", words:667,   days:150 },
  { id:"g1", tier:"荣耀黄金", name:"黄金 Ⅰ", color:"#c8900a", bg:"#fffbec", words:834,   days:165 },
  // 尊贵铂金 (3)  1000~5000词, 180~240天
  { id:"p3", tier:"尊贵铂金", name:"铂金 Ⅲ", color:"#2a9d8f", bg:"#edfaf8", words:1000,  days:180 },
  { id:"p2", tier:"尊贵铂金", name:"铂金 Ⅱ", color:"#2a9d8f", bg:"#edfaf8", words:2334,  days:200 },
  { id:"p1", tier:"尊贵铂金", name:"铂金 Ⅰ", color:"#2a9d8f", bg:"#edfaf8", words:3667,  days:220 },
  // 永恒钻石 (5)  5000~10000词, 240~300天
  { id:"d5", tier:"永恒钻石", name:"钻石 Ⅴ", color:"#1565c0", bg:"#e8f0fe", words:5000,  days:240 },
  { id:"d4", tier:"永恒钻石", name:"钻石 Ⅳ", color:"#1565c0", bg:"#e8f0fe", words:6200,  days:252 },
  { id:"d3", tier:"永恒钻石", name:"钻石 Ⅲ", color:"#1565c0", bg:"#e8f0fe", words:7400,  days:264 },
  { id:"d2", tier:"永恒钻石", name:"钻石 Ⅱ", color:"#1565c0", bg:"#e8f0fe", words:8600,  days:276 },
  { id:"d1", tier:"永恒钻石", name:"钻石 Ⅰ", color:"#1565c0", bg:"#e8f0fe", words:9800,  days:288 },
  // 至尊星耀 (5)  10000~20000词, 300~330天
  { id:"m5", tier:"至尊星耀", name:"星耀 Ⅴ", color:"#6a1b9a", bg:"#f5eeff", words:10000, days:300 },
  { id:"m4", tier:"至尊星耀", name:"星耀 Ⅳ", color:"#6a1b9a", bg:"#f5eeff", words:12000, days:306 },
  { id:"m3", tier:"至尊星耀", name:"星耀 Ⅲ", color:"#6a1b9a", bg:"#f5eeff", words:14000, days:312 },
  { id:"m2", tier:"至尊星耀", name:"星耀 Ⅱ", color:"#6a1b9a", bg:"#f5eeff", words:16000, days:318 },
  { id:"m1", tier:"至尊星耀", name:"星耀 Ⅰ", color:"#6a1b9a", bg:"#f5eeff", words:18000, days:324 },
  // 最强王者 (1)
  { id:"king", tier:"最强王者", name:"最强王者", color:"#b8860b", bg:"#fffde7", words:20000, days:365 },
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

  // Profile
  const [profile, setProfile] = useState(() => { try { const s = localStorage.getItem("wv_profile"); return s ? JSON.parse(s) : null; } catch { return null; } });
  const [showProfileSetup, setShowProfileSetup] = useState(() => !localStorage.getItem("wv_profile"));
  const [setupStep, setSetupStep] = useState(0); // 0=avatar, 1=name, 2=done
  const [setupAvatar, setSetupAvatar] = useState(0); // avatar id
  const [setupName, setSetupName] = useState("");
  const [editingProfile, setEditingProfile] = useState(false);
  const [headerExpanded, setHeaderExpanded] = useState(false);

  // XP & Tasks
  const [xp, setXp] = useState(() => parseInt(localStorage.getItem("wv_xp") || "0"));
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
  const [quizMode, setQuizMode] = useState("normal"); // "normal" | "review" | "wrong" | "listen" | "spell"
  const [quizLobby, setQuizLobby] = useState(true); // true = show game selection cards

  // Combo Pair Game state
  const [pairActive, setPairActive] = useState(false);
  const [pairCards, setPairCards] = useState([]); // {id, text, type:'word'|'meaning', wordId, pairKey, matched, selected, entering, wrong}
  const [pairSelected, setPairSelected] = useState(null);
  const [pairMatched, setPairMatched] = useState([]);
  const [pairTimer, setPairTimer] = useState(60);
  const [pairCombo, setPairCombo] = useState(0);
  const [pairMaxCombo, setPairMaxCombo] = useState(0);
  const [pairDone, setPairDone] = useState(false);
  const [pairScore, setPairScore] = useState(0);
  const [pairTotalMatched, setPairTotalMatched] = useState(0);
  const pairTimerRef = useRef(null);
  const pairPoolRef = useRef([]); // shuffled word pool for continuous flow
  const pairPoolIdxRef = useRef(0);
  const pairCardCounterRef = useRef(0); // unique id counter
  const pairSoundRef = useRef(null);
  const [isPro, setIsPro] = useState(() => localStorage.getItem("wv_pro") === "1");
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [spellingInput, setSpellingInput] = useState("");
  const [hintRevealed, setHintRevealed] = useState(0); // number of letters revealed
  const [wrongBank, setWrongBank] = useState(() => {
    try { return JSON.parse(localStorage.getItem("wv_wrong_bank") || "[]"); } catch { return []; }
  }); // array of word strings (English words)
  const [unlockedAchievements, setUnlockedAchievements] = useState(() => {
    try { return JSON.parse(localStorage.getItem("wv_achievements") || "[]"); } catch { return []; }
  });
  const [newAchievement, setNewAchievement] = useState(null); // shows popup
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0, wrongWords: [] });
  const [showSummary, setShowSummary] = useState(false);
  const [filterTag, setFilterTag] = useState("全部");
  const [searchQuery, setSearchQuery] = useState("");
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
        return next;
      } else if (!prev.lastDate) {
        // First time ever
        next = { count: 1, lastDate: today, showBroken: false };
        localStorage.setItem("wv_streak", JSON.stringify(next));
        setShowStreakModal(true);
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
    .filter(w => !searchQuery.trim() || w.word.toLowerCase().includes(searchQuery.toLowerCase()) || w.meaning.includes(searchQuery))
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
      const wrongWords = words.filter(w => wrongBank.includes(w.word));
      if (wrongWords.length === 0 || words.length < 4) return;
      pool = words; target = weightedPick(wrongWords, wrongBank);
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
      clearInterval(pairTimerRef.current);
    }
    prevTabRef.current = tab;
  }, [tab]);

  const showMsg = (text) => { setMsg(text); setTimeout(() => setMsg(""), 2500); };

  function saveProfile(avatar, name) {
    const p = { avatar, name: name.trim() || "匿名学习者", joinDate: profile?.joinDate || new Date().toISOString().slice(0,10) };
    setProfile(p);
    localStorage.setItem("wv_profile", JSON.stringify(p));
    setShowProfileSetup(false);
    setEditingProfile(false);
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
    if (correct) {
      try {
        const d = JSON.parse(localStorage.getItem("wv_today_correct") || "{}");
        const todayKey2 = new Date().toISOString().slice(0, 10);
        localStorage.setItem("wv_today_correct", JSON.stringify({ date: todayKey2, count: (d.date === todayKey2 ? d.count : 0) + 1 }));
      } catch {}
      setTimeout(() => { setSpellingInput(""); setHintRevealed(0); setQuizResult(null); startQuiz(); }, 1200);
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

    // Update mastery + schedule next review via Ebbinghaus
    setWords(ws => ws.map(w => {
      if (w.word !== quizState.correctWord) return w;
      const updated = scheduleReview(w, correct);
      return { ...updated, mastery: correct ? Math.min(5, w.mastery + 1) : Math.max(0, w.mastery - 1) };
    }));

    // Update wrong bank (store word string for reliability)
    if (!correct) {
      const wStr = quizState.correctWord;
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
    setSessionStats(s => {
      const newTotal = s.total + 1;
      const newCorrect = s.correct + (correct ? 1 : 0);
      const newWrong = correct ? s.wrongWords : [...new Set([...s.wrongWords, quizState.question])];
      if (newTotal % 10 === 0) {
        setTimeout(() => setShowSummary(true), 600);
      }
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
    setSessionStats(s => {
      const newTotal = s.total + 1;
      const newCorrect = s.correct + (correct ? 1 : 0);
      const newWrong = correct ? s.wrongWords : [...new Set([...s.wrongWords, quizState.correct])];
      if (newTotal % 10 === 0) setTimeout(() => setShowSummary(true), 600);
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
    <div style={{ fontFamily: "Inter, -apple-system, sans-serif", minHeight: "100vh", background: "#f2f2f7", color: "#111", display: "flex", flexDirection: "column" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input, textarea { background: #f7f7f7; border: 1px solid #e0e0e0; border-radius: 8px; color: #111; padding: 10px 14px; font-family: inherit; font-size: 14px; outline: none; width: 100%; transition: border 0.15s; }
        input:focus, textarea:focus { border-color: #111; background: #fff; }
        input::placeholder, textarea::placeholder { color: #777; }
        .btn { border-radius: 8px; padding: 10px 20px; cursor: pointer; font-family: inherit; font-size: 14px; font-weight: 500; border: none; transition: all 0.15s; display: inline-block; }
        .btn-dark { background: #111; color: #fff; }
        .btn-dark:hover { background: #333; }
        .btn-dark:disabled { background: #777; cursor: not-allowed; }
        .btn-outline { background: #fff; color: #111; border: 1.5px solid #ddd; }
        .btn-outline:hover { background: #f5f5f5; }
        .btn-sm { padding: 7px 14px; font-size: 13px; }
        .tag-pill { display: inline-block; padding: 5px 12px; border-radius: 20px; font-size: 12px; cursor: pointer; border: 1px solid #e0e0e0; background: #fff; color: #777; transition: all 0.12s; }
        .tag-pill.active { background: #111; color: #fff; border-color: #111; }
        .word-row { border-bottom: 1px solid #f2f2f2; padding: 9px 0; cursor: pointer; }
        .word-row:last-child { border-bottom: none; }
        .opt-btn { width: 100%; background: #fafafa; border: 1.5px solid #ebebeb; border-radius: 10px; padding: 14px 16px; text-align: left; font-family: inherit; font-size: 14px; color: #111; cursor: pointer; transition: all 0.12s; margin-bottom: 8px; }
        .opt-btn:hover:not(:disabled) { border-color: #111; background: #fff; }
        .opt-btn.correct { background: #f0faf4; border-color: #2d8a4e; }
        .opt-btn.wrong { background: #fff5f5; border-color: #e53e3e; }
.bottom-nav { position: fixed; bottom: 0; left: 0; right: 0; background: #fff; border-top: 1px solid #ebebeb; display: flex; justify-content: center; z-index: 100; padding-bottom: env(safe-area-inset-bottom, 8px); }
        .bottom-nav-inner { display: flex; width: 100%; max-width: 520px; align-items: flex-end; }
        .nav-item { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 6px 0 6px; cursor: pointer; gap: 3px; border: none; background: none; font-family: inherit; }
        .nav-item-center { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; padding: 0 0 6px; cursor: pointer; border: none; background: none; font-family: inherit; position: relative; }
        .nav-center-btn { width: 52px; height: 52px; border-radius: 50%; background: #111; display: flex; align-items: center; justify-content: center; margin-bottom: 3px; margin-top: -14px; box-shadow: 0 4px 14px rgba(0,0,0,0.22); transition: transform 0.15s; }
        .nav-item-center:active .nav-center-btn { transform: scale(0.9); }
        .nav-center-icon { font-size: 20px; line-height: 1; color: #fff; font-style: normal; }
        .nav-icon { font-size: 22px; line-height: 1; color: #888; font-style: normal; }
        .nav-label { font-size: 10px; color: #888; font-weight: 400; }
        .nav-item.active .nav-icon, .nav-item.active .nav-label { color: #111; font-weight: 600; }
        .nav-item-center .nav-label { color: #888; font-size: 10px; }
        .nav-item-center.active .nav-label { color: #111; font-weight: 600; }
        .nav-item-center.active .nav-center-btn { background: #000; }
        .toast { position: fixed; top: 64px; left: 50%; transform: translateX(-50%); background: #111; color: #fff; padding: 9px 18px; border-radius: 20px; font-size: 13px; z-index: 999; white-space: nowrap; }
        .sec-title { font-size: 11px; font-weight: 600; letter-spacing: 1.2px; text-transform: uppercase; color: #666; margin-bottom: 14px; }
        .mastery-bar { height: 3px; background: #f0f0f0; border-radius: 2px; overflow: hidden; margin-top: 5px; }
        .swipe-container { position: relative; overflow: hidden; }
        .swipe-content { transition: transform 0.25s ease; }
        .swipe-content.swiped { transform: translateX(-72px); }
        .swipe-delete { position: absolute; right: 0; top: 0; bottom: 0; width: 72px; background: #e53e3e; display: flex; align-items: center; justify-content: center; color: white; font-size: 13px; font-weight: 500; cursor: pointer; border-radius: 0 0 0 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #eee; }
        .tab-content { background: #f2f2f7; padding: 16px 16px 100px; flex: 1; overflow-y: auto; }

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

        /* Game card buttons */
        .game-card-btn {
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          user-select: none;
          -webkit-user-select: none;
          transition: border-color 0.08s ease, transform 0.08s ease;
        }
        .game-card-btn:active {
          border-color: #111 !important;
          box-shadow: 0 0 0 2px #111 !important;
          transform: scale(0.95);
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

          {/* Tap to start — shown before animation begins */}
          {!splashStarted && (
            <div style={{ textAlign: "center", position: "relative", zIndex: 1, animation: "splashWelcomeIn 0.8s ease both" }}>
              <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 56, color: "#fff", letterSpacing: "-1.5px", lineHeight: 1, marginBottom: 40,
                textShadow: "0 0 60px rgba(255,255,255,0.15)" }}>
                WordCombo
              </div>
              <div style={{ fontSize: 11, letterSpacing: "4px", color: "#555", textTransform: "uppercase",
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

            {/* Phase 3: Welcome + WordCombo */}
            {splashPhase >= 3 && (
              <div>
                {/* Divider line */}
                <div style={{ width: 40, height: 1, background: "rgba(255,255,255,0.15)", margin: "0 auto 20px", animation: "splashWelcomeIn 0.4s ease both" }} />

                {/* Welcome label */}
                <div style={{ fontSize: 11, letterSpacing: "4px", color: "#555", textTransform: "uppercase", marginBottom: 10,
                  animation: "splashWelcomeIn 0.5s ease 0.05s both" }}>
                  Welcome
                </div>

                {/* WordCombo big */}
                <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 56, color: "#fff", letterSpacing: "-1.5px", lineHeight: 1,
                  animation: "splashWordComboIn 0.7s cubic-bezier(0.22,1,0.36,1) 0.1s both",
                  textShadow: "0 0 60px rgba(255,255,255,0.15)" }}>
                  WordCombo
                </div>

                {/* Dots loading */}
                <div style={{ marginTop: 32, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
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
      <div style={{ background: "#f2f2f7", position: "sticky", top: 0, zIndex: 50, padding: "48px 16px 12px" }}>
        <div style={{ maxWidth: 520, margin: "0 auto" }}>
          <div style={{ background: "#fff", borderRadius: 22, padding: "16px 18px", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", cursor: "pointer" }}
            onClick={() => setHeaderExpanded(e => !e)}>

            {/* Collapsed row */}
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {/* Avatar */}
              {profile && <div style={{ flexShrink: 0 }}><SpriteAvatar id={profile.avatar} size={44} /></div>}

              {/* Name + title + stats */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {profile && (
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#888", marginBottom: 1 }}>{profile.name}</div>
                )}
                <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 22, color: "#111", letterSpacing: "-0.5px", lineHeight: 1.1 }}>
                  WordCombo
                </div>
                <div style={{ fontSize: 11, color: "#999", marginTop: 3 }}>
                  {words.length} 词 · 正确率 {correctRate}%
                </div>
              </div>

              {/* Rank + streak */}
              {(() => {
                const r = getRank(words.length, streakData.count);
                return (
                  <div style={{ flexShrink: 0, textAlign: "right" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: r.color, background: r.bg, border: "1px solid " + r.color + "66", borderRadius: 8, padding: "4px 10px", marginBottom: 4, whiteSpace: "nowrap" }}>
                      {r.name}
                    </div>
                    <div style={{ fontSize: 11, color: "#999" }}>
                      🔥 {streakData.count} 天连续
                    </div>
                  </div>
                );
              })()}

              {/* Arrow */}
              <div style={{ color: "#ccc", fontSize: 13, transition: "transform 0.3s", transform: headerExpanded ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0, marginLeft: 2 }}>▾</div>
            </div>

            {/* Expanded */}
            {headerExpanded && (() => {
              const r = getRank(words.length, streakData.count);
              const nextR = getNextRank(words.length, streakData.count);
              const mastered = words.filter(w => w.mastery >= 4).length;
              return (
                <div onClick={e => e.stopPropagation()} style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #f0f0f0", animation: "unlockSub 0.25s ease both" }}>
                  {/* Stats grid */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
                    {[["词库", words.length, "词"], ["掌握", mastered, "个"], ["正确率", correctRate, "%"], ["连续", streakData.count, "天"]].map(([label, val, unit]) => (
                      <div key={label} style={{ background: "#f7f7f7", borderRadius: 12, padding: "10px 6px", textAlign: "center" }}>
                        <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 19, color: "#111", lineHeight: 1 }}>
                          {val}<span style={{ fontSize: 10, color: "#bbb", marginLeft: 1 }}>{unit}</span>
                        </div>
                        <div style={{ fontSize: 10, color: "#aaa", marginTop: 3 }}>{label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Rank bar */}
                  <div style={{ background: "#f7f7f7", borderRadius: 12, padding: "12px 14px", marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: r.color }}>{r.name}</div>
                      {nextR && <div style={{ fontSize: 11, color: "#bbb" }}>距 {nextR.name} · {Math.max(0, nextR.words - words.length)} 词</div>}
                    </div>
                    <div style={{ height: 4, background: "#e8e8e8", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 2, background: r.color,
                        width: nextR ? Math.min(100, Math.round(Math.max(words.length - r.words, 0) / Math.max(nextR.words - r.words, 1) * 100)) + "%" : "100%" }} />
                    </div>
                  </div>

                  {/* Footer */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ fontSize: 11, color: "#bbb" }}>加入于 {profile?.joinDate || "—"}</div>
                    <button onClick={e => { e.stopPropagation(); setSetupAvatar(profile.avatar); setSetupName(profile.name); setEditingProfile(true); setHeaderExpanded(false); }}
                      style={{ fontSize: 11, color: "#666", background: "#f0f0f0", border: "none", borderRadius: 8, padding: "6px 14px", cursor: "pointer", fontFamily: "inherit" }}>
                      编辑资料
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="tab-content">
        <div style={{ maxWidth: 520, margin: "0 auto" }}>

        {/* Tab 0 */}
        {tab === 0 && (
          <div>
            {/* Search */}
            <div style={{ position: "relative", marginBottom: 14 }}>
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="搜索单词或释义…"
                style={{ paddingLeft: 36, background: "#f7f7f7", border: "1px solid #ebebeb" }} />
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#888", fontSize: 15, pointerEvents: "none" }}>⌕</span>
              {searchQuery && <button onClick={() => setSearchQuery("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: 16, lineHeight: 1 }}>×</button>}
            </div>
            {/* Free limit banner */}
            {!isPro && words.length >= FREE_LIMIT - 3 && (
              <div onClick={() => setShowUpgrade(true)}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: words.length >= FREE_LIMIT ? "#fff5f5" : "#fafafa", border: "1.5px solid " + (words.length >= FREE_LIMIT ? "#e53e3e" : "#e0e0e0"), borderRadius: 12, padding: "12px 16px", marginBottom: 14, cursor: "pointer" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: words.length >= FREE_LIMIT ? "#e53e3e" : "#555" }}>
                    {words.length >= FREE_LIMIT ? "已达免费上限" : `还能免费添加 ${FREE_LIMIT - words.length} 个词`}
                  </div>
                  <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>升级完整版，无限添加单词</div>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: words.length >= FREE_LIMIT ? "#e53e3e" : "#888" }}>升级 →</div>
              </div>
            )}

            {/* Review reminder banner */}
            {(() => {
              const due = getDueWords(words);
              if (due.length === 0) return null;
              return (
                <div onClick={() => { setQuizMode("review"); setTab(2); startQuiz("review"); }}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff8f0", border: "1.5px solid #f0a500", borderRadius: 12, padding: "12px 16px", marginBottom: 14, cursor: "pointer" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#b07800" }}>{due.length} 个单词需要复习</div>
                    <div style={{ fontSize: 11, color: "#c8900a", marginTop: 2 }}>根据艾宾浩斯记忆曲线，现在是最佳时机</div>
                  </div>
                  <div style={{ fontSize: 13, color: "#b07800", fontWeight: 700 }}>去复习 →</div>
                </div>
              );
            })()}

            {/* Tag filter */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
              {allTags.map(tag => <span key={tag} className={`tag-pill ${filterTag === tag ? "active" : ""}`} onClick={() => setFilterTag(tag)}>{tag}</span>)}
            </div>
            {/* Sort + Group toggle */}
            <div style={{ display: "flex", gap: 6, marginBottom: 16, justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 6 }}>
                {[["newest", "最新"], ["oldest", "最早"], ["alpha", "A→Z"]].map(([val, label]) => (
                  <button key={val} onClick={() => setSortOrder(val)} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 20, border: "1px solid " + (sortOrder === val ? "#111" : "#e0e0e0"), background: sortOrder === val ? "#111" : "#fff", color: sortOrder === val ? "#fff" : "#777", cursor: "pointer", fontFamily: "inherit", fontWeight: sortOrder === val ? 600 : 400, transition: "all 0.15s" }}>{label}</button>
                ))}
              </div>
              <button onClick={() => setGroupByTag(g => !g)} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 20, border: "1px solid " + (groupByTag ? "#111" : "#e0e0e0"), background: groupByTag ? "#111" : "#fff", color: groupByTag ? "#fff" : "#777", cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
                {groupByTag ? "取消分组" : "按标签"}
              </button>
            </div>
            {filteredWords.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#888" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: "#333", marginBottom: 6 }}>还没有单词</div>
                <div style={{ fontSize: 13, color: "#aaa" }}>点下方「+」添加第一个单词</div>
              </div>
            )}
            {/* Word cards - two-column masonry */}
            {(() => {
              const masteryDot = (m) => {
                const colors = ["#ddd","#d4a017","#c47a1e","#4a9d6f","#2d8a4e","#1a6e3c"];
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
                      boxShadow: isExpanded ? "0 8px 32px rgba(0,0,0,0.12)" : "0 2px 12px rgba(0,0,0,0.07)",
                      border: isExpanded ? "1.5px solid #111" : "1.5px solid transparent",
                      transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)",
                      cursor: "pointer",
                      position: "relative",
                      breakInside: "avoid",
                    }}>

                    {/* Mastery dot top-right */}
                    <div style={{ position: "absolute", top: 12, right: 12, display: "flex", alignItems: "center", gap: 4 }}>
                      {isWrong && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#e53e3e" }} />}
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: dot.color }} title={dot.label} />
                    </div>

                    {/* Word */}
                    <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 20, color: "#111", lineHeight: 1.15, marginBottom: 4, paddingRight: 20 }}>
                      {w.word}
                    </div>

                    {/* Phonetic + play */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                      {w.phonetic && <span style={{ fontSize: 11, color: "#aaa", fontStyle: "italic" }}>{w.phonetic}</span>}
                      <button onClick={e => { e.stopPropagation(); speak(w.word); }}
                        style={{ width: 24, height: 24, borderRadius: "50%", background: "#f5f5f5", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 10, color: "#555" }}>
                        ▶
                      </button>
                    </div>

                    {/* Meaning */}
                    <div style={{ fontSize: 12, color: "#555", lineHeight: 1.5, marginBottom: w.example ? 8 : 0 }}>
                      {w.meaning}
                    </div>

                    {/* Example */}
                    {w.example && (
                      <div style={{ fontSize: 11, color: "#aaa", fontStyle: "italic", lineHeight: 1.5, borderLeft: "2px solid #f0f0f0", paddingLeft: 8, marginBottom: 10 }}>
                        {w.example}
                      </div>
                    )}

                    {/* Tags */}
                    {(w.tags||[]).length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 6 }}>
                        {(w.tags||[]).map(t => (
                          <span key={t} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 8, background: "#f5f5f5", color: "#888", fontWeight: 500 }}>{t}</span>
                        ))}
                      </div>
                    )}

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div onClick={e => e.stopPropagation()} style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #f0f0f0" }}>
                        {editingWord?.id === w.id ? (
                          <div>
                            <input value={editingWord.word} onChange={e => setEditingWord(x => ({ ...x, word: e.target.value }))} placeholder="英文单词" style={{ marginBottom: 6, fontFamily: "DM Serif Display, serif", fontSize: 15 }} />
                            <input value={editingWord.meaning} onChange={e => setEditingWord(x => ({ ...x, meaning: e.target.value }))} placeholder="中文释义" style={{ marginBottom: 6, fontSize: 13 }} />
                            <input value={editingWord.example} onChange={e => setEditingWord(x => ({ ...x, example: e.target.value }))} placeholder="例句（可选）" style={{ marginBottom: 10, fontSize: 13 }} />
                            <div style={{ display: "flex", gap: 8 }}>
                              <button className="btn btn-dark btn-sm" onClick={saveEditWord}>保存</button>
                              <button className="btn btn-outline btn-sm" onClick={() => setEditingWord(null)}>取消</button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            {/* Review schedule */}
                            {(() => {
                              if (!w.nextReview) return <div style={{ fontSize: 11, color: "#bbb", marginBottom: 10 }}>尚未测验 · 答题后开始记忆追踪</div>;
                              const d = new Date(w.nextReview); d.setHours(0,0,0,0);
                              const t = new Date(); t.setHours(0,0,0,0);
                              const diff = Math.round((d - t) / 86400000);
                              const lvl = w.reviewLevel || 0;
                              return (
                                <div style={{ marginBottom: 12 }}>
                                  <div style={{ display: "flex", gap: 3, marginBottom: 5 }}>
                                    {REVIEW_INTERVALS.map((_, i) => (
                                      <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= lvl ? "#111" : "#f0f0f0" }} />
                                    ))}
                                  </div>
                                  <div style={{ fontSize: 11, color: diff <= 0 ? "#e53e3e" : "#aaa" }}>
                                    {diff <= 0 ? "今天需要复习" : `${diff} 天后复习`}
                                  </div>
                                </div>
                              );
                            })()}
                            {/* Tag management */}
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginBottom: 10 }}>
                              {(w.tags||[]).map(t => (
                                <span key={t} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 8, background: "#f0f0f0", color: "#555", display: "inline-flex", alignItems: "center", gap: 4 }}>
                                  {t}
                                  {confirmDeleteWordTag?.wordId === w.id && confirmDeleteWordTag?.tag === t ? (
                                    <>
                                      <span onClick={e => { e.stopPropagation(); setWords(ws => ws.map(x => x.id === w.id ? { ...x, tags: x.tags.filter(tg => tg !== t) } : x)); setConfirmDeleteWordTag(null); }} style={{ fontSize: 12, color: "#e53e3e", cursor: "pointer", fontWeight: 700 }}>✓</span>
                                      <span onClick={e => { e.stopPropagation(); setConfirmDeleteWordTag(null); }} style={{ fontSize: 12, color: "#888", cursor: "pointer" }}>✗</span>
                                    </>
                                  ) : (
                                    <span onClick={e => { e.stopPropagation(); setConfirmDeleteWordTag({ wordId: w.id, tag: t }); }} style={{ cursor: "pointer", opacity: 0.4, fontSize: 12 }}>×</span>
                                  )}
                                </span>
                              ))}
                              {editingWordTags === w.id ? (
                                <select defaultValue="" autoFocus onClick={e => e.stopPropagation()}
                                  onChange={e => { const tag = e.target.value; if (tag && !(w.tags||[]).includes(tag)) setWords(ws => ws.map(x => x.id === w.id ? { ...x, tags: [...(x.tags||[]), tag] } : x)); setEditingWordTags(null); }}
                                  onBlur={() => setEditingWordTags(null)}
                                  style={{ fontSize: 11, padding: "3px 6px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", fontFamily: "inherit" }}>
                                  <option value="">+ 标签</option>
                                  {userTags.filter(tg => !(w.tags||[]).includes(tg)).map(tg => <option key={tg} value={tg}>{tg}</option>)}
                                </select>
                              ) : (
                                <span onClick={e => { e.stopPropagation(); setEditingWordTags(w.id); }} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 8, border: "1px dashed #ccc", color: "#aaa", cursor: "pointer" }}>+ 标签</span>
                              )}
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                              <button className="btn btn-outline btn-sm" style={{ flex: 1 }} onClick={() => setEditingWord({ id: w.id, word: w.word, meaning: w.meaning, example: w.example || "" })}>编辑</button>
                              <button className="btn btn-outline btn-sm" style={{ color: "#e53e3e", borderColor: "#fecaca" }} onClick={() => deleteWord(w.id)}>删除</button>
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
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>{left.map(w => renderCard(w))}</div>
                    <div style={{ flex: 1 }}>{right.map(w => renderCard(w))}</div>
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
                  <div key={tag} style={{ marginBottom: 24 }}>
                    <div onClick={() => setExpandedTagGroup(g => ({ ...g, [tag]: g[tag] === false ? true : false }))}
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, cursor: "pointer" }}>
                      <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#111" }}>{tag}</span>
                      <span style={{ fontSize: 11, color: "#aaa" }}>{tagWords.length} 词 {expandedTagGroup[tag] === false ? "▼" : "▲"}</span>
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
                <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 22, color: "#111", letterSpacing: "-0.5px" }}>收录新词</div>
                <div style={{ fontSize: 11, color: "#aaa", marginTop: 2 }}>今日已收录 <span style={{ color: "#111", fontWeight: 700 }}>{todayWords}</span> 个词</div>
              </div>
              {/* Combo badge */}
              <div style={{ textAlign: "center", background: todayWords >= 3 ? "#111" : "#f5f5f5", borderRadius: 14, padding: "8px 14px", transition: "background 0.3s" }}>
                <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 26, color: todayWords >= 3 ? "#fff" : "#111", lineHeight: 1 }}>
                  {todayWords >= 10 ? "🔥" : todayWords >= 5 ? "⚡" : todayWords >= 3 ? "✦" : "＋"}
                  {todayWords}
                </div>
                <div style={{ fontSize: 9, color: todayWords >= 3 ? "#888" : "#bbb", letterSpacing: "1.5px", marginTop: 2 }}>
                  {todayWords >= 10 ? "ON FIRE" : todayWords >= 5 ? "COMBO" : todayWords >= 3 ? "STREAK" : "TODAY"}
                </div>
              </div>
            </div>

            {/* Live word card preview */}
            {(newWord || newMeaning) && (
              <div style={{ background: "#111", borderRadius: 18, padding: "18px 20px", marginBottom: 20, animation: "unlockSub 0.3s ease both" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                  <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 26, color: newWord ? "#fff" : "#333", letterSpacing: "-0.3px" }}>
                    {newWord || "单词"}
                  </div>
                  <div style={{ fontSize: 10, color: "#333", letterSpacing: "2px", background: "#1a1a1a", borderRadius: 6, padding: "3px 8px" }}>PREVIEW</div>
                </div>
                {newMeaning ? (
                  <div style={{ fontSize: 14, color: "#aaa", marginBottom: newExample ? 10 : 0 }}>{newMeaning}</div>
                ) : (
                  <div style={{ fontSize: 13, color: "#2a2a2a", fontStyle: "italic" }}>释义将出现在这里…</div>
                )}
                {newExample && (
                  <div style={{ fontSize: 12, color: "#555", fontStyle: "italic", borderLeft: "2px solid #2a2a2a", paddingLeft: 10, marginTop: 8, lineHeight: 1.5 }}>
                    {newExample}
                  </div>
                )}
                {newTags.length > 0 && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
                    {newTags.map(t => <span key={t} style={{ fontSize: 10, color: "#555", background: "#1a1a1a", borderRadius: 6, padding: "3px 8px", border: "1px solid #2a2a2a" }}>{t}</span>)}
                  </div>
                )}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Word input + AI */}
              <div>
                <div style={{ fontSize: 11, color: "#888", fontWeight: 600, letterSpacing: "0.5px", marginBottom: 6, textTransform: "uppercase" }}>英文单词</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input value={newWord} onChange={e => setNewWord(e.target.value)}
                    placeholder="e.g. Tenacious"
                    style={{ flex: 1, fontSize: 17, fontWeight: 500, background: "#fff", border: "1.5px solid #ebebeb", borderRadius: 12 }}
                    onKeyDown={e => e.key === "Enter" && !aiLoading && newWord.trim() && handleAIGenerate()} />
                  <button onClick={handleAIGenerate} disabled={aiLoading || !newWord.trim()}
                    style={{ whiteSpace: "nowrap", background: (!aiLoading && newWord.trim()) ? "#111" : "#f0f0f0",
                      color: (!aiLoading && newWord.trim()) ? "#fff" : "#ccc",
                      border: "none", borderRadius: 12, padding: "0 16px", fontSize: 13, fontWeight: 700,
                      cursor: (!aiLoading && newWord.trim()) ? "pointer" : "not-allowed", fontFamily: "inherit",
                      transition: "all 0.2s", display: "flex", alignItems: "center", gap: 6 }}>
                    {aiLoading ? (
                      <span style={{ display: "inline-block", animation: "cursorBlink 0.6s ease infinite" }}>✦</span>
                    ) : "✦ AI"}
                  </button>
                </div>
                {!newWord && <div style={{ fontSize: 11, color: "#ccc", marginTop: 5 }}>输入后按 Enter 让 AI 自动填写</div>}
              </div>

              {/* Meaning */}
              <div>
                <div style={{ fontSize: 11, color: "#888", fontWeight: 600, letterSpacing: "0.5px", marginBottom: 6, textTransform: "uppercase" }}>中文释义</div>
                <input value={newMeaning} onChange={e => setNewMeaning(e.target.value)}
                  placeholder="e.g. 坚韧的，顽强的"
                  style={{ background: "#fff", border: "1.5px solid #ebebeb", borderRadius: 12 }} />
              </div>

              {/* Example — collapsible hint */}
              <div>
                <div style={{ fontSize: 11, color: "#888", fontWeight: 600, letterSpacing: "0.5px", marginBottom: 6, textTransform: "uppercase" }}>
                  例句 <span style={{ color: "#ccc", fontWeight: 400, textTransform: "none" }}>（可选）</span>
                </div>
                <textarea value={newExample} onChange={e => setNewExample(e.target.value)}
                  placeholder="e.g. She was tenacious in pursuing her goals." rows={2}
                  style={{ resize: "none", background: "#fff", border: "1.5px solid #ebebeb", borderRadius: 12, lineHeight: 1.5 }} />
              </div>

              {/* Tags — compact */}
              <div>
                <div style={{ fontSize: 11, color: "#888", fontWeight: 600, letterSpacing: "0.5px", marginBottom: 8, textTransform: "uppercase" }}>标签</div>
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
                <div style={{ display: "flex", gap: 8 }}>
                  <input value={customTag} onChange={e => setCustomTag(e.target.value)}
                    placeholder="新标签…" style={{ background: "#fff", border: "1.5px solid #ebebeb", borderRadius: 10 }}
                    onKeyDown={e => e.key === "Enter" && addCustomTag()} />
                  <button className="btn btn-outline btn-sm" onClick={addCustomTag} style={{ borderRadius: 10 }}>添加</button>
                </div>
                <div style={{ fontSize: 10, color: "#ccc", marginTop: 6 }}>双击标签可修改名称</div>
              </div>

              {/* Unlock button */}
              <button onClick={handleAddWord}
                disabled={!newWord.trim() || !newMeaning.trim()}
                style={{ width: "100%", marginTop: 4, padding: "17px 0", borderRadius: 16, border: "none", fontFamily: "inherit", fontWeight: 700, fontSize: 16, cursor: (!newWord.trim() || !newMeaning.trim()) ? "not-allowed" : "pointer",
                  background: (!newWord.trim() || !newMeaning.trim()) ? "#f0f0f0" : "#111",
                  color: (!newWord.trim() || !newMeaning.trim()) ? "#ccc" : "#fff",
                  transition: "all 0.2s", letterSpacing: "0.3px" }}>
                {(!newWord.trim() || !newMeaning.trim()) ? "填写单词和释义后解锁" : `🔓 收录「${newWord.trim()}」`}
              </button>

              {/* Word count bar */}
              {!isPro && (
                <div style={{ textAlign: "center" }}>
                  <div style={{ height: 3, background: "#f0f0f0", borderRadius: 2, overflow: "hidden", marginBottom: 6 }}>
                    <div style={{ height: "100%", background: words.length >= FREE_LIMIT ? "#e53e3e" : "#111", borderRadius: 2, width: Math.min(100, words.length / FREE_LIMIT * 100) + "%", transition: "width 0.4s" }} />
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
          {quizLobby && !pairActive && (
            <div>
              <div style={{ marginBottom: 22, textAlign: "center" }}>
                <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 26, color: "#111", letterSpacing: "-0.5px" }}>Combo 挑战</div>
                <div style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>练习词库 · 积累 Combo · 提升段位</div>
              </div>
              {(() => {
                const dueCount = getDueWords(words).length;
                const wrongCount = wrongBank.filter(ww => words.find(x => x.word === ww)).length;
                const games = [
                  { id: "normal",    num: 1, icon: "📖", name: "释义选词", desc: "看单词，选正确释义", sub: "经典模式", color: "#111" },
                  { id: "listen",    num: 2, icon: "🔊", name: "听音辨词", desc: "听发音，判断正确单词", sub: "耳力训练", color: "#2d6bcf" },
                  { id: "spell",     num: 3, icon: "✍️", name: "拼写练习", desc: "看释义，打出完整单词", sub: "手感养成", color: "#7c3aed" },
                  { id: "review",    num: 4, icon: "🧠", name: "遗忘复习", desc: "艾宾浩斯曲线追踪复习", sub: dueCount > 0 ? dueCount + " 词待复习" : "记忆巩固", color: dueCount > 0 ? "#d97706" : "#2d8a4e", alert: dueCount > 0 },
                  { id: "wrong",     num: 5, icon: "🎯", name: "错词研究", desc: "专项攻克做错的单词", sub: wrongCount > 0 ? wrongCount + " 词待攻克" : "暂无错词", color: wrongCount > 0 ? "#e53e3e" : "#888", alert: wrongCount > 0 },
                  { id: "battle",    num: 6, icon: "⚡", name: "限时挑战", desc: "60秒内答对最多题，生成战绩图", sub: "高压竞速", color: "#c2410c" },
                  { id: "pair",      num: 7, icon: "🔗", name: "Combo配对", desc: "点击配对单词与释义，连击得分", sub: "连击模式", color: "#0891b2" },
                  { id: "challenge", num: 8, icon: "👥", name: "好友挑战", desc: "选词生成链接，发给朋友对战", sub: "社交对战", color: "#7c3aed" },
                ];
                const left = games.filter((_, i) => i % 2 === 0);
                const right = games.filter((_, i) => i % 2 === 1);
                const renderCard = (g) => {
                  let touchStartY = 0;
                  let touchStartX = 0;
                  function onTouchStart(e) {
                    touchStartY = e.touches[0].clientY;
                    touchStartX = e.touches[0].clientX;
                  }
                  function onTouchEnd(e) {
                    const dy = Math.abs(e.changedTouches[0].clientY - touchStartY);
                    const dx = Math.abs(e.changedTouches[0].clientX - touchStartX);
                    if (dy > 8 || dx > 8) return; // was a scroll, ignore
                    e.preventDefault();
                    haptic("medium");
                    if (g.id === "pair") { startPairGame(); setQuizLobby(false); }
                    else if (g.id === "challenge") { setShowCreateChallenge(true); setGeneratedLink(""); setChallengeSelectedWords([]); }
                    else if (g.id === "battle") { setQuizMode("battle"); setQuizLobby(false); if (!battleActive && !showBattleResult) startBattle(); }
                    else { setQuizMode(g.id); setQuizResult(null); setSpellingInput(""); setHintRevealed(0); startQuiz(g.id); setQuizLobby(false); }
                  }
                  return (
                    <div key={g.id}
                      onTouchStart={onTouchStart}
                      onTouchEnd={onTouchEnd}
                      onClick={() => {
                        haptic("medium");
                        if (g.id === "pair") { startPairGame(); setQuizLobby(false); }
                        else if (g.id === "challenge") { setShowCreateChallenge(true); setGeneratedLink(""); setChallengeSelectedWords([]); }
                        else if (g.id === "battle") { setQuizMode("battle"); setQuizLobby(false); if (!battleActive && !showBattleResult) startBattle(); }
                        else { setQuizMode(g.id); setQuizResult(null); setSpellingInput(""); setHintRevealed(0); startQuiz(g.id); setQuizLobby(false); }
                      }}
                      role="button"
                      className="game-card-btn"
                      style={{ display: "flex", flexDirection: "column", justifyContent: "space-between",
                        width: "100%", textAlign: "left", fontFamily: "inherit",
                        background: "#fff", borderRadius: 18, padding: "18px 16px", marginBottom: 10,
                        boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
                        border: g.alert ? "2.5px solid " + g.color + "44" : "2.5px solid transparent",
                        minHeight: 150, cursor: "pointer",
                        position: "relative", overflow: "hidden",
                        userSelect: "none" }}
                    >
                      <div style={{ position: "absolute", top: -8, right: 10,
                        fontFamily: "DM Serif Display, serif", fontSize: 88, fontWeight: 700, lineHeight: 1,
                        color: g.color, opacity: 0.07, userSelect: "none", pointerEvents: "none", letterSpacing: "-4px"
                      }}>{g.num}</div>
                      <div style={{ position: "relative", pointerEvents: "none" }}>
                        <div style={{ fontSize: 28, marginBottom: 10 }}>{g.icon}</div>
                        <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 17, color: "#111", marginBottom: 5, letterSpacing: "-0.3px" }}>{g.name}</div>
                        <div style={{ fontSize: 11, color: "#999", lineHeight: 1.5 }}>{g.desc}</div>
                      </div>
                      <div style={{ marginTop: 14, position: "relative", pointerEvents: "none" }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: g.color, background: g.color + "14", borderRadius: 6, padding: "3px 8px" }}>{g.sub}</span>
                      </div>
                    </div>
                  );
                };
                return (
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>{left.map(renderCard)}</div>
                    <div style={{ flex: 1 }}>{right.map(renderCard)}</div>
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

          {/* ── ACTIVE QUIZ ── */}
          {!quizLobby && !pairActive && (
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
              {quizMode === "wrong" && wrongBank.length === 0 && (
                <div style={{ textAlign: "center", padding: "48px 0" }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>✓</div>
                  <div style={{ fontSize: 15, fontWeight: 500, color: "#111", marginBottom: 6 }}>错词库是空的</div>
                  <div style={{ fontSize: 13, color: "#888" }}>做题时答错的词会自动加入这里</div>
                </div>
              )}

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
                      <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 30, color: "#111", marginBottom: 8, lineHeight: 1.3 }}>{quizState.question}</div>

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
                          } else if (!isDone && typed) { bg = "#fff"; borderColor = "#111"; color = "#111"; }
                          return (
                            <div key={i} style={{ width: 36, height: 44, borderRadius: 9, background: bg, border: "2px solid " + borderColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color, fontFamily: "DM Serif Display, serif", transition: "all 0.15s" }}>
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
                            <button onClick={() => { if (spellingInput.trim()) submitSpelling(); }}
                              style={{ width: "100%", padding: "15px 0", borderRadius: 14, border: "none", fontFamily: "inherit", fontWeight: 700, fontSize: 16, marginBottom: 10,
                                background: isComplete ? "#111" : "#f0f0f0",
                                color: isComplete ? "#fff" : "#bbb",
                                transition: "all 0.2s", cursor: isComplete ? "pointer" : "default" }}>
                              {isComplete ? "✓  确认答案" : "还差 " + (quizState.correct.length - spellingInput.length) + " 个字母"}
                            </button>
                            <div style={{ display: "flex", gap: 8 }}>
                              <input
                                value={spellingInput}
                                onChange={e => {
                                  const val = e.target.value.replace(/[^a-zA-Z\-']/g, "");
                                  setSpellingInput(val);
                                  // Auto-submit when full length reached
                                  if (val.length >= quizState.correct.length) {
                                    setTimeout(() => submitSpelling(), 280);
                                  }
                                }}
                                placeholder={"输入 " + quizState.correct.length + " 个字母…"}
                                maxLength={quizState.correct.length + 1}
                                autoCapitalize="none" autoCorrect="off" spellCheck={false}
                                onKeyDown={e => { if (e.key === "Enter" && spellingInput.trim()) submitSpelling(); }}
                                style={{ flex: 1, fontSize: 18, fontWeight: 600, letterSpacing: "3px", textAlign: "center", borderRadius: 12, border: "2px solid #e0e0e0", padding: "12px 10px", fontFamily: "DM Serif Display, serif", background: "#fff", boxSizing: "border-box" }}
                              />
                              <button onClick={() => setHintRevealed(h => Math.min(h + 1, quizState.correct.length))}
                                style={{ padding: "12px 14px", borderRadius: 12, border: "1.5px solid #e0e0e0", background: "#fff", color: "#888", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
                                💡 提示
                              </button>
                            </div>
                          </div>
                        );
                      })()}

                      {/* ✅ Correct — green flash, auto-advances in 1.2s */}
                      {quizResult === "correct" && (
                        <div style={{ background: "#f0faf4", border: "2px solid #2d8a4e", borderRadius: 14, padding: "20px", textAlign: "center", animation: "unlockBadge 0.3s ease both" }}>
                          <div style={{ fontSize: 32, marginBottom: 4 }}>✓</div>
                          <div style={{ fontSize: 17, fontWeight: 700, color: "#2d8a4e" }}>拼写正确！</div>
                          <div style={{ fontSize: 11, color: "#aaa", marginTop: 6 }}>自动进入下一题…</div>
                        </div>
                      )}

                      {/* ❌ Wrong — show answer, user must retype to unlock next */}
                      {quizResult === "wrong" && (
                        <div>
                          <div style={{ background: "#fff5f5", border: "2px solid #e53e3e", borderRadius: 14, padding: "16px 18px", marginBottom: 14 }}>
                            <div style={{ fontSize: 12, color: "#e53e3e", fontWeight: 600, marginBottom: 10 }}>✗ 拼写有误，正确答案：</div>
                            <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 26, color: "#111", letterSpacing: "3px", fontWeight: 700, textAlign: "center", marginBottom: 10 }}>{quizState.correct}</div>
                            <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                              {quizState.correct.split("").map((letter, i) => {
                                const typed = (spellingInput[i] || "").toLowerCase();
                                const ok = typed === letter.toLowerCase();
                                return <div key={i} style={{ width: 28, height: 32, borderRadius: 7, background: ok ? "#f0faf4" : "#fff0f0", border: "1.5px solid " + (ok ? "#2d8a4e" : "#e53e3e"), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: ok ? "#2d8a4e" : "#e53e3e", fontFamily: "DM Serif Display, serif" }}>{letter}</div>;
                              })}
                            </div>
                          </div>
                          <div style={{ fontSize: 11, color: "#888", marginBottom: 10, textAlign: "center" }}>
                            {spellingInput.trim().toLowerCase() === quizState.correct.toLowerCase() ? "✓ 纠正完成，可以继续" : "请输入正确答案以继续 👇"}
                          </div>
                          <input
                            value={spellingInput}
                            onChange={e => setSpellingInput(e.target.value.replace(/[^a-zA-Z\-']/g, ""))}
                            placeholder={"重新拼写: " + quizState.correct}
                            maxLength={quizState.correct.length + 2}
                            autoCapitalize="none" autoCorrect="off" spellCheck={false}
                            style={{ width: "100%", fontSize: 18, fontWeight: 600, letterSpacing: "3px", textAlign: "center", borderRadius: 12,
                              border: "2px solid " + (spellingInput.trim().toLowerCase() === quizState.correct.toLowerCase() ? "#2d8a4e" : "#e0e0e0"),
                              padding: "12px 10px", marginBottom: 10, fontFamily: "DM Serif Display, serif",
                              background: spellingInput.trim().toLowerCase() === quizState.correct.toLowerCase() ? "#f0faf4" : "#fff",
                              color: spellingInput.trim().toLowerCase() === quizState.correct.toLowerCase() ? "#2d8a4e" : "#111",
                              boxSizing: "border-box" }}
                          />
                          <button
                            onClick={() => { setSpellingInput(""); setHintRevealed(0); setQuizResult(null); startQuiz(); }}
                            disabled={spellingInput.trim().toLowerCase() !== quizState.correct.toLowerCase()}
                            style={{ width: "100%", padding: "15px 0", borderRadius: 14, border: "none", fontFamily: "inherit", fontWeight: 700, fontSize: 16,
                              background: spellingInput.trim().toLowerCase() === quizState.correct.toLowerCase() ? "#111" : "#f0f0f0",
                              color: spellingInput.trim().toLowerCase() === quizState.correct.toLowerCase() ? "#fff" : "#ccc",
                              cursor: spellingInput.trim().toLowerCase() === quizState.correct.toLowerCase() ? "pointer" : "not-allowed", transition: "all 0.2s" }}>
                            {spellingInput.trim().toLowerCase() === quizState.correct.toLowerCase() ? "下一题 →" : "输入正确拼写后继续"}
                          </button>
                        </div>
                      )}
                    </div>
                  ) : quizState.isListen ? (
                    <div>
                      <div style={{ marginBottom: 28, textAlign: "center" }}>
                        <div style={{ fontSize: 11, color: "#777", marginBottom: 20, letterSpacing: "0.5px", textTransform: "uppercase" }}>听音辨词 — 选出你听到的单词</div>
                        <button onClick={() => speak(quizState.question)} style={{ width: 96, height: 96, borderRadius: "50%", background: "#111", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", transition: "transform 0.1s" }} onMouseDown={e => e.currentTarget.style.transform = "scale(0.93)"} onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}>
                          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                        </button>
                        <div style={{ fontSize: 12, color: "#aaa" }}>点击喇叭播放，可重复收听</div>
                        {quizResult && <div style={{ marginTop: 16, padding: "12px 20px", background: "#f7f7f7", borderRadius: 12, display: "inline-block" }}><div style={{ fontFamily: "DM Serif Display, serif", fontSize: 28, color: "#111" }}>{quizState.question}</div><div style={{ fontSize: 13, color: "#777", marginTop: 4 }}>{quizState.meaning}</div>{quizState.example && <div style={{ fontSize: 12, color: "#aaa", fontStyle: "italic", marginTop: 4 }}>{quizState.example}</div>}</div>}
                      </div>
                      <div key={quizState.question + quizState.options.join()}>
                        {quizState.options.map((opt, i) => { let cls = "opt-btn"; if (quizResult) { if (opt === quizState.correct) cls += " correct"; else if (quizResult === "wrong") cls += " wrong"; } return <button key={i} className={cls} disabled={!!quizResult} onClick={e => { e.currentTarget.blur(); handleMCQ(opt); }}><span style={{ color: "#777", marginRight: 10, fontSize: 12, fontWeight: 500 }}>{String.fromCharCode(65+i)}</span>{opt}</button>; })}
                      </div>
                      {quizResult && <div style={{ marginTop: 20, textAlign: "center" }}><div style={{ fontSize: 14, fontWeight: 500, color: quizResult === "correct" ? "#2d8a4e" : "#e53e3e", marginBottom: 16 }}>{quizResult === "correct" ? "正确 ✓" : "正确答案：" + quizState.correct}</div><button className="btn btn-dark" onClick={() => startQuiz()}>下一题</button></div>}
                    </div>
                  ) : (
                    <div>
                      <div style={{ marginBottom: 28 }}>
                        <div style={{ fontSize: 11, color: "#777", marginBottom: 10, letterSpacing: "0.5px", textTransform: "uppercase" }}>选择正确的中文释义</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                          <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 36, color: "#111", lineHeight: 1.1 }}>{quizState.question}</div>
                          <button onClick={() => speak(quizState.question)} style={{ background: "#f2f2f2", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, color: "#444", padding: "4px 10px", fontWeight: 500 }}>▶</button>
                        </div>
                        {quizState.example && <div style={{ fontSize: 13, color: "#777", fontStyle: "italic", lineHeight: 1.5 }}>{quizState.example}</div>}
                      </div>
                      <div key={quizState.question + quizState.options.join()}>
                        {quizState.options.map((opt, i) => { let cls = "opt-btn"; if (quizResult) { if (opt === quizState.correct) cls += " correct"; else if (quizResult === "wrong") cls += " wrong"; } return <button key={i} className={cls} disabled={!!quizResult} onClick={e => { e.currentTarget.blur(); handleMCQ(opt); }}><span style={{ color: "#777", marginRight: 10, fontSize: 12, fontWeight: 500 }}>{String.fromCharCode(65+i)}</span>{opt}</button>; })}
                      </div>
                      {quizResult && <div style={{ marginTop: 20, textAlign: "center" }}><div style={{ fontSize: 14, fontWeight: 500, color: quizResult === "correct" ? "#2d8a4e" : "#e53e3e", marginBottom: 16 }}>{quizResult === "correct" ? "正确 ✓" : "答案是：" + quizState.correct}</div><button className="btn btn-dark" onClick={() => startQuiz()}>下一题</button></div>}
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
                <div style={{ background: "#111", borderRadius: 16, padding: "16px 20px", marginBottom: 24, display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: "#222", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 18, color: "#fff" }}>Lv{level}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <div style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>{xp} XP</div>
                      <div style={{ fontSize: 11, color: "#555" }}>下一级 {100 - progress} XP</div>
                    </div>
                    <div style={{ height: 5, background: "#2a2a2a", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: progress + "%", background: "#FFD700", borderRadius: 3, transition: "width 0.6s cubic-bezier(0.34,1.56,0.64,1)" }} />
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Task Tabs */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              {[["daily","每日任务"],["achievement","成就"]].map(([key, label]) => (
                <button key={key} onClick={() => setTaskTab(key)}
                  style={{ flex: 1, padding: "9px 0", borderRadius: 10, border: "1.5px solid " + (taskTab === key ? "#111" : "#e8e8e8"), background: taskTab === key ? "#111" : "#fff", color: taskTab === key ? "#fff" : "#888", fontFamily: "inherit", fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}>
                  {label}
                  {key === "daily" && (() => {
                    const ctx = getTaskCtx();
                    const claimable = TASKS.filter(t => t.type === "daily" && !isTaskDone(t) && t.progress(ctx) >= t.target).length;
                    return claimable > 0 ? <span style={{ marginLeft: 6, background: "#e53e3e", color: "#fff", borderRadius: 10, padding: "1px 6px", fontSize: 10 }}>{claimable}</span> : null;
                  })()}
                </button>
              ))}
            </div>

            {/* Task List */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
              {(() => {
                const ctx = getTaskCtx();
                const tasks = TASKS.filter(t => t.type === taskTab);
                return tasks.map(task => {
                  const done = isTaskDone(task);
                  const prog = Math.min(task.progress(ctx), task.target);
                  const pct = Math.round(prog / task.target * 100);
                  const claimable = !done && prog >= task.target;
                  return (
                    <div key={task.id} style={{ border: "1.5px solid " + (done ? "#e8f5e9" : claimable ? "#111" : "#ebebeb"), borderRadius: 14, padding: "14px 16px", background: done ? "#f9fdf9" : "#fff", opacity: done ? 0.7 : 1, transition: "all 0.2s" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ fontSize: 28, flexShrink: 0, width: 40, textAlign: "center" }}>{task.icon}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                            <div style={{ fontSize: 14, fontWeight: 600, color: done ? "#2d8a4e" : "#111" }}>{task.title}</div>
                            {done && <span style={{ fontSize: 11, color: "#2d8a4e" }}>✓ 已完成</span>}
                          </div>
                          <div style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>{task.desc}</div>
                          {/* Progress bar */}
                          <div style={{ height: 4, background: "#f0f0f0", borderRadius: 2, overflow: "hidden", marginBottom: 4 }}>
                            <div style={{ height: "100%", width: pct + "%", background: done ? "#2d8a4e" : claimable ? "#111" : "#ddd", borderRadius: 2, transition: "width 0.5s ease" }} />
                          </div>
                          <div style={{ fontSize: 11, color: "#aaa" }}>{prog} / {task.target}</div>
                        </div>
                        <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "#FFD700", background: "#111", borderRadius: 8, padding: "3px 8px" }}>+{task.xp} XP</div>
                          {claimable && (
                            <button onClick={() => claimTask(task)}
                              style={{ background: "#111", color: "#fff", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
                              领取
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
            <div className="sec-title">今日目标</div>
            <div style={{ border: "1px solid #ebebeb", borderRadius: 12, padding: 20, marginBottom: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 22, color: "#111" }}>
                    {todayWords >= dailyGoal ? "目标完成 ✓" : `今天还差 ${Math.max(0, dailyGoal - todayWords)} 个单词`}
                  </div>
                  <div style={{ fontSize: 12, color: "#888", marginTop: 3 }}>已添加 {todayWords} / 目标 {dailyGoal} 个新单词</div>
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
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#888", marginBottom: 6 }}>
                  <span>新增单词</span>
                  <span>{todayWords}/{dailyGoal}</span>
                </div>
                <div style={{ height: 8, background: "#f0f0f0", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min(100, todayWords / dailyGoal * 100)}%`, background: todayWords >= dailyGoal ? "#2d8a4e" : "#111", borderRadius: 4, transition: "width 0.4s" }} />
                </div>
              </div>

              {/* Quiz goal progress bar */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#888", marginBottom: 6 }}>
                  <span>今日答题</span>
                  <span>{todayQuizzes}/{dailyGoal * 4}</span>
                </div>
                <div style={{ height: 8, background: "#f0f0f0", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${Math.min(100, todayQuizzes / (dailyGoal * 4) * 100)}%`, background: todayQuizzes >= dailyGoal * 4 ? "#2d8a4e" : "#111", borderRadius: 4, transition: "width 0.4s" }} />
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
              const wrongCount = wrongBank.filter(ww => words.find(x => x.word === ww)).length;
              if (due.length === 0 && wrongCount === 0) return null;
              return (
                <div style={{ marginBottom: 28 }}>
                  <div className="sec-title">今日待办</div>
                  <div style={{ display: "flex", gap: 10 }}>
                    {due.length > 0 && (
                      <div onClick={() => { setQuizMode("review"); setTab(2); startQuiz("review"); }}
                        style={{ flex: 1, border: "1.5px solid #c8900a", borderRadius: 12, padding: 14, background: "#fffbec", cursor: "pointer" }}>
                        <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 28, color: "#c8900a" }}>{due.length}</div>
                        <div style={{ fontSize: 11, color: "#b07800", fontWeight: 600 }}>词待复习</div>
                        <div style={{ fontSize: 10, color: "#c8900a", marginTop: 4 }}>点击开始</div>
                      </div>
                    )}
                    {wrongCount > 0 && (
                      <div onClick={() => { setQuizMode("wrong"); setTab(2); startQuiz("wrong"); }}
                        style={{ flex: 1, border: "1.5px solid #e53e3e", borderRadius: 12, padding: 14, background: "#fff5f5", cursor: "pointer" }}>
                        <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 28, color: "#e53e3e" }}>{wrongCount}</div>
                        <div style={{ fontSize: 11, color: "#c53030", fontWeight: 600 }}>词在错词库</div>
                        <div style={{ fontSize: 10, color: "#e53e3e", marginTop: 4 }}>点击开始</div>
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
          <div style={{ maxWidth: 480, display: "flex", flexDirection: "column", gap: 28 }}>

            {/* Profile Card */}
            {profile && (
              <div>
                <div style={{ background: "#111", borderRadius: 20, padding: 24, color: "#fff", position: "relative" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                    <SpriteAvatar id={profile.avatar} size={64} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 22, color: "#fff", marginBottom: 3 }}>{profile.name}</div>
                      <div style={{ fontSize: 12, color: "#555" }}>加入于 {profile.joinDate}</div>
                    </div>
                    <button onClick={() => { setSetupAvatar(profile.avatar); setSetupName(profile.name); setEditingProfile(true); }}
                      style={{ background: "#1e1e1e", border: "1px solid #333", borderRadius: 8, color: "#888", fontSize: 12, padding: "6px 12px", cursor: "pointer", fontFamily: "inherit" }}>编辑</button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                    {[
                      ["词库", words.length + " 词"],
                      ["连续", streakData.count + " 天"],
                      ["正确率", (score.total ? Math.round(score.correct/score.total*100) : 0) + "%"],
                    ].map(([label, val]) => (
                      <div key={label} style={{ background: "#1a1a1a", borderRadius: 12, padding: "12px 10px", textAlign: "center" }}>
                        <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 20, color: "#fff", marginBottom: 2 }}>{val}</div>
                        <div style={{ fontSize: 11, color: "#555" }}>{label}</div>
                      </div>
                    ))}
                  </div>
                  {/* Rank badge */}
                  {(() => {
                    const r = getRank(words.length, streakData.count);
                    return (
                      <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", background: "#1a1a1a", borderRadius: 12 }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: r.color, flexShrink: 0 }} />
                        <div style={{ fontSize: 13, color: r.color, fontWeight: 600 }}>{r.name}</div>
                        <div style={{ fontSize: 11, color: "#555", marginLeft: "auto" }}>{r.tier}</div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Edit Profile Modal */}
            {editingProfile && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 700, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                <div style={{ background: "#fff", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 520, padding: "24px 20px 36px", maxHeight: "80vh", display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                    <SpriteAvatar id={setupAvatar} size={64} />
                  </div>
                  <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 18, color: "#111", marginBottom: 14, textAlign: "center" }}>编辑资料</div>
                  <div style={{ flex: 1, overflowY: "auto", marginBottom: 16 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
                      {AVATARS.map(av => (
                        <div key={av.id} onClick={() => setSetupAvatar(av.id)}
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
                  <input value={setupName} onChange={e => setSetupName(e.target.value)}
                    placeholder="昵称" maxLength={16}
                    style={{ marginBottom: 14, textAlign: "center", fontSize: 16 }} />
                  <div style={{ display: "flex", gap: 10 }}>
                    <button className="btn btn-dark" style={{ flex: 1 }} onClick={() => saveProfile(setupAvatar, setupName)}>保存</button>
                    <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setEditingProfile(false)}>取消</button>
                  </div>
                </div>
              </div>
            )}
            {/* Rank Section */}
            <div>
              <div className="sec-title">段位系统</div>
              {(() => {
                const curRank = getRank(words.length, streakData.count);
                const nextRank = getNextRank(words.length, streakData.count);
                const curIdx = RANKS.findIndex(r => r.id === curRank.id);
                return (
                  <div>
                    <div style={{ border: "2px solid " + curRank.color, borderRadius: 16, padding: 20, background: curRank.bg, marginBottom: 16, textAlign: "center" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "2px", color: curRank.color, marginBottom: 4 }}>当前段位</div>
                      <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 13, color: "#888" }}>{curRank.tier}</div>
                      <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 30, color: curRank.color, fontWeight: 700, marginBottom: nextRank ? 14 : 8 }}>{curRank.name}</div>
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
                        <div style={{ fontSize: 13, color: curRank.color, fontWeight: 700 }}>已达到最高段位！</div>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: "#aaa", marginBottom: 10 }}>段位进度 {curIdx + 1} / {RANKS.length}</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {["倔强青铜","秩序白银","荣耀黄金","尊贵铂金","永恒钻石","至尊星耀","最强王者"].map(tierName => {
                        const tierRanks = RANKS.filter(r => r.tier === tierName);
                        const tierColor = tierRanks[0].color;
                        const tierBg = tierRanks[0].bg;
                        const unlockedCount = tierRanks.filter(r => RANKS.indexOf(r) <= curIdx).length;
                        const anyUnlocked = unlockedCount > 0;
                        return (
                          <div key={tierName} style={{ border: "1px solid " + (anyUnlocked ? tierColor : "#ebebeb"), borderRadius: 12, padding: "12px 14px", background: anyUnlocked ? tierBg : "#fafafa", opacity: anyUnlocked ? 1 : 0.4, transition: "all 0.2s" }}>
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
                );
              })()}
            </div>
            {/* Wrong Bank */}
            <div>
              <div className="sec-title">错词库</div>
              {(() => {
                const wrongWords = words.filter(w => wrongBank.includes(w.word));
                if (wrongWords.length === 0) return (
                  <div style={{ fontSize: 13, color: "#aaa", padding: "20px 0", textAlign: "center" }}>答错的词会自动收录在这里</div>
                );
                // Group by tag
                const allWrongTags = ["未分类", ...new Set(wrongWords.flatMap(w => w.tags && w.tags.length ? w.tags : ["未分类"]))].filter((t, i, a) => a.indexOf(t) === i);
                const grouped = allWrongTags.map(tag => ({
                  tag,
                  words: tag === "未分类"
                    ? wrongWords.filter(w => !w.tags || w.tags.length === 0)
                    : wrongWords.filter(w => (w.tags || []).includes(tag))
                })).filter(g => g.words.length > 0);
                return (
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                      <div style={{ fontSize: 12, color: "#777" }}>共 {wrongWords.length} 个错词</div>
                      <button onClick={() => { setQuizMode("wrong"); setTab(2); startQuiz("wrong"); }}
                        className="btn btn-dark btn-sm">开始错词复习</button>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      {grouped.map(({ tag, words: gw }) => (
                        <div key={tag}>
                          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", color: "#888", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                            <span>{tag}</span>
                            <span style={{ background: "#f0f0f0", color: "#888", borderRadius: 10, padding: "1px 8px", fontSize: 10 }}>{gw.length}</span>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            {gw.map(w => (
                              <div key={w.word} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", border: "1px solid #fecaca", borderRadius: 10, padding: "10px 14px", background: "#fff5f5" }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 15, color: "#111" }}>{w.word}</div>
                                  <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{w.meaning}</div>
                                </div>
                                <button onClick={() => setWrongBank(prev => { const n = prev.filter(ww => ww !== w.word); localStorage.setItem("wv_wrong_bank", JSON.stringify(n)); return n; })}
                                  style={{ fontSize: 11, color: "#e53e3e", background: "none", border: "1px solid #fecaca", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap", marginLeft: 8 }}>移出</button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <button onClick={() => { setWrongBank([]); localStorage.setItem("wv_wrong_bank", "[]"); showMsg("错词库已清空"); }}
                      className="btn btn-outline btn-sm" style={{ width: "100%", marginTop: 16, color: "#e53e3e", borderColor: "#fecaca" }}>清空错词库</button>
                  </div>
                );
              })()}
            </div>

            <div>
            <div>
              <div className="sec-title">点击音效</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#111" }}>按键音效</div>
                  <div style={{ fontSize: 12, color: "#999", marginTop: 3 }}>每次点击播放轻微音效</div>
                </div>
                <div onClick={() => { const next = !soundEnabled; setSoundEnabled(next); localStorage.setItem("wv_sound", next ? "1" : "0"); }}
                  style={{ width: 50, height: 28, borderRadius: 14, background: soundEnabled ? "#111" : "#ddd", cursor: "pointer", position: "relative", transition: "background 0.25s", flexShrink: 0 }}>
                  <div style={{ position: "absolute", top: 3, left: soundEnabled ? 25 : 3, width: 22, height: 22, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.25)", transition: "left 0.25s" }} />
                </div>
              </div>
            </div>

              <div className="sec-title">每日提醒</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#111" }}>每天提醒我练习</div>
                  <div style={{ fontSize: 12, color: "#999", marginTop: 3 }}>每晚 23:00 推送提醒</div>
                </div>
                <div onClick={notifStatus === "granted"
                    ? () => { setNotifStatus("off"); localStorage.setItem("wv_notif_off","1"); }
                    : requestNotification}
                  style={{ width: 50, height: 28, borderRadius: 14, background: notifStatus === "granted" ? "#111" : "#ddd", cursor: "pointer", position: "relative", transition: "background 0.25s", flexShrink: 0 }}>
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
            <div style={{ fontSize: 13, color: "#888", marginBottom: 24 }}>第 {Math.floor(sessionStats.total / 10)} 轮 · {sessionStats.total} 题小结</div>

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
                <em className="nav-center-icon">◎</em>
              </div>
              <span className="nav-label">Combo</span>
            </button>
          );
          return (
            <button key={i} className={`nav-item ${tab === i ? "active" : ""}`} onClick={() => { haptic("light"); setTab(i); }}>
              <em className="nav-icon">{item.icon}</em>
              <span className="nav-label">{item.label}</span>
            </button>
          );
        })}
        </div>
      </nav>
    </div>
  );
}
