import React from 'react';
import type { Deity, DeityCardInfo } from './types';

// 1. ⛩️ Logo
export const TempleLogo = () => (
  <svg viewBox="0 0 48 48" className="w-10 h-10 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]">
    <circle cx="24" cy="24" r="22" fill="none" stroke="#b45309" strokeWidth="1.5" strokeDasharray="4 2" className="opacity-50" />
    <path d="M4 20 L24 8 L44 20" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
    <path d="M10 20 L10 36 Q24 42 38 36 L38 20" fill="none" stroke="#fbbf24" strokeWidth="2" />
    <circle cx="24" cy="26" r="4" fill="#991b1b" stroke="#fbbf24" strokeWidth="1" />
    <line x1="24" y1="8" x2="24" y2="22" stroke="#b45309" strokeWidth="1" />
    <line x1="24" y1="30" x2="24" y2="42" stroke="#b45309" strokeWidth="1" />
  </svg>
);

// 🟢 新增：喇叭开启图标
export const SpeakerOnSVG = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-amber-500">
    <path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77zm-4 0c-4.01.91-7 4.49-7 8.77s2.99 7.86 7 8.77v-2.06c-2.89-.86-5-3.54-5-6.71s2.11-5.85 5-6.71V3.23zM3 9v6h4l5 5V4L7 9H3z" />
  </svg>
);

// 🟢 新增：喇叭关闭图标
export const SpeakerOffSVG = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-stone-500">
    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73 4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
  </svg>
);

// 2. 🚪 SVG 大门 (3500ms)
export const TempleGate = ({ isOpen }: { isOpen: boolean }) => (
  <svg viewBox="0 0 400 300" className="w-full h-full drop-shadow-[0_0_50px_rgba(251,191,36,0.4)]">
    <defs>
      <linearGradient id="roofGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#fbbf24" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>
    </defs>
    <rect x="30" y="260" width="340" height="20" fill="#1c1917" />
    <rect x="50" y="245" width="300" height="15" fill="#292524" />
    <rect x="80" y="110" width="240" height="135" fill="#7f1d1d" stroke="#450a0a" strokeWidth="2" />
    <rect x="155" y="150" width="90" height="95" fill="#000000" />
    
    <g className={`transition-transform duration-[3500ms] ease-in-out origin-[155px_center] ${isOpen ? '[transform:rotateY(-115deg)]' : ''}`}>
      <rect x="155" y="150" width="45" height="95" fill="#450a0a" stroke="#ca8a04" strokeWidth="1" />
      <circle cx="165" cy="170" r="2" fill="#fbbf24" opacity="0.8" />
      <circle cx="190" cy="190" r="5" fill="#1c1917" stroke="#fbbf24" strokeWidth="2" />
    </g>

    <g className={`transition-transform duration-[3500ms] ease-in-out origin-[245px_center] ${isOpen ? '[transform:rotateY(115deg)]' : ''}`}>
      <rect x="200" y="150" width="45" height="95" fill="#450a0a" stroke="#ca8a04" strokeWidth="1" />
      <circle cx="235" cy="170" r="2" fill="#fbbf24" opacity="0.8" />
      <circle cx="210" cy="190" r="5" fill="#1c1917" stroke="#fbbf24" strokeWidth="2" />
    </g>
    
    <path d="M20 130 L200 60 L380 130 L390 145 L200 85 L10 145 Z" fill="url(#roofGradient)" stroke="#b45309" strokeWidth="1" />
    <rect x="130" y="50" width="140" height="60" fill="#991b1b" />
    <rect x="145" y="60" width="110" height="40" fill="#7f1d1d" stroke="#450a0a" strokeWidth="1" />
    <rect x="180" y="65" width="40" height="20" fill="#1c1917" stroke="#fbbf24" strokeWidth="1" />
    <path d="M60 70 L200 10 L340 70 L350 85 L200 35 L50 85 Z" fill="url(#roofGradient)" stroke="#b45309" strokeWidth="1" />
    <path d="M195 10 L200 0 L205 10 Z" fill="#fbbf24" />
  </svg>
);

// 3. 📦 功德箱
export const MeritBoxSVG = () => (
  <svg viewBox="0 0 200 160" className="w-32 h-24 drop-shadow-xl">
    <path d="M20 60 L180 60 L190 150 L10 150 Z" fill="#7f1d1d" stroke="#450a0a" strokeWidth="2" />
    <path d="M20 60 L180 60 L160 40 L40 40 Z" fill="#991b1b" stroke="#450a0a" strokeWidth="2" />
    <rect x="80" y="45" width="40" height="8" rx="2" fill="#000" stroke="#450a0a" />
    <rect x="70" y="80" width="60" height="40" fill="#450a0a" opacity="0.3" />
    <text x="100" y="110" textAnchor="middle" fill="#fbbf24" fontSize="24" fontWeight="bold" fontFamily="serif" style={{textShadow: '0 1px 2px black'}}>功德</text>
    <circle cx="100" cy="70" r="5" fill="#fbbf24" />
    <path d="M98 70 L102 70 L102 80 L98 80 Z" fill="#fbbf24" />
  </svg>
);

// 4. 🪙 铜钱
export const CoinSVG = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 40 40" className={className}>
    <circle cx="20" cy="20" r="18" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
    <circle cx="20" cy="20" r="14" fill="none" stroke="#d97706" strokeWidth="1" opacity="0.5" />
    <rect x="14" y="14" width="12" height="12" fill="none" stroke="#d97706" strokeWidth="2" />
    <rect x="16" y="16" width="8" height="8" fill="#d97706" opacity="0.2" />
  </svg>
);

// 5. 经文内容
export const SCRIPTURES = {
  left: [
    "道可道非常道名可名非常名",
    "人法地地法天天法道道法自然",
    "太上台星应变无停驱邪缚魅保命护身"
  ],
  right: [
    "一生二二生三三生万物",
    "天地不仁以万物为刍狗",
    "智慧出有大伪六亲不和有孝慈"
  ]
};

// 6. 众神占位
export const CROWD_DEITIES: Deity[] = [
  { id: 1, name: "吕洞宾", title: "纯阳祖师", side: 'left', x: -38, y: 15, icon: "⚔️", color: "from-yellow-400" },
  { id: 2, name: "铁拐李", title: "八仙之首", side: 'left', x: -28, y: 40, icon: "🍶", color: "from-amber-600" },
  { id: 5, name: "韩湘子", title: "瑶华帝君", side: 'right', x: 38, y: 15, icon: "🪈", color: "from-emerald-400" },
  { id: 6, name: "蓝采和", title: "花篮仙子", side: 'right', x: 28, y: 40, icon: "🧺", color: "from-sky-400" },
];

export const MAIN_CARDS: DeityCardInfo[] = [
  { id: 'wealth', name: '赵公明', role: '财神 · 起卦', imageAlt: '武财神', color: 'from-yellow-600/40', icon: '💰', isLocked: false },
  { id: 'guardian', name: '关圣帝君', role: '门神 · 敬请期待', imageAlt: '关羽', color: 'from-red-900/40', icon: '🗡️', isLocked: true }
];