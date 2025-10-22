import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const Navigation = () => {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);
  const [registerData, setRegisterData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('https://functions.poehali.dev/0ff8de54-89bc-48dd-867a-b014941a6c41', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData)
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setRegisterData({ name: '', email: '', phone: '', password: '' });
        setTimeout(() => {
          setIsRegisterOpen(false);
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('https://functions.poehali.dev/42eabe98-7376-4ced-87c2-b0b8a64ec658', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData)
      });

      const data = await response.json();

      if (response.ok && data.user) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        setSubmitStatus('success');
        setLoginData({ email: '', password: '' });
        setTimeout(() => {
          setIsLoginOpen(false);
          setSubmitStatus('idle');
        }, 1000);
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
          <a href="/" className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-br from-secondary to-accent rounded-lg flex items-center justify-center">
              <Icon name="Shield" size={24} className="text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Legal Crypto Change</h1>
          </a>
          <div className="flex items-center space-x-8">
            <a href="#services" className="hidden md:inline text-muted-foreground hover:text-foreground transition-colors">Услуги</a>
            <a href="#guarantees" className="hidden md:inline text-muted-foreground hover:text-foreground transition-colors">Гарантии</a>
            <a href="#offers" className="hidden md:inline text-muted-foreground hover:text-foreground transition-colors">Объявления</a>
            <a href="#contact" className="hidden md:inline text-muted-foreground hover:text-foreground transition-colors">Контакты</a>
            
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground hidden md:inline">Привет, {user.name}!</span>
                <Button 
                  onClick={() => window.location.href = '/profile'} 
                  className="bg-secondary text-primary hover:bg-secondary/90"
                >
                  <Icon name="User" className="mr-2" size={16} />
                  Кабинет
                </Button>
                <Button onClick={handleLogout} variant="outline" className="border-secondary">
                  Выйти
                </Button>
              </div>
            ) : (
              <>
                <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="border-secondary hidden sm:flex">
                      Войти
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card">
                    <DialogHeader>
                      <DialogTitle className="text-2xl">Вход</DialogTitle>
                      <DialogDescription>
                        Войдите в свой аккаунт для доступа к сделкам
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <Label htmlFor="login-email">Email</Label>
                        <Input 
                          id="login-email" 
                          type="email" 
                          placeholder="ivan@example.com" 
                          className="bg-background border-border"
                          value={loginData.email}
                          onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="login-password">Пароль</Label>
                        <Input 
                          id="login-password" 
                          type="password" 
                          className="bg-background border-border"
                          value={loginData.password}
                          onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                          required
                        />
                      </div>
                      {submitStatus === 'success' && (
                        <div className="text-accent text-sm">
                          ✅ Вход выполнен успешно!
                        </div>
                      )}
                      {submitStatus === 'error' && (
                        <div className="text-red-500 text-sm">
                          ❌ Неверный email или пароль
                        </div>
                      )}
                      <Button 
                        type="submit"
                        className="w-full bg-secondary text-primary hover:bg-secondary/90"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Вход...' : 'Войти'}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>

                <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
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
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div>
                        <Label htmlFor="name">Имя и фамилия</Label>
                        <Input 
                          id="name" 
                          placeholder="Иван Иванов" 
                          className="bg-background border-border"
                          value={registerData.name}
                          onChange={(e) => setRegisterData({...registerData, name: e.target.value})}
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
                          value={registerData.email}
                          onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Телефон</Label>
                        <Input 
                          id="phone" 
                          placeholder="+7 (999) 123-45-67" 
                          className="bg-background border-border"
                          value={registerData.phone}
                          onChange={(e) => setRegisterData({...registerData, phone: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="password">Пароль</Label>
                        <Input 
                          id="password" 
                          type="password" 
                          className="bg-background border-border"
                          value={registerData.password}
                          onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                          required
                          minLength={6}
                        />
                      </div>
                      {submitStatus === 'success' && (
                        <div className="text-accent text-sm">
                          ✅ Регистрация успешна! Теперь можете войти.
                        </div>
                      )}
                      {submitStatus === 'error' && (
                        <div className="text-red-500 text-sm">
                          ❌ Ошибка регистрации. Email уже используется.
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
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;