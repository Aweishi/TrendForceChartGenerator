
import React, { useState, useRef } from 'react';
import { ChartConfig } from './types';
import { INITIAL_DATA } from './constants';
import EditorPanel from './components/EditorPanel';
import ChartCanvas from './components/ChartCanvas';
import html2canvas from 'html2canvas';

const App: React.FC = () => {
  const [config, setConfig] = useState<ChartConfig>(INITIAL_DATA);
  const chartRef = useRef<HTMLDivElement>(null);

  const handleExport = async () => {
    if (!chartRef.current) return;
    
    // Slight delay to ensure React state has rendered if we just changed something
    await new Promise(r => setTimeout(r, 100));

    try {
      const canvas = await html2canvas(chartRef.current, {
        scale: 2, // Higher resolution
        useCORS: true,
        backgroundColor: null,
      });
      
      const link = document.createElement('a');
      link.download = `trendforce-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
      alert("Failed to export image. Please try again.");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Sidebar Editor */}
      <EditorPanel 
        config={config} 
        onChange={setConfig} 
        onExport={handleExport} 
      />

      {/* Preview Area */}
      <main className="flex-1 bg-slate-100 flex items-center justify-center p-4 lg:p-12 overflow-auto">
        <div className="max-w-full overflow-auto flex items-center justify-center">
            <ChartCanvas ref={chartRef} config={config} />
        </div>

        {/* Floating Instruction */}
        <div className="fixed bottom-6 right-6 bg-white/80 backdrop-blur-sm border border-slate-200 px-4 py-2 rounded-full shadow-lg text-[10px] font-medium text-slate-500 uppercase tracking-widest hidden md:block">
          TrendForce Internal Tool v1.0 • Social Media Asset Generator
        </div>
      </main>
    </div>
  );
};

export default App;
