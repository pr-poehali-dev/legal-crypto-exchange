import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const Navigation = () => {
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
  );
};

export default Navigation;
