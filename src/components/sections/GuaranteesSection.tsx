import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

const GuaranteesSection = () => {
  return (
    <section id="guarantees" className="py-12 md:py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          <div>
            <Badge className="mb-3 md:mb-4 bg-accent/20 text-accent border-accent/30 text-xs md:text-sm">
              Гарантии безопасности
            </Badge>
            <h3 className="text-3xl md:text-5xl font-bold mb-4 md:mb-6">Полная юридическая поддержка</h3>
            <p className="text-base md:text-xl text-muted-foreground mb-6 md:mb-8">
              Мы обеспечиваем максимальную безопасность каждой сделки через комплексное юридическое сопровождение
            </p>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="FileText" size={24} className="text-accent" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">Договор на каждую сделку</h4>
                  <p className="text-muted-foreground">Юридически оформленный договор с печатью и подписями сторон</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="Scale" size={24} className="text-accent" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">Присутствие юриста</h4>
                  <p className="text-muted-foreground">Опытный юрист контролирует каждый этап сделки</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="Lock" size={24} className="text-accent" />
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-2">Безопасное хранение</h4>
                  <p className="text-muted-foreground">Активы находятся на защищенном эскроу-счете до завершения</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-accent/20 rounded-3xl transform rotate-3"></div>
            <Card className="relative bg-card border-secondary/50 p-8">
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