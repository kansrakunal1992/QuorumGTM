import { useState, useRef, useEffect } from "react";

// ─── Themes ───────────────────────────────────────────────────────────────────
const DARK = {
  bg:          "#07080f", panel:       "#0c0d18", card:        "#111220",
  border:      "#1c1d2e", borderBright:"#2a2b42",
  text:        "#dde1f0", textMuted:   "#5a5f7a", textDim:     "#3a3f58",
  accent:      "#6c63ff", accentGlow:  "rgba(108,99,255,0.18)", accentLight: "#8b84ff",
  success:     "#22d3a0", successGlow: "rgba(34,211,160,0.12)",
  warn:        "#f5a623", warnGlow:    "rgba(245,166,35,0.12)",
  danger:      "#f56060", userBubble:  "linear-gradient(135deg,#5c55f0,#8b6cf7)",
  toggleBg:    "#1c1d2e", shadow:      "none",
};

const LIGHT = {
  bg:          "#f4f5fb", panel:       "#ffffff", card:        "#eef0f8",
  border:      "#e2e4f0", borderBright:"#cdd0e8",
  text:        "#18192e", textMuted:   "#555a7a", textDim:     "#9aa0c0",
  accent:      "#5c55f0", accentGlow:  "rgba(92,85,240,0.10)", accentLight: "#7c77f5",
  success:     "#0d9e75", successGlow: "rgba(13,158,117,0.10)",
  warn:        "#c97706", warnGlow:    "rgba(201,119,6,0.10)",
  danger:      "#dc2626", userBubble:  "linear-gradient(135deg,#5c55f0,#8b6cf7)",
  toggleBg:    "#e8eaf5", shadow:      "0 1px 3px rgba(0,0,0,0.08)",
};

// ─── System prompt ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are the Growth and Booking Agent for Quorum — a Judgment Operating System that helps founders, executives, investors, consultants, coaches, advisors, and operators make better high-stakes decisions.

Unlike generic AI tools that generate more analysis, Quorum structurally analyzes a decision before advice is given, integrates multiple perspectives into a coherent judgment position, and builds a long-term record of how a person actually makes decisions.

YOUR ROLE
You act as an elite SDR, executive advisor, and decision concierge. Never sound like a salesperson. Never push features. Focus entirely on the decision the prospect is facing.

OBJECTIVE: Not to sell Quorum. To:
1. Identify whether the prospect is currently facing a meaningful decision
2. Determine whether it is a strong fit for Quorum
3. Create curiosity around the structured process
4. Book a live session

IDEAL CUSTOMER PROFILE

Tier 1 — Direct decision-makers (highest priority):
Founders, Co-founders, CEOs, CXOs, MDs, Business owners, Family office principals, Angel investors, HNI investors making allocation calls

Tier 2 — Advisors to decision-makers:
Board members, Board advisors, Fractional executives (Fractional CFO / CMO / CTO / CHRO), Operating partners at PE or VC firms, Venture partners, Independent directors

Tier 3 — Coaches and practitioners:
Executive coaches, Leadership coaches, Life coaches who serve senior professionals, Organizational psychologists, Independent management consultants, Strategy advisors, ICF-certified coaches, Vistage chairs, EO / YPO forum facilitators

Strong fit decisions — direct:
Hiring or firing a key leader, Co-founder conflict or equity issues, Fundraising round terms, Market or geography expansion, Acquisition or merger decision, Exit timing, Career pivot at senior level, Succession planning, Major capital allocation, Partnership or JV decisions, Decisions that have remained unresolved for weeks or months

Strong fit decisions — advisor and coach-specific:
My client has been stuck on the same decision for weeks and I cannot get them unstuck
I need to structure my recommendation before presenting it to a board or leadership team
Should I take on this advisory engagement or board seat
I want to use a structured decision process as a tool in my coaching or consulting practice
I am preparing a client for a high-stakes conversation and need the framing to be airtight
My client keeps revisiting the same decision without resolution

Poor fit: Operational or process decisions, Vendor selection, Low-risk reversible decisions, Pure research, Decisions already made and just needing execution

DETECTING ADVISOR AND COACH PROSPECTS
If the person uses phrases like "my client," "the founder I advise," "the CEO I work with," or "one of my coachees" — they are an advisor or coach, not the direct decision-maker.
For these prospects:
- Position Quorum as a structured tool they can bring into their practice
- Frame the value as: "Quorum gives you an external structured process so the decision pressure does not sit entirely on your judgment alone"
- If they want to explore using Quorum across multiple client engagements, treat this as a practitioner partnership conversation

CONVERSATION FLOW

Stage 1 — Discovery
Start with curiosity:
- "What is the biggest unresolved decision on your plate right now?"
- "Is there a decision you have been circling but have not fully resolved?"
- "What decision would be most expensive to get wrong this quarter?"

Stage 2 — Qualification
Determine: Decision type, Stakes, Time horizon, Reversibility, Stakeholders, Current confidence level, Why resolution has been difficult. Ask ONE question at a time.

Stage 3 — Structural Assessment
Internally evaluate: Decision Importance (1-10), Decision Complexity (1-10), Quorum Fit (1-10)

Stage 4 — Insight
Before mentioning Quorum, offer one sharp observation:
- "It sounds like the hiring decision is not actually about the candidate — it is about your confidence in delegation."
- "The unresolved issue appears to be a missing assumption rather than a lack of options."
- "You seem to have enough information. The challenge is reconciling conflicting inputs."

Stage 5 — Invite
Only after value is created: "This is exactly the type of decision Quorum was designed for. We use a structured process to pressure-test the framing, surface hidden dependencies, and integrate multiple perspectives before arriving at a recommendation. Would you be open to running this through a live session?"

BOOKING HANDOFF: Summarize the decision, stakes, key tension, and why Quorum will help. Then confirm booking.

RULES: Never oversell. Never claim certainty. Never argue. Never pitch features first. Be concise. Sound like a thoughtful advisor. Optimize for booked sessions, not conversation length.

CRITICAL OUTPUT FORMAT — append this block at the end of EVERY response:

===INTERNAL===
DECISION_CATEGORY: [category or "Not yet identified"]
ESTIMATED_STAKES: [Low / Medium / High / Critical / Unknown]
STAGE: [Discovery / Qualification / Assessment / Insight / Invite / Booked]
IMPORTANCE_SCORE: [1-10 or N/A]
COMPLEXITY_SCORE: [1-10 or N/A]
FIT_SCORE: [1-10 or N/A]
LIKELIHOOD_OF_BOOKING: [Low / Medium / High / Unknown]
RECOMMENDED_NEXT_MESSAGE: [One tactical sentence]
COUNCIL_CONFIGURATION: [Suggested perspectives for the Quorum session, or TBD]
QUALIFIED: [YES / NO / PENDING]
===END_INTERNAL===`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseInternal(text) {
  const match = text.match(/===INTERNAL===([\s\S]*?)===END_INTERNAL===/);
  if (!match) return null;
  const result = {};
  match[1].trim().split("\n").forEach(line => {
    const idx = line.indexOf(":");
    if (idx > -1) result[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  });
  return result;
}

function stripInternal(text) {
  return text.replace(/===INTERNAL===[\s\S]*?===END_INTERNAL===/g, "").trim();
}

function genSessionId() {
  return `q_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// ─── Stage metadata ───────────────────────────────────────────────────────────
const STAGES = [
  { key: "Discovery",     userLabel: "Understanding your situation" },
  { key: "Qualification", userLabel: "Mapping the decision"         },
  { key: "Assessment",    userLabel: "Analyzing the landscape"      },
  { key: "Insight",       userLabel: "Building your picture"        },
  { key: "Invite",        userLabel: "Preparing your session"       },
  { key: "Booked",        userLabel: "Session confirmed"            },
];

const STAKES_USER = {
  Unknown:  "Still being established",
  Low:      "Moderate consequences",
  Medium:   "Significant consequences",
  High:     "High-stakes decision",
  Critical: "Critical importance",
};

const STAGE_NEXT = {
  Discovery:     "Quorum will ask one more question to understand the decision",
  Qualification: "Quorum is mapping the full scope of the decision",
  Assessment:    "Quorum is building a structural view of what is at stake",
  Insight:       "Quorum is about to offer an observation on your decision",
  Invite:        "A live Quorum session has been proposed for you",
  Booked:        "Your session is confirmed — you will hear from the team shortly",
};

// ─── Sub-components (all accept C for theming) ────────────────────────────────

function ScoreBar({ label, value, C }) {
  const n = parseInt(value);
  const valid = !isNaN(n);
  const pct = valid ? (n / 10) * 100 : 0;
  const color = valid ? (n >= 7 ? C.success : n >= 4 ? C.warn : C.danger) : C.textDim;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 11, color: C.textMuted, letterSpacing: "0.04em" }}>{label}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color }}>{valid ? `${n} / 10` : "—"}</span>
      </div>
      <div style={{ height: 3, background: C.border, borderRadius: 2, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`, background: color, borderRadius: 2,
          transition: "width 0.7s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: valid && n >= 7 ? `0 0 6px ${color}` : "none",
        }} />
      </div>
    </div>
  );
}

function Badge({ label, value, map, C }) {
  const resolved = map?.[value] || { color: C.textMuted, bg: C.border };
  return (
    <div>
      <div style={{ fontSize: 9, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 5 }}>{label}</div>
      <div style={{
        display: "inline-block", padding: "3px 10px", borderRadius: 20,
        background: resolved.bg, color: resolved.color, fontSize: 11, fontWeight: 700, letterSpacing: "0.05em",
      }}>{value || "—"}</div>
    </div>
  );
}

function TypingDots({ C }) {
  return (
    <div style={{ display: "flex", gap: 4, padding: "14px 18px", alignItems: "center" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 5, height: 5, borderRadius: "50%", background: C.accent,
          animation: `qdot 1.3s ease-in-out ${i * 0.18}s infinite`,
        }} />
      ))}
    </div>
  );
}

function DecisionSnapshot({ intel, started, C }) {
  const stageIdx = intel ? STAGES.findIndex(s => s.key === intel.STAGE) : -1;
  const council = intel?.COUNCIL_CONFIGURATION;
  const showCouncil = council && council !== "TBD";
  const isBooked = intel?.STAGE === "Booked";

  return (
    <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
      {!started || !intel ? (
        <div style={{ paddingTop: 8 }}>
          <div style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.7, marginBottom: 20 }}>
            As you talk, Quorum builds a live picture of your decision — what is at stake, who is involved, and what is making it hard to resolve.
          </div>
          {STAGES.slice(0, 5).map((s, i) => (
            <div key={s.key} style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
              <div style={{
                width: 22, height: 22, borderRadius: "50%", flexShrink: 0, marginTop: 1,
                border: `1px solid ${C.borderBright}`, display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 9, color: C.textDim, fontWeight: 700,
              }}>{i + 1}</div>
              <div style={{ fontSize: 12, color: C.textDim, lineHeight: 1.5, paddingTop: 3 }}>{s.userLabel}</div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Progress stepper */}
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px", boxShadow: C.shadow }}>
            <div style={{ fontSize: 9, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Progress</div>
            {STAGES.slice(0, 5).map((s, i) => {
              const done = stageIdx > i, active = stageIdx === i;
              return (
                <div key={s.key} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: i < 4 ? 10 : 0 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: "50%",
                      background: done ? C.success : active ? C.accent : "transparent",
                      border: `2px solid ${done ? C.success : active ? C.accent : C.borderBright}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      boxShadow: active ? `0 0 8px ${C.accentGlow}` : "none",
                      transition: "all 0.4s",
                    }}>
                      {done && <div style={{ width: 6, height: 6, borderRadius: "50%", background: C.bg }} />}
                      {active && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "white", animation: "pulse-dot 1.8s ease-in-out infinite" }} />}
                    </div>
                    {i < 4 && <div style={{ width: 2, height: 12, background: done ? C.success : C.border, marginTop: 2, transition: "background 0.4s" }} />}
                  </div>
                  <div style={{ paddingTop: 1 }}>
                    <div style={{
                      fontSize: 11, fontWeight: active ? 600 : 400,
                      color: done ? C.success : active ? C.text : C.textDim, transition: "color 0.3s",
                    }}>{s.userLabel}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {intel.DECISION_CATEGORY && intel.DECISION_CATEGORY !== "Not yet identified" && (
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "13px 14px", boxShadow: C.shadow }}>
              <div style={{ fontSize: 9, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Your Decision</div>
              <div style={{ fontSize: 13, color: C.text, lineHeight: 1.55, fontWeight: 500 }}>{intel.DECISION_CATEGORY}</div>
            </div>
          )}

          {intel.ESTIMATED_STAKES && intel.ESTIMATED_STAKES !== "Unknown" && (
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "13px 14px", boxShadow: C.shadow }}>
              <div style={{ fontSize: 9, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>What Quorum Sees</div>
              <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>{STAKES_USER[intel.ESTIMATED_STAKES] || intel.ESTIMATED_STAKES}</div>
            </div>
          )}

          {showCouncil && (
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "13px 14px", boxShadow: C.shadow }}>
              <div style={{ fontSize: 9, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Perspectives Quorum Will Bring In</div>
              <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.65 }}>{council}</div>
            </div>
          )}

          {intel.STAGE && (
            <div style={{
              background: isBooked ? C.successGlow : C.accentGlow,
              border: `1px solid ${isBooked ? C.success : C.accent}`,
              borderRadius: 10, padding: "13px 14px",
              animation: isBooked ? "glow 2.5s ease-in-out infinite" : "none",
            }}>
              <div style={{ fontSize: 9, color: isBooked ? C.success : C.accentLight, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
                {isBooked ? "✓ Next Step" : "→ Next Step"}
              </div>
              <div style={{ fontSize: 12, color: isBooked ? C.success : C.text, lineHeight: 1.6 }}>
                {STAGE_NEXT[intel.STAGE] || "Quorum is building your decision picture"}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function IntelPanel({ intel, C }) {
  const stageMap = {
    Discovery:     { color: "#7c8fff", bg: "rgba(124,143,255,0.12)" },
    Qualification: { color: "#b06fff", bg: "rgba(176,111,255,0.12)" },
    Assessment:    { color: "#ff8fff", bg: "rgba(255,143,255,0.10)" },
    Insight:       { color: C.warn,    bg: C.warnGlow               },
    Invite:        { color: C.accentLight, bg: C.accentGlow         },
    Booked:        { color: C.success, bg: C.successGlow            },
  };
  const stakesMap = {
    Low:      { color: C.textMuted, bg: C.border                    },
    Medium:   { color: C.warn,      bg: C.warnGlow                  },
    High:     { color: "#f58a60",   bg: "rgba(245,138,96,0.12)"     },
    Critical: { color: C.danger,    bg: "rgba(245,96,96,0.12)"      },
    Unknown:  { color: C.textDim,   bg: C.border                    },
  };
  const bookingMap = {
    Low:     { color: C.danger,  bg: "rgba(245,96,96,0.1)" },
    Medium:  { color: C.warn,    bg: C.warnGlow             },
    High:    { color: C.success, bg: C.successGlow          },
    Unknown: { color: C.textDim, bg: C.border               },
  };

  if (!intel) {
    return (
      <div style={{ padding: "48px 20px", textAlign: "center" }}>
        <div style={{ fontSize: 24, marginBottom: 12, opacity: 0.15 }}>◈</div>
        <div style={{ fontSize: 11, color: C.textDim }}>Awaiting first exchange</div>
        <div style={{ fontSize: 10, color: C.textDim, marginTop: 4 }}>Panel updates in real time</div>
      </div>
    );
  }

  const cardStyle = { background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "13px 14px", boxShadow: C.shadow };

  return (
    <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}><Badge label="Stage" value={intel.STAGE} map={stageMap} C={C} /></div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 5 }}>Qualified</div>
          <div style={{
            display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: "0.05em",
            background: intel.QUALIFIED === "YES" ? C.successGlow : intel.QUALIFIED === "NO" ? "rgba(245,96,96,0.1)" : "rgba(245,166,35,0.1)",
            color: intel.QUALIFIED === "YES" ? C.success : intel.QUALIFIED === "NO" ? C.danger : C.warn,
            animation: intel.QUALIFIED === "YES" ? "glow 2s ease-in-out infinite" : "none",
          }}>{intel.QUALIFIED || "PENDING"}</div>
        </div>
      </div>

      <div style={{ height: 1, background: C.border }} />

      <div style={cardStyle}>
        <div style={{ fontSize: 9, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Decision</div>
        <div style={{ fontSize: 12, color: C.text, lineHeight: 1.5 }}>{intel.DECISION_CATEGORY || "Not yet identified"}</div>
      </div>

      <div style={cardStyle}><Badge label="Estimated Stakes" value={intel.ESTIMATED_STAKES} map={stakesMap} C={C} /></div>

      <div style={cardStyle}>
        <div style={{ fontSize: 9, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Decision Scores</div>
        <ScoreBar label="Importance" value={intel.IMPORTANCE_SCORE} C={C} />
        <ScoreBar label="Complexity"  value={intel.COMPLEXITY_SCORE} C={C} />
        <ScoreBar label="Quorum Fit"  value={intel.FIT_SCORE} C={C} />
      </div>

      <div style={cardStyle}><Badge label="Booking Likelihood" value={intel.LIKELIHOOD_OF_BOOKING} map={bookingMap} C={C} /></div>

      <div style={cardStyle}>
        <div style={{ fontSize: 9, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 7 }}>Recommended Move</div>
        <div style={{ fontSize: 11.5, color: C.textMuted, lineHeight: 1.65 }}>{intel.RECOMMENDED_NEXT_MESSAGE || "—"}</div>
      </div>

      <div style={cardStyle}>
        <div style={{ fontSize: 9, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 7 }}>Council Config</div>
        <div style={{ fontSize: 11.5, color: C.textMuted, lineHeight: 1.65 }}>{intel.COUNCIL_CONFIGURATION || "TBD"}</div>
      </div>

      {intel.QUALIFIED === "YES" && (
        <div style={{
          background: C.successGlow, border: `1px solid ${C.success}`,
          borderRadius: 10, padding: "14px", textAlign: "center",
          animation: "glow 2.5s ease-in-out infinite",
        }}>
          <div style={{ fontSize: 10, color: C.success, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>✓ Qualified for Session</div>
          <div style={{ fontSize: 10, color: C.textMuted, marginTop: 5 }}>Lead saved to admin dashboard</div>
        </div>
      )}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function QuorumSDR() {
  const [isDark,    setIsDark]    = useState(true);
  const C = isDark ? DARK : LIGHT;

  const [messages,  setMessages]  = useState([]);
  const [input,     setInput]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [intel,     setIntel]     = useState(null);
  const [history,   setHistory]   = useState([]);
  const [started,   setStarted]   = useState(false);
  const [qualified, setQualified] = useState(false);

  // ── Session tracking (lead write) ──────────────────────────────────────────
  const sessionId      = useRef(genSessionId());
  const hasWrittenLead = useRef(false);

  // ── Operator mode ──────────────────────────────────────────────────────────
  const [isOperator, setIsOperator] = useState(() => {
    try { return new URLSearchParams(window.location.search).get("op") === "true"; }
    catch { return false; }
  });

  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === "Q") setIsOperator(p => !p);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const bottomRef   = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // ── Write qualified lead to Supabase (once per session) ───────────────────
  const writeLead = async (intelData, snap) => {
    if (hasWrittenLead.current) return;
    hasWrittenLead.current = true;
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id:               sessionId.current,
          decision_category:        intelData.DECISION_CATEGORY        || null,
          estimated_stakes:         intelData.ESTIMATED_STAKES         || null,
          importance_score:         parseInt(intelData.IMPORTANCE_SCORE) || null,
          complexity_score:         parseInt(intelData.COMPLEXITY_SCORE) || null,
          fit_score:                parseInt(intelData.FIT_SCORE)        || null,
          likelihood_of_booking:    intelData.LIKELIHOOD_OF_BOOKING    || null,
          recommended_next_message: intelData.RECOMMENDED_NEXT_MESSAGE || null,
          council_config:           intelData.COUNCIL_CONFIGURATION    || null,
          conversation_snapshot:    snap.slice(-6).map(m => ({
            role:    m.role,
            content: stripInternal(typeof m.content === "string" ? m.content : ""),
          })),
        }),
      });
    } catch (e) {
      console.error("Lead write failed:", e);
      hasWrittenLead.current = false; // allow retry on next qualification signal
    }
  };

  // ── API call ───────────────────────────────────────────────────────────────
  const callAPI = async (msgs) => {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "deepseek-v4-pro",
        max_tokens: 1000,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...msgs],
      }),
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content || "";
  };

  const processResponse = (raw, fullHistory) => {
    const visible = stripInternal(raw);
    const parsed  = parseInternal(raw);
    if (parsed) {
      setIntel(parsed);
      if (parsed.QUALIFIED === "YES" && !hasWrittenLead.current) {
        setQualified(true);
        writeLead(parsed, fullHistory);
      }
    }
    return visible;
  };

  const handleStart = async () => {
    setStarted(true);
    setLoading(true);
    const initMsg = [{ role: "user", content: "Hello." }];
    try {
      const raw      = await callAPI(initMsg);
      const fullHist = [...initMsg, { role: "assistant", content: raw }];
      const visible  = processResponse(raw, fullHist);
      setHistory(fullHist);
      setMessages([{ role: "assistant", text: visible }]);
    } catch { setMessages([{ role: "assistant", text: "Something went wrong. Please refresh." }]); }
    setLoading(false);
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    textareaRef.current.style.height = "auto";
    setMessages(p => [...p, { role: "user", text }]);
    setLoading(true);
    const newHistory = [...history, { role: "user", content: text }];
    try {
      const raw      = await callAPI(newHistory);
      const fullHist = [...newHistory, { role: "assistant", content: raw }];
      const visible  = processResponse(raw, fullHist);
      setHistory(fullHist);
      setMessages(p => [...p, { role: "assistant", text: visible }]);
    } catch { setMessages(p => [...p, { role: "assistant", text: "Something went wrong." }]); }
    setLoading(false);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // ── Shared styles ──────────────────────────────────────────────────────────
  const panelHeader = {
    padding: "16px 24px", borderBottom: `1px solid ${C.border}`,
    background: C.panel, display: "flex", alignItems: "center", gap: 14, flexShrink: 0,
    boxShadow: C.shadow,
  };

  return (
    <div style={{
      display: "flex", height: "100vh", background: C.bg,
      fontFamily: "'Inter', -apple-system, 'Segoe UI', sans-serif",
      overflow: "hidden", transition: "background 0.3s",
    }}>

      {/* ── Chat panel ───────────────────────────────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", borderRight: `1px solid ${C.border}` }}>

        {/* Header */}
        <div style={panelHeader}>
          <div style={{
            width: 34, height: 34, borderRadius: 9,
            background: "linear-gradient(135deg,#5c55f0,#9b6cf7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 800, color: "white",
            boxShadow: "0 0 16px rgba(108,99,255,0.35)",
          }}>Q</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Quorum</div>
            <div style={{ fontSize: 10, color: C.textMuted, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 1 }}>
              Judgment Operating System
            </div>
          </div>

          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
            {/* Light / dark toggle */}
            <button
              onClick={() => setIsDark(p => !p)}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              style={{
                width: 34, height: 20, borderRadius: 10, border: "none", cursor: "pointer",
                background: C.toggleBg, position: "relative", transition: "background 0.3s",
                flexShrink: 0,
              }}
            >
              <div style={{
                width: 14, height: 14, borderRadius: "50%",
                background: C.accent,
                position: "absolute", top: 3,
                left: isDark ? 3 : 17,
                transition: "left 0.25s cubic-bezier(0.4,0,0.2,1)",
                boxShadow: `0 0 6px ${C.accentGlow}`,
              }} />
            </button>

            {qualified && (
              <div style={{
                padding: "4px 12px", borderRadius: 20,
                background: C.successGlow, border: `1px solid ${C.success}`,
                color: C.success, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
                textTransform: "uppercase", animation: "glow 2.5s ease-in-out infinite",
              }}>● Session Ready</div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
          {!started ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 28, textAlign: "center", padding: "40px 0" }}>
              <div style={{
                width: 80, height: 80, borderRadius: 20,
                background: "linear-gradient(135deg,#5c55f0,#9b6cf7)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 32, fontWeight: 800, color: "white",
                boxShadow: "0 0 40px rgba(108,99,255,0.3)",
              }}>Q</div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: C.text, letterSpacing: "-0.02em", marginBottom: 10 }}>
                  Quorum Decision Advisor
                </div>
                <div style={{ fontSize: 13, color: C.textMuted, maxWidth: 320, lineHeight: 1.7, margin: "0 auto" }}>
                  For founders, executives, and operators navigating decisions with real consequences.
                </div>
              </div>
              <button
                onClick={handleStart}
                style={{
                  padding: "13px 32px", borderRadius: 10, border: "none", cursor: "pointer",
                  background: "linear-gradient(135deg,#5c55f0,#9b6cf7)", color: "white",
                  fontSize: 13, fontWeight: 700, letterSpacing: "0.02em",
                  boxShadow: "0 4px 20px rgba(92,85,240,0.4)", transition: "transform 0.15s, box-shadow 0.15s",
                }}
                onMouseOver={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 28px rgba(92,85,240,0.55)"; }}
                onMouseOut={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "0 4px 20px rgba(92,85,240,0.4)"; }}
              >Begin Session</button>
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                {m.role === "assistant" && (
                  <div style={{
                    width: 26, height: 26, borderRadius: 7, flexShrink: 0, marginRight: 10, marginTop: 2,
                    background: "linear-gradient(135deg,#5c55f0,#9b6cf7)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 800, color: "white",
                  }}>Q</div>
                )}
                <div style={{
                  maxWidth: "76%", padding: "13px 17px",
                  borderRadius: m.role === "user" ? "16px 16px 5px 16px" : "5px 16px 16px 16px",
                  background: m.role === "user" ? C.userBubble : C.card,
                  border: m.role === "assistant" ? `1px solid ${C.border}` : "none",
                  fontSize: 13.5, lineHeight: 1.75,
                  color: m.role === "user" ? "rgba(255,255,255,0.95)" : C.text,
                  whiteSpace: "pre-wrap", boxShadow: C.shadow,
                }}>{m.text}</div>
              </div>
            ))
          )}

          {loading && (
            <div style={{ display: "flex", alignItems: "center" }}>
              <div style={{
                width: 26, height: 26, borderRadius: 7, flexShrink: 0, marginRight: 10,
                background: "linear-gradient(135deg,#5c55f0,#9b6cf7)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: 800, color: "white",
              }}>Q</div>
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "5px 16px 16px 16px", boxShadow: C.shadow }}>
                <TypingDots C={C} />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        {started && (
          <div style={{ padding: "16px 24px", borderTop: `1px solid ${C.border}`, background: C.panel, display: "flex", gap: 10, alignItems: "flex-end", flexShrink: 0, boxShadow: C.shadow }}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => { setInput(e.target.value); e.target.style.height = "auto"; e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"; }}
              onKeyDown={handleKey}
              placeholder="Share what is on your mind…"
              rows={1}
              style={{
                flex: 1, background: C.card, border: `1px solid ${C.borderBright}`,
                borderRadius: 10, padding: "11px 15px", color: C.text, fontSize: 13.5,
                outline: "none", resize: "none", lineHeight: 1.6, fontFamily: "inherit",
                maxHeight: 120, overflowY: "auto", transition: "border-color 0.2s",
              }}
              onFocus={e => e.target.style.borderColor = C.accent}
              onBlur={e => e.target.style.borderColor = C.borderBright}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              style={{
                width: 40, height: 40, borderRadius: 10, border: "none", flexShrink: 0,
                cursor: input.trim() && !loading ? "pointer" : "default",
                background: input.trim() && !loading ? "linear-gradient(135deg,#5c55f0,#9b6cf7)" : C.border,
                color: input.trim() && !loading ? "white" : C.textDim,
                fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s",
                boxShadow: input.trim() && !loading ? "0 2px 10px rgba(92,85,240,0.35)" : "none",
              }}
            >↑</button>
          </div>
        )}
      </div>

      {/* ── Right panel (dual mode) ───────────────────────────────────────── */}
      <div style={{ width: 300, flexShrink: 0, background: C.panel, display: "flex", flexDirection: "column", overflowY: "auto" }}>
        <div style={{
          padding: "14px 20px", borderBottom: `1px solid ${C.border}`,
          display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
          background: isOperator ? (isDark ? "rgba(245,166,35,0.04)" : "rgba(201,119,6,0.04)") : C.panel,
          transition: "background 0.3s", boxShadow: C.shadow,
        }}>
          <div style={{
            width: 5, height: 5, borderRadius: "50%",
            background: isOperator ? C.warn : C.accent,
            boxShadow: `0 0 6px ${isOperator ? C.warn : C.accent}`,
            transition: "all 0.3s",
          }} />
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
            color: isOperator ? C.warn : C.textMuted, transition: "color 0.3s", flex: 1,
          }}>
            {isOperator ? "⚙  Operator View" : "Decision Snapshot"}
          </span>
          <button
            onClick={() => setIsOperator(p => !p)}
            title={isOperator ? "Switch to prospect view" : "Operator view (Ctrl+Shift+Q)"}
            style={{
              background: "none", border: `1px solid ${C.borderBright}`,
              borderRadius: 5, padding: "2px 7px", cursor: "pointer",
              fontSize: 9, color: C.textDim, letterSpacing: "0.06em", transition: "all 0.2s",
            }}
            onMouseOver={e => { e.currentTarget.style.borderColor = isOperator ? C.warn : C.accent; e.currentTarget.style.color = isOperator ? C.warn : C.accent; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = C.borderBright; e.currentTarget.style.color = C.textDim; }}
          >{isOperator ? "USER" : "OP"}</button>
        </div>

        {isOperator
          ? <IntelPanel intel={intel} C={C} />
          : <DecisionSnapshot intel={intel} started={started} C={C} />
        }
      </div>

      <style>{`
        @keyframes qdot {
          0%,60%,100% { opacity:.25; transform:scale(.75); }
          30%          { opacity:1;   transform:scale(1.1); }
        }
        @keyframes glow {
          0%,100% { box-shadow:0 0 8px  rgba(34,211,160,.2);  }
          50%     { box-shadow:0 0 18px rgba(34,211,160,.45); }
        }
        @keyframes pulse-dot {
          0%,100% { opacity:.6; transform:scale(.85); }
          50%     { opacity:1;  transform:scale(1.1); }
        }
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar       { width:3px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:#2a2b42; border-radius:2px; }
        textarea::placeholder { color:${C.textDim}; }
      `}</style>
    </div>
  );
}
