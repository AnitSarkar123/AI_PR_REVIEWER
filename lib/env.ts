const REQUIRED_VARS = [
  "DATABASE_URL",
  "GITHUB_CLIENT_ID",
  "GITHUB_CLIENT_SECRET",
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
] as const;

const OPTIONAL_VARS = [
  "GITHUB_WEBHOOK_SECRET",
  "OPENAI_COMPATIBLE_API_KEY",
  "OPENAI_COMPATIBLE_BASE_URL",
  "OPENAI_COMPATIBLE_MODEL",
  "PINECONE_DB_API_KEY",
  "PINECONE_INDEX_NAME",
  "POLAR_ACCESS_TOKEN",
  "POLAR_WEBHOOK_SECRET",
  "POLAR_SERVER",
  "INNGEST_EVENT_KEY",
  "INNGEST_SIGNING_KEY",
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_APP_BASE_URL",
  "POLAR_SUCCESS_URL",
] as const;

export type EnvVar = (typeof REQUIRED_VARS)[number] | (typeof OPTIONAL_VARS)[number];

export function checkRequiredEnvVars(): { missing: string[]; ok: boolean } {
  const missing: string[] = [];

  for (const name of REQUIRED_VARS) {
    if (!process.env[name]) {
      missing.push(name);
    }
  }

  return {
    missing,
    ok: missing.length === 0,
  };
}

export function getEnvVar(name: EnvVar, fallback?: string): string {
  const value = process.env[name] || fallback;
  if (!value) {
    const isRequired = (REQUIRED_VARS as readonly string[]).includes(name);
    if (isRequired) {
      console.warn(`[env] Required variable ${name} is not set`);
    }
    return "";
  }
  return value;
}

export function getPineconeIndexName(): string {
  return process.env.PINECONE_INDEX_NAME || "ai-pr-reviewer-index";
}