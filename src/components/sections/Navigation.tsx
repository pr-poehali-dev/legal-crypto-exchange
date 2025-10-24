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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneClean = phone.replace(/[^\d+]/g, '');
    return phoneClean.length >= 10 && phoneClean.length <= 12;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    if (registerData.name.trim().length < 2) {
      setErrorMessage('Имя должно содержать минимум 2 символа');
      setSubmitStatus('error');
      setIsSubmitting(false);
      return;
    }

    if (!validateEmail(registerData.email)) {
      setErrorMessage('Введите корректный email адрес');
      setSubmitStatus('error');
      setIsSubmitting(false);
      return;
    }

    if (!validatePhone(registerData.phone)) {
      setErrorMessage('Введите корректный номер телефона (формат: +7XXXXXXXXXX)');
      setSubmitStatus('error');
      setIsSubmitting(false);
      return;
    }

    if (registerData.password.length < 6) {
      setErrorMessage('Пароль должен содержать минимум 6 символов');
      setSubmitStatus('error');
      setIsSubmitting(false);
      return;
    }

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
        setErrorMessage(data.error || 'Ошибка регистрации. Попробуйте снова.');
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
    <nav className="border-b border-border/50 glass sticky top-0 z-50 shadow-lg shadow-black/5">
      <div className="container mx-auto px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4">
        <div className="flex items-center justify-between gap-1">
          <a href="/" className="flex items-center space-x-1 sm:space-x-1.5 md:space-x-2 cursor-pointer group">
            <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-12 md:h-12 flex items-center justify-center flex-shrink-0 relative">
              {/* Фоновый градиент с вращением */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl animate-spin-slow opacity-100 blur-[1px]"></div>
              
              {/* Основной контейнер */}
              <div className="absolute inset-[1px] bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden">
                {/* Анимированные линии */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-violet-400 to-transparent animate-slide-in"></div>
                <div className="absolute bottom-0 right-0 w-full h-[2px] bg-gradient-to-r from-transparent via-fuchsia-400 to-transparent animate-slide-in [animation-delay:0.5s]"></div>
              </div>
              
              {/* Текст LCC */}
              <div className="relative z-10 flex items-center justify-center">
                <span className="text-[10px] md:text-sm font-black bg-gradient-to-br from-violet-300 via-purple-200 to-fuchsia-300 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(168,85,247,0.8)] group-hover:scale-110 transition-transform duration-300 tracking-tight">
                  LCC
                </span>
              </div>
              
              {/* Светящиеся точки по углам */}
              <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-violet-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(168,85,247,1)]"></div>
              <div className="absolute bottom-0.5 right-0.5 w-1 h-1 bg-fuchsia-400 rounded-full animate-pulse [animation-delay:0.3s] shadow-[0_0_8px_rgba(232,121,249,1)]"></div>
              
              {/* Внешнее свечение при hover */}
              <div className="absolute -inset-1 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 group-hover:from-violet-500/40 group-hover:to-fuchsia-500/40 rounded-2xl blur-lg transition-all duration-500"></div>
            </div>
            <h1 className="text-[10px] sm:text-xs md:text-2xl font-bold text-foreground whitespace-nowrap">Legal Crypto Change</h1>
          </a>
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-8 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="md:hidden border-secondary/50 bg-secondary/5 hover:bg-secondary/10 px-3 py-2 flex items-center gap-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Icon name={isMobileMenuOpen ? "X" : "Menu"} size={20} />
              <span className="text-xs font-medium">{isMobileMenuOpen ? "Закрыть" : "Меню"}</span>
            </Button>

            <a href="/#services" className="hidden md:inline text-muted-foreground hover:text-foreground transition-colors">Услуги</a>
            <a href="/#guarantees" className="hidden md:inline text-muted-foreground hover:text-foreground transition-colors">Гарантии</a>
            <a href="/offers" className="hidden md:inline text-muted-foreground hover:text-foreground transition-colors">Объявления</a>
            <a href="/#contact" className="hidden md:inline text-muted-foreground hover:text-foreground transition-colors">Контакты</a>
            
            {user ? (
              <div className="flex items-center gap-1 md:gap-3">
                <span className="text-sm text-muted-foreground hidden md:inline">Привет, {user.name}!</span>
                {user.email === 'admin@kuzbassexchange.ru' && (
                  <Button 
                    onClick={() => window.location.href = '/admin'} 
                    variant="outline"
                    size="sm"
                    className="border-secondary hidden md:flex"
                  >
                    <Icon name="Shield" className="mr-2" size={16} />
                    Админ
                  </Button>
                )}
                <Button 
                  onClick={() => window.location.href = '/profile'} 
                  size="sm"
                  className="bg-secondary text-primary hover:bg-secondary/90"
                >
                  <Icon name="User" className="mr-0 md:mr-2" size={16} />
                  <span className="hidden md:inline">Кабинет</span>
                </Button>
                <Button onClick={handleLogout} variant="outline" size="sm" className="border-secondary hidden md:flex">
                  Выйти
                </Button>
              </div>
            ) : (
              <>
                <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="border-secondary hidden md:inline-flex">
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
                    <Button size="sm" className="bg-secondary text-primary hover:bg-secondary/90 hidden md:inline-flex">
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
                          minLength={2}
                          maxLength={100}
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
                          pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
                          title="Введите корректный email адрес"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Телефон</Label>
                        <Input 
                          id="phone" 
                          type="tel"
                          placeholder="+7 (999) 123-45-67" 
                          className="bg-background border-border"
                          value={registerData.phone}
                          onChange={(e) => setRegisterData({...registerData, phone: e.target.value})}
                          required
                          pattern="[\+]?[0-9\s\-\(\)]{10,15}"
                          title="Введите корректный номер телефона (формат: +7XXXXXXXXXX)"
                        />
                      </div>
                      <div>
                        <Label htmlFor="password">Пароль (минимум 6 символов)</Label>
                        <Input 
                          id="password" 
                          type="password" 
                          className="bg-background border-border"
                          value={registerData.password}
                          onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                          required
                          minLength={6}
                          maxLength={100}
                        />
                      </div>
                      {submitStatus === 'success' && (
                        <div className="text-accent text-sm">
                          ✅ Регистрация успешна! Теперь можете войти.
                        </div>
                      )}
                      {submitStatus === 'error' && (
                        <div className="text-red-500 text-sm">
                          ❌ {errorMessage || 'Ошибка регистрации'}
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
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border/50 bg-card/95 backdrop-blur-lg">
            <div className="container mx-auto px-4 py-4 space-y-3">
              <a 
                href="/#services" 
                className="block py-2 px-4 text-muted-foreground hover:text-foreground hover:bg-secondary/10 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <Icon name="Briefcase" size={18} />
                  <span>Услуги</span>
                </div>
              </a>
              <a 
                href="/#guarantees" 
                className="block py-2 px-4 text-muted-foreground hover:text-foreground hover:bg-secondary/10 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <Icon name="Shield" size={18} />
                  <span>Гарантии</span>
                </div>
              </a>
              <a 
                href="/offers" 
                className="block py-2 px-4 text-muted-foreground hover:text-foreground hover:bg-secondary/10 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <Icon name="FileText" size={18} />
                  <span>Объявления</span>
                </div>
              </a>
              <a 
                href="/#contact" 
                className="block py-2 px-4 text-muted-foreground hover:text-foreground hover:bg-secondary/10 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <Icon name="Mail" size={18} />
                  <span>Контакты</span>
                </div>
              </a>
              
              <div className="border-t border-border/50 pt-3 mt-3">
                {user ? (
                  <>
                    <div className="px-4 py-2 text-sm text-muted-foreground mb-2">
                      Привет, {user.name}!
                    </div>
                    {user.email === 'admin@kuzbassexchange.ru' && (
                      <button 
                        onClick={() => {
                          window.location.href = '/admin';
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full py-2 px-4 text-left text-muted-foreground hover:text-foreground hover:bg-secondary/10 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Icon name="Shield" size={18} />
                          <span>Админ панель</span>
                        </div>
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full py-2 px-4 text-left text-muted-foreground hover:text-foreground hover:bg-secondary/10 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Icon name="LogOut" size={18} />
                        <span>Выйти</span>
                      </div>
                    </button>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => {
                        setIsLoginOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full py-3 px-4 text-left hover:bg-secondary/10 rounded-lg transition-colors mb-2 border border-secondary/50"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Icon name="LogIn" size={18} className="text-secondary" />
                        <span className="font-medium">Войти</span>
                      </div>
                    </button>
                    <button 
                      onClick={() => {
                        setIsRegisterOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full py-3 px-4 text-left bg-secondary text-primary hover:bg-secondary/90 rounded-lg transition-colors"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Icon name="UserPlus" size={18} />
                        <span className="font-medium">Регистрация</span>
                      </div>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;