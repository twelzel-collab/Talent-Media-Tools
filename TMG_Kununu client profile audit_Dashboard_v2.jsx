import { useState } from "react";

const C = {
  navy:"#1A1A2E", navyMid:"#16213E", gold:"#C8A96E", goldLight:"#F5EDD8",
  goldMuted:"#8B7040", white:"#FFFFFF", offWhite:"#F8F7F4", gray:"#6B7280",
  grayLight:"#E5E7EB", red:"#DC2626", redLight:"#FEE2E2", orange:"#EA580C",
  orangeLight:"#FFEDD5", green:"#16A34A", greenLight:"#DCFCE7", blue:"#2563EB", blueLight:"#DBEAFE",
};

const sc  = (v,m=5) => { const p=v/m; return p>=0.75?C.green:p>=0.5?C.orange:C.red; };
const sl  = (v,m=5) => { const p=v/m; return p>=0.75?"Stark":p>=0.5?"Mittel":"Schwach"; };
const sbg = (v,m=5) => { const p=v/m; return p>=0.75?C.greenLight:p>=0.5?C.orangeLight:C.redLight; };
const pct = (v,m=5) => Math.min(100,Math.max(0,(v/m)*100));
const eur = (v) => Math.round(v).toLocaleString("de-DE")+" €";

// ── Atoms ─────────────────────────────────────────────────────────────────────
const Lbl = ({c=C.gold,children}) => <div style={{fontSize:10,fontWeight:700,letterSpacing:1.8,color:c,textTransform:"uppercase",marginBottom:5}}>{children}</div>;
const Ey  = ({children}) => <div style={{fontSize:10,fontWeight:700,letterSpacing:2,color:C.goldMuted,textTransform:"uppercase",marginBottom:4}}>{children}</div>;
const Tag = ({val,max=5}) => <span style={{fontSize:11,fontWeight:700,padding:"2px 10px",borderRadius:20,background:sbg(val,max),color:sc(val,max)}}>{sl(val,max)}</span>;
const H2  = ({children}) => <h2 style={{fontSize:22,fontWeight:800,margin:"0 0 4px 0",color:C.navy,fontFamily:"Georgia,serif"}}>{children}</h2>;
const Sub = ({children}) => <p style={{fontSize:13,color:C.gray,margin:"0 0 24px 0",lineHeight:1.6}}>{children}</p>;
const Div = () => <div style={{height:1,background:C.grayLight,margin:"20px 0"}}/>;
const Warn = ({children,level="warn"}) => {
  const m={warn:{bg:C.orangeLight,c:"#9A3412",i:"⚠"},crit:{bg:C.redLight,c:"#991B1B",i:"✗"},ok:{bg:C.greenLight,c:"#166534",i:"✓"}};
  const s=m[level]; return <div style={{background:s.bg,borderRadius:6,padding:"8px 12px",fontSize:12,color:s.c,marginTop:8}}>{s.i} {children}</div>;
};
const StatBox = ({label,value,sub,color=C.navy}) => (
  <div style={{background:C.white,border:`1px solid ${C.grayLight}`,borderRadius:8,padding:"14px 16px"}}>
    <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:C.gray,marginBottom:5}}>{label}</div>
    <div style={{fontSize:28,fontWeight:900,color,lineHeight:1}}>{value||"–"}</div>
    {sub&&<div style={{fontSize:11,color:C.gray,marginTop:4}}>{sub}</div>}
  </div>
);
const Bar = ({value,max=5,label,height=8,benchmark=null,benchmarkLabel=""}) => (
  <div style={{marginBottom:12}}>
    {label&&<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}>
      <span style={{fontSize:12,color:C.gray}}>{label}</span>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        {benchmark!==null&&<span style={{fontSize:11,color:C.blue}}>Ø {benchmarkLabel}: {typeof benchmark==="number"?benchmark%1===0?benchmark:benchmark.toFixed(1):benchmark}</span>}
        <span style={{fontSize:12,fontWeight:700,color:sc(value,max)}}>{typeof value==="number"?value%1===0?value:value.toFixed(1):value}</span>
      </div>
    </div>}
    <div style={{position:"relative",height,background:C.grayLight,borderRadius:height/2,overflow:"visible"}}>
      <div style={{width:`${pct(value,max)}%`,height:"100%",background:sc(value,max),borderRadius:height/2,transition:"width 0.5s"}}/>
      {benchmark!==null&&(
        <div style={{position:"absolute",top:-3,left:`${pct(benchmark,max)}%`,width:2,height:height+6,background:C.blue,borderRadius:1,transform:"translateX(-50%)"}}/>
      )}
    </div>
    {benchmark!==null&&<div style={{fontSize:10,color:C.blue,marginTop:2}}>▲ Branchenø bei {typeof benchmark==="number"?benchmark.toFixed(1):benchmark}</div>}
  </div>
);

// Radar
function MiniRadar({data,labels,benchmark=null,size=190}) {
  const cx=size/2,cy=size/2,r=size*0.31;
  const n=labels.length;
  const ang=i=>(i*2*Math.PI)/n-Math.PI/2;
  const pt=(v,i)=>({x:cx+r*v*Math.cos(ang(i)),y:cy+r*v*Math.sin(ang(i))});
  const gp=l=>data.map((_,i)=>{const p=pt(l,i);return`${i===0?"M":"L"}${p.x},${p.y}`}).join(" ")+"Z";
  const dp=arr=>arr.map((v,i)=>{const p=pt(v/5,i);return`${i===0?"M":"L"}${p.x},${p.y}`}).join(" ")+"Z";
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {[0.25,0.5,0.75,1].map(l=><path key={l} d={gp(l)} fill="none" stroke={C.grayLight} strokeWidth={0.7}/>)}
      {data.map((_,i)=>{const p=pt(1,i);return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke={C.grayLight} strokeWidth={0.7}/>;})}
      {benchmark&&<path d={dp(benchmark)} fill={C.blue+"22"} stroke={C.blue} strokeWidth={1.5} strokeDasharray="3,2"/>}
      <path d={dp(data)} fill={C.gold+"44"} stroke={C.gold} strokeWidth={2}/>
      {data.map((v,i)=>{const p=pt(v/5,i);return <circle key={i} cx={p.x} cy={p.y} r={3} fill={C.gold}/>;} )}
      {labels.map((l,i)=>{const p=pt(1.3,i);return <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle" fontSize={8} fontWeight={600} fill={C.navy} style={{fontFamily:"sans-serif"}}>{l}</text>;})}
    </svg>
  );
}

// Comparison row
function CompRow({label,client,w1,w2,bench,w1n,w2n,max=5,isScore=false}) {
  const best=Math.max(client,w1,w2);
  const vals=[{v:client,n:"Mandant",hl:true},{v:w1,n:w1n},{v:w2,n:w2n}];
  return (
    <tr style={{borderBottom:`1px solid ${C.grayLight}`}}>
      <td style={{padding:"9px 12px",fontSize:12,color:C.navy,fontWeight:500,minWidth:160}}>{label}</td>
      {vals.map((item,i)=>(
        <td key={i} style={{padding:"9px 12px",textAlign:"center"}}>
          <div style={{display:"inline-flex",flexDirection:"column",alignItems:"center",gap:3,minWidth:70}}>
            <span style={{fontSize:14,fontWeight:800,color:item.v===best&&best>0?C.green:sc(item.v,max)}}>
              {item.v>0?(isScore?item.v.toFixed(1):Math.round(item.v)):"–"}{!isScore&&item.v>0?"%":""}
            </span>
            <div style={{width:56,height:4,background:C.grayLight,borderRadius:2,overflow:"hidden"}}>
              <div style={{width:`${pct(item.v,max)}%`,height:"100%",background:item.v===best&&best>0?C.green:sc(item.v,max)}}/>
            </div>
          </div>
        </td>
      ))}
      {bench!==undefined&&(
        <td style={{padding:"9px 12px",textAlign:"center"}}>
          <span style={{fontSize:12,fontWeight:700,color:C.blue}}>{isScore?bench.toFixed(1):Math.round(bench)}{!isScore?"%":""}</span>
        </td>
      )}
    </tr>
  );
}

// Input atoms
const Inp  = ({label,val,set,ph,hint}) => (
  <div style={{marginBottom:12}}>
    <Lbl>{label}</Lbl>
    <input value={val} onChange={e=>set(e.target.value)} placeholder={ph||label}
      style={{width:"100%",padding:"7px 10px",border:`1px solid ${C.grayLight}`,borderRadius:6,fontSize:13,color:C.navy,outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>
    {hint&&<div style={{fontSize:10,color:C.gray,marginTop:2}}>{hint}</div>}
  </div>
);
const NInp = ({label,val,set,max,step=1,hint}) => (
  <div style={{marginBottom:12}}>
    <Lbl>{label}</Lbl>
    <input type="number" value={val} min={0} max={max} step={step} onChange={e=>set(parseFloat(e.target.value)||0)}
      style={{width:"100%",padding:"7px 10px",border:`1px solid ${C.grayLight}`,borderRadius:6,fontSize:13,color:C.navy,outline:"none",boxSizing:"border-box"}}/>
    {hint&&<div style={{fontSize:10,color:C.gray,marginTop:2}}>{hint}</div>}
  </div>
);
const Sld  = ({label,val,set,max=5}) => (
  <div style={{marginBottom:14}}>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><Lbl>{label}</Lbl><span style={{fontSize:14,fontWeight:800,color:sc(val,max)}}>{val.toFixed(1)}</span></div>
    <input type="range" min={0} max={max} step={0.1} value={val} onChange={e=>set(parseFloat(e.target.value))} style={{width:"100%",accentColor:C.gold}}/>
    <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.gray}}><span>0</span><span>{max}</span></div>
  </div>
);
const Sel  = ({label,val,set,opts}) => (
  <div style={{marginBottom:12}}>
    <Lbl>{label}</Lbl>
    <select value={val} onChange={e=>set(e.target.value)} style={{width:"100%",padding:"7px 10px",border:`1px solid ${C.grayLight}`,borderRadius:6,fontSize:13,color:C.navy,outline:"none",background:C.white,fontFamily:"inherit"}}>
      {opts.map(o=><option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  </div>
);

// ── Branchen-Benchmarks ───────────────────────────────────────────────────────
const BENCHMARKS = {
  industrie:    {score:3.6,response:62,recommend:66,complete:72,gehalt:3.5,worklife:3.2,fuehrung:3.3,kolleg:3.8,karriere:3.0,sicht:2.8,label:"Industrie/Produktion"},
  handel:       {score:3.4,response:55,recommend:61,complete:65,gehalt:3.2,worklife:3.0,fuehrung:3.1,kolleg:3.6,karriere:2.8,sicht:2.6,label:"Handel/Retail"},
  it:           {score:3.9,response:74,recommend:76,complete:85,gehalt:3.9,worklife:3.5,fuehrung:3.6,kolleg:4.0,karriere:3.5,sicht:3.4,label:"IT/Tech"},
  bau:          {score:3.3,response:48,recommend:60,complete:60,gehalt:3.4,worklife:2.9,fuehrung:3.1,kolleg:3.7,karriere:2.7,sicht:2.4,label:"Bau/Handwerk"},
  gesundheit:   {score:3.5,response:58,recommend:64,complete:68,gehalt:3.1,worklife:2.8,fuehrung:3.2,kolleg:4.0,karriere:3.1,sicht:2.7,label:"Gesundheit/Pflege"},
  dienstleist:  {score:3.7,response:65,recommend:70,complete:74,gehalt:3.4,worklife:3.3,fuehrung:3.4,kolleg:3.8,karriere:3.2,sicht:3.1,label:"Dienstleistung"},
  logistik:     {score:3.2,response:44,recommend:57,complete:58,gehalt:3.2,worklife:2.7,fuehrung:2.9,kolleg:3.5,karriere:2.6,sicht:2.3,label:"Logistik/Transport"},
};

const KAT_LABELS = ["Gehalt","Work-Life","Führung","Kollegialität","Karriere","Sichtbarkeit"];

// ── DEFAULT ───────────────────────────────────────────────────────────────────
const DEF = {
  client:"Muster GmbH", contact:"Frau Schmidt, HR", industry:"Industrie / Produktion",
  size:"280", location:"Stuttgart, BW", date:new Date().toLocaleDateString("de-DE"),
  w1name:"Wettbewerber A GmbH", w2name:"Wettbewerber B AG",
  branch:"industrie",
  kn_score:3.2, kn_reviews:31, kn_response:30, kn_recommend:52, kn_complete:55,
  kn_last:"vor 3 Wochen", kn_top_issue:"Kommunikation & Work-Life-Balance", kn_trend:"stagnierend",
  kat_gehalt:3.4, kat_worklife:2.8, kat_fuehrung:2.9, kat_kolleg:3.7, kat_karriere:2.6, kat_sicht:2.2,
  w1_score:4.1, w1_reviews:118, w1_response:82, w1_recommend:79, w1_complete:90, w1_notes:"Sehr aktive Profilpflege, wöchentliche Antworten.",
  w2_score:3.6, w2_reviews:47, w2_response:55, w2_recommend:64, w2_complete:70, w2_notes:"Mittlere Aktivität, Profil vorhanden aber nicht konsequent bespielt.",
  open_roles:6, vacancy_days:68, avg_salary:55000, role_type:1.0,
  strengths:"Familiäres Betriebsklima\nÜberdurchschnittliche Vergütung\nHohe Mitarbeiterloyalität",
  gaps:"Antwortquote auf Reviews nur 30%\nProfil unvollständig (55%)\nKaum aktive Bewertungskampagnen\nKeine Reaktion auf kritische Bewertungen",
};

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function KununuDashboard() {
  const [d,setD]   = useState(DEF);
  const [edit,setEdit] = useState(false);
  const [tab,setTab]   = useState("overview");
  const set = (k,v) => setD(p=>({...p,[k]:v}));

  const BM = BENCHMARKS[d.branch] || BENCHMARKS.industrie;

  // Derived
  const katVals   = [d.kat_gehalt,d.kat_worklife,d.kat_fuehrung,d.kat_kolleg,d.kat_karriere,d.kat_sicht];
  const katBench  = [BM.gehalt,BM.worklife,BM.fuehrung,BM.kolleg,BM.karriere,BM.sicht];
  const overallIdx= (d.kn_score/5*40 + d.kn_response/100*25 + d.kn_recommend/100*20 + d.kn_complete/100*15)*100;
  const w1Idx     = (d.w1_score/5*40 + d.w1_response/100*25 + d.w1_recommend/100*20 + d.w1_complete/100*15)*100;
  const w2Idx     = (d.w2_score/5*40 + d.w2_response/100*25 + d.w2_recommend/100*20 + d.w2_complete/100*15)*100;
  const bmIdx     = (BM.score/5*40 + BM.response/100*25 + BM.recommend/100*20 + BM.complete/100*15)*100;

  // ── IMPACT CALCULATOR ──────────────────────────────────────────────────────
  // Option 2: Auto-compute vacancy cost from salary + role multiplier
  const monthlyGross    = (parseInt(d.avg_salary)||55000) / 12;
  const roleMultiplier  = parseFloat(d.role_type) || 1.0;
  const autoCostVacancy = Math.round(monthlyGross * roleMultiplier);
  // Option 3: Headhunter comparison
  const headhunterFee   = Math.round((parseInt(d.avg_salary)||55000) * 0.225); // 22.5% avg provision
  const tmgAnnualCost   = 12960; // Professional Bundle: Professional (490) + Respond (590) = 1.080 EUR/Monat x 12
  const headhunterVsTmg = headhunterFee - tmgAnnualCost;

  const scoreGap        = Math.max(0, 3.8 - d.kn_score);
  const targetScore     = Math.min(5, d.kn_score + scoreGap);
  const appBoost        = Math.round(scoreGap / 0.5 * 20);
  const currentFillDays = parseInt(d.vacancy_days) || 68;
  const improvedFillDays= Math.round(currentFillDays * (1 - appBoost/100 * 0.5));
  const daysSaved       = currentFillDays - improvedFillDays;
  const costPerDay      = autoCostVacancy / 30;
  const savingsPerRole  = daysSaved * costPerDay;
  const totalSavings    = savingsPerRole * (parseInt(d.open_roles)||6);
  const annualSavings   = totalSavings * 2;

  // ── 90-DAY MILESTONES ──────────────────────────────────────────────────────
  const milestones = [
    {
      week:"Woche 1–2", phase:"ONBOARDING", color:C.gold, bg:C.goldLight,
      items:[
        "Vollständiger kununu-Profil-Audit abgeschlossen",
        "Freigabe Texte, Bilder, Benefits durch Mandanten",
        "Kickoff: Antwort-Stil & Tonalität definiert",
        "Bestehende Bewertungen analysiert & priorisiert",
      ],
      kpi:"Profilkomplettierung: Ziel 100%"
    },
    {
      week:"Monat 1", phase:"QUICK WINS", color:C.blue, bg:C.blueLight,
      items:[
        "Profil vollständig überarbeitet & live",
        "Alle offenen Bewertungen beantwortet",
        "Antwortquote von "+d.kn_response+"% → Ziel: 80%+",
        "Erste Bewertungskampagne vorbereitet",
      ],
      kpi:"Antwortquote: Ziel ≥ 80% · Sichtbarkeit spürbar gestiegen"
    },
    {
      week:"Monat 2", phase:"AUFBAU", color:C.orange, bg:C.orangeLight,
      items:[
        "Bewertungskampagne nach Onboarding gestartet",
        "Ziel: +10–15 neue authentische Bewertungen",
        "Monitoring: Neue Reviews innerhalb 48h beantwortet",
        "Zwischenreport: Score-Entwicklung & Feedback",
      ],
      kpi:"Bewertungsanzahl: +10–15 · Score-Trend: steigend"
    },
    {
      week:"Monat 3", phase:"WIRKUNG", color:C.green, bg:C.greenLight,
      items:[
        "Score-Ziel: "+targetScore.toFixed(1)+" (aktuell: "+d.kn_score.toFixed(1)+")",
        "Laufende Bewertungskampagnen nach Projekten & Onboardings",
        "Quartalsweiser Wettbewerbsvergleich vs. "+d.w1name,
        "Kein Review bleibt unbeantwortet – dauerhaft",
      ],
      kpi:"Dauerbetrieb: monatl. Reporting · kein Review unbeantwortet · Score waechst kontinuierlich"
    },
  ];

  // ── AUTO-RECS ───────────────────────────────────────────────────────────────
  const recs = [];
  if(d.kn_response<50) recs.push({prio:"hoch",col:C.red,bg:C.redLight,title:"Antwortquote kritisch – sofort handeln",body:`Nur ${d.kn_response}% der Bewertungen werden beantwortet (Branchenø: ${BM.response}%). Richtwert: ≥80%. Bewerber interpretieren Schweigen als Gleichgültigkeit.`,costs:["Wirkung in 30 Tagen sichtbar","TMG Professional ab sofort"]});
  if(d.kn_reviews<50) recs.push({prio:"hoch",col:C.red,bg:C.redLight,title:`Bewertungsdichte erhöhen (aktuell: ${d.kn_reviews} · Branchenø: ca. 65)`,body:"Weniger als 50 Bewertungen bedeuten statistische Anfälligkeit. Proaktive Kampagnen nach Onboarding, Projekten und Jubiläen schaffen eine stabile Datenbasis.",costs:["Prozess-Setup einmalig","Kampagnen-Management via TMG"]});
  if(d.kn_score<3.5) recs.push({prio:"hoch",col:C.red,bg:C.redLight,title:`Score unter Bewerber-Schwellenwert (${d.kn_score.toFixed(1)} vs. Branchenø ${BM.score.toFixed(1)})`,body:`Ein Score von ${d.kn_score.toFixed(1)} liegt unter 3.8 – dem Mindest-Score, ab dem Kandidaten ernsthaft eine Bewerbung erwägen. Und unter dem Branchendurchschnitt von ${BM.score.toFixed(1)}.`,costs:["Ziel-Score: 3.8+","TMG Starter als Einstieg"]});
  if(d.kn_complete<75) recs.push({prio:"mittel",col:C.orange,bg:C.orangeLight,title:`Profilkomplettierung: ${d.kn_complete}% (Branchenø: ${BM.complete}%)`,body:"Unvollständige Profile wecken kein Vertrauen. Benefits, aktuelle Bilder, Unternehmensvorstellung sollten vollständig sein.",costs:["Einmalig im Starter-Paket"]});
  if(d.kn_recommend<65) recs.push({prio:"mittel",col:C.orange,bg:C.orangeLight,title:`Weiterempfehlung: ${d.kn_recommend}% (Branchenø: ${BM.recommend}%)`,body:"Oft ein Indiz, dass die Außendarstellung nicht das widerspiegelt, was intern positiv erlebt wird. TMG hilft, diese Stärken sichtbar zu machen.",costs:["Content-Strategie","Employer Branding via TMG"]});
  if(d.kn_score < d.w1_score - 0.4) recs.push({prio:"hoch",col:C.red,bg:C.redLight,title:`Aufholjagd: ${d.w1name} führt mit ${d.w1_score.toFixed(1)} vs. Ihrer ${d.kn_score.toFixed(1)}`,body:`Diese Score-Differenz übersetzt sich direkt in Bewerbungsvolumen. Kandidaten, die beide Profile vergleichen, entscheiden sich tendenziell für die stärkere Arbeitgebermarke.`,costs:["6-Monats-Programm empfohlen","Quick Wins in 30 Tagen"]});
  recs.push({prio:"niedrig",col:C.green,bg:C.greenLight,title:"Quartalsweises kununu-Monitoring einrichten",body:"Employer Branding ist kein Einmal-Projekt. TMG liefert quartalsweise einen Benchmark-Report inkl. Wettbewerbsvergleich.",costs:["Im Professional & Enterprise inklusive"]});

  const TABS = [
    {id:"overview",l:"Übersicht"},
    {id:"detail",l:"Profil-Detail"},
    {id:"competition",l:"Wettbewerb"},
    {id:"impact",l:"💶 Impact-Rechner"},
    {id:"roadmap",l:"90-Tage-Plan"},
    {id:"recs",l:"Empfehlungen"},
    {id:"tmg",l:"TMG-Ansatz"},
  ];

  return (
    <div style={{fontFamily:"'Segoe UI',Arial,sans-serif",background:C.offWhite,minHeight:"100vh",color:C.navy}}>

      {/* Header */}
      <div style={{background:C.navy,borderBottom:`3px solid ${C.gold}`,position:"sticky",top:0,zIndex:100}}>
        <div style={{maxWidth:960,margin:"0 auto",padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between",height:54}}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <span style={{fontWeight:900,fontSize:13,color:C.gold,letterSpacing:1}}>TALENT MEDIA GROUP</span>
            <span style={{fontSize:11,color:"#6B7280"}}>kununu Employer Brand Report</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            {d.client&&<span style={{fontSize:12,color:C.gold,fontWeight:600}}>{d.client}</span>}
            <div style={{width:1,height:20,background:"#374151"}}/>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:9,color:"#6B7280",letterSpacing:1}}>KUNUNU INDEX</div>
              <div style={{fontSize:16,fontWeight:900,color:sc(overallIdx,100)}}>{Math.round(overallIdx)}<span style={{fontSize:10,fontWeight:400,color:"#6B7280"}}>/100</span></div>
            </div>
            <button onClick={()=>setEdit(true)} style={{padding:"6px 14px",background:C.gold,color:C.navy,border:"none",borderRadius:5,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>✏ Daten</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{background:C.white,borderBottom:`1px solid ${C.grayLight}`,overflowX:"auto"}}>
        <div style={{maxWidth:960,margin:"0 auto",padding:"0 24px",display:"flex",gap:0,minWidth:"fit-content"}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              style={{padding:"11px 16px",border:"none",borderBottom:tab===t.id?`2px solid ${C.gold}`:"2px solid transparent",
                background:"transparent",color:tab===t.id?C.navy:C.gray,fontWeight:tab===t.id?700:400,
                fontSize:13,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"}}>
              {t.l}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{maxWidth:960,margin:"0 auto",padding:"28px 24px"}}>

        {/* ── OVERVIEW ──────────────────────────────────────────────────────── */}
        {tab==="overview"&&(
          <div>
            <Ey>vertraulich / confidential</Ey>
            <h1 style={{fontSize:26,fontWeight:800,margin:"0 0 2px 0",color:C.navy,fontFamily:"Georgia,serif"}}>{d.client||"Ihr Unternehmen"}</h1>
            <div style={{fontSize:18,fontWeight:800,color:C.gold,marginBottom:4}}>kununu Employer Brand Report</div>
            <Sub>Analyse der kununu-Präsenz inkl. Branchen-Benchmark ({BM.label}), Wettbewerbsvergleich mit {d.w1name} und {d.w2name}, sowie Impact-Berechnung. Stand: {d.date}.</Sub>

            <div style={{background:C.white,border:`1px solid ${C.grayLight}`,borderRadius:8,padding:"12px 16px",marginBottom:20,display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
              {[["Branche",BM.label],["Mitarbeitende",d.size?`ca. ${d.size}`:"–"],["Standort",d.location||"–"],["Ansprechpartner",d.contact||"–"]].map(([l,v])=>(
                <div key={l}><div style={{fontSize:9,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:C.gray,marginBottom:2}}>{l}</div><div style={{fontSize:12,fontWeight:600,color:C.navy}}>{v}</div></div>
              ))}
            </div>

            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
              <StatBox label="kununu Index" value={Math.round(overallIdx)} sub={`Branchenø: ${Math.round(bmIdx)}`} color={sc(overallIdx,100)}/>
              <StatBox label="kununu Score" value={d.kn_score.toFixed(1)} sub={`Branchenø: ${BM.score.toFixed(1)} · ${d.kn_reviews} Bewertungen`} color={sc(d.kn_score)}/>
              <StatBox label="Antwortquote" value={`${d.kn_response}%`} sub={`Branchenø: ${BM.response}%`} color={d.kn_response<BM.response?C.red:C.green}/>
              <StatBox label="Potenzielle Einsparung" value={annualSavings>0?eur(annualSavings):"–"} sub="p.a. durch kürzere Vakanz" color={C.green}/>
            </div>

            {/* Score vs competitors + benchmark */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:12,marginBottom:20}}>
              {[
                {name:d.client||"Mandant",score:d.kn_score,reviews:d.kn_reviews,highlight:true,label:"MANDANT"},
                {name:d.w1name,score:d.w1_score,reviews:d.w1_reviews,note:d.w1_notes,label:"WETTBEWERBER 1"},
                {name:d.w2name,score:d.w2_score,reviews:d.w2_reviews,note:d.w2_notes,label:"WETTBEWERBER 2"},
                {name:`Branchenø ${BM.label}`,score:BM.score,reviews:null,label:"BENCHMARK",isBm:true},
              ].map((item,i)=>(
                <div key={i} style={{background:item.highlight?C.navy:item.isBm?C.blueLight:C.white,border:`2px solid ${item.highlight?C.gold:item.isBm?C.blue:C.grayLight}`,borderRadius:10,padding:16}}>
                  <div style={{fontSize:9,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:item.highlight?C.gold:item.isBm?C.blue:C.gray,marginBottom:4}}>{item.label}</div>
                  <div style={{fontSize:12,fontWeight:700,color:item.highlight?C.white:C.navy,marginBottom:8,lineHeight:1.3}}>{item.name}</div>
                  <div style={{fontSize:32,fontWeight:900,color:sc(item.score),lineHeight:1}}>{item.score.toFixed(1)}</div>
                  <div style={{fontSize:10,color:item.highlight?C.goldLight:item.isBm?C.blue:C.gray,marginBottom:6}}>★ kununu Score{item.reviews?` · ${item.reviews} Bew.`:""}</div>
                  <div style={{height:4,background:item.highlight?"#ffffff22":item.isBm?C.blue+"33":C.grayLight,borderRadius:2,overflow:"hidden"}}>
                    <div style={{width:`${pct(item.score)}%`,height:"100%",background:item.isBm?C.blue:sc(item.score)}}/>
                  </div>
                  {item.note&&<p style={{fontSize:10,color:C.gray,margin:"8px 0 0 0",lineHeight:1.5}}>{item.note}</p>}
                </div>
              ))}
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20}}>
              <div style={{background:C.greenLight,borderRadius:8,padding:16}}>
                <Lbl c={C.green}>Stärken</Lbl>
                {d.strengths.split("\n").filter(Boolean).map((s,i)=>(
                  <div key={i} style={{display:"flex",gap:8,marginBottom:5,fontSize:12,color:"#166534"}}><span style={{fontWeight:700}}>+</span><span>{s}</span></div>
                ))}
              </div>
              <div style={{background:C.redLight,borderRadius:8,padding:16}}>
                <Lbl c={C.red}>Entwicklungsfelder</Lbl>
                {d.gaps.split("\n").filter(Boolean).map((g,i)=>(
                  <div key={i} style={{display:"flex",gap:8,marginBottom:5,fontSize:12,color:"#991B1B"}}><span style={{fontWeight:700}}>!</span><span>{g}</span></div>
                ))}
              </div>
            </div>

            <div style={{background:C.goldLight,border:`1px solid ${C.gold}44`,borderRadius:8,padding:16}}>
              <Lbl>Recruiting-Impact</Lbl>
              <p style={{fontSize:13,color:C.navy,margin:0,lineHeight:1.7}}>
                Bei <strong>{d.open_roles} offenen Stellen</strong> und Ø <strong>{d.vacancy_days} Tagen</strong> Vakanz entstehen monatliche Kosten von ca. <strong style={{color:C.red}}>{eur(parseInt(d.cost_vacancy)*parseInt(d.open_roles))}</strong>. Ein stärkeres kununu-Profil kann die Time-to-Fill um <strong style={{color:C.green}}>bis zu {daysSaved} Tage</strong> senken – das entspricht einer jährlichen Einsparung von <strong style={{color:C.green}}>{eur(annualSavings)}</strong>.
                <span style={{display:"block",marginTop:6,fontSize:12,color:C.gray}}>→ Details im Tab "💶 Impact-Rechner"</span>
              </p>
            </div>
          </div>
        )}

        {/* ── DETAIL ────────────────────────────────────────────────────────── */}
        {tab==="detail"&&(
          <div>
            <Ey>Plattform-Analyse</Ey>
            <H2>kununu Profil im Detail</H2>
            <Sub>Tiefenanalyse aller messbaren Dimensionen inkl. Branchen-Benchmark ({BM.label}).</Sub>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:20}}>
              <div style={{background:C.white,border:`1px solid ${C.grayLight}`,borderRadius:8,padding:20}}>
                <Lbl>Score & Kernkennzahlen</Lbl>
                <div style={{display:"flex",alignItems:"flex-end",gap:8,marginBottom:16}}>
                  <div style={{fontSize:52,fontWeight:900,color:sc(d.kn_score),lineHeight:1}}>{d.kn_score.toFixed(1)}</div>
                  <div style={{paddingBottom:6}}>
                    <div style={{fontSize:12,color:C.gray}}>von 5.0</div>
                    <Tag val={d.kn_score}/>
                    <div style={{fontSize:11,color:C.blue,marginTop:2}}>Branchenø: {BM.score.toFixed(1)}</div>
                  </div>
                </div>
                <Bar value={d.kn_response} max={100} label={`Antwortquote: ${d.kn_response}%`} benchmark={BM.response} benchmarkLabel="Branche"/>
                <Bar value={d.kn_recommend} max={100} label={`Weiterempfehlung: ${d.kn_recommend}%`} benchmark={BM.recommend} benchmarkLabel="Branche"/>
                <Bar value={d.kn_complete} max={100} label={`Profilkomplettierung: ${d.kn_complete}%`} benchmark={BM.complete} benchmarkLabel="Branche"/>
                <div style={{marginTop:10,fontSize:11,color:C.gray}}>
                  <strong style={{color:C.navy}}>{d.kn_reviews}</strong> Bewertungen · Letzter: <strong style={{color:C.navy}}>{d.kn_last||"–"}</strong> · Trend: <strong style={{color:d.kn_trend==="steigend"?C.green:d.kn_trend==="fallend"?C.red:C.orange}}>{d.kn_trend}</strong>
                </div>
              </div>

              <div style={{background:C.white,border:`1px solid ${C.grayLight}`,borderRadius:8,padding:20}}>
                <Lbl>Kategorie-Profil vs. Branchenø</Lbl>
                <div style={{display:"flex",justifyContent:"center",marginBottom:6}}>
                  <MiniRadar data={katVals} labels={KAT_LABELS} benchmark={katBench} size={190}/>
                </div>
                <div style={{display:"flex",gap:16,justifyContent:"center",fontSize:10}}>
                  <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:10,height:2,background:C.gold}}/><span style={{color:C.gray}}>Mandant</span></div>
                  <div style={{display:"flex",alignItems:"center",gap:4}}><div style={{width:10,height:2,background:C.blue,borderTop:"2px dashed "+C.blue}}/><span style={{color:C.gray}}>Branchenø</span></div>
                </div>
                <div style={{fontSize:10,color:C.gray,textAlign:"center",marginTop:4}}>Hauptkritikpunkt: <strong style={{color:C.red}}>{d.kn_top_issue||"–"}</strong></div>
              </div>
            </div>

            <div style={{background:C.white,border:`1px solid ${C.grayLight}`,borderRadius:8,padding:20,marginBottom:14}}>
              <Lbl>Kategorie-Bewertungen vs. Branchenø</Lbl>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 28px"}}>
                {[["Gehalt & Sozialleistungen",d.kat_gehalt,BM.gehalt],["Work-Life-Balance",d.kat_worklife,BM.worklife],["Vorgesetztenverhalten",d.kat_fuehrung,BM.fuehrung],["Kollegenzusammenhalt",d.kat_kolleg,BM.kolleg],["Karriere / Weiterbildung",d.kat_karriere,BM.karriere],["Digitale Sichtbarkeit",d.kat_sicht,BM.sicht]].map(([l,v,bv])=>(
                  <Bar key={l} value={v} label={l} height={7} benchmark={bv} benchmarkLabel="Ø"/>
                ))}
              </div>
            </div>

            {d.kn_response<50&&<Warn level="crit">Antwortquote {d.kn_response}% – deutlich unter Branchenø ({BM.response}%) und Mindeststandard. Sofortmaßnahme erforderlich.</Warn>}
            {d.kn_response>=50&&d.kn_response<BM.response&&<Warn level="warn">Antwortquote {d.kn_response}% liegt unter Branchenø ({BM.response}%). Ziel: ≥ 80%.</Warn>}
            {d.kn_score<BM.score&&<Warn level="crit">Score {d.kn_score.toFixed(1)} liegt unter Branchendurchschnitt ({BM.score.toFixed(1)}). Handlungsbedarf.</Warn>}
            {d.kn_complete<75&&<Warn level="warn">Profilkomplettierung {d.kn_complete}% unter Branchenø ({BM.complete}%).</Warn>}
          </div>
        )}

        {/* ── COMPETITION ───────────────────────────────────────────────────── */}
        {tab==="competition"&&(
          <div>
            <Ey>Wettbewerbsvergleich</Ey>
            <H2>kununu Benchmark</H2>
            <Sub>Direkter Vergleich mit {d.w1name}, {d.w2name} und dem Branchenø {BM.label}.</Sub>

            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:20}}>
              {[
                {n:d.client||"Mandant",idx:overallIdx,score:d.kn_score,hl:true,lbl:"MANDANT"},
                {n:d.w1name,idx:w1Idx,score:d.w1_score,lbl:"WETTBEWERBER 1"},
                {n:d.w2name,idx:w2Idx,score:d.w2_score,lbl:"WETTBEWERBER 2"},
                {n:`Ø ${BM.label}`,idx:bmIdx,score:BM.score,lbl:"BRANCHENØ",isBm:true},
              ].map((item,i)=>(
                <div key={i} style={{background:item.hl?C.navy:item.isBm?C.blueLight:C.white,border:`2px solid ${item.hl?C.gold:item.isBm?C.blue:C.grayLight}`,borderRadius:10,padding:18,textAlign:"center"}}>
                  <div style={{fontSize:9,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:item.hl?C.gold:item.isBm?C.blue:C.gray,marginBottom:5}}>{item.lbl}</div>
                  <div style={{fontSize:12,fontWeight:700,color:item.hl?C.white:C.navy,marginBottom:10,lineHeight:1.3}}>{item.n}</div>
                  <div style={{fontSize:38,fontWeight:900,color:sc(item.idx,100),lineHeight:1}}>{Math.round(item.idx)}</div>
                  <div style={{fontSize:10,color:item.hl?C.goldLight:item.isBm?C.blue:C.gray,marginBottom:8}}>Index · Score: {item.score.toFixed(1)}</div>
                  <div style={{height:5,background:item.hl?"#ffffff22":item.isBm?C.blue+"33":C.grayLight,borderRadius:3,overflow:"hidden"}}>
                    <div style={{width:`${item.idx}%`,height:"100%",background:item.isBm?C.blue:sc(item.idx,100)}}/>
                  </div>
                </div>
              ))}
            </div>

            <div style={{background:C.white,border:`1px solid ${C.grayLight}`,borderRadius:8,overflow:"hidden",marginBottom:16}}>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <thead>
                  <tr style={{background:C.navy}}>
                    <th style={{padding:"10px 12px",textAlign:"left",fontSize:10,fontWeight:700,color:C.gold,letterSpacing:1.5,textTransform:"uppercase"}}>Kriterium</th>
                    {[d.client||"Mandant",d.w1name,d.w2name].map((n,i)=>(
                      <th key={i} style={{padding:"10px 12px",textAlign:"center",fontSize:10,fontWeight:700,color:i===0?C.gold:C.white,letterSpacing:0.5,textTransform:"uppercase"}}>{n}</th>
                    ))}
                    <th style={{padding:"10px 12px",textAlign:"center",fontSize:10,fontWeight:700,color:C.blue,letterSpacing:0.5,textTransform:"uppercase"}}>Branchenø</th>
                  </tr>
                </thead>
                <tbody>
                  <CompRow label="kununu Score" client={d.kn_score} w1={d.w1_score} w2={d.w2_score} bench={BM.score} w1n={d.w1name} w2n={d.w2name} isScore={true}/>
                  <CompRow label="Bewertungen" client={Math.min(100,d.kn_reviews/1.5)} w1={Math.min(100,d.w1_reviews/1.5)} w2={Math.min(100,d.w2_reviews/1.5)} bench={null} w1n={d.w1name} w2n={d.w2name} max={100}/>
                  <CompRow label="Antwortquote" client={d.kn_response} w1={d.w1_response} w2={d.w2_response} bench={BM.response} w1n={d.w1name} w2n={d.w2name} max={100}/>
                  <CompRow label="Weiterempfehlung" client={d.kn_recommend} w1={d.w1_recommend} w2={d.w2_recommend} bench={BM.recommend} w1n={d.w1name} w2n={d.w2name} max={100}/>
                  <CompRow label="Profilkomplettierung" client={d.kn_complete} w1={d.w1_complete} w2={d.w2_complete} bench={BM.complete} w1n={d.w1name} w2n={d.w2name} max={100}/>
                  <CompRow label="kununu Index" client={overallIdx} w1={w1Idx} w2={w2Idx} bench={bmIdx} w1n={d.w1name} w2n={d.w2name} max={100}/>
                </tbody>
              </table>
            </div>

            <div style={{background:C.goldLight,border:`1px solid ${C.gold}44`,borderRadius:8,padding:16}}>
              <Lbl>Benchmark-Einordnung</Lbl>
              <p style={{fontSize:13,color:C.navy,margin:0,lineHeight:1.7}}>
                {d.kn_score<BM.score?`Mit einem Score von ${d.kn_score.toFixed(1)} liegt der Mandant unter dem Branchendurchschnitt (${BM.score.toFixed(1)}). `:""}
                {d.w1_score>d.kn_score+0.4?`${d.w1name} führt mit ${d.w1_score.toFixed(1)} – aktive Profilpflege, ${d.w1_response}% Antwortquote. `:""}
                <strong>{d.client||"Der Mandant"} hat die Substanz – es fehlt die strukturierte Außendarstellung dieser Stärken.</strong>
              </p>
            </div>
          </div>
        )}

        {/* ── IMPACT RECHNER ────────────────────────────────────────────────── */}
        {tab==="impact"&&(
          <div>
            <Ey>Kosten-Impact-Analyse</Ey>
            <H2>Was kostet ein schwaches kununu-Profil wirklich?</H2>
            <Sub>Konkrete Berechnung des finanziellen Impacts – basierend auf Ihren Recruiting-Daten und Marktforschung zu Score-Effekten auf Bewerbungsvolumen.</Sub>

            {/* Definitionen */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:22}}>
              <div style={{background:C.blueLight,border:`1px solid ${C.blue}44`,borderRadius:10,padding:18}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                  <div style={{width:32,height:32,borderRadius:"50%",background:C.blue,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <span style={{fontSize:15,color:C.white}}>T</span>
                  </div>
                  <div style={{fontWeight:800,fontSize:14,color:C.navy}}>Was ist die Vakanzdauer?</div>
                </div>
                <p style={{fontSize:13,color:C.navy,margin:"0 0 10px 0",lineHeight:1.65}}>
                  Die <strong>Vakanzdauer</strong> ist die Anzahl der Tage zwischen Ausschreibung einer Stelle und tatsaechlicher Besetzung durch einen neuen Mitarbeiter. Sie misst, wie lange eine Position unbesetzt bleibt.
                </p>
                <div style={{background:"#ffffff88",borderRadius:6,padding:"8px 12px",marginBottom:10}}>
                  <div style={{fontSize:11,color:C.blue,fontWeight:700,marginBottom:3}}>BEISPIEL</div>
                  <p style={{fontSize:12,color:C.navy,margin:0,lineHeight:1.5}}>Stelle ausgeschrieben am 1. Maerz, Einstellung am 1. Juni = <strong>92 Tage Vakanzdauer</strong>.</p>
                </div>
                <div style={{fontSize:11,color:C.blue,fontWeight:600}}>
                  Branchenø DACH: 60-90 Tage &nbsp;·&nbsp; Ihr Wert: <strong>{d.vacancy_days} Tage</strong>
                </div>
              </div>

              <div style={{background:C.redLight,border:`1px solid ${C.red}44`,borderRadius:10,padding:18}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                  <div style={{width:32,height:32,borderRadius:"50%",background:C.red,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                    <span style={{fontSize:15,color:C.white}}>E</span>
                  </div>
                  <div style={{fontWeight:800,fontSize:14,color:C.navy}}>Was sind Vakanzkosten?</div>
                </div>
                <p style={{fontSize:13,color:C.navy,margin:"0 0 10px 0",lineHeight:1.65}}>
                  <strong>Vakanzkosten</strong> sind alle direkten und indirekten Kosten, die entstehen, solange eine Stelle unbesetzt ist: entgangene Produktivitaet, Mehrbelastung des Teams, Ueberstunden, Qualitaetsverluste und Recruiting-Aufwand.
                </p>
                <div style={{background:"#ffffff88",borderRadius:6,padding:"8px 12px",marginBottom:10}}>
                  <div style={{fontSize:11,color:C.red,fontWeight:700,marginBottom:4}}>WAS ZAEHLT DAZU?</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"3px 10px"}}>
                    {["Entgangene Produktivitaet","Mehrarbeit Kollegen","Ueberstundenzuschlaege","Qualitaetsverluste","Stellenausschreibung","Recruiter-Zeit"].map((item,i)=>(
                      <div key={i} style={{fontSize:11,color:"#991B1B",display:"flex",gap:5}}><span>-</span><span>{item}</span></div>
                    ))}
                  </div>
                </div>
                <div style={{fontSize:11,color:C.red,fontWeight:600}}>
                  Faustregel: 50-150% des Monatsgehalts &nbsp;·&nbsp; Ihr Wert: <strong>{eur(parseInt(d.cost_vacancy))}/Monat</strong>
                </div>
              </div>
            </div>

            {/* Live inputs */}
            <div style={{background:C.white,border:`1px solid ${C.grayLight}`,borderRadius:10,padding:22,marginBottom:20}}>
              <Lbl>Ihre Kennzahlen anpassen</Lbl>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:16}}>
                <NInp label="Offene Stellen" val={d.open_roles} set={v=>set("open_roles",v)}/>
                <NInp label="Ø Vakanz-Dauer (Tage)" val={d.vacancy_days} set={v=>set("vacancy_days",v)}/>
                <NInp label="Ø Jahresgehalt Zielrolle (€)" val={d.avg_salary} set={v=>set("avg_salary",v)} step={1000}/>
              </div>
              <div style={{marginBottom:8}}>
                <Lbl>Rollentyp – bestimmt den Vakanzkosten-Multiplikator</Lbl>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                  {[
                    {label:"Standardrolle",sub:"Sachbearbeiter, Admin",val:0.5},
                    {label:"Fachkraft",sub:"Ingenieur, Specialist",val:1.0},
                    {label:"Senior Fachkraft",sub:"Team Lead, Expert",val:1.5},
                    {label:"Fuehrungskraft",sub:"Manager, Director",val:2.0},
                  ].map(opt=>(
                    <button key={opt.val} onClick={()=>set("role_type",opt.val)}
                      style={{padding:"10px 12px",borderRadius:8,border:`2px solid ${d.role_type===opt.val?C.navy:C.grayLight}`,
                        background:d.role_type===opt.val?C.navy:C.white,cursor:"pointer",textAlign:"left",fontFamily:"inherit"}}>
                      <div style={{fontSize:12,fontWeight:700,color:d.role_type===opt.val?C.gold:C.navy,marginBottom:2}}>{opt.label}</div>
                      <div style={{fontSize:10,color:d.role_type===opt.val?C.goldLight:C.gray}}>{opt.sub}</div>
                      <div style={{fontSize:11,fontWeight:700,color:d.role_type===opt.val?C.gold:C.orange,marginTop:4}}>
                        Faktor {opt.val} = {eur(Math.round((parseInt(d.avg_salary)||55000)/12*opt.val))}/Monat
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div style={{background:C.offWhite,borderRadius:8,padding:"10px 14px",display:"flex",alignItems:"center",gap:12}}>
                <div style={{fontSize:12,color:C.gray}}>Berechnete Vakanzkosten (automatisch):</div>
                <div style={{fontSize:16,fontWeight:800,color:C.red}}>{eur(autoCostVacancy)} / Monat</div>
                <div style={{fontSize:11,color:C.gray}}>({eur(parseInt(d.avg_salary)||55000)} Jahresgehalt ÷ 12 × Faktor {d.role_type})</div>
              </div>
            </div>

            {/* Impact dashboard */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12,marginBottom:20}}>
              <StatBox label="Score-Luecke zu Ziel 3.8" value={scoreGap>0?"+"+scoreGap.toFixed(1):"ok"} sub={`${d.kn_score.toFixed(1)} zu ${targetScore.toFixed(1)}`} color={scoreGap>0?C.red:C.green}/>
              <StatBox label="Mehr Bewerbungen" value={appBoost>0?`+${appBoost}%`:"–"} sub="bei Score 3.8 vs. aktuell" color={C.green}/>
              <StatBox label="Schnellere Besetzung" value={daysSaved>0?`-${daysSaved} Tage`:"–"} sub={`${currentFillDays} zu ${improvedFillDays} Tage`} color={C.green}/>
              <div style={{background:C.redLight,border:`2px solid ${C.red}44`,borderRadius:8,padding:"14px 16px"}}>
                <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:C.red,marginBottom:5}}>Gesamtvakanzkosten / Monat</div>
                <div style={{fontSize:26,fontWeight:900,color:C.red,lineHeight:1}}>{eur(autoCostVacancy*parseInt(d.open_roles))}</div>
                <div style={{fontSize:11,color:C.gray,marginTop:4}}>{d.open_roles} Stellen x {eur(autoCostVacancy)}</div>
              </div>
              <StatBox label="Jaehrl. Einsparung" value={annualSavings>0?eur(annualSavings):"–"} sub="bei aktuellen Vakanzen" color={C.green}/>
            </div>

            {/* Waterfall visual */}
            <div style={{background:C.white,border:`1px solid ${C.grayLight}`,borderRadius:10,padding:22,marginBottom:20}}>
              <Lbl>Wirkungskette: Score → Einsparung</Lbl>
              <div style={{display:"flex",flexDirection:"column",gap:0}}>
                {[
                  {label:"Aktueller kununu-Score",value:d.kn_score.toFixed(1)+" ★",sub:"Ausgangslage",color:sc(d.kn_score),icon:"📍",width:pct(d.kn_score)},
                  {label:"Score-Ziel mit TMG",value:targetScore.toFixed(1)+" ★",sub:"in 3–6 Monaten erreichbar",color:C.green,icon:"🎯",width:pct(targetScore)},
                  {label:"Mehr qualifizierte Bewerbungen",value:"+"+appBoost+"%",sub:"mehr Auswahl → bessere Kandidaten",color:C.blue,icon:"📈",width:Math.min(100,appBoost*2)},
                  {label:"Kürzere Time-to-Fill",value:"-"+daysSaved+" Tage",sub:`${currentFillDays} → ${improvedFillDays} Tage Ø`,color:C.orange,icon:"⏱",width:Math.min(100,daysSaved/currentFillDays*100*3)},
                  {label:"Einsparung je Rolle",value:eur(savingsPerRole),sub:"bei aktuellen Vakanzkosten",color:C.green,icon:"💶",width:Math.min(100,savingsPerRole/d.cost_vacancy*100)},
                  {label:"Jährliche Gesamteinsparung",value:eur(annualSavings),sub:`${d.open_roles} Stellen × 2 Zyklen/Jahr`,color:C.green,icon:"✅",width:100},
                ].map((row,i)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 0",borderBottom:i<5?`1px solid ${C.grayLight}`:"none"}}>
                    <div style={{fontSize:20,width:28,textAlign:"center"}}>{row.icon}</div>
                    <div style={{width:200,flexShrink:0}}>
                      <div style={{fontSize:12,fontWeight:600,color:C.navy}}>{row.label}</div>
                      <div style={{fontSize:11,color:C.gray}}>{row.sub}</div>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{height:10,background:C.grayLight,borderRadius:5,overflow:"hidden"}}>
                        <div style={{width:`${row.width}%`,height:"100%",background:row.color,borderRadius:5,transition:"width 0.6s"}}/>
                      </div>
                    </div>
                    <div style={{width:110,textAlign:"right",fontWeight:800,fontSize:14,color:row.color,flexShrink:0}}>{row.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ROI box – Option 2 + Option 3 */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:16}}>

              {/* Option 2: ROI der TMG-Investition */}
              <div style={{background:C.navy,border:`2px solid ${C.gold}`,borderRadius:10,padding:22}}>
                <Lbl>TMG-Investition vs. Einsparung</Lbl>
                <div style={{display:"flex",flexDirection:"column",gap:10}}>
                  {[
                    {label:"TMG Professional Bundle",value:"1.080 EUR/Monat",sub:"Professional + Respond (490+590)",color:C.gold},
                    {label:"Jaehrliche Investition TMG",value:eur(tmgAnnualCost),sub:"1.080 EUR/Monat x 12 Monate",color:C.gold},
                    {label:"Potenzielle Vakanz-Einsparung",value:annualSavings>0?eur(annualSavings)+" p.a.":"wird berechnet",sub:"durch kuerzere Time-to-Fill",color:C.green},
                    {label:"Nettogewinn p.a.",value:annualSavings>0?eur(annualSavings-tmgAnnualCost):"wird berechnet",sub:annualSavings>tmgAnnualCost?"positiver ROI im 1. Jahr":"Wert individuell pruefen",color:annualSavings>tmgAnnualCost?C.green:C.orange},
                  ].map((row,i)=>(
                    <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:i<3?"1px solid #ffffff11":"none"}}>
                      <div>
                        <div style={{fontSize:11,color:C.gray}}>{row.label}</div>
                        <div style={{fontSize:10,color:"#6B7280"}}>{row.sub}</div>
                      </div>
                      <div style={{fontSize:15,fontWeight:800,color:row.color}}>{row.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Option 3: Headhunter-Vergleich */}
              <div style={{background:C.white,border:`2px solid ${C.grayLight}`,borderRadius:10,padding:22}}>
                <Lbl c={C.navy}>TMG vs. Headhunter – Kostenvergleich</Lbl>
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:11,color:C.gray,marginBottom:8}}>
                    Basis: Jahresgehalt {eur(parseInt(d.avg_salary)||55000)} · Headhunter-Provision: 22,5%
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    <div style={{background:C.redLight,borderRadius:8,padding:"12px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <div style={{fontSize:12,fontWeight:700,color:C.red}}>Headhunter (einmalig je Besetzung)</div>
                        <div style={{fontSize:11,color:C.gray}}>Liefert einen Kandidaten – kein dauerhafter Effekt</div>
                      </div>
                      <div style={{fontSize:18,fontWeight:900,color:C.red}}>{eur(headhunterFee)}</div>
                    </div>
                    <div style={{background:C.greenLight,borderRadius:8,padding:"12px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <div style={{fontSize:12,fontWeight:700,color:C.green}}>TMG (jaehrlicher Retainer)</div>
                        <div style={{fontSize:11,color:C.gray}}>Staerkt dauerhaft alle Kanaele – mehr Bewerber, weniger Abhaengigkeit</div>
                      </div>
                      <div style={{fontSize:18,fontWeight:900,color:C.green}}>{eur(tmgAnnualCost)}</div>
                    </div>
                    <div style={{background:C.navy,borderRadius:8,padding:"12px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <div style={{fontSize:12,fontWeight:700,color:C.gold}}>Vorteil TMG gegenueber Headhunter</div>
                        <div style={{fontSize:11,color:C.goldLight}}>pro Besetzungszyklus</div>
                      </div>
                      <div style={{fontSize:18,fontWeight:900,color:C.gold}}>{headhunterVsTmg>0?eur(headhunterVsTmg):"Ausgeglichen"}</div>
                    </div>
                  </div>
                </div>
                <div style={{fontSize:11,color:C.gray,lineHeight:1.5,padding:"8px 10px",background:C.offWhite,borderRadius:6}}>
                  Ein Headhunter liefert einen Kandidaten. TMG verbessert dauerhaft Ihre Arbeitgebermarke und erhoehlt das organische Bewerbungsvolumen – bei einem Bruchteil der Kosten.
                </div>
              </div>
            </div>

            <div style={{background:C.goldLight,border:`1px solid ${C.gold}44`,borderRadius:8,padding:16}}>
              <div style={{fontSize:11,fontWeight:700,color:C.goldMuted,letterSpacing:1.5,textTransform:"uppercase",marginBottom:8}}>Methodik & Definitionen</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
                <div>
                  <div style={{fontSize:11,fontWeight:700,color:C.navy,marginBottom:4}}>Berechnungsgrundlage</div>
                  <p style={{fontSize:11,color:C.navy,margin:0,lineHeight:1.65}}>
                    Score-Impact: +20% mehr Bewerbungen je 0,5 Punkte Score-Steigerung (basierend auf kununu-Plattformforschung und HR-Studien). 50% dieses Anstiegs fuehren direkt zu kuerzerer Time-to-Fill. Alle Werte sind konservative Schaetzungen.
                  </p>
                </div>
                <div>
                  <div style={{fontSize:11,fontWeight:700,color:C.navy,marginBottom:4}}>Begriffsdefinitionen</div>
                  <p style={{fontSize:11,color:C.navy,margin:"0 0 6px 0",lineHeight:1.65}}>
                    <strong>Vakanzdauer:</strong> Tage zwischen Stellenausschreibung und Einstellung des neuen Mitarbeiters. Branchenø DACH: 60-90 Tage.
                  </p>
                  <p style={{fontSize:11,color:C.navy,margin:0,lineHeight:1.65}}>
                    <strong>Vakanzkosten:</strong> Alle direkten und indirekten Kosten einer unbesetzten Stelle pro Monat (Produktivitaetsverlust, Mehrarbeit, Recruiting). Faustregel: 50-150% des Monatsgehalts der Zielrolle.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 90-DAY ROADMAP ────────────────────────────────────────────────── */}
        {tab==="roadmap"&&(
          <div>
            <Ey>TMG Projektplan</Ey>
            <H2>90+ Tage-Programm für {d.client||"Ihr Unternehmen"}</H2>
            <Sub>Konkrete Meilensteine vom ersten Tag bis zum messbaren Score-Anstieg – und darueber hinaus. Kein interner Aufwand – TMG uebernimmt die Umsetzung als laufendes Programm.</Sub>

            {/* Progress bar */}
            <div style={{background:C.white,border:`1px solid ${C.grayLight}`,borderRadius:10,padding:20,marginBottom:24}}>
              <Lbl>Ziel-Tracking</Lbl>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
                {[
                  {label:"Score-Ziel",from:d.kn_score.toFixed(1),to:targetScore.toFixed(1),unit:"★",color:sc(d.kn_score)},
                  {label:"Antwortquote-Ziel",from:d.kn_response+"%",to:"80%",unit:"",color:d.kn_response<50?C.red:C.orange},
                  {label:"Profil-Ziel",from:d.kn_complete+"%",to:"100%",unit:"",color:sc(d.kn_complete,100)},
                  {label:"Bewertungen-Ziel",from:d.kn_reviews,to:d.kn_reviews+15,unit:"",color:C.green},
                ].map((item,i)=>(
                  <div key={i} style={{background:C.offWhite,borderRadius:8,padding:14,textAlign:"center"}}>
                    <div style={{fontSize:10,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:C.gray,marginBottom:6}}>{item.label}</div>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
                      <span style={{fontSize:16,fontWeight:700,color:item.color}}>{item.from}</span>
                      <span style={{fontSize:14,color:C.gray}}>→</span>
                      <span style={{fontSize:16,fontWeight:700,color:C.green}}>{item.to}{item.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            <div style={{position:"relative"}}>
              {/* Vertical line */}
              <div style={{position:"absolute",left:28,top:40,bottom:40,width:2,background:C.grayLight}}/>
              {milestones.map((m,i)=>(
                <div key={i} style={{display:"flex",gap:20,marginBottom:20,position:"relative"}}>
                  {/* Circle */}
                  <div style={{width:56,height:56,borderRadius:"50%",background:m.bg,border:`3px solid ${m.color}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,zIndex:1}}>
                    <div style={{fontSize:10,fontWeight:900,color:m.color,textAlign:"center",lineHeight:1.2}}>{i+1}</div>
                  </div>
                  {/* Card */}
                  <div style={{flex:1,background:C.white,border:`1px solid ${C.grayLight}`,borderRadius:10,padding:18,borderLeft:`4px solid ${m.color}`}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                      <span style={{fontSize:10,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:m.color}}>{m.week}</span>
                      <span style={{fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:10,background:m.bg,color:m.color}}>{m.phase}</span>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:12}}>
                      {m.items.map((item,j)=>(
                        <div key={j} style={{display:"flex",gap:8,fontSize:12,color:C.navy}}>
                          <span style={{color:m.color,fontWeight:700,flexShrink:0}}>→</span><span>{item}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{background:m.bg,borderRadius:6,padding:"6px 10px",display:"inline-flex",alignItems:"center",gap:6}}>
                      <span style={{fontSize:10,fontWeight:700,color:m.color}}>KPI: {m.kpi}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* After 90 days */}
            <div style={{background:C.navy,border:`2px solid ${C.gold}`,borderRadius:10,padding:22,marginTop:8}}>
              <Lbl>Ab Monat 3+ – Dauerbetrieb & kontinuierliches Wachstum</Lbl>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16}}>
                {[
                  {icon:"★",title:"Score waechst kontinuierlich",body:`Von ${d.kn_score.toFixed(1)} Richtung ${targetScore.toFixed(1)} und darueber hinaus – dauerhaft ueber Branchenoe (${BM.score.toFixed(1)})`},
                  {icon:"↩",title:"Kein Review bleibt unbeantwortet",body:"Jede Bewertung erhaelt eine professionelle Antwort – dauerhaft, nicht nur in den ersten 90 Tagen. Antwortquote Ziel: 100%."},
                  {icon:"📈",title:"Mehr Bewerbungen – Monat fuer Monat",body:`+${appBoost}% Bewerbungsvolumen – und der Effekt verstaerkt sich: je staerker das Profil, desto mehr organische Reichweite.`},
                ].map((item,i)=>(
                  <div key={i} style={{textAlign:"center"}}>
                    <div style={{fontSize:28,marginBottom:8}}>{item.icon}</div>
                    <div style={{fontWeight:700,fontSize:13,color:C.gold,marginBottom:4}}>{item.title}</div>
                    <div style={{fontSize:12,color:"#9CA3AF",lineHeight:1.5}}>{item.body}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── RECS ──────────────────────────────────────────────────────────── */}
        {tab==="recs"&&(
          <div>
            <Ey>Strategische Beurteilung</Ey>
            <H2>Handlungsempfehlungen</H2>
            <Sub>Priorisierte Maßnahmen – automatisch auf Basis Ihrer Daten und dem Branchen-Benchmark ({BM.label}) generiert.</Sub>
            {recs.map((r,i)=>(
              <div key={i} style={{background:C.white,border:`1px solid ${C.grayLight}`,borderRadius:8,padding:18,marginBottom:12}}>
                <div style={{marginBottom:8}}><span style={{fontSize:11,fontWeight:700,padding:"2px 9px",borderRadius:12,background:r.bg,color:r.col}}>{r.prio==="hoch"?"🔴":r.prio==="mittel"?"🟡":"🟢"} Priorität: {r.prio.charAt(0).toUpperCase()+r.prio.slice(1)}</span></div>
                <div style={{fontSize:14,fontWeight:700,color:C.navy,marginBottom:6}}>{r.title}</div>
                <p style={{fontSize:13,color:C.gray,margin:"0 0 10px 0",lineHeight:1.6}}>{r.body}</p>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  {r.costs.map((c,j)=><span key={j} style={{fontSize:11,padding:"2px 10px",borderRadius:10,background:C.offWhite,color:C.navy,border:`1px solid ${C.grayLight}`}}>{c}</span>)}
                </div>
              </div>
            ))}
            <div style={{background:C.navy,borderRadius:8,padding:20,marginTop:8}}>
              <Lbl>Benchmark-Empfehlung</Lbl>
              <p style={{fontSize:13,color:C.white,lineHeight:1.7,margin:0}}>
                {d.w1name} ist das positive Referenzbeispiel in diesem Vergleich. {d.client||"Der Mandant"} liegt mit einem Score von {d.kn_score.toFixed(1)} unter dem Branchenø ({BM.score.toFixed(1)}) und unter dem stärksten Wettbewerber ({d.w1_score.toFixed(1)}).{" "}
                <strong style={{color:C.gold}}>Die Substanz ist da – TMG bringt sie nach außen.</strong>
              </p>
            </div>
          </div>
        )}

        {/* ── TMG ───────────────────────────────────────────────────────────── */}
        {tab==="tmg"&&(
          <div>
            <Ey>Talent Media Group · Unser Ansatz</Ey>
            <H2>Unser Ansatz für {d.client||"Sie"}</H2>
            <Sub>So schließt TMG die identifizierten Lücken – strukturiert, messbar, ohne internen Aufwand für Sie.</Sub>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,marginBottom:24}}>
              {[
                {icon:"★",t:"Profil-Optimierung",b:"Vollständige Überarbeitung des kununu-Profils: Beschreibung, Benefits, Bilder, Unternehmenskultur – alles aktuell und überzeugend."},
                {icon:"↩",t:"Aktives Bewertungsmanagement",b:"Professionelle Antworten auf jede Bewertung. Kein Review bleibt unbeantwortet. Schnell, konsistent, markengerecht."},
                {icon:"↗",t:"Bewertungskampagnen",b:"Proaktive Kampagnen nach Onboarding, Jubiläen und Projekten steigern Bewertungsdichte und Score systematisch."},
              ].map((c,i)=>(
                <div key={i} style={{background:C.white,border:`1px solid ${C.grayLight}`,borderRadius:8,padding:18}}>
                  <div style={{fontSize:24,marginBottom:10}}>{c.icon}</div>
                  <div style={{fontWeight:700,fontSize:14,color:C.navy,marginBottom:6}}>{c.t}</div>
                  <p style={{fontSize:12,color:C.gray,margin:0,lineHeight:1.6}}>{c.b}</p>
                </div>
              ))}
            </div>

            {/* Paket-Erklärung */}
            <div style={{background:C.goldLight,border:`1px solid ${C.gold}44`,borderRadius:8,padding:"12px 16px",marginBottom:16}}>
              <p style={{fontSize:12,color:C.navy,margin:0,lineHeight:1.6}}>
                Alle TMG-Pakete kombinieren <strong>Profilpflege</strong> und <strong>Bewertungsmanagement</strong> als separate Module – jederzeit monatlich kündbar. Einmalige Setup-Fee je nach Unternehmensgrösse beim Start.
              </p>
            </div>

            {/* PROFILPFLEGE */}
            <div style={{background:C.navy,borderRadius:"8px 8px 0 0",padding:"8px 14px",marginBottom:0}}>
              <span style={{fontSize:11,fontWeight:700,color:C.gold,letterSpacing:1}}>PROFILPFLEGE</span>
              <span style={{fontSize:10,color:C.white,marginLeft:8}}>monatlich kuendbar · kein Bewertungsmanagement</span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,marginBottom:20}}>
              {[
                {tier:"STARTER",sub:"Basis",price:"290",items:[
                  "Bis zu 2 Profil-Aenderungen/Monat",
                  "Stellensynchronisierung",
                  "Quarterly Reporting",
                ],badge:"Kein Bewertungsmanagement",hl:false},
                {tier:"PROFESSIONAL",sub:"Pflege & Optimierung",price:"490",items:[
                  "Bis zu 5 Profil-Aenderungen/Monat",
                  "Stellensynchronisierung",
                  "Monthly Reporting",
                  "Wettbewerbsanalyse quartalsweise",
                  "Priority Support 48h",
                ],badge:"Bewertungsmanagement separat",hl:true},
                {tier:"PREMIUM",sub:"Full-Service",price:"790",items:[
                  "Bis zu 10 Profil-Aenderungen/Monat",
                  "Stellensynchronisierung",
                  "Monthly Reporting + Strategy Call",
                  "Wettbewerbsanalyse monatlich",
                  "Priority Support 24h",
                  "Employer Brand Blueprint Pflege",
                ],badge:"Bewertungsmanagement separat",hl:false},
                {tier:"ENTERPRISE",sub:"Auf Anfrage",price:null,items:[
                  "Dedizierter Account Manager",
                  "Unlimitierte Aenderungen",
                  "Weekly Reporting",
                  "Strategisches Quarterly Review",
                  "Multi-Standort Management",
                ],badge:"Bewertungsmanagement separat",hl:false},
              ].map((p,i)=>(
                <div key={i} style={{background:p.hl?C.navy:C.white,border:`2px solid ${p.hl?C.gold:C.grayLight}`,borderRadius:"0 0 8px 8px",padding:"14px 14px",display:"flex",flexDirection:"column"}}>
                  <div style={{marginBottom:8}}>
                    <div style={{fontSize:9,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:p.hl?C.gold:C.gray,marginBottom:2}}>{p.tier}</div>
                    <div style={{fontSize:11,color:p.hl?C.goldLight:C.gray,marginBottom:8}}>{p.sub}</div>
                    {p.price
                      ? <div style={{fontSize:22,fontWeight:900,color:p.hl?C.gold:C.navy,marginBottom:10}}>{p.price} <span style={{fontSize:11,fontWeight:400}}>€/Mo</span></div>
                      : <div style={{fontSize:18,fontWeight:900,color:C.navy,marginBottom:10}}>Auf Anfrage</div>
                    }
                  </div>
                  <div style={{flex:1}}>
                    {p.items.map((item,j)=>(
                      <div key={j} style={{display:"flex",gap:6,marginBottom:4,fontSize:11,color:p.hl?C.white:C.gray}}>
                        <span style={{color:C.green,flexShrink:0}}>✓</span><span>{item}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{marginTop:10,padding:"5px 8px",borderRadius:4,background:p.hl?"#ffffff22":C.blueLight,fontSize:10,color:p.hl?C.goldLight:C.blue}}>
                    {p.badge}
                  </div>
                </div>
              ))}
            </div>

            {/* BEWERTUNGSMANAGEMENT */}
            <div style={{background:C.navy,borderRadius:"8px 8px 0 0",padding:"8px 14px",marginBottom:0}}>
              <span style={{fontSize:11,fontWeight:700,color:C.gold,letterSpacing:1}}>BEWERTUNGSMANAGEMENT</span>
              <span style={{fontSize:10,color:C.white,marginLeft:8}}>monatlich kuendbar · auf jedes Profil zubuchbar</span>
            </div>
            <div style={{background:C.goldLight,border:`1px solid ${C.gold}33`,borderRadius:"0 0 0 0",padding:"10px 14px",marginBottom:0}}>
              <p style={{fontSize:11,color:C.navy,margin:0,fontStyle:"italic"}}>Kandidaten lesen nicht nur die Bewertung – sie lesen die Antwort. Wie ein Unternehmen mit Kritik umgeht, ist das staerkste Signal fuer Unternehmenskultur. <strong>Employer Telling Studie 2025</strong></p>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:20}}>
              {[
                {tier:"MONITOR",sub:"Ueberblick behalten",price:"290",antworten:"Bis zu 2 / Monat",sla:null,items:[
                  "Monitoring aller Bewertungen",
                  "Alert bei 1-2-Sterne-Reviews",
                  "Monatliches Bewertungs-Summary",
                  "Handlungsempfehlungen",
                ],hl:false},
                {tier:"RESPOND",sub:"Aktiv reagieren",price:"590",antworten:"Bis zu 10 / Monat",sla:"SLA: 48h Response",items:[
                  "Bis zu 10 KI-gestuetzte Antworten/Monat",
                  "Tonalitaet nach eurer CI",
                  "Monitoring + Alerts inklusive",
                  "Monatliches Reporting",
                ],hl:true},
                {tier:"MANAGE",sub:"Reputation aktiv steuern",price:"990",antworten:"Unlimitierte Antworten",sla:"SLA: 24h Response",items:[
                  "Unlimitierte Antworten",
                  "Proaktive Review-Kampagne",
                  "Reputationsstrategie & Beratung",
                  "Monitoring + Alerts inklusive",
                  "Monthly Review-Report",
                ],hl:false},
              ].map((p,i)=>(
                <div key={i} style={{background:p.hl?C.navy:C.white,border:`2px solid ${p.hl?C.gold:C.grayLight}`,borderRadius:"0 0 8px 8px",padding:"14px 14px"}}>
                  <div style={{fontSize:9,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:p.hl?C.gold:C.gray,marginBottom:2}}>{p.tier}</div>
                  <div style={{fontSize:11,color:p.hl?C.goldLight:C.gray,marginBottom:8}}>{p.sub}</div>
                  <div style={{fontSize:22,fontWeight:900,color:p.hl?C.gold:C.navy,marginBottom:10}}>{p.price} <span style={{fontSize:11,fontWeight:400}}>€/Mo</span></div>
                  <div style={{background:p.hl?"#ffffff22":C.offWhite,borderRadius:6,padding:"7px 10px",marginBottom:10}}>
                    <div style={{fontSize:9,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",color:p.hl?C.gold:C.gray,marginBottom:2}}>ANTWORTEN INKLUSIVE</div>
                    <div style={{fontSize:13,fontWeight:700,color:p.hl?C.white:C.navy}}>{p.antworten}</div>
                  </div>
                  {p.sla&&<div style={{display:"inline-block",fontSize:10,fontWeight:700,padding:"3px 8px",borderRadius:12,background:C.green,color:C.white,marginBottom:10}}>{p.sla}</div>}
                  {p.items.map((item,j)=>(
                    <div key={j} style={{display:"flex",gap:6,marginBottom:4,fontSize:11,color:p.hl?C.white:C.gray}}>
                      <span style={{color:C.green,flexShrink:0}}>✓</span><span>{item}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Setup-Fee + Bundle-Szenarien */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:20}}>
              {/* Setup-Fee */}
              <div style={{background:C.white,border:`1px solid ${C.grayLight}`,borderRadius:8,padding:18}}>
                <Lbl c={C.navy}>Einmalige Setup-Fee</Lbl>
                <p style={{fontSize:12,color:C.gray,margin:"0 0 12px 0",lineHeight:1.5}}>Einmalig beim Start – deckt Audit, Ersteinrichtung, CI-Umsetzung und Freigabeprozess ab.</p>
                {[
                  {size:"bis 250 MA",price:"490 €"},
                  {size:"251–1.000 MA",price:"890 €"},
                  {size:"ab 1.001 MA",price:"1.290 €"},
                ].map((row,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:i<2?`1px solid ${C.grayLight}`:"none"}}>
                    <span style={{fontSize:12,color:C.gray}}>{row.size}</span>
                    <span style={{fontSize:13,fontWeight:700,color:C.navy}}>{row.price}</span>
                  </div>
                ))}
              </div>

              {/* Bundle-Szenarien */}
              <div style={{background:C.white,border:`1px solid ${C.grayLight}`,borderRadius:8,padding:18}}>
                <Lbl c={C.navy}>Typische Kombinations-Pakete</Lbl>
                {[
                  {name:"Einstieg",combo:"Basis + Monitor",price:"580 €/Mo",sub:"Ideal zum Start",color:C.gray},
                  {name:"Professional",combo:"Professional + Respond",price:"1.080 €/Mo",sub:"Meistgewählt",color:C.gold,hl:true},
                  {name:"Enterprise",combo:"Premium + Manage",price:"1.780 €/Mo",sub:"Vollständige Abdeckung",color:C.navy},
                ].map((b,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 10px",borderRadius:6,background:b.hl?C.goldLight:C.offWhite,marginBottom:6,border:b.hl?`1px solid ${C.gold}44`:"none"}}>
                    <div>
                      <div style={{fontSize:12,fontWeight:700,color:C.navy}}>{b.name} <span style={{fontSize:10,fontWeight:400,color:C.gray}}>({b.combo})</span></div>
                      <div style={{fontSize:10,color:C.gray}}>{b.sub}</div>
                    </div>
                    <div style={{fontSize:14,fontWeight:900,color:b.hl?C.goldMuted:C.navy}}>{b.price}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{background:`linear-gradient(135deg,${C.navy} 0%,${C.navyMid} 100%)`,border:`2px solid ${C.gold}`,borderRadius:10,padding:28,textAlign:"center"}}>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:2,color:C.gold,marginBottom:8}}>NÄCHSTER SCHRITT</div>
              <div style={{fontSize:20,fontWeight:800,color:C.white,marginBottom:8}}>TMG übernimmt – von heute an.</div>
              <p style={{fontSize:13,color:"#9CA3AF",maxWidth:480,margin:"0 auto",lineHeight:1.6}}>
                Dieser Report zeigt, wo {d.client||"Ihr Unternehmen"} auf kununu Bewerber verliert – und was das kostet. TMG schließt diese Lücken strukturiert, messbar und nachhaltig.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── EDIT DRAWER ───────────────────────────────────────────────────────── */}
      {edit&&(
        <>
          <div onClick={()=>setEdit(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.3)",zIndex:999}}/>
          <div style={{position:"fixed",top:0,right:0,width:340,height:"100vh",background:C.white,boxShadow:"-4px 0 20px rgba(0,0,0,0.15)",zIndex:1000,overflowY:"auto",padding:22}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
              <div style={{fontWeight:700,fontSize:15,color:C.navy}}>Daten eingeben</div>
              <button onClick={()=>setEdit(false)} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:C.gray}}>×</button>
            </div>

            <Lbl>MANDANT</Lbl>
            <Inp label="Unternehmen" val={d.client} set={v=>set("client",v)}/>
            <Inp label="Ansprechpartner" val={d.contact} set={v=>set("contact",v)}/>
            <Inp label="Branche (Anzeige)" val={d.industry} set={v=>set("industry",v)}/>
            <Sel label="Branchen-Benchmark" val={d.branch} set={v=>set("branch",v)} opts={Object.entries(BENCHMARKS).map(([k,v])=>({v:k,l:v.label}))}/>
            <NInp label="Mitarbeitende" val={d.size} set={v=>set("size",v)}/>
            <Inp label="Standort" val={d.location} set={v=>set("location",v)}/>
            <Inp label="Datum" val={d.date} set={v=>set("date",v)}/>

            <Div/>
            <Lbl>WETTBEWERBER</Lbl>
            <Inp label="Wettbewerber 1 Name" val={d.w1name} set={v=>set("w1name",v)}/>
            <Inp label="Wettbewerber 2 Name" val={d.w2name} set={v=>set("w2name",v)}/>

            <Div/>
            <Lbl>RECRUITING-KONTEXT</Lbl>
            <NInp label="Offene Stellen" val={d.open_roles} set={v=>set("open_roles",v)}/>
            <NInp label="Ø Vakanz-Dauer (Tage)" val={d.vacancy_days} set={v=>set("vacancy_days",v)}/>
            <NInp label="Monatl. Vakanzkosten (€)" val={d.cost_vacancy} set={v=>set("cost_vacancy",v)} step={500}/>
            <NInp label="Ø Jahresgehalt Zielrolle (€)" val={d.avg_salary} set={v=>set("avg_salary",v)} step={1000}/>

            <Div/>
            <Lbl>KUNUNU – MANDANT</Lbl>
            <Sld label="Score (0–5)" val={d.kn_score} set={v=>set("kn_score",v)}/>
            <NInp label="Anzahl Bewertungen" val={d.kn_reviews} set={v=>set("kn_reviews",v)}/>
            <NInp label="Antwortquote (%)" val={d.kn_response} set={v=>set("kn_response",v)} max={100}/>
            <NInp label="Weiterempfehlung (%)" val={d.kn_recommend} set={v=>set("kn_recommend",v)} max={100}/>
            <NInp label="Profilkomplettierung (%)" val={d.kn_complete} set={v=>set("kn_complete",v)} max={100}/>
            <Inp label="Letzter Review" val={d.kn_last} set={v=>set("kn_last",v)} ph="z.B. vor 2 Wochen"/>
            <Inp label="Hauptkritikpunkt" val={d.kn_top_issue} set={v=>set("kn_top_issue",v)}/>
            <Inp label="Score-Trend" val={d.kn_trend} set={v=>set("kn_trend",v)} ph="steigend / stagnierend / fallend"/>

            <Div/>
            <Lbl>KATEGORIEN – MANDANT (0–5)</Lbl>
            <Sld label="Gehalt & Sozialleistungen" val={d.kat_gehalt} set={v=>set("kat_gehalt",v)}/>
            <Sld label="Work-Life-Balance" val={d.kat_worklife} set={v=>set("kat_worklife",v)}/>
            <Sld label="Vorgesetztenverhalten" val={d.kat_fuehrung} set={v=>set("kat_fuehrung",v)}/>
            <Sld label="Kollegenzusammenhalt" val={d.kat_kolleg} set={v=>set("kat_kolleg",v)}/>
            <Sld label="Karriere / Weiterbildung" val={d.kat_karriere} set={v=>set("kat_karriere",v)}/>
            <Sld label="Digitale Sichtbarkeit" val={d.kat_sicht} set={v=>set("kat_sicht",v)}/>

            <Div/>
            <Lbl>KUNUNU – {d.w1name}</Lbl>
            <Sld label="Score" val={d.w1_score} set={v=>set("w1_score",v)}/>
            <NInp label="Bewertungen" val={d.w1_reviews} set={v=>set("w1_reviews",v)}/>
            <NInp label="Antwortquote (%)" val={d.w1_response} set={v=>set("w1_response",v)} max={100}/>
            <NInp label="Weiterempfehlung (%)" val={d.w1_recommend} set={v=>set("w1_recommend",v)} max={100}/>
            <NInp label="Profilkomplettierung (%)" val={d.w1_complete} set={v=>set("w1_complete",v)} max={100}/>
            <Inp label="Charakter / Notiz" val={d.w1_notes} set={v=>set("w1_notes",v)}/>

            <Div/>
            <Lbl>KUNUNU – {d.w2name}</Lbl>
            <Sld label="Score" val={d.w2_score} set={v=>set("w2_score",v)}/>
            <NInp label="Bewertungen" val={d.w2_reviews} set={v=>set("w2_reviews",v)}/>
            <NInp label="Antwortquote (%)" val={d.w2_response} set={v=>set("w2_response",v)} max={100}/>
            <NInp label="Weiterempfehlung (%)" val={d.w2_recommend} set={v=>set("w2_recommend",v)} max={100}/>
            <NInp label="Profilkomplettierung (%)" val={d.w2_complete} set={v=>set("w2_complete",v)} max={100}/>
            <Inp label="Charakter / Notiz" val={d.w2_notes} set={v=>set("w2_notes",v)}/>

            <Div/>
            <Lbl>STÄRKEN & LÜCKEN</Lbl>
            <div style={{marginBottom:12}}>
              <Lbl>Stärken (je Zeile eine)</Lbl>
              <textarea value={d.strengths} onChange={e=>set("strengths",e.target.value)} rows={4}
                style={{width:"100%",padding:"7px 10px",border:`1px solid ${C.grayLight}`,borderRadius:6,fontSize:12,resize:"vertical",fontFamily:"inherit",boxSizing:"border-box"}}/>
            </div>
            <div style={{marginBottom:12}}>
              <Lbl>Entwicklungsfelder (je Zeile eine)</Lbl>
              <textarea value={d.gaps} onChange={e=>set("gaps",e.target.value)} rows={4}
                style={{width:"100%",padding:"7px 10px",border:`1px solid ${C.grayLight}`,borderRadius:6,fontSize:12,resize:"vertical",fontFamily:"inherit",boxSizing:"border-box"}}/>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
