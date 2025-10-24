const CryptoBackground = () => {
  const exchangePairs = [
    { from: 'BTC', to: 'USDT', x: 15, y: 15, color: 'emerald' },
    { from: 'ETH', to: 'USDT', x: 65, y: 25, color: 'cyan' },
    { from: 'BNB', to: 'USDT', x: 25, y: 65, color: 'violet' },
    { from: 'USDT', to: 'RUB', x: 75, y: 75, color: 'teal' },
  ];

  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Cyberpunk grid */}
      <div className="absolute inset-0 cyber-grid opacity-20"></div>
      
      {/* Neon glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-transparent rounded-full blur-3xl animate-neon-pulse"></div>
      <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-gradient-to-l from-violet-500/25 via-purple-500/15 to-transparent rounded-full blur-3xl animate-neon-pulse-delayed"></div>
      
      {/* Holographic scanlines */}
      <div className="absolute inset-0 scanlines opacity-[0.03]"></div>
      
      {/* Exchange nodes with neon effect */}
      {exchangePairs.map((pair, idx) => (
        <div
          key={idx}
          className="absolute animate-hologram-appear"
          style={{
            left: `${pair.x}%`,
            top: `${pair.y}%`,
            animationDelay: `${idx * 0.3}s`,
          }}
        >
          <div className="flex items-center gap-6">
            {/* From crypto - 3D hologram effect */}
            <div className="relative group">
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br from-${pair.color}-500/20 to-${pair.color}-600/10 backdrop-blur-md flex items-center justify-center border-2 border-${pair.color}-400/40 shadow-neon-${pair.color} animate-rotate-3d`}>
                <span className={`text-sm font-black text-${pair.color}-300 drop-shadow-neon tracking-wider`}>{pair.from}</span>
              </div>
              {/* Multi-layer glow rings */}
              <div className={`absolute inset-0 rounded-full bg-${pair.color}-500/30 animate-ping-neon`}></div>
              <div className={`absolute inset-0 rounded-full border-2 border-${pair.color}-400/60 animate-spin-slow`}></div>
              <div className={`absolute -inset-2 rounded-full border border-${pair.color}-400/20 animate-pulse-ring`}></div>
            </div>
            
            {/* Futuristic exchange arrow with data stream */}
            <div className="relative w-24 h-12">
              <svg width="96" height="48" viewBox="0 0 96 48" className="absolute inset-0">
                <defs>
                  <linearGradient id={`neon-gradient-${idx}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
                    <stop offset="30%" stopColor="#06b6d4" stopOpacity="0.8" />
                    <stop offset="70%" stopColor="#8b5cf6" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
                  </linearGradient>
                  <filter id={`glow-${idx}`}>
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                {/* Main arrow line */}
                <path 
                  d="M 0,24 L 70,24 L 65,20 M 70,24 L 65,28" 
                  stroke={`url(#neon-gradient-${idx})`} 
                  strokeWidth="3" 
                  fill="none"
                  filter={`url(#glow-${idx})`}
                  className="animate-dash-flow"
                  strokeDasharray="10 5"
                />
                {/* Secondary pulse line */}
                <path 
                  d="M 0,24 L 70,24" 
                  stroke="#06b6d4" 
                  strokeWidth="1" 
                  fill="none"
                  className="animate-energy-pulse"
                  strokeOpacity="0.5"
                />
              </svg>
              
              {/* Data particles */}
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 -translate-y-1/2 left-0"
                  style={{ animationDelay: `${i * 0.4}s` }}
                >
                  <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-neon-cyan animate-particle-stream"></div>
                </div>
              ))}
              
              {/* Digital code effect */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 text-[8px] text-emerald-400/40 font-mono animate-blink-code">
                {Math.random().toString(16).substring(2, 8)}
              </div>
            </div>
            
            {/* To crypto - 3D hologram effect */}
            <div className="relative group">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500/20 to-cyan-600/10 backdrop-blur-md flex items-center justify-center border-2 border-teal-400/40 shadow-neon-teal animate-rotate-3d" style={{ animationDelay: '0.5s' }}>
                <span className="text-sm font-black text-teal-300 drop-shadow-neon tracking-wider">{pair.to}</span>
              </div>
              <div className="absolute inset-0 rounded-full bg-teal-500/30 animate-ping-neon" style={{ animationDelay: '1s' }}></div>
              <div className="absolute inset-0 rounded-full border-2 border-teal-400/60 animate-spin-slow" style={{ animationDirection: 'reverse' }}></div>
              <div className="absolute -inset-2 rounded-full border border-teal-400/20 animate-pulse-ring" style={{ animationDelay: '0.5s' }}></div>
            </div>
          </div>
        </div>
      ))}

      {/* Floating hexagonal blockchain blocks */}
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-blockchain-float"
          style={{
            left: `${5 + i * 8}%`,
            top: '110%',
            animationDelay: `${i * 1.2}s`,
            animationDuration: `${25 + Math.random() * 15}s`,
          }}
        >
          <div className="relative">
            <svg width="32" height="36" viewBox="0 0 32 36" className="animate-hex-spin">
              <defs>
                <linearGradient id={`hex-gradient-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.6" />
                </linearGradient>
              </defs>
              <polygon 
                points="16,2 30,10 30,26 16,34 2,26 2,10" 
                fill="none" 
                stroke={`url(#hex-gradient-${i})`} 
                strokeWidth="2"
                className="drop-shadow-neon"
              />
            </svg>
            {/* Inner glow */}
            <div className="absolute inset-0 bg-cyan-400/10 blur-md"></div>
          </div>
        </div>
      ))}

      {/* Digital rain effect */}
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute top-0 w-px animate-digital-rain opacity-30"
          style={{
            left: `${i * 7}%`,
            height: '2px',
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 2}s`,
          }}
        >
          <div className="w-full h-12 bg-gradient-to-b from-transparent via-emerald-400 to-transparent"></div>
        </div>
      ))}

      <style>{`
        .cyber-grid {
          background-image: 
            linear-gradient(rgba(16, 185, 129, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16, 185, 129, 0.1) 1px, transparent 1px);
          background-size: 40px 40px;
          transform: perspective(500px) rotateX(60deg);
          transform-origin: center bottom;
        }
        
        .scanlines {
          background: linear-gradient(
            to bottom,
            transparent 50%,
            rgba(16, 185, 129, 0.05) 50%
          );
          background-size: 100% 4px;
          animation: scan 8s linear infinite;
        }
        
        .shadow-neon-emerald { box-shadow: 0 0 20px rgba(16, 185, 129, 0.5), 0 0 40px rgba(16, 185, 129, 0.3); }
        .shadow-neon-cyan { box-shadow: 0 0 20px rgba(6, 182, 212, 0.5), 0 0 40px rgba(6, 182, 212, 0.3); }
        .shadow-neon-violet { box-shadow: 0 0 20px rgba(139, 92, 246, 0.5), 0 0 40px rgba(139, 92, 246, 0.3); }
        .shadow-neon-teal { box-shadow: 0 0 20px rgba(20, 184, 166, 0.5), 0 0 40px rgba(20, 184, 166, 0.3); }
        
        .drop-shadow-neon {
          filter: drop-shadow(0 0 8px currentColor) drop-shadow(0 0 15px currentColor);
        }
        
        @keyframes neon-pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
        
        @keyframes neon-pulse-delayed {
          0%, 100% { opacity: 0.3; transform: scale(1) rotate(0deg); }
          50% { opacity: 0.6; transform: scale(1.15) rotate(180deg); }
        }
        
        @keyframes hologram-appear {
          0% { opacity: 0; transform: translateY(20px) scale(0.8); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        
        @keyframes rotate-3d {
          0%, 100% { transform: rotateY(0deg) rotateZ(0deg); }
          50% { transform: rotateY(180deg) rotateZ(5deg); }
        }
        
        @keyframes ping-neon {
          0% { transform: scale(1); opacity: 0.6; }
          50% { opacity: 0.3; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse-ring {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.2); opacity: 0.1; }
        }
        
        @keyframes dash-flow {
          0% { stroke-dashoffset: 100; }
          100% { stroke-dashoffset: 0; }
        }
        
        @keyframes energy-pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        
        @keyframes particle-stream {
          0% { transform: translateX(0) scale(0); opacity: 0; }
          20% { opacity: 1; transform: scale(1); }
          80% { opacity: 1; }
          100% { transform: translateX(96px) scale(0); opacity: 0; }
        }
        
        @keyframes blink-code {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
        
        @keyframes blockchain-float {
          0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 0; }
          5% { opacity: 0.4; }
          95% { opacity: 0.4; }
          100% { transform: translateY(-110vh) translateX(30px) rotate(360deg); opacity: 0; }
        }
        
        @keyframes hex-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes digital-rain {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        
        @keyframes scan {
          0% { transform: translateY(0); }
          100% { transform: translateY(100%); }
        }
        
        .animate-neon-pulse { animation: neon-pulse 6s ease-in-out infinite; }
        .animate-neon-pulse-delayed { animation: neon-pulse-delayed 8s ease-in-out infinite; }
        .animate-hologram-appear { animation: hologram-appear 1s ease-out forwards; }
        .animate-rotate-3d { animation: rotate-3d 10s ease-in-out infinite; }
        .animate-ping-neon { animation: ping-neon 3s cubic-bezier(0, 0, 0.2, 1) infinite; }
        .animate-spin-slow { animation: spin-slow 20s linear infinite; }
        .animate-pulse-ring { animation: pulse-ring 3s ease-in-out infinite; }
        .animate-dash-flow { animation: dash-flow 2s linear infinite; }
        .animate-energy-pulse { animation: energy-pulse 2s ease-in-out infinite; }
        .animate-particle-stream { animation: particle-stream 2s linear infinite; }
        .animate-blink-code { animation: blink-code 3s ease-in-out infinite; }
        .animate-blockchain-float { animation: blockchain-float linear infinite; }
        .animate-hex-spin { animation: hex-spin 15s linear infinite; }
        .animate-digital-rain { animation: digital-rain linear infinite; }
      `}</style>
    </div>
  );
};

export default CryptoBackground;
