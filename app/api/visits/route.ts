// app/api/visits/route.ts
import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST — SDR client logs a page visit (fires on every load, no qualification gate).
// Upserts on session_id so refreshes/re-renders don't double count, then returns
// the running total so the widget can show a live counter without a second call.
export async function POST(req: NextRequest) {
  try {
    const { session_id, source } = await req.json();

    if (!session_id) {
      return Response.json({ error: "Missing session_id" }, { status: 400 });
    }

    const { error: upsertError } = await supabase.from("visits").upsert(
      {
        session_id,
        source: source || "direct",
      },
      { onConflict: "session_id" }
    );

    if (upsertError) {
      console.error("Supabase visit write error:", upsertError);
      return Response.json({ error: upsertError.message }, { status: 500 });
    }

    const { count, error: countError } = await supabase
      .from("visits")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("Supabase visit count error:", countError);
      return Response.json({ ok: true, total: null });
    }

    return Response.json({ ok: true, total: count });
  } catch (err) {
    console.error("Visit log failed:", err);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}

// GET — admin dashboard: total visit count
export async function GET() {
  const { count, error } = await supabase
    .from("visits")
    .select("*", { count: "exact", head: true });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ total: count });
}
