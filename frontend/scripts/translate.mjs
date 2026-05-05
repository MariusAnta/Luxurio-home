#!/usr/bin/env node
/**
 * DeepL auto-translation script.
 *
 * Reads en.json (source-of-truth) and fills missing keys in lt.json / ru.json
 * by calling DeepL's free API. Skips keys already translated.
 *
 * Usage:
 *   1. Put DEEPL_API_KEY=xxxxx in frontend/.env (get free key at https://www.deepl.com/pro-api)
 *   2. npm run i18n:translate
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const LOCALES_DIR = path.join(ROOT, 'src', 'i18n', 'locales');

// --- env loader (no external deps) ---
function loadEnv() {
  const envPath = path.join(ROOT, '.env');
  if (!fs.existsSync(envPath)) return;
  const raw = fs.readFileSync(envPath, 'utf8');
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/i);
    if (!m) continue;
    let val = m[2];
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (!process.env[m[1]]) process.env[m[1]] = val;
  }
}
loadEnv();

const KEY = process.env.DEEPL_API_KEY;
if (!KEY) {
  console.error('Missing DEEPL_API_KEY. Add it to frontend/.env');
  process.exit(1);
}

// DeepL endpoint: free keys end with ":fx"
const ENDPOINT = KEY.endsWith(':fx')
  ? 'https://api-free.deepl.com/v2/translate'
  : 'https://api.deepl.com/v2/translate';

const LANG_MAP = { lt: 'LT', ru: 'RU' };

function readJson(file) {
  if (!fs.existsSync(file)) return {};
  const raw = fs.readFileSync(file, 'utf8').trim();
  return raw ? JSON.parse(raw) : {};
}

function writeJson(file, obj) {
  fs.writeFileSync(file, JSON.stringify(obj, null, 2) + '\n', 'utf8');
}

function getByPath(obj, dottedPath) {
  return dottedPath.split('.').reduce((acc, k) => (acc == null ? acc : acc[k]), obj);
}

function setByPath(obj, dottedPath, value) {
  const parts = dottedPath.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (typeof cur[parts[i]] !== 'object' || cur[parts[i]] === null) cur[parts[i]] = {};
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
}

// Walk EN tree, collect leaf paths
function collectLeaves(obj, prefix = '', out = []) {
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) collectLeaves(v, p, out);
    else if (typeof v === 'string') out.push({ path: p, text: v });
  }
  return out;
}

async function translateBatch(texts, targetLang) {
  // DeepL accepts multiple `text` params per call. Cap batch to keep URLs sane.
  const params = new URLSearchParams();
  for (const t of texts) params.append('text', t);
  params.append('source_lang', 'EN');
  params.append('target_lang', targetLang);
  params.append('preserve_formatting', '1');
  params.append('tag_handling', 'xml'); // protects {{vars}} better
  params.append('ignore_tags', 'x');

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `DeepL-Auth-Key ${KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`DeepL ${res.status}: ${body}`);
  }
  const json = await res.json();
  return json.translations.map((t) => t.text);
}

// Wrap {{var}} placeholders so DeepL doesn't translate them
function protectVars(text) {
  return text.replace(/\{\{([^}]+)\}\}/g, '<x>{{$1}}</x>');
}
function unprotectVars(text) {
  return text.replace(/<x>(\{\{[^}]+\}\})<\/x>/g, '$1');
}

async function run() {
  const en = readJson(path.join(LOCALES_DIR, 'en.json'));
  const leaves = collectLeaves(en);

  for (const [code, deepLCode] of Object.entries(LANG_MAP)) {
    const filePath = path.join(LOCALES_DIR, `${code}.json`);
    const target = readJson(filePath);

    const missing = leaves.filter(({ path: p }) => {
      const existing = getByPath(target, p);
      return typeof existing !== 'string' || existing.trim() === '';
    });

    if (missing.length === 0) {
      console.log(`[${code}] up to date (${leaves.length} keys)`);
      continue;
    }

    console.log(`[${code}] translating ${missing.length} of ${leaves.length} keys...`);

    const BATCH = 40;
    for (let i = 0; i < missing.length; i += BATCH) {
      const slice = missing.slice(i, i + BATCH);
      const sourceTexts = slice.map((m) => protectVars(m.text));
      const translated = await translateBatch(sourceTexts, deepLCode);
      slice.forEach((m, idx) => {
        setByPath(target, m.path, unprotectVars(translated[idx]));
      });
      console.log(`  ${Math.min(i + BATCH, missing.length)}/${missing.length}`);
    }

    writeJson(filePath, target);
    console.log(`[${code}] saved -> ${path.relative(ROOT, filePath)}`);
  }

  console.log('Done.');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
