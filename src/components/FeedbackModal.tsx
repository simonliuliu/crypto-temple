import React, { useState } from 'react';
import type { HistoryRecord } from '../types';

interface FeedbackModalProps {
  record: HistoryRecord;
  onClose: () => void;
  onDonate: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ record, onClose, onDonate }) => {
  const [step, setStep] = useState<'ask' | 'bless'>('ask');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-stone-900 border-2 border-amber-600 rounded-xl p-6 relative shadow-[0_0_50px_rgba(217,119,6,0.3)]">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-500 hover:text-amber-500 transition-colors"
        >
          ✕
        </button>

        {step === 'ask' && (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-amber-900/30 rounded-full flex items-center justify-center mx-auto border border-amber-600/50">
              <span className="text-3xl">🔔</span>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-amber-500 mb-2">因果验证之时</h3>
              <p className="text-stone-400 text-sm">
                施主此前问卜的项目 <span className="text-amber-200 font-bold">【{record.project.name}】</span>
                <br/>
                交易吉时 ({new Date(record.project.transactionTime).toLocaleString()}) 已至。
              </p>
              <div className="my-4 p-4 bg-black/40 rounded border border-amber-900/30">
                <p className="text-xs text-stone-500 mb-1">当时卦象：</p>
                <p className="text-amber-400 font-serif text-lg">{record.result.hexagramName} · {record.result.summary}</p>
              </div>
              <p className="text-white font-bold">敢问施主，此卦灵验否？</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => onDonate()}
                className="py-3 bg-red-700 hover:bg-red-600 text-amber-100 font-bold rounded border border-amber-600 shadow-lg active:scale-95 transition-all"
              >
                灵验！去还愿
              </button>
              <button
                onClick={() => setStep('bless')}
                className="py-3 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold rounded border border-stone-600 active:scale-95 transition-all"
              >
                不准 / 未参与
              </button>
            </div>
          </div>
        )}

        {step === 'bless' && (
          <div className="text-center space-y-6 py-4">
            <div className="text-5xl animate-bounce">🧧</div>
            <div>
              <h3 className="text-2xl font-bold text-amber-500 mb-2">心诚则灵</h3>
              <p className="text-stone-300 leading-relaxed">
                天机难测，市场无常。<br/>
                既无缘，施主不必挂怀。<br/>
                大加密寺祝您：<br/>
                <span className="text-xl text-red-500 font-black mt-2 block gold-glow">
                  下把翻倍，永不踏空！
                </span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 border border-amber-900/50 text-amber-700 hover:text-amber-500 rounded transition-colors"
            >
              谢过财神 (关闭)
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default FeedbackModal;