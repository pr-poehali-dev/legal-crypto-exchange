import Navigation from '@/components/sections/Navigation';
import HeroSection from '@/components/sections/HeroSection';
import CryptoTicker from '@/components/sections/CryptoTicker';
import ServicesSection from '@/components/sections/ServicesSection';
import GuaranteesSection from '@/components/sections/GuaranteesSection';
import ContactSection from '@/components/sections/ContactSection';
import Footer from '@/components/sections/Footer';
import AnonymousBuyOfferForm from '@/components/forms/AnonymousBuyOfferForm';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <CryptoTicker />
      
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Быстрое создание объявления</h2>
          <p className="text-muted-foreground">
            Купить USDT? Создайте объявление за 1 минуту без регистрации
          </p>
        </div>
        <AnonymousBuyOfferForm />
      </section>
      
      <ServicesSection />
      <GuaranteesSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;