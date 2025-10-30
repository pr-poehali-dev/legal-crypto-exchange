import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

interface ExchangeRate {
  exchange: string;
  rate: number;
  change: number;
}

const HeroSection = () => {
  const [rates, setRates] = useState<ExchangeRate[]>([
    { exchange: 'Binance', rate: 100.12, change: 0.5 },
    { exchange: 'Bybit', rate: 100.08, change: -0.2 },
    { exchange: 'OKX', rate: 100.15, change: 0.8 },
    { exchange: 'Coinbase', rate: 100.05, change: 0.3 },
    { exchange: 'KuCoin', rate: 100.10, change: 0.6 },
    { exchange: 'MEXC', rate: 100.07, change: -0.1 },
    { exchange: 'Bitget', rate: 100.13, change: 0.7 },
    { exchange: 'HTX', rate: 100.09, change: 0.4 },
    { exchange: 'Gate.io', rate: 100.11, change: 0.5 },
  ]);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await fetch('https://functions.poehali.dev/f429c90b-c275-4b5d-bcd3-d3a69a15dea9');
        const data = await response.json();
        if (data.success && data.rates && data.rates.length > 0) {
          setRates(data.rates);
        }
      } catch (error) {
        console.error('Failed to fetch rates:', error);
      }
    };

    fetchRates();
    const interval = setInterval(fetchRates, 30000);
    return () => clearInterval(interval);
  }, []);

  const goToOffers = () => {
    window.location.href = '/offers';
  };

  return (
    <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-background via-background to-background">
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
                <span className="block text-foreground mb-2 sm:mb-3 text-3xl sm:text-6xl font-normal">Обмен USDT</span>
                <span className="block bg-gradient-to-r from-secondary via-accent to-secondary bg-clip-text text-transparent bg-[length:200%_200%] animate-gradient text-3xl sm:text-6xl" style={{fontFamily: '"Exo 2", sans-serif', fontWeight: 500}}>
                  с юридической защитой
                </span>
              </h1>
              
              <p className="text-sm sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-2xl leading-relaxed tracking-wide font-normal" style={{fontFamily: '"Exo 2", sans-serif', fontWeight: 600}}>Легализованный обмен наделенным правом в соответствии с Законом №&nbsp;259-ФЗ</p>
              
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
              <div className="w-full space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-1" style={{fontFamily: 'Orbitron, sans-serif'}}>
                    Актуальные курсы
                  </h3>
                  <p className="text-sm text-muted-foreground" style={{fontFamily: '"Exo 2", sans-serif'}}>
                    P2P обмен на биржах
                  </p>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
                  {rates.map((rate, index) => (
                    <div 
                      key={rate.exchange}
                      className="bg-card/80 border border-secondary/20 rounded-xl p-4 backdrop-blur-sm hover:border-secondary/40 hover:shadow-lg hover:shadow-secondary/10 transition-all duration-300 animate-fade-in group"
                      style={{
                        animationDelay: `${index * 0.1}s`
                      }}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-xs font-bold text-secondary/80 group-hover:text-secondary transition-colors" style={{fontFamily: 'Orbitron, sans-serif'}}>
                          {rate.exchange}
                        </span>
                        <span className="text-2xl font-black text-foreground group-hover:scale-105 transition-transform" style={{fontFamily: '"Exo 2", sans-serif'}}>
                          {rate.rate.toFixed(2)}
                        </span>
                        <span className="text-xs text-muted-foreground">₽ за USDT</span>
                      </div>
                    </div>
                  ))}
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