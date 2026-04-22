import { useState, useEffect } from "react";

const C = {
  blue: "#7C3AED",           // Brand Purple
  dark: "#0D0E1A",           // Dark Navy Background
  card: "rgba(255,255,255,0.04)",
  border: "rgba(255,255,255,0.08)",
  accent: "#A78BFA",         // Light Purple Accent
  muted: "#94A3B8",
  dim: "#4A5568",
  dimmer: "#2D3748",
  dimmest: "#1A202C",
};
function readUrlState() {
  try {
    const p = new URLSearchParams(window.location.search);
    if (p.get("r") && p.get("fw") && p.get("meth")) {
      const answers = decodeAnswers(p.get("r"));
      const framework = p.get("fw");
      const methodology = decodeURIComponent(p.get("meth"));
      if (answers && framework && methodology) return { answers, framework, methodology };
    }
  } catch {}
  return null;
}

const questions = [
  { id: "deal_complexity", text: "How complex are your typical deals?", subtext: "Think about the number of decision-makers and steps involved.",
    options: [{ label: "Simple — 1–2 people, quick close", value: "simple" }, { label: "Moderate — small buying committee, weeks", value: "moderate" }, { label: "Complex — large committee, months", value: "complex" }, { label: "Enterprise — C-suite, quarters to years", value: "enterprise" }] },
  { id: "avg_deal_size", text: "What's your average contract value?", subtext: "This shapes how much discovery investment is justified.",
    options: [{ label: "Under $10K", value: "small" }, { label: "$10K – $50K", value: "mid" }, { label: "$50K – $250K", value: "large" }, { label: "$250K+", value: "enterprise" }] },
  { id: "buyer_motivation", text: "What primarily drives your buyers to act?", subtext: "Understanding buyer psychology shapes your methodology.",
    options: [{ label: "They have a clear, urgent pain to solve", value: "pain" }, { label: "They're chasing a strategic goal or metric", value: "goal" }, { label: "They need to prove ROI to finance", value: "roi" }, { label: "A competitive pressure or market event", value: "competitive" }] },
  { id: "sales_cycle", text: "How long is your typical sales cycle?", subtext: "Cycle length determines how much process structure you need.",
    options: [{ label: "Days to 2 weeks", value: "fast" }, { label: "2 weeks – 2 months", value: "medium" }, { label: "2–6 months", value: "long" }, { label: "6+ months", value: "verylong" }] },
  { id: "competitive_intensity", text: "How competitive is your market?", subtext: "Competition level affects how much you need to control the narrative.",
    options: [{ label: "We're often the only option considered", value: "low" }, { label: "2–3 competitors in most deals", value: "moderate" }, { label: "Heavy — 5+ players, always in bake-offs", value: "high" }, { label: "Extreme — competing against build-vs-buy too", value: "extreme" }] },
  { id: "champion_access", text: "Do your reps typically have access to a champion inside accounts?", subtext: "A champion is someone who sells for you when you're not in the room.",
    options: [{ label: "Rarely — we sell top-down", value: "rarely" }, { label: "Sometimes — depends on the deal", value: "sometimes" }, { label: "Usually — we deliberately build them", value: "usually" }, { label: "Always — our model depends on it", value: "always" }] },
  { id: "rep_experience", text: "What's the experience level of your sales team?", subtext: "Some methodologies require more sophistication to execute well.",
    options: [{ label: "Mostly new reps (<2 yrs experience)", value: "junior" }, { label: "Mix of junior and mid-level", value: "mixed" }, { label: "Experienced (3–7 yrs average)", value: "experienced" }, { label: "Elite enterprise sellers (7+ yrs)", value: "elite" }] },
  { id: "biggest_loss_reason", text: "Why do you most commonly lose deals?", subtext: "Your loss pattern reveals your methodology gap.",
    options: [{ label: "No decision / status quo wins", value: "nodecision" }, { label: "Lost to a competitor on value perception", value: "competitor" }, { label: "Budget or economic buyer wasn't aligned", value: "budget" }, { label: "We didn't control the evaluation process", value: "process" }] },
];

const FW = {
  MEDPICC: {
    tagline: "Metrics · Economic Buyer · Decision Criteria · Decision Process · Identify Pain · Champion · Competition · Paper Process",
    description: "The gold standard for complex enterprise B2B. MEDPICC gives your team a rigorous, shared language to qualify opportunities and forecast with confidence. Every CRM field maps to a MEDPICC letter.",
    fits: ["Complex multi-stakeholder deals", "Long enterprise cycles", "High-ACV opportunities", "Competitive bake-offs"],
    voxintel: "Voxintel automatically surfaces MEDPICC signals from every call — flagging when Economic Buyers are mentioned, tracking whether Decision Criteria have been exchanged, and alerting managers when champion access is weak.",
  },
  MEDDIC: {
    tagline: "Metrics · Economic Buyer · Decision Criteria · Decision Process · Identify Pain · Champion",
    description: "The original enterprise qualification framework. Slightly lighter than MEDPICC — ideal for teams moving from BANT who need more rigor without full enterprise complexity.",
    fits: ["Mid-market to enterprise", "2–6 month cycles", "Teams new to structured qualification"],
    voxintel: "Voxintel tracks MEDDIC completion scores per deal, surfaces unasked discovery questions, and coaches reps in real-time when key elements go unaddressed.",
  },
  BANT: {
    tagline: "Budget · Authority · Need · Timeline",
    description: "The foundational qualification framework. Fast and simple — ideal for high-velocity sales with shorter cycles. Less suited for complex deals where buying processes are non-linear.",
    fits: ["Short sales cycles", "Lower ACV", "Transactional or product-led sales", "Junior teams"],
    voxintel: "Voxintel scores BANT elements from discovery calls and flags incomplete qualification before deals advance in your pipeline.",
  },
  CHAMP: {
    tagline: "Challenges · Authority · Money · Prioritization",
    description: "A modern evolution of BANT that leads with the buyer's challenges rather than your budget questions. Better buyer experience, same qualification rigor.",
    fits: ["Consultative environments", "Mid-market deals", "Challenger-style selling motions"],
    voxintel: "Voxintel detects challenge language in calls and scores how deeply reps are probing before jumping to solution mode.",
  },
};

const METH = {
  "Solution Selling": {
    tagline: "Diagnose the pain. Prescribe the solution.",
    description: "Reps act as consultants — leading with deep discovery of business pain, then connecting your product's capabilities directly to that pain. The buyer feels understood, not sold to.",
    fits: ["Pain-driven buyers", "Technical products with multiple use cases", "Consultative rep profiles"],
    voxintel: "Voxintel monitors the ratio of discovery talk-time to solution talk-time — coaching reps who pitch too early and reinforcing the behaviours of top performers.",
  },
  "Challenger Sale": {
    tagline: "Teach. Tailor. Take Control.",
    description: "Challenger reps reshape how buyers think about their problem. By introducing insights the buyer hadn't considered, they create urgency, differentiate from competitors, and drive deals forward.",
    fits: ["Competitive markets", "Status quo losses", "Experienced rep teams", "Products with non-obvious value"],
    voxintel: "Voxintel identifies whether reps are leading with insight or reacting to buyer frames — and scores teaching moments in calls.",
  },
  "SPIN Selling": {
    tagline: "Ask better questions. Win bigger deals.",
    description: "Structures discovery around Situation, Problem, Implication, and Need-Payoff questions. Reps who master SPIN create buyer-led momentum — buyers articulate their own pain and the value of solving it.",
    fits: ["Consultative sales", "ROI-sensitive buyers", "Mid-market cycles", "Teams building discovery discipline"],
    voxintel: "Voxintel tracks question type distribution across calls — flagging reps who over-index on Situation questions.",
  },
  "Value Selling": {
    tagline: "Quantify the gap. Sell the outcome.",
    description: "Anchors every conversation in business outcomes and ROI. Reps work with buyers to quantify the cost of inaction and the financial impact of your solution.",
    fits: ["ROI-driven buyers", "Finance-influenced decisions", "High ACV deals", "Economic buyer access"],
    voxintel: "Voxintel surfaces ROI language and outcome mentions in calls, prompting reps to quantify value when discovery reveals financial pain.",
  },
  "Consultative Selling": {
    tagline: "Become the trusted advisor.",
    description: "Positions reps as long-term partners, not vendors. Deep industry knowledge, zero-pressure discovery, and genuine alignment with buyer goals create trust that closes deals and expands accounts.",
    fits: ["Complex enterprise deals", "Long relationship cycles", "Strategic accounts", "Elite rep profiles"],
    voxintel: "Voxintel coaches reps on advisor language patterns, flags when conversations become too transactional, and tracks sentiment across the full buying journey.",
  },
  "Inbound Sales": {
    tagline: "Meet buyers where they are.",
    description: "Aligns your process to the buyer's journey — personalizing outreach based on content engagement, identifying intent signals, and guiding prospects who have already raised their hand.",
    fits: ["High-volume, short cycles", "Product-led growth motions", "Marketing-aligned teams"],
    voxintel: "Voxintel connects conversation data to inbound signals — surfacing which content topics resonate most in early calls and feeding that back to marketing.",
  },
};

function scoreAnswers(a) {
  const fw = { MEDPICC: 0, MEDDIC: 0, BANT: 0, CHAMP: 0 };
  const meth = { "Solution Selling": 0, "Challenger Sale": 0, "SPIN Selling": 0, "Value Selling": 0, "Consultative Selling": 0, "Inbound Sales": 0 };
  if (a.deal_complexity === "enterprise") { fw.MEDPICC += 5; meth["Challenger Sale"] += 3; meth["Consultative Selling"] += 3; }
  if (a.deal_complexity === "complex")   { fw.MEDPICC += 4; fw.MEDDIC += 2; meth["Solution Selling"] += 3; }
  if (a.deal_complexity === "moderate")  { fw.MEDDIC += 3; fw.CHAMP += 2; meth["SPIN Selling"] += 3; }
  if (a.deal_complexity === "simple")    { fw.BANT += 4; meth["Inbound Sales"] += 3; }
  if (a.avg_deal_size === "enterprise")  { fw.MEDPICC += 4; meth["Value Selling"] += 4; meth["Consultative Selling"] += 3; }
  if (a.avg_deal_size === "large")       { fw.MEDPICC += 3; fw.MEDDIC += 2; meth["Solution Selling"] += 3; }
  if (a.avg_deal_size === "mid")         { fw.MEDDIC += 2; fw.CHAMP += 2; meth["SPIN Selling"] += 2; }
  if (a.avg_deal_size === "small")       { fw.BANT += 3; meth["Inbound Sales"] += 3; }
  if (a.buyer_motivation === "pain")        { meth["Solution Selling"] += 4; meth["SPIN Selling"] += 3; }
  if (a.buyer_motivation === "goal")        { meth["Challenger Sale"] += 3; meth["Consultative Selling"] += 3; }
  if (a.buyer_motivation === "roi")         { meth["Value Selling"] += 5; fw.MEDPICC += 2; }
  if (a.buyer_motivation === "competitive") { meth["Challenger Sale"] += 4; fw.MEDPICC += 3; }
  if (a.sales_cycle === "verylong") { fw.MEDPICC += 4; meth["Consultative Selling"] += 3; }
  if (a.sales_cycle === "long")     { fw.MEDPICC += 3; fw.MEDDIC += 2; meth["Solution Selling"] += 2; }
  if (a.sales_cycle === "medium")   { fw.MEDDIC += 2; fw.CHAMP += 2; meth["SPIN Selling"] += 2; }
  if (a.sales_cycle === "fast")     { fw.BANT += 3; meth["Inbound Sales"] += 4; }
  if (a.competitive_intensity === "extreme")  { fw.MEDPICC += 4; meth["Challenger Sale"] += 4; }
  if (a.competitive_intensity === "high")     { fw.MEDPICC += 3; meth["Challenger Sale"] += 3; }
  if (a.competitive_intensity === "moderate") { fw.MEDDIC += 2; meth["Solution Selling"] += 2; }
  if (a.competitive_intensity === "low")      { fw.BANT += 2; meth["Consultative Selling"] += 2; }
  if (a.champion_access === "always")    { fw.MEDPICC += 4; }
  if (a.champion_access === "usually")   { fw.MEDPICC += 3; fw.MEDDIC += 2; }
  if (a.champion_access === "sometimes") { fw.MEDDIC += 2; fw.CHAMP += 1; }
  if (a.champion_access === "rarely")    { fw.BANT += 1; meth["Challenger Sale"] += 2; }
  if (a.rep_experience === "elite")       { meth["Challenger Sale"] += 3; meth["Consultative Selling"] += 3; }
  if (a.rep_experience === "experienced") { meth["Solution Selling"] += 3; meth["SPIN Selling"] += 2; }
  if (a.rep_experience === "mixed")       { meth["Solution Selling"] += 2; fw.MEDDIC += 1; }
  if (a.rep_experience === "junior")      { fw.BANT += 2; meth["Inbound Sales"] += 2; }
  if (a.biggest_loss_reason === "nodecision") { meth["Challenger Sale"] += 4; fw.MEDPICC += 2; }
  if (a.biggest_loss_reason === "competitor") { fw.MEDPICC += 3; meth["Challenger Sale"] += 3; }
  if (a.biggest_loss_reason === "budget")     { fw.MEDPICC += 3; meth["Value Selling"] += 4; }
  if (a.biggest_loss_reason === "process")    { fw.MEDPICC += 5; meth["Solution Selling"] += 2; }
  return {
    topFramework:   Object.entries(fw).sort((a, b) => b[1] - a[1])[0][0],
    topMethodology: Object.entries(meth).sort((a, b) => b[1] - a[1])[0][0],
  };
}

function downloadReport(framework, methodology) {
  const fw = FW[framework];
  const meth = METH[methodology];
  const date = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Your Sales Stack — Voxintel</title>
<style>@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&display=swap');
*{margin:0;padding:0;box-sizing:border-box}body{font-family:'DM Sans',sans-serif;background:#080C14;color:#fff;padding:48px}
.hdr{display:flex;justify-content:space-between;align-items:center;margin-bottom:48px;padding-bottom:24px;border-bottom:1px solid rgba(255,255,255,.08)}
.logo{font-size:18px;font-weight:700;color:#0047FF}.dt{font-size:12px;color:#4A6080}
.hero{text-align:center;margin-bottom:40px}.badge{display:inline-block;padding:6px 16px;background:rgba(0,229,255,.1);border:1px solid rgba(0,229,255,.25);border-radius:100px;font-size:11px;letter-spacing:.15em;color:#00E5FF;text-transform:uppercase;margin-bottom:20px}
h1{font-size:30px;font-weight:800;margin-bottom:8px}.sub{font-size:14px;color:#8BA8C8}
.card{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:14px;padding:28px;margin-bottom:20px}
.lbl{font-size:10px;font-weight:700;letter-spacing:.15em;text-transform:uppercase;margin-bottom:12px}
.fw{color:#0047FF}.mth{color:#00E5FF}h2{font-size:22px;font-weight:700;margin-bottom:6px}
.tgl{font-size:11px;color:#8BA8C8;margin-bottom:14px}p{font-size:13px;color:#8BA8C8;line-height:1.7;margin-bottom:14px}
.tags{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px}.tag{padding:3px 10px;border-radius:6px;font-size:11px}
.ft{background:rgba(0,71,255,.15);border:1px solid rgba(0,71,255,.3);color:#8BA8C8}
.mt{background:rgba(0,229,255,.08);border:1px solid rgba(0,229,255,.2);color:#8BA8C8}
.vb{padding:14px;background:rgba(0,229,255,.05);border:1px solid rgba(0,229,255,.15);border-radius:8px}
.vl{font-size:10px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#00E5FF;margin-bottom:6px}
.ftr{margin-top:40px;text-align:center;font-size:11px;color:#2A3850}</style></head><body>
<div class="hdr"><div class="logo">VOXINTEL</div><div class="dt">Generated ${date}</div></div>
<div class="hero"><div class="badge">Your B2B Sales Stack</div><h1>${framework} + ${methodology}</h1><p class="sub">Your personalised methodology recommendation</p></div>
<div class="card"><div class="lbl fw">Qualification Framework</div><h2>${framework}</h2>
<div class="tgl">${fw.tagline}</div><p>${fw.description}</p>
<div class="tags">${fw.fits.map(f => `<span class="tag ft">${f}</span>`).join("")}</div>
<div class="vb"><div class="vl">How Voxintel Powers ${framework}</div><p style="margin:0">${fw.voxintel}</p></div></div>
<div class="card"><div class="lbl mth">Sales Methodology</div><h2>${methodology}</h2>
<div class="tgl">"${meth.tagline}"</div><p>${meth.description}</p>
<div class="tags">${meth.fits.map(f => `<span class="tag mt">${f}</span>`).join("")}</div>
<div class="vb"><div class="vl">How Voxintel Powers ${methodology}</div><p style="margin:0">${meth.voxintel}</p></div></div>
<div class="ftr">voxintel.com · B2B Sales Intelligence</div></body></html>`;
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `voxintel-${framework.toLowerCase()}-${methodology.toLowerCase().replace(/\s+/g, "-")}-report.html`;
  a.click();
  URL.revokeObjectURL(url);
}

function ProgressBar({ current, total }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 11, letterSpacing: "0.15em", color: C.dim, textTransform: "uppercase" }}>Question {current} of {total}</span>
        <span style={{ fontSize: 11, letterSpacing: "0.15em", color: C.accent }}>{pct}%</span>
      </div>
      <div style={{ height: 2, background: "#0D1829", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg,${C.blue},${C.accent})`, borderRadius: 2, transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)" }} />
      </div>
    </div>
  );
}

function OptionBtn({ option, selected, onClick, index }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", padding: "18px 20px",
      background: selected ? "rgba(0,71,255,0.12)" : "rgba(255,255,255,0.03)",
      border: `1px solid ${selected ? C.blue : C.border}`,
      borderRadius: 10, cursor: "pointer", display: "flex", alignItems: "center",
      gap: 16, textAlign: "left", transition: "all 0.2s",
      color: selected ? "#fff" : C.muted, marginBottom: 10, position: "relative", overflow: "hidden",
    }}>
      {selected && <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg,rgba(124,58,237,0.08),rgba(167,139,250,0.04))", pointerEvents: "none" }} />}
      <div style={{
        width: 28, height: 28, borderRadius: "50%",
        border: `1.5px solid ${selected ? C.accent : "rgba(255,255,255,0.15)"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, fontSize: 11, fontFamily: "monospace",
        color: selected ? C.accent : "rgba(255,255,255,0.3)",
        background: selected ? "rgba(0,229,255,0.08)" : "transparent", transition: "all 0.2s",
      }}>
        {selected ? "✓" : ["A", "B", "C", "D"][index]}
      </div>
      <span style={{ fontSize: 14, lineHeight: 1.4 }}>{option.label}</span>
    </button>
  );
}

function EmailGate({ framework, methodology, onSubmit }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [error, setError] = useState("");

  const inp = {
    width: "100%", padding: "13px 16px",
    background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`,
    borderRadius: 8, color: "#fff", fontSize: 14, outline: "none",
    fontFamily: "inherit", transition: "border-color 0.2s", marginBottom: 12,
  };

  function handleSubmit() {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    onSubmit({ email, name, company });
  }

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div style={{ width: 52, height: 52, borderRadius: "50%", margin: "0 auto 18px", background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🔐</div>
        <h2 style={{ fontSize: 21, fontWeight: 700, color: "#fff", margin: "0 0 8px" }}>Your results are ready</h2>
        <p style={{ fontSize: 13, color: C.muted, margin: 0, lineHeight: 1.6 }}>
          Unlock your <strong style={{ color: "#fff" }}>{framework} + {methodology}</strong> recommendation.
        </p>
      </div>
      <input style={inp} placeholder="Work email *" type="email" value={email}
        onChange={e => setEmail(e.target.value)}
        onFocus={e => { e.target.style.borderColor = C.blue; }}
        onBlur={e => { e.target.style.borderColor = C.border; }} />
      <input style={inp} placeholder="First name" value={name}
        onChange={e => setName(e.target.value)}
        onFocus={e => { e.target.style.borderColor = C.blue; }}
        onBlur={e => { e.target.style.borderColor = C.border; }} />
      <input style={inp} placeholder="Company" value={company}
        onChange={e => setCompany(e.target.value)}
        onFocus={e => { e.target.style.borderColor = C.blue; }}
        onBlur={e => { e.target.style.borderColor = C.border; }} />
      {error && <p style={{ color: "#FF4D6D", fontSize: 12, marginBottom: 10 }}>{error}</p>}
      <button onClick={handleSubmit} style={{
        width: "100%", padding: "15px", background: C.blue,
        border: "none", borderRadius: 8, fontSize: 15, fontWeight: 700, color: "#fff",
        cursor: "pointer", fontFamily: "inherit", boxShadow: "0 0 32px rgba(124,58,237,0.3)",
      }}>
        Unlock My Results →
      </button>
      <p style={{ fontSize: 11, color: C.dimmest, textAlign: "center", marginTop: 12, letterSpacing: "0.08em" }}>
        NO SPAM · DEMO MODE
      </p>
    </div>
  );
}

function ResultSection({ label, isBlue, title, tagline, description, fits, voxintel }) {
  return (
    <div style={{
      background: isBlue ? "rgba(124,58,237,0.06)" : "rgba(167,139,250,0.04)",
      border: `1px solid ${isBlue ? "rgba(0,71,255,0.2)" : "rgba(0,229,255,0.15)"}`,
      borderRadius: 14, padding: 24, marginBottom: 16,
    }}>
      <div style={{ marginBottom: 12 }}>
        <span style={{
          padding: "4px 12px",
          background: isBlue ? C.blue : "rgba(0,229,255,0.15)",
          border: isBlue ? "none" : "1px solid rgba(0,229,255,0.3)",
          borderRadius: 6, fontSize: 11, fontWeight: 700,
          letterSpacing: "0.1em", color: isBlue ? "#fff" : C.accent, textTransform: "uppercase",
        }}>{label}</span>
      </div>
      <h3 style={{ fontSize: 21, color: "#fff", margin: "0 0 6px" }}>{title}</h3>
      <p style={{ fontSize: 12, color: isBlue ? C.accent : C.muted, margin: "0 0 12px", letterSpacing: "0.04em" }}>{tagline}</p>
      <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, margin: "0 0 14px" }}>{description}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        {fits.map(f => (
          <span key={f} style={{
            padding: "4px 10px",
            background: isBlue ? "rgba(0,71,255,0.15)" : "rgba(0,229,255,0.08)",
            border: `1px solid ${isBlue ? "rgba(0,71,255,0.3)" : "rgba(0,229,255,0.2)"}`,
            borderRadius: 6, fontSize: 11, color: C.muted,
          }}>{f}</span>
        ))}
      </div>
      <div style={{ padding: 14, background: "rgba(0,229,255,0.05)", border: "1px solid rgba(0,229,255,0.15)", borderRadius: 8 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: C.accent, marginBottom: 6 }}>
          HOW VOXINTEL POWERS {title.toUpperCase()}
        </div>
        <p style={{ fontSize: 12, color: C.muted, margin: 0, lineHeight: 1.6 }}>{voxintel}</p>
      </div>
    </div>
  );
}

function ResultCard({ framework, methodology, answers, userInfo, onReset }) {
  const [copied, setCopied] = useState(false);
  const fw = FW[framework] || FW.MEDPICC;
  const meth = METH[methodology] || METH["Solution Selling"];

  function copyLink() {
    const url = getShareUrl(answers, { framework, methodology });
    navigator.clipboard.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); });
  }

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ display: "inline-block", padding: "6px 16px", background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.25)", borderRadius: 100, fontSize: 11, letterSpacing: "0.15em", color: C.accent, textTransform: "uppercase", marginBottom: 16 }}>
          Your Recommended Stack
        </div>
        <h2 style={{ fontSize: "clamp(20px,5vw,30px)", fontWeight: 700, color: "#fff", margin: "0 0 8px", lineHeight: 1.2 }}>
          {framework} + {methodology}
        </h2>
        {userInfo?.name && (
          <p style={{ fontSize: 13, color: C.dim, margin: 0 }}>
            Personalised for <strong style={{ color: C.muted }}>{userInfo.name}</strong>
            {userInfo.company ? ` at ${userInfo.company}` : ""}
          </p>
        )}
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        <button onClick={copyLink} style={{
          flex: 1, minWidth: 130, padding: "11px 14px",
          background: "rgba(255,255,255,0.04)", border: `1px solid ${copied ? C.accent : C.border}`,
          borderRadius: 8, fontSize: 13, color: copied ? C.accent : C.muted,
          cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}>
          {copied ? "✓ Copied!" : "🔗 Share Results"}
        </button>
        <button onClick={() => downloadReport(framework, methodology)} style={{
          flex: 1, minWidth: 130, padding: "11px 14px",
          background: "rgba(255,255,255,0.04)", border: `1px solid ${C.border}`,
          borderRadius: 8, fontSize: 13, color: C.muted, cursor: "pointer",
          fontFamily: "inherit", transition: "all 0.2s",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        }}>
          ↓ Download Report
        </button>
      </div>
      <ResultSection label="Qualification Framework" isBlue title={framework} tagline={fw.tagline} description={fw.description} fits={fw.fits} voxintel={fw.voxintel} />
      <ResultSection label="Sales Methodology" isBlue={false} title={methodology} tagline={`"${meth.tagline}"`} description={meth.description} fits={meth.fits} voxintel={meth.voxintel} />
      <div style={{ background: "linear-gradient(135deg,rgba(0,71,255,0.15),rgba(0,229,255,0.08))", border: "1px solid rgba(0,71,255,0.3)", borderRadius: 14, padding: 28, textAlign: "center" }}>
        <h4 style={{ fontSize: 18, color: "#fff", margin: "0 0 8px" }}>See Voxintel enforce {framework} in every call</h4>
        <p style={{ fontSize: 13, color: C.muted, margin: "0 0 20px", lineHeight: 1.6 }}>
          Get a live demo tailored to your {framework} + {methodology} motion.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button style={{ padding: "14px 32px", background: C.blue, border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700, color: "#fff", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 0 32px rgba(0,71,255,0.35)" }}>
            Book a Demo →
          </button>
          <button onClick={onReset} style={{ padding: "14px 24px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 14, color: C.dim, cursor: "pointer", fontFamily: "inherit" }}>
            Retake
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(null);
  const [result, setResult] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const shared = readUrlState();
    if (shared) {
      setAnswers(shared.answers);
      setResult({ framework: shared.framework, methodology: shared.methodology });
      setStep("result");
    }
  }, []);

  const isIntro  = step === 0;
  const isGate   = step === "gate";
  const isResult = step === "result";
  const isQ      = typeof step === "number" && step >= 1;
  const q        = isQ ? questions[step - 1] : null;

  function fade(nextStep) {
    setFading(true);
    setTimeout(() => { setStep(nextStep); setFading(false); }, 180);
  }

  function handleNext() {
    if (!current) return;
    const updated = { ...answers, [q.id]: current };
    setAnswers(updated);
    setCurrent(null);
    if (step === questions.length) {
      const { topFramework, topMethodology } = scoreAnswers(updated);
      setResult({ framework: topFramework, methodology: topMethodology });
      fade("gate");
    } else {
      fade(step + 1);
    }
  }

  function reset() {
    setStep(0); setAnswers({}); setCurrent(null);
    setResult(null); setUserInfo(null); setFading(false);
    window.history.replaceState({}, "", window.location.pathname);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        html, body { margin: 0; padding: 0; background: #080C14; font-family: 'DM Sans', sans-serif; }
        input::placeholder { color: #1A2840; }
        button { font-family: 'DM Sans', sans-serif; }
        button:hover { opacity: 0.88; }
        h1, h2, h3, h4 { font-family: 'Syne', sans-serif; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(0,71,255,0.3); border-radius: 4px; }
      `}</style>
      <div style={{ minHeight: "100vh", background: C.dark, display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 16px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, backgroundImage: `linear-gradient(rgba(0,71,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(0,71,255,0.04) 1px,transparent 1px)`, backgroundSize: "48px 48px" }} />
        <div style={{ position: "fixed", top: -200, left: "50%", transform: "translateX(-50%)", width: 600, height: 400, background: "radial-gradient(ellipse,rgba(0,71,255,0.12) 0%,transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
        <div style={{ width: "100%", maxWidth: 680, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 48, position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: C.blue, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#fff", fontWeight: 800 }}>V</div>
            <span style={{ fontSize: 15, fontWeight: 600, color: "#fff", letterSpacing: "0.03em" }}>Voxintel</span>
          </div>
          {!isIntro && !isResult && (
            <button onClick={reset} style={{ background: "transparent", border: `1px solid rgba(255,255,255,0.1)`, borderRadius: 6, padding: "6px 14px", color: C.dim, fontSize: 12, cursor: "pointer" }}>
              Start Over
            </button>
          )}
        </div>
        <div style={{ width: "100%", maxWidth: 640, background: C.card, border: `1px solid ${C.border}`, borderRadius: 20, padding: "clamp(24px,5vw,44px)", position: "relative", zIndex: 1, backdropFilter: "blur(12px)", opacity: fading ? 0 : 1, transition: "opacity 0.18s ease" }}>
          {isIntro && (
            <div style={{ textAlign: "center" }}>
              <div style={{ display: "inline-block", padding: "6px 16px", background: "rgba(0,229,255,0.1)", border: "1px solid rgba(0,229,255,0.2)", borderRadius: 100, fontSize: 11, letterSpacing: "0.15em", color: C.accent, textTransform: "uppercase", marginBottom: 28 }}>
                B2B Sales Methodology Finder
              </div>
              <h1 style={{ fontSize: "clamp(26px,6vw,42px)", fontWeight: 800, color: "#fff", margin: "0 0 16px", lineHeight: 1.15 }}>
                Find your perfect<br /><span style={{ color: C.blue }}>sales stack</span>
              </h1>
              <p style={{ fontSize: 15, color: C.muted, margin: "0 0 36px", lineHeight: 1.7, maxWidth: 440, marginLeft: "auto", marginRight: "auto" }}>
                8 questions. 2 minutes. Match your team to the right qualification framework and sales methodology — and see how Voxintel enforces it on every call.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10, marginBottom: 36 }}>
                {["MEDPICC", "MEDDIC", "BANT", "Solution Selling", "Challenger Sale", "SPIN", "Value Selling"].map(t => (
                  <span key={t} style={{ padding: "4px 12px", borderRadius: 100, border: "1px solid rgba(255,255,255,0.1)", fontSize: 11, color: C.dim, letterSpacing: "0.05em" }}>{t}</span>
                ))}
              </div>
              <button onClick={() => setStep(1)} style={{ padding: "16px 40px", background: C.blue, border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, color: "#fff", cursor: "pointer", letterSpacing: "0.04em", boxShadow: "0 0 40px rgba(0,71,255,0.3)" }}>
                Find My Methodology →
              </button>
              <p style={{ fontSize: 11, color: C.dimmer, marginTop: 16, letterSpacing: "0.1em" }}>FOR B2B SALES TEAMS · 2 MINUTES</p>
            </div>
          )}
          {isQ && q && (
            <div>
              <ProgressBar current={step} total={questions.length} />
              <h2 style={{ fontSize: "clamp(17px,4vw,22px)", fontWeight: 700, color: "#fff", margin: "0 0 8px", lineHeight: 1.3 }}>{q.text}</h2>
              <p style={{ fontSize: 13, color: C.dim, margin: "0 0 28px", lineHeight: 1.5 }}>{q.subtext}</p>
              {q.options.map((opt, i) => (
                <OptionBtn key={opt.value} option={opt} selected={current === opt.value} onClick={() => setCurrent(opt.value)} index={i} />
              ))}
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
                <button onClick={handleNext} disabled={!current} style={{
                  padding: "14px 28px", background: current ? C.blue : "rgba(255,255,255,0.05)",
                  border: "none", borderRadius: 8, fontSize: 14, fontWeight: 700,
                  color: current ? "#fff" : C.dimmer, cursor: current ? "pointer" : "default",
                  transition: "all 0.2s", boxShadow: current ? "0 0 24px rgba(0,71,255,0.25)" : "none",
                }}>
                  {step === questions.length ? "See My Results →" : "Next →"}
                </button>
              </div>
            </div>
          )}
          {isGate && result && (
            <EmailGate
              framework={result.framework}
              methodology={result.methodology}
              onSubmit={(info) => { setUserInfo(info); fade("result"); }}
            />
          )}
          {isResult && result && (
            <ResultCard framework={result.framework} methodology={result.methodology} answers={answers} userInfo={userInfo} onReset={reset} />
          )}
        </div>
        <p style={{ fontSize: 11, color: C.dimmest, marginTop: 32, letterSpacing: "0.1em", textTransform: "uppercase", position: "relative", zIndex: 1 }}>
          © 2025 Voxintel · B2B Sales Intelligence
        </p>
      </div>
    </>
  );
}
