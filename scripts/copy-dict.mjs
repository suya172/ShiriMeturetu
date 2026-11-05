import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sourceDir = path.resolve(__dirname, '../node_modules/kuromoji/dict');
const targetDir = path.resolve(__dirname, '../public/dict');

if (!fs.existsSync(sourceDir)) {
  console.error(`エラー: 辞書ソースディレクトリが見つかりません: ${sourceDir}`);
  process.exit(1);
}

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const files = fs.readdirSync(sourceDir);
for (const file of files) {
  const srcFile = path.join(sourceDir, file);
  const destFile = path.join(targetDir, file);
  fs.copyFileSync(srcFile, destFile);
}

console.log(`kuromoji 辞書ファイル (${files.length} ファイル) を public/dict/ にコピーしました。`);
