// app/api/admin/leads/route.ts
import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET — fetch all leads for admin dashboard
export async function GET() {
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .order("qualified_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ leads: data });
}

// PATCH — mark booked or save notes from admin dashboard
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
