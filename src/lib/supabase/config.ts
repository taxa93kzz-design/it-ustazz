const publicVariableNames = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
] as const;

export function getMissingSupabasePublicVariables() {
  return publicVariableNames.filter((name) => !process.env[name]);
}

export function getSupabasePublicConfigIssue() {
  const missing = getMissingSupabasePublicVariables();
  if (missing.length) return `Жетіспейтін айнымалы: ${missing.join(", ")}`;
  try {
    const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!);
    if (!["http:", "https:"].includes(url.protocol) || !url.hostname) throw new Error();
  } catch {
    return "NEXT_PUBLIC_SUPABASE_URL мәні жарамды http немесе https адресі емес";
  }
  return null;
}

export function getSupabasePublicConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const issue = getSupabasePublicConfigIssue();
  if (issue) throw new Error(`Supabase баптауы толық емес. ${issue}`);
  return { url: url!, publishableKey: publishableKey! };
}

export function isSupabaseConfigured() {
  return getSupabasePublicConfigIssue() === null;
}
