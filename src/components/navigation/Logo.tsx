export const Logo = () => {
  return (
    <a href="/" className="flex items-center space-x-1 sm:space-x-1.5 md:space-x-2 cursor-pointer group">
      <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-12 md:h-12 flex items-center justify-center flex-shrink-0 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-400 to-cyan-400 rounded-2xl animate-spin-slow opacity-100 blur-[1px]"></div>
        
        <div className="absolute inset-[1px] bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-slide-in"></div>
          <div className="absolute bottom-0 right-0 w-full h-[2px] bg-gradient-to-r from-transparent via-teal-400 to-transparent animate-slide-in [animation-delay:0.5s]"></div>
        </div>
        
        <div className="relative z-10 flex items-center justify-center">
          <span className="text-[10px] md:text-sm font-black bg-gradient-to-br from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(16,185,129,0.8)] group-hover:scale-110 transition-transform duration-300 tracking-tight">
            LCC
          </span>
        </div>
        
        <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,1)]"></div>
        <div className="absolute bottom-0.5 right-0.5 w-1 h-1 bg-teal-400 rounded-full animate-pulse [animation-delay:0.3s] shadow-[0_0_8px_rgba(20,184,166,1)]"></div>
        
        <div className="absolute -inset-1 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 group-hover:from-emerald-500/40 group-hover:to-teal-500/40 rounded-2xl blur-lg transition-all duration-500"></div>
      </div>
      <h1 className="text-[10px] sm:text-xs lg:text-base xl:text-2xl font-bold text-foreground whitespace-nowrap">Legal Crypto Change</h1>
    </a>
  );
};

export default Logo;
