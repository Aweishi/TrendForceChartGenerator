
export enum ChartType {
  BAR = 'BAR',
  STACKED_BAR = 'STACKED_BAR',
  PIE = 'PIE',
  DOUBLE_PIE = 'DOUBLE_PIE'
}

export enum AspectRatio {
  WIDE = '16:9',
  PORTRAIT = '4:5'
}

export enum ThemeMode {
  LIGHT = 'light',
  DARK = 'dark'
}

export enum PaletteType {
  MULTI = 'MULTI',
  SINGLE = 'SINGLE'
}

export interface ChartDataPoint {
  name: string;
  [key: string]: string | number;
}

export interface ChartConfig {
  title: string;
  subtitle: string;
  source: string;
  chartType: ChartType;
  aspectRatio: AspectRatio;
  theme: ThemeMode;
  paletteType: PaletteType;
  showLabels: boolean;
  data: ChartDataPoint[];
  categories: string[];
}
