// Supabase client for the mobile app. The browser SDK needs a URL
// polyfill on React Native; `react-native-url-polyfill/auto` installs
// it on import. We disable session auto-refresh — mobile controls its
// own refresh cycle via expo-secure-store + a boot-time hydrate.

import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

const url =
  process.env.EXPO_PUBLIC_SUPABASE_URL
  ?? (Constants.expoConfig?.extra as { supabaseUrl?: string } | undefined)?.supabaseUrl
  ?? "";
const anonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
  ?? (Constants.expoConfig?.extra as { supabaseAnonKey?: string } | undefined)?.supabaseAnonKey
  ?? "";

if (!url || !anonKey) {
  // eslint-disable-next-line no-console
  console.warn(
    "[supabase] EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY missing — auth calls will fail.",
  );
}

export const supabase = createClient(url || "https://placeholder.supabase.co", anonKey || "placeholder", {
  auth: {
    // We hydrate the session manually via setSession() after reading
    // the tokens from SecureStore — avoids AsyncStorage dependency.
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
