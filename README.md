# しりめつれつ（β）

日本語の文章を形態素解析し、単語をランダムに入れ替えて支離滅裂な文章を生成するWebアプリケーションです。

## Features

- kuromoji.js によるブラウザ上での形態素解析
- 品詞ごとの単語シャッフルによる文章生成
- 助詞や記号の位置を維持した構造的なシャッフル
- X・Misskey への共有
- クリップボードへのコピー
- ブラウザ上で動作するため、サーバー不要

## Tech Stack

- Vue 3
- TypeScript
- Vite
- Tailwind CSS
- Headless UI
- kuromoji.js
- Vitest

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Test

```bash
npm run test
```

### Build

```bash
npm run build
```

## Deployment

GitHub Actions による GitHub Pages への自動デプロイに対応しています。