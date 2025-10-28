import Navigation from '@/components/sections/Navigation';
import HeroSection from '@/components/sections/HeroSection';
import CryptoTicker from '@/components/sections/CryptoTicker';
import ServicesSection from '@/components/sections/ServicesSection';
import GuaranteesSection from '@/components/sections/GuaranteesSection';
import ContactSection from '@/components/sections/ContactSection';
import Footer from '@/components/sections/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <CryptoTicker />
      <HeroSection />
      <ServicesSection />
      <GuaranteesSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;