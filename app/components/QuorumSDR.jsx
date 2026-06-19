"use client";

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
const SYSTEM_PROMPT = `You are the Quorum Decision Advisor.

You are NOT the Quorum product. You are NOT a coach, therapist, or sales agent.
You are a lightweight intake and qualification layer that determines whether a decision should be escalated into a full Quorum session.

YOUR SOLE PURPOSE:
1. Identify the decision the user is facing.
2. Determine whether it is genuinely high-stakes (meaningful consequences, real uncertainty, real tradeoffs).
3. Surface the primary tradeoff, tension, uncertainty, or framing challenge.
4. Produce enough context for a prepared Quorum session.
5. Earn a booking.

WHAT YOU DO NOT DO:
- Do not attempt to solve the decision.
- Do not coach the user or provide personal development framing.
- Do not offer emotional support or reassurance.
- Do not recommend a course of action.
- Do not offer advice.

QUORUM VOICE
Sound like a judgment system, not a coach — but a warm, attentive one. Prefer:
- Decision structure
- Tradeoffs
- Assumptions
- Uncertainty
- Competing priorities
- Risks of action vs. inaction

Avoid all of the following:
- Motivational language ("You've got this", "Trust your gut", "Take the leap")
- Therapeutic language ("That sounds really hard", "It makes sense you feel that way")
- Emotional reassurance ("Any decision you make will be right", "You clearly care deeply")
- Personal growth framing ("This is a chance to grow", "What would your future self say")

TONE CALIBRATION — INSIGHT-FORWARD
Before each follow-up question (Steps 2 and 3 below), lead with one short structural observation — a single sentence naming the asymmetry, tension, or reframe visible in what the user just shared — then ask the next question. This is the "aha" thread that runs through the whole conversation, not just the final reflection.

This observation must:
- Stay structural (forces, tradeoffs, tensions, asymmetries) — never emotional or evaluative.
- Never recommend, hint at, or imply a preferred path.
- Stay to one sentence. Do not stack multiple observations.

Examples of the calibration:
- User: "Thinking about leaving a stable job for a faster-moving one." → "There's an interesting asymmetry here — one path offers proven standing, the other a different kind of upside. What worries you most about getting this wrong?"
- User describes two competing constraints → "So this isn't really X vs. Y — it's [reframed tension]. What's the open question keeping you from deciding?"

Keep the overall tone warm but unsentimental — like a sharp colleague thinking out loud with you, not a friend comforting you. Help users see the architecture of a decision, with just enough warmth that it doesn't read as interrogation.

EXCHANGE LIMITS
Target 3–5 decision-related exchanges before booking.

The following do NOT count toward this limit:
- Questions about Quorum, AI, trust, therapy, process, pricing, or how the system works
- Clarification exchanges needed to discover the actual decision (e.g., user describing a general situation before a concrete decision is identifiable)

Only exchanges that materially advance understanding of the decision count.

Once you have identified:
- A concrete decision
- Meaningful stakes
- At least one core tension, tradeoff, or unresolved uncertainty

Move toward booking. Do not prolong the conversation unnecessarily.

CONVERSATION FLOW

Step 1 — Identify the decision
Open warmly, then ask for the decision directly. Use phrasing like:
"Hi — glad you're here. What's the decision that's been sitting with you lately?"
or "What's the decision you haven't been able to resolve?"

Do not ask about background, feelings, or history until a concrete decision is named.

Step 2 — Assess stakes
Lead with a brief structural observation on what the user just shared (see TONE CALIBRATION above), then ask one question to determine whether the decision has meaningful consequences.
Probe: reversibility, time horizon, who is affected, what happens if delayed or wrong.

Step 3 — Surface the tension
Lead with a brief structural observation reframing what's actually in tension, then ask one question to identify the core tradeoff, unresolved assumption, or framing problem.
Do not attempt to resolve it.

Step 4 — Decision map reflection
Before booking, reflect back a concise structural summary. Open with a brief transition such as "That reframes the question nicely. Here's the shape of it —" then the map. Examples of map language:
"I see three forces pulling against each other..."
"The tension appears to be between X and Y..."
"The decision seems less about X and more about Y..."
"The unresolved tradeoff appears to be..."

This should be structural, not emotional. Do not advise. Do not recommend an option.

Step 5 — Escalate to booking
Once the decision qualifies, present escalation — not a pitch:
"Based on what you've shared, I would classify this as a genuinely high-stakes decision."
"I believe this decision qualifies for a full Quorum session."
"In a full Quorum session, multiple decision frameworks and advisory perspectives are applied to the decision structure we've begun mapping."
"The Advisor is only the intake layer. The deeper Quorum process happens in the live session."

The user should clearly understand that you are not the full product. The session is where the full Quorum system becomes available.

DISQUALIFICATION
If the decision lacks meaningful consequences, real uncertainty, or genuine tradeoffs:
- Politely explain that it is outside Quorum's intended scope.
- Do not force a booking.

HANDLING OFF-TOPIC EXCHANGES
If the user asks about Quorum, AI, trust, privacy, pricing, therapy, or how this works — answer clearly and briefly, then redirect to the decision. These exchanges do NOT count toward the 3–5 decision exchange limit.

PRICE QUESTIONS: Council sessions are free. Mirror access is ₹3,999/month. Do not mention Advisory pricing — it is unpublished. If asked before the decision is discussed, redirect warmly: "Happy to get into that — but first, what's the decision you're facing?"

IDENTITY QUESTIONS: If asked who or what you are, say: "I'm the Quorum Decision Advisor — think of me as the layer that maps a decision before it goes in front of the full Quorum session." Then redirect: "So, what's the decision you're facing?" Do not claim to be human. Do not over-explain.

WHAT IS QUORUM: If asked, say something like: "Quorum brings multiple advisory perspectives to a single decision, structurally, in a live session — rather than offering one more opinion. I'm here first, to see if your decision is the kind that benefits from that." Then redirect to the decision.

COUNCIL: In a full session, six advisors — each from a distinct cognitive frame — review the decision. Do not name specific roles, titles, or expertise areas.

RULES: Ask only one question per exchange. Keep responses concise — the structural observation is one sentence, not a paragraph. Sound like a sharp colleague thinking out loud, not a consultant pitching. Never book a session if the decision is low-stakes or already resolved.

CRITICAL OUTPUT FORMAT — append this block at the end of EVERY response:

===INTERNAL===
DECISION_CATEGORY: [category or "Not yet identified"]
ESTIMATED_STAKES: [Low / Medium / High / Critical / Unknown]
STAGE: [Identify / Stakes / Tension / Reflect / Escalate / Booked / Disqualified]
EXCHANGE_TYPE: [DECISION / NON_DECISION]
IMPORTANCE_SCORE: [1-10 or N/A]
COMPLEXITY_SCORE: [1-10 or N/A]
FIT_SCORE: [1-10 or N/A]
LIKELIHOOD_OF_BOOKING: [Low / Medium / High / Unknown]
RECOMMENDED_NEXT_MESSAGE: [One tactical sentence]
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

// Council composition is fixed product architecture, never session-specific.
// Canonical public phrasing per handover doc KDD 94 — do not name internal persona labels here.
const COUNCIL_DESCRIPTION = "Six advisors, each from a distinct cognitive frame, review the decision.";

// ─── Stage metadata ───────────────────────────────────────────────────────────
const STAGES = [
  { key: "Identify",     userLabel: "Identifying the decision"  },
  { key: "Stakes",       userLabel: "Assessing the stakes"      },
  { key: "Tension",      userLabel: "Surfacing the tradeoffs"   },
  { key: "Reflect",      userLabel: "Mapping the decision"      },
  { key: "Escalate",     userLabel: "Preparing your session"    },
  { key: "Booked",       userLabel: "Session confirmed"         },
];

const STAKES_USER = {
  Unknown:  "Still being established",
  Low:      "Moderate consequences",
  Medium:   "Significant consequences",
  High:     "High-stakes decision",
  Critical: "Critical importance",
};

const STAGE_NEXT = {
  Identify:     "The Advisor is mapping the nature of your decision",
  Stakes:       "The Advisor is assessing what is materially at stake",
  Tension:      "The Advisor is surfacing the core tradeoff or tension",
  Reflect:      "The Advisor is preparing a structural decision map",
  Escalate:     "This decision has been escalated to a full Quorum session",
  Booked:       "Your session is confirmed — the Quorum team will be in touch",
  Disqualified: "This decision is outside Quorum's intended scope",
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
  const showCouncil = intel?.DECISION_CATEGORY && intel.DECISION_CATEGORY !== "Not yet identified";
  const isBooked = intel?.STAGE === "Booked";

  return (
    <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
      {!started || !intel ? (
        <div style={{ paddingTop: 8 }}>
          <div style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.7, marginBottom: 20 }}>
            The Advisor will map your decision in real time — identifying what is at stake, what the core tension is, and whether it qualifies for a full Quorum session.
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
              <div style={{ fontSize: 9, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Stakes Assessment</div>
              <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>{STAKES_USER[intel.ESTIMATED_STAKES] || intel.ESTIMATED_STAKES}</div>
            </div>
          )}

          {showCouncil && (
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "13px 14px", boxShadow: C.shadow }}>
              <div style={{ fontSize: 9, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Full Session — How It Works</div>
              <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.65 }}>{COUNCIL_DESCRIPTION}</div>
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

// Mobile: a compact horizontal stand-in for the full Decision Snapshot, docked
// under the header so progress is visible without leaving the chat screen.
function MobileProgressTracker({ intel, C }) {
  const steps = STAGES.slice(0, 5);
  const stageIdx = intel ? steps.findIndex(s => s.key === intel.STAGE) : -1;
  const currentLabel = stageIdx >= 0 ? steps[stageIdx].userLabel : steps[0].userLabel;

  return (
    <div style={{
      padding: "10px 16px 9px", borderBottom: `1px solid ${C.border}`,
      background: C.panel, flexShrink: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        {steps.map((s, i) => {
          const done = stageIdx > i, active = stageIdx === i;
          return (
            <span key={s.key} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : "0 0 auto" }}>
              <span style={{
                width: 9, height: 9, borderRadius: "50%", flexShrink: 0,
                background: done ? C.success : active ? C.accent : "transparent",
                border: `2px solid ${done ? C.success : active ? C.accent : C.borderBright}`,
                boxShadow: active ? `0 0 6px ${C.accentGlow}` : "none",
                transition: "all 0.3s",
              }} />
              {i < steps.length - 1 && (
                <span style={{
                  flex: 1, height: 2, margin: "0 4px",
                  background: stageIdx > i ? C.success : C.border,
                  transition: "background 0.3s",
                }} />
              )}
            </span>
          );
        })}
      </div>
      <div style={{ fontSize: 10, color: C.textDim, marginTop: 6, letterSpacing: "0.02em" }}>
        {currentLabel}
      </div>
    </div>
  );
}

function IntelPanel({ intel, C }) {
  const stageMap = {
    Identify:     { color: "#7c8fff", bg: "rgba(124,143,255,0.12)" },
    Stakes:       { color: "#b06fff", bg: "rgba(176,111,255,0.12)" },
    Tension:      { color: "#ff8fff", bg: "rgba(255,143,255,0.10)" },
    Reflect:      { color: C.warn,    bg: C.warnGlow               },
    Escalate:     { color: C.accentLight, bg: C.accentGlow         },
    Booked:       { color: C.success, bg: C.successGlow            },
    Disqualified: { color: C.danger,  bg: "rgba(245,96,96,0.12)"   },
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
        <div style={{ fontSize: 9, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 7 }}>Last Exchange Type</div>
        <div style={{
          display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700, letterSpacing: "0.05em",
          background: intel.EXCHANGE_TYPE === "DECISION" ? C.accentGlow : C.border,
          color:      intel.EXCHANGE_TYPE === "DECISION" ? C.accentLight : C.textMuted,
        }}>{intel.EXCHANGE_TYPE || "—"}</div>
        <div style={{ fontSize: 10, color: C.textDim, marginTop: 6 }}>Only DECISION exchanges count toward the 3–5 target</div>
      </div>

      <div style={cardStyle}>
        <div style={{ fontSize: 9, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 7 }}>Council Config</div>
        <div style={{ fontSize: 11.5, color: C.textMuted, lineHeight: 1.65 }}>{COUNCIL_DESCRIPTION} (fixed — not session-specific)</div>
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


// ─── Booking card — calendar + time picker ───────────────────────────────────
function BookingCard({ sessionId, source, C, onComplete }) {
  const today = new Date(); today.setHours(0, 0, 0, 0);

  const [name,         setName]         = useState("");
  const [email,        setEmail]        = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [viewDate,     setViewDate]     = useState(new Date());
  const [busy,         setBusy]         = useState(false);
  const [done,         setDone]         = useState(false);
  const [error,        setError]        = useState("");

  const DAYS   = ["Su","Mo","Tu","We","Th","Fr","Sa"];
  const MONTHS = ["January","February","March","April","May","June",
                  "July","August","September","October","November","December"];
  const SLOTS  = ["9:00 AM","10:00 AM","11:00 AM","12:00 PM",
                  "2:00 PM","3:00 PM","4:00 PM","5:00 PM","6:00 PM"];

  const yr  = viewDate.getFullYear();
  const mo  = viewDate.getMonth();
  const firstDay    = new Date(yr, mo, 1).getDay();
  const daysInMonth = new Date(yr, mo + 1, 0).getDate();

  const isPast     = (d) => new Date(yr, mo, d) < today;
  const isToday    = (d) => new Date(yr, mo, d).getTime() === today.getTime();
  const isSelected = (d) => selectedDate &&
    selectedDate.getDate() === d && selectedDate.getMonth() === mo && selectedDate.getFullYear() === yr;

  const canGoPrev = () => {
    const prev = new Date(yr, mo - 1, 1);
    const now  = new Date(); now.setDate(1); now.setHours(0,0,0,0);
    return prev >= now;
  };

  const selectDay = (d) => {
    if (isPast(d)) return;
    setSelectedDate(new Date(yr, mo, d));
    setSelectedTime(null);
  };

  const formatFinal = () =>
    selectedDate && selectedTime
      ? `${MONTHS[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()} at ${selectedTime}`
      : null;

  const valid = name.trim() && email.trim() && email.includes("@") && selectedDate && selectedTime;

  const handleBook = async () => {
    if (!valid || busy) return;
    setBusy(true); setError("");
    try {
      const res = await fetch("/api/leads/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id:    sessionId,
          source:        source,
          prospect_name: name.trim(),
          prospect_email: email.trim(),
          preferred_time: formatFinal(),
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setDone(true); onComplete?.();
    } catch {
      setError("Something went wrong — please try again.");
      setBusy(false);
    }
  };

  const inp = {
    width: "100%", background: C.bg, border: `1px solid ${C.borderBright}`,
    borderRadius: 8, padding: "9px 13px", color: C.text, fontSize: 13,
    outline: "none", fontFamily: "inherit", transition: "border-color 0.2s",
  };

  // ── Confirmation screen ──
  if (done) {
    return (
      <div style={{
        margin: "8px 0 8px 36px", background: C.successGlow,
        border: `1px solid ${C.success}`, borderRadius: 14, padding: "20px 22px",
        animation: "glow 2.5s ease-in-out infinite",
      }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.success, marginBottom: 8 }}>✓ Session confirmed</div>
        <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.65 }}>
          You will receive a calendar invite at <strong style={{ color: C.text }}>{email}</strong> shortly.
          Quorum will arrive prepared with a structured brief on your decision.
        </div>
        <div style={{ marginTop: 12, fontSize: 12, color: C.success, fontWeight: 600 }}>
          {formatFinal()}
        </div>
        <div style={{ marginTop: 14, fontSize: 11, color: C.textDim }}>
          More on Quorum: <a href="https://quorumvault.org" target="_blank" rel="noopener noreferrer" style={{ color: C.textMuted, textDecoration: "underline" }}>quorumvault.org</a>
        </div>
      </div>
    );
  }

  // ── Booking form ──
  return (
    <div style={{
      margin: "8px 0 8px 36px", background: C.card,
      border: `1px solid ${C.accent}`, borderRadius: 14, padding: "20px 22px",
      boxShadow: `0 0 24px ${C.accentGlow}`,
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 3 }}>Book your Quorum session</div>
      <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 18, lineHeight: 1.5 }}>
        25 minutes — extends if the conversation is going well. We arrive prepared with a structured brief on your decision.
      </div>

      {/* Name + Email */}
      <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        <input type="text"  placeholder="Your name *"  value={name}  onChange={e => setName(e.target.value)}
          style={inp} onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.borderBright} />
        <input type="email" placeholder="Your email *" value={email} onChange={e => setEmail(e.target.value)}
          style={inp} onFocus={e => e.target.style.borderColor = C.accent} onBlur={e => e.target.style.borderColor = C.borderBright} />
      </div>

      {/* Calendar */}
      <div style={{ background: C.bg, borderRadius: 10, padding: "14px", border: `1px solid ${C.border}`, marginBottom: 14 }}>
        {/* Month nav */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <button onClick={() => canGoPrev() && setViewDate(new Date(yr, mo - 1, 1))}
            style={{ background: "none", border: "none", cursor: canGoPrev() ? "pointer" : "default",
              color: canGoPrev() ? C.textMuted : C.textDim, fontSize: 16, padding: "0 4px", lineHeight: 1 }}>‹</button>
          <span style={{ fontSize: 12, fontWeight: 700, color: C.text, letterSpacing: "0.04em" }}>
            {MONTHS[mo]} {yr}
          </span>
          <button onClick={() => setViewDate(new Date(yr, mo + 1, 1))}
            style={{ background: "none", border: "none", cursor: "pointer",
              color: C.textMuted, fontSize: 16, padding: "0 4px", lineHeight: 1 }}>›</button>
        </div>

        {/* Day headers */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", marginBottom: 6 }}>
          {DAYS.map(d => (
            <div key={d} style={{ textAlign: "center", fontSize: 9, fontWeight: 700,
              color: C.textDim, letterSpacing: "0.06em", paddingBottom: 4 }}>{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
          {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const d   = i + 1;
            const sel = isSelected(d);
            const tod = isToday(d);
            const pas = isPast(d);
            return (
              <div key={d} onClick={() => selectDay(d)} style={{
                width: 30, height: 30, borderRadius: "50%", margin: "0 auto",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: sel ? 700 : 400, cursor: pas ? "default" : "pointer",
                background: sel ? `linear-gradient(135deg,#5c55f0,#9b6cf7)` : tod ? C.accentGlow : "transparent",
                color: sel ? "white" : pas ? C.textDim : tod ? C.accent : C.text,
                border: tod && !sel ? `1px solid ${C.accent}` : "1px solid transparent",
                transition: "all 0.15s",
                opacity: pas ? 0.35 : 1,
              }}>{d}</div>
            );
          })}
        </div>
      </div>

      {/* Time slots — appear after date selected */}
      {selectedDate && (
        <div style={{ background: C.bg, borderRadius: 10, padding: "14px", border: `1px solid ${C.border}`, marginBottom: 14 }}>
          <div style={{ fontSize: 9, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.1em",
            marginBottom: 10, fontWeight: 700 }}>
            Select time — {MONTHS[selectedDate.getMonth()]} {selectedDate.getDate()}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 }}>
            {SLOTS.map(slot => {
              const active = selectedTime === slot;
              return (
                <button key={slot} onClick={() => setSelectedTime(slot)} style={{
                  padding: "8px 4px", borderRadius: 8, border: `1px solid ${active ? C.accent : C.borderBright}`,
                  background: active ? `linear-gradient(135deg,#5c55f0,#9b6cf7)` : C.card,
                  color: active ? "white" : C.textMuted, fontSize: 11, fontWeight: active ? 700 : 400,
                  cursor: "pointer", letterSpacing: "0.02em", transition: "all 0.15s",
                  boxShadow: active ? "0 2px 10px rgba(92,85,240,0.35)" : "none",
                }}>{slot}</button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected summary */}
      {selectedDate && selectedTime && (
        <div style={{ fontSize: 11, color: C.accent, fontWeight: 600, marginBottom: 10, textAlign: "center" }}>
          {MONTHS[selectedDate.getMonth()]} {selectedDate.getDate()}, {yr} · {selectedTime}
        </div>
      )}

      {error && <div style={{ fontSize: 11, color: C.danger, marginBottom: 10 }}>{error}</div>}

      <button onClick={handleBook} disabled={!valid || busy} style={{
        width: "100%", padding: "11px", borderRadius: 9, border: "none",
        cursor: valid && !busy ? "pointer" : "default",
        background: valid && !busy ? "linear-gradient(135deg,#5c55f0,#9b6cf7)" : C.border,
        color: valid && !busy ? "white" : C.textDim, fontSize: 13, fontWeight: 700,
        letterSpacing: "0.02em", transition: "all 0.2s",
        boxShadow: valid && !busy ? "0 4px 14px rgba(92,85,240,0.35)" : "none",
      }}>{busy ? "Confirming…" : "Confirm session →"}</button>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function QuorumSDR() {
  const [isDark,    setIsDark]    = useState(false);
  const C = isDark ? DARK : LIGHT;

  const [messages,  setMessages]  = useState([]);
  const [input,     setInput]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [intel,     setIntel]     = useState(null);
  const [history,   setHistory]   = useState([]);
  const [started,   setStarted]   = useState(false);
  const [qualified,    setQualified]    = useState(false);
  const [userExchanges, setUserExchanges] = useState(0);   // counts all prospect messages (not the Hello)
  const [decisionExchanges, setDecisionExchanges] = useState(0); // counts only decision-relevant exchanges
  const [showBooking,   setShowBooking]   = useState(false);
  const [bookingDone,   setBookingDone]   = useState(false);
  const [isMobile,      setIsMobile]      = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ── Session tracking (lead write) ──────────────────────────────────────────
  const sessionId      = useRef(genSessionId());
  const hasWrittenLead = useRef(false);

  // ── Source tracking — where did this visitor come from? ───────────────────
  // Reads ?source=apollo_email / website / linkedin from the URL.
  // Falls back to "direct" if no param is present (e.g. typed URL, bookmark).
  const source = useRef((() => {
    try {
      const s = new URLSearchParams(window.location.search).get("source");
      return s ? s.toLowerCase().trim() : "direct";
    } catch { return "direct"; }
  })());

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
      // Extract verbatim user decision — first real user message (index 2, after Hello at 0)
      const verbatimDecision = snap
        .filter(m => m.role === "user")
        .slice(1, 2)   // skip the initial "Hello." — first real answer is the decision
        .map(m => stripInternal(typeof m.content === "string" ? m.content : ""))
        .join(" ") || null;

      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id:               sessionId.current,
          source:                   source.current,
          user_decision:            verbatimDecision,
          decision_category:        intelData.DECISION_CATEGORY        || null,
          estimated_stakes:         intelData.ESTIMATED_STAKES         || null,
          importance_score:         parseInt(intelData.IMPORTANCE_SCORE) || null,
          complexity_score:         parseInt(intelData.COMPLEXITY_SCORE) || null,
          fit_score:                parseInt(intelData.FIT_SCORE)        || null,
          likelihood_of_booking:    intelData.LIKELIHOOD_OF_BOOKING    || null,
          recommended_next_message: intelData.RECOMMENDED_NEXT_MESSAGE || null,
          council_config:           COUNCIL_DESCRIPTION,
          conversation_snapshot:    snap.map(m => ({
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
  const callAPI = async (msgs, decisionExCount = 0) => {
    let systemContent = SYSTEM_PROMPT;
    if (decisionExCount === 2) {
      systemContent += "\n\nNote: You have 2 decision-relevant exchanges so far. If you have identified a concrete decision, meaningful stakes, and at least one core tension, begin your decision map reflection now (Stage: Reflect).";
    } else if (decisionExCount === 3) {
      systemContent += "\n\nNote: You have 3 decision-relevant exchanges — at the lower end of the target range. If the decision, stakes, and core tension are clear, deliver the decision map reflection and escalate to booking. Only continue asking if critical context is genuinely missing.";
    } else if (decisionExCount >= 4) {
      systemContent += "\n\nNote: You are at or beyond the 3-5 exchange target. Deliver the decision map reflection and escalate to booking in this message. Do not ask further questions unless the decision itself is still unidentified.";
    }
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "deepseek-v4-pro",
        max_tokens: 2000,
        messages: [{ role: "system", content: systemContent }, ...msgs],
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
      // Escalate replaces Invite; Booked also triggers; Disqualified does not
      if (parsed.STAGE === "Escalate" || parsed.STAGE === "Booked") {
        setShowBooking(true);
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
    const nextExchanges = userExchanges + 1;
    setUserExchanges(nextExchanges);
    setMessages(p => [...p, { role: "user", text }]);
    setLoading(true);
    const newHistory = [...history, { role: "user", content: text }];
    try {
      const raw      = await callAPI(newHistory, decisionExchanges);
      const fullHist = [...newHistory, { role: "assistant", content: raw }];
      const visible  = processResponse(raw, fullHist);
      // Only increment decisionExchanges if this exchange was decision-relevant
      const parsed = parseInternal(raw);
      if (parsed?.EXCHANGE_TYPE === "DECISION") {
        setDecisionExchanges(p => p + 1);
      }
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
    <div className="qsdr-shell" style={{
      display: "flex",
      flexDirection: isMobile ? "column" : "row",
      background: C.bg,
      fontFamily: "'Inter', -apple-system, 'Segoe UI', sans-serif",
      overflow: "hidden", transition: "background 0.3s",
    }}>

      {/* ── Chat panel ───────────────────────────────────────────────────── */}
      <div style={{
        flex: 1, minWidth: 0, minHeight: 0,
        display: "flex",
        flexDirection: "column",
        borderRight: !isMobile ? `1px solid ${C.border}` : "none",
      }}>

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

        {isMobile && started && <MobileProgressTracker intel={intel} C={C} />}

        {/* Messages */}
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: isMobile ? "16px 14px" : "28px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
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
                  A structured intake layer for decisions that carry real consequences. Not a coach. Not an AI assistant.
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
            <>
              {messages.map((m, i) => (
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
              ))}
              {showBooking && !loading && (
                <BookingCard
                  sessionId={sessionId.current}
                  source={source.current}
                  C={C}
                  onComplete={() => setBookingDone(true)}
                />
              )}
            </>
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

        {/* Input — hidden once booking card appears */}
        {started && !showBooking && (
          <div style={{ padding: isMobile ? "10px 12px calc(10px + env(safe-area-inset-bottom))" : "16px 24px", borderTop: `1px solid ${C.border}`, background: C.panel, display: "flex", gap: 10, alignItems: "flex-end", flexShrink: 0, boxShadow: C.shadow }}>
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

      {/* ── Right panel — desktop only; mobile uses the inline progress tracker ── */}
      {!isMobile && (
        <div style={{
          width: 300, flexShrink: 0, background: C.panel,
          display: "flex", flexDirection: "column", overflowY: "auto",
        }}>
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
          </div>

          {isOperator
            ? <IntelPanel intel={intel} C={C} />
            : <DecisionSnapshot intel={intel} started={started} C={C} />
          }
        </div>
      )}

      <style>{`
        .qsdr-shell { height: 100vh; height: 100dvh; }
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
