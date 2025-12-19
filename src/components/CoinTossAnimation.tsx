import React, { useEffect, useState } from 'react';

interface CoinTossAnimationProps {
  onComplete: () => void;
}

const CoinTossAnimation: React.FC<CoinTossAnimationProps> = ({ onComplete }) => {
  const [showRipple, setShowRipple] = useState(false);

  useEffect(() => {
    // 1. 硬币落下动画结束后，显示涟漪
    const timer1 = setTimeout(() => {
      setShowRipple(true);
    }, 800); // 0.8秒后硬币入水

    // 2. 整个动画结束后，回调通知父组件
    const timer2 = setTimeout(() => {
      onComplete();
    }, 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none">
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        
        {/* 🟡 金币 - 抛物线下落动画 */}
        <div className="absolute animate-coin-drop">
           <div className="w-12 h-12 bg-amber-400 rounded-full border-4 border-amber-200 shadow-[0_0_20px_rgba(251,191,36,0.8)] flex items-center justify-center">
              <span className="text-amber-700 font-bold text-xl">₿</span>
           </div>
        </div>

        {/* 💧 水波纹 - 硬币入水后出现 */}
        {showRipple && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
             <div className="w-0 h-0 border-2 border-cyan-400 rounded-full animate-ripple opacity-0"></div>
             <div className="w-0 h-0 border-2 border-cyan-200 rounded-full animate-ripple opacity-0" style={{animationDelay: '0.2s'}}></div>
          </div>
        )}

        <div className="absolute bottom-20 text-amber-200 font-bold text-xl animate-pulse">
           🙏 功德无量...
        </div>
      </div>

      {/* 这里的 style 标签是为了让动画更独立，不污染全局 CSS */}
      <style>{`
        @keyframes coin-drop {
          0% { transform: translateY(100vh) scale(1.5) rotateX(0); opacity: 0; }
          20% { opacity: 1; }
          50% { transform: translateY(-100px) scale(0.8) rotateX(720deg); }
          100% { transform: translateY(0) scale(0) rotateX(1080deg); opacity: 0; }
        }
        .animate-coin-drop {
          animation: coin-drop 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        @keyframes ripple {
          0% { width: 0; height: 0; opacity: 0.8; border-width: 4px; }
          100% { width: 300px; height: 300px; opacity: 0; border-width: 0; }
        }
        .animate-ripple {
          animation: ripple 1s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default CoinTossAnimation;