/**
 * 形態素トークンの共通表現インターフェース
 */
export interface Token {
  /** 単語の表層形（元の文字列） */
  surface_form: string;
  /** 品詞大分類（名詞、動詞、形容詞、副詞、助詞、記号など） */
  pos: string;
  /** 品詞細分類1 */
  pos_detail_1?: string;
  /** 基本形（終止形など） */
  basic_form?: string;
  /** 読み */
  reading?: string;
  /** 発音 */
  pronunciation?: string;
}

/**
 * 将来の多言語対応（英語 compromise 等）を見据えた Tokenizer Strategy インターフェース
 */
export interface TokenizerStrategy {
  /** 辞書やモデルの非同期初期化 */
  init(): Promise<void>;
  /** 入力テキストの形態素解析（トークン分解） */
  tokenize(text: string): Promise<Token[]>;
  /** 初期化が完了しているかどうか */
  isReady(): boolean;
}
