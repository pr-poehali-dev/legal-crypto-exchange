import { useState } from 'react';
import Navigation from '@/components/sections/Navigation';
import OffersSection from '@/components/sections/OffersSection';
import Footer from '@/components/sections/Footer';

const Offers = () => {
  const [activeTab, setActiveTab] = useState('buy');

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">Все объявления</h1>
            <p className="text-base md:text-xl text-muted-foreground">
              Актуальные предложения от проверенных пользователей
            </p>
          </div>
        </div>
        <OffersSection activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
      <Footer />
    </div>
  );
};

export default Offers;
