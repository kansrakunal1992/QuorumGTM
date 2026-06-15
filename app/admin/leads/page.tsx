"use client";
// app/admin/leads/page.tsx

import { useState, useEffect } from "react";

interface Lead {
  id: string;
  session_id: string;
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

const C = {
  bg: "#07080f", panel: "#0c0d18", card: "#111220",
  border: "#1c1d2e", borderBright: "#2a2b42",
  text: "#dde1f0", textMuted: "#5a5f7a", textDim: "#3a3f58",
  accent: "#6c63ff", success: "#22d3a0", successGlow: "rgba(34,211,160,0.12)",
  warn: "#f5a623", warnGlow: "rgba(245,166,35,0.10)", danger: "#f56060",
};

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function scoreColor(n: number | null) {
  if (!n) return C.textDim;
  return n >= 7 ? C.success : n >= 4 ? C.warn : C.danger;
}

function ScorePill({ label, value }: { label: string; value: number | null }) {
  const color = scoreColor(value);
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

function StakesBadge({ value }: { value: string | null }) {
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

function StatCard({ label, value, color = C.text }: { label: string; value: string | number; color?: string }) {
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: "16px 20px", flex: 1 }}>
      <div style={{ fontSize: 9, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color, letterSpacing: "-0.02em" }}>{value}</div>
    </div>
  );
}

export default function AdminLeadsPage() {
  const [leads,     setLeads]     = useState<Lead[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [expanded,  setExpanded]  = useState<string | null>(null);
  const [saving,    setSaving]    = useState<string | null>(null);
  const [noteEdits, setNoteEdits] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/admin/leads")
      .then(r => r.json())
      .then(d => { setLeads(d.leads || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const thisWeek = leads.filter(l => {
    const diff = (Date.now() - new Date(l.qualified_at).getTime()) / 86400000;
    return diff <= 7;
  }).length;

  const fittedLeads  = leads.filter(l => l.fit_score);
  const avgFit = fittedLeads.length
    ? (fittedLeads.reduce((s, l) => s + (l.fit_score || 0), 0) / fittedLeads.length).toFixed(1)
    : "—";
  const booked = leads.filter(l => l.session_booked).length;

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
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter',-apple-system,sans-serif", color: C.text }}>
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
          <div style={{
            padding: "4px 12px", borderRadius: 20,
            background: C.warnGlow, border: `1px solid ${C.warn}`,
            color: C.warn, fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
          }}>⚙ OPERATOR</div>
        </div>
      </div>

      <div style={{ padding: "28px 32px", maxWidth: 1100, margin: "0 auto" }}>
        {/* Stats */}
        <div style={{ display: "flex", gap: 14, marginBottom: 28 }}>
          <StatCard label="Total Qualified" value={leads.length}  color={C.accent}  />
          <StatCard label="This Week"       value={thisWeek}      color={C.text}    />
          <StatCard label="Avg Fit Score"   value={avgFit}        color={C.success} />
          <StatCard label="Sessions Booked" value={booked}        color={C.warn}    />
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: C.textDim }}>Loading leads…</div>
        ) : leads.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", background: C.card, borderRadius: 12, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 28, marginBottom: 12, opacity: 0.15 }}>◈</div>
            <div style={{ color: C.textDim, fontSize: 13 }}>No qualified leads yet</div>
            <div style={{ color: C.textDim, fontSize: 11, marginTop: 4 }}>They will appear here as prospects qualify through the SDR</div>
          </div>
        ) : (
          <div style={{ borderRadius: 12, overflow: "hidden", border: `1px solid ${C.border}` }}>
            {/* Column headers */}
            <div style={{
              display: "grid", gridTemplateColumns: "155px 1fr 100px 140px 100px 120px",
              background: "#0a0b16", padding: "10px 20px", borderBottom: `1px solid ${C.border}`,
            }}>
              {["Date Qualified", "Decision", "Stakes", "Scores (I / C / F)", "Booking", "Status"].map(h => (
                <div key={h} style={{ fontSize: 9, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}>{h}</div>
              ))}
            </div>

            {leads.map((lead, i) => {
              const isExp    = expanded === lead.id;
              const isBooked = lead.session_booked;
              const rowBg    = isExp ? C.card : (i % 2 === 0 ? C.bg : "#0a0b14");

              return (
                <div key={lead.id} style={{ borderBottom: i < leads.length - 1 ? `1px solid ${C.border}` : "none" }}>
                  {/* Row */}
                  <div
                    onClick={() => setExpanded(p => p === lead.id ? null : lead.id)}
                    style={{
                      display: "grid", gridTemplateColumns: "155px 1fr 100px 140px 100px 120px",
                      padding: "13px 20px", cursor: "pointer", background: rowBg,
                      alignItems: "center", transition: "background 0.2s",
                    }}
                  >
                    <div style={{ fontSize: 11, color: C.textMuted }}>{fmtDate(lead.qualified_at)}</div>
                    <div style={{ fontSize: 12, color: C.text, fontWeight: 500, lineHeight: 1.4, paddingRight: 12 }}>
                      {lead.decision_category || <span style={{ color: C.textDim }}>Not captured</span>}
                    </div>
                    <div><StakesBadge value={lead.estimated_stakes} /></div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <ScorePill label="IMP" value={lead.importance_score} />
                      <ScorePill label="CPX" value={lead.complexity_score} />
                      <ScorePill label="FIT" value={lead.fit_score} />
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
                      {/* Left: conversation + council */}
                      <div>
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
                          <div style={{ marginTop: 16, padding: "12px", background: "#0a0b14", borderRadius: 8, border: `1px solid ${C.border}` }}>
                            <div style={{ fontSize: 9, color: C.textDim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Council Config</div>
                            <div style={{ fontSize: 12, color: C.textMuted, lineHeight: 1.6 }}>{lead.council_config}</div>
                          </div>
                        )}
                      </div>

                      {/* Right: recommended move + notes + book button */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                        {(lead.prospect_name || lead.prospect_email) && (
                          <div style={{ padding: "12px", background: "#0a0b14", borderRadius: 8, border: `1px solid ${C.success}22` }}>
                            <div style={{ fontSize: 9, color: C.success, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, fontWeight: 700 }}>✓ Booking Received</div>
                            {lead.prospect_name  && <div style={{ fontSize: 12, color: C.text,    marginBottom: 4  }}>Name:  {lead.prospect_name}</div>}
                            {lead.prospect_email && <div style={{ fontSize: 12, color: C.text,    marginBottom: 4  }}>Email: <a href={`mailto:${lead.prospect_email}`} style={{ color: C.accent, textDecoration: "none" }}>{lead.prospect_email}</a></div>}
                            {lead.preferred_time && <div style={{ fontSize: 12, color: C.textMuted }}> Preferred time: {lead.preferred_time}</div>}
                          </div>
                        )}

                        {lead.recommended_next_message && (
                          <div style={{ padding: "12px", background: "#0a0b14", borderRadius: 8, border: `1px solid ${C.border}` }}>
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
                              width: "100%", background: "#0a0b14", border: `1px solid ${C.borderBright}`,
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
        textarea::placeholder { color:#3a3f58; }
      `}</style>
    </div>
  );
}
