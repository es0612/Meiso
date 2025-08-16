import { MeditationScript } from '../types';

// 瞑想関連の定数
export const MEDITATION_DURATIONS = {
  ONE_MINUTE: 60,
  THREE_MINUTES: 180,
  FIVE_MINUTES: 300,
  TEN_MINUTES: 600,
} as const;

export const DEFAULT_MEDITATION_DURATION = MEDITATION_DURATIONS.ONE_MINUTE;

export const BREATHING_PHASES = {
  INHALE: 'inhale',
  HOLD: 'hold',
  EXHALE: 'exhale',
  PAUSE: 'pause',
} as const;

export const DEFAULT_BREATHING_PATTERN = {
  inhale: 4,
  hold: 4,
  exhale: 4,
  pause: 2,
} as const;

// 初期瞑想スクリプトデータ
export const INITIAL_MEDITATION_SCRIPTS: MeditationScript[] = [
  {
    id: 'basic-breathing',
    title: '基本の呼吸瞑想',
    description:
      '深い呼吸に集中して心を落ち着かせる基本的な瞑想です。初心者の方におすすめです。',
    category: 'breathing',
    duration: 60,
    instructions: [
      {
        timestamp: 0,
        text: '快適な姿勢で座り、目を閉じてください。',
        type: 'guidance',
      },
      {
        timestamp: 5,
        text: '自然な呼吸を感じてください。',
        type: 'breathing',
      },
      {
        timestamp: 15,
        text: '4秒かけてゆっくりと息を吸います。',
        type: 'breathing',
      },
      {
        timestamp: 20,
        text: '4秒間息を止めます。',
        type: 'breathing',
      },
      {
        timestamp: 25,
        text: '6秒かけてゆっくりと息を吐きます。',
        type: 'breathing',
      },
      {
        timestamp: 35,
        text: 'このリズムを続けてください。',
        type: 'guidance',
      },
      {
        timestamp: 50,
        text: 'もうすぐ終了です。呼吸を自然に戻してください。',
        type: 'guidance',
      },
    ],
    tags: ['初心者', '呼吸', 'リラックス'],
    difficulty: 'beginner',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  },
  {
    id: 'mindfulness-focus',
    title: 'マインドフルネス集中',
    description:
      '今この瞬間に意識を向け、集中力を高める瞑想です。仕事前におすすめです。',
    category: 'mindfulness',
    duration: 60,
    instructions: [
      {
        timestamp: 0,
        text: '背筋を伸ばして座り、目を閉じてください。',
        type: 'guidance',
      },
      {
        timestamp: 5,
        text: '今この瞬間に意識を向けてください。',
        type: 'guidance',
      },
      {
        timestamp: 15,
        text: '体の感覚を観察してください。',
        type: 'guidance',
      },
      {
        timestamp: 25,
        text: '思考が浮かんでも、優しく呼吸に意識を戻してください。',
        type: 'guidance',
      },
      {
        timestamp: 40,
        text: '心が静かになっていくのを感じてください。',
        type: 'guidance',
      },
      {
        timestamp: 55,
        text: 'ゆっくりと目を開けて、この静けさを保ってください。',
        type: 'guidance',
      },
    ],
    tags: ['集中', 'マインドフルネス', '仕事前'],
    difficulty: 'intermediate',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  },
  {
    id: 'stress-relief',
    title: 'ストレス解消',
    description:
      '緊張とストレスを解放し、心身をリラックスさせる瞑想です。疲れた時におすすめです。',
    category: 'relaxation',
    duration: 60,
    instructions: [
      {
        timestamp: 0,
        text: 'リラックスできる姿勢で座り、肩の力を抜いてください。',
        type: 'guidance',
      },
      {
        timestamp: 8,
        text: '深く息を吸い、すべての緊張を吐き出してください。',
        type: 'breathing',
      },
      {
        timestamp: 18,
        text: '頭の先から足の先まで、体の各部位をリラックスさせてください。',
        type: 'guidance',
      },
      {
        timestamp: 30,
        text: 'ストレスが体から流れ出ていくのを想像してください。',
        type: 'visualization',
      },
      {
        timestamp: 45,
        text: '心が軽やかになっていくのを感じてください。',
        type: 'guidance',
      },
      {
        timestamp: 55,
        text: 'このリラックスした状態を覚えておいてください。',
        type: 'guidance',
      },
    ],
    tags: ['ストレス解消', 'リラックス', '疲労回復'],
    difficulty: 'beginner',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  },
  {
    id: 'focus-enhancement',
    title: '集中力向上',
    description: '心を一点に集中させ、集中力を高める上級者向けの瞑想です。',
    category: 'focus',
    duration: 60,
    instructions: [
      {
        timestamp: 0,
        text: '安定した姿勢で座り、一点を見つめてください。',
        type: 'guidance',
      },
      {
        timestamp: 10,
        text: '呼吸の数を1から10まで数えてください。',
        type: 'breathing',
      },
      {
        timestamp: 25,
        text: '10まで数えたら、また1から始めてください。',
        type: 'guidance',
      },
      {
        timestamp: 35,
        text: '他の思考が浮かんでも、数に戻ってください。',
        type: 'guidance',
      },
      {
        timestamp: 50,
        text: '集中が深まっていくのを感じてください。',
        type: 'guidance',
      },
    ],
    tags: ['集中力', '上級者', '数息観'],
    difficulty: 'advanced',
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-01T00:00:00Z'),
  },
];

// デフォルトスクリプトID
export const DEFAULT_SCRIPT_ID = 'basic-breathing';

// カテゴリー表示名
export const CATEGORY_LABELS = {
  breathing: '呼吸法',
  mindfulness: 'マインドフルネス',
  focus: '集中力',
  relaxation: 'リラクゼーション',
} as const;

// 難易度表示名
export const DIFFICULTY_LABELS = {
  beginner: '初心者',
  intermediate: '中級者',
  advanced: '上級者',
} as const;
