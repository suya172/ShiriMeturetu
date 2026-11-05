<script setup lang="ts">
import { MAX_CHAR_LIMIT } from '../composables/useShiriMeturetu';

interface Props {
  modelValue: string;
  isReady: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  characterCount: number;
  isCharLimitExceeded: boolean;
  isInputEmpty: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'submit'): void;
  (e: 'clear'): void;
}>();

const onInput = (event: Event) => {
  const target = event.target as HTMLTextAreaElement;
  emit('update:modelValue', target.value);
};

const onKeydown = (event: KeyboardEvent) => {
  // Ctrl + Enter または Cmd + Enter で実行
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    if (props.isReady && !props.isLoading && !props.isCharLimitExceeded && !props.isInputEmpty) {
      emit('submit');
    }
  }
};
</script>

<template>
  <div class="w-full max-w-xl mx-auto px-4">
    <!-- 入力カード -->
    <div class="relative bg-white/80 backdrop-blur-md rounded-3xl p-5 shadow-lg shadow-slate-200/50 border border-white/60 transition-all duration-200 hover:shadow-xl hover:shadow-slate-200/60">
      <div class="flex items-center justify-between mb-2">
        <label for="input-text" class="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-pink-400"></span>
          元の文章
        </label>
        
        <!-- クリアボタン -->
        <button
          v-if="!isInputEmpty"
          type="button"
          @click="emit('clear')"
          class="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors cursor-pointer px-2 py-0.5 rounded-md hover:bg-slate-100"
        >
          クリア
        </button>
      </div>

      <!-- テキストエリア -->
      <textarea
        id="input-text"
        :value="modelValue"
        @input="onInput"
        @keydown="onKeydown"
        rows="4"
        maxlength="120"
        placeholder="ここに文章を入力してください（例：吾輩は猫である。名前はまだ無い。）"
        class="w-full resize-none rounded-2xl bg-slate-50/70 p-3.5 text-base sm:text-lg text-slate-800 placeholder-slate-400 border border-slate-200/70 focus:border-pink-300 focus:bg-white focus:outline-none focus:ring-4 focus:ring-pink-100 transition duration-150 ease-in-out"
        :class="{ 'border-rose-400 focus:border-rose-400 focus:ring-rose-100': isCharLimitExceeded }"
      ></textarea>

      <!-- フッター情報（文字数カウンター ＆ ショートカットヒント） -->
      <div class="flex items-center justify-between mt-2 px-1">
        <span class="text-xs text-slate-400 hidden sm:inline">
          Ctrl + Enter でも実行できます
        </span>
        <div
          class="text-xs font-semibold tracking-wider ml-auto"
          :class="isCharLimitExceeded ? 'text-rose-500 font-bold' : 'text-slate-400'"
        >
          <span>{{ characterCount }}</span> / {{ MAX_CHAR_LIMIT }}
        </div>
      </div>

      <div v-if="isCharLimitExceeded" class="text-xs text-rose-500 font-medium mt-1 text-right">
        文字数が上限（{{ MAX_CHAR_LIMIT }}文字）を超えています
      </div>
    </div>

    <!-- アクションボタンエリア -->
    <div class="mt-6 flex flex-col items-center justify-center">
      <button
        type="button"
        @click="emit('submit')"
        :disabled="!isReady || isLoading || isCharLimitExceeded || isInputEmpty"
        class="group relative inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-black tracking-wide rounded-full shadow-lg transition-all duration-200 transform cursor-pointer select-none active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 disabled:transform-none disabled:shadow-none"
        :class="[
          !isReady || isLoading || isCharLimitExceeded || isInputEmpty
            ? 'bg-slate-200 text-slate-400 shadow-none'
            : 'bg-gradient-to-r from-rose-400 via-pink-400 to-indigo-400 text-white shadow-rose-200/80 hover:shadow-xl hover:shadow-rose-300/60 hover:-translate-y-0.5'
        ]"
      >
        <!-- ローディングスピナー（辞書準備中またはシャッフル中） -->
        <svg
          v-if="isInitializing || isLoading"
          class="animate-spin -ml-1 mr-1 h-5 w-5 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>

        <!-- サイコロアイコン（通常時） -->
        <svg
          v-else
          class="w-6 h-6 transform transition-transform group-hover:rotate-45"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          viewBox="0 0 24 24"
        >
          <rect x="3" y="3" width="18" height="18" rx="4" />
          <circle cx="8" cy="8" r="1.5" fill="currentColor" />
          <circle cx="16" cy="8" r="1.5" fill="currentColor" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          <circle cx="8" cy="16" r="1.5" fill="currentColor" />
          <circle cx="16" cy="16" r="1.5" fill="currentColor" />
        </svg>

        <!-- ボタンラベル -->
        <span>
          <template v-if="isInitializing">辞書を準備中...</template>
          <template v-else-if="isLoading">混ぜています...</template>
          <template v-else>しりめつれつ</template>
        </span>
      </button>
    </div>
  </div>
</template>
