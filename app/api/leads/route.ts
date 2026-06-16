// app/api/leads/route.ts
import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST — SDR client writes a qualified lead
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      session_id, source, user_decision, decision_category, estimated_stakes,
      importance_score, complexity_score, fit_score,
      likelihood_of_booking, recommended_next_message,
      council_config, conversation_snapshot,
    } = body;

    if (!session_id) {
      return Response.json({ error: "Missing session_id" }, { status: 400 });
    }

    const { error } = await supabase.from("leads").upsert(
      {
        session_id,
        source:                   source                   || "direct",
        user_decision:            user_decision            || null,
        decision_category:        decision_category        || null,
        estimated_stakes:         estimated_stakes         || null,
        importance_score:         importance_score         || null,
        complexity_score:         complexity_score         || null,
        fit_score:                fit_score                || null,
        likelihood_of_booking:    likelihood_of_booking    || null,
        recommended_next_message: recommended_next_message || null,
        council_config:           council_config           || null,
        conversation_snapshot:    conversation_snapshot    || [],
      },
      { onConflict: "session_id" }
    );

    if (error) {
      console.error("Supabase write error:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Lead write failed:", err);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}

// PATCH — admin marks session booked or adds notes
export async function PATCH(req: NextRequest) {
  try {
    const { session_id, ...updates } = await req.json();
    const { error } = await supabase
      .from("leads")
      .update(updates)
      .eq("session_id", session_id);
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
