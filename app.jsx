import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

/* ────────────────────────────────────────
   PALETTE
──────────────────────────────────────── */
const P = {
  bg: "#050705",
  s1: "#0B0E0A",
  s2: "#10140F",
  s3: "#161B14",
  bdr: "#1C231A",
  bdr2: "#2A3326",
  tx: "#E0DBCC",
  tx2: "#AAA598",
  tx3: "#6E695E",
  g: "#7EA066",
  gl: "#9CBC80",
  gd: "#556E40",
  a: "#BF9B55",
  al: "#D4B472",
  r: "#A06060",
  b: "#608CA0",
};

/* ────────────────────────────────────────
   GLOBAL CSS + ANIMATIONS
──────────────────────────────────────── */
const GCSS = `
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{background:${P.bg};overflow-x:hidden}

/* --- MARBLE-STYLE ANIMATIONS --- */
@keyframes morphA {
  0%{border-radius:40% 60% 60% 40%/60% 30% 70% 40%;transform:rotate(0deg) scale(1)}
  25%{border-radius:50% 50% 30% 70%/50% 60% 40% 50%;transform:rotate(90deg) scale(1.05)}
  50%{border-radius:30% 70% 50% 50%/40% 50% 60% 50%;transform:rotate(180deg) scale(0.97)}
  75%{border-radius:60% 40% 40% 60%/70% 40% 60% 30%;transform:rotate(270deg) scale(1.03)}
  100%{border-radius:40% 60% 60% 40%/60% 30% 70% 40%;transform:rotate(360deg) scale(1)}
}
@keyframes morphB {
  0%{border-radius:60% 40% 30% 70%/50% 60% 40% 50%;transform:rotate(0deg)}
  33%{border-radius:40% 60% 70% 30%/60% 40% 50% 60%;transform:rotate(-120deg)}
  66%{border-radius:70% 30% 50% 50%/30% 70% 40% 60%;transform:rotate(-240deg)}
  100%{border-radius:60% 40% 30% 70%/50% 60% 40% 50%;transform:rotate(-360deg)}
}
@keyframes driftUp {
  0%{transform:translateY(0) scale(1);opacity:0.5}
  50%{opacity:0.8}
  100%{transform:translateY(-100vh) scale(0.3);opacity:0}
}
@keyframes shimmerGrad {
  0%{background-position:0% 50%}
  50%{background-position:100% 50%}
  100%{background-position:0% 50%}
}
@keyframes enterUp {
  from{opacity:0;transform:translateY(24px)}
  to{opacity:1;transform:translateY(0)}
}
@keyframes enterFade {
  from{opacity:0}
  to{opacity:1}
}
@keyframes enterScale {
  from{opacity:0;transform:scale(0.92)}
  to{opacity:1;transform:scale(1)}
}
@keyframes glowPulse {
  0%,100%{box-shadow:0 0 30px ${P.g}10,0 0 60px ${P.g}05}
  50%{box-shadow:0 0 50px ${P.g}20,0 0 100px ${P.g}08}
}
@keyframes breatheCircle {
  0%{transform:scale(0.45);opacity:0.3}
  50%{transform:scale(1);opacity:0.7}
  100%{transform:scale(0.45);opacity:0.3}
}
@keyframes textGlow {
  0%,100%{text-shadow:0 0 20px ${P.g}00}
  50%{text-shadow:0 0 20px ${P.g}44}
}
@keyframes floatSlow {
  0%,100%{transform:translateY(0)}
  50%{transform:translateY(-10px)}
}
@keyframes rotateHue {
  0%{filter:hue-rotate(0deg)}
  100%{filter:hue-rotate(360deg)}
}
@keyframes lineGrow {
  from{width:0}
  to{width:100%}
}

.ani-up{animation:enterUp .65s cubic-bezier(.22,1,.36,1) forwards}
.ani-fade{animation:enterFade .5s ease forwards}
.ani-scale{animation:enterScale .5s cubic-bezier(.22,1,.36,1) forwards}
.d1{animation-delay:.06s;opacity:0}
.d2{animation-delay:.12s;opacity:0}
.d3{animation-delay:.18s;opacity:0}
.d4{animation-delay:.24s;opacity:0}
.d5{animation-delay:.3s;opacity:0}
.d6{animation-delay:.36s;opacity:0}
.d7{animation-delay:.42s;opacity:0}
.d8{animation-delay:.48s;opacity:0}

.shimmer-title{
  background:linear-gradient(135deg,${P.g},${P.gl},${P.a},${P.al},${P.g});
  background-size:300% 300%;
  -webkit-background-clip:text;-webkit-text-fill-color:transparent;
  animation:shimmerGrad 6s ease infinite;
}

input[type=range]{-webkit-appearance:none;height:3px;background:${P.bdr};border-radius:2px;outline:none}
input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:14px;border-radius:50%;background:${P.g};cursor:pointer;box-shadow:0 0 8px ${P.g}33}
textarea:focus,input:focus{outline:none;border-color:${P.g}44 !important}
::selection{background:${P.g}33}
::-webkit-scrollbar{width:3px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:${P.bdr};border-radius:2px}
`;

/* ────────────────────────────────────────
   DATA
──────────────────────────────────────── */
const MOODS = [
  {v:1,l:"Shattered",c:"#5A3333"},{v:2,l:"Heavy",c:"#6A3A33"},
  {v:3,l:"Low",c:"#7A4A38"},{v:4,l:"Foggy",c:"#7A6038"},
  {v:5,l:"Neutral",c:"#5A6A40"},{v:6,l:"Settling",c:"#4A7044"},
  {v:7,l:"Clear",c:"#4A7A50"},{v:8,l:"Open",c:"#4A8A5A"},
  {v:9,l:"Flowing",c:"#4A9A66"},{v:10,l:"Luminous",c:"#4AAA70"},
];

const BREATH = [
  {id:"calm",name:"4-7-8 Reset",dur:"~4 min",i:4,h1:7,o:8,h2:0,cy:6,
    why:"Extended exhale activates your vagus nerve — shifting from fight-or-flight to rest. The 7s hold builds CO₂ tolerance, quieting the amygdala.",
    warn:"Safe for most. Breathe normally if lightheaded."},
  {id:"box",name:"Box Breathing",dur:"~6 min",i:4,h1:4,o:4,h2:4,cy:8,
    why:"Equal-ratio breathing entrains heart-lung-brain coherence. Used by Navy SEALs under extreme pressure. Activates prefrontal cortex for clarity.",
    warn:"Safe for everyone."},
  {id:"deep",name:"Deep Exploration",dur:"~10 min",i:3,h1:0,o:3,h2:0,cy:30,
    why:"Sustained connected breathing shifts blood pH → altered states, emotional catharsis, somatic release. Developed by Stanislav Grof after LSD was banned.",
    warn:"Not for: heart conditions, pregnancy, epilepsy. Tingling is normal."},
  {id:"ground",name:"Post-Experience Ground",dur:"~5 min",i:5,h1:2,o:7,h2:3,cy:5,
    why:"After expanded states, long exhales + pauses maximize vagal activation. Rebuilds body awareness and sense of boundary.",
    warn:"Gentlest pattern. Safe for everyone."},
];

const INTEG = [
  {day:0,t:"Capture",d:"Record raw. Don't analyze.",p:["What are you feeling right now? Don't think — write.","What images keep replaying?","If the experience had one message, what was it?","What emotion surprised you most?"]},
  {day:1,t:"Body",d:"Your body processed it too.",p:["Scan head to feet. Where feels different?","Where is there tightness? Warmth? Openness?","How did you sleep? Dreams?","What does your body need today?"]},
  {day:3,t:"Meaning",d:"Some insights sharpen. Others fade.",p:["What insight has gotten STRONGER over 3 days?","What faded? Why might it have?","Has daily life felt any different?","Have relationships shifted?"]},
  {day:7,t:"Patterns",d:"Old habits test new awareness.",p:["What old pattern tried to reassert itself?","Did you catch yourself doing anything differently?","What conversation are you avoiding?","Rate clarity vs. before: worse / same / better / much better"]},
  {day:14,t:"Action",d:"Insight without action fades.",p:["One concrete change you'll commit to?","Smallest step toward that TODAY?","What support do you need?","Write a letter from the you that emerged during the experience."]},
  {day:30,t:"Review",d:"A full cycle. See the distance.",p:["Read Day 0. What do you notice?","What genuinely changed?","What didn't change? Why?","The single most important lesson?"]},
];

const PROTOS = {
  fadiman:{n:"Fadiman",by:"Dr. James Fadiman",s:"1 on → 2 off",dose:"0.1-0.3g psilocybin",dur:"4-8 wks",d:"The original protocol. Rest days prevent tolerance and let you observe residual effects."},
  stamets:{n:"Stamets Stack",by:"Paul Stamets",s:"4 on → 3 off",dose:"0.1-0.3g + lion's mane + niacin",dur:"4 on / 2 off",d:"Psilocybin creates neural connections. Lion's mane supports nerve growth factor. Niacin distributes peripherally."},
  intuitive:{n:"Intuitive",by:"Self-guided",s:"When called, min 2d gap",dose:"Start 0.05g",dur:"Ongoing + breaks",d:"No fixed schedule. Requires honest self-monitoring to avoid habitual use."},
};

/* ────────────────────────────────────────
   MARBLE BACKGROUND COMPONENT
──────────────────────────────────────── */
function MarbleBG() {
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0,overflow:"hidden"}}>
      {/* Morphing blob 1 */}
      <div style={{
        position:"absolute",top:"-15%",right:"-10%",width:"600px",height:"600px",
        background:`radial-gradient(ellipse at 30% 40%, ${P.g}08, ${P.gd}04, transparent 70%)`,
        animation:"morphA 25s ease-in-out infinite",
      }}/>
      {/* Morphing blob 2 */}
      <div style={{
        position:"absolute",bottom:"-20%",left:"-15%",width:"500px",height:"500px",
        background:`radial-gradient(ellipse at 60% 50%, ${P.a}06, ${P.al}03, transparent 70%)`,
        animation:"morphB 30s ease-in-out infinite",
      }}/>
      {/* Morphing blob 3 - subtle center */}
      <div style={{
        position:"absolute",top:"40%",left:"30%",width:"400px",height:"400px",
        background:`radial-gradient(ellipse at 50% 50%, ${P.g}04, transparent 60%)`,
        animation:"morphA 20s ease-in-out infinite reverse",
      }}/>
      {/* Floating particles */}
      {[...Array(8)].map((_,i) => (
        <div key={i} style={{
          position:"absolute",
          bottom:`${-10 - i * 5}%`,
          left:`${8 + i * 12}%`,
          width:`${3 + (i % 3)}px`,
          height:`${3 + (i % 3)}px`,
          borderRadius:"50%",
          background: i % 2 === 0 ? P.g+"30" : P.a+"20",
          animation:`driftUp ${18 + i * 4}s linear infinite`,
          animationDelay:`${i * 2.5}s`,
        }}/>
      ))}
      {/* Grain overlay */}
      <div style={{
        position:"absolute",inset:0,opacity:0.03,
        backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      }}/>
    </div>
  );
}

/* ────────────────────────────────────────
   ANIMATED LINE DIVIDER
──────────────────────────────────────── */
function LineDivider({delay = 0}) {
  return (
    <div style={{height:"1px",background:P.bdr,margin:"20px 0",overflow:"hidden"}}>
      <div style={{height:"1px",background:`linear-gradient(90deg,transparent,${P.g}44,transparent)`,animation:`lineGrow 1.2s cubic-bezier(.22,1,.36,1) ${delay}s forwards`,width:0}}/>
    </div>
  );
}

/* ────────────────────────────────────────
   MAIN APP
──────────────────────────────────────── */
export default function App() {
  const [view, setView] = useState("welcome");
  const [tab, setTab] = useState("journal");
  const [tKey, setTKey] = useState(0);
  const [prof, setProf] = useState({stage:"",goals:[]});

  // Journal
  const [entries, setEntries] = useState([]);
  const [txt, setTxt] = useState("");
  const [aiTxt, setAiTxt] = useState("");
  const [aiWait, setAiWait] = useState(false);
  const [jMode, setJMode] = useState("free");
  const [iDay, setIDay] = useState(null);

  // Mood
  const [moods, setMoods] = useState([]);
  const [moodDone, setMoodDone] = useState(false);

  // Breath
  const [bSel, setBSel] = useState("calm");
  const [bSt, setBSt] = useState("pick"); // pick | go | done
  const [bPh, setBPh] = useState("");
  const [bSec, setBSec] = useState(0);
  const [bCyc, setBCyc] = useState(0);
  const [bTot, setBTot] = useState(0);
  const [preM, setPreM] = useState(null);
  const [postM, setPostM] = useState(null);
  const bRef = useRef(null);
  const tRef = useRef(null);

  // Protocol
  const [proto, setProto] = useState("fadiman");
  const [micros, setMicros] = useState([]);
  const [mf, setMf] = useState({date:new Date().toISOString().split("T")[0],dose:"",focus:5,creativity:5,mood:5,anxiety:5,sleep:5});

  // Timeline
  const [exps, setExps] = useState([]);
  const [ef, setEf] = useState({type:"psilocybin",date:new Date().toISOString().split("T")[0],intention:"",intensity:5,notes:""});

  const stages = ["Just curious","Explored a few times","Regular practice","Post-experience"];
  const goalOpts = ["Mental clarity","Healing","Spiritual growth","Creativity","Breaking patterns","Self-understanding"];
  const tabList = [{id:"journal",icon:"✦"},{id:"track",icon:"◐"},{id:"breathe",icon:"○"},{id:"protocol",icon:"◊"},{id:"timeline",icon:"⟡"}];

  const prompt = useMemo(() => {
    const a = ["What's alive in you right now?","What emotion keeps visiting? Where in your body?","What pattern are you noticing lately?","What would your wisest self say right now?","What are you avoiding looking at?","Describe who you're becoming."];
    return a[Math.floor(Math.random()*a.length)];
  },[]);

  function goTab(id){ setTab(id); setTKey(k=>k+1); }

  // ──── AI ────
  const doSubmit = useCallback(async () => {
    if (!txt.trim()) return;
    const e = {id:Date.now(),txt:txt.trim(),date:new Date().toLocaleDateString("en-US",{weekday:"short",month:"short",day:"numeric"}),time:new Date().toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"}),iDay:iDay!==null?INTEG[iDay].t:null,ai:""};
    setEntries(p=>[e,...p]);
    setAiWait(true);setTxt("");
    try{
      const hist=entries.slice(0,3).map(x=>`[${x.date}]: ${x.txt}`).join("\n---\n");
      const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:800,
          messages:[{role:"user",content:`You are a psychedelic integration journal AI. Warm, grounded, insightful — a wise friend who's done their own deep work.

USER: Stage="${prof.stage}", Goals="${prof.goals.join(", ")}"${iDay!==null?`, Integration Day ${INTEG[iDay].day} (${INTEG[iDay].t})`:""}

ENTRY: "${e.txt}"
${hist?`HISTORY:\n${hist}`:""}

2-3 sentences. Do ONE: deeper question (IFS: "What part of you?", somatic: "Where in your body?", ACT: "What does this say about what you value?"), cross-entry pattern, name what they're avoiding, or connect entries. No lists. No "great observation." No "thank you for sharing." Real person voice.`}]})});
      const d=await r.json();
      const reply=d.content?.filter(x=>x.type==="text").map(x=>x.text).join("")||"Sit with what you wrote. Your own words hold more than you first realize.";
      setAiTxt(reply);
      setEntries(p=>{const n=[...p];const idx=n.findIndex(x=>x.id===e.id);if(idx>=0)n[idx]={...n[idx],ai:reply};return n;});
    }catch(err){
      const fb="I'm here. Take a breath and re-read what you wrote.";
      setAiTxt(fb);
      setEntries(p=>{const n=[...p];const idx=n.findIndex(x=>x.id===e.id);if(idx>=0)n[idx]={...n[idx],ai:fb};return n;});
    }
    setAiWait(false);
  },[txt,entries,prof,iDay]);

  // ──── BREATH ENGINE ────
  const startBreath = useCallback(() => {
    if(preM===null) return;
    const pat=BREATH.find(x=>x.id===bSel);
    if(!pat) return;
    setBSt("go");setBCyc(0);setBTot(0);setPostM(null);
    let cyc=0,ph="in",s=pat.i;
    setBPh("Breathe In");setBSec(pat.i);

    tRef.current=setInterval(()=>setBTot(t=>t+1),1000);

    const advance=()=>{
      if(cyc>=pat.cy){clearInterval(bRef.current);clearInterval(tRef.current);setBSt("done");return;}
      if(ph==="in"){
        if(pat.h1>0){ph="h1";s=pat.h1;setBPh("Hold");}
        else{ph="out";s=pat.o;setBPh("Release");}
      }else if(ph==="h1"){
        ph="out";s=pat.o;setBPh("Release");
      }else if(ph==="out"){
        if(pat.h2>0){ph="h2";s=pat.h2;setBPh("Hold");}
        else{ph="in";s=pat.i;cyc++;setBCyc(cyc);setBPh("Breathe In");}
      }else{
        ph="in";s=pat.i;cyc++;setBCyc(cyc);setBPh("Breathe In");
      }
      setBSec(s);
    };

    bRef.current=setInterval(()=>{s--;setBSec(s);if(s<=0)advance();},1000);
  },[bSel,preM]);

  const stopBreath = useCallback(() => {
    clearInterval(bRef.current);clearInterval(tRef.current);setBSt("done");
  },[]);

  useEffect(()=>()=>{clearInterval(bRef.current);clearInterval(tRef.current);},[]);

  const fmtTime = s => `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;

  // ──── STYLES ────
  const ff = "'Cormorant Garamond',Georgia,serif";
  const fs = "'DM Sans',-apple-system,sans-serif";
  const card = {background:P.s1,border:`1px solid ${P.bdr}`,borderRadius:"18px",padding:"22px",marginBottom:"14px",backdropFilter:"blur(10px)"};
  const lbl = {fontSize:"9px",fontFamily:fs,color:P.g,letterSpacing:"2.5px",textTransform:"uppercase",margin:"0 0 14px",fontWeight:500};
  const pill = on => ({padding:"8px 18px",borderRadius:"22px",border:`1px solid ${on?P.g+"44":P.bdr}`,background:on?P.g+"10":"transparent",color:on?P.gl:P.tx3,fontSize:"12px",fontFamily:fs,cursor:"pointer",fontWeight:on?500:400,transition:"all .35s cubic-bezier(.22,1,.36,1)"});
  const btnP = on => ({padding:"14px 40px",background:on?`linear-gradient(135deg,${P.gd},${P.g})`:P.bdr,color:on?P.bg:P.tx3,border:"none",borderRadius:"30px",fontSize:"13px",fontFamily:fs,fontWeight:600,cursor:on?"pointer":"default",letterSpacing:".5px",transition:"all .35s cubic-bezier(.22,1,.36,1)",boxShadow:on?`0 4px 24px ${P.g}25`:"none"});
  const inp = {width:"100%",padding:"12px 14px",background:P.bg,border:`1px solid ${P.bdr}`,borderRadius:"12px",color:P.tx,fontSize:"14px",fontFamily:ff,transition:"all .3s ease"};

  // ════════════════════════════════════════
  // ONBOARDING SCREENS
  // ════════════════════════════════════════

  if (view==="welcome") return (
    <div style={{background:P.bg,minHeight:"100vh",color:P.tx,fontFamily:ff,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <style>{GCSS}</style>
      <MarbleBG/>
      <div className="ani-up" style={{maxWidth:"400px",padding:"48px 28px",textAlign:"center",position:"relative",zIndex:1}}>
        <div style={{width:"80px",height:"80px",margin:"0 auto 28px",background:`radial-gradient(ellipse at 40% 40%,${P.g}18,${P.gd}08,transparent)`,animation:"morphA 8s ease-in-out infinite,glowPulse 4s ease-in-out infinite",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <span style={{fontSize:"28px",animation:"textGlow 4s ease-in-out infinite"}}>✦</span>
        </div>
        <h1 style={{fontSize:"32px",fontWeight:300,letterSpacing:"1px",marginBottom:"12px"}}>Welcome</h1>
        <p style={{color:P.tx2,fontSize:"15px",lineHeight:1.8,marginBottom:"40px",fontFamily:fs,fontWeight:300}}>
          Your space for inner work.<br/>Private. Yours alone.
        </p>
        <button onClick={()=>setView("stage")} style={btnP(true)}
          onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
          onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
          Begin
        </button>
      </div>
    </div>
  );

  if (view==="stage") return (
    <div style={{background:P.bg,minHeight:"100vh",color:P.tx,fontFamily:ff,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <style>{GCSS}</style>
      <MarbleBG/>
      <div className="ani-up" style={{maxWidth:"420px",padding:"48px 28px",position:"relative",zIndex:1}}>
        <p style={{...lbl,textAlign:"center"}}>Where Are You?</p>
        <p style={{color:P.tx2,fontSize:"13px",fontFamily:fs,textAlign:"center",marginBottom:"24px",lineHeight:1.6}}>This personalizes everything — prompts, insights, tone.</p>
        <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
          {stages.map((s,i)=>(
            <button key={i} onClick={()=>{setProf(p=>({...p,stage:s}));setView("goals");}}
              className={`ani-up d${i+1}`}
              style={{padding:"18px 20px",background:P.s1,border:`1px solid ${P.bdr}`,borderRadius:"14px",color:P.tx,fontSize:"16px",fontFamily:ff,cursor:"pointer",textAlign:"left",transition:"all .35s cubic-bezier(.22,1,.36,1)"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=P.g+"55";e.currentTarget.style.transform="translateX(6px)";e.currentTarget.style.background=P.s2;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=P.bdr;e.currentTarget.style.transform="translateX(0)";e.currentTarget.style.background=P.s1;}}>
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  if (view==="goals") return (
    <div style={{background:P.bg,minHeight:"100vh",color:P.tx,fontFamily:ff,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <style>{GCSS}</style>
      <MarbleBG/>
      <div className="ani-up" style={{maxWidth:"420px",padding:"48px 28px",textAlign:"center",position:"relative",zIndex:1}}>
        <p style={lbl}>What Calls You?</p>
        <p style={{color:P.tx2,fontSize:"13px",fontFamily:fs,marginBottom:"24px",lineHeight:1.6}}>Select all that resonate.</p>
        <div style={{display:"flex",flexWrap:"wrap",gap:"10px",justifyContent:"center",marginBottom:"32px"}}>
          {goalOpts.map((g,i)=>(
            <button key={g} onClick={()=>setProf(p=>({...p,goals:p.goals.includes(g)?p.goals.filter(x=>x!==g):[...p.goals,g]}))}
              className={`ani-scale d${Math.min(i+1,6)}`}
              style={{...pill(prof.goals.includes(g)),padding:"10px 20px",fontSize:"13px"}}>{g}</button>
          ))}
        </div>
        <button onClick={()=>{if(prof.goals.length>0)setView("app");}} style={btnP(prof.goals.length>0)}
          onMouseEnter={e=>{if(prof.goals.length>0)e.currentTarget.style.transform="translateY(-2px)"}}
          onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
          Enter
        </button>
      </div>
    </div>
  );

  // ════════════════════════════════════════
  // MAIN APP
  // ════════════════════════════════════════
  return (
    <div style={{background:P.bg,minHeight:"100vh",color:P.tx,fontFamily:ff}}>
      <style>{GCSS}</style>
      <MarbleBG/>
      <div style={{position:"relative",zIndex:1}}>

        {/* HEADER */}
        <div style={{padding:"22px 20px 0",textAlign:"center"}}>
          <h1 className="shimmer-title" style={{fontSize:"13px",fontFamily:fs,fontWeight:500,letterSpacing:"6px",textTransform:"uppercase",display:"inline-block"}}>✦ Inner Work ✦</h1>
        </div>

        {/* TABS */}
        <div style={{display:"flex",justifyContent:"center",gap:"3px",padding:"18px 10px 0"}}>
          {tabList.map(t=>(
            <button key={t.id} onClick={()=>goTab(t.id)}
              style={{padding:"9px 16px",background:tab===t.id?P.s1:"transparent",border:`1px solid ${tab===t.id?P.bdr:"transparent"}`,borderRadius:"24px",color:tab===t.id?P.gl:P.tx3,fontSize:"12px",fontFamily:fs,cursor:"pointer",transition:"all .3s cubic-bezier(.22,1,.36,1)",fontWeight:tab===t.id?500:400,
              ...(tab===t.id?{boxShadow:`0 0 20px ${P.g}08`}:{})}}>
              {t.icon} {t.id[0].toUpperCase()+t.id.slice(1)}
            </button>
          ))}
        </div>

        {/* CONTENT */}
        <div key={tKey} className="ani-up" style={{maxWidth:"540px",margin:"0 auto",padding:"22px 16px 130px"}}>

          {/* ═══════════ JOURNAL ═══════════ */}
          {tab==="journal" && (<div>
            <div style={{display:"flex",gap:"8px",marginBottom:"16px"}}>
              <button onClick={()=>{setJMode("free");setIDay(null);}} style={pill(jMode==="free")}>Free Write</button>
              <button onClick={()=>setJMode("integ")} style={pill(jMode==="integ")}>Integration</button>
            </div>

            {jMode==="integ" && (
              <div className="ani-fade" style={card}>
                <p style={lbl}>Integration Day</p>
                <p style={{fontSize:"12px",fontFamily:fs,color:P.tx2,margin:"0 0 16px",lineHeight:1.7}}>
                  Day 0 = raw capture. Day 1 = body. Day 3 = meaning. Day 7 = patterns. Day 14 = action. Day 30 = review.
                </p>
                <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
                  {INTEG.map((d,i)=>(
                    <button key={i} onClick={()=>setIDay(i)}
                      style={{...pill(iDay===i),display:"flex",flexDirection:"column",alignItems:"center",padding:"10px 14px",minWidth:"58px"}}>
                      <span style={{fontSize:"10px"}}>Day {d.day}</span>
                      <span style={{fontSize:"8px",opacity:.7,marginTop:"2px"}}>{d.t}</span>
                    </button>
                  ))}
                </div>
                {iDay!==null && (
                  <div className="ani-fade" style={{marginTop:"16px",padding:"16px",background:P.bg,borderRadius:"12px",border:`1px solid ${P.bdr}`}}>
                    <p style={{fontSize:"15px",fontWeight:500,color:P.a,margin:"0 0 6px"}}>Day {INTEG[iDay].day}: {INTEG[iDay].t}</p>
                    <p style={{fontSize:"12px",fontFamily:fs,color:P.tx2,margin:"0 0 12px",fontStyle:"italic",lineHeight:1.6}}>{INTEG[iDay].d}</p>
                    {INTEG[iDay].p.map((pr,j)=>(
                      <p key={j} style={{fontSize:"12px",fontFamily:fs,color:P.tx2,margin:"7px 0",paddingLeft:"14px",borderLeft:`2px solid ${P.bdr2}`,lineHeight:1.7}}>{pr}</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {jMode==="free" && (
              <div className="ani-fade" style={card}>
                <p style={lbl}>Today's Prompt</p>
                <p style={{fontSize:"18px",lineHeight:1.8,fontStyle:"italic",color:P.tx,fontWeight:300}}>"{prompt}"</p>
              </div>
            )}

            {/* Text input */}
            <div style={card}>
              <textarea value={txt} onChange={e=>setTxt(e.target.value)}
                placeholder={iDay!==null?INTEG[iDay].p[0]:"Write here. No one reads this but you and your AI."}
                style={{...inp,minHeight:"130px",border:"none",padding:0,background:"transparent",resize:"vertical",lineHeight:1.9,fontSize:"16px",fontWeight:300}}/>
              <LineDivider delay={0.2}/>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:"11px",fontFamily:fs,color:P.tx3}}>{txt.length}{iDay!==null?` · Day ${INTEG[iDay].day}`:""}</span>
                <button onClick={doSubmit} disabled={!txt.trim()||aiWait}
                  style={btnP(txt.trim()&&!aiWait)}
                  onMouseEnter={e=>{if(txt.trim()&&!aiWait)e.currentTarget.style.transform="translateY(-2px)"}}
                  onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
                  {aiWait?"Reflecting...":"Submit"}
                </button>
              </div>
            </div>

            {/* AI response */}
            {(aiTxt||aiWait)&&(
              <div className="ani-scale" style={{...card,background:`linear-gradient(145deg,${P.s1},${P.s2})`,borderColor:P.g+"15"}}>
                <p style={{...lbl,color:P.a}}>✦ AI Reflection</p>
                {aiWait
                  ?<p style={{fontFamily:fs,color:P.tx3,fontSize:"13px",animation:"textGlow 2s infinite"}}>Sitting with your words...</p>
                  :<p style={{fontSize:"15px",lineHeight:1.85,fontWeight:300}}>{aiTxt}</p>}
              </div>
            )}

            {/* Entry history */}
            {entries.map((e,i)=>(
              <div key={e.id} className={`ani-up d${Math.min(i+1,4)}`} style={{...card,padding:"18px"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:"8px"}}>
                  <span style={{fontSize:"10px",fontFamily:fs,color:P.g}}>{e.date}{e.iDay?` · ${e.iDay}`:""}</span>
                  <span style={{fontSize:"10px",fontFamily:fs,color:P.tx3}}>{e.time}</span>
                </div>
                <p style={{fontSize:"14px",lineHeight:1.75,fontWeight:300}}>{e.txt}</p>
                {e.ai&&(<>
                  <LineDivider delay={0}/>
                  <p style={{fontSize:"9px",fontFamily:fs,color:P.a,letterSpacing:"1.5px",textTransform:"uppercase",margin:"0 0 6px"}}>✦ AI</p>
                  <p style={{fontSize:"13px",lineHeight:1.65,color:P.tx2,fontWeight:300}}>{e.ai}</p>
                </>)}
              </div>
            ))}
          </div>)}

          {/* ═══════════ MOOD ═══════════ */}
          {tab==="track" && (<div>
            {!moodDone ? (
              <div style={{...card,textAlign:"center"}}>
                <p style={lbl}>How Are You Right Now?</p>
                <p style={{fontSize:"12px",fontFamily:fs,color:P.tx2,margin:"0 0 20px",lineHeight:1.6}}>Tap one. 3 seconds. Daily. Patterns emerge after a week.</p>
                <div style={{display:"flex",justifyContent:"center",gap:"8px",flexWrap:"wrap"}}>
                  {MOODS.map((m,i)=>(
                    <button key={m.v}
                      onClick={()=>{setMoods(p=>[...p,{s:m.v,l:m.l,d:new Date().toLocaleDateString("en-US",{month:"short",day:"numeric"})}]);setMoodDone(true);setTimeout(()=>setMoodDone(false),3500);}}
                      className={`ani-scale d${Math.min(i+1,8)}`}
                      style={{width:"48px",height:"48px",borderRadius:"50%",border:`1.5px solid ${P.bdr}`,background:`radial-gradient(circle at 40% 40%,${m.c}40,${m.c}15)`,color:P.tx,fontSize:"14px",fontFamily:fs,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",transition:"all .35s cubic-bezier(.22,1,.36,1)"}}
                      onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.18)";e.currentTarget.style.borderColor=m.c;e.currentTarget.style.boxShadow=`0 0 24px ${m.c}33`;}}
                      onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.borderColor=P.bdr;e.currentTarget.style.boxShadow="none";}}>
                      <span style={{fontSize:"15px",lineHeight:1}}>{m.v}</span>
                      <span style={{fontSize:"7px",color:P.tx3,marginTop:"1px"}}>{m.l.slice(0,5)}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="ani-scale" style={{...card,textAlign:"center",borderColor:P.g+"22"}}>
                <div style={{fontSize:"22px",marginBottom:"6px",animation:"textGlow 2s ease infinite"}}>✓</div>
                <p style={{fontSize:"15px",fontFamily:fs,color:P.gl,fontWeight:500}}>{moods[moods.length-1]?.l}</p>
                <p style={{fontSize:"11px",fontFamily:fs,color:P.tx3,marginTop:"4px"}}>{moods[moods.length-1]?.s}/10 · Come back tomorrow.</p>
              </div>
            )}

            {moods.length>2 && (
              <div className="ani-up d2" style={card}>
                <p style={lbl}>Mood Over Time</p>
                <ResponsiveContainer width="100%" height={170}>
                  <AreaChart data={moods}>
                    <defs><linearGradient id="mg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={P.g} stopOpacity={.35}/><stop offset="100%" stopColor={P.g} stopOpacity={0}/></linearGradient></defs>
                    <XAxis dataKey="d" tick={{fontSize:9,fill:P.tx3,fontFamily:fs}} axisLine={false} tickLine={false}/>
                    <YAxis domain={[1,10]} tick={{fontSize:9,fill:P.tx3}} axisLine={false} tickLine={false}/>
                    <Tooltip contentStyle={{background:P.s1,border:`1px solid ${P.bdr}`,borderRadius:"12px",fontSize:"11px",fontFamily:fs,color:P.tx}}/>
                    <Area type="monotone" dataKey="s" stroke={P.g} fill="url(#mg)" strokeWidth={2} dot={{r:3,fill:P.g,strokeWidth:0}} activeDot={{r:5,fill:P.gl,strokeWidth:0}}/>
                  </AreaChart>
                </ResponsiveContainer>
                {moods.length>=7&&(
                  <p style={{fontSize:"11px",fontFamily:fs,color:P.a,marginTop:"8px",textAlign:"center"}}>
                    7-day avg: {(moods.slice(-7).reduce((a,b)=>a+b.s,0)/Math.min(7,moods.length)).toFixed(1)}/10
                  </p>
                )}
              </div>
            )}
          </div>)}

          {/* ═══════════ BREATHWORK ═══════════ */}
          {tab==="breathe" && (<div>
            {bSt==="pick" && (<>
              {BREATH.map((b,i)=>(
                <button key={b.id} onClick={()=>setBSel(b.id)}
                  className={`ani-up d${Math.min(i+1,4)}`}
                  style={{...card,width:"100%",textAlign:"left",cursor:"pointer",borderColor:bSel===b.id?P.g+"33":P.bdr,transition:"all .35s cubic-bezier(.22,1,.36,1)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <p style={{fontSize:"16px",color:bSel===b.id?P.gl:P.tx,margin:0,fontWeight:500,transition:"color .3s"}}>{b.name}</p>
                    <span style={{fontSize:"10px",fontFamily:fs,color:P.tx3,background:P.bg,padding:"4px 12px",borderRadius:"12px"}}>{b.dur}</span>
                  </div>
                  {bSel===b.id && (
                    <div className="ani-fade" style={{marginTop:"14px"}}>
                      <p style={{fontSize:"12px",fontFamily:fs,color:P.tx2,lineHeight:1.75,margin:"0 0 8px"}}>{b.why}</p>
                      <p style={{fontSize:"10px",fontFamily:fs,color:P.r}}>⚠ {b.warn}</p>
                    </div>
                  )}
                </button>
              ))}

              <div style={{...card,textAlign:"center"}}>
                <p style={lbl}>Pre-Session State</p>
                <p style={{fontSize:"11px",fontFamily:fs,color:P.tx2,margin:"0 0 14px"}}>Rate current state to measure the shift.</p>
                <div style={{display:"flex",justifyContent:"center",gap:"8px",flexWrap:"wrap"}}>
                  {[1,2,3,4,5,6,7,8,9,10].map(n=>(
                    <button key={n} onClick={()=>setPreM(n)}
                      style={{width:"38px",height:"38px",borderRadius:"50%",border:`1.5px solid ${preM===n?P.g:P.bdr}`,background:preM===n?P.g+"18":"transparent",color:preM===n?P.gl:P.tx3,fontSize:"12px",fontFamily:fs,cursor:"pointer",transition:"all .25s cubic-bezier(.22,1,.36,1)"}}>{n}</button>
                  ))}
                </div>
              </div>

              <button onClick={startBreath} disabled={preM===null}
                style={{...btnP(preM!==null),width:"100%"}}
                onMouseEnter={e=>{if(preM!==null)e.currentTarget.style.transform="translateY(-2px)"}}
                onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
                Begin {BREATH.find(x=>x.id===bSel)?.name}
              </button>
            </>)}

            {bSt==="go" && (
              <div className="ani-fade" style={{textAlign:"center",paddingTop:"24px"}}>
                <p style={{...lbl,textAlign:"center"}}>{BREATH.find(x=>x.id===bSel)?.name} · {bCyc}/{BREATH.find(x=>x.id===bSel)?.cy}</p>
                <div style={{display:"flex",justifyContent:"center",alignItems:"center",height:"260px"}}>
                  <div style={{
                    width:bPh==="Breathe In"?"210px":bPh==="Release"?"80px":"210px",
                    height:bPh==="Breathe In"?"210px":bPh==="Release"?"80px":"210px",
                    borderRadius:"50%",
                    background:`radial-gradient(circle at 40% 40%,${P.g}14,${P.gd}08,transparent)`,
                    border:`1.5px solid ${P.g}30`,
                    display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
                    transition:"all 2.5s cubic-bezier(.4,0,.2,1)",
                    boxShadow:bPh==="Breathe In"?`0 0 60px ${P.g}15,0 0 120px ${P.g}08`:`0 0 20px ${P.g}08`,
                    animation:"glowPulse 4s ease-in-out infinite",
                  }}>
                    <p style={{fontSize:"13px",fontFamily:fs,color:P.gl,margin:"0 0 8px",letterSpacing:"4px",textTransform:"uppercase",fontWeight:300,transition:"all .5s"}}>{bPh}</p>
                    <p style={{fontSize:"42px",fontWeight:300,color:P.tx,margin:0,animation:"textGlow 3s ease infinite"}}>{bSec}</p>
                  </div>
                </div>
                <p style={{fontSize:"12px",fontFamily:fs,color:P.tx3}}>{fmtTime(bTot)}</p>
                <button onClick={stopBreath}
                  style={{marginTop:"24px",padding:"10px 30px",background:"transparent",border:`1px solid ${P.r}33`,borderRadius:"24px",color:P.r,fontSize:"12px",fontFamily:fs,cursor:"pointer",transition:"all .3s"}}>
                  End
                </button>
              </div>
            )}

            {bSt==="done" && (
              <div className="ani-up" style={{textAlign:"center",paddingTop:"20px"}}>
                <div style={{width:"60px",height:"60px",margin:"0 auto 16px",background:`radial-gradient(circle,${P.g}15,transparent)`,animation:"morphA 6s ease-in-out infinite,glowPulse 3s ease infinite",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  <span style={{fontSize:"24px"}}>✦</span>
                </div>
                <p style={{fontSize:"20px",fontWeight:400,marginBottom:"4px"}}>Complete</p>
                <p style={{fontSize:"12px",fontFamily:fs,color:P.tx3,marginBottom:"28px"}}>{BREATH.find(x=>x.id===bSel)?.name} · {fmtTime(bTot)}</p>

                {postM===null ? (
                  <div style={card}>
                    <p style={{...lbl,color:P.a}}>How Do You Feel Now?</p>
                    <div style={{display:"flex",justifyContent:"center",gap:"8px",flexWrap:"wrap"}}>
                      {[1,2,3,4,5,6,7,8,9,10].map(n=>(
                        <button key={n} onClick={()=>setPostM(n)}
                          style={{width:"38px",height:"38px",borderRadius:"50%",border:`1.5px solid ${P.bdr}`,background:"transparent",color:P.tx3,fontSize:"12px",fontFamily:fs,cursor:"pointer",transition:"all .25s cubic-bezier(.22,1,.36,1)"}}
                          onMouseEnter={e=>{e.currentTarget.style.borderColor=P.g;e.currentTarget.style.color=P.gl;}}
                          onMouseLeave={e=>{e.currentTarget.style.borderColor=P.bdr;e.currentTarget.style.color=P.tx3;}}>
                          {n}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="ani-scale" style={{...card,borderColor:P.g+"15"}}>
                    <p style={lbl}>Your Shift</p>
                    <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:"32px",marginBottom:"16px"}}>
                      <div><p style={{fontSize:"30px",color:P.tx3,fontWeight:300}}>{preM}</p><p style={{fontSize:"9px",fontFamily:fs,color:P.tx3}}>Before</p></div>
                      <div style={{fontSize:"22px",color:postM>preM?P.gl:postM<preM?P.r:P.tx3,animation:"textGlow 3s ease infinite"}}>→ {postM>preM?"+":""}{postM-preM}</div>
                      <div><p style={{fontSize:"30px",color:P.gl,fontWeight:300}}>{postM}</p><p style={{fontSize:"9px",fontFamily:fs,color:P.gl}}>After</p></div>
                    </div>
                    <p style={{fontSize:"12px",fontFamily:fs,color:P.tx2,lineHeight:1.7}}>
                      {postM>preM?`+${postM-preM} shift in ${fmtTime(bTot)}. Your nervous system responded. This data compounds over sessions.`:postM===preM?"Neutral shift. Some sessions are subtle — the body processes at its own pace.":"Lower score can mean emotional release. Suppressed material surfacing is often part of the process."}
                    </p>
                  </div>
                )}
                {postM!==null&&<button onClick={()=>{setBSt("pick");setPreM(null);setPostM(null);}} style={{...btnP(true),marginTop:"16px"}}
                  onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"}
                  onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>New Session</button>}
              </div>
            )}
          </div>)}

          {/* ═══════════ PROTOCOL ═══════════ */}
          {tab==="protocol" && (<div>
            <div style={{display:"flex",gap:"8px",marginBottom:"16px",flexWrap:"wrap"}}>
              {Object.entries(PROTOS).map(([k,v])=><button key={k} onClick={()=>setProto(k)} style={pill(proto===k)}>{v.n}</button>)}
            </div>

            <div className="ani-fade" style={card}>
              <p style={{fontSize:"16px",color:P.a,margin:"0 0 4px",fontWeight:500}}>{PROTOS[proto].n}</p>
              <p style={{fontSize:"10px",fontFamily:fs,color:P.tx3,margin:"0 0 10px"}}>By {PROTOS[proto].by}</p>
              <p style={{fontSize:"13px",fontFamily:fs,color:P.tx2,lineHeight:1.75,margin:"0 0 12px"}}>{PROTOS[proto].d}</p>
              <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
                {[["📅",PROTOS[proto].s],["💊",PROTOS[proto].dose],["⏱",PROTOS[proto].dur]].map(([ic,t],i)=>(
                  <span key={i} style={{fontSize:"10px",fontFamily:fs,background:P.bg,padding:"5px 12px",borderRadius:"10px",color:P.tx3,border:`1px solid ${P.bdr}`}}>{ic} {t}</span>
                ))}
              </div>
            </div>

            <div style={card}>
              <p style={lbl}>Log Today</p>
              <div style={{display:"flex",gap:"8px",marginBottom:"12px"}}>
                <input type="date" value={mf.date} onChange={e=>setMf(p=>({...p,date:e.target.value}))} style={{...inp,flex:1}}/>
                <input placeholder="Dose (e.g. 0.15g)" value={mf.dose} onChange={e=>setMf(p=>({...p,dose:e.target.value}))} style={{...inp,flex:1}}/>
              </div>
              {["focus","creativity","mood","anxiety","sleep"].map(f=>(
                <div key={f} style={{marginBottom:"8px"}}>
                  <div style={{display:"flex",justifyContent:"space-between"}}>
                    <span style={{fontSize:"11px",fontFamily:fs,color:P.tx3,textTransform:"capitalize"}}>{f}</span>
                    <span style={{fontSize:"11px",fontFamily:fs,color:P.g}}>{mf[f]}</span>
                  </div>
                  <input type="range" min="1" max="10" value={mf[f]} onChange={e=>setMf(p=>({...p,[f]:parseInt(e.target.value)}))} style={{width:"100%"}}/>
                </div>
              ))}
              <button onClick={()=>{if(!mf.dose)return;setMicros(p=>[...p,{...mf,id:Date.now(),dd:new Date(mf.date).toLocaleDateString("en-US",{month:"short",day:"numeric"})}]);setMf(p=>({...p,dose:"",focus:5,creativity:5,mood:5,anxiety:5,sleep:5}));}}
                disabled={!mf.dose} style={{...btnP(!!mf.dose),width:"100%",marginTop:"8px"}}>
                Log Entry
              </button>
            </div>

            {micros.length>2 && (
              <div className="ani-up d2" style={card}>
                <p style={lbl}>Protocol Data</p>
                <ResponsiveContainer width="100%" height={170}>
                  <BarChart data={micros.slice(-14)}>
                    <XAxis dataKey="dd" tick={{fontSize:8,fill:P.tx3,fontFamily:fs}} axisLine={false} tickLine={false}/>
                    <YAxis domain={[1,10]} tick={{fontSize:9,fill:P.tx3}} axisLine={false} tickLine={false}/>
                    <Tooltip contentStyle={{background:P.s1,border:`1px solid ${P.bdr}`,borderRadius:"12px",fontSize:"10px",fontFamily:fs,color:P.tx}}/>
                    <Bar dataKey="focus" fill={P.g} radius={[4,4,0,0]}/>
                    <Bar dataKey="creativity" fill={P.a} radius={[4,4,0,0]}/>
                    <Bar dataKey="mood" fill={P.b} radius={[4,4,0,0]}/>
                  </BarChart>
                </ResponsiveContainer>
                <div style={{display:"flex",justifyContent:"center",gap:"18px",marginTop:"8px"}}>
                  {[["Focus",P.g],["Creativity",P.a],["Mood",P.b]].map(([l,c])=>(
                    <span key={l} style={{fontSize:"10px",fontFamily:fs,color:c}}>● {l}</span>
                  ))}
                </div>
              </div>
            )}
          </div>)}

          {/* ═══════════ TIMELINE ═══════════ */}
          {tab==="timeline" && (<div>
            <div style={card}>
              <p style={lbl}>Log Experience</p>
              <div style={{display:"flex",gap:"7px",flexWrap:"wrap",marginBottom:"14px"}}>
                {["psilocybin","lsd","mdma","ketamine","ayahuasca","breathwork","meditation"].map(t=>(
                  <button key={t} onClick={()=>setEf(p=>({...p,type:t}))} style={{...pill(ef.type===t),textTransform:"capitalize",fontSize:"11px",padding:"6px 14px"}}>{t}</button>
                ))}
              </div>
              <input type="date" value={ef.date} onChange={e=>setEf(p=>({...p,date:e.target.value}))} style={{...inp,marginBottom:"10px"}}/>
              <input placeholder="Intention — what are you seeking?" value={ef.intention} onChange={e=>setEf(p=>({...p,intention:e.target.value}))} style={{...inp,marginBottom:"10px"}}/>
              <div style={{marginBottom:"10px"}}>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <span style={{fontSize:"11px",fontFamily:fs,color:P.tx3}}>Intensity</span>
                  <span style={{fontSize:"11px",fontFamily:fs,color:P.g}}>{ef.intensity}/10</span>
                </div>
                <input type="range" min="1" max="10" value={ef.intensity} onChange={e=>setEf(p=>({...p,intensity:parseInt(e.target.value)}))} style={{width:"100%"}}/>
              </div>
              <textarea placeholder="Notes, insights..." value={ef.notes} onChange={e=>setEf(p=>({...p,notes:e.target.value}))} style={{...inp,minHeight:"50px",resize:"vertical",marginBottom:"14px"}}/>
              <button onClick={()=>{if(!ef.intention.trim())return;setExps(p=>[{...ef,id:Date.now(),dd:new Date(ef.date).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"})},...p]);setEf({type:"psilocybin",date:new Date().toISOString().split("T")[0],intention:"",intensity:5,notes:""});}}
                disabled={!ef.intention.trim()} style={{...btnP(ef.intention.trim()),width:"100%"}}>
                Log → Begin Integration
              </button>
            </div>

            {exps.length>0 ? exps.map((x,i)=>(
              <div key={x.id} className={`ani-up d${Math.min(i+1,4)}`} style={{display:"flex",gap:"14px",marginBottom:"2px"}}>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",minWidth:"14px",paddingTop:"2px"}}>
                  <div style={{width:"8px",height:"8px",borderRadius:"50%",background:P.g,boxShadow:`0 0 8px ${P.g}44`,flexShrink:0}}/>
                  {i<exps.length-1&&<div style={{width:"1px",flex:1,background:`linear-gradient(${P.bdr},transparent)`,marginTop:"4px"}}/>}
                </div>
                <div style={{...card,flex:1,marginBottom:"12px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:"8px"}}>
                    <span style={{fontSize:"10px",fontFamily:fs,color:P.a,textTransform:"uppercase",letterSpacing:"1.5px",background:P.a+"10",padding:"3px 10px",borderRadius:"10px"}}>{x.type}</span>
                    <span style={{fontSize:"10px",fontFamily:fs,color:P.tx3}}>{x.dd}</span>
                  </div>
                  <p style={{fontSize:"14px",margin:"4px 0",fontWeight:400}}><span style={{color:P.tx3}}>Intention:</span> {x.intention}</p>
                  <p style={{fontSize:"11px",fontFamily:fs,color:P.tx3,letterSpacing:"1px"}}>{"●".repeat(x.intensity)}{"○".repeat(10-x.intensity)}</p>
                  {x.notes&&<p style={{fontSize:"12px",fontFamily:fs,color:P.tx2,margin:"10px 0 0",lineHeight:1.65,fontStyle:"italic"}}>{x.notes}</p>}
                </div>
              </div>
            )) : (
              <p style={{textAlign:"center",fontFamily:fs,color:P.tx3,fontSize:"12px",marginTop:"24px",lineHeight:1.8}}>
                Your timeline builds here. Every experience — ceremonies, breathwork, meditations, microdose cycles — mapped over time.
              </p>
            )}
          </div>)}

        </div>
      </div>
    </div>
  );
}
