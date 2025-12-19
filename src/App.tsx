import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import { TempleGate, TempleLogo, MeritBoxSVG, CoinSVG, SCRIPTURES } from './constants';
import BaguaAnimation from './components/BaguaAnimation';
import CoinTossAnimation from './components/CoinTossAnimation';
import FeedbackModal from './components/FeedbackModal'; 
import Atmosphere from './components/Atmosphere'; 
import { ProjectType } from './types';
import type { WalletInfo, ProjectInfo, DivinationResult, HistoryRecord } from './types';
import { getDivination } from './services/openRouterService';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { useDisconnect, useSendTransaction, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { getWalletData } from './services/chainService';
import { parseEther, parseUnits, parseAbi } from 'viem';

const TEMPLE_RECEIVER = "0xe5b8988c90ca60d5f2a913cb3bd35a781ae7f242";
const TOKENS = {
  USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
};
const ERC20_ABI = parseAbi(['function transfer(address to, uint256 amount) returns (bool)']);

const App: React.FC = () => {
  const [step, setStep] = useState<'welcome' | 'halls' | 'input' | 'casting' | 'result'>('welcome');
  const [isGateOpen, setIsGateOpen] = useState(false);
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [project, setProject] = useState<ProjectInfo>({ name: '', type: ProjectType.SECONDARY_MARKET, transactionTime: '', founderInfo: '' });
  const [result, setResult] = useState<DivinationResult | null>(null);
  const [loading, setLoading] = useState(false);
  
  // 支付与动画状态
  const [donationAmount, setDonationAmount] = useState<string>('0.01');
  const [donationCurrency, setDonationCurrency] = useState<'ETH' | 'USDT' | 'USDC'>('ETH');
  const [isPaying, setIsPaying] = useState(false);
  const [showCoinAnimation, setShowCoinAnimation] = useState(false); 
  
  // 音乐状态
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);
  const [pendingFeedbackRecord, setPendingFeedbackRecord] = useState<HistoryRecord | null>(null);
  
  const dateInputRef = useRef<HTMLInputElement>(null);
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { disconnect } = useDisconnect();
  const { sendTransactionAsync } = useSendTransaction();
  const { writeContractAsync } = useWriteContract();
  const { isSuccess: isTxSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  // 1. 初始化权限
  useEffect(() => { if ("Notification" in window && Notification.permission !== "granted") Notification.requestPermission(); }, []);

  // 2. 通知检查逻辑
  useEffect(() => {
    const checkNotifications = () => {
      const savedHistory = localStorage.getItem('temple_history');
      if (!savedHistory) return;

      const history: HistoryRecord[] = JSON.parse(savedHistory);
      const now = Date.now();
      let hasUpdates = false;

      const updatedHistory = history.map(record => {
        const triggerTime = new Date(record.project.transactionTime).getTime();
        const isRecent = now - triggerTime < 24 * 60 * 60 * 1000;

        if (!record.isNotified && now >= triggerTime && isRecent) {
          if (Notification.permission === "granted") {
            const n = new Notification("大加密寺 · 验证之时", {
              body: `施主，您关注的项目【${record.project.name}】吉时已到，卦象灵验否？`,
              icon: "/vite.svg" 
            });
            n.onclick = () => { window.focus(); setPendingFeedbackRecord(record); };
          }
          if (!pendingFeedbackRecord) { setPendingFeedbackRecord(record); }
          hasUpdates = true;
          return { ...record, isNotified: true };
        }
        return record;
      });

      if (hasUpdates) {
        localStorage.setItem('temple_history', JSON.stringify(updatedHistory));
      }
    };

    const timer = setInterval(checkNotifications, 10000);
    checkNotifications();
    return () => clearInterval(timer);
  }, [pendingFeedbackRecord]);

  // 3. 音乐控制逻辑
  useEffect(() => {
    if (step === 'welcome' && audioRef.current) {
      audioRef.current.volume = 0.4;
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => setIsMusicPlaying(true)).catch(e => console.log("Auto-play blocked:", e));
      }
    } else if (step !== 'welcome' && audioRef.current) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
    }
  }, [step]);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isMusicPlaying) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
    } else {
      audioRef.current.play();
      setIsMusicPlaying(true);
    }
  };

  // 4. 进门逻辑
  useEffect(() => {
    async function handleEntry() {
      if (isConnected && address && step === 'welcome') {
        setIsGateOpen(true);
        setLoading(true);
        const timerPromise = new Promise(resolve => setTimeout(resolve, 3500));
        const dataPromise = getWalletData(address).catch(e => null); 
        const [_, data] = await Promise.all([timerPromise, dataPromise]);
        if (data) setWallet(data);
        setStep('halls');
        setLoading(false);
        setIsGateOpen(false);
      } else if (!isConnected && step !== 'welcome') {
        setStep('welcome');
        setIsGateOpen(false);
        setWallet(null);
      }
    }
    handleEntry();
  }, [isConnected, address, step]);

  // 5. 算卦逻辑
  const handleCasting = async () => {
    if (!wallet) return;
    setStep('casting');
    try {
      const divination = await getDivination(wallet, project);
      setResult(divination);
      const newRecord: HistoryRecord = { 
        id: Date.now().toString(), 
        timestamp: Date.now(), 
        project: { ...project }, 
        result: divination, 
        isNotified: false 
      };
      const savedHistory = localStorage.getItem('temple_history');
      const history = savedHistory ? JSON.parse(savedHistory) : [];
      history.push(newRecord);
      localStorage.setItem('temple_history', JSON.stringify(history));
      setTimeout(() => setStep('result'), 2000);
    } catch (error) { console.error(error); alert('API 错误'); setStep('input'); }
  };

  // 6. 支付逻辑
  const handleDonation = async () => {
    if (isNaN(parseFloat(donationAmount))) return;
    setIsPaying(true);
    try {
      let hash: `0x${string}`;
      if (donationCurrency === 'ETH') { hash = await sendTransactionAsync({ to: TEMPLE_RECEIVER, value: parseEther(donationAmount) }); }
      else { const tokenAddr = TOKENS[donationCurrency] as `0x${string}`; hash = await writeContractAsync({ address: tokenAddr, abi: ERC20_ABI, functionName: 'transfer', args: [TEMPLE_RECEIVER, parseUnits(donationAmount, 6)] }); }
      setTxHash(hash);
    } catch (e) { console.error(e); setIsPaying(false); }
  };

  useEffect(() => {
    if (isTxSuccess) {
      setIsPaying(false);
      setShowCoinAnimation(true);
      setTimeout(() => setShowCoinAnimation(false), 3000);
    }
  }, [isTxSuccess]);

  const getCurrentDateTime = () => { const now = new Date(); now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); return now.toISOString().slice(0, 16); };
  const isFormValid = project.name.trim() !== '' && project.transactionTime !== '';
  
  const goHome = () => { 
    if (isConnected) { setStep('halls'); } 
    else { setStep('welcome'); setIsGateOpen(false); } 
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-[url('/bg.jpg')] bg-cover bg-fixed text-stone-200 overflow-x-hidden">
      
      <audio ref={audioRef} src="/bgm.mp3" loop />

      {pendingFeedbackRecord && <FeedbackModal record={pendingFeedbackRecord} onClose={() => setPendingFeedbackRecord(null)} onDonate={() => { setProject(pendingFeedbackRecord.project); setResult(pendingFeedbackRecord.result); setStep('result'); setPendingFeedbackRecord(null); }} />}
      
      {showCoinAnimation && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
           <div className="relative flex flex-col items-center">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/20 rounded-full blur-[100px] animate-pulse"></div>
              <div className="absolute top-[-150px] z-20 animate-coin-drop-center"><CoinSVG className="w-16 h-16" /></div>
              <div className="absolute top-[-50px] z-30 animate-merit-text pointer-events-none">
                 <span className="text-5xl font-black text-yellow-400 drop-shadow-[0_0_15px_rgba(251,191,36,1)]" style={{ fontFamily: 'serif', textShadow: '0 0 20px gold' }}>功德 +1</span>
              </div>
              <div className="scale-150 z-10 filter drop-shadow-2xl"><MeritBoxSVG /></div>
              <p className="mt-16 text-amber-200 font-bold tracking-[0.5em] animate-pulse text-lg">感谢施主 · 福报将至</p>
           </div>
        </div>
      )}

      <Navbar 
        step={step}
        isGateOpen={isGateOpen}
        wallet={wallet}
        openWallet={() => open()}
        goHome={goHome}
        isMusicPlaying={isMusicPlaying}
        toggleMusic={toggleMusic}
      />

      {/* 首页特效层 */}
      {step === 'welcome' && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
            <div className={`absolute left-4 md:left-12 top-0 h-full flex gap-6 md:gap-12 transition-opacity duration-1000 ${isGateOpen ? 'opacity-0' : 'opacity-100'}`}>
                {SCRIPTURES.left.map((text, i) => (
                  <div key={i} className="writing-vertical text-xl md:text-3xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-yellow-600 to-transparent animate-scripture" style={{ animationDelay: `${i * 4}s` }}>{text}</div>
               ))}
            </div>
            <div className={`absolute right-4 md:right-12 top-0 h-full flex gap-6 md:gap-12 transition-opacity duration-1000 ${isGateOpen ? 'opacity-0' : 'opacity-100'}`}>
                {SCRIPTURES.right.map((text, i) => (
                  <div key={i} className="writing-vertical text-xl md:text-3xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-yellow-600 to-transparent animate-scripture" style={{ animationDelay: `${i * 3 + 1.5}s` }}>{text}</div>
               ))}
            </div>
            {/* 🟢 修改：背景八卦缩放 scale-[2.5] -> scale-[2.0] */}
            <div className="absolute inset-0 flex items-center justify-center opacity-30 scale-[2.0]">
              <div className="animate-spin-very-slow"><BaguaAnimation /></div>
            </div>
            <Atmosphere />
        </div>
      )}

      {/* 内容区域 */}
      <main className="flex-1 w-full max-w-4xl flex flex-col items-center justify-center p-4 relative pb-24 z-10 pt-24">
        
        {step === 'welcome' && (
          <div className={`relative w-full h-[70vh] flex flex-col items-center justify-center`}>
            
            {/* 🟢 修改：初始 scale-125 -> scale-105; 动画 scale-[2.5] -> scale-[2.2] */}
            <div className={`transition-all duration-[3500ms] relative z-20 mt-10 ${isGateOpen ? 'scale-[2.2] translate-y-40' : 'scale-105'}`}>
               <div className="w-80 h-60 md:w-96 md:h-72 filter drop-shadow-[0_0_40px_rgba(0,0,0,0.8)]">
                  <TempleGate isOpen={isGateOpen} />
               </div>
            </div>
            
            <div className={`mt-20 text-center transition-all duration-500 relative z-30 ${isGateOpen ? 'translate-y-20 opacity-0' : 'translate-y-0 opacity-100'}`}>
               <h2 className="text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-b from-amber-300 to-amber-600 drop-shadow-sm tracking-tighter">众生皆苦 · 唯有暴富</h2>
               <p className="text-sm text-stone-400 font-serif italic mb-8 tracking-widest">不信技术分析，只看命里注定</p>
               <button onClick={() => open()} disabled={loading || isGateOpen} className="px-12 py-4 bg-red-900 border-2 border-amber-600 text-amber-100 rounded font-bold tracking-[0.2em] hover:bg-red-800 hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(220,38,38,0.3)] relative overflow-hidden group">
                 <span className="relative z-10">{loading ? '正在开门...' : '叩开山门'}</span>
                 <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
               </button>
            </div>
          </div>
        )}

        {/* 内页逻辑 */}
        {step === 'halls' && (
          <div className="w-full grid md:grid-cols-2 gap-8 animate-in fade-in zoom-in-95 duration-700">
             <div onClick={() => setStep('input')} className="tao-card group p-10 rounded-xl text-center cursor-pointer hover:border-amber-600/60 transition-all border border-stone-800 bg-black/40 backdrop-blur-md">
              <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">🧧</div>
              <h3 className="text-3xl font-bold text-amber-500 mb-2">财神殿</h3>
              <p className="text-stone-400 text-sm">测算财运 · 趋吉避凶</p>
              <div className="mt-6 inline-block px-6 py-2 border border-amber-900/50 rounded text-xs text-amber-700 group-hover:bg-amber-900/20 group-hover:text-amber-500 transition-colors">立即起卦</div>
            </div>
            <div className="tao-card p-10 rounded-xl text-center border border-stone-800 bg-black/40 backdrop-blur-md grayscale opacity-50 cursor-not-allowed relative">
              <div className="absolute top-4 right-[-30px] rotate-45 bg-red-900 text-white text-[10px] py-1 px-10 shadow-lg">闭关中</div>
              <div className="text-6xl mb-4">🛡️</div>
              <h3 className="text-3xl font-bold text-stone-500 mb-2">门神殿</h3>
              <p className="text-stone-600 text-sm">安全检测 · 防范盗取</p>
            </div>
          </div>
        )}

        {step === 'input' && (
          <div className="w-full max-w-2xl bg-black/60 backdrop-blur-xl border border-amber-900/30 p-8 rounded-2xl shadow-2xl animate-in slide-in-from-right duration-300">
             <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-amber-500">呈递奏折</h3>
                <p className="text-xs text-stone-500 mt-2">请如实填写，心诚则灵</p>
             </div>
             <div className="space-y-6">
                <div>
                   <label className="text-xs text-amber-700 font-bold block mb-2">所求何事</label>
                   <input type="text" placeholder="如: Ethereum, Meme Coin..." className="w-full bg-stone-900/50 border border-stone-700 p-3 rounded focus:border-amber-600 focus:outline-none text-stone-200" value={project.name} onChange={e => setProject({...project, name: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-xs text-amber-700 font-bold block mb-2">法界</label>
                      <select className="w-full bg-stone-900/50 border border-stone-700 p-3 rounded focus:border-amber-600 focus:outline-none text-stone-200" value={project.type} onChange={e => setProject({...project, type: e.target.value})}>
                         {Object.values(ProjectType).map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                   </div>
                   <div>
                      <label className="text-xs text-amber-700 font-bold block mb-2">吉时</label>
                      <input ref={dateInputRef} type="datetime-local" min={getCurrentDateTime()} className="w-full bg-stone-900/50 border border-stone-700 p-3 rounded focus:border-amber-600 focus:outline-none text-stone-200 text-sm" value={project.transactionTime} onChange={e => setProject({...project, transactionTime: e.target.value})} onClick={(e) => { try { (e.currentTarget as any).showPicker() } catch(e){} }} />
                   </div>
                </div>
                <div>
                   <label className="text-xs text-amber-700 font-bold block mb-2">前世今生 (背景)</label>
                   <textarea placeholder="项目背景详情..." className="w-full bg-stone-900/50 border border-stone-700 p-3 rounded h-24 resize-none focus:border-amber-600 focus:outline-none text-stone-200" value={project.founderInfo} onChange={e => setProject({...project, founderInfo: e.target.value})} />
                </div>
             </div>
             <div className="mt-8 flex gap-4">
                <button onClick={() => setStep('halls')} className="px-6 py-3 rounded border border-stone-700 text-stone-400 hover:text-white">暂缓</button>
                <button onClick={handleCasting} disabled={!isFormValid} className="flex-1 bg-gradient-to-r from-red-900 to-red-800 text-amber-100 font-bold rounded hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                   焚香 · 起卦
                </button>
             </div>
          </div>
        )}

        {step === 'casting' && (
          <div className="text-center animate-in fade-in">
             <div className="scale-125 mb-8 animate-spin-medium"><BaguaAnimation /></div>
             <p className="text-amber-500 font-serif text-xl animate-pulse">天机推演中...</p>
          </div>
        )}

        {step === 'result' && result && (
          <div className="w-full max-w-2xl animate-in zoom-in-95 duration-500 pb-20">
             <div className="bg-stone-950/80 backdrop-blur-xl border border-amber-900/50 p-8 rounded-2xl text-center relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-900 via-amber-500 to-red-900"></div>
                <div className="inline-block px-3 py-1 bg-red-900/20 border border-red-800/50 rounded-full text-[10px] text-red-400 mb-4">财神开示</div>
                <h3 className="text-5xl font-black text-amber-500 mb-4 drop-shadow-md">{result.hexagramName}</h3>
                <p className="text-lg text-stone-300 italic font-serif mb-8">“ {result.summary} ”</p>
                <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6">
                   <div>
                      <div className="text-[10px] text-stone-500 uppercase">发财机缘</div>
                      <div className="text-2xl font-bold text-amber-500">{result.probability}%</div>
                   </div>
                   <div className="border-l border-white/5">
                      <div className="text-[10px] text-stone-500 uppercase">因果评价</div>
                      <div className={`text-2xl font-bold ${result.probability > 50 ? 'text-red-500' : 'text-stone-400'}`}>{result.probability > 50 ? '上吉' : '慎行'}</div>
                   </div>
                </div>
             </div>

             <div className="mt-6 grid gap-4">
                <div className="bg-black/40 border border-stone-800 p-5 rounded-lg">
                   <h4 className="font-bold text-amber-700 mb-2 text-xs">卦象详解</h4>
                   <p className="text-sm text-stone-400 leading-relaxed text-justify">{result.analysis}</p>
                </div>
                <div className="bg-black/40 border-l-2 border-amber-600 p-5 rounded-lg">
                   <h4 className="font-bold text-amber-700 mb-2 text-xs">行动真经</h4>
                   <p className="text-sm text-stone-300 italic">“ {result.advice} ”</p>
                </div>
             </div>

             <div className="mt-8 bg-black/40 border border-amber-900/30 p-8 rounded-xl flex flex-col items-center relative overflow-hidden">
                <h3 className="font-bold text-stone-300 mb-6 tracking-widest border-b border-stone-700 pb-2">功德箱 · 广结善缘</h3>
                <div className="flex gap-2 justify-center mb-6">
                   {['ETH', 'USDT', 'USDC'].map(c => (
                      <button key={c} onClick={() => setDonationCurrency(c as any)} className={`px-4 py-1.5 text-xs font-bold border rounded transition-all ${donationCurrency === c ? 'border-amber-600 bg-amber-900/20 text-amber-500' : 'border-stone-700 text-stone-500 hover:text-stone-300'}`}>{c}</button>
                   ))}
                </div>
                <div className="flex gap-4 max-w-sm w-full mb-6">
                   <input type="number" value={donationAmount} onChange={e => setDonationAmount(e.target.value)} className="w-24 bg-black/50 border border-stone-600 rounded text-center text-amber-500 font-bold focus:border-amber-500 focus:outline-none" />
                   <button onClick={handleDonation} disabled={isPaying} className="flex-1 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white rounded font-bold text-sm transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2">
                      {isPaying ? '正在感应...' : '🪙 投币许愿'}
                   </button>
                </div>
                <div className="mt-2">
                   <MeritBoxSVG />
                </div>
             </div>
             
             <button onClick={() => setStep('halls')} className="w-full py-6 text-xs text-stone-600 hover:text-stone-400 transition-colors">返回前院 · 重新起卦</button>
          </div>
        )}

      </main>
      
      <footer className="w-full text-center py-6 text-[10px] text-stone-700 border-t border-white/5 mt-auto relative z-10">
        <p>大加密寺 | CRYPTO TEMPLE · 链上因果局</p>
      </footer>
    </div>
  );
};

export default App;