import { Button } from '@/components/ui/button';

const HeroSection = () => {
  const goToOffers = () => {
    window.location.href = '/offers';
  };

  return (
    <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-background via-background to-primary/5">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-secondary/30 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="text-left space-y-6 sm:space-y-8 animate-fade-in order-2 md:order-1">
              <div className="inline-flex items-center gap-2 sm:gap-2.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs sm:text-sm font-semibold backdrop-blur-sm tracking-wide uppercase" style={{fontFamily: 'Orbitron, sans-serif'}}>
                <span className="w-2 h-2 bg-secondary rounded-full animate-pulse shadow-lg shadow-secondary/50"></span>
                Безопасный обмен с гарантией
              </div>
              
              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold leading-[1.1] tracking-tight" style={{fontFamily: 'Orbitron, sans-serif'}}>
                <span className="block text-foreground mb-2 sm:mb-3 text-3xl sm:text-6xl">Обмен USDT</span>
                <span className="block bg-gradient-to-r from-secondary via-accent to-secondary bg-clip-text text-transparent bg-[length:200%_200%] animate-gradient font-black text-3xl sm:text-6xl" style={{fontFamily: 'Orbitron, sans-serif'}}>
                  с юридической защитой
                </span>
              </h1>
              
              <p className="text-sm sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl leading-relaxed font-light tracking-wide" style={{fontFamily: 'Orbitron, sans-serif'}}>Легализованный обмен наделенным правом в соответствии с Законом №&nbsp;259-ФЗ</p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4 sm:pt-6">
                <Button 
                  size="lg" 
                  className="bg-secondary text-primary hover:bg-secondary/90 text-lg sm:text-xl font-bold px-8 py-6 sm:px-10 sm:py-7 shadow-2xl shadow-secondary/30 hover:shadow-secondary/50 transition-all duration-300 group tracking-wide"
                  onClick={goToOffers}
                  style={{fontFamily: 'Orbitron, sans-serif'}}
                >
                  Обменять
                  <span className="ml-3 text-2xl group-hover:translate-x-1 transition-transform duration-300">→</span>
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-center order-1 md:order-2 px-4 md:px-0">
              <div className="relative w-full max-w-[280px] sm:max-w-sm md:max-w-md aspect-square mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 via-accent/20 to-secondary/20 rounded-full blur-3xl animate-pulse"></div>
                
                <div className="absolute inset-12 sm:inset-16 md:inset-20">
                  <div className="relative w-full h-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-400 to-cyan-400 rounded-full animate-spin-slow opacity-20"></div>
                    
                    <div className="absolute inset-2 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 rounded-full shadow-2xl shadow-teal-500/50">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-transparent animate-spin-slow"></div>
                      
                      <div className="absolute inset-[15%] bg-gradient-to-br from-emerald-300 to-teal-400 rounded-full flex items-center justify-center shadow-inner">
                        <span className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white drop-shadow-2xl">₮</span>
                      </div>
                      
                      {[...Array(8)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-2 h-2 md:w-3 md:h-3 bg-white/40 rounded-full blur-sm animate-orbit"
                          style={{
                            top: '50%',
                            left: '50%',
                            animationDelay: `${i * 0.5}s`,
                            animationDuration: '4s'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="absolute top-8 right-0 sm:-top-4 sm:-right-4 bg-card border border-border rounded-lg sm:rounded-2xl px-2 py-1.5 sm:px-4 sm:py-3 shadow-xl backdrop-blur-sm animate-float">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-accent rounded-full animate-pulse"></div>
                    <span className="text-[10px] sm:text-sm font-semibold whitespace-nowrap">Юр. защита</span>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 sm:-bottom-4 sm:-left-4 bg-card border border-border rounded-lg sm:rounded-2xl px-2 py-1.5 sm:px-4 sm:py-3 shadow-xl backdrop-blur-sm animate-float" style={{animationDelay: '1s'}}>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-secondary rounded-full animate-pulse"></div>
                    <span className="text-[10px] sm:text-sm font-semibold whitespace-nowrap">Быстро</span>
                  </div>
                </div>

                <div className="absolute top-1/2 left-0 sm:-left-16 md:-left-20 bg-card border border-border rounded-lg sm:rounded-2xl px-2 py-1.5 sm:px-4 sm:py-3 shadow-xl backdrop-blur-sm animate-float" style={{animationDelay: '0.5s'}}>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] sm:text-sm font-semibold whitespace-nowrap">Безопасно</span>
                  </div>
                </div>

                <div className="absolute top-1/3 right-0 sm:-right-12 md:-right-16 bg-card border border-border rounded-lg sm:rounded-2xl px-2 py-1.5 sm:px-4 sm:py-3 shadow-xl backdrop-blur-sm animate-float" style={{animationDelay: '1.5s'}}>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-violet-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] sm:text-sm font-semibold whitespace-nowrap">Сделки</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;