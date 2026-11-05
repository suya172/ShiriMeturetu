import nlp from 'compromise';
import type { Token, TokenizerStrategy } from '../../types/tokenizer';

/**
 * compromise を使用した英語用トークナイザー（将来拡張用スタブ）
 */
export class CompromiseTokenizer implements TokenizerStrategy {
  private ready = false;

  public async init(): Promise<void> {
    // compromise はインメモリで即時利用可能
    this.ready = true;
  }

  public isReady(): boolean {
    return this.ready;
  }

  public async tokenize(text: string): Promise<Token[]> {
    if (!this.ready) {
      await this.init();
    }

    const doc = nlp(text);
    const terms = doc.terms().json();

    const tokens: Token[] = [];
    for (const termObj of terms) {
      for (const t of termObj.terms || []) {
        // compromise のタグから主な品詞を判定
        let pos = 'その他';
        const tags: string[] = t.tags || [];

        if (tags.includes('Noun')) {
          pos = '名詞';
        } else if (tags.includes('Verb')) {
          pos = '動詞';
        } else if (tags.includes('Adjective')) {
          pos = '形容詞';
        } else if (tags.includes('Adverb')) {
          pos = '副詞';
        } else if (tags.includes('Preposition') || tags.includes('Conjunction')) {
          pos = '助詞';
        } else if (tags.includes('Punctuation')) {
          pos = '記号';
        }

        tokens.push({
          surface_form: t.text,
          pos,
          basic_form: t.root || t.normal,
        });
      }
    }

    return tokens;
  }
}
