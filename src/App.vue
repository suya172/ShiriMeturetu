<script setup lang="ts">
import ErrorModal from './components/ErrorModal.vue';
import Footer from './components/Footer.vue';
import Header from './components/Header.vue';
import InputForm from './components/InputForm.vue';
import ResultCard from './components/ResultCard.vue';
import Toast from './components/Toast.vue';
import { useShiriMeturetu } from './composables/useShiriMeturetu';

const {
  inputText,
  characterCount,
  isCharLimitExceeded,
  isInputEmpty,
  isReady,
  isLoading,
  isInitializing,
  generatedResult,
  isErrorModalOpen,
  errorMessage,
  isToastVisible,
  toastMessage,
  executeShuffle,
  clearInput,
  copyToClipboard,
  shareToX,
  shareToMisskey,
} = useShiriMeturetu();
</script>

<template>
  <div class="relative min-h-screen flex flex-col justify-between overflow-x-hidden selection:bg-rose-200 selection:text-rose-900">
    <!-- 背景デコレーションブロブ -->
    <div class="fixed top-0 left-1/4 -z-10 w-96 h-96 bg-rose-200/40 rounded-full blur-3xl pointer-events-none transform -translate-y-1/2"></div>
    <div class="fixed top-1/3 right-1/4 -z-10 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl pointer-events-none"></div>
    <div class="fixed bottom-0 left-1/3 -z-10 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl pointer-events-none transform translate-y-1/3"></div>

    <div class="w-full flex-grow flex flex-col items-center">
      <!-- ヘッダー -->
      <Header />

      <!-- メインコンテンツ -->
      <main class="w-full flex flex-col items-center pb-12">
        <!-- 入力フォーム -->
        <InputForm
          v-model="inputText"
          :is-ready="isReady"
          :is-loading="isLoading"
          :is-initializing="isInitializing"
          :character-count="characterCount"
          :is-char-limit-exceeded="isCharLimitExceeded"
          :is-input-empty="isInputEmpty"
          @submit="executeShuffle"
          @clear="clearInput"
        />

        <!-- 結果表示カード -->
        <ResultCard
          :result="generatedResult"
          @copy="() => copyToClipboard()"
          @share-x="shareToX"
          @share-misskey="shareToMisskey"
        />
      </main>
    </div>

    <!-- フッター -->
    <Footer />

    <!-- エラー通知モーダル -->
    <ErrorModal
      :is-open="isErrorModalOpen"
      :message="errorMessage"
      @close="isErrorModalOpen = false"
    />

    <!-- トースト通知 -->
    <Toast
      :is-visible="isToastVisible"
      :message="toastMessage"
    />
  </div>
</template>
