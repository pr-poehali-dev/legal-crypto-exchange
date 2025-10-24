import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Textarea } from '@/components/ui/textarea';

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('https://functions.poehali.dev/c17d8ba8-84ab-4563-98d1-53c3a38aeae2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', phone: '', message: '' });
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-12 md:py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/5 to-transparent"></div>
      <div className="absolute top-1/3 left-10 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-1/3 right-10 w-72 h-72 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2.5s' }}></div>
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16">
          <div className="animate-slide-in-left">
            <Badge className="mb-4 md:mb-6 bg-secondary/20 text-secondary border-secondary/30 text-xs md:text-sm font-semibold">
              Свяжитесь с нами
            </Badge>
            <h3 className="text-4xl md:text-6xl font-bold mb-6 md:mb-8 leading-tight">Наш офис</h3>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 md:mb-12 leading-relaxed">
              Приглашаем вас на личную встречу в наш офис для безопасного проведения сделки
            </p>
            <div className="space-y-7">
              <div className="flex items-start gap-4 group animate-fade-in-up delay-100">
                <div className="w-14 h-14 bg-gradient-to-br from-secondary to-amber-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-secondary/50">
                  <Icon name="MapPin" size={26} className="text-white" />
                </div>
                <div>
                  <h4 className="text-lg md:text-xl font-semibold mb-2 group-hover:text-secondary transition-colors">Адрес</h4>
                  <p className="text-muted-foreground text-base md:text-lg">г. Москва, ул. Тверская, д. 15, офис 501</p>
                </div>
              </div>
              <div className="flex items-start gap-4 group animate-fade-in-up delay-200">
                <div className="w-14 h-14 bg-gradient-to-br from-secondary to-amber-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-secondary/50">
                  <Icon name="Clock" size={26} className="text-white" />
                </div>
                <div>
                  <h4 className="text-lg md:text-xl font-semibold mb-2 group-hover:text-secondary transition-colors">Время работы</h4>
                  <p className="text-muted-foreground text-base md:text-lg">Пн-Пт: 10:00 - 20:00<br />Сб-Вс: 11:00 - 18:00</p>
                </div>
              </div>
              <div className="flex items-start gap-4 group animate-fade-in-up delay-300">
                <div className="w-14 h-14 bg-gradient-to-br from-secondary to-amber-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-secondary/50">
                  <Icon name="Phone" size={26} className="text-white" />
                </div>
                <div>
                  <h4 className="text-lg md:text-xl font-semibold mb-2 group-hover:text-secondary transition-colors">Телефон</h4>
                  <p className="text-muted-foreground text-base md:text-lg">+7 (495) 123-45-67</p>
                </div>
              </div>
              <div className="flex items-start gap-4 group animate-fade-in-up delay-400">
                <div className="w-14 h-14 bg-gradient-to-br from-secondary to-amber-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-secondary/50">
                  <Icon name="Mail" size={26} className="text-white" />
                </div>
                <div>
                  <h4 className="text-lg md:text-xl font-semibold mb-2 group-hover:text-secondary transition-colors">Email</h4>
                  <p className="text-muted-foreground text-base md:text-lg">info@legalcryptochange.ru</p>
                </div>
              </div>
            </div>
          </div>
          <Card className="glass border-border glow-hover animate-slide-in-right transform hover:scale-105 transition-all duration-500">
            <CardHeader>
              <CardTitle className="text-2xl md:text-3xl">Задать вопрос</CardTitle>
              <CardDescription>
                Напишите нам, и мы свяжемся с вами в ближайшее время
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="animate-fade-in-up delay-100">
                  <Label htmlFor="contact-name">Имя</Label>
                  <Input 
                    id="contact-name" 
                    placeholder="Ваше имя" 
                    className="bg-background border-border"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="animate-fade-in-up delay-200">
                  <Label htmlFor="contact-email">Email</Label>
                  <Input 
                    id="contact-email" 
                    type="email" 
                    placeholder="your@email.com" 
                    className="bg-background border-border"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                <div className="animate-fade-in-up delay-300">
                  <Label htmlFor="contact-phone">Телефон</Label>
                  <Input 
                    id="contact-phone" 
                    placeholder="+7 (999) 123-45-67" 
                    className="bg-background border-border"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                  />
                </div>
                <div className="animate-fade-in-up delay-400">
                  <Label htmlFor="contact-message">Сообщение</Label>
                  <Textarea 
                    id="contact-message" 
                    placeholder="Ваш вопрос..." 
                    rows={4} 
                    className="bg-background border-border"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    required
                  />
                </div>
                {submitStatus === 'success' && (
                  <div className="text-accent text-sm">
                    ✅ Сообщение успешно отправлено!
                  </div>
                )}
                {submitStatus === 'error' && (
                  <div className="text-red-500 text-sm">
                    ❌ Ошибка отправки. Попробуйте позже.
                  </div>
                )}
                <Button 
                  type="submit" 
                  className="w-full bg-secondary text-primary hover:bg-secondary/90 shadow-lg shadow-secondary/20 hover:shadow-xl hover:shadow-secondary/30 transition-all duration-300 hover:scale-105 animate-fade-in-up"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Отправка...' : 'Отправить сообщение'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;