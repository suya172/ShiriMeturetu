<script setup lang="ts">
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue';

interface Props {
  isOpen: boolean;
  message: string;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();
</script>

<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="emit('close')" class="relative z-50">
      <!-- 背景オーバーレイ -->
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-slate-900/30 backdrop-blur-xs" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel class="w-full max-w-sm transform overflow-hidden rounded-3xl bg-white p-6 text-center align-middle shadow-2xl transition-all border border-pink-100">
              <!-- アイコンバッジ -->
              <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-500 mb-4">
                <svg class="h-7 w-7" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>

              <!-- タイトル -->
              <DialogTitle as="h3" class="text-lg font-bold text-slate-800">
                おしらせ
              </DialogTitle>

              <!-- メッセージ本文 -->
              <div class="mt-2">
                <p class="text-sm font-medium text-slate-600 leading-relaxed">
                  {{ message }}
                </p>
              </div>

              <!-- 閉じるボタン -->
              <div class="mt-6">
                <button
                  type="button"
                  class="inline-flex justify-center rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-slate-800 active:scale-95 transition-all cursor-pointer shadow-md shadow-slate-200"
                  @click="emit('close')"
                >
                  わかりました
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
