import Icon from '@/components/ui/icon';

const Footer = () => {
  return (
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
  );
};

export default Footer;
