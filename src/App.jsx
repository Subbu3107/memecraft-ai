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
  { id: "181913649", name: "Drake Hotline Bling",   url: "https://i.imgflip.com/30b1gx.jpg" },
  { id: "87743020",  name: "Two Buttons",            url: "https://i.imgflip.com/1g8my4.jpg" },
  { id: "112126428", name: "Distracted Boyfriend",   url: "https://i.imgflip.com/1ur9b0.jpg" },
  { id: "131087935", name: "Running Away Balloon",   url: "https://i.imgflip.com/261o3j.jpg" },
  { id: "93895088",  name: "Expanding Brain",        url: "https://i.imgflip.com/1jwhww.jpg" },
  { id: "129242436", name: "Change My Mind",         url: "https://i.imgflip.com/24y43o.jpg" },
  { id: "61579",     name: "One Does Not Simply",    url: "https://i.imgflip.com/1bij.jpg" },
  { id: "91538330",  name: "Mocking SpongeBob",      url: "https://i.imgflip.com/1otk96.jpg" },
];

const LOADING_MSGS = [
  "🎭 Raiding the meme vault...",
  "🤖 Groq AI is cooking...",
  "📊 Analyzing viral trends...",
  "✨ Sprinkling meme magic...",
  "🔥 Almost viral-ready...",
];

export default function MemeGenerator() {
  const [stage, setStage]               = useState("input");
  const [prompt, setPrompt]             = useState("");
  const [language, setLanguage]         = useState("en");
  const [allTemplates, setAll]          = useState(FALLBACK);
  const [suggested, setSuggested]       = useState([]);
  const [selected, setSelected]         = useState(null);
  const [topText, setTopText]           = useState("");
  const [bottomText, setBottom]         = useState("");
  const [caption, setCaption]           = useState("");
  const [hashtags, setHashtags]         = useState([]);
  const [improvements, setImprovements] = useState([]);
  const [loadingMsg, setLoadingMsg]     = useState(LOADING_MSGS[0]);
  const [copied, setCopied]             = useState(false);
  const [newTag, setNewTag]             = useState("");
  const [status, setStatus]             = useState("checking");
  const [downloading, setDownloading]   = useState(false);

  // ── Custom Upload State
  const [uploadedImg, setUploadedImg]   = useState(null); // base64 data URL
  const [uploadMode, setUploadMode]     = useState(false);
  const [genCapLoading, setGenCapLoading] = useState(false);
  const fileInputRef = useRef(null);

  const langName = LANGUAGES.find(l => l.code === language)?.name || "English";

  useEffect(() => {
    fetch(`${API}/api/templates`)
      .then(r => r.json())
      .then(d => { if (d.templates?.length) setAll(d.templates); setStatus("online"); })
      .catch(() => setStatus("offline"));
  }, []);

  // ── WORKING BLOB-BASED DOWNLOAD (fixed version) ──────────────
  const downloadMeme = async () => {
    if (!selected && !uploadedImg) return;
    setDownloading(true);
    try {
      let blobUrl;

      if (uploadedImg) {
        // Uploaded image is already base64 — use directly
        blobUrl = uploadedImg;
      } else {
        // Fetch imgflip image through backend proxy
        const res = await fetch(`${API}/api/proxy-image?url=${encodeURIComponent(selected.url)}`);
        const blob = await res.blob();
        blobUrl = URL.createObjectURL(blob);
      }

      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = blobUrl;
      });

      const canvas = document.createElement("canvas");
      canvas.width  = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      const fontSize = Math.max(28, Math.floor(img.width / 12));
      ctx.font        = `900 ${fontSize}px Impact, Arial Black, sans-serif`;
      ctx.fillStyle   = "white";
      ctx.strokeStyle = "black";
      ctx.lineWidth   = fontSize / 8;
      ctx.textAlign   = "center";
      ctx.lineJoin    = "round";

      const drawText = (text, x, y) => {
        ctx.strokeText(text, x, y);
        ctx.fillText(text, x, y);
      };

      const wrapText = (text, maxW) => {
        const words = text.toUpperCase().split(" ");
        let lines = [], line = "";
        for (let w of words) {
          const test = line ? `${line} ${w}` : w;
          if (ctx.measureText(test).width > maxW && line) {
            lines.push(line); line = w;
          } else line = test;
        }
        lines.push(line);
        return lines;
      };

      const cx  = canvas.width / 2;
      const maxW = canvas.width - 40;

      if (topText) {
        const lines = wrapText(topText, maxW);
        lines.forEach((l, i) => drawText(l, cx, fontSize * 1.1 + i * (fontSize + 6)));
      }
      if (bottomText) {
        const lines = wrapText(bottomText, maxW);
        const startY = canvas.height - (lines.length * (fontSize + 6)) - 10;
        lines.forEach((l, i) => drawText(l, cx, startY + i * (fontSize + 6)));
      }

      if (!uploadedImg) URL.revokeObjectURL(blobUrl);

      const link = document.createElement("a");
      link.download = `memecraft-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch {
      alert("Download failed. Long press the meme image → Save 📱");
    }
    setDownloading(false);
  };
  // ─────────────────────────────────────────────────────────────

  // ── CUSTOM IMAGE UPLOAD ──────────────────────────────────────
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file (JPG, PNG, WEBP)");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setUploadedImg(ev.target.result);
      setUploadMode(true);
      setSelected(null);
      setTopText("");
      setBottom("");
      setCaption("");
      setHashtags([]);
      setStage("edit");
    };
    reader.readAsDataURL(file);
  };

  const generateCaptionForUpload = async () => {
    if (!prompt.trim()) {
      alert("Add a prompt first so AI knows what caption to write!");
      return;
    }
    setGenCapLoading(true);
    try {
      const r = await fetch(`${API}/api/regenerate-caption`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, language: langName }),
      });
      const d = await r.json();
      if (d.caption)  setCaption(d.caption);
      if (d.hashtags) setHashtags(d.hashtags);
    } catch {
      setCaption(`${prompt} 😂 Tag someone who relates!`);
      setHashtags(["memes","funny","viral","relatable","lol","trending"]);
    }
    setGenCapLoading(false);
  };

  const clearUpload = () => {
    setUploadedImg(null);
    setUploadMode(false);
    setStage("input");
    setTopText("");
    setBottom("");
    setCaption("");
    setHashtags([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  // ─────────────────────────────────────────────────────────────

  const generate = async () => {
    if (!prompt.trim()) return;
    setUploadMode(false);
    setUploadedImg(null);
    setStage("loading");
    let i = 0;
    setLoadingMsg(LOADING_MSGS[0]);
    const iv = setInterval(() => { i=(i+1)%LOADING_MSGS.length; setLoadingMsg(LOADING_MSGS[i]); }, 1400);

    try {
      const res = await fetch(`${API}/api/generate-meme`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt, language: langName,
          templates: allTemplates.slice(0,100).map(t=>({ id:t.id, name:t.name })),
        }),
      });
      clearInterval(iv);
      const d = await res.json();

      let picks = (d.selectedTemplateIds||[])
        .map(id=>allTemplates.find(t=>t.id===id)).filter(Boolean).slice(0,4);
      if (picks.length<4) picks=[...picks,...allTemplates.filter(t=>!picks.find(p=>p.id===t.id))].slice(0,4);

      setSuggested(picks);
      setTopText(d.topText||"");
      setBottom(d.bottomText||"");
      setCaption(d.instagramCaption||"");
      setHashtags(d.hashtags||[]);
      setImprovements(d.improvements||[]);
      setStage("results");
    } catch {
      clearInterval(iv);
      setSuggested(allTemplates.slice(0,4));
      setTopText("When you finally");
      setBottom("Get the joke 😂");
      setCaption(`${prompt} — the struggle is real 😭✨`);
      setHashtags(["memes","funny","viral","relatable","lol","trending","memesdaily","humor","comedy","funnymemes"]);
      setImprovements(["Check backend is running","Check GROQ_API_KEY","Try specific prompt","Restart python main.py"]);
      setStage("results");
    }
  };

  const regenCaption = async () => {
    try {
      const r = await fetch(`${API}/api/regenerate-caption`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ prompt, language: langName }),
      });
      const d = await r.json();
      if (d.caption)  setCaption(d.caption);
      if (d.hashtags) setHashtags(d.hashtags);
    } catch {}
  };

  const copyAll = () => {
    navigator.clipboard.writeText(`${caption}\n\n${hashtags.map(h=>`#${h}`).join(" ")}`).catch(()=>{});
    setCopied(true); setTimeout(()=>setCopied(false),2500);
  };

  const addTag = () => {
    const t = newTag.replace(/^#/,"").trim();
    if (t && !hashtags.includes(t)) setHashtags([...hashtags,t]);
    setNewTag("");
  };

  const reset = () => {
    setStage("input"); setPrompt(""); setSuggested([]);
    setSelected(null); setUploadedImg(null); setUploadMode(false);
  };

  // Current image source (uploaded or template)
  const currentImgSrc = uploadMode ? uploadedImg : selected?.url;

  return (
    <div style={{fontFamily:"'Inter',system-ui,sans-serif",background:"#0A0A0A",minHeight:"100vh",color:"#fff"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700;900&display=swap');
        *{box-sizing:border-box}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(255,209,0,.2)}50%{box-shadow:0 0 40px rgba(255,209,0,.5)}}
        @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
        @keyframes dlpulse{0%,100%{box-shadow:0 0 0 rgba(74,222,128,0)}50%{box-shadow:0 0 20px rgba(74,222,128,.4)}}
        @keyframes uploadglow{0%,100%{box-shadow:0 0 0 rgba(168,85,247,0)}50%{box-shadow:0 0 24px rgba(168,85,247,.5)}}
        .fade-up{animation:fadeUp .4s ease forwards}
        .mw{position:relative}
        .mt{position:absolute;left:0;right:0;font-family:Impact,'Arial Black',sans-serif;font-weight:900;text-transform:uppercase;color:#fff;text-align:center;padding:6px 10px;line-height:1.1;word-break:break-word;-webkit-text-stroke:2px black;text-shadow:2px 2px 0 #000,-2px -2px 0 #000,2px -2px 0 #000,-2px 2px 0 #000}
        .mt-top{top:6px}.mt-bot{bottom:6px}
        .tc{background:#151515;border:1px solid #222;border-radius:12px;cursor:pointer;transition:all .2s;overflow:hidden}
        .tc:hover{border-color:#FFD100;transform:translateY(-2px);box-shadow:0 8px 24px rgba(255,209,0,.15)}
        .card{background:#151515;border:1px solid #222;border-radius:12px}
        .btn-y{background:#FFD100;color:#000;font-weight:800;border:none;cursor:pointer;border-radius:10px;transition:all .15s;font-family:inherit}
        .btn-y:hover{background:#FFE84D;transform:translateY(-1px)}
        .btn-y:disabled{opacity:.3;cursor:not-allowed;transform:none}
        .btn-g{background:transparent;color:#888;border:1px solid #2A2A2A;cursor:pointer;border-radius:8px;transition:all .15s;font-family:inherit}
        .btn-g:hover{border-color:#FF2D78;color:#FF2D78}
        .btn-dl{background:#4ADE80;color:#000;font-weight:800;border:none;cursor:pointer;border-radius:10px;transition:all .15s;font-family:inherit;animation:dlpulse 2s infinite}
        .btn-dl:hover{background:#22c55e;transform:translateY(-1px)}
        .btn-dl:disabled{opacity:.5;cursor:not-allowed;animation:none}
        .btn-upload{background:linear-gradient(135deg,#7C3AED,#A855F7);color:#fff;font-weight:800;border:none;cursor:pointer;border-radius:10px;transition:all .15s;font-family:inherit;animation:uploadglow 2s infinite}
        .btn-upload:hover{background:linear-gradient(135deg,#6D28D9,#9333EA);transform:translateY(-1px)}
        .upload-zone{border:2px dashed #3A2A5A;border-radius:14px;background:rgba(124,58,237,.05);transition:all .2s;cursor:pointer}
        .upload-zone:hover{border-color:#A855F7;background:rgba(124,58,237,.1)}
        input,textarea{background:#151515;border:1px solid #2A2A2A;color:#fff;border-radius:8px;outline:none;font-family:inherit;width:100%}
        input:focus,textarea:focus{border-color:#FFD100}
        input::placeholder,textarea::placeholder{color:#444}
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:#0A0A0A}::-webkit-scrollbar-thumb{background:#2A2A2A;border-radius:3px}
        .hp{background:#0A0A0A;border:1px solid #2A2A2A;border-radius:20px;padding:3px 10px;font-size:12px;color:#FF2D78;cursor:pointer;transition:all .15s;display:inline-block}
        .hp:hover{border-color:#FF2D78;background:#1A0A10}
        .ic{background:#111;border-left:3px solid #FFD100;border-radius:0 8px 8px 0;padding:14px 16px}
      `}</style>

      {/* HEADER */}
      <div style={{padding:"14px 24px",borderBottom:"1px solid #1A1A1A",display:"flex",alignItems:"center",gap:12,position:"sticky",top:0,background:"#0A0A0A",zIndex:100}}>
        <span style={{fontSize:22}}>🔥</span>
        <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:26,letterSpacing:3,color:"#FFD100"}}>MEMECRAFT AI</span>
        <span style={{fontSize:11,color:status==="online"?"#4ADE80":status==="offline"?"#FF2D78":"#666",display:"flex",alignItems:"center",gap:4}}>
          <span style={{width:7,height:7,borderRadius:"50%",background:status==="online"?"#4ADE80":status==="offline"?"#FF2D78":"#666",display:"inline-block"}}/>
          {status==="online"?"Backend live":status==="offline"?"Backend offline":"Connecting..."}
        </span>
        {stage!=="input" && <button className="btn-g" style={{marginLeft:"auto",padding:"8px 16px",fontSize:13}} onClick={reset}>+ New Meme</button>}
        {stage==="input" && <span style={{marginLeft:"auto",fontSize:11,color:"#333",letterSpacing:1}}>🌐 PROD</span>}
      </div>

      {/* ══ INPUT ══ */}
      {stage==="input" && (
        <div style={{maxWidth:680,margin:"0 auto",padding:"40px 24px 80px"}} className="fade-up">
          <div style={{textAlign:"center",marginBottom:40}}>
            <h1 style={{fontFamily:"'Bebas Neue',cursive",fontSize:"clamp(48px,9vw,80px)",margin:0,letterSpacing:4,lineHeight:.95}}>
              GENERATE VIRAL<br/>
              <span style={{color:"#FFD100",WebkitTextStroke:"2px #FFD100",WebkitTextFillColor:"transparent"}}>MEMES</span> IN SECONDS
            </h1>
            <p style={{color:"#555",marginTop:18,fontSize:15}}>Groq AI · 14 Languages · Instagram-ready · 100+ Templates</p>
          </div>

          {/* ── UPLOAD ZONE ── */}
          <div className="upload-zone" style={{padding:"24px",marginBottom:16,textAlign:"center"}}
            onClick={()=>fileInputRef.current?.click()}
            onDragOver={e=>{e.preventDefault()}}
            onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f){const fake={target:{files:[f]}};handleFileUpload(fake);}}}>
            <input ref={fileInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleFileUpload}/>
            <div style={{fontSize:36,marginBottom:8}}>🖼️</div>
            <div style={{fontWeight:700,fontSize:15,color:"#A855F7",marginBottom:4}}>Upload Your Own Photo</div>
            <div style={{fontSize:12,color:"#555"}}>Tap to upload · JPG, PNG, WEBP · Turn any photo into a meme</div>
          </div>

          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16}}>
            <div style={{flex:1,height:1,background:"#1E1E1E"}}/>
            <span style={{fontSize:12,color:"#444"}}>OR USE A TEMPLATE</span>
            <div style={{flex:1,height:1,background:"#1E1E1E"}}/>
          </div>

          <div style={{position:"relative",marginBottom:16}}>
            <textarea value={prompt} onChange={e=>setPrompt(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter"&&e.ctrlKey)generate()}}
              placeholder={"Describe your meme idea...\n\n\"Monday mornings hitting different\"\n\"When code works but you don't know why\"\n\"Waiting for salary vs spending it\""}
              style={{padding:"20px",fontSize:15,minHeight:130,resize:"vertical",lineHeight:1.6}}/>
            <span style={{position:"absolute",bottom:12,right:14,fontSize:11,color:"#444"}}>Ctrl+Enter</span>
          </div>

          <div style={{marginBottom:24}}>
            <p style={{color:"#444",fontSize:11,letterSpacing:2,marginBottom:12,textTransform:"uppercase"}}>🌍 Language</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:7}}>
              {LANGUAGES.map(l=>(
                <button key={l.code} onClick={()=>setLanguage(l.code)}
                  style={{border:`1px solid ${language===l.code?"#FFD100":"#222"}`,background:language===l.code?"rgba(255,209,0,.08)":"#111",color:language===l.code?"#FFD100":"#666",fontWeight:language===l.code?700:400,borderRadius:8,cursor:"pointer",fontSize:13,padding:"7px 13px",fontFamily:"inherit",transition:"all .15s"}}>
                  {l.flag} {l.name}
                </button>
              ))}
            </div>
          </div>

          <button className="btn-y" disabled={!prompt.trim()} onClick={generate}
            style={{width:"100%",padding:"18px",fontSize:17,borderRadius:12,letterSpacing:1,animation:prompt.trim()?"glow 2s infinite":"none"}}>
            ⚡ GENERATE MEME
          </button>

          {status==="offline" && (
            <div style={{marginTop:16,background:"rgba(255,45,120,.08)",border:"1px solid rgba(255,45,120,.2)",borderRadius:10,padding:"12px 16px",fontSize:13,color:"#FF2D78"}}>
              ⚠️ Backend offline — run <code style={{background:"#1A0A10",padding:"2px 6px",borderRadius:4}}>python main.py</code> in Termux
            </div>
          )}
        </div>
      )}

      {/* ══ LOADING ══ */}
      {stage==="loading" && (
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"75vh",gap:28}}>
          <div style={{fontSize:72,animation:"spin 1.2s linear infinite"}}>⚙️</div>
          <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:34,letterSpacing:3,color:"#FFD100"}}>{loadingMsg}</div>
          <div style={{display:"flex",gap:6}}>
            {[0,1,2,3,4].map(i=>(
              <div key={i} style={{width:8,height:8,borderRadius:"50%",background:i%2===0?"#FFD100":"#FF2D78",animation:`pulse 1s ${i*.15}s infinite`}}/>
            ))}
          </div>
          <p style={{color:"#444",fontSize:13}}>Calling Groq AI + fetching templates...</p>
        </div>
      )}

      {/* ══ RESULTS ══ */}
      {stage==="results" && (
        <div style={{maxWidth:1020,margin:"0 auto",padding:"40px 24px"}} className="fade-up">
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:32,flexWrap:"wrap",gap:12,alignItems:"flex-start"}}>
            <div>
              <h2 style={{fontFamily:"'Bebas Neue',cursive",fontSize:"clamp(28px,5vw,44px)",margin:0,letterSpacing:2}}>
                AI PICKED <span style={{color:"#FFD100"}}>4 TEMPLATES</span>
              </h2>
              <p style={{color:"#555",margin:"8px 0 0",fontSize:14}}>👆 Click any to customize + download</p>
            </div>
            <button className="btn-g" onClick={()=>setStage("input")} style={{padding:"10px 20px",fontSize:13}}>← Change Prompt</button>
          </div>

          <div style={{background:"#111",border:"1px solid #1E1E1E",borderRadius:10,padding:"12px 18px",marginBottom:28,display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
            <span style={{fontSize:14,color:"#555"}}>Prompt:</span>
            <span style={{fontSize:14,color:"#aaa",fontStyle:"italic"}}>"{prompt}"</span>
            <span style={{marginLeft:"auto",fontSize:12,color:"#FF2D78",background:"rgba(255,45,120,.1)",border:"1px solid rgba(255,45,120,.2)",borderRadius:20,padding:"2px 10px"}}>
              {LANGUAGES.find(l=>l.code===language)?.flag} {langName}
            </span>
          </div>

          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:16,marginBottom:32}}>
            {suggested.map((t,i)=>(
              <div key={t.id} className="tc" onClick={()=>{setSelected(t);setUploadMode(false);setStage("edit")}}>
                <div className="mw" style={{background:"#000"}}>
                  <img src={t.url} alt={t.name} style={{width:"100%",display:"block",maxHeight:260,objectFit:"cover"}}/>
                  {topText    && <div className="mt mt-top" style={{fontSize:"clamp(13px,2.5vw,22px)"}}>{topText}</div>}
                  {bottomText && <div className="mt mt-bot" style={{fontSize:"clamp(13px,2.5vw,22px)"}}>{bottomText}</div>}
                  <div style={{position:"absolute",top:8,left:8,background:"#FFD100",color:"#000",padding:"2px 8px",borderRadius:4,fontSize:10,fontWeight:800,letterSpacing:1}}>AI #{i+1}</div>
                </div>
                <div style={{padding:"12px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontWeight:600,fontSize:13,color:"#ccc"}}>{t.name}</span>
                  <span style={{color:"#FFD100",fontSize:13,fontWeight:700}}>Tap to Edit →</span>
                </div>
              </div>
            ))}
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
            <div className="card" style={{padding:20}}>
              <p style={{color:"#444",fontSize:11,letterSpacing:2,margin:"0 0 12px",textTransform:"uppercase"}}>📝 Caption</p>
              <p style={{margin:0,lineHeight:1.7,fontSize:14,color:"#ccc"}}>{caption}</p>
            </div>
            <div className="card" style={{padding:20}}>
              <p style={{color:"#444",fontSize:11,letterSpacing:2,margin:"0 0 12px",textTransform:"uppercase"}}>#️⃣ Hashtags</p>
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {hashtags.map(h=><span key={h} className="hp">#{h}</span>)}
              </div>
            </div>
          </div>

          <div className="card" style={{padding:24}}>
            <p style={{color:"#FFD100",fontSize:11,letterSpacing:2,margin:"0 0 18px",fontWeight:800,textTransform:"uppercase"}}>💡 Viral Tips</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12}}>
              {improvements.map((imp,i)=>(
                <div key={i} className="ic">
                  <div style={{fontSize:11,color:"#FFD100",fontWeight:800,marginBottom:6,letterSpacing:1}}>TIP {String(i+1).padStart(2,"0")}</div>
                  <div style={{fontSize:13,color:"#999",lineHeight:1.5}}>{imp}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══ EDIT ══ */}
      {stage==="edit" && (selected || uploadedImg) && (
        <div style={{maxWidth:1100,margin:"0 auto",padding:"40px 24px 60px"}} className="fade-up">
          <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:32,flexWrap:"wrap"}}>
            <button className="btn-g" onClick={()=>uploadMode?clearUpload():setStage("results")} style={{padding:"10px 18px",fontSize:13}}>← Back</button>
            <h2 style={{fontFamily:"'Bebas Neue',cursive",fontSize:"clamp(24px,4vw,38px)",margin:0,letterSpacing:2}}>
              {uploadMode
                ? <><span style={{color:"#A855F7"}}>YOUR PHOTO</span> AS MEME</>
                : <>CUSTOMIZE <span style={{color:"#FFD100"}}>YOUR MEME</span></>}
            </h2>
            {uploadMode && (
              <span style={{fontSize:11,background:"rgba(168,85,247,.15)",border:"1px solid rgba(168,85,247,.3)",color:"#A855F7",borderRadius:20,padding:"3px 12px"}}>
                📸 Custom Upload
              </span>
            )}
          </div>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:32}}>
            {/* LEFT */}
            <div>
              <div className="mw" style={{borderRadius:12,overflow:"hidden",background:"#000",boxShadow:"0 20px 60px rgba(0,0,0,.6)"}}>
                <img src={currentImgSrc} alt="meme" style={{width:"100%",display:"block"}}/>
                {topText    && <div className="mt mt-top" style={{fontSize:"clamp(15px,3.5vw,30px)"}}>{topText}</div>}
                {bottomText && <div className="mt mt-bot" style={{fontSize:"clamp(15px,3.5vw,30px)"}}>{bottomText}</div>}
              </div>

              {/* DOWNLOAD BUTTON */}
              <button className="btn-dl" onClick={downloadMeme} disabled={downloading}
                style={{width:"100%",padding:"14px",marginTop:14,fontSize:16,borderRadius:12,letterSpacing:1}}>
                {downloading?"⏳ Generating PNG...":"⬇️ DOWNLOAD MEME (PNG)"}
              </button>
              <p style={{fontSize:11,color:"#444",textAlign:"center",marginTop:8}}>
                High-quality PNG · No watermark · Free
              </p>

              <div style={{display:"flex",flexDirection:"column",gap:12,marginTop:16}}>
                <div>
                  <label style={{fontSize:11,color:"#555",letterSpacing:2,textTransform:"uppercase"}}>Top Text</label>
                  <input value={topText} onChange={e=>setTopText(e.target.value)} placeholder="Top text..." style={{padding:"10px 14px",marginTop:6,fontSize:14}}/>
                </div>
                <div>
                  <label style={{fontSize:11,color:"#555",letterSpacing:2,textTransform:"uppercase"}}>Bottom Text</label>
                  <input value={bottomText} onChange={e=>setBottom(e.target.value)} placeholder="Bottom text..." style={{padding:"10px 14px",marginTop:6,fontSize:14}}/>
                </div>

                {/* Upload mode: swap photo OR template mode: swap template */}
                {uploadMode ? (
                  <div>
                    <label style={{fontSize:11,color:"#555",letterSpacing:2,textTransform:"uppercase"}}>Swap Photo</label>
                    <button className="btn-upload" style={{width:"100%",padding:"10px",marginTop:8,fontSize:13,borderRadius:8}}
                      onClick={()=>fileInputRef.current?.click()}>
                      📁 Choose Different Photo
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleFileUpload}/>
                  </div>
                ) : (
                  <div>
                    <label style={{fontSize:11,color:"#555",letterSpacing:2,textTransform:"uppercase"}}>Swap Template</label>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:8}}>
                      {suggested.filter(t=>t.id!==selected?.id).map(t=>(
                        <button key={t.id} className="btn-g" onClick={()=>setSelected(t)} style={{padding:"8px 10px",fontSize:12,display:"flex",alignItems:"center",gap:8}}>
                          <img src={t.url} alt="" style={{width:28,height:28,objectFit:"cover",borderRadius:4}}/>
                          {t.name.length>16?t.name.slice(0,16)+"…":t.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT */}
            <div style={{display:"flex",flexDirection:"column",gap:20}}>
              {/* IG Mockup */}
              <div style={{background:"#fff",borderRadius:14,overflow:"hidden",maxWidth:360,margin:"0 auto",boxShadow:"0 20px 60px rgba(0,0,0,.5)"}}>
                <div style={{padding:"12px 16px",display:"flex",alignItems:"center",gap:10,borderBottom:"1px solid #f0f0f0"}}>
                  <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:14,fontWeight:800,flexShrink:0}}>M</div>
                  <div>
                    <div style={{fontWeight:700,fontSize:13,color:"#111"}}>memecraft_ai</div>
                    <div style={{fontSize:11,color:"#999"}}>Just now</div>
                  </div>
                  <span style={{marginLeft:"auto",fontSize:20,color:"#111"}}>···</span>
                </div>
                <div className="mw">
                  <img src={currentImgSrc} alt="preview" style={{width:"100%",display:"block"}}/>
                  {topText    && <div className="mt mt-top" style={{fontSize:"clamp(12px,2.2vw,18px)"}}>{topText}</div>}
                  {bottomText && <div className="mt mt-bot" style={{fontSize:"clamp(12px,2.2vw,18px)"}}>{bottomText}</div>}
                </div>
                <div style={{padding:"10px 16px 14px"}}>
                  <div style={{display:"flex",gap:14,marginBottom:8}}>
                    <span style={{fontSize:22,cursor:"pointer"}}>🤍</span>
                    <span style={{fontSize:22,cursor:"pointer"}}>💬</span>
                    <span style={{fontSize:22,cursor:"pointer"}}>✈️</span>
                    <span style={{fontSize:22,marginLeft:"auto",cursor:"pointer"}}>🔖</span>
                  </div>
                  <div style={{fontSize:13,color:"#111",fontWeight:700}}>12,847 likes</div>
                  <div style={{fontSize:13,color:"#111",marginTop:4,lineHeight:1.55}}>
                    <span style={{fontWeight:700}}>memecraft_ai </span>
                    {caption || <span style={{color:"#bbb"}}>Caption will appear here...</span>}
                  </div>
                  <div style={{fontSize:12,color:"#0095f6",marginTop:6,lineHeight:1.9}}>
                    {hashtags.slice(0,6).map(h=>`#${h}`).join(" ")}
                  </div>
                  <div style={{fontSize:11,color:"#bbb",marginTop:8}}>View all 248 comments</div>
                </div>
              </div>

              {/* Caption editor */}
              <div className="card" style={{padding:20}}>
                {uploadMode && (
                  <div style={{marginBottom:14}}>
                    <label style={{fontSize:11,color:"#555",letterSpacing:2,textTransform:"uppercase"}}>📝 What's this meme about?</label>
                    <div style={{display:"flex",gap:8,marginTop:8}}>
                      <input value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="e.g. exam stress, salary day..." style={{padding:"9px 12px",fontSize:13,flex:1}}/>
                      <button className="btn-upload" disabled={genCapLoading} onClick={generateCaptionForUpload} style={{padding:"9px 14px",fontSize:12,borderRadius:8,flexShrink:0}}>
                        {genCapLoading?"⏳":"✨ AI Caption"}
                      </button>
                    </div>
                  </div>
                )}

                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <label style={{fontSize:11,color:"#555",letterSpacing:2,textTransform:"uppercase"}}>📝 Caption</label>
                  {!uploadMode && <button className="btn-g" onClick={regenCaption} style={{padding:"5px 12px",fontSize:11}}>🔄 Regenerate</button>}
                </div>
                <textarea value={caption} onChange={e=>setCaption(e.target.value)}
                  placeholder="Write or generate a caption..."
                  style={{padding:"10px 14px",fontSize:13,minHeight:80,resize:"vertical",lineHeight:1.6}}/>

                <div style={{marginTop:16}}>
                  <label style={{fontSize:11,color:"#555",letterSpacing:2,textTransform:"uppercase"}}>#️⃣ Hashtags <span style={{color:"#333"}}>(tap to remove)</span></label>
                  <div style={{display:"flex",flexWrap:"wrap",gap:6,marginTop:10}}>
                    {hashtags.map((h,i)=>(
                      <span key={i} className="hp" onClick={()=>setHashtags(hashtags.filter((_,j)=>j!==i))}>
                        #{h} <span style={{opacity:.5}}>×</span>
                      </span>
                    ))}
                  </div>
                  <div style={{display:"flex",gap:8,marginTop:10}}>
                    <input value={newTag} onChange={e=>setNewTag(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTag()} placeholder="Add hashtag..." style={{padding:"8px 12px",fontSize:13,flex:1}}/>
                    <button className="btn-g" onClick={addTag} style={{padding:"8px 14px",fontSize:13,flexShrink:0}}>+ Add</button>
                  </div>
                </div>

                <button className="btn-y" onClick={copyAll} style={{width:"100%",padding:"13px",marginTop:16,fontSize:15,borderRadius:10}}>
                  {copied?"✅ Copied!":"📋 Copy Caption + Hashtags"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
