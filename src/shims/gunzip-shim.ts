import { gunzipSync } from 'fflate';

/**
 * kuromoji が使用する zlibjs (Zlib.Gunzip) のブラウザ向け Shim
 *
 * 注意: 配信サーバーによっては .gz ファイルに `Content-Encoding: gzip` が付与され、
 * ブラウザ側で自動解凍済みのデータが届く場合がある（Vite 開発サーバー等）。
 * そのため gzip のマジックナンバー (0x1f 0x8b) を確認し、gzip の場合のみ解凍する。
 */
export class Gunzip {
  public data: Uint8Array;

  constructor(data: Uint8Array | ArrayBuffer | number[]) {
    this.data = data instanceof Uint8Array ? data : new Uint8Array(data);
  }

  public decompress(): Uint8Array {
    const input = this.data;
    const isGzip = input.length >= 2 && input[0] === 0x1f && input[1] === 0x8b;

    // gzip でなければ解凍済みとみなしてそのまま返す
    const output = isGzip ? gunzipSync(input) : input;

    // kuromoji は戻り値の `.buffer` を使うため、オフセットのない独立した ArrayBuffer を保証する
    if (output.byteOffset !== 0 || output.byteLength !== output.buffer.byteLength) {
      return new Uint8Array(output.buffer.slice(output.byteOffset, output.byteOffset + output.byteLength));
    }
    return output;
  }
}

export const Zlib = {
  Gunzip,
};

export default {
  Zlib,
};
