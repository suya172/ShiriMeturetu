/**
 * 生成テキストを 1200x630 の 16:9 パステル調カード画像（Canvas）として描画するモジュール
 */

/**
 * 指定された角丸四角形を描画するパスを作成
 */
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * テキストを指定の最大幅で行分割する
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const lines: string[] = [];
  // 既存の改行で分割
  const rawParagraphs = text.split('\n');

  for (const para of rawParagraphs) {
    if (para.length === 0) {
      lines.push('');
      continue;
    }

    let currentLine = '';
    for (let i = 0; i < para.length; i++) {
      const char = para[i];
      const testLine = currentLine + char;
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && currentLine.length > 0) {
        lines.push(currentLine);
        currentLine = char;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine.length > 0) {
      lines.push(currentLine);
    }
  }

  return lines;
}

/**
 * 1200x630 の HTMLCanvasElement を生成（文章のみを中央に配置）
 */
export function createCardCanvas(text: string): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 630;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context を取得できませんでした');
  }

  // 1. 全体背景グラデーション
  const bgGrad = ctx.createLinearGradient(0, 0, 1200, 630);
  bgGrad.addColorStop(0, '#FFF1F2'); // rose-50
  bgGrad.addColorStop(0.5, '#F0F9FF'); // sky-50
  bgGrad.addColorStop(1, '#FEF3C7'); // amber-50
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 1200, 630);

  // 背景のパステル装飾円
  ctx.fillStyle = 'rgba(251, 207, 232, 0.45)'; // pink
  ctx.beginPath();
  ctx.arc(150, 100, 200, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(186, 230, 253, 0.4)'; // sky
  ctx.beginPath();
  ctx.arc(1050, 200, 220, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(253, 230, 138, 0.35)'; // amber
  ctx.beginPath();
  ctx.arc(600, 580, 240, 0, Math.PI * 2);
  ctx.fill();

  // 2. メインカード背景
  const cardX = 70;
  const cardY = 55;
  const cardW = 1060;
  const cardH = 520;
  const cardRadius = 36;

  // カードの影
  ctx.save();
  ctx.shadowColor = 'rgba(15, 23, 42, 0.08)';
  ctx.shadowBlur = 32;
  ctx.shadowOffsetY = 16;

  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, cardRadius);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
  ctx.fill();
  ctx.restore();

  // カードのボーダー
  ctx.save();
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, cardRadius);
  ctx.strokeStyle = 'rgba(251, 207, 232, 0.8)';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();

  // 3. メイン文章の描画（カード全体の中央に大きく配置）
  const maxTextWidth = cardW - 140;
  let fontSize = 48;
  if (text.length > 70) {
    fontSize = 38;
  } else if (text.length > 40) {
    fontSize = 42;
  } else if (text.length < 20) {
    fontSize = 58;
  }

  ctx.font = `900 ${fontSize}px 'Zen Maru Gothic', sans-serif`;
  ctx.fillStyle = '#1E293B'; // slate-800
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const lineHeight = fontSize * 1.6;
  const lines = wrapText(ctx, text, maxTextWidth);

  // カード全体の上下左右中央に配置
  const centerY = cardY + (cardH / 2);
  const totalTextHeight = lines.length * lineHeight;
  let startY = centerY - (totalTextHeight / 2) + (lineHeight / 2);

  const textCenterX = cardX + (cardW / 2);
  for (const line of lines) {
    ctx.fillText(line, textCenterX, startY);
    startY += lineHeight;
  }

  return canvas;
}

/**
 * カード画像を Blob として取得
 */
export async function createCardBlob(text: string): Promise<Blob> {
  const canvas = createCardCanvas(text);
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('画像の Blob 生成に失敗しました'));
      }
    }, 'image/png');
  });
}

/**
 * カード画像を File オブジェクトとして取得（Web Share API 用）
 */
export async function createCardFile(text: string): Promise<File> {
  const blob = await createCardBlob(text);
  return new File([blob], 'shirimeturetu-card.png', { type: 'image/png' });
}

/**
 * カード画像をブラウザからファイルとしてダウンロード
 */
export async function downloadCardImage(text: string): Promise<void> {
  const blob = await createCardBlob(text);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `shirimeturetu-${Date.now()}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * カード画像をクリップボードにコピー
 */
export async function copyCardImageToClipboard(text: string): Promise<boolean> {
  if (!navigator.clipboard || !window.ClipboardItem) {
    return false;
  }
  const blob = await createCardBlob(text);
  await navigator.clipboard.write([
    new ClipboardItem({
      'image/png': blob,
    }),
  ]);
  return true;
}
