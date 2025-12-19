import React from 'react';

const BaguaAnimation: React.FC = () => {
  return (
    <div className="relative w-64 h-64 flex items-center justify-center">
      <div className="absolute inset-0 border-4 border-amber-600 rounded-full opacity-20 animate-pulse"></div>
      {/* 八卦图 SVG */}
      <svg className="w-full h-full bagua-rotate opacity-60 text-amber-500" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.5" />
        {/* 这里简化了八卦线条，用文字代替 */}
        <text x="45" y="12" fontSize="8" fill="currentColor" className="font-serif">乾</text>
        <text x="45" y="94" fontSize="8" fill="currentColor" className="font-serif">坤</text>
        <text x="88" y="54" fontSize="8" fill="currentColor" className="font-serif">离</text>
        <text x="4" y="54" fontSize="8" fill="currentColor" className="font-serif">坎</text>
        <text x="78" y="20" fontSize="8" fill="currentColor" className="font-serif">兑</text>
        <text x="14" y="86" fontSize="8" fill="currentColor" className="font-serif">震</text>
        <text x="14" y="20" fontSize="8" fill="currentColor" className="font-serif">巽</text>
        <text x="78" y="86" fontSize="8" fill="currentColor" className="font-serif">艮</text>
      </svg>
      <div className="absolute w-16 h-16 bg-amber-600/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-amber-500/50 gold-glow">
        <span className="text-amber-500 font-bold text-2xl">道</span>
      </div>
    </div>
  );
};

export default BaguaAnimation;