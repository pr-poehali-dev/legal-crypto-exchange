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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <ServicesSection />
      <GuaranteesSection />
      <OffersSection activeTab={activeTab} setActiveTab={setActiveTab} />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;