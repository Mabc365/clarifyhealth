import { toast } from "@/hooks/use-toast";

// Handles gated AI errors from edge functions. Returns true if handled.
export async function handleAiGateError(error: unknown, navigate: (to: string) => void): Promise<boolean> {
  const ctx = (error as { context?: Response })?.context;
  if (!ctx || typeof ctx.status !== "number") return false;
  if (ctx.status === 401) {
    toast({ title: "Please sign in", description: "Sign in to use AI tools." });
    navigate("/login");
    return true;
  }
  if (ctx.status === 403) {
    toast({ title: "Monthly AI limit reached", description: "Upgrade to Plus for more AI uses." });
    navigate("/checkout");
    return true;
  }
  return false;
}
