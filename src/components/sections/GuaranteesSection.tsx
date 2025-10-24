import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useIntersectionObserver } from '@/hooks/use-intersection-observer';

const GuaranteesSection = () => {
  const { elementRef, isVisible } = useIntersectionObserver({ threshold: 0.2 });
  
  return (
    <section ref={elementRef} id="guarantees" className="py-12 md:py-24 relative overflow-hidden">
      <div className="absolute top-20 left-10 w-72 h-72 bg-accent/5 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">
          <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
            <Badge className="mb-4 md:mb-6 bg-accent/20 text-accent border-accent/30 text-xs md:text-sm font-semibold">
              Гарантии безопасности
            </Badge>
            <h3 className="text-4xl md:text-6xl font-bold mb-6 md:mb-8 leading-tight">
              Полная юридическая поддержка
            </h3>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 md:mb-12 leading-relaxed">
              Мы обеспечиваем максимальную безопасность каждой сделки через комплексное юридическое сопровождение
            </p>
            <div className="space-y-6 md:space-y-8">
              <div className={`flex items-start gap-4 group transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="w-14 h-14 bg-gradient-to-br from-accent to-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg group-hover:shadow-2xl group-hover:shadow-accent/50">
                  <Icon name="FileText" size={26} className="text-white" />
                </div>
                <div>
                  <h4 className="text-xl md:text-2xl font-semibold mb-2 group-hover:text-accent transition-colors">Договор на каждую сделку</h4>
                  <p className="text-muted-foreground text-base md:text-lg">Юридически оформленный договор с печатью и подписями сторон</p>
                </div>
              </div>
              <div className={`flex items-start gap-4 group transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="w-14 h-14 bg-gradient-to-br from-accent to-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg group-hover:shadow-2xl group-hover:shadow-accent/50">
                  <Icon name="Scale" size={26} className="text-white" />
                </div>
                <div>
                  <h4 className="text-xl md:text-2xl font-semibold mb-2 group-hover:text-accent transition-colors">Присутствие юриста</h4>
                  <p className="text-muted-foreground text-base md:text-lg">Опытный юрист контролирует каждый этап сделки</p>
                </div>
              </div>
              <div className={`flex items-start gap-4 group transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                <div className="w-14 h-14 bg-gradient-to-br from-accent to-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg group-hover:shadow-2xl group-hover:shadow-accent/50">
                  <Icon name="Lock" size={26} className="text-white" />
                </div>
                <div>
                  <h4 className="text-xl md:text-2xl font-semibold mb-2 group-hover:text-accent transition-colors">Безопасное хранение</h4>
                  <p className="text-muted-foreground text-base md:text-lg">Активы находятся на защищенном эскроу-счете до завершения</p>
                </div>
              </div>
            </div>
          </div>
          <div className={`relative group transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/30 to-accent/30 rounded-3xl transform rotate-3 group-hover:rotate-6 transition-transform duration-500 blur-xl animate-pulse-glow"></div>
            <Card className="relative glass border-secondary/50 p-8 md:p-10 glow-hover transform hover:scale-105 transition-all duration-500">
              <CardContent className="space-y-6 pt-6">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Всего сделок</span>
                  <span className="text-2xl font-bold text-secondary">12,847</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Общий объем</span>
                  <span className="text-2xl font-bold text-secondary">$45.2M</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Успешных сделок</span>
                  <span className="text-2xl font-bold text-accent">99.8%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Активных пользователей</span>
                  <span className="text-2xl font-bold text-foreground">3,421</span>
                </div>
                <div className="pt-6 border-t border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-secondary to-accent rounded-full flex items-center justify-center">
                      <Icon name="Award" size={24} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">Лицензированная платформа</p>
                      <p className="text-sm text-muted-foreground">Полное соответствие законодательству РФ</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GuaranteesSection;