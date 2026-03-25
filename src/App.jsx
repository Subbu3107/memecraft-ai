import { useState, useEffect, useRef } from "react";

const API = "https://memecraft-backend-4pj7.onrender.com";

const LANGUAGES = [
  { code: "en", name: "English",    flag: "🇺🇸" },
  { code: "hi", name: "Hindi",      flag: "🇮🇳" },
  { code: "ar", name: "Arabic",     flag: "🇸🇦" },
  { code: "es", name: "Spanish",    flag: "🇪🇸" },
  { code: "fr", name: "French",     flag: "🇫🇷" },
  { code: "ta", name: "Tamil",      flag: "🇮🇳" },
  { code: "ur", name: "Urdu",       flag: "🇵🇰" },
  { code: "zh", name: "Chinese",    flag: "🇨🇳" },
  { code: "ja", name: "Japanese",   flag: "🇯🇵" },
  { code: "pt", name: "Portuguese", flag: "🇧🇷" },
  { code: "de", name: "German",     flag: "🇩🇪" },
  { code: "ko", name: "Korean",     flag: "🇰🇷" },
  { code: "ru", name: "Russian",    flag: "🇷🇺" },
  { code: "tr", name: "Turkish",    flag: "🇹🇷" },
];

const FALLBACK = [
  { id: "87743020",  name: "Two Buttons",          url: "https://i.imgflip.com/1g8my4.jpg",  source: "imgflip" },
  { id: "112126428", name: "Distracted Boyfriend",  url: "https://i.imgflip.com/1ur9b0.jpg",  source: "imgflip" },
  { id: "93895088",  name: "Expanding Brain",       url: "https://i.imgflip.com/1jwhww.jpg",  source: "imgflip" },
  { id: "129242436", name: "Change My Mind",        url: "https://i.imgflip.com/24y43o.jpg",  source: "imgflip" },
  { id: "61579",     name: "One Does Not Simply",   url: "https://i.imgflip.com/1bij.jpg",    source: "imgflip" },
  { id: "91538330",  name: "Mocking SpongeBob",     url: "https://i.imgflip.com/1otk96.jpg",  source: "imgflip" },
  { id: "4087833",   name: "Waiting Skeleton",      url: "https://i.imgflip.com/2fm6x.jpg",   source: "imgflip" },
  { id: "55311130",  name: "This Is Fine",          url: "https://i.imgflip.com/wxica.jpg",   source: "imgflip" },
];

const LOADING_MSGS = [
  "🎭 Searching 1M+ templates...",
  "🤖 Groq AI cooking...",
  "📊 Matching your vibe...",
  "✨ Almost viral-ready...",
  "🔥 Picking best memes...",
];

const TRENDING = [
  {
    category: "🔥 Desi",
    color: "#FF6B35",
    prompts: [
      { emoji: "📚", text: "UPSC vs Engineering students" },
      { emoji: "💸", text: "Salary day vs 2 days later" },
      { emoji: "🏏", text: "India wins cricket match" },
      { emoji: "😴", text: "Monday morning vs Sunday night" },
      { emoji: "📱", text: "Mom finds your screen time" },
      { emoji: "🎓", text: "Anna University exam pressure" },
      { emoji: "🍛", text: "Ghar ka khana vs hostel food" },
      { emoji: "💔", text: "Arranged marriage vs love marriage" },
    ],
  },
  {
    category: "😂 College",
    color: "#FFD100",
    prompts: [
      { emoji: "📖", text: "Studying night before exam" },
      { emoji: "🎯", text: "Attendance shortage panic" },
      { emoji: "😎", text: "First bench vs last bench" },
      { emoji: "🍕", text: "Canteen food is life" },
      { emoji: "📝", text: "Assignment deadline midnight" },
      { emoji: "🏃", text: "Running to catch college bus" },
      { emoji: "💤", text: "8am class struggle is real" },
      { emoji: "🎉", text: "Last day of semester" },
    ],
  },
  {
    category: "💼 Work",
    color: "#4ADE80",
    prompts: [
      { emoji: "🖥️", text: "WFH vs office life" },
      { emoji: "📧", text: "Boss email on Friday 5pm" },
      { emoji: "☕", text: "Before coffee vs after coffee" },
      { emoji: "🤡", text: "Meeting could have been email" },
      { emoji: "💰", text: "Fresher salary vs expectations" },
      { emoji: "😤", text: "Client says small change needed" },
      { emoji: "🕐", text: "Office timing vs actual work" },
      { emoji: "📊", text: "Appraisal season struggle" },
    ],
  },
  {
    category: "🌍 Global",
    color: "#A855F7",
    prompts: [
      { emoji: "🤖", text: "AI taking over jobs" },
      { emoji: "📉", text: "Crypto going down again" },
      { emoji: "😅", text: "When the code finally works" },
      { emoji: "🎮", text: "Gamers vs sleep schedule" },
      { emoji: "💔", text: "Valentine day alone" },
      { emoji: "🌙", text: "Night owl vs early bird" },
      { emoji: "📺", text: "Netflix one more episode 3am" },
      { emoji: "🛒", text: "Online shopping vs actual need" },
    ],
  },
];

function useIsMobile() {
  const [m, setM] = useState(window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setM(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return m;
}

// Source badge colors
const SOURCE_COLORS = {
  imgflip: { bg: "#1E2A1E", color: "#4ADE80", label: "Classic" },
  reddit:  { bg: "#2A1A0A", color: "#FF6B35", label: "Reddit" },
  giphy:   { bg: "#1A0A2A", color: "#A855F7", label: "GIF" },
  tenor:   { bg: "#0A1A2A", color: "#38BDF8", label: "GIF" },
};

export default function App() {
  const isMobile = useIsMobile();
  const [stage, setStage]                 = useState("input");
  const [prompt, setPrompt]               = useState("");
  const [language, setLanguage]           = useState("en");
  const [allTemplates, setAll]            = useState(FALLBACK);
  const [totalTemplates, setTotalTemplates] = useState(0);
  const [suggested, setSuggested]         = useState([]);
  const [selected, setSelected]           = useState(null);
  const [topText, setTopText]             = useState("");
  const [bottomText, setBottom]           = useState("");
  const [caption, setCaption]             = useState("");
  const [hashtags, setHashtags]           = useState([]);
  const [improvements, setImprovements]   = useState([]);
  const [semanticTags, setSemanticTags]   = useState([]);
  const [loadingMsg, setLoadingMsg]       = useState(LOADING_MSGS[0]);
  const [copied, setCopied]               = useState(false);
  const [newTag, setNewTag]               = useState("");
  const [status, setStatus]               = useState("checking");
  const [downloading, setDownloading]     = useState(false);
  const [uploadedImg, setUploadedImg]     = useState(null);
  const [uploadMode, setUploadMode]       = useState(false);
  const [genCapLoading, setGenCapLoading] = useState(false);
  const [activeCat, setActiveCat]         = useState(0);
  const fileInputRef = useRef(null);

  const langName       = LANGUAGES.find(l => l.code === language)?.name || "English";
  const currentImgSrc  = uploadMode ? uploadedImg : selected?.url;
  const currentIsGif   = !uploadMode && selected?.isGif;

  // ── Load templates + check backend
  useEffect(() => {
    fetch(`${API}/api/templates`)
      .then(r => r.json())
      .then(d => {
        if (d.templates?.length) setAll(d.templates);
        if (d.total) setTotalTemplates(d.total);
        setStatus("online");
      })
      .catch(() => setStatus("offline"));
  }, []);

  // ── DOWNLOAD
  const downloadMeme = async () => {
    if (!currentImgSrc) return;
    if (currentIsGif) { window.open(currentImgSrc, "_blank"); return; }
    setDownloading(true);
    try {
      let blobUrl;
      if (uploadMode && uploadedImg) {
        blobUrl = uploadedImg;
      } else {
        const res = await fetch(`${API}/api/proxy-image?url=${encodeURIComponent(selected.url)}`);
        const blob = await res.blob();
        blobUrl = URL.createObjectURL(blob);
      }
      const img = new Image();
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = blobUrl; });

      const canvas = document.createElement("canvas");
      canvas.width = img.width; canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      const fs = Math.max(28, Math.floor(img.width / 14));
      ctx.font = `900 ${fs}px Impact,Arial Black,sans-serif`;
      ctx.fillStyle = "white"; ctx.strokeStyle = "black";
      ctx.lineWidth = fs / 7; ctx.textAlign = "center"; ctx.lineJoin = "round";

      const draw = (t, x, y) => { ctx.strokeText(t, x, y); ctx.fillText(t, x, y); };
      const wrap = (text, maxW) => {
        const words = text.toUpperCase().split(" ");
        let lines = [], line = "";
        for (let w of words) {
          const test = line ? `${line} ${w}` : w;
          if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; }
          else line = test;
        }
        lines.push(line); return lines;
      };
      const cx = canvas.width / 2, maxW = canvas.width - 60;
      if (topText) { const l = wrap(topText, maxW); l.forEach((t, i) => draw(t, cx, fs * 1.2 + i * (fs + 8))); }
      if (bottomText) { const l = wrap(bottomText, maxW); const sy = canvas.height - (l.length * (fs + 8)) - 14; l.forEach((t, i) => draw(t, cx, sy + i * (fs + 8))); }
      if (!uploadMode) URL.revokeObjectURL(blobUrl);

      const a = document.createElement("a");
      a.download = `memecraft-${Date.now()}.png`; a.href = canvas.toDataURL("image/png"); a.click();
    } catch { alert("Download failed. Long press image → Save 📱"); }
    setDownloading(false);
  };

  // ── UPLOAD
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setUploadedImg(ev.target.result); setUploadMode(true);
      setSelected(null); setTopText(""); setBottom("");
      setCaption(""); setHashtags([]); setStage("edit");
    };
    reader.readAsDataURL(file);
  };

  const generateCaptionForUpload = async () => {
    if (!prompt.trim()) { alert("Add a prompt first!"); return; }
    setGenCapLoading(true);
    try {
      const r = await fetch(`${API}/api/regenerate-caption`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, language: langName }),
      });
      const d = await r.json();
      if (d.caption) setCaption(d.caption);
      if (d.hashtags) setHashtags(d.hashtags);
    } catch { setCaption(`${prompt} 😂`); setHashtags(["memes", "funny", "viral"]); }
    setGenCapLoading(false);
  };

  const clearUpload = () => {
    setUploadedImg(null); setUploadMode(false); setStage("input");
    setTopText(""); setBottom(""); setCaption(""); setHashtags([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── GENERATE (v2 — uses full template objects from API)
  const generate = async (customPrompt) => {
    const p = customPrompt || prompt;
    if (!p.trim()) return;
    if (customPrompt) setPrompt(customPrompt);
    setUploadMode(false); setUploadedImg(null); setStage("loading");
    let i = 0; setLoadingMsg(LOADING_MSGS[0]);
    const iv = setInterval(() => { i = (i + 1) % LOADING_MSGS.length; setLoadingMsg(LOADING_MSGS[i]); }, 1300);

    try {
      const res = await fetch(`${API}/api/generate-meme`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: p, language: langName }),
      });
      clearInterval(iv);
      const d = await res.json();

      // v2: API returns full template objects directly
      let picks = d.templates || [];

      // Fallback if API didn't return templates
      if (!picks.length) {
        picks = allTemplates.slice(0, 4);
      }

      setSuggested(picks.slice(0, 4));
      setTopText(d.topText || "");
      setBottom(d.bottomText || "");
      setCaption(d.instagramCaption || "");
      setHashtags(d.hashtags || []);
      setImprovements(d.improvements || []);
      setSemanticTags(d.semanticTags || []);
      if (d.totalTemplatesSearched) setTotalTemplates(d.totalTemplatesSearched);
      setStage("results");
    } catch {
      clearInterval(iv);
      setSuggested(allTemplates.slice(0, 4));
      setTopText("When you finally"); setBottom("Get the joke 😂");
      setCaption(`${p} 😭✨`);
      setHashtags(["memes","funny","viral","relatable","lol","trending","memesdaily","humor","comedy","funnymemes"]);
      setImprovements(["Check backend is running","Check GROQ_API_KEY","Try a specific prompt","Restart python main.py"]);
      setStage("results");
    }
  };

  const regenCaption = async () => {
    try {
      const r = await fetch(`${API}/api/regenerate-caption`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, language: langName }),
      });
      const d = await r.json();
      if (d.caption) setCaption(d.caption);
      if (d.hashtags) setHashtags(d.hashtags);
    } catch {}
  };

  const copyAll = () => {
    navigator.clipboard.writeText(`${caption}\n\n${hashtags.map(h => `#${h}`).join(" ")}`).catch(() => {});
    setCopied(true); setTimeout(() => setCopied(false), 2500);
  };

  const addTag = () => {
    const t = newTag.replace(/^#/, "").trim();
    if (t && !hashtags.includes(t)) setHashtags([...hashtags, t]);
    setNewTag("");
  };

  const reset = () => {
    setStage("input"); setPrompt(""); setSuggested([]);
    setSelected(null); setUploadedImg(null); setUploadMode(false);
  };

  const srcBadge = (src) => SOURCE_COLORS[src] || { bg: "#1A1A1A", color: "#888", label: src };

  return (
    <div style={{ fontFamily: "'Inter',system-ui,sans-serif", background: "#0A0A0A", minHeight: "100vh", color: "#fff", overflowX: "hidden", maxWidth: "100vw" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700;900&display=swap');
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        html,body{overflow-x:hidden;max-width:100vw}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(255,209,0,.2)}50%{box-shadow:0 0 40px rgba(255,209,0,.5)}}
        @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
        @keyframes dlpulse{0%,100%{box-shadow:0 0 0 rgba(74,222,128,0)}50%{box-shadow:0 0 20px rgba(74,222,128,.4)}}
        .fade-up{animation:fadeUp .3s ease forwards}
        .mw{position:relative;line-height:0;overflow:hidden}
        .mt{position:absolute;left:0;right:0;font-family:Impact,'Arial Black',sans-serif;font-weight:900;text-transform:uppercase;color:#fff;text-align:center;padding:4px 8px;line-height:1.15;word-break:break-word;-webkit-text-stroke:2px black;text-shadow:2px 2px 0 #000,-2px -2px 0 #000,2px -2px 0 #000,-2px 2px 0 #000;font-size:clamp(12px,4vw,24px)}
        .mt-top{top:4px}.mt-bot{bottom:4px}
        .tc{background:#151515;border:1px solid #222;border-radius:12px;cursor:pointer;overflow:hidden;transition:border-color .2s}
        .tc:active{border-color:#FFD100}
        .card{background:#151515;border:1px solid #222;border-radius:12px}
        .btn-y{background:#FFD100;color:#000;font-weight:800;border:none;cursor:pointer;border-radius:12px;transition:all .15s;font-family:inherit;touch-action:manipulation}
        .btn-y:active{opacity:.85}
        .btn-y:disabled{opacity:.3;cursor:not-allowed}
        .btn-g{background:transparent;color:#777;border:1px solid #2A2A2A;cursor:pointer;border-radius:8px;font-family:inherit;touch-action:manipulation}
        .btn-g:active{border-color:#FF2D78;color:#FF2D78}
        .btn-dl{background:#4ADE80;color:#000;font-weight:800;border:none;cursor:pointer;border-radius:12px;font-family:inherit;animation:dlpulse 2s infinite;touch-action:manipulation}
        .btn-dl:active{opacity:.85}
        .btn-dl:disabled{opacity:.5;cursor:not-allowed;animation:none}
        .btn-upload{background:linear-gradient(135deg,#7C3AED,#A855F7);color:#fff;font-weight:800;border:none;cursor:pointer;border-radius:12px;font-family:inherit;touch-action:manipulation}
        .btn-upload:active{opacity:.85}
        .upload-zone{border:2px dashed #3A2A5A;border-radius:14px;background:rgba(124,58,237,.05);cursor:pointer}
        .upload-zone:active{background:rgba(124,58,237,.12)}
        .chip{border:1px solid #222;background:#111;cursor:pointer;border-radius:10px;font-family:inherit;font-weight:600;touch-action:manipulation;display:flex;align-items:center;gap:6px;text-align:left}
        .chip:active{background:#1A1A1A;border-color:#FFD100}
        .cat-btn{border:none;cursor:pointer;border-radius:20px;font-family:inherit;font-weight:700;font-size:12px;padding:7px 12px;white-space:nowrap;touch-action:manipulation}
        .cats{display:flex;gap:7px;overflow-x:auto;padding-bottom:2px;-webkit-overflow-scrolling:touch}
        .cats::-webkit-scrollbar{display:none}
        input,textarea{background:#1A1A1A;border:1px solid #2A2A2A;color:#fff;border-radius:10px;outline:none;font-family:inherit;width:100%;font-size:16px}
        input:focus,textarea:focus{border-color:#FFD100}
        input::placeholder,textarea::placeholder{color:#444}
        .hp{background:#111;border:1px solid #2A2A2A;border-radius:20px;padding:5px 12px;font-size:12px;color:#FF2D78;cursor:pointer;display:inline-block;margin:3px;touch-action:manipulation}
        .hp:active{background:#200a14}
        .ic{background:#111;border-left:3px solid #FFD100;border-radius:0 8px 8px 0;padding:12px 14px}
        .stag{background:#111;border:1px solid #1E1E1E;border-radius:20px;padding:3px 10px;font-size:11px;color:#555;display:inline-block;margin:2px}
        ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#222;border-radius:3px}
        @media(max-width:767px){
          .edit-grid{display:flex!important;flex-direction:column!important;gap:18px!important}
          .two-col{grid-template-columns:1fr!important}
          .ig-mock{max-width:100%!important}
        }
        @media(min-width:768px){
          .tc:hover{border-color:#FFD100;transform:translateY(-2px)}
          .btn-y:hover{background:#FFE84D}
          .btn-dl:hover{background:#22c55e}
        }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ padding: isMobile ? "11px 14px" : "13px 24px", borderBottom: "1px solid #1A1A1A", display: "flex", alignItems: "center", gap: 10, position: "sticky", top: 0, background: "#0A0A0A", zIndex: 100, width: "100%" }}>
        <span>🔥</span>
        <span style={{ fontFamily: "'Bebas Neue',cursive", fontSize: isMobile ? 19 : 24, letterSpacing: 2, color: "#FFD100", whiteSpace: "nowrap" }}>MEMECRAFT AI</span>
        {totalTemplates > 0 && (
          <span style={{ fontSize: 10, color: "#444", background: "#111", border: "1px solid #1E1E1E", borderRadius: 20, padding: "2px 8px", whiteSpace: "nowrap" }}>
            {totalTemplates.toLocaleString()}+ templates
          </span>
        )}
        <span style={{ fontSize: 10, color: status === "online" ? "#4ADE80" : "#FF2D78", display: "flex", alignItems: "center", gap: 3, flexShrink: 0 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: status === "online" ? "#4ADE80" : "#FF2D78", display: "inline-block" }} />
          {status === "online" ? "Live" : "Offline"}
        </span>
        {stage !== "input" && <button className="btn-g" style={{ marginLeft: "auto", padding: "7px 12px", fontSize: 12, flexShrink: 0 }} onClick={reset}>+ New</button>}
      </div>

      {/* ══ INPUT ══ */}
      {stage === "input" && (
        <div style={{ maxWidth: 600, margin: "0 auto", padding: isMobile ? "20px 14px 60px" : "36px 24px 80px", width: "100%" }} className="fade-up">
          <div style={{ textAlign: "center", marginBottom: isMobile ? 22 : 32 }}>
            <h1 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: isMobile ? "clamp(38px,11vw,54px)" : "clamp(52px,8vw,78px)", margin: 0, letterSpacing: isMobile ? 1 : 3, lineHeight: .93 }}>
              GENERATE VIRAL<br />
              <span style={{ color: "#FFD100", WebkitTextStroke: "2px #FFD100", WebkitTextFillColor: "transparent" }}>MEMES</span> IN SECONDS
            </h1>
            <p style={{ color: "#555", marginTop: 10, fontSize: isMobile ? 12 : 14 }}>
              Groq AI · Reddit + GIPHY + Imgflip · {totalTemplates > 0 ? `${totalTemplates.toLocaleString()}+` : "1000+"} Templates
            </p>
          </div>

          {/* TRENDING */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span style={{ fontFamily: "'Bebas Neue',cursive", fontSize: 17, letterSpacing: 2 }}>🔥 TRENDING NOW</span>
              <span style={{ fontSize: 10, background: "rgba(255,107,53,.15)", border: "1px solid rgba(255,107,53,.3)", color: "#FF6B35", borderRadius: 20, padding: "2px 8px" }}>INDIA 🇮🇳</span>
            </div>
            <div className="cats" style={{ marginBottom: 10 }}>
              {TRENDING.map((cat, i) => (
                <button key={i} className="cat-btn" onClick={() => setActiveCat(i)}
                  style={{ background: activeCat === i ? cat.color : "#151515", color: activeCat === i ? "#000" : "#666", border: `1px solid ${activeCat === i ? cat.color : "#222"}` }}>
                  {cat.category}
                </button>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {TRENDING[activeCat].prompts.map((p, i) => (
                <button key={i} className="chip" onClick={() => generate(p.text)}
                  style={{ padding: isMobile ? "9px 10px" : "10px 12px", fontSize: isMobile ? 12 : 13, color: "#ccc" }}>
                  <span style={{ fontSize: 15, flexShrink: 0 }}>{p.emoji}</span>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.text}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1, height: 1, background: "#1E1E1E" }} />
            <span style={{ fontSize: 10, color: "#333", letterSpacing: 1, whiteSpace: "nowrap" }}>OR WRITE YOUR OWN</span>
            <div style={{ flex: 1, height: 1, background: "#1E1E1E" }} />
          </div>

          <div className="upload-zone" style={{ padding: "14px", marginBottom: 10, textAlign: "center" }}
            onClick={() => fileInputRef.current?.click()}>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileUpload} />
            <div style={{ fontSize: 26, marginBottom: 3 }}>🖼️</div>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#A855F7", marginBottom: 2 }}>Upload Your Own Photo</div>
            <div style={{ fontSize: 11, color: "#555" }}>Tap · JPG, PNG, WEBP</div>
          </div>

          <textarea value={prompt} onChange={e => setPrompt(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) generate(); }}
            placeholder={"Type your meme idea...\n\"Monday mornings hitting different\""}
            style={{ padding: "13px 14px", fontSize: 15, minHeight: 90, resize: "none", lineHeight: 1.6, borderRadius: 12, marginBottom: 12 }} />

          <div style={{ marginBottom: 16 }}>
            <p style={{ color: "#444", fontSize: 10, letterSpacing: 2, marginBottom: 9, textTransform: "uppercase" }}>🌍 Language</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {LANGUAGES.map(l => (
                <button key={l.code} onClick={() => setLanguage(l.code)}
                  style={{ border: `1px solid ${language === l.code ? "#FFD100" : "#222"}`, background: language === l.code ? "rgba(255,209,0,.08)" : "#111", color: language === l.code ? "#FFD100" : "#666", fontWeight: language === l.code ? 700 : 400, borderRadius: 8, cursor: "pointer", fontSize: isMobile ? 11 : 13, padding: isMobile ? "5px 9px" : "6px 12px", fontFamily: "inherit" }}>
                  {l.flag} {l.name}
                </button>
              ))}
            </div>
          </div>

          <button className="btn-y" disabled={!prompt.trim()} onClick={() => generate()}
            style={{ width: "100%", padding: "15px", fontSize: 16, letterSpacing: 1, animation: prompt.trim() ? "glow 2s infinite" : "none" }}>
            ⚡ GENERATE MEME
          </button>
        </div>
      )}

      {/* ══ LOADING ══ */}
      {stage === "loading" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "75vh", gap: 22, padding: "0 20px", textAlign: "center" }}>
          <div style={{ fontSize: 60, animation: "spin 1.2s linear infinite" }}>⚙️</div>
          <div style={{ fontFamily: "'Bebas Neue',cursive", fontSize: isMobile ? 24 : 32, letterSpacing: 3, color: "#FFD100" }}>{loadingMsg}</div>
          <div style={{ display: "flex", gap: 6 }}>
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: i % 2 === 0 ? "#FFD100" : "#FF2D78", animation: `pulse 1s ${i * .15}s infinite` }} />
            ))}
          </div>
          {totalTemplates > 0 && (
            <p style={{ color: "#333", fontSize: 12 }}>Searching {totalTemplates.toLocaleString()}+ templates from Reddit, GIPHY & Imgflip...</p>
          )}
        </div>
      )}

      {/* ══ RESULTS ══ */}
      {stage === "results" && (
        <div style={{ maxWidth: 980, margin: "0 auto", padding: isMobile ? "14px 12px" : "36px 24px", width: "100%" }} className="fade-up">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, alignItems: "flex-start", gap: 10 }}>
            <div>
              <h2 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: isMobile ? "clamp(20px,6vw,28px)" : "clamp(28px,4vw,42px)", margin: 0, letterSpacing: 2 }}>
                AI PICKED <span style={{ color: "#FFD100" }}>4 TEMPLATES</span>
              </h2>
              <p style={{ color: "#555", margin: "5px 0 0", fontSize: 12 }}>
                👆 Tap to customize · Searched {totalTemplates > 0 ? `${totalTemplates.toLocaleString()}+` : ""} templates
              </p>
            </div>
            <button className="btn-g" onClick={() => setStage("input")} style={{ padding: "7px 12px", fontSize: 12, flexShrink: 0 }}>← Change</button>
          </div>

          {/* Prompt + semantic tags */}
          <div style={{ background: "#111", border: "1px solid #1E1E1E", borderRadius: 9, padding: "10px 13px", marginBottom: 14 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: semanticTags.length ? 8 : 0 }}>
              <span style={{ fontSize: 12, color: "#555", flexShrink: 0 }}>Prompt:</span>
              <span style={{ fontSize: 12, color: "#aaa", fontStyle: "italic", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>"{prompt}"</span>
              <span style={{ fontSize: 10, color: "#FF2D78", background: "rgba(255,45,120,.1)", border: "1px solid rgba(255,45,120,.2)", borderRadius: 20, padding: "2px 8px", flexShrink: 0 }}>
                {LANGUAGES.find(l => l.code === language)?.flag} {langName}
              </span>
            </div>
            {semanticTags.length > 0 && (
              <div>
                <span style={{ fontSize: 10, color: "#333", letterSpacing: 1 }}>AI TAGS: </span>
                {semanticTags.slice(0, 8).map(t => <span key={t} className="stag">{t}</span>)}
              </div>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10, marginBottom: 14 }}>
            {suggested.map((t, i) => {
              const badge = srcBadge(t.source);
              return (
                <div key={t.id} className="tc" onClick={() => { setSelected(t); setUploadMode(false); setStage("edit"); }}>
                  <div className="mw">
                    {t.isGif
                      ? <img src={t.url} alt={t.name} style={{ width: "100%", display: "block", maxHeight: isMobile ? 160 : 250 }} />
                      : <img src={t.url} alt={t.name} style={{ width: "100%", display: "block", maxHeight: isMobile ? 160 : 250, objectFit: "cover" }} />
                    }
                    {topText && <div className="mt mt-top">{topText}</div>}
                    {bottomText && <div className="mt mt-bot">{bottomText}</div>}
                    <div style={{ position: "absolute", top: 6, left: 6, background: "#FFD100", color: "#000", padding: "2px 7px", borderRadius: 4, fontSize: 9, fontWeight: 800 }}>AI #{i + 1}</div>
                    <div style={{ position: "absolute", top: 6, right: 6, background: badge.bg, color: badge.color, padding: "2px 7px", borderRadius: 4, fontSize: 9, fontWeight: 700, border: `1px solid ${badge.color}40` }}>
                      {t.isGif ? "🎞️ GIF" : badge.label}
                    </div>
                  </div>
                  <div style={{ padding: "9px 11px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 600, fontSize: 11, color: "#ccc", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{t.name}</span>
                    <span style={{ color: "#FFD100", fontSize: 11, fontWeight: 700, flexShrink: 0, marginLeft: 6 }}>Edit →</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div className="card" style={{ padding: 14 }}>
              <p style={{ color: "#444", fontSize: 10, letterSpacing: 2, margin: "0 0 8px", textTransform: "uppercase" }}>📝 Caption</p>
              <p style={{ margin: 0, lineHeight: 1.6, fontSize: 13, color: "#ccc" }}>{caption}</p>
            </div>
            <div className="card" style={{ padding: 14 }}>
              <p style={{ color: "#444", fontSize: 10, letterSpacing: 2, margin: "0 0 8px", textTransform: "uppercase" }}>#️⃣ Hashtags</p>
              <div>{hashtags.map(h => <span key={h} className="hp">#{h}</span>)}</div>
            </div>
          </div>

          <div className="card" style={{ padding: 14 }}>
            <p style={{ color: "#FFD100", fontSize: 10, letterSpacing: 2, margin: "0 0 10px", fontWeight: 800, textTransform: "uppercase" }}>💡 Viral Tips</p>
            <div className="two-col" style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8 }}>
              {improvements.map((imp, i) => (
                <div key={i} className="ic">
                  <div style={{ fontSize: 9, color: "#FFD100", fontWeight: 800, marginBottom: 3 }}>TIP {String(i + 1).padStart(2, "0")}</div>
                  <div style={{ fontSize: 12, color: "#999", lineHeight: 1.5 }}>{imp}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══ EDIT ══ */}
      {stage === "edit" && (selected || uploadedImg) && (
        <div style={{ maxWidth: 1060, margin: "0 auto", padding: isMobile ? "13px 13px 60px" : "36px 24px 60px", width: "100%" }} className="fade-up">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: isMobile ? 16 : 24, flexWrap: "wrap" }}>
            <button className="btn-g" onClick={() => uploadMode ? clearUpload() : setStage("results")} style={{ padding: "8px 13px", fontSize: 13 }}>← Back</button>
            <h2 style={{ fontFamily: "'Bebas Neue',cursive", fontSize: isMobile ? "clamp(18px,5vw,26px)" : "clamp(22px,3vw,36px)", margin: 0, letterSpacing: 2 }}>
              {uploadMode ? <><span style={{ color: "#A855F7" }}>YOUR PHOTO</span> AS MEME</> : <>CUSTOMIZE <span style={{ color: "#FFD100" }}>MEME</span></>}
            </h2>
            {selected?.source && !uploadMode && (
              <span style={{ fontSize: 10, background: srcBadge(selected.source).bg, color: srcBadge(selected.source).color, border: `1px solid ${srcBadge(selected.source).color}40`, borderRadius: 20, padding: "3px 10px" }}>
                {selected.isGif ? "🎞️ GIF" : `📌 ${srcBadge(selected.source).label}`}
              </span>
            )}
          </div>

          <div className="edit-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {/* LEFT */}
            <div>
              <div className="mw" style={{ borderRadius: 12, overflow: "hidden", background: "#000", boxShadow: "0 14px 40px rgba(0,0,0,.6)" }}>
                <img src={currentImgSrc} alt="meme" style={{ width: "100%", display: "block" }} />
                {topText && <div className="mt mt-top">{topText}</div>}
                {bottomText && <div className="mt mt-bot">{bottomText}</div>}
              </div>

              <button className="btn-dl" onClick={downloadMeme} disabled={downloading}
                style={{ width: "100%", padding: "13px", marginTop: 11, fontSize: 15, letterSpacing: 1 }}>
                {downloading ? "⏳ Generating..." : currentIsGif ? "🎞️ OPEN GIF (Long press → Save)" : "⬇️ DOWNLOAD MEME (PNG)"}
              </button>
              <p style={{ fontSize: 10, color: "#444", textAlign: "center", marginTop: 5 }}>
                {currentIsGif ? "GIF: Long press → Save image" : "High-quality PNG · No watermark · Free"}
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 11, marginTop: 13 }}>
                <div>
                  <label style={{ fontSize: 10, color: "#555", letterSpacing: 2, textTransform: "uppercase" }}>Top Text</label>
                  <input value={topText} onChange={e => setTopText(e.target.value)} placeholder="Keep it short!" style={{ padding: "11px 13px", marginTop: 5 }} />
                </div>
                <div>
                  <label style={{ fontSize: 10, color: "#555", letterSpacing: 2, textTransform: "uppercase" }}>Bottom Text</label>
                  <input value={bottomText} onChange={e => setBottom(e.target.value)} placeholder="Keep it short!" style={{ padding: "11px 13px", marginTop: 5 }} />
                </div>
                {uploadMode ? (
                  <div>
                    <label style={{ fontSize: 10, color: "#555", letterSpacing: 2, textTransform: "uppercase" }}>Swap Photo</label>
                    <button className="btn-upload" style={{ width: "100%", padding: "11px", marginTop: 5, fontSize: 13 }} onClick={() => fileInputRef.current?.click()}>
                      📁 Choose Different Photo
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileUpload} />
                  </div>
                ) : (
                  <div>
                    <label style={{ fontSize: 10, color: "#555", letterSpacing: 2, textTransform: "uppercase" }}>Swap Template</label>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginTop: 7 }}>
                      {suggested.filter(t => t.id !== selected?.id).map(t => (
                        <button key={t.id} className="btn-g" onClick={() => setSelected(t)} style={{ padding: "7px 9px", fontSize: 11, display: "flex", alignItems: "center", gap: 6 }}>
                          <img src={t.url} alt="" style={{ width: 24, height: 24, objectFit: "cover", borderRadius: 4, flexShrink: 0 }} />
                          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.name.length > 14 ? t.name.slice(0, 14) + "…" : t.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="ig-mock" style={{ background: "#fff", borderRadius: 13, overflow: "hidden", maxWidth: 340, margin: "0 auto", width: "100%", boxShadow: "0 14px 40px rgba(0,0,0,.5)" }}>
                <div style={{ padding: "10px 13px", display: "flex", alignItems: "center", gap: 9, borderBottom: "1px solid #f0f0f0" }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>M</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 12, color: "#111" }}>memecraft_ai</div>
                    <div style={{ fontSize: 10, color: "#999" }}>Just now</div>
                  </div>
                  <span style={{ marginLeft: "auto", fontSize: 16, color: "#111" }}>···</span>
                </div>
                <div className="mw">
                  <img src={currentImgSrc} alt="ig" style={{ width: "100%", display: "block" }} />
                  {topText && <div className="mt mt-top">{topText}</div>}
                  {bottomText && <div className="mt mt-bot">{bottomText}</div>}
                </div>
                <div style={{ padding: "9px 13px 12px" }}>
                  <div style={{ display: "flex", gap: 11, marginBottom: 6 }}>
                    {["🤍", "💬", "✈️"].map(e => <span key={e} style={{ fontSize: 18 }}>{e}</span>)}
                    <span style={{ fontSize: 18, marginLeft: "auto" }}>🔖</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#111", fontWeight: 700 }}>12,847 likes</div>
                  <div style={{ fontSize: 12, color: "#111", marginTop: 3, lineHeight: 1.5 }}>
                    <span style={{ fontWeight: 700 }}>memecraft_ai </span>
                    {caption || <span style={{ color: "#bbb" }}>Caption here...</span>}
                  </div>
                  <div style={{ fontSize: 11, color: "#0095f6", marginTop: 4, lineHeight: 1.8 }}>
                    {hashtags.slice(0, 5).map(h => `#${h}`).join(" ")}
                  </div>
                </div>
              </div>

              <div className="card" style={{ padding: 14 }}>
                {uploadMode && (
                  <div style={{ marginBottom: 12 }}>
                    <label style={{ fontSize: 10, color: "#555", letterSpacing: 2, textTransform: "uppercase" }}>What's this about?</label>
                    <div style={{ display: "flex", gap: 7, marginTop: 7 }}>
                      <input value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="e.g. exam stress..." style={{ padding: "9px 11px", flex: 1 }} />
                      <button className="btn-upload" disabled={genCapLoading} onClick={generateCaptionForUpload} style={{ padding: "9px 11px", fontSize: 12, borderRadius: 8, flexShrink: 0 }}>
                        {genCapLoading ? "⏳" : "✨ AI"}
                      </button>
                    </div>
                  </div>
                )}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                  <label style={{ fontSize: 10, color: "#555", letterSpacing: 2, textTransform: "uppercase" }}>📝 Caption</label>
                  {!uploadMode && <button className="btn-g" onClick={regenCaption} style={{ padding: "4px 9px", fontSize: 11 }}>🔄 Regen</button>}
                </div>
                <textarea value={caption} onChange={e => setCaption(e.target.value)} placeholder="Caption..."
                  style={{ padding: "9px 11px", fontSize: 14, minHeight: 65, resize: "vertical", lineHeight: 1.6 }} />

                <div style={{ marginTop: 12 }}>
                  <label style={{ fontSize: 10, color: "#555", letterSpacing: 2, textTransform: "uppercase" }}>#️⃣ Hashtags</label>
                  <div style={{ marginTop: 7, lineHeight: 2 }}>
                    {hashtags.map((h, i) => (
                      <span key={i} className="hp" onClick={() => setHashtags(hashtags.filter((_, j) => j !== i))}>
                        #{h} <span style={{ opacity: .5 }}>×</span>
                      </span>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 7, marginTop: 9 }}>
                    <input value={newTag} onChange={e => setNewTag(e.target.value)} onKeyDown={e => e.key === "Enter" && addTag()} placeholder="Add hashtag..." style={{ padding: "8px 11px", flex: 1 }} />
                    <button className="btn-g" onClick={addTag} style={{ padding: "8px 11px", fontSize: 13, flexShrink: 0 }}>+ Add</button>
                  </div>
                </div>

                <button className="btn-y" onClick={copyAll} style={{ width: "100%", padding: "12px", marginTop: 12, fontSize: 14 }}>
                  {copied ? "✅ Copied!" : "📋 Copy Caption + Hashtags"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
