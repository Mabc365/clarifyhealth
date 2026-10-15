import { toast } from "@/hooks/use-toast";

// Handles gated AI errors from edge functions. Returns true if handled.
export async function handleAiGateError(error: unknown, navigate: (to: string) => void): Promise<boolean> {
  // Supports supabase FunctionsHttpError ({ context: Response }) and aiInvoke's { status, message }.
  const e = error as { context?: Response; status?: number } | null;
  const status = typeof e?.context?.status === "number" ? e.context.status : e?.status;
  if (typeof status !== "number") return false;
  const ctx = { status };
  if (ctx.status === 401) {
    toast({ title: "Please sign in", description: "Sign in to use AI tools." });
    navigate("/login");
    return true;
  }
  if (ctx.status === 403) {
    toast({ title: "Plus required", description: "AI tools need a Plus plan, or you have used this month's AI uses." });
    navigate("/checkout");
    return true;
  }
  return false;
}
