
import React, { useState, useRef } from 'react';
import { ChartConfig, ChartType, AspectRatio, ThemeMode, ChartDataPoint, PaletteType } from '../types';
import { Settings, Database, Palette, Download, Plus, Trash2, FileUp, Languages, Loader2, Eye, EyeOff } from 'lucide-react';
import * as XLSX from 'xlsx';
import { GoogleGenAI } from "@google/genai";

interface EditorPanelProps {
  config: ChartConfig;
  onChange: (config: ChartConfig) => void;
  onExport: () => void;
}

const EditorPanel: React.FC<EditorPanelProps> = ({ config, onChange, onExport }) => {
  const [activeTab, setActiveTab] = useState<'content' | 'data'>('content');
  const [isTranslatingTitle, setIsTranslatingTitle] = useState(false);
  const [isTranslatingSubtitle, setIsTranslatingSubtitle] = useState(false);
  const [isTranslatingSource, setIsTranslatingSource] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateConfig = (updates: Partial<ChartConfig>) => {
    onChange({ ...config, ...updates });
  };

  const handleTranslate = async (field: 'title' | 'subtitle' | 'source', targetLang: 'English' | 'Traditional Chinese' | 'Simplified Chinese') => {
    const textToTranslate = config[field];
    if (!textToTranslate || textToTranslate.trim() === '') return;

    if (field === 'title') setIsTranslatingTitle(true);
    else if (field === 'subtitle') setIsTranslatingSubtitle(true);
    else if (field === 'source') setIsTranslatingSource(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Translate the following text to ${targetLang}. 
        Context: Professional market research reports for TrendForce. 
        Important: Use professional industry terminology (e.g., semiconductor, CAGR, foundry, etc.).
        Only return the translated text without any explanations, notes, or quotes.
        Text: "${textToTranslate}"`,
      });

      const translatedText = response.text?.trim();
      if (translatedText) {
        updateConfig({ [field]: translatedText });
      }
    } catch (error) {
      console.error("Translation failed:", error);
      alert("AI Translation failed. Please try again.");
    } finally {
      if (field === 'title') setIsTranslatingTitle(false);
      else if (field === 'subtitle') setIsTranslatingSubtitle(false);
      else if (field === 'source') setIsTranslatingSource(false);
    }
  };

  const handleDataChange = (index: number, field: string, value: string | number) => {
    const newData = [...config.data];
    newData[index] = { ...newData[index], [field]: value };
    updateConfig({ data: newData });
  };

  const addRow = () => {
    const newPoint: ChartDataPoint = { name: 'New Item' };
    config.categories.forEach(cat => (newPoint as any)[cat] = 0);
    updateConfig({ data: [...config.data, newPoint] });
  };

  const removeRow = (index: number) => {
    const newData = config.data.filter((_, i) => i !== index);
    updateConfig({ data: newData });
  };

  const addCategory = () => {
    const name = prompt('Enter category name:');
    if (name && !config.categories.includes(name)) {
      updateConfig({ categories: [...config.categories, name] });
    }
  };

  const removeCategory = (catName: string) => {
    if (config.categories.length <= 1) {
      alert("Must have at least one category.");
      return;
    }
    updateConfig({ categories: config.categories.filter(c => c !== catName) });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];

      if (data.length < 2) {
        alert("The file seems empty or has insufficient data.");
        return;
      }

      const headers = data[0];
      const categories = headers.slice(1).filter(h => !!h).map(h => String(h));
      
      const newData: ChartDataPoint[] = data.slice(1)
        .filter(row => row.length > 0 && row[0] !== undefined)
        .map(row => {
          const point: ChartDataPoint = { name: String(row[0]) };
          categories.forEach((cat, idx) => {
            const val = row[idx + 1];
            point[cat] = typeof val === 'number' ? val : (parseFloat(String(val)) || 0);
          });
          return point;
        });

      updateConfig({
        categories,
        data: newData
      });
      
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="w-full lg:w-96 bg-white border-r border-slate-200 flex flex-col h-screen shrink-0 overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
        <h2 className="font-bold text-slate-800 flex items-center gap-2 text-base">
          <Settings size={20} className="text-[#2D5D3A]" /> Configuration
        </h2>
        <button 
          onClick={onExport}
          className="bg-[#2D5D3A] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-opacity-90 transition-all flex items-center gap-2 shadow-sm"
        >
          <Download size={14} /> Export PNG
        </button>
      </div>

      <div className="flex border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('content')}
          className={`flex-1 py-3 text-sm font-bold flex justify-center items-center gap-2 transition-colors ${activeTab === 'content' ? 'text-[#2D5D3A] border-b-2 border-[#2D5D3A]' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Palette size={16} /> Basic
        </button>
        <button 
          onClick={() => setActiveTab('data')}
          className={`flex-1 py-3 text-sm font-bold flex justify-center items-center gap-2 transition-colors ${activeTab === 'data' ? 'text-[#2D5D3A] border-b-2 border-[#2D5D3A]' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Database size={16} /> Data
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
        {activeTab === 'content' && (
          <>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">Main Title</label>
                <div className="flex items-center gap-1">
                  {isTranslatingTitle ? (
                    <Loader2 size={12} className="animate-spin text-[#2D5D3A]" />
                  ) : (
                    <>
                      <button onClick={() => handleTranslate('title', 'English')} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full hover:bg-slate-200">EN</button>
                      <button onClick={() => handleTranslate('title', 'Traditional Chinese')} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full hover:bg-slate-200">繁</button>
                      <button onClick={() => handleTranslate('title', 'Simplified Chinese')} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full hover:bg-slate-200">簡</button>
                    </>
                  )}
                </div>
              </div>
              <textarea 
                rows={2}
                value={config.title}
                onChange={(e) => updateConfig({ title: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-[#2D5D3A]/20 focus:border-[#2D5D3A] outline-none transition-all resize-none"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">Subtitle / Unit</label>
                <div className="flex items-center gap-1">
                  {isTranslatingSubtitle ? (
                    <Loader2 size={12} className="animate-spin text-[#2D5D3A]" />
                  ) : (
                    <>
                      <button onClick={() => handleTranslate('subtitle', 'English')} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full hover:bg-slate-200">EN</button>
                      <button onClick={() => handleTranslate('subtitle', 'Traditional Chinese')} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full hover:bg-slate-200">繁</button>
                      <button onClick={() => handleTranslate('subtitle', 'Simplified Chinese')} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full hover:bg-slate-200">簡</button>
                    </>
                  )}
                </div>
              </div>
              <input 
                type="text" 
                value={config.subtitle}
                onChange={(e) => updateConfig({ subtitle: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-[#2D5D3A]/20 focus:border-[#2D5D3A] outline-none transition-all"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">Source Credit</label>
                <div className="flex items-center gap-1">
                  {isTranslatingSource ? (
                    <Loader2 size={12} className="animate-spin text-[#2D5D3A]" />
                  ) : (
                    <>
                      <button onClick={() => handleTranslate('source', 'English')} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full hover:bg-slate-200">EN</button>
                      <button onClick={() => handleTranslate('source', 'Traditional Chinese')} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full hover:bg-slate-200">繁</button>
                      <button onClick={() => handleTranslate('source', 'Simplified Chinese')} className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full hover:bg-slate-200">簡</button>
                    </>
                  )}
                </div>
              </div>
              <input 
                type="text" 
                value={config.source}
                onChange={(e) => updateConfig({ source: e.target.value })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-[#2D5D3A]/20 focus:border-[#2D5D3A] outline-none transition-all"
              />
            </div>

            <div className="space-y-3">
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">Chart Type</label>
              <select 
                value={config.chartType}
                onChange={(e) => updateConfig({ chartType: e.target.value as ChartType })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#2D5D3A]/20 focus:border-[#2D5D3A] transition-all"
              >
                <option value={ChartType.STACKED_BAR}>Stacked Bar</option>
                <option value={ChartType.BAR}>Grouped Bar</option>
                <option value={ChartType.PIE}>Pie Chart</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">Color Palette</label>
              <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                <button 
                  onClick={() => updateConfig({ paletteType: PaletteType.MULTI })}
                  className={`flex-1 py-1.5 rounded-md text-[11px] font-bold transition-all flex items-center justify-center gap-2 ${config.paletteType === PaletteType.MULTI ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <div className="flex gap-0.5">
                    <div className="w-2 h-2 rounded-full bg-[#4e79a7]"></div>
                    <div className="w-2 h-2 rounded-full bg-[#f28e2b]"></div>
                    <div className="w-2 h-2 rounded-full bg-[#59a14f]"></div>
                  </div>
                  Multi-color
                </button>
                <button 
                  onClick={() => updateConfig({ paletteType: PaletteType.SINGLE })}
                  className={`flex-1 py-1.5 rounded-md text-[11px] font-bold transition-all flex items-center justify-center gap-2 ${config.paletteType === PaletteType.SINGLE ? 'bg-white text-[#4d7c0f] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  <div className="flex gap-0.5">
                    <div className="w-2 h-2 rounded-full bg-[#4d7c0f]"></div>
                    <div className="w-2 h-2 rounded-full bg-[#84cc16]"></div>
                    <div className="w-2 h-2 rounded-full bg-[#ecfccb]"></div>
                  </div>
                  Single Green
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1 space-y-3">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">Ratio</label>
                <select 
                  value={config.aspectRatio}
                  onChange={(e) => updateConfig({ aspectRatio: e.target.value as AspectRatio })}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-[#2D5D3A]/20 focus:border-[#2D5D3A] transition-all"
                >
                  <option value={AspectRatio.WIDE}>16:9 (Landscape)</option>
                  <option value={AspectRatio.PORTRAIT}>4:5 (Portrait)</option>
                </select>
              </div>
              <div className="flex-1 space-y-3">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">Theme</label>
                <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                  <button 
                    onClick={() => updateConfig({ theme: ThemeMode.LIGHT })}
                    className={`flex-1 py-1.5 rounded-md text-[11px] font-bold transition-all ${config.theme === ThemeMode.LIGHT ? 'bg-white text-[#2D5D3A] shadow-sm' : 'text-slate-500'}`}
                  >Light</button>
                  <button 
                    onClick={() => updateConfig({ theme: ThemeMode.DARK })}
                    className={`flex-1 py-1.5 rounded-md text-[11px] font-bold transition-all ${config.theme === ThemeMode.DARK ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500'}`}
                  >Dark</button>
                </div>
              </div>
            </div>

            {/* Labels Visibility Toggle */}
            <div className="space-y-3 pt-2">
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">Display Options</label>
              <button
                onClick={() => updateConfig({ showLabels: !config.showLabels })}
                className={`w-full flex items-center justify-between px-4 py-3 border rounded-xl text-sm font-bold transition-all ${config.showLabels ? 'bg-[#2D5D3A]/5 border-[#2D5D3A] text-[#2D5D3A]' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
              >
                <span className="flex items-center gap-3">
                  {config.showLabels ? <Eye size={18} /> : <EyeOff size={18} />}
                  Show Data Labels
                </span>
                <div className={`w-10 h-5 rounded-full relative transition-colors ${config.showLabels ? 'bg-[#2D5D3A]' : 'bg-slate-300'}`}>
                   <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${config.showLabels ? 'translate-x-6' : 'translate-x-1'}`} />
                </div>
              </button>
            </div>
          </>
        )}

        {activeTab === 'data' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={addRow}
                className="text-xs font-bold bg-slate-50 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-slate-100 border border-slate-200 text-slate-600 transition-all"
              >
                <Plus size={14} /> Add Row
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-bold bg-white py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-[#2D5D3A]/5 border border-[#2D5D3A] text-[#2D5D3A] transition-all"
              >
                <FileUp size={14} /> Import Excel
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept=".xlsx, .xls, .csv" 
                className="hidden" 
              />
            </div>
            
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left border-collapse min-w-[350px]">
                <thead className="bg-slate-50 text-[10px] uppercase text-slate-400 font-black tracking-wider">
                  <tr>
                    <th className="p-3 border-b border-slate-200">Label</th>
                    {config.categories.map(cat => (
                      <th key={cat} className="p-3 border-b border-slate-200 group relative text-center">
                        <div className="flex items-center justify-center gap-1">
                          {cat}
                          <button 
                            onClick={() => removeCategory(cat)}
                            className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remove category"
                          >
                            ×
                          </button>
                        </div>
                      </th>
                    ))}
                    <th className="p-3 border-b border-slate-200 w-10 text-center">
                      <button 
                        onClick={addCategory} 
                        className="text-[#2D5D3A] hover:bg-[#2D5D3A]/10 w-6 h-6 rounded flex items-center justify-center transition-all"
                        title="Add Category"
                      >
                        <Plus size={14} strokeWidth={3} />
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody className="text-xs font-medium">
                  {config.data.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="p-2 border-b border-slate-100">
                        <input 
                          value={row.name} 
                          onChange={(e) => handleDataChange(idx, 'name', e.target.value)}
                          className="w-full p-2 bg-transparent focus:bg-white border-transparent focus:border-[#2D5D3A]/20 border rounded outline-none transition-all"
                        />
                      </td>
                      {config.categories.map(cat => (
                        <td key={cat} className="p-2 border-b border-slate-100">
                          <input 
                            type="number"
                            value={row[cat] ?? 0} 
                            onChange={(e) => handleDataChange(idx, cat, parseFloat(e.target.value) || 0)}
                            className="w-full p-2 bg-transparent text-center focus:bg-white border-transparent focus:border-[#2D5D3A]/20 border rounded outline-none transition-all"
                          />
                        </td>
                      ))}
                      <td className="p-2 border-b border-slate-100 text-center">
                        <button 
                          onClick={() => removeRow(idx)} 
                          className="text-slate-300 hover:text-red-500 transition-colors p-1"
                          title="Remove row"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg flex items-start gap-2">
              <div className="text-amber-500 mt-0.5">💡</div>
              <p className="text-[10px] text-amber-700 leading-relaxed font-medium">
                Tip: Import expects the first row as headers (categories) and the first column as item labels.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorPanel;
