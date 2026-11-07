<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { kuromojiTokenizer } from '../services/tokenizer/kuromoji';
import {
  isShuffleTarget,
  performStructurePreservingShuffle,
  type ShuffleResult,
} from '../services/shuffle';
import type { Token } from '../types/tokenizer';

// アニメーションパターンの定義
type PatternType = 'slot' | 'swap' | 'scramble' | 'pop' | 'compare-all';

interface PatternOption {
  id: PatternType;
  name: string;
  badge: string;
  description: string;
}

const patterns: PatternOption[] = [
  {
    id: 'slot',
    name: 'スロット・ドラムロール',
    badge: 'カチカチ回転',
    description: '助詞を残し、入れ替わる単語だけが上下に回転して左から順にピタッと停止します。',
  },
  {
    id: 'swap',
    name: 'ぽよんスワップ（席替え）',
    badge: 'ふわっと移動',
    description: '対象の単語たちがぽよんと浮き上がり、弧を描くように席替えして着地します。',
  },
  {
    id: 'scramble',
    name: 'スクランブル（再構成）',
    badge: 'カタカタ収束',
    description: 'カードが小刻みに震え、文字が高速でパラパラと入れ替わったあと一気に定着します。',
  },
  {
    id: 'pop',
    name: 'ポップアップ出現',
    badge: 'ポンポン登場',
    description: 'シャッフル後の単語が左からテンポよく「ポン、ポン」と飛び出して完成します。',
  },
  {
    id: 'compare-all',
    name: '全パターン一括比較',
    badge: '4種同時再生',
    description: '4つのアニメーションを並べて、動きやテンポの違いを同時に見比べられます。',
  },
];

// 状態管理
const selectedPattern = ref<PatternType>('slot');
const inputText = ref('吾輩は猫である。名前はまだ無い。');
const speed = ref<number>(1.0); // 0.5: 遅い, 1.0: 通常, 1.5: 速い
const showPosHighlight = ref(true); // 品詞ごとの色分け
const isPlaying = ref(false);

// 形態素解析とシャッフル
const isInitializing = ref(true);
const initError = ref<string | null>(null);

const originalTokens = ref<Token[]>([]);
const currentResult = ref<ShuffleResult | null>(null);

// アニメーション実行用のキック用カウンター
const animKey = ref(0);

// プリセット文
const presets = [
  '吾輩は猫である。名前はまだ無い。',
  '春はあけぼの。やうやう白くなりゆく山際、少しあかりて、紫だちたる雲の細くたなびきたる。',
  '国境の長いトンネルを抜けると雪国であった。夜の底が白くなった。',
  'おいしいカレーライスを食べたら、元気な笑顔になりました。',
];

// 初期化
onMounted(async () => {
  // ハッシュからタブを選択
  const hash = window.location.hash.replace('#', '') as PatternType;
  if (patterns.some((p) => p.id === hash)) {
    selectedPattern.value = hash;
  }

  try {
    isInitializing.value = true;
    await kuromojiTokenizer.init();
    isInitializing.value = false;
    await analyzeAndShuffle();
  } catch (err: unknown) {
    const e = err as Error;
    console.error('Initialization error:', e);
    initError.value = e.message || '初期化に失敗しました';
    isInitializing.value = false;
  }
});

// 解析とシャッフル実行
async function analyzeAndShuffle() {
  if (!inputText.value.trim()) return;

  try {
    const tokens = await kuromojiTokenizer.tokenize(inputText.value.trim());
    originalTokens.value = tokens;
    const result = performStructurePreservingShuffle(tokens);
    currentResult.value = result;

    // アニメーション再生
    playAnimation();
  } catch (err: unknown) {
    const e = err as Error;
    console.error('Shuffle error:', e);
    initError.value = e.message || 'シャッフルに失敗しました';
  }
}

// アニメーション再生トリガー
function playAnimation() {
  isPlaying.value = true;
  animKey.value++;
  startScrambleEffect();
  
  // アニメーション完了までのタイマー（速度に応じて調整）
  const totalDuration = (1400 / speed.value);
  setTimeout(() => {
    isPlaying.value = false;
  }, totalDuration);
}

// パターン選択
function selectPattern(id: PatternType) {
  selectedPattern.value = id;
  if (typeof window !== 'undefined') {
    window.location.hash = id;
  }
  playAnimation();
}

// プリセット適用
function applyPreset(text: string) {
  inputText.value = text;
  analyzeAndShuffle();
}

// 品詞に応じた背景色クラス
function getPosColorClass(pos: string, isTarget: boolean): string {
  if (!showPosHighlight.value) return 'text-slate-800';
  if (!isTarget) return 'text-slate-600 bg-slate-100/60';

  switch (pos) {
    case '名詞':
      return 'bg-pink-100/90 text-pink-700 border border-pink-200';
    case '動詞':
      return 'bg-emerald-100/90 text-emerald-700 border border-emerald-200';
    case '形容詞':
      return 'bg-sky-100/90 text-sky-700 border border-sky-200';
    case '副詞':
      return 'bg-amber-100/90 text-amber-700 border border-amber-200';
    default:
      return 'bg-indigo-100/90 text-indigo-700 border border-indigo-200';
  }
}

// スロット用の候補単語リスト（同じ品詞の単語群）
function getCandidateWords(pos: string): string[] {
  if (!originalTokens.value) return [];
  const list = originalTokens.value
    .filter((t) => t.pos === pos)
    .map((t) => t.surface_form);
  // 重複排除
  return Array.from(new Set(list));
}

// スロット用の固定4ステップドラム項目を生成（ズレ防止）
function getSlotReelItems(token: Token): string[] {
  const candidates = getCandidateWords(token.pos);
  const otherCandidates = candidates.filter((c) => c !== token.surface_form);
  const dummy1 = otherCandidates[0] || candidates[0] || '●';
  const dummy2 = otherCandidates[1] || otherCandidates[0] || '▲';
  return [
    token.surface_form, // 初期表示
    dummy1,             // 回転中のダミー1
    dummy2,             // 回転中のダミー2
    token.surface_form, // 確定単語
  ];
}

// スクランブル用ランダム文字生成と動的更新
const randomChars = 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん';
function getRandomChar() {
  return randomChars[Math.floor(Math.random() * randomChars.length)];
}

const scrambledDisplay = ref<Record<number, string>>({});
let scrambleInterval: ReturnType<typeof setInterval> | null = null;

function startScrambleEffect() {
  if (scrambleInterval) clearInterval(scrambleInterval);
  if (!currentResult.value) return;

  const targetTokens = currentResult.value.tokens;
  // 初期ランダム文字設定
  targetTokens.forEach((token, idx) => {
    if (isShuffleTarget(token)) {
      scrambledDisplay.value[idx] = Array.from({ length: token.surface_form.length }, () => getRandomChar()).join('');
    }
  });

  const durationMs = 600 / speed.value;
  const startTime = Date.now();

  scrambleInterval = setInterval(() => {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(1, elapsed / durationMs);

    targetTokens.forEach((token, idx) => {
      if (isShuffleTarget(token)) {
        // インデックスに応じて順番に確定
        const tokenThreshold = (idx + 1) / targetTokens.length;
        if (progress >= tokenThreshold) {
          scrambledDisplay.value[idx] = token.surface_form;
        } else {
          scrambledDisplay.value[idx] = Array.from({ length: token.surface_form.length }, () => getRandomChar()).join('');
        }
      }
    });

    if (progress >= 1) {
      if (scrambleInterval) clearInterval(scrambleInterval);
      scrambleInterval = null;
    }
  }, 40);
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-rose-50/50 via-sky-50/40 to-amber-50/50 py-8 px-4 text-slate-800">
    <div class="max-w-4xl mx-auto space-y-6">
      
      <!-- ヘッダー -->
      <header class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-pink-200/50">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-2xl sm:text-3xl font-black bg-gradient-to-r from-rose-400 via-pink-500 to-indigo-400 bg-clip-text text-transparent">
              しりめつれつ
            </h1>
            <span class="text-xs font-bold px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 border border-pink-200">
              アニメーション試作室
            </span>
          </div>
          <p class="text-xs text-slate-500 mt-1">
            シャッフル時のアニメーション演出プロトタイプ。速度や表現を比較検討できます。
          </p>
        </div>

        <a
          href="./"
          class="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-xl bg-white/70 border border-slate-200 hover:bg-white transition-all shadow-xs"
        >
          <span>← 通常版アプリへ</span>
        </a>
      </header>

      <!-- エラー表示（ある場合） -->
      <div v-if="initError" class="p-4 rounded-2xl bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200">
        ⚠️ {{ initError }}
      </div>

      <!-- コントロールパネル -->
      <section class="bg-white/80 backdrop-blur-md rounded-3xl p-5 shadow-lg shadow-slate-200/50 border border-white/60 space-y-4">
        <!-- 入力フォーム -->
        <div>
          <label class="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            テスト用文章
          </label>
          <div class="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              v-model="inputText"
              class="flex-1 rounded-2xl bg-slate-50/80 px-4 py-2.5 text-slate-800 text-sm border border-slate-200 focus:outline-none focus:ring-4 focus:ring-pink-100 focus:border-pink-300 transition"
              placeholder="文章を入力..."
              @keydown.enter="analyzeAndShuffle"
            />
            <button
              type="button"
              :disabled="isInitializing || isPlaying"
              @click="analyzeAndShuffle"
              class="px-6 py-2.5 rounded-2xl font-black text-sm text-white bg-gradient-to-r from-rose-400 via-pink-500 to-indigo-400 shadow-md shadow-rose-200/60 hover:shadow-lg active:scale-95 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <template v-if="isInitializing">準備中...</template>
              <template v-else-if="isPlaying">再生中...</template>
              <template v-else>シャッフルして再生 🎲</template>
            </button>
          </div>
        </div>

        <!-- プリセット短文 -->
        <div class="flex flex-wrap items-center gap-1.5 pt-1">
          <span class="text-xs font-semibold text-slate-400 mr-1">例文:</span>
          <button
            v-for="(preset, i) in presets"
            :key="i"
            type="button"
            @click="applyPreset(preset)"
            class="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-pink-50 text-slate-600 hover:text-pink-600 border border-slate-200/60 transition cursor-pointer"
          >
            {{ preset.slice(0, 14) }}...
          </button>
        </div>

        <!-- オプションバー: 再生速度 & ハイライト切替 -->
        <div class="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 text-xs">
          <!-- 速度切替 -->
          <div class="flex items-center gap-2">
            <span class="font-bold text-slate-500">再生速度:</span>
            <div class="inline-flex rounded-xl bg-slate-100 p-0.5 border border-slate-200/60">
              <button
                type="button"
                @click="speed = 0.5"
                class="px-2.5 py-1 rounded-lg font-bold transition"
                :class="speed === 0.5 ? 'bg-white text-pink-600 shadow-xs' : 'text-slate-500 hover:text-slate-700'"
              >
                0.5x (ゆっくり)
              </button>
              <button
                type="button"
                @click="speed = 1.0"
                class="px-2.5 py-1 rounded-lg font-bold transition"
                :class="speed === 1.0 ? 'bg-white text-pink-600 shadow-xs' : 'text-slate-500 hover:text-slate-700'"
              >
                1.0x (標準)
              </button>
              <button
                type="button"
                @click="speed = 1.5"
                class="px-2.5 py-1 rounded-lg font-bold transition"
                :class="speed === 1.5 ? 'bg-white text-pink-600 shadow-xs' : 'text-slate-500 hover:text-slate-700'"
              >
                1.5x (サクサク)
              </button>
            </div>
          </div>

          <!-- 品詞ハイライトトグル -->
          <label class="flex items-center gap-2 cursor-pointer font-bold text-slate-600 select-none">
            <input
              type="checkbox"
              v-model="showPosHighlight"
              class="rounded text-pink-500 focus:ring-pink-400 w-4 h-4 cursor-pointer"
            />
            <span>品詞ハイライト表示（名詞・動詞・形容詞を色分け）</span>
          </label>
        </div>
      </section>

      <!-- パターン選択タブ -->
      <nav class="flex flex-wrap gap-2">
        <button
          v-for="p in patterns"
          :key="p.id"
          type="button"
          @click="selectPattern(p.id)"
          class="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all cursor-pointer border"
          :class="[
            selectedPattern === p.id
              ? 'bg-white text-slate-800 shadow-md border-pink-200 ring-2 ring-pink-300/40'
              : 'bg-white/60 hover:bg-white text-slate-600 border-white/60'
          ]"
        >
          <span>{{ p.name }}</span>
          <span
            class="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
            :class="selectedPattern === p.id ? 'bg-pink-100 text-pink-700' : 'bg-slate-100 text-slate-500'"
          >
            {{ p.badge }}
          </span>
        </button>
      </nav>

      <!-- プレビューエリア -->
      <main class="space-y-6">

        <!-- パターン1: スロット・ドラムロール風 -->
        <div
          v-if="selectedPattern === 'slot' || selectedPattern === 'compare-all'"
          class="bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl shadow-pink-100/60 border border-pink-100 relative overflow-hidden"
        >
          <div class="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-pink-400"></span>
              <h2 class="text-base font-black text-slate-800">パターン①: スロット・ドラムロール</h2>
            </div>
            <button
              type="button"
              @click="playAnimation"
              class="text-xs font-bold text-pink-600 hover:text-pink-700 bg-pink-50 hover:bg-pink-100 px-3 py-1 rounded-xl transition cursor-pointer"
            >
              ↻ この演出をリプレイ
            </button>
          </div>
          <p class="text-xs text-slate-500 mb-6">
            助詞（は、で、ある）は固定され、入れ替わる単語だけがドラムロールのように上下回転して順番に停止します。
          </p>

          <!-- アニメーション表示ボックス -->
          <div :key="'slot-' + animKey" class="min-h-[120px] flex items-center justify-center p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
            <div class="flex flex-wrap items-center justify-center gap-x-1 gap-y-3 text-xl sm:text-2xl font-black">
              <template v-if="currentResult">
                <template v-for="(token, idx) in currentResult.tokens" :key="idx">
                  <!-- シャッフル対象（スロット回転） -->
                  <div
                    v-if="isShuffleTarget(token)"
                    class="relative overflow-hidden h-10 inline-flex items-start px-2.5 rounded-xl transition-all"
                    :class="getPosColorClass(token.pos, true)"
                  >
                    <!-- スロットドラムアニメーション（固定4アイテム×40px） -->
                    <div
                      class="flex flex-col items-center w-full slot-reel"
                      :style="{
                        '--slot-duration': `${(0.8 / speed)}s`,
                        '--slot-delay': `${(idx * 0.1) / speed}s`,
                      }"
                    >
                      <span
                        v-for="(item, rIdx) in getSlotReelItems(token)"
                        :key="rIdx"
                        class="h-10 shrink-0 flex items-center justify-center whitespace-nowrap"
                        :class="{ 'font-black': rIdx === 3, 'text-slate-400': rIdx === 1 || rIdx === 2 }"
                      >
                        {{ item }}
                      </span>
                    </div>
                  </div>

                  <!-- シャッフル対象外（固定表示） -->
                  <span
                    v-else
                    class="px-1 py-0.5 rounded-lg transition-all"
                    :class="getPosColorClass(token.pos, false)"
                  >
                    {{ token.surface_form }}
                  </span>
                </template>
              </template>
              <span v-else class="text-slate-400 text-sm font-medium">シャッフルボタンを押してください</span>
            </div>
          </div>
        </div>

        <!-- パターン2: ぽよんスワップ（席替え）風 -->
        <div
          v-if="selectedPattern === 'swap' || selectedPattern === 'compare-all'"
          class="bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl shadow-pink-100/60 border border-pink-100 relative overflow-hidden"
        >
          <div class="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <h2 class="text-base font-black text-slate-800">パターン②: ぽよんスワップ（席替え）</h2>
            </div>
            <button
              type="button"
              @click="playAnimation"
              class="text-xs font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-xl transition cursor-pointer"
            >
              ↻ この演出をリプレイ
            </button>
          </div>
          <p class="text-xs text-slate-500 mb-6">
            シャッフル対象の単語が「ふわっ」と浮き上がり、弧を描くように席替えして「すとん」と着地します。
          </p>

          <div :key="'swap-' + animKey" class="min-h-[120px] flex items-center justify-center p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
            <div class="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-3 text-xl sm:text-2xl font-black">
              <template v-if="currentResult">
                <template v-for="(token, idx) in currentResult.tokens" :key="idx">
                  <div
                    v-if="isShuffleTarget(token)"
                    class="inline-flex items-center px-2 py-0.5 rounded-xl transition-all swap-bounce"
                    :class="getPosColorClass(token.pos, true)"
                    :style="{
                      '--bounce-duration': `${(0.7 / speed)}s`,
                      '--bounce-delay': `${((idx % 3) * 0.08) / speed}s`,
                    }"
                  >
                    {{ token.surface_form }}
                  </div>
                  <span
                    v-else
                    class="px-1 py-0.5 rounded-lg"
                    :class="getPosColorClass(token.pos, false)"
                  >
                    {{ token.surface_form }}
                  </span>
                </template>
              </template>
              <span v-else class="text-slate-400 text-sm font-medium">シャッフルボタンを押してください</span>
            </div>
          </div>
        </div>

        <!-- パターン3: スクランブル（デジタル再構成）風 -->
        <div
          v-if="selectedPattern === 'scramble' || selectedPattern === 'compare-all'"
          class="bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl shadow-pink-100/60 border border-pink-100 relative overflow-hidden"
        >
          <div class="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-sky-400"></span>
              <h2 class="text-base font-black text-slate-800">パターン③: スクランブル（再構成）</h2>
            </div>
            <button
              type="button"
              @click="playAnimation"
              class="text-xs font-bold text-sky-600 hover:text-sky-700 bg-sky-50 hover:bg-sky-100 px-3 py-1 rounded-xl transition cursor-pointer"
            >
              ↻ この演出をリプレイ
            </button>
          </div>
          <p class="text-xs text-slate-500 mb-6">
            カードが小気味よく振動し、文字がパラパラと激しく切り替わったあと、一気に確定テキストへ収束します。
          </p>

          <div
            :key="'scramble-' + animKey"
            class="min-h-[120px] flex items-center justify-center p-4 bg-slate-50/50 rounded-2xl border border-slate-100"
            :class="{ 'card-shake': isPlaying }"
            :style="{ '--shake-duration': `${(0.6 / speed)}s` }"
          >
            <div class="flex flex-wrap items-center justify-center gap-x-1 gap-y-3 text-xl sm:text-2xl font-black">
              <template v-if="currentResult">
                <template v-for="(token, idx) in currentResult.tokens" :key="idx">
                  <span
                    v-if="isShuffleTarget(token)"
                    class="px-2 py-0.5 rounded-xl transition-all scramble-word font-mono"
                    :class="getPosColorClass(token.pos, true)"
                    :style="{
                      '--scramble-duration': `${(0.6 / speed)}s`,
                      '--scramble-delay': `${(idx * 0.05) / speed}s`,
                    }"
                  >
                    {{ scrambledDisplay[idx] || token.surface_form }}
                  </span>
                  <span
                    v-else
                    class="px-1 py-0.5 rounded-lg"
                    :class="getPosColorClass(token.pos, false)"
                  >
                    {{ token.surface_form }}
                  </span>
                </template>
              </template>
              <span v-else class="text-slate-400 text-sm font-medium">シャッフルボタンを押してください</span>
            </div>
          </div>
        </div>

        <!-- パターン4: ポップアップ・ドミノ出現風 -->
        <div
          v-if="selectedPattern === 'pop' || selectedPattern === 'compare-all'"
          class="bg-white/90 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl shadow-pink-100/60 border border-pink-100 relative overflow-hidden"
        >
          <div class="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
              <h2 class="text-base font-black text-slate-800">パターン④: ポップアップ出現</h2>
            </div>
            <button
              type="button"
              @click="playAnimation"
              class="text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1 rounded-xl transition cursor-pointer"
            >
              ↻ この演出をリプレイ
            </button>
          </div>
          <p class="text-xs text-slate-500 mb-6">
            シャッフルされた単語が左から順に「ポン、ポン」と軽快に飛び出して並んでいきます。
          </p>

          <div :key="'pop-' + animKey" class="min-h-[120px] flex items-center justify-center p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
            <div class="flex flex-wrap items-center justify-center gap-x-1 gap-y-3 text-xl sm:text-2xl font-black">
              <template v-if="currentResult">
                <template v-for="(token, idx) in currentResult.tokens" :key="idx">
                  <span
                    class="px-2 py-0.5 rounded-xl transition-all pop-item"
                    :class="getPosColorClass(token.pos, isShuffleTarget(token))"
                    :style="{
                      '--pop-delay': `${(idx * 0.08) / speed}s`,
                    }"
                  >
                    {{ token.surface_form }}
                  </span>
                </template>
              </template>
              <span v-else class="text-slate-400 text-sm font-medium">シャッフルボタンを押してください</span>
            </div>
          </div>
        </div>

      </main>

      <!-- フッター -->
      <footer class="text-center pt-4 pb-8 text-xs text-slate-400">
        しりめつれつ（β） アニメーションプロトタイププレビュー
      </footer>

    </div>
  </div>
</template>

<style scoped>
/* パターン1: スロットアニメーション */
.slot-reel {
  animation: slotRoll var(--slot-duration, 0.8s) cubic-bezier(0.15, 0.9, 0.25, 1) forwards;
  animation-delay: var(--slot-delay, 0s);
  transform: translateY(0);
}

@keyframes slotRoll {
  0% {
    transform: translateY(0);
    filter: blur(0px);
  }
  20% {
    transform: translateY(-40px);
    filter: blur(1px);
  }
  50% {
    transform: translateY(-80px);
    filter: blur(2px);
  }
  80% {
    transform: translateY(-126px);
    filter: blur(0px);
  }
  90% {
    transform: translateY(-118px);
  }
  100% {
    transform: translateY(-120px);
    filter: blur(0px);
  }
}

/* パターン2: ぽよんスワップ */
.swap-bounce {
  animation: swapBounce var(--bounce-duration, 0.7s) cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  animation-delay: var(--bounce-delay, 0s);
}

@keyframes swapBounce {
  0% {
    transform: translateY(0) scale(1);
  }
  30% {
    transform: translateY(-16px) scale(1.15) rotate(-3deg);
    box-shadow: 0 10px 20px -5px rgba(244, 63, 94, 0.25);
  }
  60% {
    transform: translateY(-8px) scale(1.08) rotate(2deg);
  }
  85% {
    transform: translateY(2px) scale(0.98);
  }
  100% {
    transform: translateY(0) scale(1) rotate(0deg);
  }
}

/* パターン3: カード振動 & スクランブル */
.card-shake {
  animation: shake var(--shake-duration, 0.6s) ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-3px) rotate(-0.5deg); }
  40% { transform: translateX(3px) rotate(0.5deg); }
  60% { transform: translateX(-2px); }
  80% { transform: translateX(2px); }
}

.scramble-word {
  animation: scrambleFlash var(--scramble-duration, 0.6s) ease-out forwards;
  animation-delay: var(--scramble-delay, 0s);
}

@keyframes scrambleFlash {
  0% {
    opacity: 0.3;
    transform: scale(0.9);
    filter: blur(2px);
  }
  50% {
    opacity: 0.8;
    filter: blur(1px);
    transform: scale(1.05);
  }
  100% {
    opacity: 1;
    filter: blur(0px);
    transform: scale(1);
  }
}

/* パターン4: ポップアップ登場 */
.pop-item {
  animation: popIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  animation-delay: var(--pop-delay, 0s);
}

@keyframes popIn {
  0% {
    opacity: 0;
    transform: scale(0.4) translateY(12px);
  }
  70% {
    transform: scale(1.15) translateY(-2px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
