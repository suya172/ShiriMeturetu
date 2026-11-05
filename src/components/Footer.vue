<script setup lang="ts">
// フッターコンポーネント
const AUTHOR_X_ID = 'suya_172_1';
const AUTHOR_X_URL = `https://x.com/${AUTHOR_X_ID}`;
</script>

<template>
  <footer class="w-full py-8 text-center text-xs text-slate-400 font-medium">
    <div class="flex items-center justify-center gap-3">
      <!-- サイトタイトル -->
      <span class="text-slate-500 font-bold">しりめつれつ（β）</span>
      <span class="text-slate-300">•</span>

      <!-- 開発者リンク -->
      <a
        :href="AUTHOR_X_URL"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors font-semibold px-2 py-0.5 rounded-md hover:bg-white/60 group"
      >
        <span>Created by</span>
        <!-- X アイコン -->
        <svg class="w-3.5 h-3.5 fill-current opacity-70 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        <span class="underline decoration-slate-300 underline-offset-2 group-hover:decoration-slate-800">
          @{{ AUTHOR_X_ID }}
        </span>
      </a>
    </div>
  </footer>
</template>
