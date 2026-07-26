import 'dotenv/config';

/**
 * Environment is read once, validated, and exported frozen. Nothing else
 * touches `process.env`, so misconfiguration fails at boot rather than on the
 * first request that happens to need a value.
 */

/**
 * dotenv strips the quotes its file syntax requires, but hosting dashboards
 * store what you paste verbatim — so pasting a .env into one leaves the quotes
 * embedded in the value. Normalising here means a quoted CORS_ORIGINS fails
 * loudly at boot rather than silently 403-ing every browser request.
 */
function unquote(value: string): string {
  return value.length > 1 && /^(".*"|'.*')$/s.test(value) ? value.slice(1, -1) : value;
}

function readString(key: string, fallback: string): string {
  const value = process.env[key];
  if (value === undefined) return fallback;

  const unquoted = unquote(value.trim()).trim();
  return unquoted === '' ? fallback : unquoted;
}

function readRequired(key: string): string {
  const value = readString(key, '');
  if (!value) {
    throw new Error(
      `Missing required environment variable ${key}. Copy .env.example to .env and fill it in.`,
    );
  }
  return value;
}

function readPort(key: string, fallback: number): number {
  const raw = process.env[key];
  if (!raw) return fallback;

  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
    throw new Error(`${key} must be an integer between 1 and 65535, received "${raw}".`);
  }
  return parsed;
}

function readBoolean(key: string, fallback: boolean): boolean {
  const raw = process.env[key];
  if (raw === undefined) return fallback;
  return ['1', 'true', 'yes'].includes(raw.trim().toLowerCase());
}

/**
 * Service-account private keys carry literal newlines. Env files and hosting
 * dashboards both tend to store them escaped as "\n", so normalise here —
 * `cert()` rejects the key otherwise.
 */
function readPrivateKey(): string {
  // readRequired has already stripped any wrapping quotes; without that,
  // cert() fails here with an opaque DECODER error.
  const key = readRequired('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n').trim();

  if (!key.includes('BEGIN PRIVATE KEY') || !key.includes('END PRIVATE KEY')) {
    throw new Error(
      'FIREBASE_PRIVATE_KEY does not look like a PEM key. It must run from ' +
        '"-----BEGIN PRIVATE KEY-----" to "-----END PRIVATE KEY-----".',
    );
  }

  // A single-line key decodes as garbage. Catch it here rather than letting
  // cert() report it as an unsupported DECODER routine.
  if (!key.includes('\n')) {
    throw new Error(
      'FIREBASE_PRIVATE_KEY is on one line — its newlines were lost. Paste it ' +
        'with the literal \\n escapes intact, or as a real multi-line value.',
    );
  }

  // cert() rejects a key whose final line is not newline-terminated.
  return key.endsWith('\n') ? key : `${key}\n`;
}

const projectId = readRequired('FIREBASE_PROJECT_ID');

export const env = Object.freeze({
  nodeEnv: readString('NODE_ENV', 'development'),
  port: readPort('PORT', 4000),

  corsOrigins: readString('CORS_ORIGINS', 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),

  firebase: {
    projectId,
    clientEmail: readRequired('FIREBASE_CLIENT_EMAIL'),
    privateKey: readPrivateKey(),
    // Modern Firebase projects use the .firebasestorage.app domain; older ones
    // use .appspot.com. Override explicitly when it differs.
    storageBucket: readString('FIREBASE_STORAGE_BUCKET', `${projectId}.firebasestorage.app`),
  },

  groq: {
    apiKey: readString('GROQ_API_KEY', ''),
    model: readString('GROQ_MODEL', 'llama-3.3-70b-versatile'),
    get enabled(): boolean {
      return this.apiKey.length > 0;
    },
  },

  seedOnEmpty: readBoolean('SEED_ON_EMPTY', true),

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  },
});
