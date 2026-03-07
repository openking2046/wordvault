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
const NAV = [
  { icon: "☰", label: "单词库" },
  { icon: "+", label: "添加" },
  { icon: "◎", label: "测验" },
  { icon: "▦", label: "进度" },
  { icon: "⊙", label: "设置" },
];

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

function speak(word) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(word);
  u.lang = "en-US"; u.rate = 0.85;
  window.speechSynthesis.speak(u);
}

function generateMCQ(words, target) {
  const distractors = shuffle(words.filter(w => w.id !== target.id)).slice(0, 3);
  const options = shuffle([target, ...distractors]);
  return { question: target.word, correct: target.meaning, options: options.map(o => o.meaning), example: target.example };
}

export default function VocabApp() {
  const [tab, setTab] = useState(0);
  const [words, setWords] = useState(() => { try { const s = localStorage.getItem("wv_words"); return s ? JSON.parse(s) : SAMPLE_WORDS; } catch { return SAMPLE_WORDS; } });
  const [score, setScore] = useState(() => { try { const s = localStorage.getItem("wv_score"); return s ? JSON.parse(s) : { correct: 0, total: 0 }; } catch { return { correct: 0, total: 0 }; } });
  const [newWord, setNewWord] = useState("");
  const [newMeaning, setNewMeaning] = useState("");
  const [newExample, setNewExample] = useState("");
  const [newTags, setNewTags] = useState([]);
  const [customTag, setCustomTag] = useState("");
  const [userTags, setUserTags] = useState(() => { try { const s = localStorage.getItem("wv_user_tags"); return s ? JSON.parse(s) : []; } catch { return []; } });
  const [msg, setMsg] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [quizState, setQuizState] = useState(null);
  const [quizResult, setQuizResult] = useState(null);
  const [streak, setStreak] = useState(0);
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0, wrongWords: [] });
  const [showSummary, setShowSummary] = useState(false);
  const [filterTag, setFilterTag] = useState("全部");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("newest"); // newest | oldest | alpha
  const [notifStatus, setNotifStatus] = useState("unknown");
  const [notifTime, setNotifTime] = useState(() => localStorage.getItem("wv_ntime") || "09:00");
  const [importMsg, setImportMsg] = useState("");
  const [importSnapshot, setImportSnapshot] = useState(null);
  const [dailyGoal, setDailyGoal] = useState(() => parseInt(localStorage.getItem("wv_daily_goal") || "5"));
  const [editingGoal, setEditingGoal] = useState(false);
  const [tempGoal, setTempGoal] = useState(5);
  const [expandedWord, setExpandedWord] = useState(null);
  const [swipedWord, setSwipedWord] = useState(null);
  const touchStartX = useRef(0);

  useEffect(() => { try { localStorage.setItem("wv_words", JSON.stringify(words)); } catch {} }, [words]);
  useEffect(() => { try { localStorage.setItem("wv_score", JSON.stringify(score)); } catch {} }, [score]);
  useEffect(() => { try { localStorage.setItem("wv_ntime", notifTime); } catch {} }, [notifTime]);
  useEffect(() => { try { localStorage.setItem("wv_user_tags", JSON.stringify(userTags)); } catch {} }, [userTags]);
  useEffect(() => { if ("Notification" in window) setNotifStatus(Notification.permission); }, []);

  const allTags = ["全部", ...Array.from(new Set(words.flatMap(w => w.tags || [])))];
  const filteredWords = [...words]
    .filter(w => filterTag === "全部" || (w.tags || []).includes(filterTag))
    .filter(w => !searchQuery.trim() || w.word.toLowerCase().includes(searchQuery.toLowerCase()) || w.meaning.includes(searchQuery))
    .sort((a, b) => {
      if (sortOrder === "alpha") return a.word.localeCompare(b.word);
      if (sortOrder === "oldest") return a.id - b.id;
      return b.id - a.id; // newest first (default)
    });

  const startQuiz = useCallback(() => {
    const pool = filterTag === "全部" ? words : words.filter(w => (w.tags || []).includes(filterTag));
    if (pool.length < 4) return;
    setQuizState(generateMCQ(pool, shuffle(pool)[0]));
    setQuizResult(null);
  }, [words, filterTag]);

  useEffect(() => { if (tab === 2) startQuiz(); }, [tab, startQuiz]);

  const showMsg = (text) => { setMsg(text); setTimeout(() => setMsg(""), 2500); };

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
    setWords(ws => [...ws, { id: Date.now(), word: newWord.trim(), meaning: newMeaning.trim(), example: newExample.trim() || `${newWord.trim()} is a useful word.`, mastery: 0, tags: newTags }]);
    setNewWord(""); setNewMeaning(""); setNewExample(""); setNewTags([]);
    showMsg("添加成功");
  }

  function toggleNewTag(tag) { setNewTags(ts => ts.includes(tag) ? ts.filter(t => t !== tag) : [...ts, tag]); }
  function addCustomTag() {
    const tag = customTag.trim();
    if (!tag) return;
    if (!newTags.includes(tag)) setNewTags(ts => [...ts, tag]);
    if (![...DEFAULT_TAGS, ...userTags].includes(tag)) setUserTags(ts => [...ts, tag]);
    setCustomTag("");
  }
  function deleteUserTag(tag) {
    setUserTags(ts => ts.filter(t => t !== tag));
    setNewTags(ts => ts.filter(t => t !== tag));
  }

  function handleMCQ(option) {
    const correct = option === quizState.correct;
    setQuizResult(correct ? "correct" : "wrong");
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    setStreak(s => correct ? s + 1 : 0);
    if (correct) setWords(ws => ws.map(w => w.meaning === quizState.correct ? { ...w, mastery: Math.min(5, w.mastery + 1) } : w));
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

  function deleteWord(id) { setWords(ws => ws.filter(w => w.id !== id)); }

  function resetSession() {
    setSessionStats({ correct: 0, total: 0, wrongWords: [] });
    setShowSummary(false);
    startQuiz();
  }

  async function requestNotification() {
    if (!("Notification" in window)) { showMsg("浏览器不支持通知"); return; }
    const perm = await Notification.requestPermission();
    setNotifStatus(perm);
    if (perm === "granted") new Notification("WordVault", { body: "通知已开启 ✓" });
  }

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

  return (
    <div style={{ fontFamily: "Inter, -apple-system, sans-serif", minHeight: "100vh", background: "#fff", color: "#111", display: "flex", flexDirection: "column" }}>
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
        .word-row { border-bottom: 1px solid #f2f2f2; padding: 14px 0; cursor: pointer; }
        .word-row:last-child { border-bottom: none; }
        .opt-btn { width: 100%; background: #fafafa; border: 1.5px solid #ebebeb; border-radius: 10px; padding: 14px 16px; text-align: left; font-family: inherit; font-size: 14px; color: #111; cursor: pointer; transition: all 0.12s; margin-bottom: 8px; }
        .opt-btn:hover:not(:disabled) { border-color: #111; background: #fff; }
        .opt-btn.correct { background: #f0faf4; border-color: #2d8a4e; }
        .opt-btn.wrong { background: #fff5f5; border-color: #e53e3e; }
        .bottom-nav { position: fixed; bottom: 0; left: 0; right: 0; background: #fff; border-top: 1px solid #ebebeb; display: flex; z-index: 100; padding-bottom: env(safe-area-inset-bottom, 8px); }
        .nav-item { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 10px 0 6px; cursor: pointer; gap: 3px; border: none; background: none; font-family: inherit; }
        .nav-icon { font-size: 17px; line-height: 1; color: #888; font-style: normal; }
        .nav-label { font-size: 10px; color: #888; font-weight: 400; }
        .nav-item.active .nav-icon, .nav-item.active .nav-label { color: #111; font-weight: 600; }
        .toast { position: fixed; top: 64px; left: 50%; transform: translateX(-50%); background: #111; color: #fff; padding: 9px 18px; border-radius: 20px; font-size: 13px; z-index: 999; white-space: nowrap; }
        .sec-title { font-size: 11px; font-weight: 600; letter-spacing: 1.2px; text-transform: uppercase; color: #666; margin-bottom: 14px; }
        .mastery-bar { height: 3px; background: #f0f0f0; border-radius: 2px; overflow: hidden; margin-top: 5px; }
        .swipe-container { position: relative; overflow: hidden; }
        .swipe-content { transition: transform 0.25s ease; }
        .swipe-content.swiped { transform: translateX(-72px); }
        .swipe-delete { position: absolute; right: 0; top: 0; bottom: 0; width: 72px; background: #e53e3e; display: flex; align-items: center; justify-content: center; color: white; font-size: 13px; font-weight: 500; cursor: pointer; border-radius: 0 0 0 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: #eee; }
      `}</style>

      {msg && <div className="toast">{msg}</div>}

      {/* Header */}
      <div style={{ padding: "54px 20px 14px", borderBottom: "1px solid #f2f2f2", background: "#fff", position: "sticky", top: 0, zIndex: 50 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 24, color: "#111", letterSpacing: "-0.3px" }}>WordVault</div>
            <div style={{ fontSize: 12, color: "#777", marginTop: 2 }}>
              {words.length} 个单词{score.total > 0 ? ` · 正确率 ${correctRate}%` : ""}{streak > 1 ? ` · ${streak}` : ""}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "#888", marginBottom: 1 }}>已掌握</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#111" }}>{words.filter(w => w.mastery >= 4).length}<span style={{ fontSize: 12, color: "#777", fontWeight: 400 }}>/{words.length}</span></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 90px" }}>

        {/* Tab 0 */}
        {tab === 0 && (
          <div>
            <div style={{ position: "relative", marginBottom: 14 }}>
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="搜索单词或释义…"
                style={{ paddingLeft: 36, background: "#f7f7f7", border: "1px solid #ebebeb" }}
              />
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#888", fontSize: 15, pointerEvents: "none" }}>⌕</span>
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#888", fontSize: 16, lineHeight: 1 }}>×</button>
              )}
            </div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>
              {allTags.map(tag => <span key={tag} className={`tag-pill ${filterTag === tag ? "active" : ""}`} onClick={() => setFilterTag(tag)}>{tag}</span>)}
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
              {[["newest", "最新"], ["oldest", "最早"], ["alpha", "A→Z"]].map(([val, label]) => (
                <button key={val} onClick={() => setSortOrder(val)} style={{ fontSize: 12, padding: "5px 12px", borderRadius: 20, border: "1px solid " + (sortOrder === val ? "#111" : "#e0e0e0"), background: sortOrder === val ? "#111" : "#fff", color: sortOrder === val ? "#fff" : "#777", cursor: "pointer", fontFamily: "inherit", fontWeight: sortOrder === val ? 600 : 400, transition: "all 0.15s" }}>{label}</button>
              ))}
            </div>
            {filteredWords.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#888" }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>—</div>
                <div style={{ fontSize: 14 }}>暂无单词</div>
              </div>
            )}
            {filteredWords.map(w => (
              <div key={w.id} className="word-row swipe-container"
                onTouchStart={e => { touchStartX.current = e.touches[0].clientX; }}
                onTouchEnd={e => {
                  const diff = touchStartX.current - e.changedTouches[0].clientX;
                  if (diff > 50) { setSwipedWord(w.id); setExpandedWord(null); }
                  else if (diff < -20) { setSwipedWord(null); }
                }}
              >
                <div
                  className={`swipe-content ${swipedWord === w.id ? "swiped" : ""}`}
                  onClick={() => { if (swipedWord === w.id) { setSwipedWord(null); return; } setExpandedWord(expandedWord === w.id ? null : w.id); }}
                  style={{ padding: "14px 0", background: "#fff" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontFamily: "DM Serif Display, serif", fontSize: 17, color: "#111" }}>{w.word}</span>
                        <button onClick={e => { e.stopPropagation(); speak(w.word); }} style={{ background: "#f2f2f2", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, color: "#444", padding: "3px 8px", fontWeight: 500, letterSpacing: "0.3px", lineHeight: 1.4 }}>▶</button>
                      </div>
                      {expandedWord === w.id ? (
                        <div style={{ marginTop: 8 }}>
                          <div style={{ fontSize: 14, color: "#333", marginBottom: 5 }}>{w.meaning}</div>
                          {w.example && <div style={{ fontSize: 12, color: "#666", fontStyle: "italic", marginBottom: 8, lineHeight: 1.5 }}>{w.example}</div>}
                          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                            {(w.tags || []).map(t => <span key={t} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 10, background: "#f5f5f5", color: "#888" }}>{t}</span>)}
                          </div>
                        </div>
                      ) : (
                        <div style={{ fontSize: 12, color: "#777", marginTop: 2 }}>{w.meaning}</div>
                      )}
                      <div className="mastery-bar">
                        <div style={{ height: "100%", width: `${w.mastery/5*100}%`, background: masteryColor(w.mastery), transition: "width 0.3s" }} />
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: 12, flexShrink: 0 }}>
                      <span style={{ fontSize: 11, color: "#777" }}>{masteryLabel(w.mastery)}</span>
                    </div>
                  </div>
                </div>
                {swipedWord === w.id && (
                  <div className="swipe-delete" onClick={() => { deleteWord(w.id); setSwipedWord(null); }}>删除</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Tab 1 */}
        {tab === 1 && (
          <div style={{ maxWidth: 480 }}>
            <div className="sec-title">新建单词</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>英文单词</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input value={newWord} onChange={e => setNewWord(e.target.value)} placeholder="e.g. Tenacious" />
                  <button className="btn btn-dark btn-sm" onClick={handleAIGenerate} disabled={aiLoading || !newWord.trim()} style={{ whiteSpace: "nowrap" }}>
                    {aiLoading ? "…" : "AI 填写"}
                  </button>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>中文释义</div>
                <input value={newMeaning} onChange={e => setNewMeaning(e.target.value)} placeholder="e.g. 坚韧的，顽强的" />
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>例句（可选）</div>
                <textarea value={newExample} onChange={e => setNewExample(e.target.value)} placeholder="e.g. She was tenacious in pursuing her goals." rows={3} style={{ resize: "none" }} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>标签</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                  {DEFAULT_TAGS.map(tag => (
                    <span key={tag} className={`tag-pill ${newTags.includes(tag) ? "active" : ""}`} onClick={() => toggleNewTag(tag)}>{tag}</span>
                  ))}
                  {userTags.map(tag => (
                    <span key={tag} style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 4 }} className={`tag-pill ${newTags.includes(tag) ? "active" : ""}`}>
                      <span onClick={() => toggleNewTag(tag)}>{tag}</span>
                      <span onClick={e => { e.stopPropagation(); deleteUserTag(tag); }} style={{ fontSize: 13, lineHeight: 1, opacity: 0.6, cursor: "pointer" }}>×</span>
                    </span>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input value={customTag} onChange={e => setCustomTag(e.target.value)} placeholder="自定义标签" onKeyDown={e => e.key === "Enter" && addCustomTag()} />
                  <button className="btn btn-outline btn-sm" onClick={addCustomTag}>添加</button>
                </div>

              </div>
              <button className="btn btn-dark" onClick={handleAddWord} style={{ width: "100%", marginTop: 4 }}>添加单词</button>
            </div>
          </div>
        )}

        {/* Tab 2 */}
        {tab === 2 && (
          <div style={{ maxWidth: 480 }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
              {allTags.map(tag => <span key={tag} className={`tag-pill ${filterTag === tag ? "active" : ""}`} onClick={() => setFilterTag(tag)}>{tag}</span>)}
            </div>
            {(filterTag === "全部" ? words : words.filter(w => (w.tags||[]).includes(filterTag))).length < 4 ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#777" }}>
                <div style={{ fontSize: 14, marginBottom: 16 }}>至少需要 4 个单词才能测验</div>
                <button className="btn btn-dark btn-sm" onClick={() => setTab(1)}>去添加单词</button>
              </div>
            ) : quizState && (
              <div>
                <div style={{ marginBottom: 28 }}>
                  <div style={{ fontSize: 11, color: "#777", marginBottom: 10, letterSpacing: "0.5px", textTransform: "uppercase" }}>选择正确的中文释义</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 36, color: "#111", lineHeight: 1.1 }}>{quizState.question}</div>
                    <button onClick={() => speak(quizState.question)} style={{ background: "#f2f2f2", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, color: "#444", padding: "4px 10px", fontWeight: 500, letterSpacing: "0.3px" }}>▶</button>
                  </div>
                  {quizState.example && <div style={{ fontSize: 13, color: "#777", fontStyle: "italic", lineHeight: 1.5 }}>{quizState.example}</div>}
                </div>
                <div>
                  {quizState.options.map((opt, i) => {
                    let cls = "opt-btn";
                    if (quizResult) { if (opt === quizState.correct) cls += " correct"; else if (quizResult === "wrong") cls += " wrong"; }
                    return (
                      <button key={i} className={cls} disabled={!!quizResult} onClick={() => handleMCQ(opt)}>
                        <span style={{ color: "#777", marginRight: 10, fontSize: 12, fontWeight: 500 }}>{String.fromCharCode(65+i)}</span>{opt}
                      </button>
                    );
                  })}
                </div>
                {quizResult && (
                  <div style={{ marginTop: 20, textAlign: "center" }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: quizResult === "correct" ? "#2d8a4e" : "#e53e3e", marginBottom: 16 }}>
                      {quizResult === "correct" ? "正确 ✓" : `答案是：${quizState.correct}`}
                    </div>
                    <button className="btn btn-dark" onClick={startQuiz}>下一题</button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 3 */}
        {tab === 3 && (
          <div style={{ maxWidth: 480 }}>

            {/* Today's Goal */}
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
                    <input type="number" min="1" max="50" value={tempGoal} onChange={e => setTempGoal(parseInt(e.target.value)||1)}
                      style={{ width: 56, textAlign: "center", padding: "6px 8px", fontSize: 14 }} />
                    <button className="btn btn-dark btn-sm" onClick={() => {
                      const g = Math.max(1, Math.min(50, tempGoal));
                      setDailyGoal(g);
                      localStorage.setItem("wv_daily_goal", g);
                      setEditingGoal(false);
                      showMsg("目标已保存");
                    }}>保存</button>
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
            <div className="sec-title">学习概览</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 28 }}>
              {[["单词总数", words.length], ["答题总数", score.total], ["正确率", score.total ? correctRate+"%" : "—"], ["连击记录", streak]].map(([label, val]) => (
                <div key={label} style={{ border: "1px solid #ebebeb", borderRadius: 10, padding: 16 }}>
                  <div style={{ fontFamily: "DM Serif Display, serif", fontSize: 30, color: "#111" }}>{val}</div>
                  <div style={{ fontSize: 11, color: "#666", marginTop: 4, fontWeight: 500, letterSpacing: "0.3px" }}>{label}</div>
                </div>
              ))}
            </div>

            <div className="sec-title">掌握情况</div>
            {words.length === 0 ? <div style={{ color: "#888", fontSize: 14 }}>还没有单词</div> : words.map(w => (
              <div key={w.id} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                <div style={{ width: 120, fontSize: 13, fontFamily: "DM Serif Display, serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "#111", flexShrink: 0 }}>{w.word}</div>
                <div style={{ flex: 1 }}>
                  <div className="mastery-bar" style={{ height: 4 }}>
                    <div style={{ height: "100%", width: `${w.mastery/5*100}%`, background: "#111", transition: "width 0.3s" }} />
                  </div>
                </div>
                <div style={{ fontSize: 11, color: "#777", width: 28, textAlign: "right" }}>{masteryLabel(w.mastery)}</div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 4 */}
        {tab === 4 && (
          <div style={{ maxWidth: 480, display: "flex", flexDirection: "column", gap: 28 }}>
            <div>
              <div className="sec-title">每日提醒</div>
              {notifStatus === "denied" && <div style={{ fontSize: 13, color: "#e53e3e" }}>通知已被拒绝，请在系统设置中手动开启</div>}
              {notifStatus !== "granted" && notifStatus !== "denied" && <button className="btn btn-dark btn-sm" onClick={requestNotification}>开启通知权限</button>}
              {notifStatus === "granted" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ fontSize: 13, color: "#2d8a4e" }}>通知已开启 ✓</div>
                  <div>
                    <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>提醒时间</div>
                    <input type="time" value={notifTime} onChange={e => setNotifTime(e.target.value)} style={{ width: "auto" }} />
                  </div>
                  <button className="btn btn-dark btn-sm" onClick={() => { localStorage.setItem("wv_ntime", notifTime); showMsg("已保存"); }}>保存</button>
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
              <button className="btn btn-outline btn-sm" onClick={() => { if (window.confirm("重置所有答题记录和掌握度？")) { setScore({ correct: 0, total: 0 }); setStreak(0); setWords(ws => ws.map(w => ({ ...w, mastery: 0 }))); showMsg("已重置"); } }}>
                重置学习进度
              </button>
            </div>
          </div>
        )}
      </div>

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
        {NAV.map((item, i) => (
          <button key={i} className={`nav-item ${tab === i ? "active" : ""}`} onClick={() => setTab(i)}>
            <em className="nav-icon">{item.icon}</em>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
