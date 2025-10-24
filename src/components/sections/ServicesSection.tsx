import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';

const ServicesSection = () => {
  const { elementRef, isVisible } = useIntersectionObserver({ threshold: 0.2 });
  
  const services = [
    {
      icon: 'Shield',
      title: 'Юридическая защита',
      description: 'Каждая сделка сопровождается юристом и оформляется договором',
      gradient: 'from-violet-500 to-purple-600'
    },
    {
      icon: 'Building2',
      title: 'Офлайн встречи',
      description: 'Безопасное пространство для проведения сделок в нашем офисе',
      gradient: 'from-secondary to-amber-500'
    },
    {
      icon: 'Users',
      title: 'Проверенные участники',
      description: 'Система верификации и репутации для безопасных сделок',
      gradient: 'from-accent to-emerald-600'
    }
  ];

  return (
    <section ref={elementRef} id="services" className="py-12 md:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-card/20 to-transparent"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }}></div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className={`text-center mb-12 md:mb-20 transition-all duration-700 ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
          <div className={`inline-block mb-4 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <span className="text-secondary text-sm font-semibold tracking-wider uppercase">Преимущества</span>
          </div>
          <h3 className={`text-4xl md:text-6xl font-bold mb-4 md:mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            Наши услуги
          </h3>
          <p className={`text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            Полный спектр услуг для безопасного обмена криптовалюты
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {services.map((service, index) => (
            <Card 
              key={index}
              className={`glass hover:border-secondary/50 transition-all duration-700 group relative overflow-hidden glow-hover transform hover:scale-105 hover:-rotate-1 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
              style={{ transitionDelay: isVisible ? `${index * 150}ms` : '0ms' }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              
              <CardHeader className="relative z-10">
                <div className={`w-16 h-16 bg-gradient-to-br ${service.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-125 group-hover:rotate-12 transition-all duration-700 shadow-lg group-hover:shadow-2xl group-hover:animate-pulse-glow`}>
                  <Icon name={service.icon as any} size={32} className="text-white" />
                </div>
                <CardTitle className="text-2xl md:text-3xl mb-3 group-hover:text-secondary transition-all duration-500 group-hover:translate-x-2">
                  {service.title}
                </CardTitle>
                <CardDescription className="text-base md:text-lg leading-relaxed">
                  {service.description}
                </CardDescription>
              </CardHeader>


            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;