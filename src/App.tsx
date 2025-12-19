import React, { useState, useEffect, useRef } from 'react';
import BaguaAnimation from './components/BaguaAnimation';
import CoinTossAnimation from './components/CoinTossAnimation';
import FeedbackModal from './components/FeedbackModal'; 
import { ProjectType } from './types';
import type { WalletInfo, ProjectInfo, DivinationResult, HistoryRecord } from './types';
import { getDivination } from './services/openRouterService';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { useDisconnect, useSendTransaction, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { getWalletData } from './services/chainService';
import { parseEther, parseUnits, parseAbi } from 'viem';

// 🛑 收款地址
const TEMPLE_RECEIVER = "0xe5b8988c90ca60d5f2a913cb3bd35a781ae7f242";

// 🪙 代币合约地址
const TOKENS = {
  USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
};

const ERC20_ABI = parseAbi([
  'function transfer(address to, uint256 amount) returns (bool)'
]);

const App: React.FC = () => {
  const [step, setStep] = useState<'welcome' | 'halls' | 'input' | 'casting' | 'result'>('welcome');
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  
  const [project, setProject] = useState<ProjectInfo>({
    name: '',
    type: ProjectType.SECONDARY_MARKET,
    transactionTime: '',
    founderInfo: ''
  });
  
  const [result, setResult] = useState<DivinationResult | null>(null);
  const [loading, setLoading] = useState(false);
  
  // 支付状态
  const [donationAmount, setDonationAmount] = useState<string>('0.01');
  const [donationCurrency, setDonationCurrency] = useState<'ETH' | 'USDT' | 'USDC'>('ETH');
  const [isPaying, setIsPaying] = useState(false);
  const [showCoinAnimation, setShowCoinAnimation] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>(undefined);

  // 🔔 通知与历史记录状态
  const [pendingFeedbackRecord, setPendingFeedbackRecord] = useState<HistoryRecord | null>(null);

  const dateInputRef = useRef<HTMLInputElement>(null);

  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { disconnect } = useDisconnect();
  const { sendTransactionAsync } = useSendTransaction();
  const { writeContractAsync } = useWriteContract();
  const { isSuccess: isTxSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  // 🟢 1. 初始化：进入页面请求通知权限
  useEffect(() => {
    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // 🟢 2. 核心心脏：定时器检查是否“时辰已到”
  useEffect(() => {
    const checkNotifications = () => {
      const savedHistory = localStorage.getItem('temple_history');
      if (!savedHistory) return;

      const history: HistoryRecord[] = JSON.parse(savedHistory);
      const now = Date.now();
      let hasUpdates = false;

      const updatedHistory = history.map(record => {
        // 如果还没通知，且当前时间超过了预设时间
        const triggerTime = new Date(record.project.transactionTime).getTime();
        const isRecent = now - triggerTime < 24 * 60 * 60 * 1000;

        if (!record.isNotified && now >= triggerTime && isRecent) {
          if (Notification.permission === "granted") {
            const n = new Notification("大加密寺 · 验证之时", {
              body: `施主，您关注的项目【${record.project.name}】交易吉时已过，卦象灵验否？`,
              icon: "/vite.svg" 
            });
            n.onclick = () => {
              window.focus();
              setPendingFeedbackRecord(record);
            };
          }
          
          if (!pendingFeedbackRecord) {
             setPendingFeedbackRecord(record);
          }

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


  useEffect(() => {
    if (isTxSuccess) {
      setIsPaying(false);
      setShowCoinAnimation(true);
    }
  }, [isTxSuccess]);

  const getCurrentDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const isFormValid = project.name.trim() !== '' && project.transactionTime !== '';

  const elementMap: Record<string, string> = {
    gold: '金', wood: '木', water: '水', fire: '火', earth: '土'
  };

  useEffect(() => {
    async function fetchChainData() {
      if (isConnected && address && step === 'welcome') {
        setLoading(true);
        try {
          const walletData = await getWalletData(address);
          setWallet(walletData);
          setStep('halls');
        } catch (error) {
          console.error("数据获取失败", error);
        } finally {
          setLoading(false);
        }
      } else if (!isConnected && step !== 'welcome') {
        setWallet(null);
        setStep('welcome');
      }
    }
    fetchChainData();
  }, [isConnected, address, step]);

  const handleCasting = async () => {
    if (!wallet || !isFormValid) return;
    setStep('casting');
    setLoading(true);
    try {
      const divination = await getDivination(wallet, project);
      setResult(divination);
      
      // 🟢 3. 算卦成功后，保存到本地历史记录
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

      setTimeout(() => {
        setStep('result');
        setLoading(false);
      }, 2000);
    } catch (error) {
      console.error(error);
      alert('财神殿感应中断，请检查 API Key');
      setStep('input');
      setLoading(false);
    }
  };

  const handleDonation = async () => {
    if (!amountIsValid(donationAmount)) {
      alert("请输入有效的金额");
      return;
    }

    setIsPaying(true);
    try {
      let hash: `0x${string}`;

      if (donationCurrency === 'ETH') {
        hash = await sendTransactionAsync({
          to: TEMPLE_RECEIVER,
          value: parseEther(donationAmount),
        });
      } else {
        const tokenAddress = TOKENS[donationCurrency] as `0x${string}`;
        const decimals = 6; 
        hash = await writeContractAsync({
          address: tokenAddress,
          abi: ERC20_ABI,
          functionName: 'transfer',
          args: [TEMPLE_RECEIVER, parseUnits(donationAmount, decimals)],
        });
      }
      setTxHash(hash);
    } catch (error) {
      console.error("支付失败:", error);
      alert("施主，支付取消或失败。");
      setIsPaying(false);
    }
  };

  const amountIsValid = (amt: string) => {
    return !isNaN(parseFloat(amt)) && parseFloat(amt) > 0;
  };

  const reset = () => {
    setStep('halls');
    setResult(null);
    setTxHash(undefined);
  };

  const goHome = () => {
    if (wallet) {
      setStep('halls');
    } else {
      setStep('welcome');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-4 md:p-8 relative">
      
      {/* 🟢 4. 反馈弹窗 */}
      {pendingFeedbackRecord && (
        <FeedbackModal 
          record={pendingFeedbackRecord}
          onClose={() => setPendingFeedbackRecord(null)}
          onDonate={() => {
            setProject(pendingFeedbackRecord.project);
            setResult(pendingFeedbackRecord.result);
            setStep('result');
            setPendingFeedbackRecord(null);
          }}
        />
      )}

      {showCoinAnimation && (
        <CoinTossAnimation onComplete={() => {
          setShowCoinAnimation(false);
          alert("功德已入账，愿施主财源广进！");
        }} />
      )}

      {/* Header */}
      <header className="w-full max-w-4xl flex justify-between items-start mb-12 border-b-2 border-red-900 pb-4">
        <div 
          className="flex flex-col cursor-pointer transition-opacity hover:opacity-80 group" 
          onClick={goHome}
          title="返回大殿"
        >
          <h1 className="text-3xl font-black gold-glow tracking-tighter group-hover:text-amber-400 transition-colors">大加密寺</h1>
          <span className="text-xs tracking-[0.3em] opacity-60 uppercase">Crypto Temple</span>
        </div>
        
        <div className="text-right">
          {wallet ? (
            <div className="flex flex-col items-end gap-2">
               <div className="flex items-center gap-2">
                  <div className="px-3 py-1 bg-red-900/30 border border-red-600/50 rounded text-xs text-amber-500 font-mono">
                     {wallet.address.slice(0, 6)}...{wallet.address.slice(-4)}
                  </div>
                  <button onClick={() => open()} className="text-[10px] text-stone-500 hover:text-amber-500 transition-colors">设置</button>
               </div>
               
               <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-amber-200/60 bg-black/40 p-2 rounded border border-amber-900/30">
                  <div className="text-right">
                    <span className="opacity-50 mr-1">道行:</span> 
                    <span className="text-amber-400 font-bold">{wallet.walletAge}</span>
                  </div>
                  <div className="text-right">
                    <span className="opacity-50 mr-1">业力:</span> 
                    <span className="text-amber-400 font-bold">{wallet.transactionCount}次</span>
                  </div>
                  <div className="col-span-2 text-right border-t border-white/5 pt-1 mt-1">
                    <span className="opacity-50 mr-1">降世:</span> 
                    <span className="italic">{wallet.cyberBazi}</span>
                  </div>
               </div>
            </div>
          ) : (
            <span className="text-xs italic opacity-40">未入寺庙门</span>
          )}
        </div>
      </header>

      <main className="w-full max-w-2xl flex flex-col items-center">
        {step === 'welcome' && (
          <div className="text-center space-y-12">
            <div className="relative">
              <BaguaAnimation />
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 smoke" style={{left: '45%'}}></div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 smoke" style={{left: '55%', animationDelay: '1.5s'}}></div>
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-red-600 gold-glow">众生皆苦，唯有暴富</h2>
              <p className="text-amber-200/60 leading-relaxed">
                欢迎来到大加密寺。这里不信技术分析，只看命里注定。<br/>
                感应链上因果，求得投资真经。
              </p>
            </div>
            <button
              onClick={() => open()}
              disabled={loading}
              className="group relative px-12 py-4 bg-red-700 text-amber-200 font-bold rounded-sm border-2 border-amber-600 transition-all hover:bg-red-600 active:scale-95 overflow-hidden disabled:opacity-50"
            >
              <span className="relative z-10">
                {loading ? '正在读取先天命数...' : (isConnected ? '进入寺庙' : '敲开寺门 (链接钱包)')}
              </span>
            </button>
          </div>
        )}

        {step === 'halls' && (
          <div className="w-full grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div onClick={() => setStep('input')} className="cursor-pointer group bg-stone-900/80 border-2 border-amber-600 p-8 rounded-xl text-center hover:bg-amber-600/10 transition-all flex flex-col items-center gap-4">
              <div className="text-5xl">🧧</div>
              <h3 className="text-2xl font-bold">财神殿</h3>
              <p className="text-xs opacity-60 italic">测算财运命理，求取致富先机</p>
              <span className="mt-4 text-xs bg-amber-600 text-black px-4 py-1 rounded-full font-bold">立即进入</span>
            </div>
            <div className="relative group bg-stone-900/30 border-2 border-stone-800 p-8 rounded-xl text-center flex flex-col items-center gap-4 grayscale">
              <div className="absolute inset-0 bg-black/60 z-10 flex items-center justify-center rounded-xl">
                <span className="bg-red-900 text-white px-3 py-1 text-xs rounded border border-red-500">门神闭关中</span>
              </div>
              <div className="text-5xl">🛡️</div>
              <h3 className="text-2xl font-bold">门神殿</h3>
              <p className="text-xs opacity-60 italic">测算钱包安全，防范盗取风险</p>
            </div>
            <div className="md:col-span-2 flex justify-center mt-8">
               <button onClick={() => disconnect()} className="text-xs text-red-900 hover:text-red-700 opacity-50 hover:opacity-100">退出寺庙</button>
            </div>
          </div>
        )}

        {/* 省略部分：Input/Casting/Result 等界面代码不需要改动，它们已经被包含在上面整段替换里了 */}
        {/* 为了篇幅，App.tsx 的后半部分（Input, Result 等）和之前完全一样，直接全选替换即可 */}
        
        {step === 'input' && (
          <div className="w-full space-y-6 bg-red-950/20 p-8 rounded-2xl border-2 border-red-900 shadow-xl animate-in zoom-in-95 duration-300">
            <h3 className="text-2xl font-black text-center border-b border-red-900 pb-4 mb-8">向财神求一卦</h3>
            <div className="grid gap-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-xs font-bold uppercase tracking-widest text-amber-600">欲投因果点名称</label>
                  <span className="text-[10px] text-red-500 font-bold">* 必填</span>
                </div>
                <input 
                  type="text" 
                  placeholder="如: Ethereum, Meme Coin..." 
                  className="w-full bg-black/60 border-b-2 border-red-900 p-3 rounded-t focus:outline-none focus:border-amber-500 focus:bg-red-950/30 transition-all" 
                  value={project.name} 
                  onChange={e => setProject({ ...project, name: e.target.value })} 
                />
              </div>

              <div className="space-y-2">
                 <div className="flex justify-between">
                  <label className="text-xs font-bold uppercase tracking-widest text-amber-600">因果法界</label>
                  <span className="text-[10px] text-red-500 font-bold">* 必填</span>
                </div>
                <select 
                  className="w-full bg-black/60 border-b-2 border-red-900 p-3 rounded-t focus:outline-none focus:border-amber-500" 
                  value={project.type} 
                  onChange={e => setProject({ ...project, type: e.target.value })}
                >
                  {Object.values(ProjectType).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-xs font-bold uppercase tracking-widest text-amber-600">预计交易吉时</label>
                  <span className="text-[10px] text-red-500 font-bold">* 必填 (仅限未来)</span>
                </div>
                <input 
                  ref={dateInputRef}
                  type="datetime-local" 
                  min={getCurrentDateTime()} 
                  className="w-full bg-black/60 border-b-2 border-red-900 p-3 rounded-t focus:outline-none focus:border-amber-500 text-amber-500/80 scheme-dark cursor-pointer" 
                  value={project.transactionTime} 
                  onChange={e => setProject({ ...project, transactionTime: e.target.value })}
                  onClick={(e) => {
                    if ('showPicker' in e.currentTarget) {
                      try { (e.currentTarget as any).showPicker(); } catch(e) {}
                    }
                  }}
                  onKeyDown={(e) => e.preventDefault()}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-amber-600">幕后推手与背景</label>
                <textarea 
                  placeholder="提供项目详细信息，如创始人姓名，生成八字，项目愿景等..." 
                  className="w-full bg-black/60 border-b-2 border-red-900 p-3 rounded-t h-24 focus:outline-none focus:border-amber-500 resize-none" 
                  value={project.founderInfo} 
                  onChange={e => setProject({ ...project, founderInfo: e.target.value })} 
                />
              </div>
            </div>

            <div className="pt-6">
              <button 
                onClick={handleCasting}
                disabled={!isFormValid}
                className={`w-full py-5 font-black rounded-lg border-2 shadow-lg transition-all flex items-center justify-center gap-2
                  ${isFormValid 
                    ? 'bg-red-700 hover:bg-red-600 text-amber-200 border-amber-600 shadow-red-950 cursor-pointer active:scale-95' 
                    : 'bg-stone-900 text-stone-600 border-stone-800 cursor-not-allowed grayscale'
                  }`}
              >
                <span>{isFormValid ? '焚香 · 起卦' : '请先补全因果信息'}</span>
                {isFormValid && <span className="text-xl">🔥</span>}
              </button>
              <button onClick={() => setStep('halls')} className="w-full mt-4 text-xs opacity-40 hover:opacity-100">返回前院</button>
            </div>
          </div>
        )}

        {step === 'casting' && (
          <div className="text-center space-y-12">
            <BaguaAnimation />
            <div className="space-y-4">
              <p className="text-2xl font-serif italic text-amber-500 gold-glow">财神正在推演五行生克...</p>
              <p className="text-sm opacity-50">正在根据您的先天八字校对项目气运</p>
            </div>
          </div>
        )}

        {step === 'result' && result && (
          <div className="w-full space-y-8 animate-in fade-in zoom-in-95 duration-1000">
            <div className="bg-red-950/40 p-8 rounded-3xl border-4 border-double border-amber-600 relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-800 px-6 py-1 border-2 border-amber-600 text-sm font-bold">财神殿开示</div>
              <div className="text-center space-y-6">
                <div className="flex flex-col items-center">
                  <span className="text-xs uppercase tracking-widest opacity-60 mb-2">得卦</span>
                  <h3 className="text-5xl font-black gold-glow">{result.hexagramName}</h3>
                </div>
                <div className="py-4 border-y border-amber-900/50">
                   <p className="text-xl font-serif italic text-amber-200">“{result.summary}”</p>
                </div>
                <div className="flex justify-around items-center pt-4">
                  <div className="text-center"><div className="text-3xl font-bold text-amber-500">{result.probability}%</div><div className="text-[10px] opacity-50 uppercase">发财机缘</div></div>
                  <div className="h-12 w-px bg-amber-900"></div>
                  <div className="text-center"><div className="text-3xl font-bold text-red-500">{result.probability > 50 ? '吉' : '慎'}</div><div className="text-[10px] opacity-50 uppercase">因果评价</div></div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-stone-900/90 p-6 rounded-xl border border-amber-900/30">
                <h4 className="flex items-center gap-2 font-bold text-amber-600 mb-3 uppercase tracking-tighter"><span className="w-2 h-2 bg-red-600 rounded-full"></span> 财神分析</h4>
                <p className="text-sm leading-relaxed text-amber-100/80">{result.analysis}</p>
              </div>
              <div className="bg-stone-900/90 p-6 rounded-xl border border-amber-900/30">
                <h4 className="flex items-center gap-2 font-bold text-amber-600 mb-3 uppercase tracking-tighter"><span className="w-2 h-2 bg-red-600 rounded-full"></span> 行动真经</h4>
                <p className="text-sm leading-relaxed text-amber-100/80 italic">“{result.advice}”</p>
              </div>
            </div>
            
            <div className="bg-black/50 p-6 rounded-xl border border-amber-900/20">
              <h4 className="text-center text-xs opacity-50 mb-6 font-bold tracking-widest text-amber-500">本卦五行能量场</h4>
              <div className="flex justify-around items-end h-32 px-4">
                {Object.entries(result.fiveElements).map(([key, val]) => (
                  <div key={key} className="flex flex-col items-center gap-2 w-full max-w-[40px] h-full justify-end group">
                    <div 
                      className="w-full bg-red-800 rounded-t-sm transition-all duration-1000 group-hover:bg-amber-600 border-x border-t border-amber-600/30 shadow-[0_0_10px_rgba(139,0,0,0.5)]" 
                      style={{ height: `${val}%` }}
                    ></div>
                    <span className="text-[10px] font-bold text-amber-500">
                      {elementMap[key] || key}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-amber-600/5 p-8 rounded-2xl border border-amber-600/20 text-center space-y-6">
               <h3 className="font-bold text-amber-600 text-xl">🙏 功德箱 · 随缘打赏</h3>
               <p className="text-xs text-amber-200/50">向许愿池投币，为您的钱包积累链上福报</p>
               
               <div className="flex flex-col gap-4 max-w-xs mx-auto">
                 <div className="flex gap-2 justify-center">
                    {(['ETH', 'USDT', 'USDC'] as const).map(curr => (
                      <button 
                        key={curr}
                        onClick={() => setDonationCurrency(curr)}
                        className={`px-4 py-2 text-sm font-bold border rounded transition-all ${
                          donationCurrency === curr 
                          ? 'bg-amber-600 text-black border-amber-600 shadow-[0_0_10px_rgba(217,119,6,0.5)]' 
                          : 'bg-black/40 text-amber-600 border-amber-900/50 hover:border-amber-600'
                        }`}
                      >
                        {curr}
                      </button>
                    ))}
                 </div>

                 <div className="relative">
                   <input 
                      type="number"
                      step="0.01"
                      value={donationAmount}
                      onChange={(e) => setDonationAmount(e.target.value)}
                      className="w-full bg-black/60 border border-amber-900 p-3 text-center text-xl font-bold text-amber-500 rounded focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                   />
                   <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-700">{donationCurrency}</span>
                 </div>

                 <button 
                   onClick={handleDonation}
                   disabled={isPaying || !isConnected}
                   className={`w-full py-3 rounded font-bold text-amber-950 transition-all active:scale-95 flex justify-center items-center gap-2
                     ${isPaying 
                        ? 'bg-stone-600 cursor-wait' 
                        : 'bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 shadow-lg shadow-amber-900/50'
                     }`}
                 >
                   {isPaying ? (
                     <>
                       <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                       <span>正在感应链上...</span>
                     </>
                   ) : (
                     <>
                       <span>🪙 投币许愿</span>
                     </>
                   )}
                 </button>
                 
                 {!isConnected && <p className="text-[10px] text-red-500">请先连接钱包</p>}
               </div>
            </div>

            <button onClick={reset} className="w-full py-4 border-2 border-red-900 rounded-xl hover:bg-red-900/20 transition-all font-bold text-red-700">返回前院 · 重新起卦</button>
          </div>
        )}
      </main>
      <footer className="mt-20 text-[10px] opacity-20 text-center pb-12">
        <p>大加密寺 | CRYPTO TEMPLE · 链上因果局</p>
      </footer>
    </div>
  );
};

export default App;