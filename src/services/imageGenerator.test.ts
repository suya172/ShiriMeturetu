import { describe, expect, it } from 'vitest';
import {
  copyCardImageToClipboard,
  createCardCanvas,
  downloadCardImage,
} from './imageGenerator';

describe('imageGenerator サービス', () => {
  it('主要な画像生成・共有関数がエクスポートされている', () => {
    expect(typeof createCardCanvas).toBe('function');
    expect(typeof downloadCardImage).toBe('function');
    expect(typeof copyCardImageToClipboard).toBe('function');
  });
});
