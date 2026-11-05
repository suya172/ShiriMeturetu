import { describe, expect, it } from 'vitest';
import { gzipSync } from 'fflate';
import { Zlib } from './gunzip-shim';

describe('gunzip-shim', () => {
  it('生gzipデータを正しく解凍できる（マジックナンバー 0x1f 0x8b あり）', () => {
    const originalText = 'こんにちは世界！形態素解析テスト';
    const originalBytes = new TextEncoder().encode(originalText);
    const compressed = gzipSync(originalBytes);

    const gz = new Zlib.Gunzip(compressed);
    const result = gz.decompress();

    const decoded = new TextDecoder().decode(result);
    expect(decoded).toBe(originalText);
  });

  it('既に解凍されたデータ（ブラウザ自動解凍）の場合、そのままバイナリを返す', () => {
    const rawBytes = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);
    const gz = new Zlib.Gunzip(rawBytes);
    const result = gz.decompress();

    expect(result).toEqual(rawBytes);
    expect(result.buffer.byteLength).toBe(rawBytes.length);
  });
});
