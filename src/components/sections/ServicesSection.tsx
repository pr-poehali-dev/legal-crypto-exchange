import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const ServicesSection = () => {
  return (
    <section id="services" className="py-12 md:py-20 bg-card/30">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-8 md:mb-16">
          <h3 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">Наши услуги</h3>
          <p className="text-base md:text-xl text-muted-foreground px-2">Полный спектр услуг для безопасного обмена криптовалюты</p>
        </div>
        <div className="grid md:grid-cols-3 gap-4 md:gap-8">
          <Card className="bg-card border-border hover:border-secondary transition-all duration-300 group">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-secondary to-accent rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Icon name="Shield" size={32} className="text-primary" />
              </div>
              <CardTitle className="text-2xl">Юридическая защита</CardTitle>
              <CardDescription className="text-base">
                Каждая сделка сопровождается юристом и оформляется договором
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-card border-border hover:border-secondary transition-all duration-300 group">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-secondary to-accent rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Icon name="Building2" size={32} className="text-primary" />
              </div>
              <CardTitle className="text-2xl">Офлайн встречи</CardTitle>
              <CardDescription className="text-base">
                Безопасное пространство для проведения сделок в нашем офисе
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="bg-card border-border hover:border-secondary transition-all duration-300 group">
            <CardHeader>
              <div className="w-16 h-16 bg-gradient-to-br from-secondary to-accent rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Icon name="Users" size={32} className="text-primary" />
              </div>
              <CardTitle className="text-2xl">Проверенные участники</CardTitle>
              <CardDescription className="text-base">
                Система верификации и репутации для безопасных сделок
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;