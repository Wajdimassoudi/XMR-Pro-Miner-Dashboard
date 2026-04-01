/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Cpu, 
  Wallet, 
  Activity, 
  TrendingUp, 
  Zap, 
  Terminal, 
  ShieldCheck, 
  Settings, 
  Play, 
  Square,
  RefreshCw,
  AlertCircle,
  Globe,
  Coins
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { cn } from './lib/utils';

// Types
interface MiningLog {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

interface HashRateData {
  time: string;
  rate: number;
}

export default function App() {
  const [wallet, setWallet] = useState('');
  const [isMining, setIsMining] = useState(false);
  const [hashrate, setHashrate] = useState(0);
  const [totalHashes, setTotalHashes] = useState(0);
  const [earnings, setEarnings] = useState(0);
  const [logs, setLogs] = useState<MiningLog[]>([]);
  const [hashHistory, setHashHistory] = useState<HashRateData[]>([]);
  const [aiTips, setAiTips] = useState<string[]>([]);
  const [marketData, setMarketData] = useState<any>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const logEndRef = useRef<HTMLDivElement>(null);

  // Initialize Gemini
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

  // Simulate Mining
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isMining) {
      interval = setInterval(() => {
        const newRate = Math.floor(Math.random() * 500) + 1200; // 1200-1700 H/s
        setHashrate(newRate);
        setTotalHashes(prev => prev + newRate);
        setEarnings(prev => prev + (newRate * 0.000000001)); // Simulated earnings

        const now = new Date();
        const timeStr = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
        
        setHashHistory(prev => {
          const newData = [...prev, { time: timeStr, rate: newRate }];
          return newData.slice(-20); // Keep last 20 points
        });

        // Random logs
        if (Math.random() > 0.8) {
          addLog(`Accepted share # ${Math.floor(Math.random() * 1000)} from pool.supportxmr.com`, 'success');
        }
      }, 2000);
    } else {
      setHashrate(0);
    }
    return () => clearInterval(interval);
  }, [isMining]);

  const addLog = (message: string, type: MiningLog['type'] = 'info') => {
    const newLog: MiningLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      message,
      type
    };
    setLogs(prev => [...prev, newLog].slice(-50));
  };

  const startMining = () => {
    if (!wallet || wallet.length < 10) {
      addLog('Invalid wallet address. Please enter a valid XMR address.', 'error');
      return;
    }
    setIsMining(true);
    addLog(`Starting mining process for wallet: ${wallet.slice(0, 8)}...${wallet.slice(-8)}`, 'info');
    addLog('Connecting to SupportXMR pool...', 'info');
    addLog('CPU: Intel(R) Core(TM) i9-10900K @ 3.70GHz (10 cores)', 'info');
    addLog('Memory: 32GB DDR4 3200MHz', 'info');
    fetchAiOptimization();
  };

  const [showReport, setShowReport] = useState(false);
  const [miningReport, setMiningReport] = useState('');

  const stopMining = async () => {
    setIsMining(false);
    addLog('Mining process stopped by user.', 'warning');
    generateMiningReport();
  };

  const generateMiningReport = async () => {
    setIsLoadingAi(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Generate a professional mining session report for a Monero miner. 
        Stats: Total Hashes: ${totalHashes}, Estimated Earnings: ${earnings} XMR. 
        Include a technical summary and future projections.`,
      });
      setMiningReport(response.text || 'Report generation failed.');
      setShowReport(true);
    } catch (error) {
      console.error("Report Error:", error);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const fetchAiOptimization = async () => {
    setIsLoadingAi(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: "Give me 3 professional, technical tips for optimizing Monero (XMR) mining on a high-end CPU. Keep them concise and professional.",
      });
      const tips = response.text?.split('\n').filter(t => t.trim().length > 0).slice(0, 3) || [];
      setAiTips(tips);
    } catch (error) {
      console.error("AI Error:", error);
      setAiTips(["Ensure Huge Pages are enabled in OS settings.", "Optimize thread count based on L3 cache size.", "Monitor VRM temperatures for stability."]);
    } finally {
      setIsLoadingAi(false);
    }
  };

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawStatus, setWithdrawStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  const handleWithdraw = () => {
    if (earnings < 0.1) {
      addLog('Withdrawal failed: Minimum payout threshold (0.1 XMR) not reached.', 'error');
      return;
    }
    setShowWithdrawModal(true);
  };

  const processWithdrawal = async () => {
    setWithdrawStatus('processing');
    addLog('Initiating secure withdrawal protocol...', 'info');
    
    // Simulate network delay
    setTimeout(() => {
      setWithdrawStatus('success');
      addLog(`Withdrawal of ${earnings.toFixed(8)} XMR successful. Transaction Hash: 0x${Math.random().toString(16).slice(2, 18)}...`, 'success');
      setEarnings(0);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#E4E4E7] font-sans selection:bg-orange-500/30">
      {/* Header */}
      <header className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Cpu className="text-black w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">XMR PRO <span className="text-orange-500">MINER</span></h1>
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-medium">Enterprise Grade Dashboard</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-4 text-xs font-medium text-white/60">
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span>Global Hash: 2.84 GH/s</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-orange-400" />
                <span>XMR: $148.24</span>
              </div>
            </div>
            <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <Settings className="w-5 h-5 text-white/40" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-4 space-y-6">
          {/* Wallet Input */}
          <section className="bg-[#151518] border border-white/5 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <Wallet className="w-4 h-4 text-orange-500" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-white/70">Wallet Configuration</h2>
            </div>
            <div className="space-y-4">
              <div className="relative">
                <input 
                  type="text" 
                  value={wallet}
                  onChange={(e) => setWallet(e.target.value)}
                  placeholder="Enter XMR Address..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-orange-500/50 transition-all font-mono"
                  disabled={isMining}
                />
                <ShieldCheck className="absolute right-4 top-3.5 w-4 h-4 text-white/20" />
              </div>
              <button 
                onClick={isMining ? stopMining : startMining}
                className={cn(
                  "w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                  isMining 
                    ? "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20" 
                    : "bg-orange-500 text-black hover:bg-orange-400 shadow-lg shadow-orange-500/20"
                )}
              >
                {isMining ? (
                  <>
                    <Square className="w-4 h-4 fill-current" />
                    Stop Mining
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    Start Mining
                  </>
                )}
              </button>
            </div>
          </section>
          
          {/* Withdrawal Section */}
          <section className="bg-[#151518] border border-white/5 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-green-500" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-white/70">Payouts</h2>
              </div>
              <span className="text-[10px] font-bold text-white/30 uppercase">Min: 0.1 XMR</span>
            </div>
            
            <div className="bg-black/40 rounded-xl p-4 border border-white/5 mb-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Available Balance</p>
                  <p className="text-xl font-bold text-white">{earnings.toFixed(8)} <span className="text-orange-500 text-xs">XMR</span></p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Progress</p>
                  <p className="text-xs font-bold text-green-500">{Math.min((earnings / 0.1) * 100, 100).toFixed(1)}%</p>
                </div>
              </div>
              <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-green-500"
                  animate={{ width: `${Math.min((earnings / 0.1) * 100, 100)}%` }}
                />
              </div>
            </div>

            <button 
              onClick={handleWithdraw}
              disabled={earnings < 0.1 || isMining}
              className={cn(
                "w-full py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all border",
                earnings >= 0.1 && !isMining
                  ? "bg-green-500 text-black border-green-400 hover:bg-green-400"
                  : "bg-white/5 text-white/20 border-white/5 cursor-not-allowed"
              )}
            >
              Withdraw Funds
            </button>
            {isMining && <p className="text-[9px] text-center mt-2 text-orange-500/60 italic">Stop mining to enable withdrawal</p>}
          </section>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#151518] border border-white/5 rounded-2xl p-5">
              <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Hashrate</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white tracking-tighter">{hashrate}</span>
                <span className="text-[10px] text-white/40 font-bold">H/s</span>
              </div>
              <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-orange-500"
                  animate={{ width: isMining ? `${(hashrate/2000)*100}%` : '0%' }}
                />
              </div>
            </div>
            <div className="bg-[#151518] border border-white/5 rounded-2xl p-5">
              <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Total Hashes</p>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white tracking-tighter">{(totalHashes / 1000).toFixed(1)}</span>
                <span className="text-[10px] text-white/40 font-bold">KH</span>
              </div>
              <p className="text-[10px] text-green-500 mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +12.4% efficiency
              </p>
            </div>
            <div className="bg-[#151518] border border-white/5 rounded-2xl p-5 col-span-2">
              <div className="flex justify-between items-center mb-1">
                <p className="text-[10px] text-white/40 uppercase font-bold">Estimated Earnings</p>
                <Zap className="w-3 h-3 text-yellow-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white tracking-tighter">{earnings.toFixed(8)}</span>
                <span className="text-sm text-orange-500 font-bold">XMR</span>
              </div>
              <p className="text-[10px] text-white/20 mt-1 font-mono">≈ ${(earnings * 148).toFixed(4)} USD</p>
            </div>
          </div>

          {/* AI Optimization */}
          <section className="bg-orange-500/5 border border-orange-500/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-orange-500" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-orange-500/80">AI Optimization</h2>
              </div>
              <button 
                onClick={fetchAiOptimization}
                disabled={isLoadingAi}
                className="p-1.5 hover:bg-orange-500/10 rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={cn("w-4 h-4 text-orange-500/40", isLoadingAi && "animate-spin")} />
              </button>
            </div>
            <div className="space-y-3">
              {aiTips.length > 0 ? aiTips.map((tip, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={i} 
                  className="flex gap-3 text-xs text-white/70 leading-relaxed"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                  <p>{tip}</p>
                </motion.div>
              )) : (
                <p className="text-xs text-white/30 italic">Start mining to receive AI-driven optimization tips...</p>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Charts & Logs */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main Chart */}
          <section className="bg-[#151518] border border-white/5 rounded-2xl p-6 h-[400px] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-[0.02] pointer-events-none">
              <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            </div>
            
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wider text-white/70">Hashrate Performance</h2>
                <p className="text-[10px] text-white/30 font-mono">Real-time telemetry from SupportXMR Pool</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Live</span>
                </div>
              </div>
            </div>

            <div className="h-[280px] w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hashHistory}>
                  <defs>
                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F97316" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#F97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis 
                    dataKey="time" 
                    stroke="#ffffff20" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#ffffff20" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    domain={[1000, 2000]}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#151518', border: '1px solid #ffffff10', borderRadius: '12px', fontSize: '12px' }}
                    itemStyle={{ color: '#F97316' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="rate" 
                    stroke="#F97316" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorRate)" 
                    animationDuration={1000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Console / Logs */}
          <section className="bg-black border border-white/5 rounded-2xl overflow-hidden flex flex-col h-[300px]">
            <div className="bg-[#151518] px-4 py-2 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-white/40" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">System Console</span>
              </div>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-white/10" />
                <div className="w-2 h-2 rounded-full bg-white/10" />
                <div className="w-2 h-2 rounded-full bg-white/10" />
              </div>
            </div>
            <div className="p-4 font-mono text-[11px] overflow-y-auto flex-1 space-y-1 custom-scrollbar">
              {logs.length === 0 && (
                <p className="text-white/20 italic">System idle. Waiting for initialization...</p>
              )}
              {logs.map((log) => (
                <div key={log.id} className="flex gap-3">
                  <span className="text-white/20 shrink-0">[{log.timestamp}]</span>
                  <span className={cn(
                    "font-medium",
                    log.type === 'info' && "text-blue-400",
                    log.type === 'success' && "text-green-400",
                    log.type === 'warning' && "text-yellow-400",
                    log.type === 'error' && "text-red-400"
                  )}>
                    {log.type.toUpperCase()}: {log.message}
                  </span>
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          </section>

          {/* Market Insights Footer */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#151518] border border-white/5 rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-[10px] text-white/40 uppercase font-bold">Network Diff</p>
                <p className="text-sm font-bold">342.18 G</p>
              </div>
            </div>
            <div className="bg-[#151518] border border-white/5 rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <p className="text-[10px] text-white/40 uppercase font-bold">Block Reward</p>
                <p className="text-sm font-bold">0.6 XMR</p>
              </div>
            </div>
            <div className="bg-[#151518] border border-white/5 rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-[10px] text-white/40 uppercase font-bold">Node Status</p>
                <p className="text-sm font-bold text-green-500">Synchronized</p>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-white/5 mt-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 opacity-40">
            <Cpu className="w-4 h-4" />
            <span className="text-[10px] font-bold uppercase tracking-widest">XMR PRO MINER v4.2.0-STABLE</span>
          </div>
          <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-white/30">
            <a href="#" className="hover:text-orange-500 transition-colors">Documentation</a>
            <a href="#" className="hover:text-orange-500 transition-colors">Pool Stats</a>
            <a href="#" className="hover:text-orange-500 transition-colors">API Reference</a>
            <a href="#" className="hover:text-orange-500 transition-colors">Privacy Policy</a>
          </div>
        </div>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>

      {/* Withdrawal Modal */}
      <AnimatePresence>
        {showWithdrawModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-[#151518] border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <RefreshCw className={cn("w-8 h-8 text-green-500", withdrawStatus === 'processing' && "animate-spin")} />
              </div>
              
              <h2 className="text-2xl font-bold mb-2">
                {withdrawStatus === 'idle' && "Confirm Withdrawal"}
                {withdrawStatus === 'processing' && "Processing..."}
                {withdrawStatus === 'success' && "Success!"}
              </h2>
              
              <p className="text-sm text-white/50 mb-8">
                {withdrawStatus === 'idle' && `You are about to withdraw ${earnings.toFixed(8)} XMR to your configured wallet address.`}
                {withdrawStatus === 'processing' && "Verifying transaction on the Monero blockchain. Please wait..."}
                {withdrawStatus === 'success' && "Funds have been dispatched. Check your wallet in a few minutes."}
              </p>

              <div className="space-y-3">
                {withdrawStatus === 'idle' && (
                  <>
                    <button 
                      onClick={processWithdrawal}
                      className="w-full py-4 bg-green-500 text-black rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-green-400 transition-all"
                    >
                      Confirm & Send
                    </button>
                    <button 
                      onClick={() => setShowWithdrawModal(false)}
                      className="w-full py-4 bg-white/5 text-white/60 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-white/10 transition-all"
                    >
                      Cancel
                    </button>
                  </>
                )}
                {withdrawStatus === 'success' && (
                  <button 
                    onClick={() => {
                      setShowWithdrawModal(false);
                      setWithdrawStatus('idle');
                    }}
                    className="w-full py-4 bg-white text-black rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-white/90 transition-all"
                  >
                    Back to Dashboard
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mining Report Modal */}
      <AnimatePresence>
        {showReport && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#151518] border border-white/10 rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-green-500" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">Session Performance Report</h2>
                </div>
                <button onClick={() => setShowReport(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                  <Square className="w-4 h-4 text-white/40" />
                </button>
              </div>
              
              <div className="prose prose-invert prose-sm max-w-none text-white/70 leading-relaxed space-y-4">
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
                    <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Total Work</p>
                    <p className="text-xl font-bold text-white">{(totalHashes / 1000).toFixed(2)} KH</p>
                  </div>
                  <div className="bg-black/40 rounded-2xl p-4 border border-white/5">
                    <p className="text-[10px] text-white/40 uppercase font-bold mb-1">Net Earnings</p>
                    <p className="text-xl font-bold text-orange-500">{earnings.toFixed(8)} XMR</p>
                  </div>
                </div>
                <div className="bg-orange-500/5 border border-orange-500/10 rounded-2xl p-6 font-mono text-xs whitespace-pre-wrap">
                  {miningReport}
                </div>
              </div>
              
              <button 
                onClick={() => setShowReport(false)}
                className="w-full mt-8 py-4 bg-white text-black rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-white/90 transition-all"
              >
                Close Report
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
