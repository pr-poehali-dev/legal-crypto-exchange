import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const HeroSection = () => {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary via-background to-primary opacity-50"></div>
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <Badge className="mb-6 bg-secondary/20 text-secondary border-secondary/30">
            Безопасные сделки с гарантией
          </Badge>
          <h2 className="text-5xl md:text-7xl font-bold mb-6 text-foreground leading-tight">
            Обмен USDT<br />с юридической<br />защитой
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Профессиональная площадка для безопасного обмена криптовалюты с полным юридическим сопровождением
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Dialog>
              <DialogTrigger asChild>
                <Button size="lg" className="bg-secondary text-primary hover:bg-secondary/90 text-lg px-8 py-6">
                  <Icon name="Calendar" className="mr-2" size={20} />
                  Записаться на встречу
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-2xl">Запись на встречу</DialogTitle>
                  <DialogDescription>
                    Забронируйте удобное время для оффлайн сделки
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="meeting-name">Имя</Label>
                    <Input id="meeting-name" placeholder="Ваше имя" className="bg-background border-border" />
                  </div>
                  <div>
                    <Label htmlFor="meeting-phone">Телефон</Label>
                    <Input id="meeting-phone" placeholder="+7 (999) 123-45-67" className="bg-background border-border" />
                  </div>
                  <div>
                    <Label htmlFor="meeting-date">Дата и время</Label>
                    <Select>
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue placeholder="Выберите дату" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="1">Сегодня, 15:00</SelectItem>
                        <SelectItem value="2">Завтра, 11:00</SelectItem>
                        <SelectItem value="3">Завтра, 14:00</SelectItem>
                        <SelectItem value="4">Послезавтра, 10:00</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="meeting-amount">Сумма сделки (USDT)</Label>
                    <Input id="meeting-amount" placeholder="10000" type="number" className="bg-background border-border" />
                  </div>
                  <div>
                    <Label htmlFor="meeting-notes">Комментарий</Label>
                    <Textarea id="meeting-notes" placeholder="Дополнительная информация" className="bg-background border-border" />
                  </div>
                  <Button className="w-full bg-secondary text-primary hover:bg-secondary/90">
                    Подтвердить запись
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button size="lg" variant="outline" className="border-secondary text-foreground hover:bg-secondary/10 text-lg px-8 py-6">
              <Icon name="ArrowRight" className="mr-2" size={20} />
              Узнать больше
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
