import { computed, onMounted, ref } from 'vue';
import { performStructurePreservingShuffle, validateWordCount, type ShuffleResult } from '../services/shuffle';
import { kuromojiTokenizer } from '../services/tokenizer/kuromoji';

export const MAX_CHAR_LIMIT = 100;

export function useShiriMeturetu() {
  const inputText = ref('');
  const isReady = ref(false);
  const isLoading = ref(false);
  const isInitializing = ref(true);
  const initError = ref<string | null>(null);

  const generatedResult = ref<ShuffleResult | null>(null);

  // エラーモーダル管理
  const isErrorModalOpen = ref(false);
  const errorMessage = ref('');

  // トースト通知管理
  const isToastVisible = ref(false);
  const toastMessage = ref('');
  let toastTimer: number | null = null;

  // 文字数カウント
  const characterCount = computed(() => inputText.value.length);
  const isCharLimitExceeded = computed(() => characterCount.value > MAX_CHAR_LIMIT);
  const isInputEmpty = computed(() => inputText.value.trim().length === 0);

  // 辞書データの初期化
  onMounted(async () => {
    try {
      isInitializing.value = true;
      await kuromojiTokenizer.init();
      isReady.value = true;
    } catch (err: any) {
      initError.value = err?.message || '辞書の読み込みに失敗しました';
      console.error(err);
    } finally {
      isInitializing.value = false;
    }
  });

  // トースト表示ヘルパー
  const showToast = (message: string, durationMs = 2500) => {
    toastMessage.value = message;
    isToastVisible.value = true;
    if (toastTimer) {
      clearTimeout(toastTimer);
    }
    toastTimer = window.setTimeout(() => {
      isToastVisible.value = false;
    }, durationMs);
  };

  // 入力テキストクリア
  const clearInput = () => {
    inputText.value = '';
    generatedResult.value = null;
  };

  // シャッフル実行アクション
  const executeShuffle = async () => {
    if (!isReady.value || isLoading.value) {
      return;
    }

    const text = inputText.value.trim();
    if (text.length === 0) {
      errorMessage.value = '文章を入力してください。';
      isErrorModalOpen.value = true;
      return;
    }

    if (isCharLimitExceeded.value) {
      errorMessage.value = `文字数は ${MAX_CHAR_LIMIT} 文字以下にしてください。`;
      isErrorModalOpen.value = true;
      return;
    }

    try {
      isLoading.value = true;
      // 1. 形態素解析を実行
      const tokens = await kuromojiTokenizer.tokenize(text);

      // 2. 単語数バリデーション（3単語以上必要）
      const validation = validateWordCount(tokens);
      if (!validation.isValid) {
        errorMessage.value = 'もう少し長い文章を入力してください（3単語以上必要です）。';
        isErrorModalOpen.value = true;
        return;
      }

      // 3. 構造維持シャッフルを実行
      const result = performStructurePreservingShuffle(tokens);
      generatedResult.value = result;
    } catch (err: any) {
      errorMessage.value = `解析中にエラーが発生しました: ${err?.message || err}`;
      isErrorModalOpen.value = true;
    } finally {
      isLoading.value = false;
    }
  };

  // クリップボードへコピー
  const copyToClipboard = async (customText?: string) => {
    const textToCopy = customText ?? generatedResult.value?.text ?? '';
    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      showToast('クリップボードにコピーしました！✨');
    } catch (err) {
      showToast('コピーに失敗しました。');
      console.error('クリップボードのコピーに失敗:', err);
    }
  };

  // シェア用フォーマット文字列の生成
  const getShareText = () => {
    const genText = generatedResult.value?.text || '';
    return `${genText} #しりめつれつ`;
  };

  // 安全な現在のURLを取得（http/httpsスキームのみ許可）
  const getSafeCurrentUrl = (): string => {
    try {
      const url = new URL(window.location.href);
      if (['http:', 'https:'].includes(url.protocol)) {
        return url.href;
      }
    } catch {
      // 不正なURL形式の場合は空文字を返す
    }
    return '';
  };

  // X（旧Twitter）シェア
  const shareToX = () => {
    const shareUrl = new URL('https://twitter.com/intent/tweet');
    shareUrl.searchParams.set('text', getShareText());
    const currentUrl = getSafeCurrentUrl();
    if (currentUrl) {
      shareUrl.searchParams.set('url', currentUrl);
    }
    window.open(shareUrl.toString(), '_blank', 'noopener,noreferrer');
  };

  // Misskey シェア（Misskey Hub経由）
  const shareToMisskey = () => {
    const shareUrl = new URL('https://misskey-hub.net/share/');
    shareUrl.searchParams.set('text', getShareText());
    const currentUrl = getSafeCurrentUrl();
    if (currentUrl) {
      shareUrl.searchParams.set('url', currentUrl);
    }
    window.open(shareUrl.toString(), '_blank', 'noopener,noreferrer');
  };

  return {
    inputText,
    characterCount,
    isCharLimitExceeded,
    isInputEmpty,
    isReady,
    isLoading,
    isInitializing,
    initError,
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
  };
}
