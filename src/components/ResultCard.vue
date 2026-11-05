<script setup lang="ts">
import { TransitionRoot } from '@headlessui/vue';
import type { ShuffleResult } from '../services/shuffle';

interface Props {
  result: ShuffleResult | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'copy'): void;
  (e: 'shareX'): void;
  (e: 'shareMisskey'): void;
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

      <!-- シェア ＆ コピーエリア -->
      <div class="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        <!-- X（旧Twitter）でシェア -->
        <button
          type="button"
          @click="emit('shareX')"
          class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 active:scale-95 transition-all shadow-sm cursor-pointer"
        >
          <!-- X アイコン -->
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
          <!-- Misskey アイコン -->
          <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm0-8h-2V7h2v2zm4 8h-2V7h2v10z"/>
          </svg>
          <span>Misskeyでシェア</span>
        </button>

        <!-- コピーボタン -->
        <button
          type="button"
          @click="emit('copy')"
          class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all cursor-pointer"
        >
          <!-- コピーアイコン -->
          <svg class="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span>コピー</span>
        </button>
      </div>
    </div>
  </TransitionRoot>
</template>
