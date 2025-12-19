import React from 'react';
import { TempleLogo, SpeakerOnSVG, SpeakerOffSVG } from '../constants';
import type { WalletInfo } from '../types';

interface NavbarProps {
  step: string;
  isGateOpen: boolean;
  wallet: WalletInfo | null;
  openWallet: () => void;
  goHome: () => void;
  isMusicPlaying: boolean;
  toggleMusic: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  step, 
  isGateOpen, 
  wallet, 
  openWallet, 
  goHome, 
  isMusicPlaying, 
  toggleMusic 
}) => {
  // 仅在 "首页且未开门" 或者 "已经进入大厅" 时显示导航栏
  // 如果正在播放开门动画 (isGateOpen=true 且 step=welcome)，为了沉浸感可以选择隐藏，
  // 但根据你的需求“全局固定”，我们让它一直显示，只是开门时不要乱动。
  
  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center p-6 border-b border-white/5 backdrop-blur-sm bg-black/20 transition-all duration-500">
      
      {/* 左侧：Logo 与 标题 */}
      <div 
        onClick={goHome} 
        className="flex items-center gap-3 cursor-pointer group transition-opacity hover:opacity-80" 
        title="返回首页"
      >
        <TempleLogo />
        <div className="flex flex-col">
          <h1 className="text-xl font-bold tracking-widest text-amber-500 group-hover:text-amber-400">大加密寺</h1>
          <span className="text-[10px] tracking-[0.3em] text-stone-500 uppercase">Crypto Temple</span>
        </div>
      </div>

      {/* 右侧：功能区 */}
      <div className="flex items-center gap-4">
        
        {/* 🎵 音乐开关 (仅在首页显示) */}
        {step === 'welcome' && (
          <button 
            onClick={toggleMusic}
            className="p-2 border border-stone-700 rounded-full text-amber-500 hover:border-amber-600 hover:bg-stone-800 transition-colors group"
            title={isMusicPlaying ? "静心" : "聆音"}
          >
            {isMusicPlaying ? <SpeakerOnSVG /> : <SpeakerOffSVG />}
          </button>
        )}

        {/* 👛 钱包信息 */}
        {wallet ? (
          <>
            <div className="hidden md:flex flex-col items-end text-xs text-stone-400">
               <div className="flex gap-3">
                  <span>道行 <b className="text-amber-500">{wallet.walletAge}</b></span>
                  <span>业力 <b className="text-amber-500">{wallet.transactionCount}</b></span>
               </div>
               <div className="text-[10px] opacity-60 mt-0.5">{wallet.cyberBazi}</div>
            </div>
            <button 
              onClick={openWallet} 
              className="flex items-center gap-2 px-4 py-2 bg-stone-900 border border-stone-700 rounded-full hover:border-amber-600 transition-all"
            >
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]"></div>
              <span className="text-xs font-mono text-stone-300">{wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}</span>
            </button>
          </>
        ) : (
          <span className="text-xs text-stone-600 border border-white/10 px-3 py-1 rounded-full">未入山门</span>
        )}
      </div>
    </header>
  );
};

export default Navbar;