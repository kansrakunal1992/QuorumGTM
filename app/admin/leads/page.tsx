"use client";
// app/admin/leads/page.tsx

import { useState, useEffect } from "react";

interface Lead {
  id: string;
  session_id: string;
  source: string | null;
  user_decision: string | null;
  decision_category: string | null;
  estimated_stakes: string | null;
  importance_score: number | null;
  complexity_score: number | null;
  fit_score: number | null;
  likelihood_of_booking: string | null;
  recommended_next_message: string | null;
  council_config: string | null;
  conversation_snapshot: Array<{ role: string; content: string }> | null;
  qualified_at: string;
  session_booked: boolean;
  notes: string | null;
  prospect_name: string | null;
  prospect_email: string | null;
  preferred_time: string | null;
  booking_requested_at: string | null;
}

const DARK_THEME = {
  bg: "#07080f", panel: "#0c0d18", card: "#111220",
  border: "#1c1d2e", borderBright: "#2a2b42",
  text: "#dde1f0", textMuted: "#5a5f7a", textDim: "#3a3f58",
  accent: "#6c63ff", success: "#22d3a0", successGlow: "rgba(34,211,160,0.12)",
  warn: "#f5a623", warnGlow: "rgba(245,166,35,0.10)", danger: "#f56060",
  toggleBg: "#1c1d2e", inputBg: "#0a0b14",
};

const LIGHT_THEME = {
  bg: "#f4f5fb", panel: "#ffffff", card: "#eef0f8",
  border: "#e2e4f0", borderBright: "#cdd0e8",
  text: "#18192e", textMuted: "#555a7a", textDim: "#9aa0c0",
  accent: "#5c55f0", success: "#0d9e75", successGlow: "rgba(13,158,117,0.10)",
  warn: "#c97706", warnGlow: "rgba(201,119,6,0.10)", danger: "#dc2626",
  toggleBg: "#e8eaf5", inputBg: "#f0f1f8",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function scoreColor(n: number | null, C: typeof DARK_THEME) {
  if (!n) return C.textDim;
  return n >= 7 ? C.success : n >= 4 ? C.warn : C.danger;
}

function ScorePill({ label, value, C }: { label: string; value: number | null; C: typeof DARK_THEME }) {
  const color = scoreColor(value, C);
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 9, color: C.textDim, marginBottom: 3, letterSpacing: "0.06em" }}>{label}</div>
      <div style={{
        fontSize: 13, fontWeight: 700, color,
        width: 32, height: 32, borderRadius: "50%",
        border: `2px solid ${color}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: value && value >= 7 ? `0 0 8px ${color}40` : "none",
      }}>{value ?? "—"}</div>
    </div>
  );
}

function StakesBadge({ value, C }: { value: string | null; C: typeof DARK_THEME }) {
  const map: Record<string, { color: string; bg: string }> = {
    Low:      { color: C.textMuted, bg: C.border },
    Medium:   { color: C.warn,      bg: C.warnGlow },
    High:     { color: "#f58a60",   bg: "rgba(245,138,96,0.12)" },
    Critical: { color: C.danger,    bg: "rgba(245,96,96,0.12)" },
  };
  const s = value ? (map[value] || { color: C.textDim, bg: C.border }) : { color: C.textDim, bg: C.border };
  return (
    <span style={{
      padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700,
      background: s.bg, color: s.color, letterSpacing: "0.05em",
    }}>{value || "—"}</span>
  );
}

function SourceBadge({ value, C }: { value: string | null; C: typeof DARK_THEME }) {
  const map: Record<string, { color: string; bg: string; label: string }> = {
    apollo_email: { color: "#7c8fff", bg: "rgba(124,143,255,0.12)", label: "Email"    },
    website:      { color: C.success, bg: C.successGlow,            label: "Website"  },
    linkedin:     { color: "#0a92d8", bg: "rgba(10,146,216,0.12)",   label: "LinkedIn" },
    direct:       { color: C.textMuted, bg: C.border,                label: "Direct"   },
  };
  const s = map[value || "direct"] || map.direct;
  return (
    <span style={{
      padding: "3px 9px", borderRadius: 20, fontSize: 9, fontWeight: 700,
      background: s.bg, color: s.color, letterSpacing: "0.05em", whiteSpace: "nowrap",
    }}>{s.label}</span>
  );
}

function StatCard({ label, value, color, C }: { label: string; value: string | number; color?: string; C: typeof DARK_THEME }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 20px", flex: 1 }}>
      <div style={{ fontSize: 9, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color, letterSpacing: "-0.02em" }}>{value}</div>
    </div>
  );
}

export default function AdminLeadsPage() {
  const [isDark,    setIsDark]    = useState(false);
  const C = isDark ? DARK_THEME : LIGHT_THEME;

  const [leads,     setLeads]     = useState<Lead[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [expanded,  setExpanded]  = useState<string | null>(null);
  const [saving,    setSaving]    = useState<string | null>(null);
  const [noteEdits, setNoteEdits] = useState<Record<string, string>>({});
  const [sourceFilter, setSourceFilter] = useState<string>("all");

  useEffect(() => {
    fetch("/api/admin/leads")
      .then(r => r.json())
      .then(d => { setLeads(d.leads || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Distinct sources present in the data, for the filter bar
  const availableSources = Array.from(new Set(leads.map(l => l.source || "direct")));

  const filteredLeads = sourceFilter === "all"
    ? leads
    : leads.filter(l => (l.source || "direct") === sourceFilter);

  const thisWeek = filteredLeads.filter(l => {
    const diff = (Date.now() - new Date(l.qualified_at).getTime()) / 86400000;
    return diff <= 7;
  }).length;

  const fittedLeads  = filteredLeads.filter(l => l.fit_score);
  const avgFit = fittedLeads.length
    ? (fittedLeads.reduce((s, l) => s + (l.fit_score || 0), 0) / fittedLeads.length).toFixed(1)
    : "—";
  const booked = filteredLeads.filter(l => l.session_booked).length;

  const markBooked = async (lead: Lead) => {
    setSaving(lead.session_id);
    const next = !lead.session_booked;
    await fetch("/api/admin/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: lead.session_id, session_booked: next }),
    });
    setLeads(p => p.map(l => l.session_id === lead.session_id ? { ...l, session_booked: next } : l));
    setSaving(null);
  };

  const saveNote = async (lead: Lead) => {
    setSaving(lead.session_id + "_note");
    const note = noteEdits[lead.session_id] ?? lead.notes ?? "";
    await fetch("/api/admin/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: lead.session_id, notes: note }),
    });
    setLeads(p => p.map(l => l.session_id === lead.session_id ? { ...l, notes: note } : l));
    setSaving(null);
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter',-apple-system,sans-serif", color: C.text, transition: "background 0.3s, color 0.3s" }}>
      {/* Header */}
      <div style={{ padding: "16px 32px", borderBottom: `1px solid ${C.border}`, background: C.panel, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 9,
          background: "linear-gradient(135deg,#5c55f0,#9b6cf7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, fontWeight: 800, color: "white",
        }}>Q</div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Quorum</div>
          <div style={{ fontSize: 10, color: C.textMuted, letterSpacing: "0.08em", textTransform: "uppercase" }}>Admin — Qualified Leads</div>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          <a href="/" style={{ fontSize: 11, color: C.textMuted, textDecoration: "none" }}>← Back to SDR</a>
          <button
            onClick={() => setIsDark(p => !p)}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            style={{
              width: 34, height: 20, borderRadius: 10, border: "none",
              cursor: "pointer", background: C.toggleBg,
              position: "relative", transition: "background 0.3s", flexShrink: 0,
            }}
          >
            <div style={{
              width: 14, height: 14, borderRadius: "50%", background: C.accent,
              position: "absolute", top: 3,
              left: isDark ? 3 : 17,
              transition: "left 0.25s cubic-bezier(0.4,0,0.2,1)",
            }} />
          </button>
          <div style={{
            padding: "4px 12px", borderRadius: 20,
            background: C.warnGlow, border: `1px solid ${C.warn}`,
            color: C.warn, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
          }}>⚙ OPERATOR</div>
        </div>
      </div>

      <div style={{ padding: "28px 32px", maxWidth: 1100, margin: "0 auto" }}>
        {/* Stats */}
        <div style={{ display: "flex", gap: 14, marginBottom: 20 }}>
          <StatCard label="Total Qualified" value={filteredLeads.length} color={C.accent}  C={C} />
          <StatCard label="This Week"       value={thisWeek}             color={C.text}    C={C} />
          <StatCard label="Avg Fit Score"   value={avgFit}                color={C.success} C={C} />
          <StatCard label="Sessions Booked" value={booked}                color={C.warn}    C={C} />
        </div>

        {/* Source filter bar */}
        {leads.length > 0 && (
          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
            {["all", ...availableSources].map(s => {
              const active = sourceFilter === s;
              const labelMap: Record<string, string> = {
                all: "All Sources", apollo_email: "Email", website: "Website",
                linkedin: "LinkedIn", direct: "Direct",
              };
              return (
                <button key={s} onClick={() => setSourceFilter(s)} style={{
                  padding: "6px 14px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                  border: `1px solid ${active ? C.accent : C.borderBright}`,
                  background: active ? C.accent : "transparent",
                  color: active ? "white" : C.textMuted,
                  cursor: "pointer", transition: "all 0.15s", letterSpacing: "0.02em",
                }}>{labelMap[s] || s}</button>
              );
            })}
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: C.textDim }}>Loading leads…</div>
        ) : filteredLeads.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", background: C.card, borderRadius: 12, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 28, marginBottom: 12, opacity: 0.15 }}>◈</div>
            <div style={{ color: C.textDim, fontSize: 13 }}>{leads.length === 0 ? "No qualified leads yet" : "No leads from this source yet"}</div>
            <div style={{ color: C.textDim, fontSize: 11, marginTop: 4 }}>They will appear here as prospects qualify through the SDR</div>
          </div>
        ) : (
          <div style={{ borderRadius: 12, overflow: "hidden", border: `1px solid ${C.border}` }}>
            {/* Column headers */}
            <div style={{
              display: "grid", gridTemplateColumns: "140px 84px 1fr 90px 130px 90px 110px",
              background: "#0a0b16", padding: "10px 20px", borderBottom: `1px solid ${C.border}`,
            }}>
              {["Date Qualified", "Source", "Decision", "Stakes", "Scores (I / C / F)", "Booking", "Status"].map(h => (
                <div key={h} style={{ fontSize: 9, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>{h}</div>
              ))}
            </div>

            {filteredLeads.map((lead, i) => {
              const isExp    = expanded === lead.id;
              const isBooked = lead.session_booked;
              const rowBg    = isExp ? C.card : (i % 2 === 0 ? C.bg : "#0a0b14");

              return (
                <div key={lead.id} style={{ borderBottom: i < filteredLeads.length - 1 ? `1px solid ${C.border}` : "none" }}>
                  {/* Row */}
                  <div
                    onClick={() => setExpanded(p => p === lead.id ? null : lead.id)}
                    style={{
                      display: "grid", gridTemplateColumns: "140px 84px 1fr 90px 130px 90px 110px",
                      padding: "13px 20px", cursor: "pointer", background: rowBg,
                      alignItems: "center", transition: "background 0.2s",
                    }}
                  >
                    <div style={{ fontSize: 11, color: C.textMuted }}>{fmtDate(lead.qualified_at)}</div>
                    <div><SourceBadge value={lead.source} C={C} /></div>
                    <div style={{ fontSize: 12, color: C.text, fontWeight: 500, lineHeight: 1.4, paddingRight: 12 }}>
                      {lead.decision_category || <span style={{ color: C.textDim }}>Not captured</span>}
                    </div>
                    <div><StakesBadge value={lead.estimated_stakes} C={C} /></div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <ScorePill label="IMP" value={lead.importance_score} C={C} />
                      <ScorePill label="CPX" value={lead.complexity_score} C={C} />
                      <ScorePill label="FIT" value={lead.fit_score} C={C} />
                    </div>
                    <div style={{
                      fontSize: 10, fontWeight: 700,
                      color: lead.likelihood_of_booking === "High" ? C.success
                           : lead.likelihood_of_booking === "Medium" ? C.warn : C.textDim,
                    }}>{lead.likelihood_of_booking || "—"}</div>
                    <div>
                      {isBooked
                        ? <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: C.successGlow, color: C.success, border: `1px solid ${C.success}` }}>✓ Booked</span>
                        : <span style={{ padding: "3px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700, background: C.border, color: C.textMuted }}>Pending</span>
                      }
                    </div>
                  </div>

                  {/* Expanded */}
                  {isExp && (
                    <div style={{
                      background: C.card, borderTop: `1px solid ${C.border}`,
                      padding: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24,
                    }}>
                      {/* Left: verbatim decision + conversation + council */}
                      <div>
                        {lead.user_decision && (
                          <div style={{
                            marginBottom: 16, padding: "12px 14px",
                            background: C.inputBg, borderRadius: 8,
                            borderLeft: `3px solid ${C.accent}`,
                          }}>
                            <div style={{ fontSize: 9, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
                              User&apos;s Decision — Verbatim
                            </div>
                            <div style={{ fontSize: 12, color: C.text, lineHeight: 1.6, fontStyle: "italic" }}>
                              &ldquo;{lead.user_decision}&rdquo;
                            </div>
                          </div>
                        )}

                        <div style={{ fontSize: 9, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Conversation Snapshot</div>
                        {lead.conversation_snapshot?.length ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {lead.conversation_snapshot.map((m, mi) => (
                              <div key={mi} style={{ display: "flex", gap: 10 }}>
                                <div style={{
                                  fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em",
                                  color: m.role === "assistant" ? C.accent : C.textMuted,
                                  minWidth: 55, paddingTop: 2, flexShrink: 0,
                                }}>{m.role === "assistant" ? "Quorum" : "Prospect"}</div>
                                <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.65 }}>{m.content}</div>
                              </div>
                            ))}
                          </div>
                        ) : <div style={{ fontSize: 12, color: C.textDim }}>Not captured</div>}

                        {lead.council_config && lead.council_config !== "TBD" && (
                          <div style={{ marginTop: 16, padding: "12px", background: C.inputBg, borderRadius: 8, border: `1px solid ${C.border}` }}>
                            <div style={{ fontSize: 9, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Council Config</div>
                            <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>{lead.council_config}</div>
                          </div>
                        )}
                      </div>

                      {/* Right: recommended move + notes + book button */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {(lead.prospect_name || lead.prospect_email) && (
                          <div style={{ padding: "12px", background: C.inputBg, borderRadius: 8, border: `1px solid ${C.success}22` }}>
                            <div style={{ fontSize: 9, color: C.success, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, fontWeight: 700 }}>✓ Booking Received</div>
                            {lead.prospect_name  && <div style={{ fontSize: 12, color: C.text,    marginBottom: 4  }}>Name:  {lead.prospect_name}</div>}
                            {lead.prospect_email && <div style={{ fontSize: 12, color: C.text,    marginBottom: 4  }}>Email: <a href={`mailto:${lead.prospect_email}`} style={{ color: C.accent, textDecoration: "none" }}>{lead.prospect_email}</a></div>}
                            {lead.preferred_time && <div style={{ fontSize: 12, color: C.textMuted }}> Preferred time: {lead.preferred_time}</div>}
                          </div>
                        )}

                        {lead.recommended_next_message && (
                          <div style={{ padding: "12px", background: C.inputBg, borderRadius: 8, border: `1px solid ${C.border}` }}>
                            <div style={{ fontSize: 9, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Recommended Next Move</div>
                            <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>{lead.recommended_next_message}</div>
                          </div>
                        )}

                        <div>
                          <div style={{ fontSize: 9, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Your Notes</div>
                          <textarea
                            value={noteEdits[lead.session_id] ?? lead.notes ?? ""}
                            onChange={e => setNoteEdits(p => ({ ...p, [lead.session_id]: e.target.value }))}
                            placeholder="Add notes about this lead…"
                            rows={3}
                            onClick={e => e.stopPropagation()}
                            style={{
                              width: "100%", background: C.inputBg, border: `1px solid ${C.borderBright}`,
                              borderRadius: 8, padding: "10px 12px", color: C.text, fontSize: 12,
                              lineHeight: 1.6, fontFamily: "inherit", resize: "vertical", outline: "none",
                            }}
                          />
                          <button
                            onClick={e => { e.stopPropagation(); saveNote(lead); }}
                            disabled={saving === lead.session_id + "_note"}
                            style={{
                              marginTop: 6, padding: "6px 14px", borderRadius: 7,
                              border: `1px solid ${C.borderBright}`, background: "transparent",
                              color: C.textMuted, fontSize: 11, cursor: "pointer",
                            }}
                          >{saving === lead.session_id + "_note" ? "Saving…" : "Save note"}</button>
                        </div>

                        <button
                          onClick={e => { e.stopPropagation(); markBooked(lead); }}
                          disabled={saving === lead.session_id}
                          style={{
                            padding: "10px 18px", borderRadius: 9, border: "none", cursor: "pointer",
                            fontSize: 12, fontWeight: 700, letterSpacing: "0.02em",
                            background: isBooked ? "rgba(245,96,96,0.1)" : "linear-gradient(135deg,#5c55f0,#9b6cf7)",
                            color: isBooked ? C.danger : "white",
                            boxShadow: isBooked ? "none" : "0 4px 14px rgba(92,85,240,0.35)",
                            transition: "all 0.2s",
                          }}
                        >{saving === lead.session_id ? "Saving…" : isBooked ? "Mark as Not Booked" : "✓ Mark Session as Booked"}</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:3px; }
        ::-webkit-scrollbar-thumb { background:#2a2b42; border-radius:2px; }
        textarea::placeholder { color: #9aa0c0; }
      `}</style>
    </div>
  );
}
