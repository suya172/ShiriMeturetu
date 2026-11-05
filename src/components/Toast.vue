<script setup lang="ts">
import { TransitionRoot } from '@headlessui/vue';

interface Props {
  isVisible: boolean;
  message: string;
}

defineProps<Props>();
</script>

<template>
  <TransitionRoot
    :show="isVisible"
    as="template"
    enter="transition ease-out duration-300"
    enter-from="transform translate-y-4 opacity-0 scale-95"
    enter-to="transform translate-y-0 opacity-100 scale-100"
    leave="transition ease-in duration-200"
    leave-from="transform translate-y-0 opacity-100 scale-100"
    leave-to="transform translate-y-4 opacity-0 scale-95"
  >
    <div class="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none">
      <div class="bg-slate-900/90 backdrop-blur-md text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-full shadow-lg shadow-slate-900/20 flex items-center gap-2">
        <span>{{ message }}</span>
      </div>
    </div>
  </TransitionRoot>
</template>
