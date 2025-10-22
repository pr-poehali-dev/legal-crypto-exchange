import { useState } from 'react';
import Navigation from '@/components/sections/Navigation';
import HeroSection from '@/components/sections/HeroSection';
import ServicesSection from '@/components/sections/ServicesSection';
import GuaranteesSection from '@/components/sections/GuaranteesSection';
import OffersSection from '@/components/sections/OffersSection';
import ContactSection from '@/components/sections/ContactSection';
import Footer from '@/components/sections/Footer';

const Index = () => {
  const [activeTab, setActiveTab] = useState('buy');

  const offers = [
    { id: 1, type: 'buy', amount: '50,000', rate: '95.50', seller: 'Александр М.', verified: true, deals: 342 },
    { id: 2, type: 'buy', amount: '100,000', rate: '95.45', seller: 'Елена К.', verified: true, deals: 128 },
    { id: 3, type: 'buy', amount: '25,000', rate: '95.60', seller: 'Дмитрий С.', verified: true, deals: 89 },
    { id: 4, type: 'sell', amount: '75,000', rate: '96.20', seller: 'Марина Л.', verified: true, deals: 215 },
    { id: 5, type: 'sell', amount: '150,000', rate: '96.15', seller: 'Сергей Н.', verified: true, deals: 156 },
    { id: 6, type: 'sell', amount: '40,000', rate: '96.30', seller: 'Анна В.', verified: true, deals: 67 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <ServicesSection />
      <GuaranteesSection />
      <OffersSection activeTab={activeTab} setActiveTab={setActiveTab} offers={offers} />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
