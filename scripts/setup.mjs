#!/usr/bin/env node
// Tek komutla kurulum (Windows / macOS / Linux): npm run setup
// 1) Node bağımlılıkları  2) apps/api/.venv Python sanal ortamı + bağımlılıklar
// 3) tutorial testleri (rapor)  4) web uygulamasını derleme
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const win = process.platform === 'win32';
const sh = (cmd, cwd = ROOT) => { console.log(`\n$ ${cmd}`); execSync(cmd, { cwd, stdio: 'inherit', shell: true, env: { ...process.env, PYTHONUTF8: '1', PYTHONIOENCODING: 'utf-8' } }); };
const findPython = () => {
  for (const c of win ? ['py -3', 'python', 'python3'] : ['python3', 'python']) {
    try { const v = execSync(`${c} -c "import sys;print(sys.version_info[:2]>=(3,10))"`, { encoding: 'utf8' }).trim(); if (v === 'True') return c; } catch { /* sonraki */ }
  }
  return null;
};

const major = Number(process.versions.node.split('.')[0]);
if (major < 20) { console.error(`Node.js 20+ gerekli (sizde ${process.versions.node}).`); process.exit(1); }
const py = findPython();
if (!py) { console.error('Python 3.10+ bulunamadı. https://www.python.org/downloads/ adresinden kurun (Windows\'ta "Add to PATH" seçin).'); process.exit(1); }

sh('npm install');
const venv = path.join(ROOT, 'apps', 'api', '.venv');
if (!fs.existsSync(venv)) sh(`${py} -m venv .venv`, path.join(ROOT, 'apps', 'api'));
const vpy = win ? path.join(venv, 'Scripts', 'python.exe') : path.join(venv, 'bin', 'python');
sh(`"${vpy}" -m pip install --upgrade pip -q`);
sh(`"${vpy}" -m pip install -q -r apps/api/requirements-dev.txt "numpy>=1.24"`);
sh(`"${vpy}" scripts/run_tutorial_tests.py`);
sh('npm run build');
if (!fs.existsSync(path.join(ROOT, '.env'))) fs.copyFileSync(path.join(ROOT, '.env.example'), path.join(ROOT, '.env'));
console.log('\n✓ Kurulum tamamlandı. Başlatmak için: npm start   →  http://localhost:8000');
