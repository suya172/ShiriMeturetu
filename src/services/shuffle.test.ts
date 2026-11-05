import { describe, expect, it } from 'vitest';
import type { Token } from '../types/tokenizer';
import {
  fisherYatesShuffle,
  isShuffleTarget,
  performStructurePreservingShuffle,
  shuffleWithinPosGroups,
  tokensToText,
  validateWordCount,
} from './shuffle';

describe('shuffle サービス', () => {
  describe('fisherYatesShuffle', () => {
    it('要素数が維持され、元の配列を変更しない（イミュータブル）', () => {
      const original = ['りんご', 'みかん', 'バナナ', 'ぶどう'];
      const copy = [...original];
      const shuffled = fisherYatesShuffle(original);

      expect(shuffled).toHaveLength(original.length);
      expect(original).toEqual(copy);
      expect(shuffled.sort()).toEqual(copy.sort());
    });
  });

  describe('isShuffleTarget', () => {
    it('名詞・動詞・形容詞・副詞をシャッフル対象として判定する', () => {
      expect(isShuffleTarget({ surface_form: '猫', pos: '名詞' })).toBe(true);
      expect(isShuffleTarget({ surface_form: '走る', pos: '動詞' })).toBe(true);
      expect(isShuffleTarget({ surface_form: '美しい', pos: '形容詞' })).toBe(true);
      expect(isShuffleTarget({ surface_form: 'ゆっくり', pos: '副詞' })).toBe(true);
    });

    it('助詞・助動詞・記号などは固定対象（false）として判定する', () => {
      expect(isShuffleTarget({ surface_form: 'は', pos: '助詞' })).toBe(false);
      expect(isShuffleTarget({ surface_form: 'だ', pos: '助動詞' })).toBe(false);
      expect(isShuffleTarget({ surface_form: '。', pos: '記号' })).toBe(false);
      expect(isShuffleTarget({ surface_form: 'しかし', pos: '接続詞' })).toBe(false);
    });
  });

  describe('shuffleWithinPosGroups', () => {
    it('助詞や記号の位置を維持したまま、名詞同士のみを入れ替える', () => {
      // 「吾輩(名詞) は(助詞) 猫(名詞) である(助動詞) 。(記号)」
      const tokens: Token[] = [
        { surface_form: '吾輩', pos: '名詞' },
        { surface_form: 'は', pos: '助詞' },
        { surface_form: '猫', pos: '名詞' },
        { surface_form: 'である', pos: '助動詞' },
        { surface_form: '。', pos: '記号' },
      ];

      // 何度か実行して検証
      for (let i = 0; i < 10; i++) {
        const result = shuffleWithinPosGroups(tokens);

        // 助詞・助動詞・記号の位置が不変であることを検証
        expect(result[1].surface_form).toBe('は');
        expect(result[3].surface_form).toBe('である');
        expect(result[4].surface_form).toBe('。');

        // 名詞位置の単語は '吾輩' または '猫' のいずれか
        expect(['吾輩', '猫']).toContain(result[0].surface_form);
        expect(['吾輩', '猫']).toContain(result[2].surface_form);
      }
    });
  });

  describe('performStructurePreservingShuffle', () => {
    it('複数単語が存在する場合、元の文とは異なる文を生成できる', () => {
      const tokens: Token[] = [
        { surface_form: '吾輩', pos: '名詞' },
        { surface_form: 'は', pos: '助詞' },
        { surface_form: '猫', pos: '名詞' },
        { surface_form: 'である', pos: '助動詞' },
        { surface_form: '。', pos: '記号' },
        { surface_form: '名前', pos: '名詞' },
        { surface_form: 'は', pos: '助詞' },
        { surface_form: 'まだ', pos: '副詞' },
        { surface_form: '無い', pos: '形容詞' },
        { surface_form: '。', pos: '記号' },
      ];

      const originalText = tokensToText(tokens);
      const result = performStructurePreservingShuffle(tokens);

      expect(result.text).not.toBe(originalText);
      expect(result.tokens).toHaveLength(tokens.length);
    });

    it('同一品詞内に1単語ずつしかなく通常シャッフルで同一文になる場合、全品詞フォールバックが発動する', () => {
      // 名詞1つ、動詞1つの文: 「猫(名詞) が(助詞) 走る(動詞) 。(記号)」
      // 品詞内シャッフルでは絶対に並びが変わらない
      const tokens: Token[] = [
        { surface_form: '猫', pos: '名詞' },
        { surface_form: 'が', pos: '助詞' },
        { surface_form: '走る', pos: '動詞' },
        { surface_form: '。', pos: '記号' },
      ];

      const originalText = tokensToText(tokens);
      const result = performStructurePreservingShuffle(tokens, 3);

      // フォールバックが発動して「走るが猫。」になること
      expect(result.usedFallback).toBe(true);
      expect(result.text).not.toBe(originalText);
      expect(result.text).toBe('走るが猫。');
    });
  });

  describe('validateWordCount', () => {
    it('3単語未満の場合は無効（false）と判定する', () => {
      const shortTokens: Token[] = [
        { surface_form: '猫', pos: '名詞' },
        { surface_form: 'だ', pos: '助動詞' },
      ];
      expect(validateWordCount(shortTokens).isValid).toBe(false);
    });

    it('記号を除外して3単語以上の場合は有効（true）と判定する', () => {
      const validTokens: Token[] = [
        { surface_form: '吾輩', pos: '名詞' },
        { surface_form: 'は', pos: '助詞' },
        { surface_form: '猫', pos: '名詞' },
        { surface_form: '。', pos: '記号' },
      ];
      // 記号「。」を除いて実質3単語
      expect(validateWordCount(validTokens).isValid).toBe(true);
    });
  });
});
