const CryptoBackground = () => {
  const exchangePairs = [
    { from: 'BTC', to: 'USDT', x: 20, y: 20 },
    { from: 'ETH', to: 'USDT', x: 60, y: 30 },
    { from: 'BNB', to: 'USDT', x: 30, y: 60 },
    { from: 'USDT', to: 'RUB', x: 70, y: 70 },
  ];

  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-full blur-3xl animate-float-slow"></div>
      
      {/* Exchange flow visualization */}
      {exchangePairs.map((pair, idx) => (
        <div
          key={idx}
          className="absolute"
          style={{
            left: `${pair.x}%`,
            top: `${pair.y}%`,
          }}
        >
          {/* Crypto icons with exchange arrow */}
          <div className="flex items-center gap-4 animate-fade-pulse" style={{ animationDelay: `${idx * 0.8}s` }}>
            {/* From crypto */}
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 backdrop-blur-sm flex items-center justify-center border border-emerald-500/20">
                <span className="text-xs font-bold text-emerald-400/60">{pair.from}</span>
              </div>
              <div className="absolute inset-0 rounded-full bg-emerald-500/20 animate-ping-slow"></div>
            </div>
            
            {/* Exchange arrow with particles */}
            <div className="relative w-16">
              <svg width="64" height="24" viewBox="0 0 64 24" className="animate-flow-right">
                <defs>
                  <linearGradient id={`arrow-gradient-${idx}`} x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.6" />
                  </linearGradient>
                </defs>
                <path d="M 0,12 L 50,12 L 45,8 M 50,12 L 45,16" stroke={`url(#arrow-gradient-${idx})`} strokeWidth="2" fill="none" />
              </svg>
              {/* Flowing particles */}
              <div className="absolute top-2 left-0 w-2 h-2 bg-emerald-400 rounded-full animate-particle-flow" style={{ animationDelay: `${idx * 0.3}s` }}></div>
              <div className="absolute top-2 left-0 w-1.5 h-1.5 bg-teal-400 rounded-full animate-particle-flow" style={{ animationDelay: `${idx * 0.3 + 0.5}s` }}></div>
            </div>
            
            {/* To crypto */}
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-teal-500/10 backdrop-blur-sm flex items-center justify-center border border-teal-500/20">
                <span className="text-xs font-bold text-teal-400/60">{pair.to}</span>
              </div>
              <div className="absolute inset-0 rounded-full bg-teal-500/20 animate-ping-slow" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>
        </div>
      ))}

      {/* Floating transaction blocks */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-float-up opacity-20"
          style={{
            left: `${10 + i * 12}%`,
            top: '100%',
            animationDelay: `${i * 1.5}s`,
            animationDuration: `${20 + Math.random() * 10}s`,
          }}
        >
          <div className="w-8 h-8 border border-emerald-500/30 bg-emerald-500/5 backdrop-blur-sm transform rotate-45"></div>
        </div>
      ))}

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(30px, -30px); }
          50% { transform: translate(-20px, -50px); }
          75% { transform: translate(-30px, -20px); }
        }
        @keyframes fade-pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.8; }
        }
        @keyframes ping-slow {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(2); opacity: 0; }
        }
        @keyframes flow-right {
          0% { transform: translateX(-5px); opacity: 0.5; }
          100% { transform: translateX(5px); opacity: 1; }
        }
        @keyframes particle-flow {
          0% { transform: translateX(0); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateX(64px); opacity: 0; }
        }
        @keyframes float-up {
          0% { transform: translateY(0) rotate(45deg); opacity: 0; }
          10% { opacity: 0.2; }
          90% { opacity: 0.2; }
          100% { transform: translateY(-100vh) rotate(405deg); opacity: 0; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 20s ease-in-out infinite;
        }
        .animate-fade-pulse {
          animation: fade-pulse 4s ease-in-out infinite;
        }
        .animate-ping-slow {
          animation: ping-slow 3s ease-out infinite;
        }
        .animate-flow-right {
          animation: flow-right 2s ease-in-out infinite;
        }
        .animate-particle-flow {
          animation: particle-flow 2s linear infinite;
        }
        .animate-float-up {
          animation: float-up linear infinite;
        }
      `}</style>
    </div>
  );
};

export default CryptoBackground;