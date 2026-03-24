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

// ── TRENDING PROMPTS (Indian + Global, categorized)
const TRENDING = [
  {
    category: "🔥 Desi Trending",
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
    category: "😂 College Life",
    color: "#FFD100",
    prompts: [
      { emoji: "📖", text: "Studying night before exam" },
      { emoji: "🎯", text: "Attendance shortage panic" },
      { emoji: "😎", text: "First bench vs last bench students" },
      { emoji: "🍕", text: "Canteen food is life" },
      { emoji: "📝", text: "Assignment deadline at midnight" },
      { emoji: "🏃", text: "Running to catch college bus" },
      { emoji: "💤", text: "8am class struggle is real" },
      { emoji: "🎉", text: "Last day of semester" },
    ],
  },
  {
    category: "💼 Work Life",
    color: "#4ADE80",
    prompts: [
      { emoji: "🖥️", text: "WFH vs office life" },
      { emoji: "📧", text: "Boss sends email on Friday 5pm" },
      { emoji: "☕", text: "Before coffee vs after coffee" },
      { emoji: "🤡", text: "Meeting that could have been email" },
      { emoji: "💰", text: "Fresher salary expectations vs reality" },
      { emoji: "😤", text: "Client says small change needed" },
      { emoji: "🕐", text: "Office timing vs actual work" },
      { emoji: "📊", text: "Appraisal season struggle" },
    ],
  },
  {
    category: "🌍 Global Vibes",
    color: "#A855F7",
    prompts: [
      { emoji: "🤖", text: "AI taking over jobs" },
      { emoji: "📉", text: "Crypto going down again" },
      { emoji: "😅", text: "When the code finally works" },
      { emoji: "🎮", text: "Gamers vs sleep schedule" },
      { emoji: "💔", text: "Valentine's day alone" },
      { emoji: "🌙", text: "Night owl vs early bird" },
      { emoji: "📺", text: "Netflix one more episode at 3am" },
      { emoji: "🛒", text: "Online shopping vs actual need" },
    ],
  },
];

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return isMobile;
}

export default function MemeGenerator() {
  const isMobile = useIsMobile();

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
  const [uploadedImg, setUploadedImg]   = useState(null);
  const [uploadMode, setUploadMode]     = useState(false);
  const [genCapLoading, setGenCapLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const fileInputRef = useRef(null);

  const langName = LANGUAGES.find(l => l.code === language)?.name || "English";
  const currentImgSrc = uploadMode ? uploadedImg : selected?.url;

  useEffect(() => {
    fetch(`${API}/api/templates`)
      .then(r => r.json())
      .then(d => { if (d.templates?.length) setAll(d.templates); setStatus("online"); })
      .catch(() => setStatus("offline"));
  }, []);

  // ── DOWNLOAD (blob-based working version)
  const downloadMeme = async () => {
    if (!currentImgSrc) return;
    setDownloading(true);
    try {
      let blobUrl;
      if (uploadedImg && uploadMode) {
        blobUrl = uploadedImg;
      } else {
        const res = await fetch(`${API}/api/proxy-image?url=${encodeURIComponent(selected.url)}`);
        const blob = await res.blob();
        blobUrl = URL.createObjectURL(blob);
      }
      const img = new Image();
      await new Promise((res, rej) => { img.onload=res; img.onerror=rej; img.src=blobUrl; });

      const canvas = document.createElement("canvas");
      canvas.width=img.width; canvas.height=img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      const fs = Math.max(28, Math.floor(img.width / 12));
      ctx.font=`900 ${fs}px Impact,Arial Black,sans-serif`;
      ctx.fillStyle="white"; ctx.strokeStyle="black";
      ctx.lineWidth=fs/8; ctx.textAlign="center"; ctx.lineJoin="round";

      const draw=(t,x,y)=>{ ctx.strokeText(t,x,y); ctx.fillText(t,x,y); };
      const wrap=(text,maxW)=>{
        const words=text.toUpperCase().split(" ");
        let lines=[],line="";
        for(let w of words){const test=line?`${line} ${w}`:w;if(ctx.measureText(test).width>maxW&&line){lines.push(line);line=w;}else line=test;}
        lines.push(line);return lines;
      };
      const cx=canvas.width/2,maxW=canvas.width-40;
      if(topText){const l=wrap(topText,maxW);l.forEach((t,i)=>draw(t,cx,fs*1.1+i*(fs+6)));}
      if(bottomText){const l=wrap(bottomText,maxW);const sy=canvas.height-(l.length*(fs+6))-10;l.forEach((t,i)=>draw(t,cx,sy+i*(fs+6)));}
      if(!uploadMode)URL.revokeObjectURL(blobUrl);

      const a=document.createElement("a");
      a.download=`memecraft-${Date.now()}.png`;a.href=canvas.toDataURL("image/png");a.click();
    } catch { alert("Download failed. Long press image → Save 📱"); }
    setDownloading(false);
  };

  // ── UPLOAD
  const handleFileUpload=(e)=>{
    const file=e.target.files[0];
    if(!file||!file.type.startsWith("image/"))return;
    const reader=new FileReader();
    reader.onload=(ev)=>{
      setUploadedImg(ev.target.result);setUploadMode(true);
      setSelected(null);setTopText("");setBottom("");setCaption("");setHashtags([]);setStage("edit");
    };
    reader.readAsDataURL(file);
  };

  const generateCaptionForUpload=async()=>{
    if(!prompt.trim()){alert("Add a prompt first!");return;}
    setGenCapLoading(true);
    try{
      const r=await fetch(`${API}/api/regenerate-caption`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt,language:langName})});
      const d=await r.json();
      if(d.caption)setCaption(d.caption);if(d.hashtags)setHashtags(d.hashtags);
    }catch{setCaption(`${prompt} 😂`);setHashtags(["memes","funny","viral"]);}
    setGenCapLoading(false);
  };

  const clearUpload=()=>{
    setUploadedImg(null);setUploadMode(false);setStage("input");
    setTopText("");setBottom("");setCaption("");setHashtags([]);
    if(fileInputRef.current)fileInputRef.current.value="";
  };

  // ── GENERATE
  const generate=async(customPrompt)=>{
    const p = customPrompt || prompt;
    if(!p.trim())return;
    if(customPrompt) setPrompt(customPrompt);
    setUploadMode(false);setUploadedImg(null);setStage("loading");
    let i=0;setLoadingMsg(LOADING_MSGS[0]);
    const iv=setInterval(()=>{i=(i+1)%LOADING_MSGS.length;setLoadingMsg(LOADING_MSGS[i]);},1400);
    try{
      const res=await fetch(`${API}/api/generate-meme`,{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({prompt:p,language:langName,templates:allTemplates.slice(0,100).map(t=>({id:t.id,name:t.name}))}),
      });
      clearInterval(iv);
      const d=await res.json();
      let picks=(d.selectedTemplateIds||[]).map(id=>allTemplates.find(t=>t.id===id)).filter(Boolean).slice(0,4);
      if(picks.length<4)picks=[...picks,...allTemplates.filter(t=>!picks.find(p=>p.id===t.id))].slice(0,4);
      setSuggested(picks);setTopText(d.topText||"");setBottom(d.bottomText||"");
      setCaption(d.instagramCaption||"");setHashtags(d.hashtags||[]);setImprovements(d.improvements||[]);
      setStage("results");
    }catch{
      clearInterval(iv);
      setSuggested(allTemplates.slice(0,4));setTopText("When you finally");setBottom("Get the joke 😂");
      setCaption(`${p} 😭✨`);
      setHashtags(["memes","funny","viral","relatable","lol","trending","memesdaily","humor","comedy","funnymemes"]);
      setImprovements(["Check backend","Check GROQ_API_KEY","Try specific prompt","Restart python main.py"]);
      setStage("results");
    }
  };

  const regenCaption=async()=>{
    try{
      const r=await fetch(`${API}/api/regenerate-caption`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt,language:langName})});
      const d=await r.json();
      if(d.caption)setCaption(d.caption);if(d.hashtags)setHashtags(d.hashtags);
    }catch{}
  };

  const copyAll=()=>{
    navigator.clipboard.writeText(`${caption}\n\n${hashtags.map(h=>`#${h}`).join(" ")}`).catch(()=>{});
    setCopied(true);setTimeout(()=>setCopied(false),2500);
  };

  const addTag=()=>{
    const t=newTag.replace(/^#/,"").trim();
    if(t&&!hashtags.includes(t))setHashtags([...hashtags,t]);
    setNewTag("");
  };

  const reset=()=>{setStage("input");setPrompt("");setSuggested([]);setSelected(null);setUploadedImg(null);setUploadMode(false);};

  return (
    <div style={{fontFamily:"'Inter',system-ui,sans-serif",background:"#0A0A0A",minHeight:"100vh",color:"#fff"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;500;600;700;900&display=swap');
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes glow{0%,100%{box-shadow:0 0 20px rgba(255,209,0,.2)}50%{box-shadow:0 0 40px rgba(255,209,0,.5)}}
        @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
        @keyframes dlpulse{0%,100%{box-shadow:0 0 0 rgba(74,222,128,0)}50%{box-shadow:0 0 20px rgba(74,222,128,.4)}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        .fade-up{animation:fadeUp .35s ease forwards}
        .mw{position:relative;line-height:0}
        .mt{position:absolute;left:0;right:0;font-family:Impact,'Arial Black',sans-serif;font-weight:900;text-transform:uppercase;color:#fff;text-align:center;padding:5px 8px;line-height:1.15;word-break:break-word;-webkit-text-stroke:2px black;text-shadow:2px 2px 0 #000,-2px -2px 0 #000,2px -2px 0 #000,-2px 2px 0 #000}
        .mt-top{top:5px}.mt-bot{bottom:5px}
        .tc{background:#151515;border:1px solid #222;border-radius:12px;cursor:pointer;transition:all .2s;overflow:hidden}
        .tc:active{transform:scale(.97);border-color:#FFD100}
        .card{background:#151515;border:1px solid #222;border-radius:12px}
        .btn-y{background:#FFD100;color:#000;font-weight:800;border:none;cursor:pointer;border-radius:12px;transition:all .15s;font-family:inherit}
        .btn-y:active{transform:scale(.97)}
        .btn-y:disabled{opacity:.3;cursor:not-allowed}
        .btn-g{background:transparent;color:#777;border:1px solid #2A2A2A;cursor:pointer;border-radius:8px;transition:all .15s;font-family:inherit}
        .btn-g:active{border-color:#FF2D78;color:#FF2D78}
        .btn-dl{background:#4ADE80;color:#000;font-weight:800;border:none;cursor:pointer;border-radius:12px;transition:all .15s;font-family:inherit;animation:dlpulse 2s infinite}
        .btn-dl:active{transform:scale(.97)}
        .btn-dl:disabled{opacity:.5;cursor:not-allowed;animation:none}
        .btn-upload{background:linear-gradient(135deg,#7C3AED,#A855F7);color:#fff;font-weight:800;border:none;cursor:pointer;border-radius:12px;transition:all .15s;font-family:inherit}
        .btn-upload:active{transform:scale(.97)}
        .upload-zone{border:2px dashed #3A2A5A;border-radius:14px;background:rgba(124,58,237,.05);cursor:pointer;transition:all .2s}
        .upload-zone:active{background:rgba(124,58,237,.12)}
        .prompt-chip{border:none;cursor:pointer;border-radius:20px;font-family:inherit;font-weight:600;transition:all .15s;white-space:nowrap;display:inline-flex;align-items:center;gap:5px}
        .prompt-chip:active{transform:scale(.93)}
        .cat-btn{border:none;cursor:pointer;border-radius:20px;font-family:inherit;font-weight:700;transition:all .15s;font-size:12px;padding:7px 14px;white-space:nowrap}
        .cat-btn:active{transform:scale(.95)}
        .chips-scroll{display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;-webkit-overflow-scrolling:touch}
        .chips-scroll::-webkit-scrollbar{display:none}
        input,textarea{background:#1A1A1A;border:1px solid #2A2A2A;color:#fff;border-radius:10px;outline:none;font-family:inherit;width:100%;font-size:16px}
        input:focus,textarea:focus{border-color:#FFD100}
        input::placeholder,textarea::placeholder{color:#444}
        .hp{background:#111;border:1px solid #2A2A2A;border-radius:20px;padding:5px 12px;font-size:13px;color:#FF2D78;cursor:pointer;display:inline-block;margin:3px}
        .hp:active{background:#1A0A10}
        .ic{background:#111;border-left:3px solid #FFD100;border-radius:0 8px 8px 0;padding:14px 16px}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:#0A0A0A}::-webkit-scrollbar-thumb{background:#2A2A2A;border-radius:3px}
        @media(max-width:767px){
          .edit-grid{display:flex!important;flex-direction:column!important;gap:20px!important}
          .results-grid{grid-template-columns:1fr!important}
          .caption-hashtag-grid{grid-template-columns:1fr!important}
          .tips-grid{grid-template-columns:1fr!important}
          .ig-wrap{max-width:100%!important}
        }
        @media(min-width:768px){
          .tc:hover{border-color:#FFD100;transform:translateY(-2px);box-shadow:0 8px 24px rgba(255,209,0,.15)}
          .btn-y:hover{background:#FFE84D;transform:translateY(-1px)}
          .btn-dl:hover{background:#22c55e;transform:translateY(-1px)}
          .prompt-chip:hover{transform:translateY(-2px)}
        }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{padding:isMobile?"12px 16px":"14px 24px",borderBottom:"1px solid #1A1A1A",display:"flex",alignItems:"center",gap:10,position:"sticky",top:0,background:"#0A0A0A",zIndex:100}}>
        <span style={{fontSize:isMobile?18:22}}>🔥</span>
        <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:isMobile?20:26,letterSpacing:isMobile?2:3,color:"#FFD100"}}>MEMECRAFT AI</span>
        <span style={{fontSize:10,color:status==="online"?"#4ADE80":status==="offline"?"#FF2D78":"#666",display:"flex",alignItems:"center",gap:3,flexShrink:0}}>
          <span style={{width:6,height:6,borderRadius:"50%",background:status==="online"?"#4ADE80":status==="offline"?"#FF2D78":"#666",display:"inline-block",flexShrink:0}}/>
          {isMobile?(status==="online"?"Live":status==="offline"?"Offline":"..."):(status==="online"?"Backend live":"Connecting...")}
        </span>
        {stage!=="input"&&<button className="btn-g" style={{marginLeft:"auto",padding:isMobile?"7px 12px":"8px 16px",fontSize:12,flexShrink:0}} onClick={reset}>{isMobile?"+ New":"+ New Meme"}</button>}
      </div>

      {/* ══ INPUT ══ */}
      {stage==="input"&&(
        <div style={{maxWidth:640,margin:"0 auto",padding:isMobile?"20px 14px 60px":"40px 24px 80px"}} className="fade-up">

          {/* HERO */}
          <div style={{textAlign:"center",marginBottom:isMobile?24:36}}>
            <h1 style={{fontFamily:"'Bebas Neue',cursive",fontSize:isMobile?"clamp(42px,12vw,58px)":"clamp(48px,9vw,80px)",margin:0,letterSpacing:isMobile?2:4,lineHeight:.95}}>
              GENERATE VIRAL<br/>
              <span style={{color:"#FFD100",WebkitTextStroke:"2px #FFD100",WebkitTextFillColor:"transparent"}}>MEMES</span> IN SECONDS
            </h1>
            <p style={{color:"#555",marginTop:12,fontSize:isMobile?12:14,lineHeight:1.5}}>Groq AI · 14 Languages · Instagram-ready · 100+ Templates</p>
          </div>

          {/* ── TRENDING PROMPTS ── */}
          <div style={{marginBottom:20}}>
            {/* Section header */}
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
              <span style={{fontSize:14}}>🔥</span>
              <span style={{fontFamily:"'Bebas Neue',cursive",fontSize:18,letterSpacing:2,color:"#fff"}}>TRENDING NOW</span>
              <span style={{fontSize:10,background:"rgba(255,107,53,.15)",border:"1px solid rgba(255,107,53,.3)",color:"#FF6B35",borderRadius:20,padding:"2px 8px",marginLeft:4}}>INDIA 🇮🇳</span>
            </div>

            {/* Category tabs */}
            <div className="chips-scroll" style={{marginBottom:10}}>
              {TRENDING.map((cat,i)=>(
                <button key={i} className="cat-btn" onClick={()=>setActiveCategory(i)}
                  style={{background:activeCategory===i?cat.color:"#151515",color:activeCategory===i?"#000":"#666",border:`1px solid ${activeCategory===i?cat.color:"#222"}`}}>
                  {cat.category}
                </button>
              ))}
            </div>

            {/* Prompt chips */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8}}>
              {TRENDING[activeCategory].prompts.map((p,i)=>(
                <button key={i} className="prompt-chip"
                  onClick={()=>{ setPrompt(p.text); generate(p.text); }}
                  style={{background:"#111",border:"1px solid #222",color:"#ccc",fontSize:isMobile?12:13,padding:isMobile?"9px 12px":"10px 14px",borderRadius:10,textAlign:"left",lineHeight:1.3}}>
                  <span style={{fontSize:16,flexShrink:0}}>{p.emoji}</span>
                  <span style={{overflow:"hidden",textOverflow:"ellipsis"}}>{p.text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* DIVIDER */}
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
            <div style={{flex:1,height:1,background:"#1E1E1E"}}/>
            <span style={{fontSize:11,color:"#333",letterSpacing:1}}>OR WRITE YOUR OWN</span>
            <div style={{flex:1,height:1,background:"#1E1E1E"}}/>
          </div>

          {/* UPLOAD ZONE */}
          <div className="upload-zone" style={{padding:isMobile?"16px":"20px",marginBottom:12,textAlign:"center"}}
            onClick={()=>fileInputRef.current?.click()}
            onDragOver={e=>e.preventDefault()}
            onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f)handleFileUpload({target:{files:[f]}});}}>
            <input ref={fileInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleFileUpload}/>
            <div style={{fontSize:28,marginBottom:4}}>🖼️</div>
            <div style={{fontWeight:700,fontSize:13,color:"#A855F7",marginBottom:2}}>Upload Your Own Photo</div>
            <div style={{fontSize:11,color:"#555"}}>Tap to upload · JPG, PNG, WEBP</div>
          </div>

          {/* PROMPT INPUT */}
          <div style={{position:"relative",marginBottom:14}}>
            <textarea value={prompt} onChange={e=>setPrompt(e.target.value)}
              onKeyDown={e=>{if(e.key==="Enter"&&e.ctrlKey)generate()}}
              placeholder={"Or describe your own meme idea...\n\"Monday mornings hitting different\""}
              style={{padding:"14px 16px",fontSize:15,minHeight:isMobile?100:130,resize:"none",lineHeight:1.6,borderRadius:12}}/>
          </div>

          {/* LANGUAGE */}
          <div style={{marginBottom:18}}>
            <p style={{color:"#444",fontSize:10,letterSpacing:2,marginBottom:10,textTransform:"uppercase"}}>🌍 Language</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {LANGUAGES.map(l=>(
                <button key={l.code} onClick={()=>setLanguage(l.code)}
                  style={{border:`1px solid ${language===l.code?"#FFD100":"#222"}`,background:language===l.code?"rgba(255,209,0,.08)":"#111",color:language===l.code?"#FFD100":"#666",fontWeight:language===l.code?700:400,borderRadius:8,cursor:"pointer",fontSize:isMobile?11:13,padding:isMobile?"5px 9px":"7px 13px",fontFamily:"inherit",transition:"all .15s"}}>
                  {l.flag} {l.name}
                </button>
              ))}
            </div>
          </div>

          <button className="btn-y" disabled={!prompt.trim()} onClick={()=>generate()}
            style={{width:"100%",padding:isMobile?"15px":"18px",fontSize:isMobile?15:17,letterSpacing:1,animation:prompt.trim()?"glow 2s infinite":"none"}}>
            ⚡ GENERATE MEME
          </button>

          {status==="offline"&&(
            <div style={{marginTop:12,background:"rgba(255,45,120,.08)",border:"1px solid rgba(255,45,120,.2)",borderRadius:10,padding:"11px 14px",fontSize:13,color:"#FF2D78"}}>
              ⚠️ Backend offline — run <code style={{background:"#1A0A10",padding:"2px 6px",borderRadius:4}}>python main.py</code>
            </div>
          )}
        </div>
      )}

      {/* ══ LOADING ══ */}
      {stage==="loading"&&(
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"75vh",gap:24,padding:"0 20px",textAlign:"center"}}>
          <div style={{fontSize:64,animation:"spin 1.2s linear infinite"}}>⚙️</div>
          <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:isMobile?26:34,letterSpacing:3,color:"#FFD100"}}>{loadingMsg}</div>
          <div style={{display:"flex",gap:6}}>
            {[0,1,2,3,4].map(i=>(
              <div key={i} style={{width:8,height:8,borderRadius:"50%",background:i%2===0?"#FFD100":"#FF2D78",animation:`pulse 1s ${i*.15}s infinite`}}/>
            ))}
          </div>
          <p style={{color:"#444",fontSize:13}}>Cooking your meme fresh 🍳</p>
        </div>
      )}

      {/* ══ RESULTS ══ */}
      {stage==="results"&&(
        <div style={{maxWidth:1020,margin:"0 auto",padding:isMobile?"16px 14px":"40px 24px"}} className="fade-up">
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:18,flexWrap:"wrap",gap:10,alignItems:"flex-start"}}>
            <div>
              <h2 style={{fontFamily:"'Bebas Neue',cursive",fontSize:isMobile?"clamp(22px,7vw,32px)":"clamp(28px,5vw,44px)",margin:0,letterSpacing:2}}>
                AI PICKED <span style={{color:"#FFD100"}}>4 TEMPLATES</span>
              </h2>
              <p style={{color:"#555",margin:"6px 0 0",fontSize:13}}>👆 Tap any to customize + download</p>
            </div>
            <button className="btn-g" onClick={()=>setStage("input")} style={{padding:"8px 14px",fontSize:12}}>← Change</button>
          </div>

          <div style={{background:"#111",border:"1px solid #1E1E1E",borderRadius:10,padding:"10px 14px",marginBottom:16,display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
            <span style={{fontSize:13,color:"#555"}}>Prompt:</span>
            <span style={{fontSize:13,color:"#aaa",fontStyle:"italic",flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>"{prompt}"</span>
            <span style={{fontSize:11,color:"#FF2D78",background:"rgba(255,45,120,.1)",border:"1px solid rgba(255,45,120,.2)",borderRadius:20,padding:"2px 10px",flexShrink:0}}>
              {LANGUAGES.find(l=>l.code===language)?.flag} {langName}
            </span>
          </div>

          <div className="results-grid" style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12,marginBottom:16}}>
            {suggested.map((t,i)=>(
              <div key={t.id} className="tc" onClick={()=>{setSelected(t);setUploadMode(false);setStage("edit")}}>
                <div className="mw" style={{background:"#000"}}>
                  <img src={t.url} alt={t.name} style={{width:"100%",display:"block",maxHeight:isMobile?160:260,objectFit:"cover"}}/>
                  {topText&&<div className="mt mt-top" style={{fontSize:"clamp(10px,3vw,20px)"}}>{topText}</div>}
                  {bottomText&&<div className="mt mt-bot" style={{fontSize:"clamp(10px,3vw,20px)"}}>{bottomText}</div>}
                  <div style={{position:"absolute",top:6,left:6,background:"#FFD100",color:"#000",padding:"2px 7px",borderRadius:4,fontSize:9,fontWeight:800,letterSpacing:1}}>AI #{i+1}</div>
                </div>
                <div style={{padding:"10px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontWeight:600,fontSize:isMobile?11:13,color:"#ccc",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{t.name}</span>
                  <span style={{color:"#FFD100",fontSize:11,fontWeight:700,flexShrink:0,marginLeft:6}}>Edit →</span>
                </div>
              </div>
            ))}
          </div>

          <div className="caption-hashtag-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            <div className="card" style={{padding:16}}>
              <p style={{color:"#444",fontSize:10,letterSpacing:2,margin:"0 0 10px",textTransform:"uppercase"}}>📝 Caption</p>
              <p style={{margin:0,lineHeight:1.7,fontSize:13,color:"#ccc"}}>{caption}</p>
            </div>
            <div className="card" style={{padding:16}}>
              <p style={{color:"#444",fontSize:10,letterSpacing:2,margin:"0 0 10px",textTransform:"uppercase"}}>#️⃣ Hashtags</p>
              <div>{hashtags.map(h=><span key={h} className="hp">#{h}</span>)}</div>
            </div>
          </div>

          <div className="card" style={{padding:isMobile?14:20}}>
            <p style={{color:"#FFD100",fontSize:10,letterSpacing:2,margin:"0 0 12px",fontWeight:800,textTransform:"uppercase"}}>💡 Viral Tips</p>
            <div className="tips-grid" style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:10}}>
              {improvements.map((imp,i)=>(
                <div key={i} className="ic">
                  <div style={{fontSize:10,color:"#FFD100",fontWeight:800,marginBottom:4,letterSpacing:1}}>TIP {String(i+1).padStart(2,"0")}</div>
                  <div style={{fontSize:12,color:"#999",lineHeight:1.5}}>{imp}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══ EDIT ══ */}
      {stage==="edit"&&(selected||uploadedImg)&&(
        <div style={{maxWidth:1100,margin:"0 auto",padding:isMobile?"14px 14px 60px":"40px 24px 60px"}} className="fade-up">
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:isMobile?18:26,flexWrap:"wrap"}}>
            <button className="btn-g" onClick={()=>uploadMode?clearUpload():setStage("results")} style={{padding:"9px 14px",fontSize:13}}>← Back</button>
            <h2 style={{fontFamily:"'Bebas Neue',cursive",fontSize:isMobile?"clamp(20px,6vw,28px)":"clamp(24px,4vw,38px)",margin:0,letterSpacing:2}}>
              {uploadMode?<><span style={{color:"#A855F7"}}>YOUR PHOTO</span> AS MEME</>:<>CUSTOMIZE <span style={{color:"#FFD100"}}>MEME</span></>}
            </h2>
            {uploadMode&&<span style={{fontSize:10,background:"rgba(168,85,247,.15)",border:"1px solid rgba(168,85,247,.3)",color:"#A855F7",borderRadius:20,padding:"3px 10px"}}>📸 Custom</span>}
          </div>

          <div className="edit-grid" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:28}}>
            {/* LEFT */}
            <div>
              <div className="mw" style={{borderRadius:12,overflow:"hidden",background:"#000",boxShadow:"0 16px 48px rgba(0,0,0,.6)"}}>
                <img src={currentImgSrc} alt="meme" style={{width:"100%",display:"block"}}/>
                {topText&&<div className="mt mt-top" style={{fontSize:"clamp(14px,4vw,30px)"}}>{topText}</div>}
                {bottomText&&<div className="mt mt-bot" style={{fontSize:"clamp(14px,4vw,30px)"}}>{bottomText}</div>}
              </div>

              <button className="btn-dl" onClick={downloadMeme} disabled={downloading}
                style={{width:"100%",padding:"14px",marginTop:12,fontSize:15,letterSpacing:1}}>
                {downloading?"⏳ Generating...":"⬇️ DOWNLOAD MEME (PNG)"}
              </button>
              <p style={{fontSize:11,color:"#444",textAlign:"center",marginTop:6}}>High-quality PNG · No watermark · Free</p>

              <div style={{display:"flex",flexDirection:"column",gap:12,marginTop:14}}>
                <div>
                  <label style={{fontSize:11,color:"#555",letterSpacing:2,textTransform:"uppercase"}}>Top Text</label>
                  <input value={topText} onChange={e=>setTopText(e.target.value)} placeholder="Top text..." style={{padding:"11px 14px",marginTop:6}}/>
                </div>
                <div>
                  <label style={{fontSize:11,color:"#555",letterSpacing:2,textTransform:"uppercase"}}>Bottom Text</label>
                  <input value={bottomText} onChange={e=>setBottom(e.target.value)} placeholder="Bottom text..." style={{padding:"11px 14px",marginTop:6}}/>
                </div>
                {uploadMode?(
                  <div>
                    <label style={{fontSize:11,color:"#555",letterSpacing:2,textTransform:"uppercase"}}>Swap Photo</label>
                    <button className="btn-upload" style={{width:"100%",padding:"11px",marginTop:6,fontSize:13}} onClick={()=>fileInputRef.current?.click()}>
                      📁 Choose Different Photo
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleFileUpload}/>
                  </div>
                ):(
                  <div>
                    <label style={{fontSize:11,color:"#555",letterSpacing:2,textTransform:"uppercase"}}>Swap Template</label>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:8}}>
                      {suggested.filter(t=>t.id!==selected?.id).map(t=>(
                        <button key={t.id} className="btn-g" onClick={()=>setSelected(t)} style={{padding:"8px 10px",fontSize:12,display:"flex",alignItems:"center",gap:7}}>
                          <img src={t.url} alt="" style={{width:26,height:26,objectFit:"cover",borderRadius:4,flexShrink:0}}/>
                          <span style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.name.length>14?t.name.slice(0,14)+"…":t.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT */}
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              <div className="ig-wrap" style={{background:"#fff",borderRadius:14,overflow:"hidden",maxWidth:360,margin:"0 auto",width:"100%",boxShadow:"0 16px 48px rgba(0,0,0,.5)"}}>
                <div style={{padding:"11px 14px",display:"flex",alignItems:"center",gap:10,borderBottom:"1px solid #f0f0f0"}}>
                  <div style={{width:34,height:34,borderRadius:"50%",background:"linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:13,fontWeight:800,flexShrink:0}}>M</div>
                  <div>
                    <div style={{fontWeight:700,fontSize:13,color:"#111"}}>memecraft_ai</div>
                    <div style={{fontSize:11,color:"#999"}}>Just now</div>
                  </div>
                  <span style={{marginLeft:"auto",fontSize:18,color:"#111"}}>···</span>
                </div>
                <div className="mw">
                  <img src={currentImgSrc} alt="ig preview" style={{width:"100%",display:"block"}}/>
                  {topText&&<div className="mt mt-top" style={{fontSize:"clamp(11px,2.5vw,18px)"}}>{topText}</div>}
                  {bottomText&&<div className="mt mt-bot" style={{fontSize:"clamp(11px,2.5vw,18px)"}}>{bottomText}</div>}
                </div>
                <div style={{padding:"10px 14px 14px"}}>
                  <div style={{display:"flex",gap:12,marginBottom:7}}>
                    {["🤍","💬","✈️"].map(e=><span key={e} style={{fontSize:20,cursor:"pointer"}}>{e}</span>)}
                    <span style={{fontSize:20,marginLeft:"auto",cursor:"pointer"}}>🔖</span>
                  </div>
                  <div style={{fontSize:13,color:"#111",fontWeight:700}}>12,847 likes</div>
                  <div style={{fontSize:12,color:"#111",marginTop:3,lineHeight:1.55}}>
                    <span style={{fontWeight:700}}>memecraft_ai </span>
                    {caption||<span style={{color:"#bbb"}}>Caption here...</span>}
                  </div>
                  <div style={{fontSize:11,color:"#0095f6",marginTop:5,lineHeight:1.9}}>
                    {hashtags.slice(0,5).map(h=>`#${h}`).join(" ")}
                  </div>
                </div>
              </div>

              <div className="card" style={{padding:16}}>
                {uploadMode&&(
                  <div style={{marginBottom:14}}>
                    <label style={{fontSize:11,color:"#555",letterSpacing:2,textTransform:"uppercase"}}>What's this about?</label>
                    <div style={{display:"flex",gap:8,marginTop:8}}>
                      <input value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="e.g. exam stress..." style={{padding:"9px 12px",flex:1}}/>
                      <button className="btn-upload" disabled={genCapLoading} onClick={generateCaptionForUpload} style={{padding:"9px 12px",fontSize:12,borderRadius:8,flexShrink:0}}>
                        {genCapLoading?"⏳":"✨ AI"}
                      </button>
                    </div>
                  </div>
                )}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <label style={{fontSize:11,color:"#555",letterSpacing:2,textTransform:"uppercase"}}>📝 Caption</label>
                  {!uploadMode&&<button className="btn-g" onClick={regenCaption} style={{padding:"5px 10px",fontSize:11}}>🔄 Regen</button>}
                </div>
                <textarea value={caption} onChange={e=>setCaption(e.target.value)} placeholder="Caption..."
                  style={{padding:"10px 12px",fontSize:14,minHeight:70,resize:"vertical",lineHeight:1.6}}/>

                <div style={{marginTop:14}}>
                  <label style={{fontSize:11,color:"#555",letterSpacing:2,textTransform:"uppercase"}}>#️⃣ Hashtags</label>
                  <div style={{marginTop:8,lineHeight:2}}>
                    {hashtags.map((h,i)=>(
                      <span key={i} className="hp" onClick={()=>setHashtags(hashtags.filter((_,j)=>j!==i))}>
                        #{h} <span style={{opacity:.5}}>×</span>
                      </span>
                    ))}
                  </div>
                  <div style={{display:"flex",gap:8,marginTop:10}}>
                    <input value={newTag} onChange={e=>setNewTag(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addTag()} placeholder="Add hashtag..." style={{padding:"9px 12px",flex:1}}/>
                    <button className="btn-g" onClick={addTag} style={{padding:"9px 12px",fontSize:13,flexShrink:0}}>+ Add</button>
                  </div>
                </div>

                <button className="btn-y" onClick={copyAll} style={{width:"100%",padding:"13px",marginTop:14,fontSize:15}}>
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
