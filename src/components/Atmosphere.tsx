import React, { useEffect, useState } from 'react';

// 灵符粒子
const Talisman = ({ delay, left }: { delay: number; left: number }) => (
  <div
    className="absolute top-[-50px] w-6 h-10 bg-yellow-400 border border-red-600 flex flex-col items-center justify-around opacity-0 animate-fall"
    style={{
      left: `${left}%`,
      animationDelay: `${delay}s`,
      animationDuration: `${5 + Math.random() * 5}s`,
    }}
  >
    <div className="w-full h-[2px] bg-red-600 mb-1"></div>
    <div className="text-[8px] text-red-700 font-bold leading-none writing-vertical">敕令</div>
    <div className="text-[6px] text-red-600 leading-none">⚡</div>
    <div className="w-3 h-3 border border-red-600 rounded-full mt-1"></div>
  </div>
);

// 香火烟雾粒子
const Smoke = ({ delay, left, scale }: { delay: number; left: number; scale: number }) => (
  <div
    className="absolute bottom-0 w-4 h-4 bg-white rounded-full blur-md opacity-0 animate-rise"
    style={{
      left: `${left}%`,
      animationDelay: `${delay}s`,
      transform: `scale(${scale})`,
    }}
  ></div>
);

const Atmosphere: React.FC = () => {
  const [talismans, setTalismans] = useState<number[]>([]);
  const [smokes, setSmokes] = useState<number[]>([]);

  useEffect(() => {
    // 生成随机的灵符和烟雾数量
    setTalismans(Array.from({ length: 20 }));
    setSmokes(Array.from({ length: 15 }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {/* 灵符层 */}
      {talismans.map((_, i) => (
        <Talisman key={`t-${i}`} delay={Math.random() * 10} left={Math.random() * 100} />
      ))}
      
      {/* 香火层 (集中在中间下方) */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-1/2 max-w-2xl">
         {smokes.map((_, i) => (
            <Smoke key={`s-${i}`} delay={Math.random() * 5} left={20 + Math.random() * 60} scale={1 + Math.random() * 2} />
         ))}
      </div>
    </div>
  );
};

export default Atmosphere;