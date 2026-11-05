<script setup lang="ts">
import { TransitionRoot } from '@headlessui/vue';
import type { ShuffleResult } from '../services/shuffle';

interface Props {
  result: ShuffleResult | null;
  canShareWithFiles: boolean;
  isImageProcessing: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'copyText'): void;
  (e: 'shareX'): void;
  (e: 'shareMisskey'): void;
  (e: 'shareWithImage'): void;
  (e: 'downloadImage'): void;
  (e: 'copyImage'): void;
}>();
</script>

<template>
  <TransitionRoot
    :show="result !== null"
    appear
    as="div"
    enter="transition-all duration-300 ease-out"
    enter-from="opacity-0 translate-y-4 scale-95"
    enter-to="opacity-100 translate-y-0 scale-100"
    leave="transition-all duration-200 ease-in"
    leave-from="opacity-100 translate-y-0 scale-100"
    leave-to="opacity-0 translate-y-4 scale-95"
    class="w-full max-w-xl mx-auto px-4 mt-8"
  >
    <div
      v-if="result"
      class="relative bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl shadow-pink-100/60 border border-pink-100 transition-all"
    >
      <!-- デコレーション背景アクセント -->
      <div class="absolute -top-3 -right-3 w-16 h-16 bg-gradient-to-br from-pink-200/40 to-indigo-200/40 rounded-full blur-xl pointer-events-none"></div>

      <!-- ヘッダー情報（フォールバック表示など） -->
      <div class="flex items-center justify-between mb-4">
        <span class="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
          <span class="w-2 h-2 rounded-full bg-indigo-400"></span>
          生成結果
        </span>

        <!-- 全品詞フォールバック発動時のバッジ -->
        <span
          v-if="result.usedFallback"
          class="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 shadow-xs"
          title="元の文章と変わりにくかったため、全品詞をごちゃ混ぜにしてシャッフルしました！"
        >
          🌪️ 大混ざりモード
        </span>
      </div>

      <!-- 生成テキスト表示エリア -->
      <div class="my-4 py-2 text-center">
        <p class="text-2xl sm:text-3xl font-black text-slate-800 leading-relaxed tracking-normal select-all break-words">
          {{ result.text }}
        </p>
      </div>

      <!-- アクションボタンエリア -->
      <div class="mt-6 pt-5 border-t border-slate-100 space-y-3">
        <!-- 主要SNSシェアボタン -->
        <div class="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
          <!-- Web Share API (画像添付対応端末: スマホ等) -->
          <button
            v-if="canShareWithFiles"
            type="button"
            :disabled="isImageProcessing"
            @click="emit('shareWithImage')"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 active:scale-95 transition-all shadow-sm shadow-rose-200 cursor-pointer disabled:opacity-50"
          >
            <svg class="w-4 h-4 fill-none stroke-current" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span>画像付きでシェア</span>
          </button>

          <!-- X（旧Twitter）でシェア -->
          <button
            type="button"
            @click="emit('shareX')"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 active:scale-95 transition-all shadow-sm cursor-pointer"
          >
            <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            <span>Xでシェア</span>
          </button>

          <!-- Misskey でシェア -->
          <button
            type="button"
            @click="emit('shareMisskey')"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 active:scale-95 transition-all shadow-sm shadow-emerald-200 cursor-pointer"
          >
            <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm0-8h-2V7h2v2zm4 8h-2V7h2v10z"/>
            </svg>
            <span>Misskeyでシェア</span>
          </button>
        </div>

        <!-- 画像・テキスト保存＆コピーボタン群 -->
        <div class="flex flex-wrap items-center justify-center gap-2 pt-1 text-slate-600 text-xs sm:text-sm">
          <!-- 画像を保存 -->
          <button
            type="button"
            :disabled="isImageProcessing"
            @click="emit('downloadImage')"
            class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 active:scale-95 transition-all cursor-pointer border border-rose-200/60"
            title="SNS投稿用のカード画像を保存します"
          >
            <svg class="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>画像を保存</span>
          </button>

          <!-- 画像をコピー -->
          <button
            type="button"
            :disabled="isImageProcessing"
            @click="emit('copyImage')"
            class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 active:scale-95 transition-all cursor-pointer border border-indigo-200/60"
            title="画像をコピーします（Xの投稿欄で Ctrl+V / 貼り付けできます）"
          >
            <svg class="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>画像をコピー</span>
          </button>

          <!-- テキストをコピー -->
          <button
            type="button"
            @click="emit('copyText')"
            class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-95 transition-all cursor-pointer"
          >
            <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>文をコピー</span>
          </button>
        </div>
      </div>
    </div>
  </TransitionRoot>
</template>
