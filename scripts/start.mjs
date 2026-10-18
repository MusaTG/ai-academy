#!/usr/bin/env node
// Uygulamayı başlatır: API + derlenmiş web uygulaması tek adreste (varsayılan http://localhost:8000).
// .env dosyasındaki ayarlar okunur. Kullanım: npm start  [-- --port 9000] [-- --lan  (aynı ağdaki cihazlara aç)]
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const win = process.platform === 'win32';
const host = process.argv.includes('--lan') ? '0.0.0.0' : '127.0.0.1';
const port = process.argv.includes('--port') ? process.argv[process.argv.indexOf('--port') + 1] : '8000';
const vpy = path.join(ROOT, 'apps', 'api', '.venv', win ? 'Scripts/python.exe' : 'bin/python');
if (!fs.existsSync(vpy)) { console.error('Önce kurulum: npm run setup'); process.exit(1); }
if (!fs.existsSync(path.join(ROOT, 'apps', 'web', 'dist', 'index.html'))) { console.error('Web derlemesi yok: npm run build'); process.exit(1); }
const env = { ...process.env, PYTHONUTF8: '1', PYTHONIOENCODING: 'utf-8' };
const envFile = path.join(ROOT, '.env');
if (fs.existsSync(envFile)) for (const line of fs.readFileSync(envFile, 'utf8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
  if (m && m[2] !== '' && env[m[1]] === undefined) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
console.log(`Engineering Academy → http://localhost:${port}   (durdurmak için Ctrl+C)`);
const p = spawn(vpy, ['-m', 'uvicorn', 'app.main:app', '--host', host, '--port', port], { cwd: path.join(ROOT, 'apps', 'api'), env, stdio: 'inherit' });
p.on('exit', (c) => process.exit(c ?? 0));
for (const s of ['SIGINT', 'SIGTERM']) process.on(s, () => p.kill(s));
