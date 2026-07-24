import type { NextConfig } from 'next';

function checkRequiredVars() {
  const REQUIRED = [
    'DATABASE_URL',
    'GITHUB_CLIENT_ID',
    'GITHUB_CLIENT_SECRET',
    'BETTER_AUTH_SECRET',
    'BETTER_AUTH_URL',
  ] as const;

  const missing: string[] = [];
  for (const name of REQUIRED) {
    if (!process.env[name]) {
      missing.push(name);
    }
  }

  if (missing.length > 0) {
    console.error(`[Config] Missing required environment variables:\n  ${missing.join('\n  ')}`);
    console.error('[Config] The application may not function correctly without these.');
  }
}

if (process.env.NODE_ENV === 'production') {
  checkRequiredVars();
}

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/adapter-pg'],
};

export default nextConfig;
