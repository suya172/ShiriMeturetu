# しりめつれつ（β）

ユーザーが入力した日本語の文章をブラウザ上で形態素解析（品詞分解）し、文法構造（助詞や記号の位置）をある程度保ったまま単語をランダムに入れ替えることで、支離滅裂でシュールな文章を生成するWebアプリケーションです。

## ✨ 特徴
- **ブラウザ完結型**: サーバー不要で、`kuromoji.js` による形態素解析がブラウザ内で高速に動作します。
- **構造維持シャッフル**:
  - 名詞、動詞、形容詞、副詞をそれぞれの品詞グループ内で Fisher-Yates シャッフル。
  - 助詞や記号の位置はキープされるため、日本語の骨格が残りシュールで笑える文章が生まれます。
  - 元の文章と変わらなかった場合は、最大10回再試行＆全品詞ごちゃ混ぜフォールバックが発動。
- **マルチSNSシェア**:
  - X（旧Twitter）共有
  - Misskey 共有（Misskey Hub経由）
  - ワンクリックでクリップボードにコピー
- **クリーン＆モダンパステル UI**:
  - Tailwind CSS と `@headlessui/vue` による親しみやすく弾むデザインとアニメーション。
- **高い拡張性**:
  - 将来の英語対応（`compromise`）を見据えた `Tokenizer` Strategy パターン設計。

## 🚀 開発・起動方法

### 依存関係のインストール
```bash
npm install
```
※ `postinstall` スクリプトにより、`node_modules/kuromoji/dict` が自動的に `public/dict/` に配置されます。

### 開発サーバーの起動
```bash
npm run dev
```

### 単体テスト（Vitest）
```bash
npm run test
```

### プロダクションビルド
```bash
npm run build
```

## 🛠️ 技術スタック
- **Frontend**: Vue 3 (Composition API, `<script setup>`) + TypeScript + Vite
- **Styling**: Tailwind CSS
- **UI Components**: `@headlessui/vue`
- **NLP / 形態素解析**: `kuromoji` (ブラウザ自己完結ロード), `compromise` (将来拡張用)
- **Testing**: `Vitest`
- **CI/CD**: GitHub Actions (GitHub Pages 自動デプロイ)
