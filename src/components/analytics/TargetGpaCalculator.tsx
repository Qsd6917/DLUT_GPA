import React, { useState } from 'react';
import { Target, Calculator } from 'lucide-react';

interface TargetGpaCalculatorProps {
  currentGpa: number;
  currentCredits: number;
}

export const TargetGpaCalculator: React.FC<TargetGpaCalculatorProps> = ({
  currentGpa,
  currentCredits,
}) => {
  const [targetGpa, setTargetGpa] = useState<string>('3.8');
  const [futureCredits, setFutureCredits] = useState<string>('20');
  const [result, setResult] = useState<number | null>(null);

  const calculateRequired = () => {
    const target = parseFloat(targetGpa);
    const future = parseFloat(futureCredits);
    
    if (isNaN(target) || isNaN(future) || future <= 0) return;
    
    // (Current * CurCred + Future * FutCred) / (CurCred + FutCred) = Target
    // Future * FutCred = Target * (CurCred + FutCred) - Current * CurCred
    // Future = (Target * (CurCred + FutCred) - Current * CurCred) / FutCred
    
    const required = (target * (currentCredits + future) - currentGpa * currentCredits) / future;
    setResult(required);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-soft border border-gray-100 transition-all hover:shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
          <Target size={20} />
        </div>
        <h3 className="text-lg font-bold text-gray-800">目标 GPA 计算器</h3>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="target-gpa" className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">目标 GPA</label>
            <input 
              id="target-gpa"
              type="number" 
              step="0.01"
              value={targetGpa}
              onChange={e => setTargetGpa(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>
          <div>
            <label htmlFor="future-credits" className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">剩余学分</label>
            <input 
              id="future-credits"
              type="number" 
              step="0.5"
              value={futureCredits}
              onChange={e => setFutureCredits(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>
        </div>
        
        <button 
          onClick={calculateRequired}
          className="w-full py-2 bg-rose-50 text-rose-600 font-bold rounded-xl hover:bg-rose-100 transition-colors flex items-center justify-center gap-2"
        >
          <Calculator size={16} />
          计算所需成绩
        </button>
        
        {result !== null && (
          <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100 animate-in fade-in slide-in-from-top-2">
            <p className="text-xs text-gray-500 font-medium mb-1 text-center">后续课程平均绩点需达到</p>
            <div className={`text-3xl font-black text-center ${result > 4.0 ? 'text-red-500' : result < 0 ? 'text-gray-400' : 'text-emerald-600'}`}>
              {result > 4.0 ? '> 4.0' : result < 0 ? '已达成' : result.toFixed(3)}
            </div>
            {result > 4.0 && (
              <p className="text-[10px] text-red-400 text-center mt-1 font-bold">目标过高，几乎不可能实现 😱</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
