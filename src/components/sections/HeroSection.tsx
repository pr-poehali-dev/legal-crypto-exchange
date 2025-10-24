import { Button } from '@/components/ui/button';

const HeroSection = () => {
  const scrollToOffers = () => {
    document.getElementById('offers')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-background via-background to-primary/5">
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
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-left space-y-6 animate-fade-in order-2 md:order-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-sm font-medium backdrop-blur-sm">
                <span className="w-2 h-2 bg-secondary rounded-full animate-pulse"></span>
                Безопасный обмен с гарантией
              </div>
              
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight">
                <span className="block text-foreground">Обмен USDT</span>
                <span className="block bg-gradient-to-r from-secondary via-accent to-secondary bg-clip-text text-transparent bg-[length:200%_200%] animate-gradient">
                  с юридической защитой
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
                Профессиональная площадка для безопасного обмена криптовалюты с полным юридическим сопровождением
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button 
                  size="lg" 
                  className="bg-secondary text-primary hover:bg-secondary/90 text-lg px-8 py-6 shadow-lg shadow-secondary/20 hover:shadow-xl hover:shadow-secondary/30 transition-all duration-300 group"
                  onClick={scrollToOffers}
                >
                  Обменять
                  <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                </Button>
              </div>

              <div className="flex flex-wrap gap-8 pt-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-secondary"></div>
                  </div>
                  <span>Юридическая защита</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-secondary"></div>
                  </div>
                  <span>Быстрые сделки</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center order-1 md:order-2">
              <div className="relative w-full max-w-md aspect-square">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 via-accent/20 to-secondary/20 rounded-full blur-3xl animate-pulse"></div>
                
                <div className="absolute inset-8 md:inset-12">
                  <div className="relative w-full h-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-400 to-cyan-400 rounded-full animate-spin-slow opacity-20"></div>
                    
                    <div className="absolute inset-2 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 rounded-full shadow-2xl shadow-teal-500/50">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-transparent animate-spin-slow"></div>
                      
                      <div className="absolute inset-[15%] bg-gradient-to-br from-emerald-300 to-teal-400 rounded-full flex items-center justify-center shadow-inner">
                        <span className="text-6xl md:text-8xl font-black text-white drop-shadow-2xl">₮</span>
                      </div>
                      
                      {[...Array(8)].map((_, i) => (
                        <div
                          key={i}
                          className="absolute w-3 h-3 bg-white/40 rounded-full blur-sm animate-orbit"
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

                <div className="absolute -top-4 -right-4 bg-card border border-border rounded-2xl px-4 py-3 shadow-xl backdrop-blur-sm animate-float">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold">Безопасно</span>
                  </div>
                </div>

                <div className="absolute -bottom-4 -left-4 bg-card border border-border rounded-2xl px-4 py-3 shadow-xl backdrop-blur-sm animate-float" style={{animationDelay: '1s'}}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold">Быстро</span>
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