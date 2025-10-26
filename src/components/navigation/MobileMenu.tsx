import { Button } from '@/components/ui/button';

interface MobileMenuProps {
  isOpen: boolean;
  user: any;
  onLoginClick: () => void;
  onRegisterClick: () => void;
  onLogout: () => void;
}

export const MobileMenu = ({ isOpen, user, onLoginClick, onRegisterClick, onLogout }: MobileMenuProps) => {
  if (!isOpen) return null;

  return (
    <div className="lg:hidden border-t border-border/50 bg-card/95 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4 space-y-2">
        <a href="/#services" className="block py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          Услуги
        </a>
        <a href="/#guarantees" className="block py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          Гарантии
        </a>
        <a href="/offers" className="block py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          Объявления
        </a>
        <a href="/#contact" className="block py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          Контакты
        </a>
        
        <div className="pt-2 border-t border-border/50 space-y-2">
          {user ? (
            <div className="space-y-2">
              <div className="py-2 text-sm text-foreground font-medium">
                {user.username || user.email}
              </div>
              <a href="/profile" className="block">
                <Button variant="outline" size="sm" className="w-full border-secondary/50 bg-secondary/5 hover:bg-secondary/10 text-xs">
                  Личный кабинет
                </Button>
              </a>
              <a href="/admin" className="block">
                <Button variant="outline" size="sm" className="w-full border-secondary/50 bg-secondary/5 hover:bg-secondary/10 text-xs">
                  Панель управления
                </Button>
              </a>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onLogout}
                className="w-full border-red-500/50 bg-red-500/5 hover:bg-red-500/10 text-red-500 text-xs"
              >
                Выход
              </Button>
            </div>
          ) : (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onLoginClick}
                className="w-full border-secondary/50 bg-secondary/5 hover:bg-secondary/10 text-xs"
              >
                Вход
              </Button>
              <Button 
                size="sm" 
                onClick={onRegisterClick}
                className="w-full bg-secondary text-primary hover:bg-secondary/90 text-xs"
              >
                Регистрация
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
