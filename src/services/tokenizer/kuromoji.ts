import kuromoji from 'kuromoji';
import type { Token, TokenizerStrategy } from '../../types/tokenizer';

/**
 * kuromoji.js を使用した日本語トークナイザーの実装
 */
export class KuromojiTokenizer implements TokenizerStrategy {
  private tokenizer: kuromoji.Tokenizer<kuromoji.IpadicFeatures> | null = null;
  private initPromise: Promise<void> | null = null;
  private dicPath: string;

  constructor(dicPath?: string) {
    // Vite のベースパスを反映した辞書ディレクトリパスを生成
    if (dicPath) {
      this.dicPath = dicPath;
    } else {
      const baseUrl = import.meta.env.BASE_URL || '/';
      // 末尾スラッシュを保証し、スラッシュの重複を排除
      const normalizedBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
      this.dicPath = `${normalizedBase}dict/`;
    }
  }

  /**
   * 辞書データを非同期でロードし、トークナイザーを初期化する
   */
  public async init(): Promise<void> {
    if (this.tokenizer) {
      return;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise<void>((resolve, reject) => {
      kuromoji.builder({ dicPath: this.dicPath }).build((err, tokenizer) => {
        if (err) {
          this.initPromise = null;
          reject(new Error(`kuromoji 辞書の読み込みに失敗しました: ${err.message || err}`));
          return;
        }
        this.tokenizer = tokenizer;
        resolve();
      });
    });

    return this.initPromise;
  }

  /**
   * 初期化が完了しているか判定
   */
  public isReady(): boolean {
    return this.tokenizer !== null;
  }

  /**
   * 日本語テキストを形態素解析して共通 Token 配列に変換
   */
  public async tokenize(text: string): Promise<Token[]> {
    if (!this.tokenizer) {
      await this.init();
    }

    if (!this.tokenizer) {
      throw new Error('トークナイザーが初期化されていません');
    }

    const rawTokens = this.tokenizer.tokenize(text);

    return rawTokens.map((raw) => ({
      surface_form: raw.surface_form,
      pos: raw.pos,
      pos_detail_1: raw.pos_detail_1,
      basic_form: raw.basic_form,
      reading: raw.reading,
      pronunciation: raw.pronunciation,
    }));
  }
}

// アプリケーション全体で使い回せるシングルトンインスタンス
export const kuromojiTokenizer = new KuromojiTokenizer();
