
import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <Suspense fallback={
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#2D5D3A]/20 border-t-[#2D5D3A] rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-slate-500 tracking-widest uppercase">Initializing Generator...</p>
        </div>
      </div>
    }>
      <App />
    </Suspense>
  </React.StrictMode>
);
