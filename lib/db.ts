import { getRequestContext } from "@cloudflare/next-on-pages";
import { CloudflareEnv } from "@/types/env";

export function getDb() {
  try {
    const context = getRequestContext();
    if (context && (context as any).env && (context as any).env.DB) {
      return (context as any).env.DB;
    }
  } catch (e) {
    console.error("Failed to get D1 context:", e);
  }
  
  // Return null or handle local fallback if desired
  return null;
}
