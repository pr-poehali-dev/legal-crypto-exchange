import { useEffect, useState, useRef } from 'react';
import Icon from '@/components/ui/icon';

interface CryptoRate {
  symbol: string;
  name: string;
  price: number;
  change: number;
  icon: string;
}

const CryptoTicker = () => {
  const [rates, setRates] = useState<CryptoRate[]>([
    { symbol: 'BTC/USDT', name: 'Bitcoin', price: 0, change: 0, icon: 'Bitcoin' },
    { symbol: 'ETH/USDT', name: 'Ethereum', price: 0, change: 0, icon: 'Wallet' },
    { symbol: 'BNB/USDT', name: 'BNB', price: 0, change: 0, icon: 'TrendingUp' },
    { symbol: 'USDT/RUB', name: 'Tether', price: 0, change: 0, icon: 'DollarSign' },
  ]);
  const [isPaused, setIsPaused] = useState(false);
  const tickerRef = useRef<HTMLDivElement>(null);
  const pauseTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const btcResponse = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT');
        const ethResponse = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=ETHUSDT');
        const bnbResponse = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BNBUSDT');
        const usdtRubResponse = await fetch('https://functions.poehali.dev/f429c90b-c275-4b5d-bcd3-d3a69a15dea9');
        
        const [btc, eth, bnb, usdtRubData] = await Promise.all([
          btcResponse.json(),
          ethResponse.json(),
          bnbResponse.json(),
          usdtRubResponse.json(),
        ]);

        const rubRate = usdtRubData.success && usdtRubData.rate ? usdtRubData.rate : 90;

        setRates([
          { 
            symbol: 'BTC/USDT', 
            name: 'Bitcoin', 
            price: parseFloat(btc.lastPrice), 
            change: parseFloat(btc.priceChangePercent),
            icon: 'Bitcoin'
          },
          { 
            symbol: 'ETH/USDT', 
            name: 'Ethereum', 
            price: parseFloat(eth.lastPrice), 
            change: parseFloat(eth.priceChangePercent),
            icon: 'Wallet'
          },
          { 
            symbol: 'BNB/USDT', 
            name: 'BNB', 
            price: parseFloat(bnb.lastPrice), 
            change: parseFloat(bnb.priceChangePercent),
            icon: 'TrendingUp'
          },
          { 
            symbol: 'USDT/RUB', 
            name: 'Tether', 
            price: rubRate, 
            change: 0.05,
            icon: 'DollarSign'
          },
        ]);
      } catch (error) {
        console.error('Failed to fetch crypto rates:', error);
      }
    };

    fetchRates();
    const interval = setInterval(fetchRates, 30000);
    return () => clearInterval(interval);
  }, []);

  const tickerItems = [...rates, ...rates, ...rates, ...rates, ...rates, ...rates];

  const handleTouchStart = () => {
    if (pauseTimeoutRef.current) {
      clearTimeout(pauseTimeoutRef.current);
    }
    
    setIsPaused(true);
    
    pauseTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 3000);
  };

  return (
    <div className="w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-y border-border/50 overflow-hidden py-3 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-fuchsia-500/5"></div>
      
      <div 
        ref={tickerRef}
        className={`relative flex ${isPaused ? 'animate-scroll-paused' : 'animate-scroll'}`}
        onTouchStart={handleTouchStart}
      >
        {tickerItems.map((rate, index) => (
          <div
            key={`${rate.symbol}-${index}`}
            className="flex items-center gap-3 px-6 min-w-fit whitespace-nowrap"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center">
              <Icon name={rate.icon as any} size={16} className="text-violet-400" />
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">{rate.symbol}</span>
              <span className="text-lg font-semibold text-foreground">
                {rate.price > 0 ? (
                  rate.symbol === 'USDT/RUB' 
                    ? `${rate.price.toFixed(2)} ₽`
                    : rate.price.toLocaleString('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
                ) : '—'}
              </span>
              <span className={`text-sm font-medium ${rate.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {rate.change >= 0 ? '+' : ''}{rate.change.toFixed(2)}%
              </span>
            </div>
            
            <div className="w-px h-6 bg-border/50 ml-3"></div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
        @media (max-width: 768px) {
          .animate-scroll {
            animation: scroll 15s linear infinite;
          }
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
        .animate-scroll-paused {
          animation: scroll 15s linear infinite;
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};

export default CryptoTicker;