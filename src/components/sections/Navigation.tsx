import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('https://functions.poehali.dev/0ff8de54-89bc-48dd-867a-b014941a6c41', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSubmitStatus('success');
        setFormData({ name: '', email: '', phone: '', password: '' });
        setTimeout(() => {
          setIsOpen(false);
          setSubmitStatus('idle');
        }, 2000);
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
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-secondary to-accent rounded-lg flex items-center justify-center">
              <Icon name="Shield" size={24} className="text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Legal Crypto Change</h1>
          </div>
          <div className="flex items-center space-x-8">
            <a href="#services" className="hidden md:inline text-muted-foreground hover:text-foreground transition-colors">Услуги</a>
            <a href="#guarantees" className="hidden md:inline text-muted-foreground hover:text-foreground transition-colors">Гарантии</a>
            <a href="#offers" className="hidden md:inline text-muted-foreground hover:text-foreground transition-colors">Объявления</a>
            <a href="#contact" className="hidden md:inline text-muted-foreground hover:text-foreground transition-colors">Контакты</a>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Имя и фамилия</Label>
                    <Input 
                      id="name" 
                      placeholder="Иван Иванов" 
                      className="bg-background border-border"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="ivan@example.com" 
                      className="bg-background border-border"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Телефон</Label>
                    <Input 
                      id="phone" 
                      placeholder="+7 (999) 123-45-67" 
                      className="bg-background border-border"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Пароль</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      className="bg-background border-border"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required
                      minLength={6}
                    />
                  </div>
                  {submitStatus === 'success' && (
                    <div className="text-accent text-sm">
                      ✅ Регистрация успешна! Мы свяжемся с вами.
                    </div>
                  )}
                  {submitStatus === 'error' && (
                    <div className="text-red-500 text-sm">
                      ❌ Ошибка регистрации. Попробуйте позже.
                    </div>
                  )}
                  <Button 
                    type="submit"
                    className="w-full bg-secondary text-primary hover:bg-secondary/90"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;