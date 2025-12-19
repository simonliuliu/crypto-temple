import React from 'react';
import type { Deity } from '../types';

interface Props {
  deity: Deity;
  visible: boolean;
}

const DeityFigure: React.FC<Props> = ({ deity, visible }) => {
  return (
    <div
      style={{
        position: 'absolute',
        left: `calc(50% + ${deity.x}%)`,
        bottom: `${deity.y}%`,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translate(-50%, 0) scale(1)' : 'translate(-50%, 50px) scale(0)',
        transition: `all 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${deity.id * 0.1}s`,
        zIndex: deity.side === 'back' ? 5 : 25,
      }}
      className="flex flex-col items-center pointer-events-none"
    >
      <div className={`text-3xl lg:text-5xl mb-1 bg-gradient-to-br ${deity.color} to-white bg-clip-text text-transparent drop-shadow-lg`}>
        {deity.icon}
      </div>
      <div className="bg-black/40 backdrop-blur-sm px-2 py-0.5 rounded border border-yellow-500/30">
        <span className="text-[10px] text-white font-bold whitespace-nowrap">{deity.name}</span>
      </div>
    </div>
  );
};

export default DeityFigure;