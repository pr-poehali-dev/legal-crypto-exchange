import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Textarea } from '@/components/ui/textarea';

const ContactSection = () => {
  return (
    <section id="contact" className="py-20">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <Badge className="mb-4 bg-secondary/20 text-secondary border-secondary/30">
              Свяжитесь с нами
            </Badge>
            <h3 className="text-4xl md:text-5xl font-bold mb-6">Наш офис</h3>
            <p className="text-xl text-muted-foreground mb-8">
              Приглашаем вас на личную встречу в наш офис для безопасного проведения сделки
            </p>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="MapPin" size={24} className="text-secondary" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-1">Адрес</h4>
                  <p className="text-muted-foreground">г. Москва, ул. Тверская, д. 15, офис 501</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="Clock" size={24} className="text-secondary" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-1">Время работы</h4>
                  <p className="text-muted-foreground">Пн-Пт: 10:00 - 20:00<br />Сб-Вс: 11:00 - 18:00</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="Phone" size={24} className="text-secondary" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-1">Телефон</h4>
                  <p className="text-muted-foreground">+7 (495) 123-45-67</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="Mail" size={24} className="text-secondary" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold mb-1">Email</h4>
                  <p className="text-muted-foreground">info@legalcryptochange.ru</p>
                </div>
              </div>
            </div>
          </div>
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-2xl">Задать вопрос</CardTitle>
              <CardDescription>
                Напишите нам, и мы свяжемся с вами в ближайшее время
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="contact-name">Имя</Label>
                  <Input id="contact-name" placeholder="Ваше имя" className="bg-background border-border" />
                </div>
                <div>
                  <Label htmlFor="contact-email">Email</Label>
                  <Input id="contact-email" type="email" placeholder="your@email.com" className="bg-background border-border" />
                </div>
                <div>
                  <Label htmlFor="contact-phone">Телефон</Label>
                  <Input id="contact-phone" placeholder="+7 (999) 123-45-67" className="bg-background border-border" />
                </div>
                <div>
                  <Label htmlFor="contact-message">Сообщение</Label>
                  <Textarea id="contact-message" placeholder="Ваш вопрос..." rows={4} className="bg-background border-border" />
                </div>
                <Button className="w-full bg-secondary text-primary hover:bg-secondary/90">
                  Отправить сообщение
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
