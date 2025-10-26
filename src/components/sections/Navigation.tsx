import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import Logo from '@/components/navigation/Logo';
import LoginDialog from '@/components/navigation/LoginDialog';
import RegisterDialog from '@/components/navigation/RegisterDialog';
import MobileMenu from '@/components/navigation/MobileMenu';

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

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const handleLoginSuccess = (userData: any) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  return (
    <>
      <nav className="border-b border-border/50 glass sticky top-0 z-50 shadow-lg shadow-black/5">
        <div className="container mx-auto px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4">
          <div className="flex items-center justify-between gap-1">
            <Logo />
            
            <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4 xl:space-x-8 flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="lg:hidden border-secondary/50 bg-secondary/5 hover:bg-secondary/10 px-3 py-2 flex items-center gap-2"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Icon name={isMobileMenuOpen ? "X" : "Menu"} size={20} />
                <span className="text-xs font-medium">{isMobileMenuOpen ? "Закрыть" : "Меню"}</span>
              </Button>

              <a href="/#services" className="hidden lg:inline text-sm xl:text-base text-muted-foreground hover:text-foreground transition-colors">Услуги</a>
              <a href="/#guarantees" className="hidden lg:inline text-sm xl:text-base text-muted-foreground hover:text-foreground transition-colors">Гарантии</a>
              <a href="/offers" className="hidden lg:inline text-sm xl:text-base text-muted-foreground hover:text-foreground transition-colors">Объявления</a>
              <a href="/#contact" className="hidden lg:inline text-sm xl:text-base text-muted-foreground hover:text-foreground transition-colors">Контакты</a>
              
              {user ? (
                <div className="flex items-center gap-1 lg:gap-2 xl:gap-3">
                  <span className="text-xs lg:text-sm text-muted-foreground hidden lg:inline truncate max-w-[100px] xl:max-w-none">
                    {user.username || user.email}
                  </span>
                  <a href="/profile">
                    <Button variant="outline" size="sm" className="border-secondary/50 bg-secondary/5 hover:bg-secondary/10 hidden lg:inline-flex text-xs lg:text-sm">
                      Личный кабинет
                    </Button>
                  </a>
                  <a href="/admin">
                    <Button variant="outline" size="sm" className="border-secondary/50 bg-secondary/5 hover:bg-secondary/10 hidden lg:inline-flex text-xs lg:text-sm">
                      Панель управления
                    </Button>
                  </a>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleLogout}
                    className="border-red-500/50 bg-red-500/5 hover:bg-red-500/10 text-red-500 hidden lg:inline-flex text-xs lg:text-sm"
                  >
                    Выход
                  </Button>
                </div>
              ) : (
                <>
                  <LoginDialog 
                    isOpen={isLoginOpen} 
                    setIsOpen={setIsLoginOpen}
                    onSuccess={handleLoginSuccess}
                  />
                  <RegisterDialog 
                    isOpen={isRegisterOpen} 
                    setIsOpen={setIsRegisterOpen}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <MobileMenu 
        isOpen={isMobileMenuOpen}
        user={user}
        onLoginClick={() => setIsLoginOpen(true)}
        onRegisterClick={() => setIsRegisterOpen(true)}
        onLogout={handleLogout}
      />
    </>
  );
};

export default Navigation;
