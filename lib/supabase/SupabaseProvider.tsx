"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { useSession } from "@clerk/nextjs";

function resolveSupabaseUrl(
  rawUrl: string | undefined,
  anonKey: string | undefined
) {
  if (!anonKey) return rawUrl;

  try {
    const payloadPart = anonKey.split(".")[1];
    const normalized = payloadPart.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const payload = JSON.parse(atob(padded));
    const ref = payload?.ref as string | undefined;
    if (!ref) return rawUrl;

    const derivedUrl = `https://${ref}.supabase.co`;
    if (!rawUrl) return derivedUrl;

    // If URL looks malformed or points to a different project ref, prefer the key-derived URL.
    const currentHost = new URL(rawUrl).host;
    const expectedHost = new URL(derivedUrl).host;
    if (currentHost !== expectedHost) return derivedUrl;

    return rawUrl;
  } catch {
    return rawUrl;
  }
}

type SupabaseContext = {
  supabase: SupabaseClient | null;
  isLoaded: boolean;
};
const Context = createContext<SupabaseContext>({
  supabase: null,
  isLoaded: false,
});

export default function SupabaseProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session } = useSession();
  const [supabase, setSupabase] = useState<SupabaseClient | null>(null);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const supabaseUrl = resolveSupabaseUrl(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  useEffect(() => {
    // Initialize Supabase client regardless of session state
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error(
        "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Add them to .env.local to enable Supabase."
      );
      setSupabase(null);
      setIsLoaded(true);
      return;
    }

    const client = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        accessToken: async () => {
          try {
            return (await session?.getToken({ template: "supabase" })) ?? null;
          } catch {
            return null;
          }
        },
      }
    );

    setSupabase(client);
    setIsLoaded(true);
  }, [supabaseUrl, supabaseAnonKey, session]);

  return (
    <Context.Provider value={{ supabase, isLoaded }}>
      {/* {!isLoaded ? <div> Loading...</div> : children} */}
      {children}
    </Context.Provider>
  );
}

export const useSupabase = () => {
  const context = useContext(Context);
  if (context === undefined) {
    throw new Error("useSupabase needs to be inside the provider");
  }

  return context;
};
