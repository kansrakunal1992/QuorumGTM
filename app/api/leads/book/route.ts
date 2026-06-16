// app/api/leads/book/route.ts
// Called when a prospect submits the in-app booking card

import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { session_id, source, prospect_name, prospect_email, preferred_time } = await req.json();

    if (!session_id || !prospect_name || !prospect_email) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Upsert — creates row if somehow it doesn't exist yet, updates if it does.
    // source included as a fallback in case this fires before the qualification
    // write (which normally sets it first).
    const { error } = await supabase.from("leads").upsert(
      {
        session_id,
        source:                 source || "direct",
        prospect_name,
        prospect_email,
        preferred_time:         preferred_time || null,
        booking_requested_at:   new Date().toISOString(),
        session_booked:         true,
      },
      { onConflict: "session_id" }
    );

    if (error) {
      console.error("Booking write error:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Booking failed:", err);
    return Response.json({ error: "Internal error" }, { status: 500 });
  }
}
