import Icon from '@/components/ui/icon';

const Footer = () => {
  return (
    <footer className="border-t border-border/50 glass py-16 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-secondary via-amber-400 to-accent rounded-2xl flex items-center justify-center shadow-lg">
                <Icon name="Shield" size={24} className="text-primary" />
              </div>
              <h4 className="text-xl font-bold">Legal Crypto</h4>
            </div>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
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
  );
};

export default Footer;