/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback } from "react";

const SAMPLE_WORDS = [
  { id: 1, word: "Serendipity", meaning: "意外发现美好事物的运气", example: "Finding that book was pure serendipity.", mastery: 0, tags: ["生活"] },
  { id: 2, word: "Ephemeral", meaning: "短暂的，转瞬即逝的", example: "Fame can be ephemeral.", mastery: 0, tags: ["形容词"] },
  { id: 3, word: "Resilient", meaning: "有弹性的，能快速恢复的", example: "She is remarkably resilient.", mastery: 0, tags: ["形容词"] },
  { id: 4, word: "Eloquent", meaning: "口才流利的，雄辩的", example: "He gave an eloquent speech.", mastery: 0, tags: ["形容词"] },
  { id: 5, word: "Ambiguous", meaning: "模棱两可的，含糊不清的", example: "The instructions were ambiguous.", mastery: 0, tags: ["形容词"] },
];

const PRESET_TAGS = ["形容词", "名词", "动词", "生活", "商务", "学术", "口语", "写作"];
const TABS = ["📚 单词库", "➕ 添加单词", "🧠 测验", "📊 进度", "⚙️ 设置"];

function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

function speak(word) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(word);
  utter.lang = "en-US";
  utter.rate = 0.85;
  window.speechSynthesis.speak(utter);
}
function generateMCQ(words, targetWord) {
  const distractors = shuffle(words.filter(w => w.id !== targetWord.id)).slice(0, 3);
  const options = shuffle([targetWord, ...distractors]);
  return { question: targetWord.word, correct: targetWord.meaning, options: options.map(o => o.meaning), example: targetWord.example };
}
function generateFillIn(words, targetWord) {
  const blanked = targetWord.example.replace(new RegExp(targetWord.word, "gi"), "______");
  return { sentence: blanked, answer: targetWord.word, hint: targetWord.meaning };
}

export default function VocabApp() {
  const [tab, setTab] = useState(0);
  const [words, setWords] = useState(() => { try { const s = localStorage.getItem("wordvault_words"); return s ? JSON.parse(s) : SAMPLE_WORDS; } catch { return SAMPLE_WORDS; } });
  const [score, setScore] = useState(() => { try { const s = localStorage.getItem("wordvault_score"); return s ? JSON.parse(s) : { correct: 0, total: 0 }; } catch { return { correct: 0, total: 0 }; } });
  const [newWord, setNewWord] = useState("");
  const [newMeaning, setNewMeaning] = useState("");
  const [newExample, setNewExample] = useState("");
  const [newTags, setNewTags] = useState([]);
  const [customTag, setCustomTag] = useState("");
  const [addMsg, setAddMsg] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [quizType, setQuizType] = useState("mcq");
  const [quizState, setQuizState] = useState(null);
  const [quizResult, setQuizResult] = useState(null);
  const [fillAnswer, setFillAnswer] = useState("");
  const [streak, setStreak] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [filterTag, setFilterTag] = useState("全部");
  const [notifStatus, setNotifStatus] = useState("unknown");
  const [notifTime, setNotifTime] = useState(() => localStorage.getItem("wordvault_notif_time") || "09:00");
  const [notifEnabled, setNotifEnabled] = useState(() => localStorage.getItem("wordvault_notif_enabled") === "true");
  const [importMsg, setImportMsg] = useState("");

  useEffect(() => { try { localStorage.setItem("wordvault_words", JSON.stringify(words)); } catch {} }, [words]);
  useEffect(() => { try { localStorage.setItem("wordvault_score", JSON.stringify(score)); } catch {} }, [score]);
  useEffect(() => { try { localStorage.setItem("wordvault_notif_time", notifTime); } catch {} }, [notifTime]);
  useEffect(() => { try { localStorage.setItem("wordvault_notif_enabled", notifEnabled); } catch {} }, [notifEnabled]);

  useEffect(() => {
    if ("Notification" in window) setNotifStatus(Notification.permission);
  }, []);

  const allTags = ["全部", ...Array.from(new Set(words.flatMap(w => w.tags || [])))];
  const filteredWords = filterTag === "全部" ? words : words.filter(w => (w.tags || []).includes(filterTag));

  const startQuiz = useCallback(() => {
    const pool = filterTag === "全部" ? words : words.filter(w => (w.tags || []).includes(filterTag));
    if (pool.length < 4) return;
    const target = shuffle(pool)[0];
    if (quizType === "mcq") setQuizState(generateMCQ(pool, target));
    else if (quizType === "fillin") setQuizState(generateFillIn(pool, target));
    else { setQuizState({ word: target }); setFlipped(false); }
    setQuizResult(null); setFillAnswer("");
  }, [words, quizType, filterTag]);

  useEffect(() => { if (tab === 2) startQuiz(); }, [tab, quizType, startQuiz]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAIGenerate() {
    if (!newWord.trim()) { setAddMsg("请先填写单词！"); return; }
    setAiLoading(true); setAddMsg("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 300,
          messages: [{ role: "user", content: `For the English word "${newWord.trim()}", provide:
1. A concise Chinese meaning (中文释义)
2. A natural example sentence in English

Respond ONLY in this exact JSON format, no other text:
{"meaning": "中文释义", "example": "Example sentence here."}` }]
        })
      });
      const data = await res.json();
      const text = data.content?.map(i => i.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setNewMeaning(parsed.meaning || "");
      setNewExample(parsed.example || "");
      setAddMsg("✨ AI 生成成功！");
    } catch {
      setAddMsg("❌ AI 生成失败，请手动填写");
    }
    setAiLoading(false);
  }

  function handleAddWord() {
    if (!newWord.trim() || !newMeaning.trim()) { setAddMsg("请填写单词和释义！"); return; }
    if (words.find(w => w.word.toLowerCase() === newWord.trim().toLowerCase())) { setAddMsg("这个单词已经存在了！"); return; }
    setWords(ws => [...ws, { id: Date.now(), word: newWord.trim(), meaning: newMeaning.trim(), example: newExample.trim() || `${newWord.trim()} is a great word.`, mastery: 0, tags: newTags }]);
    setNewWord(""); setNewMeaning(""); setNewExample(""); setNewTags([]);
    setAddMsg("✅ 添加成功！");
    setTimeout(() => setAddMsg(""), 2000);
  }

  function toggleNewTag(tag) { setNewTags(ts => ts.includes(tag) ? ts.filter(t => t !== tag) : [...ts, tag]); }
  function addCustomTag() { if (customTag.trim() && !newTags.includes(customTag.trim())) { setNewTags(ts => [...ts, customTag.trim()]); setCustomTag(""); } }

  function handleMCQ(option) {
    const correct = option === quizState.correct;
    setQuizResult(correct ? "correct" : "wrong");
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    setStreak(s => correct ? s + 1 : 0);
    if (correct) setWords(ws => ws.map(w => w.meaning === quizState.correct ? { ...w, mastery: Math.min(5, w.mastery + 1) } : w));
  }

  function handleFillIn() {
    const correct = fillAnswer.trim().toLowerCase() === quizState.answer.toLowerCase();
    setQuizResult(correct ? "correct" : "wrong");
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    setStreak(s => correct ? s + 1 : 0);
  }

  function deleteWord(id) { setWords(ws => ws.filter(w => w.id !== id)); }

  async function requestNotification() {
    if (!("Notification" in window)) { alert("你的浏览器不支持通知功能"); return; }
    const perm = await Notification.requestPermission();
    setNotifStatus(perm);
    if (perm === "granted") scheduleTestNotif();
  }

  function scheduleTestNotif() {
    if (Notification.permission === "granted") {
      new Notification("📚 WordVault 学习提醒", { body: "今天学了几个新单词了？来复习一下吧！", icon: "/favicon.ico" });
    }
  }

  function saveNotifSettings() {
    setNotifEnabled(true);
    if (Notification.permission === "granted") {
      scheduleTestNotif();
      setAddMsg("✅ 提醒设置已保存！已发送一条测试通知");
      setTimeout(() => setAddMsg(""), 3000);
    }
  }

  // ── Export ──────────────────────────────────────────────
  function exportJSON() {
    const data = JSON.stringify(words, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "wordvault_words.json"; a.click();
    URL.revokeObjectURL(url);
  }

  function exportCSV() {
    const header = "word,meaning,example,tags,mastery";
    const rows = words.map(w =>
      [`"${w.word}"`, `"${w.meaning}"`, `"${(w.example||"").replace(/"/g,'""')}"`, `"${(w.tags||[]).join(';')}"`, w.mastery].join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob(["﻿"+csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "wordvault_words.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  function handleImportFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target.result;
        let imported = [];
        if (file.name.endsWith(".json")) {
          const parsed = JSON.parse(text);
          imported = Array.isArray(parsed) ? parsed : [];
        } else if (file.name.endsWith(".csv")) {
          const lines = text.split("\n").filter(Boolean);
          lines.slice(1).forEach(line => {
            const cols = line.match(/(".*?"|[^,]+)(?=,|$)/g) || [];
            const clean = cols.map(c => c.replace(/^"|"$/g,"").replace(/""/g,'"'));
            if (clean[0]) imported.push({
              id: Date.now() + Math.random(),
              word: clean[0]||"", meaning: clean[1]||"", example: clean[2]||"",
              tags: clean[3] ? clean[3].split(";").filter(Boolean) : [],
              mastery: parseInt(clean[4])||0
            });
          });
        } else {
          setImportMsg("❌ 只支持 .json 或 .csv 文件"); return;
        }
        if (imported.length === 0) { setImportMsg("❌ 没有找到有效单词"); return; }
        const existingWords = words.map(w => w.word.toLowerCase());
        const newWords = imported.filter(w => w.word && !existingWords.includes(w.word.toLowerCase()))
          .map(w => ({ ...w, id: Date.now() + Math.random(), mastery: w.mastery||0, tags: w.tags||[] }));
        if (newWords.length === 0) { setImportMsg("⚠️ 所有单词都已存在，没有新增"); return; }
        setWords(ws => [...ws, ...newWords]);
        setImportMsg(`✅ 成功导入 ${newWords.length} 个新单词！`);
        setTimeout(() => setImportMsg(""), 4000);
      } catch { setImportMsg("❌ 文件格式有误，请检查后重试"); }
    };
    reader.readAsText(file, "utf-8");
    e.target.value = "";
  }

  const masteryColor = (m) => ["#e2e8f0","#fde68a","#fbbf24","#fb923c","#4ade80","#22c55e"][m];
  const masteryLabel = (m) => ["未学","初识","认识","熟悉","掌握","精通"][m];

  return (
    <div style={{ fontFamily: "'Noto Serif SC', 'Georgia', serif", minHeight: "100vh", background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)", color: "#f0eaff", padding: "0 0 40px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&family=Playfair+Display:wght@700;900&display=swap');
        * { box-sizing: border-box; }
        .card { background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12); border-radius: 16px; backdrop-filter: blur(10px); }
        .btn-primary { background: linear-gradient(135deg, #a78bfa, #7c3aed); color: white; border: none; border-radius: 10px; padding: 10px 22px; cursor: pointer; font-size: 15px; font-family: inherit; transition: all 0.2s; }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(139,92,246,0.4); }
        .btn-ghost { background: rgba(255,255,255,0.08); color: #d4c5ff; border: 1px solid rgba(255,255,255,0.15); border-radius: 10px; padding: 10px 18px; cursor: pointer; font-size: 14px; font-family: inherit; transition: all 0.2s; }
        .btn-ghost:hover { background: rgba(255,255,255,0.14); }
        .btn-ai { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; border: none; border-radius: 10px; padding: 10px 18px; cursor: pointer; font-size: 14px; font-family: inherit; transition: all 0.2s; white-space: nowrap; }
        .btn-ai:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(245,158,11,0.4); }
        .btn-ai:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        input, textarea { background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.2); border-radius: 10px; color: #f0eaff; padding: 10px 14px; font-family: inherit; font-size: 14px; outline: none; width: 100%; transition: border 0.2s; }
        input:focus, textarea:focus { border-color: #a78bfa; }
        input::placeholder, textarea::placeholder { color: rgba(240,234,255,0.35); }
        .tag-pill { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; cursor: pointer; border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.07); color: #c4b5fd; transition: all 0.15s; }
        .tag-pill.active { background: linear-gradient(135deg,#a78bfa,#7c3aed); border-color: transparent; color: white; }
        .flip-card { perspective: 800px; cursor: pointer; }
        .flip-inner { transition: transform 0.6s; transform-style: preserve-3d; position: relative; }
        .flip-inner.flipped { transform: rotateY(180deg); }
        .flip-front, .flip-back { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .flip-back { transform: rotateY(180deg); position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
        .tag { display: inline-block; padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: bold; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: rgba(167,139,250,0.4); border-radius: 3px; }
      `}</style>

      {/* Header */}
      <div style={{ textAlign: "center", padding: "36px 20px 20px" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px,5vw,42px)", fontWeight: 900, background: "linear-gradient(135deg, #e0c3fc, #8ec5fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "-1px" }}>WordVault</div>
        <div style={{ color: "rgba(240,234,255,0.5)", fontSize: "13px", marginTop: 4 }}>你的英语单词宝库</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: "12px", color: "#a78bfa" }}>📖 {words.length} 个单词</span>
          <span style={{ fontSize: "12px", color: "#34d399" }}>✅ {score.correct}/{score.total} 答题</span>
          {streak > 1 && <span style={{ fontSize: "12px", color: "#fbbf24" }}>🔥 连续 {streak} 题正确</span>}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", justifyContent: "center", gap: 6, padding: "0 16px 24px", flexWrap: "wrap" }}>
        {TABS.map((t, i) => (
          <button key={i} onClick={() => setTab(i)} style={{ background: tab === i ? "linear-gradient(135deg,#a78bfa,#7c3aed)" : "rgba(255,255,255,0.07)", color: tab === i ? "white" : "#c4b5fd", border: "1px solid " + (tab === i ? "transparent" : "rgba(255,255,255,0.12)"), borderRadius: 10, padding: "8px 14px", cursor: "pointer", fontFamily: "inherit", fontSize: "12px", transition: "all 0.2s" }}>{t}</button>
        ))}
      </div>

      <div style={{ maxWidth: 620, margin: "0 auto", padding: "0 16px" }}>

        {/* Tab 0: Word List */}
        {tab === 0 && (
          <div>
            {/* Tag filter */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
              {allTags.map(tag => (
                <span key={tag} className={`tag-pill ${filterTag === tag ? "active" : ""}`} onClick={() => setFilterTag(tag)}>{tag}</span>
              ))}
            </div>
            <div style={{ marginBottom: 10, color: "rgba(240,234,255,0.5)", fontSize: 13 }}>显示 {filteredWords.length} 个单词 · 点击可翻转</div>
            {filteredWords.length === 0 && <div className="card" style={{ padding: 32, textAlign: "center", color: "rgba(240,234,255,0.4)" }}>没有符合条件的单词</div>}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filteredWords.map(w => (
                <div key={w.id} className="card flip-card" style={{ minHeight: 90 }} onClick={e => { if (e.target.closest('.del-btn')) return; e.currentTarget.querySelector('.flip-inner').classList.toggle('flipped'); }}>
                  <div className="flip-inner" style={{ minHeight: 90 }}>
                    <div className="flip-front" style={{ padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", minHeight: 90 }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ fontSize: 18, fontWeight: 700, color: "#e0c3fc", fontFamily: "'Playfair Display', serif" }}>{w.word}</div>
                          <button onClick={e => { e.stopPropagation(); speak(w.word); }} style={{ background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.3)", borderRadius: 8, width: 26, height: 26, cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }} title="朗读">🔊</button>
                        </div>
                        <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
                          {(w.tags || []).map(t => <span key={t} style={{ fontSize: 10, padding: "1px 8px", borderRadius: 10, background: "rgba(167,139,250,0.2)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.3)" }}>{t}</span>)}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span className="tag" style={{ background: masteryColor(w.mastery) + "33", color: masteryColor(w.mastery), border: `1px solid ${masteryColor(w.mastery)}55` }}>{masteryLabel(w.mastery)}</span>
                        <button className="del-btn" onClick={() => deleteWord(w.id)} style={{ background: "rgba(255,100,100,0.15)", border: "1px solid rgba(255,100,100,0.3)", color: "#fca5a5", borderRadius: 8, width: 28, height: 28, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                      </div>
                    </div>
                    <div className="flip-back card" style={{ padding: "16px 18px", minHeight: 90, display: "flex", flexDirection: "column", justifyContent: "center", background: "rgba(167,139,250,0.12)", borderRadius: 16 }}>
                      <div style={{ color: "#c4b5fd", fontSize: 15, fontWeight: 600 }}>{w.meaning}</div>
                      {w.example && <div style={{ color: "rgba(240,234,255,0.5)", fontSize: 12, marginTop: 6, fontStyle: "italic" }}>{w.example}</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 1: Add Word */}
        {tab === 1 && (
          <div className="card" style={{ padding: 28 }}>
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: "#e0c3fc", fontFamily: "'Playfair Display',serif" }}>添加新单词</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <div style={{ fontSize: 12, color: "rgba(240,234,255,0.5)", marginBottom: 6 }}>英文单词 *</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input value={newWord} onChange={e => setNewWord(e.target.value)} placeholder="e.g. Tenacious" />
                  <button className="btn-ai" onClick={handleAIGenerate} disabled={aiLoading || !newWord.trim()}>
                    {aiLoading ? "生成中..." : "✨ AI 生成"}
                  </button>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "rgba(240,234,255,0.5)", marginBottom: 6 }}>中文释义 *</div>
                <input value={newMeaning} onChange={e => setNewMeaning(e.target.value)} placeholder="e.g. 坚韧的，顽强的" />
              </div>
              <div>
                <div style={{ fontSize: 12, color: "rgba(240,234,255,0.5)", marginBottom: 6 }}>例句（可选）</div>
                <textarea value={newExample} onChange={e => setNewExample(e.target.value)} placeholder="e.g. She was tenacious in pursuing her goals." rows={3} style={{ resize: "vertical" }} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: "rgba(240,234,255,0.5)", marginBottom: 8 }}>标签分类</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                  {PRESET_TAGS.map(tag => (
                    <span key={tag} className={`tag-pill ${newTags.includes(tag) ? "active" : ""}`} onClick={() => toggleNewTag(tag)}>{tag}</span>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <input value={customTag} onChange={e => setCustomTag(e.target.value)} placeholder="自定义标签..." onKeyDown={e => e.key === "Enter" && addCustomTag()} style={{ flex: 1 }} />
                  <button className="btn-ghost" onClick={addCustomTag} style={{ whiteSpace: "nowrap" }}>添加</button>
                </div>
                {newTags.length > 0 && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                    {newTags.map(t => <span key={t} style={{ fontSize: 12, padding: "3px 10px", borderRadius: 12, background: "rgba(167,139,250,0.25)", color: "#a78bfa", cursor: "pointer" }} onClick={() => toggleNewTag(t)}>{t} ×</span>)}
                  </div>
                )}
              </div>
              {addMsg && <div style={{ color: addMsg.startsWith("✅") || addMsg.startsWith("✨") ? "#4ade80" : "#f87171", fontSize: 13 }}>{addMsg}</div>}
              <button className="btn-primary" onClick={handleAddWord} style={{ marginTop: 4 }}>添加单词 ＋</button>
            </div>
          </div>
        )}

        {/* Tab 2: Quiz */}
        {tab === 2 && (
          <div>
            {/* Tag filter for quiz */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
              {allTags.map(tag => (
                <span key={tag} className={`tag-pill ${filterTag === tag ? "active" : ""}`} onClick={() => setFilterTag(tag)}>{tag}</span>
              ))}
            </div>
            {(filterTag === "全部" ? words : words.filter(w => (w.tags || []).includes(filterTag))).length < 4 ? (
              <div className="card" style={{ padding: 32, textAlign: "center", color: "rgba(240,234,255,0.5)" }}>该分类至少需要 4 个单词才能测验<br /><button className="btn-primary" style={{ marginTop: 16 }} onClick={() => setTab(1)}>去添加单词</button></div>
            ) : (
              <>
                <div style={{ display: "flex", gap: 8, marginBottom: 20, justifyContent: "center" }}>
                  {[["mcq","选择题"],["fillin","填空题"],["flash","记忆卡"]].map(([type, label]) => (
                    <button key={type} onClick={() => setQuizType(type)} style={{ background: quizType === type ? "linear-gradient(135deg,#a78bfa,#7c3aed)" : "rgba(255,255,255,0.07)", color: quizType === type ? "white" : "#c4b5fd", border: "1px solid " + (quizType === type ? "transparent" : "rgba(255,255,255,0.15)"), borderRadius: 10, padding: "8px 18px", cursor: "pointer", fontFamily: "inherit", fontSize: 13 }}>{label}</button>
                  ))}
                </div>
                {quizType === "mcq" && quizState && (
                  <div className="card" style={{ padding: 28 }}>
                    <div style={{ fontSize: 12, color: "rgba(240,234,255,0.4)", marginBottom: 8 }}>这个单词是什么意思？</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 30, fontWeight: 900, color: "#e0c3fc" }}>{quizState.question}</div>
                      <button onClick={() => speak(quizState.question)} style={{ background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.3)", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>🔊</button>
                    </div>
                    {quizState.example && <div style={{ fontSize: 12, color: "rgba(240,234,255,0.4)", fontStyle: "italic", marginBottom: 20 }}>{quizState.example}</div>}
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {quizState.options.map((opt, i) => {
                        let bg = "rgba(255,255,255,0.06)"; let border = "rgba(255,255,255,0.12)";
                        if (quizResult) { if (opt === quizState.correct) { bg = "rgba(74,222,128,0.15)"; border = "#4ade80"; } else if (quizResult === "wrong") { bg = "rgba(248,113,113,0.1)"; } }
                        return <button key={i} disabled={!!quizResult} onClick={() => handleMCQ(opt)} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 12, padding: "12px 16px", color: "#f0eaff", cursor: quizResult ? "default" : "pointer", fontFamily: "inherit", fontSize: 14, textAlign: "left", transition: "all 0.2s" }}>{String.fromCharCode(65+i)}. {opt}</button>;
                      })}
                    </div>
                    {quizResult && <div style={{ marginTop: 20, textAlign: "center" }}><div style={{ fontSize: 20, marginBottom: 12 }}>{quizResult === "correct" ? "🎉 正确！" : `❌ 答案是：${quizState.correct}`}</div><button className="btn-primary" onClick={startQuiz}>下一题 →</button></div>}
                  </div>
                )}
                {quizType === "fillin" && quizState && (
                  <div className="card" style={{ padding: 28 }}>
                    <div style={{ fontSize: 12, color: "rgba(240,234,255,0.4)", marginBottom: 8 }}>填入正确单词</div>
                    <div style={{ fontSize: 16, color: "#e0c3fc", lineHeight: 1.8, marginBottom: 6 }}>{quizState.sentence}</div>
                    <div style={{ fontSize: 12, color: "rgba(240,234,255,0.4)", marginBottom: 20 }}>提示：{quizState.hint}</div>
                    {!quizResult ? (
                      <div style={{ display: "flex", gap: 10 }}><input value={fillAnswer} onChange={e => setFillAnswer(e.target.value)} placeholder="输入答案..." onKeyDown={e => e.key === "Enter" && fillAnswer && handleFillIn()} /><button className="btn-primary" onClick={handleFillIn} disabled={!fillAnswer} style={{ whiteSpace: "nowrap" }}>确认</button></div>
                    ) : (
                      <div style={{ textAlign: "center" }}><div style={{ fontSize: 20, marginBottom: 4 }}>{quizResult === "correct" ? "🎉 正确！" : `❌ 答案是：${quizState.answer}`}</div><div style={{ fontSize: 13, color: "rgba(240,234,255,0.5)", marginBottom: 16 }}>你的答案：{fillAnswer}</div><button className="btn-primary" onClick={startQuiz}>下一题 →</button></div>
                    )}
                  </div>
                )}
                {quizType === "flash" && quizState && (
                  <div>
                    <div className="flip-card" style={{ height: 200 }} onClick={() => setFlipped(f => !f)}>
                      <div className={`flip-inner ${flipped ? "flipped" : ""}`} style={{ height: 200 }}>
                        <div className="flip-front card" style={{ height: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
                          <div style={{ fontSize: 11, color: "rgba(240,234,255,0.4)", marginBottom: 8 }}>点击翻转</div>
                          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 36, fontWeight: 900, color: "#e0c3fc", marginBottom: 8 }}>{quizState.word.word}</div>
                          <button onClick={e => { e.stopPropagation(); speak(quizState.word.word); }} style={{ background: "rgba(167,139,250,0.15)", border: "1px solid rgba(167,139,250,0.3)", borderRadius: 8, padding: "4px 14px", cursor: "pointer", fontSize: 14, color: "#a78bfa" }}>🔊 朗读</button>
                        </div>
                        <div className="flip-back card" style={{ height: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, background: "rgba(167,139,250,0.12)", borderRadius: 16 }}>
                          <div style={{ fontSize: 18, color: "#c4b5fd", fontWeight: 700, marginBottom: 8 }}>{quizState.word.meaning}</div>
                          <div style={{ fontSize: 12, color: "rgba(240,234,255,0.45)", fontStyle: "italic", textAlign: "center" }}>{quizState.word.example}</div>
                        </div>
                      </div>
                    </div>
                    {flipped && (
                      <div style={{ display: "flex", gap: 10, marginTop: 16, justifyContent: "center" }}>
                        <button className="btn-ghost" onClick={() => { setWords(ws => ws.map(w => w.id === quizState.word.id ? { ...w, mastery: Math.max(0, w.mastery-1) } : w)); startQuiz(); }}>😅 还不熟</button>
                        <button className="btn-primary" onClick={() => { setWords(ws => ws.map(w => w.id === quizState.word.id ? { ...w, mastery: Math.min(5, w.mastery+1) } : w)); startQuiz(); }}>✅ 记住了</button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Tab 3: Progress */}
        {tab === 3 && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              {[["📖 单词总数", words.length], ["✅ 答题总数", score.total], ["🎯 正确率", score.total ? Math.round(score.correct/score.total*100)+"%" : "—"], ["🔥 连击记录", streak]].map(([label, val]) => (
                <div key={label} className="card" style={{ padding: "18px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "#e0c3fc", fontFamily: "'Playfair Display',serif" }}>{val}</div>
                  <div style={{ fontSize: 11, color: "rgba(240,234,255,0.45)", marginTop: 4 }}>{label}</div>
                </div>
              ))}
            </div>
            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#c4b5fd", marginBottom: 14 }}>单词掌握情况</div>
              {words.length === 0 ? <div style={{ color: "rgba(240,234,255,0.4)", fontSize: 13 }}>还没有单词</div> : words.map(w => (
                <div key={w.id} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 100, fontSize: 13, color: "#e0c3fc", fontFamily: "'Playfair Display',serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.word}</div>
                  <div style={{ flex: 1, height: 8, background: "rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${w.mastery/5*100}%`, background: `linear-gradient(90deg, #a78bfa, ${masteryColor(w.mastery)})`, borderRadius: 4, transition: "width 0.4s" }} />
                  </div>
                  <span className="tag" style={{ background: masteryColor(w.mastery)+"22", color: masteryColor(w.mastery), border: `1px solid ${masteryColor(w.mastery)}44`, minWidth: 32, textAlign: "center" }}>{masteryLabel(w.mastery)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Settings */}
        {tab === 4 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card" style={{ padding: 24 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#e0c3fc", marginBottom: 6, fontFamily: "'Playfair Display',serif" }}>🔔 每日学习提醒</div>
              <div style={{ fontSize: 13, color: "rgba(240,234,255,0.5)", marginBottom: 20 }}>开启后，每天定时提醒你来复习单词</div>

              {notifStatus === "denied" && (
                <div style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.3)", borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 13, color: "#fca5a5" }}>
                  ⚠️ 通知权限被拒绝了。请去手机设置 → Safari → 通知，手动开启。
                </div>
              )}

              {notifStatus !== "granted" && notifStatus !== "denied" && (
                <button className="btn-primary" onClick={requestNotification} style={{ marginBottom: 16 }}>
                  📳 授权通知权限
                </button>
              )}

              {notifStatus === "granted" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)", borderRadius: 10, padding: 10, fontSize: 13, color: "#4ade80" }}>
                    ✅ 通知权限已开启
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: "rgba(240,234,255,0.5)", marginBottom: 6 }}>提醒时间</div>
                    <input type="time" value={notifTime} onChange={e => setNotifTime(e.target.value)} style={{ width: "auto" }} />
                  </div>
                  <button className="btn-primary" onClick={saveNotifSettings}>保存设置 + 发送测试通知</button>
                  {addMsg && <div style={{ fontSize: 13, color: "#4ade80" }}>{addMsg}</div>}
                  <div style={{ fontSize: 12, color: "rgba(240,234,255,0.4)", lineHeight: 1.6 }}>
                    💡 提示：手机网页通知需要把 App 添加到主屏幕后才能在后台收到。每次打开 App 时会自动安排下一次提醒。
                  </div>
                </div>
              )}
            </div>

            <div className="card" style={{ padding: 24 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#e0c3fc", marginBottom: 4, fontFamily: "'Playfair Display',serif" }}>📤 导出单词</div>
              <div style={{ fontSize: 13, color: "rgba(240,234,255,0.5)", marginBottom: 16 }}>把所有单词导出，方便备份或分享给别人</div>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button className="btn-primary" onClick={exportJSON} style={{ fontSize: 13 }}>⬇️ 导出 JSON</button>
                <button className="btn-ghost" onClick={exportCSV} style={{ fontSize: 13 }}>⬇️ 导出 CSV（Excel可打开）</button>
              </div>
            </div>

            <div className="card" style={{ padding: 24 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#e0c3fc", marginBottom: 4, fontFamily: "'Playfair Display',serif" }}>📥 导入单词</div>
              <div style={{ fontSize: 13, color: "rgba(240,234,255,0.5)", marginBottom: 8 }}>支持导入 JSON 或 CSV 文件，重复单词会自动跳过</div>
              <div style={{ fontSize: 12, color: "rgba(240,234,255,0.35)", marginBottom: 14, lineHeight: 1.6 }}>
                CSV 格式：第一行为标题行，列顺序为 word, meaning, example, tags, mastery<br/>
                tags 多个标签用分号分隔，例如：形容词;学术
              </div>
              <label style={{ display: "inline-block", background: "linear-gradient(135deg,#a78bfa,#7c3aed)", color: "white", borderRadius: 10, padding: "10px 20px", cursor: "pointer", fontSize: 13 }}>
                📂 选择文件导入
                <input type="file" accept=".json,.csv" onChange={handleImportFile} style={{ display: "none" }} />
              </label>
              {importMsg && <div style={{ marginTop: 12, fontSize: 13, color: importMsg.startsWith("✅") ? "#4ade80" : importMsg.startsWith("⚠️") ? "#fbbf24" : "#f87171" }}>{importMsg}</div>}
            </div>

            <div className="card" style={{ padding: 24 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#e0c3fc", marginBottom: 6, fontFamily: "'Playfair Display',serif" }}>📊 数据管理</div>
              <div style={{ fontSize: 13, color: "rgba(240,234,255,0.5)", marginBottom: 16 }}>重置所有学习进度（单词不会删除）</div>
              <button className="btn-ghost" onClick={() => { if (window.confirm("确定要重置所有答题记录和掌握度吗？")) { setScore({ correct: 0, total: 0 }); setStreak(0); setWords(ws => ws.map(w => ({ ...w, mastery: 0 }))); } }}>
                🔄 重置学习进度
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
