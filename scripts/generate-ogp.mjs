import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tempHtmlPath = path.resolve(__dirname, 'temp-ogp.html');
const outputPngPath = path.resolve(__dirname, '../public/ogp.png');

const htmlContent = `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Zen+Maru+Gothic:wght@900&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      width: 1200px;
      height: 630px;
      overflow: hidden;
      font-family: 'Zen Maru Gothic', sans-serif;
      /* サイト本体と同じパステルグラデーション背景 */
      background: linear-gradient(135deg, rgba(255, 241, 242, 0.8) 0%, rgba(240, 249, 255, 0.8) 50%, rgba(255, 251, 235, 0.8) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    /* ほんのり優しい背景の光彩 */
    .glow-rose {
      position: absolute;
      width: 500px;
      height: 500px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(251, 113, 133, 0.15) 0%, transparent 70%);
      top: -50px;
      left: 100px;
      filter: blur(40px);
    }
    .glow-indigo {
      position: absolute;
      width: 500px;
      height: 500px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(129, 140, 248, 0.15) 0%, transparent 70%);
      bottom: -50px;
      right: 100px;
      filter: blur(40px);
    }

    .logo-container {
      position: relative;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* サイトヘッダーのロゴと同じグラデーションスタイル */
    .logo-text {
      font-size: 160px;
      font-weight: 900;
      letter-spacing: 0.02em;
      line-height: 1;
      /* rose-400 via pink-500 to indigo-400 */
      background: linear-gradient(to right, #fb7185, #ec4899, #818cf8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      filter: drop-shadow(0 4px 16px rgba(236, 72, 153, 0.12));
    }
  </style>
</head>
<body>
  <div class="glow-rose"></div>
  <div class="glow-indigo"></div>
  <div class="logo-container">
    <span class="logo-text">しりめつれつ</span>
  </div>
</body>
</html>`;

fs.writeFileSync(tempHtmlPath, htmlContent, 'utf-8');

try {
  // chromium-browser または google-chrome でスクリーンショット撮影
  const chromePath = '/usr/bin/chromium-browser';
  const cmd = `${chromePath} --headless --disable-gpu --no-sandbox --window-size=1200,630 --screenshot="${outputPngPath}" file://${tempHtmlPath}`;
  console.log('Generating OGP image...');
  execSync(cmd, { stdio: 'inherit' });
  console.log(`OGP image successfully generated at: ${outputPngPath}`);
} finally {
  if (fs.existsSync(tempHtmlPath)) {
    fs.unlinkSync(tempHtmlPath);
  }
}
