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
