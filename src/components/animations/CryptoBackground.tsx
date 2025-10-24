const CryptoBackground = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 overflow-hidden">
      {/* Animated gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-gradient-to-r from-emerald-500/15 to-teal-500/15 rounded-full blur-3xl animate-float-slow"></div>
      <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse-slower"></div>
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
      
      {/* Animated lines */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0" />
            <stop offset="50%" stopColor="#10b981" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {[...Array(5)].map((_, i) => (
          <g key={i}>
            <path
              d={`M 0,${100 + i * 150} Q 400,${50 + i * 150} 800,${100 + i * 150} T 1600,${100 + i * 150}`}
              stroke="url(#line-gradient)"
              strokeWidth="2"
              fill="none"
              className="animate-dash"
              style={{
                animationDelay: `${i * 0.5}s`,
                strokeDasharray: '20 80',
              }}
            />
          </g>
        ))}
      </svg>
      
      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-emerald-400/40 rounded-full animate-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${15 + Math.random() * 10}s`,
            }}
          ></div>
        ))}
      </div>

      {/* Hexagon pattern */}
      <div className="absolute top-20 right-20 opacity-[0.07]">
        <svg width="200" height="200" viewBox="0 0 200 200">
          {[...Array(3)].map((_, i) => (
            <polygon
              key={i}
              points="100,20 180,60 180,140 100,180 20,140 20,60"
              fill="none"
              stroke="#10b981"
              strokeWidth="2"
              className="animate-spin-very-slow origin-center"
              style={{
                transformOrigin: 'center',
                animationDelay: `${i * 2}s`,
              }}
            />
          ))}
        </svg>
      </div>

      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
        @keyframes pulse-slower {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.15); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0); }
          25% { transform: translate(30px, -30px); }
          50% { transform: translate(-20px, -50px); }
          75% { transform: translate(-30px, -20px); }
        }
        @keyframes dash {
          0% { stroke-dashoffset: 100; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes particle {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.4; }
          90% { opacity: 0.4; }
          100% { transform: translateY(-100vh) translateX(50px); opacity: 0; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }
        .animate-pulse-slower {
          animation: pulse-slower 10s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 20s ease-in-out infinite;
        }
        .animate-dash {
          animation: dash 3s linear infinite;
        }
        .animate-particle {
          animation: particle linear infinite;
        }
        .animate-spin-very-slow {
          animation: spin 30s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(16, 185, 129, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(16, 185, 129, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>
    </div>
  );
};

export default CryptoBackground;