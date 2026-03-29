import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

type CookieStore = Awaited<ReturnType<typeof cookies>>;
type CookieToSet = {
  name: string;
  value: string;
  options?: Parameters<CookieStore["set"]>[2];
};

function resolveSupabaseUrl(rawUrl: string | undefined, anonKey: string) {
  try {
    const payloadPart = anonKey.split(".")[1];
    const payload = JSON.parse(Buffer.from(payloadPart, "base64url").toString());
    const ref = payload?.ref as string | undefined;
    if (!ref) return rawUrl;

    const derivedUrl = `https://${ref}.supabase.co`;
    if (!rawUrl) return derivedUrl;

    const currentHost = new URL(rawUrl).host;
    const expectedHost = new URL(derivedUrl).host;
    if (currentHost !== expectedHost) return derivedUrl;

    return rawUrl;
  } catch {
    return rawUrl;
  }
}

export async function createClient() {
  const cookieStore = await cookies();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseUrl = resolveSupabaseUrl(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey || ""
  );

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Configure them in .env.local."
    );
  }

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}
