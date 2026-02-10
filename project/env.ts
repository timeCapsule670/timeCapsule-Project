// env.ts
export function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value || value.trim().length === 0) {
    const message = `❌ Missing required environment variable: ${name}`;
    console.error(message);
    throw new Error(message);
  }

  console.info(`✅ Loaded env var: ${name}`);
  return value;
}