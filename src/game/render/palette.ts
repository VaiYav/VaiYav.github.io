import type { Palette } from './sprites';

export const NEON = {
  bg: '#1a0b2e', deep: '#2b0f4a', violet: '#5a1a7a', berry: '#b0206f', mag: '#ff2e88', pink: '#ff71ce',
  cyan: '#01e7f0', teal: '#05a8aa', yel: '#fff35c', org: '#ff8a3d', white: '#fdf6ff', ink: '#0d0518',
} as const;

/** Accent colour of each AI agent, in rack order. */
export const AGENT_COLORS = ['#3ad1a0', '#f6c945', '#e0709a', '#7fa6d6'] as const;

export const HERO_PALETTE: Palette = {
  K: NEON.ink, H: '#4a3426', h: '#6b4a34', l: '#9a7350', S: '#f4cfae', G: '#111111',
  B: '#a9c8ee', b: '#7fa6d6', C: '#d6e6f9', P: '#2b2440', F: NEON.white,
  Y: NEON.yel, y: '#c9b520', d: NEON.cyan,
};

export const SHADOW = 'rgba(13,5,24,.5)';
