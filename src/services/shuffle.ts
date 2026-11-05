import type { Token } from '../types/tokenizer';

/**
 * シャッフルの対象となる品詞
 */
export const SHUFFLE_TARGET_POS = new Set<string>([
  '名詞',
  '動詞',
  '形容詞',
  '副詞',
]);

/**
 * トークンがシャッフル対象品詞かどうかを判定する
 */
export function isShuffleTarget(token: Token): boolean {
  return SHUFFLE_TARGET_POS.has(token.pos);
}

/**
 * Fisher-Yates アルゴリズムによる配列シャッフル（イミュータブルに新配列を返す）
 */
export function fisherYatesShuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * 形態素解析後のトークン配列から元の文章（表層形結合文字列）を復元する
 */
export function tokensToText(tokens: readonly Token[]): string {
  return tokens.map((t) => t.surface_form).join('');
}

/**
 * 品詞グループごとに Fisher-Yates シャッフルを行い、元の位置に再配置する（1回分）
 */
export function shuffleWithinPosGroups(tokens: readonly Token[]): Token[] {
  const result: Token[] = [...tokens];

  for (const targetPos of SHUFFLE_TARGET_POS) {
    // 該当品詞のインデックスと単語（表層形）を抽出
    const indices: number[] = [];
    const words: string[] = [];

    tokens.forEach((token, index) => {
      if (token.pos === targetPos) {
        indices.push(index);
        words.push(token.surface_form);
      }
    });

    if (words.length <= 1) {
      continue;
    }

    // グループ内でシャッフル
    const shuffledWords = fisherYatesShuffle(words);

    // 元の位置に反映
    indices.forEach((originalIndex, i) => {
      result[originalIndex] = {
        ...result[originalIndex],
        surface_form: shuffledWords[i],
      };
    });
  }

  return result;
}

/**
 * フォールバック処理：
 * シャッフル対象の全品詞（名詞・動詞・形容詞・副詞）をごちゃ混ぜにして入れ替える
 */
export function fallbackShuffleAllTargets(tokens: readonly Token[]): Token[] {
  const result: Token[] = [...tokens];
  const indices: number[] = [];
  const words: string[] = [];

  tokens.forEach((token, index) => {
    if (isShuffleTarget(token)) {
      indices.push(index);
      words.push(token.surface_form);
    }
  });

  if (words.length <= 1) {
    return result;
  }

  // 全対象品詞をごちゃ混ぜシャッフル
  // 元の並びと異なる結果になるよう最大10回試行
  let shuffledWords = fisherYatesShuffle(words);
  const originalWordsStr = words.join('|');
  let tries = 0;

  while (shuffledWords.join('|') === originalWordsStr && tries < 10) {
    shuffledWords = fisherYatesShuffle(words);
    tries++;
  }

  // それでも同一（すべて同じ単語など）でなければ位置をシフト
  if (shuffledWords.join('|') === originalWordsStr && words.length > 1) {
    shuffledWords = [...words.slice(1), words[0]];
  }

  indices.forEach((originalIndex, i) => {
    result[originalIndex] = {
      ...result[originalIndex],
      surface_form: shuffledWords[i],
    };
  });

  return result;
}

export interface ShuffleResult {
  /** 生成されたテキスト */
  text: string;
  /** 生成後のトークン一覧 */
  tokens: Token[];
  /** 全品詞混合フォールバックが適用されたかどうか */
  usedFallback: boolean;
  /** 試行回数 */
  attempts: number;
}

/**
 * 構造維持シャッフルを実行する（同一文回避・最大10回再試行・フォールバック付き）
 *
 * @param tokens 入力トークン配列
 * @param maxAttempts 同一文回避のための最大再試行回数（デフォルト: 10）
 */
export function performStructurePreservingShuffle(
  tokens: readonly Token[],
  maxAttempts = 10
): ShuffleResult {
  const originalText = tokensToText(tokens);

  // シャッフル対象単語が2つ未満ならシャッフル不可
  const targetCount = tokens.filter(isShuffleTarget).length;
  if (targetCount < 2) {
    return {
      text: originalText,
      tokens: [...tokens],
      usedFallback: false,
      attempts: 1,
    };
  }

  // 1. 同一品詞内シャッフルを最大 maxAttempts 回試行
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const candidateTokens = shuffleWithinPosGroups(tokens);
    const candidateText = tokensToText(candidateTokens);

    if (candidateText !== originalText) {
      return {
        text: candidateText,
        tokens: candidateTokens,
        usedFallback: false,
        attempts: attempt,
      };
    }
  }

  // 2. 10回試行しても元の文と同一の場合、全品詞ごちゃ混ぜフォールバックを実行
  const fallbackTokens = fallbackShuffleAllTargets(tokens);
  const fallbackText = tokensToText(fallbackTokens);

  return {
    text: fallbackText,
    tokens: fallbackTokens,
    usedFallback: true,
    attempts: maxAttempts + 1,
  };
}

/**
 * 入力されたトークン配列が有効な単語数（3単語以上）を満たしているかを検証する
 * （SPEC: 形態素解析後のシャッフル対象単語、または全単語が3単語未満の場合エラー）
 */
export function validateWordCount(tokens: readonly Token[]): {
  isValid: boolean;
  totalTokens: number;
  targetTokens: number;
} {
  // 記号や空白を除外した実質的な単語数をカウント
  const meaningfulTokens = tokens.filter((t) => t.pos !== '記号' && t.surface_form.trim().length > 0);
  const targetTokens = tokens.filter(isShuffleTarget).length;

  // 実質的な単語が3単語以上あれば有効
  const isValid = meaningfulTokens.length >= 3;

  return {
    isValid,
    totalTokens: meaningfulTokens.length,
    targetTokens,
  };
}
