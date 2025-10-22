import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

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
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-secondary to-accent rounded-lg flex items-center justify-center">
                <Icon name="Shield" size={24} className="text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Legal Crypto Change</h1>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#services" className="text-muted-foreground hover:text-foreground transition-colors">Услуги</a>
              <a href="#guarantees" className="text-muted-foreground hover:text-foreground transition-colors">Гарантии</a>
              <a href="#offers" className="text-muted-foreground hover:text-foreground transition-colors">Объявления</a>
              <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">Контакты</a>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-secondary text-primary hover:bg-secondary/90">
                    Регистрация
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card">
                  <DialogHeader>
                    <DialogTitle className="text-2xl">Регистрация</DialogTitle>
                    <DialogDescription>
                      Создайте аккаунт для безопасных сделок с USDT
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Имя и фамилия</Label>
                      <Input id="name" placeholder="Иван Иванов" className="bg-background border-border" />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="ivan@example.com" className="bg-background border-border" />
                    </div>
                    <div>
                      <Label htmlFor="phone">Телефон</Label>
                      <Input id="phone" placeholder="+7 (999) 123-45-67" className="bg-background border-border" />
                    </div>
                    <div>
                      <Label htmlFor="password">Пароль</Label>
                      <Input id="password" type="password" className="bg-background border-border" />
                    </div>
                    <Button className="w-full bg-secondary text-primary hover:bg-secondary/90">
                      Зарегистрироваться
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </nav>

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

      <section id="services" className="py-20 bg-card/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold mb-4">Наши услуги</h3>
            <p className="text-xl text-muted-foreground">Полный спектр услуг для безопасного обмена криптовалюты</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
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

      <section id="guarantees" className="py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4 bg-accent/20 text-accent border-accent/30">
                Гарантии безопасности
              </Badge>
              <h3 className="text-4xl md:text-5xl font-bold mb-6">Полная юридическая поддержка</h3>
              <p className="text-xl text-muted-foreground mb-8">
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

      <section id="offers" className="py-20 bg-card/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-4xl md:text-5xl font-bold mb-4">Объявления</h3>
            <p className="text-xl text-muted-foreground">Актуальные предложения от проверенных пользователей</p>
          </div>
          <div className="max-w-5xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-card border border-border mb-8">
                <TabsTrigger value="buy" className="data-[state=active]:bg-secondary data-[state=active]:text-primary">
                  <Icon name="TrendingUp" className="mr-2" size={20} />
                  Купить USDT
                </TabsTrigger>
                <TabsTrigger value="sell" className="data-[state=active]:bg-secondary data-[state=active]:text-primary">
                  <Icon name="TrendingDown" className="mr-2" size={20} />
                  Продать USDT
                </TabsTrigger>
              </TabsList>
              <TabsContent value="buy" className="space-y-4">
                {offers.filter(o => o.type === 'buy').map((offer) => (
                  <Card key={offer.id} className="bg-card border-border hover:border-secondary transition-all">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-secondary to-accent rounded-full flex items-center justify-center">
                            <span className="text-primary font-bold">{offer.seller[0]}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-lg">{offer.seller}</p>
                              {offer.verified && (
                                <Badge className="bg-accent/20 text-accent border-accent/30">
                                  <Icon name="CheckCircle" size={12} className="mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{offer.deals} успешных сделок</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Сумма</p>
                            <p className="text-xl font-bold">{offer.amount} ₽</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Курс</p>
                            <p className="text-xl font-bold text-secondary">{offer.rate} ₽</p>
                          </div>
                          <Button className="bg-secondary text-primary hover:bg-secondary/90">
                            Связаться
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
              <TabsContent value="sell" className="space-y-4">
                {offers.filter(o => o.type === 'sell').map((offer) => (
                  <Card key={offer.id} className="bg-card border-border hover:border-secondary transition-all">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-secondary to-accent rounded-full flex items-center justify-center">
                            <span className="text-primary font-bold">{offer.seller[0]}</span>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-lg">{offer.seller}</p>
                              {offer.verified && (
                                <Badge className="bg-accent/20 text-accent border-accent/30">
                                  <Icon name="CheckCircle" size={12} className="mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{offer.deals} успешных сделок</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Сумма</p>
                            <p className="text-xl font-bold">{offer.amount} ₽</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Курс</p>
                            <p className="text-xl font-bold text-secondary">{offer.rate} ₽</p>
                          </div>
                          <Button className="bg-secondary text-primary hover:bg-secondary/90">
                            Связаться
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

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

      <footer className="border-t border-border bg-card/30 py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-secondary to-accent rounded-lg flex items-center justify-center">
                  <Icon name="Shield" size={20} className="text-primary" />
                </div>
                <h4 className="text-lg font-bold">Legal Crypto</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Безопасный обмен криптовалюты с юридической поддержкой
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Услуги</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Покупка USDT</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Продажа USDT</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Юридическое сопровождение</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Оффлайн встречи</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Компания</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">О нас</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Лицензии</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Безопасность</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Отзывы</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Поддержка</h5>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Контакты</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Политика конфиденциальности</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Условия использования</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Legal Crypto Change. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
