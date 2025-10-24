import { useEffect, useState, useRef } from 'react';

interface CryptoRate {
  symbol: string;
  name: string;
  price: number;
  change: number;
  icon: string;
}

const CryptoIcon = ({ symbol }: { symbol: string }) => {
  const icons: Record<string, string> = {
    'BTC/USDT': 'https://cryptologos.cc/logos/bitcoin-btc-logo.svg',
    'ETH/USDT': 'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
    'BNB/USDT': 'https://cryptologos.cc/logos/bnb-bnb-logo.svg',
    'USDT/RUB': 'https://cryptologos.cc/logos/tether-usdt-logo.svg'
  };

  return (
    <img 
      src={icons[symbol]} 
      alt={symbol} 
      className="w-5 h-5"
      onError={(e) => {
        (e.target as HTMLImageElement).style.display = 'none';
      }}
    />
  );
};

const CryptoTicker = () => {
  const [rates, setRates] = useState<CryptoRate[]>([
    { symbol: 'BTC/USDT', name: 'Bitcoin', price: 0, change: 0, icon: '₿' },
    { symbol: 'ETH/USDT', name: 'Ethereum', price: 0, change: 0, icon: 'Ξ' },
    { symbol: 'BNB/USDT', name: 'BNB', price: 0, change: 0, icon: '🔶' },
    { symbol: 'USDT/RUB', name: 'Tether', price: 0, change: 0, icon: '₮' },
  ]);
  const tickerRef = useRef<HTMLDivElement>(null);

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
            icon: '₿'
          },
          { 
            symbol: 'ETH/USDT', 
            name: 'Ethereum', 
            price: parseFloat(eth.lastPrice), 
            change: parseFloat(eth.priceChangePercent),
            icon: 'Ξ'
          },
          { 
            symbol: 'BNB/USDT', 
            name: 'BNB', 
            price: parseFloat(bnb.lastPrice), 
            change: parseFloat(bnb.priceChangePercent),
            icon: '🔶'
          },
          { 
            symbol: 'USDT/RUB', 
            name: 'Tether', 
            price: rubRate, 
            change: 0.05,
            icon: '₮'
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

  return (
    <div className="w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-y border-border/50 overflow-hidden py-3 relative">
      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/5 to-fuchsia-500/5"></div>
      
      <div 
        ref={tickerRef}
        className="relative flex animate-scroll"
      >
        {tickerItems.map((rate, index) => (
          <div
            key={`${rate.symbol}-${index}`}
            className="flex items-center gap-3 px-6 min-w-fit whitespace-nowrap"
          >
            <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center p-1">
              <CryptoIcon symbol={rate.symbol} />
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
          animation: scroll 7s linear infinite;
        }

      `}</style>
    </div>
  );
};

export default CryptoTicker;