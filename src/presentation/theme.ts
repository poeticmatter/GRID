import type { CellColor } from '../engine/types';

export interface LayerTheme {
  bg: string;      // Solid background for indicators
  text: string;    // Standard text color
  border: string;  // Solid border color
  badge: string;   // Classes for memory badge (bg + border)
  banner: string;  // Classes for card banner (bg + border + text)
  surface: string; // Background tint for main components
}

export const LAYER_THEME: Record<CellColor, LayerTheme> = {
  ORANGE: {
    bg: 'bg-orange-500',
    text: 'text-orange-400',
    border: 'border-orange-500',
    badge: 'bg-orange-600 border-orange-400',
    banner: 'bg-grid-bg border-b-2 border-orange-500 text-orange-400',
    surface: 'bg-grid-bg',
  },
  SKY: {
    bg: 'bg-sky-400',
    text: 'text-sky-400',
    border: 'border-sky-400',
    badge: 'bg-sky-600 border-sky-400',
    banner: 'bg-grid-bg border-b-2 border-sky-400 text-sky-400',
    surface: 'bg-grid-bg',
  },
  EMERALD: {
    bg: 'bg-emerald-500',
    text: 'text-emerald-400',
    border: 'border-emerald-500',
    badge: 'bg-emerald-600 border-emerald-400',
    banner: 'bg-grid-bg border-b-2 border-emerald-500 text-emerald-400',
    surface: 'bg-grid-bg',
  },
  LIME: {
    bg: 'bg-lime-400',
    text: 'text-lime-400',
    border: 'border-lime-400',
    badge: 'bg-lime-600 border-lime-400',
    banner: 'bg-grid-bg border-b-2 border-lime-400 text-lime-400',
    surface: 'bg-grid-bg',
  },
  FUCHSIA: {
    bg: 'bg-fuchsia-500',
    text: 'text-fuchsia-400',
    border: 'border-fuchsia-500',
    badge: 'bg-fuchsia-600 border-fuchsia-400',
    banner: 'bg-grid-bg border-b-2 border-fuchsia-500 text-fuchsia-400',
    surface: 'bg-grid-bg',
  },
};
