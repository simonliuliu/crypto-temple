import React from 'react';
import type { DeityCardInfo } from '../types';

interface Props {
  info: DeityCardInfo;
  side: 'left' | 'right';
  visible: boolean;
  onClick?: () => void;
}

const DeityCard: React.FC<Props> = ({ info, side, visible, onClick }) => {
  return (
    <div 
      className={`fixed top-1/2 -translate-y-1/2 transition-all duration-1000 flex flex-col items-center z-40
        ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'}
        ${side === 'left' ? 'left-4 lg:left-16' : 'right-4 lg:right-16'}
      `}
    >
      <div 
        onClick={!info.isLocked ? onClick : undefined}
        className={`relative w-44 h-64 lg:w-72 lg:h-[480px] rounded-2xl overflow-hidden border-2 transition-all duration-500 shadow-2xl
          ${info.isLocked ? 'border-gray-700/50 grayscale opacity-60 cursor-not-allowed' : 'border-yellow-500/40 cursor-pointer hover:border-yellow-400 hover:shadow-[0_0_40px_rgba(234,179,8,0.3)] hover:-translate-y-2'}
          group
        `}
      >
        {/* Background Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-b ${info.color} to-transparent opacity-40`}></div>
        
        {/* Divine Icon */}
        <div className={`absolute inset-0 flex items-center justify-center text-7xl lg:text-9xl transition-transform duration-700
          ${!info.isLocked ? 'group-hover:scale-110 opacity-30' : 'opacity-10'}
        `}>
          {info.icon}
        </div>

        {/* Locked Overlay */}
        {info.isLocked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <span className="text-4xl mb-2">🔒</span>
            <span className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Soon</span>
          </div>
        )}
        
        {/* Decorative Borders */}
        <div className="absolute top-4 left-4 right-4 flex justify-between opacity-30">
           <div className="w-4 h-4 border-t-2 border-l-2 border-yellow-500"></div>
           <div className="w-4 h-4 border-t-2 border-r-2 border-yellow-500"></div>
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex justify-between opacity-30">
           <div className="w-4 h-4 border-b-2 border-l-2 border-yellow-500"></div>
           <div className="w-4 h-4 border-b-2 border-r-2 border-yellow-500"></div>
        </div>

        {/* Label Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent">
          <p className={`text-[10px] uppercase tracking-[0.2em] font-bold mb-1 ${info.isLocked ? 'text-gray-500' : 'text-yellow-500/80'}`}>
            {info.role}
          </p>
          <h3 className={`text-xl lg:text-3xl font-black glow-text ${info.isLocked ? 'text-gray-400 shadow-none' : 'text-white'}`}>
            {info.name}
          </h3>
        </div>
      </div>

      {/* Action Prompt */}
      {!info.isLocked && visible && (
        <div className="mt-6 animate-bounce">
          <div className="px-4 py-1.5 bg-yellow-500/10 border border-yellow-500/40 rounded-full backdrop-blur-md">
            <span className="text-xs text-yellow-500 font-bold tracking-widest">点击请神起卦</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeityCard;