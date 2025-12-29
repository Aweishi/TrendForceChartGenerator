
import React, { forwardRef, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LabelList
} from 'recharts';
import { ChartConfig, ChartType, ThemeMode, AspectRatio, PaletteType } from '../types';
import { MULTI_COLORS, SINGLE_COLORS } from '../constants';
import TrendForceLogo from './TrendForceLogo';

interface ChartCanvasProps {
  config: ChartConfig;
}

const ChartCanvas = forwardRef<HTMLDivElement, ChartCanvasProps>(({ config }, ref) => {
  const isDark = config.theme === ThemeMode.DARK;
  const bgColor = isDark ? '#1A1A1A' : '#FFFFFF';
  const textColor = isDark ? '#E5E5E5' : '#1A1A1A';
  const gridColor = isDark ? '#333333' : '#E0E0E0';

  const palette = config.paletteType === PaletteType.SINGLE ? SINGLE_COLORS : MULTI_COLORS;

  const chartData = useMemo(() => {
    return (config.data || []).map(item => ({
      ...item,
      _total: config.categories.reduce((sum, cat) => sum + (Number(item[cat]) || 0), 0)
    }));
  }, [config.data, config.categories]);

  const renderCustomLegend = (props: any) => {
    const { payload, layout } = props;
    if (!payload) return null;

    const isVertical = layout === 'vertical';

    return (
      <div style={{ 
        textAlign: isVertical ? 'left' : 'center', 
        marginBottom: isVertical ? '0' : '24px', 
        padding: isVertical ? '0 0 0 24px' : '0 16px',
        lineHeight: '1.2'
      }}>
        {payload.filter((entry: any) => entry.value !== '_total').map((entry: any, index: number) => (
          <div 
            key={`legend-item-${index}`} 
            style={{ 
              display: isVertical ? 'block' : 'inline-block', 
              margin: isVertical ? '8px 0' : '4px 12px',
              whiteSpace: 'nowrap'
            }}
          >
            <div 
              style={{ 
                width: '12px', 
                height: '12px', 
                backgroundColor: entry.color,
                borderRadius: '2px',
                display: 'inline-block',
                verticalAlign: 'middle',
                marginRight: '8px'
              }} 
            />
            <span style={{ 
              color: textColor, 
              fontSize: '13px', 
              fontWeight: 700,
              display: 'inline-block',
              verticalAlign: 'middle',
              lineHeight: '13px' 
            }}>
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const renderChart = () => {
    if (!config.categories || config.categories.length === 0) return null;

    switch (config.chartType) {
      case ChartType.PIE:
        const pieData = config.categories.map((cat, idx) => ({
          name: cat,
          value: config.data.reduce((sum, point) => sum + (Number(point[cat]) || 0), 0),
          color: palette[idx % palette.length]
        }));
        
        return (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="42%" 
                cy="50%"
                innerRadius="35%"
                outerRadius="72%"
                paddingAngle={2}
                dataKey="value"
                label={config.showLabels ? (entry: any) => `${entry.name}: ${Number(entry.value).toLocaleString()}` : false}
                labelLine={config.showLabels}
                isAnimationActive={false}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke={bgColor} strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: bgColor, borderColor: gridColor, borderRadius: '8px', color: textColor }}
                itemStyle={{ color: textColor, fontWeight: 'bold' }}
                formatter={(val: number) => val.toLocaleString()}
              />
              <Legend 
                layout="vertical"
                verticalAlign="middle" 
                align="right"
                content={renderCustomLegend}
              />
            </PieChart>
          </ResponsiveContainer>
        );

      case ChartType.BAR:
      case ChartType.STACKED_BAR:
      default:
        return (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 40, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} opacity={0.5} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: textColor, fontSize: 16, fontWeight: 700 }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: textColor, fontSize: 13, fontWeight: 500 }}
                tickFormatter={(val) => val.toLocaleString()}
              />
              <Tooltip 
                cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', radius: 4 }}
                contentStyle={{ 
                  backgroundColor: bgColor, 
                  border: `1px solid ${gridColor}`,
                  borderRadius: '8px',
                  color: textColor,
                  fontWeight: 'bold',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}
                formatter={(val: number) => val.toLocaleString()}
              />
              <Legend 
                verticalAlign="top"
                align="center"
                layout="horizontal"
                content={renderCustomLegend}
              />
              {config.categories.map((cat, index) => (
                <Bar 
                  key={`bar-${cat}`} 
                  dataKey={cat} 
                  stackId={config.chartType === ChartType.STACKED_BAR ? 'a' : undefined} 
                  fill={palette[index % palette.length]} 
                  barSize={config.chartType === ChartType.STACKED_BAR ? 65 : undefined}
                  radius={config.chartType === ChartType.STACKED_BAR ? [0, 0, 0, 0] : [4, 4, 0, 0]}
                  isAnimationActive={false}
                >
                  {config.showLabels && config.chartType !== ChartType.STACKED_BAR && (
                    <LabelList 
                      dataKey={cat} 
                      position="top" 
                      fill={textColor}
                      fontSize={11}
                      fontWeight={700}
                      offset={10}
                      formatter={(val: any) => {
                        const num = Number(val);
                        return num > 0 ? num.toLocaleString() : '';
                      }}
                    />
                  )}
                </Bar>
              ))}
              {config.showLabels && config.chartType === ChartType.STACKED_BAR && (
                <Bar 
                  dataKey="_total" 
                  stackId="total-stack"
                  fill="transparent" 
                  isAnimationActive={false}
                  tooltipType="none"
                  legendType="none"
                  barSize={0} 
                >
                  <LabelList 
                    dataKey="_total"
                    position="top" 
                    fill={textColor} 
                    fontSize={13} 
                    fontWeight={800}
                    offset={10}
                    formatter={(val: any) => Number(val).toLocaleString()} 
                  />
                </Bar>
              )}
            </BarChart>
          </ResponsiveContainer>
        );
    }
  };

  const getContainerStyles = (): React.CSSProperties => {
    switch (config.aspectRatio) {
      case AspectRatio.PORTRAIT:
        return { width: '540px', height: '675px' };
      case AspectRatio.WIDE:
      default:
        return { width: '960px', height: '540px' };
    }
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div 
        ref={ref}
        id="chart-export-container"
        className="relative flex flex-col overflow-hidden shadow-2xl transition-all duration-300 shrink-0 rounded-sm"
        style={{ ...getContainerStyles(), backgroundColor: bgColor }}
      >
        <div className="h-2 w-full bg-[#2D5D3A] shrink-0"></div>

        {/* Watermark using the actual PNG Logo */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none select-none z-0">
          <TrendForceLogo className="scale-[5] -rotate-12 translate-y-4" theme={isDark ? 'dark' : 'light'} />
        </div>

        <div className="px-12 pt-12 pb-4 z-10 text-center shrink-0">
          <h1 className="text-4xl font-extrabold tracking-tight leading-tight whitespace-pre-wrap" style={{ color: textColor }}>
            {config.title || 'Chart Title'}
          </h1>
          {config.subtitle && (
            <p className="text-lg font-semibold opacity-60 mt-2" style={{ color: textColor }}>
              {config.subtitle}
            </p>
          )}
        </div>

        <div className="flex-1 px-12 pb-6 z-10 min-h-0">
          {renderChart()}
        </div>

        <div className="px-12 pb-12 flex justify-between items-end z-10 shrink-0">
          <div className="text-sm opacity-50 font-bold tracking-tight" style={{ color: textColor }}>
            {config.source}
          </div>
          <TrendForceLogo theme={isDark ? 'dark' : 'light'} className="scale-100" />
        </div>
      </div>
      
      <div className="mt-4 flex items-center gap-2 px-3 py-1 bg-slate-200/50 rounded-full">
        <div className="w-1.5 h-1.5 bg-[#2D5D3A] rounded-full animate-pulse"></div>
        <div className="text-[10px] text-slate-500 font-bold font-mono uppercase tracking-widest">
          {config.aspectRatio === AspectRatio.WIDE ? '1920 x 1080' : '1080 x 1350'} (2x Export)
        </div>
      </div>
    </div>
  );
});

export default ChartCanvas;
