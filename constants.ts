
import { ChartType, AspectRatio, ThemeMode, ChartConfig, PaletteType } from './types';

export const TRENDFORCE_GREEN = '#2D5D3A';

// Requested Multi-color palette
export const MULTI_COLORS = [
  '#4e79a7', 
  '#edc948', 
  '#f28e2b', 
  '#59a14f', 
  '#e15759', 
  '#76b7b2', 
  '#b07aa1', 
  '#9c755f'
];

// Requested Single-color palette (Green shades)
export const SINGLE_COLORS = [
  '#4d7c0f', 
  '#65a30d', 
  '#84cc16', 
  '#a3e635', 
  '#bef264', 
  '#d9f99d', 
  '#ecfccb', 
  '#f7fee7'
];

export const INITIAL_DATA: ChartConfig = {
  title: '2024-2029年車用半導體市場規模預估',
  subtitle: '(Unit: Million USD)',
  source: 'Source: TrendForce, Dec. 2025',
  chartType: ChartType.STACKED_BAR,
  aspectRatio: AspectRatio.WIDE,
  theme: ThemeMode.LIGHT,
  paletteType: PaletteType.MULTI,
  showLabels: true,
  categories: [
    'Memory',
    'Logic Processor',
    'MCU',
    'Analog IC',
    'Discrete',
    'Opto-semi',
    'Sensors',
    'Others'
  ],
  data: [
    { name: '2024', Memory: 6000, 'Logic Processor': 12000, MCU: 9000, 'Analog IC': 18500, Discrete: 13200, 'Opto-semi': 6500, Sensors: 2000, Others: 800 },
    { name: '2025E', Memory: 7000, 'Logic Processor': 12500, MCU: 10000, 'Analog IC': 20000, Discrete: 14000, 'Opto-semi': 6000, Sensors: 2500, Others: 800 },
    { name: '2026F', Memory: 7500, 'Logic Processor': 13500, MCU: 11000, 'Analog IC': 21000, Discrete: 15500, 'Opto-semi': 6000, Sensors: 3000, Others: 800 },
    { name: '2027F', Memory: 7800, 'Logic Processor': 14800, MCU: 11500, 'Analog IC': 23500, Discrete: 15500, 'Opto-semi': 6800, Sensors: 3000, Others: 800 },
    { name: '2028F', Memory: 8500, 'Logic Processor': 16500, MCU: 12000, 'Analog IC': 25000, Discrete: 17000, 'Opto-semi': 6800, Sensors: 3500, Others: 800 },
    { name: '2029F', Memory: 9800, 'Logic Processor': 17800, MCU: 12500, 'Analog IC': 27000, Discrete: 18000, 'Opto-semi': 7500, Sensors: 3500, Others: 800 }
  ]
};
