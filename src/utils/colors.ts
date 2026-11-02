import { ColorDef } from '../types/algorithm';

// Curated Monochrome palette with high distinctiveness:
// Alternating values, high contrast borders, and geometric symbols
export const COLOR_CLASSES: ColorDef[] = [
  {
    index: 1,
    label: 'C1',
    symbol: '●',
    name: 'Class 1',
    monoFill: '#ffffff',
    monoBorder: '#ffffff',
    monoText: '#000000',
    colorFill: '#38bdf8', // Sky Blue
    colorBorder: '#7dd3fc',
    colorText: '#000000',
  },
  {
    index: 2,
    label: 'C2',
    symbol: '■',
    name: 'Class 2',
    monoFill: '#a3a3a3',
    monoBorder: '#d4d4d4',
    monoText: '#000000',
    colorFill: '#f59e0b', // Amber
    colorBorder: '#fcd34d',
    colorText: '#000000',
  },
  {
    index: 3,
    label: 'C3',
    symbol: '▲',
    name: 'Class 3',
    monoFill: '#525252',
    monoBorder: '#a3a3a3',
    monoText: '#ffffff',
    colorFill: '#10b981', // Emerald
    colorBorder: '#6ee7b7',
    colorText: '#000000',
  },
  {
    index: 4,
    label: 'C4',
    symbol: '◆',
    name: 'Class 4',
    monoFill: '#262626',
    monoBorder: '#737373',
    monoText: '#ffffff',
    colorFill: '#a855f7', // Purple
    colorBorder: '#d8b4fe',
    colorText: '#ffffff',
  },
  {
    index: 5,
    label: 'C5',
    symbol: '★',
    name: 'Class 5',
    monoFill: '#e5e5e5',
    monoBorder: '#ffffff',
    monoText: '#000000',
    colorFill: '#f43f5e', // Rose
    colorBorder: '#fda4af',
    colorText: '#ffffff',
  },
  {
    index: 6,
    label: 'C6',
    symbol: '⬢',
    name: 'Class 6',
    monoFill: '#404040',
    monoBorder: '#e5e5e5',
    monoText: '#ffffff',
    colorFill: '#06b6d4', // Cyan
    colorBorder: '#67e8f9',
    colorText: '#000000',
  },
  {
    index: 7,
    label: 'C7',
    symbol: '✚',
    name: 'Class 7',
    monoFill: '#737373',
    monoBorder: '#ffffff',
    monoText: '#ffffff',
    colorFill: '#84cc16', // Lime
    colorBorder: '#bef264',
    colorText: '#000000',
  },
  {
    index: 8,
    label: 'C8',
    symbol: '✦',
    name: 'Class 8',
    monoFill: '#171717',
    monoBorder: '#d4d4d4',
    monoText: '#ffffff',
    colorFill: '#ea580c', // Orange
    colorBorder: '#fdba74',
    colorText: '#ffffff',
  },
  {
    index: 9,
    label: 'C9',
    symbol: '▼',
    name: 'Class 9',
    monoFill: '#d4d4d4',
    monoBorder: '#525252',
    monoText: '#000000',
    colorFill: '#ec4899', // Pink
    colorBorder: '#f472b6',
    colorText: '#ffffff',
  },
  {
    index: 10,
    label: 'C10',
    symbol: '⬡',
    name: 'Class 10',
    monoFill: '#333333',
    monoBorder: '#a3a3a3',
    monoText: '#ffffff',
    colorFill: '#6366f1', // Indigo
    colorBorder: '#a5b4fc',
    colorText: '#ffffff',
  },
];

export function getColorDef(colorIndex: number | null | undefined): ColorDef | null {
  if (colorIndex === null || colorIndex === undefined || colorIndex <= 0) {
    return null;
  }
  const idx = (colorIndex - 1) % COLOR_CLASSES.length;
  const base = COLOR_CLASSES[idx];
  if (colorIndex > COLOR_CLASSES.length) {
    return {
      ...base,
      label: `C${colorIndex}`,
      name: `Class ${colorIndex}`,
    };
  }
  return base;
}

export function getNodeFillColor(colorIndex: number | null | undefined, isColorMode: boolean): string {
  if (colorIndex === null || colorIndex === undefined || colorIndex <= 0) {
    return '#141414'; // Uncolored dark matte
  }
  const def = getColorDef(colorIndex);
  if (!def) return '#141414';
  return isColorMode ? def.colorFill : def.monoFill;
}

export function getNodeBorderColor(colorIndex: number | null | undefined, isColorMode: boolean): string {
  if (colorIndex === null || colorIndex === undefined || colorIndex <= 0) {
    return '#404040'; // Subtle uncolored rim
  }
  const def = getColorDef(colorIndex);
  if (!def) return '#404040';
  return isColorMode ? def.colorBorder : def.monoBorder;
}

export function getNodeTextColor(colorIndex: number | null | undefined, isColorMode: boolean): string {
  if (colorIndex === null || colorIndex === undefined || colorIndex <= 0) {
    return '#888888';
  }
  const def = getColorDef(colorIndex);
  if (!def) return '#ffffff';
  return isColorMode ? def.colorText : def.monoText;
}
