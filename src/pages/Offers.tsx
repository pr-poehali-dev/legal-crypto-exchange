import { useState, useEffect } from 'react';
import Navigation from '@/components/sections/Navigation';
import OffersSection from '@/components/sections/OffersSection';
import Footer from '@/components/sections/Footer';
import CryptoBackground from '@/components/animations/CryptoBackground';
import Icon from '@/components/ui/icon';

const Offers = () => {
  const [activeTab, setActiveTab] = useState('buy');
  const [currentRate, setCurrentRate] = useState<number | null>(null);

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const response = await fetch('https://functions.poehali.dev/f429c90b-c275-4b5d-bcd3-d3a69a15dea9?t=' + Date.now());
        const data = await response.json();
        if (data && data.success) {
          if (data.rate && data.rate > 0) {
            setCurrentRate(data.rate);
          } else if (data.rates && data.rates.length > 0) {
            const rates = data.rates.map((r: any) => r.rate).filter((r: number) => r > 0);
            if (rates.length > 0) {
              const avgRate = rates.reduce((a: number, b: number) => a + b, 0) / rates.length;
              setCurrentRate(avgRate);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch rate:', error);
      }
    };

    fetchRate();
    const interval = setInterval(fetchRate, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background relative">
      <CryptoBackground />
      <div className="relative z-10">
        <Navigation />
        <div className="pt-20 pb-12">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-5xl font-bold mb-4">Все объявления</h1>
              <p className="text-base md:text-xl text-muted-foreground mb-4">
                Актуальные предложения от проверенных пользователей
              </p>
              <div className="inline-flex items-start gap-6 text-sm text-muted-foreground bg-card/50 border border-border rounded-lg px-6 py-4 mt-4">
                <div className="flex items-start gap-2">
                  <Icon name="ShoppingCart" size={18} className="text-accent mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <p className="font-semibold text-foreground">Купить USDT</p>
                    <p className="text-xs">Здесь продавцы USDT</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Icon name="Wallet" size={18} className="text-secondary mt-0.5 flex-shrink-0" />
                  <div className="text-left">
                    <p className="font-semibold text-foreground">Продать USDT</p>
                    <p className="text-xs">Здесь покупатели USDT</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <OffersSection activeTab={activeTab} setActiveTab={setActiveTab} currentRate={currentRate} />
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Offers;