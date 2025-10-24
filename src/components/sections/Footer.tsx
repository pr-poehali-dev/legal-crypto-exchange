import Icon from '@/components/ui/icon';

const Footer = () => {
  return (
    <footer className="border-t border-border/50 glass py-16 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div>
            <a href="/" className="flex items-center space-x-2 mb-6 group cursor-pointer">
              <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 via-teal-400 to-cyan-400 rounded-2xl animate-spin-slow opacity-100 blur-[1px]"></div>
                <div className="absolute inset-[1px] bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-slide-in"></div>
                  <div className="absolute bottom-0 right-0 w-full h-[2px] bg-gradient-to-r from-transparent via-teal-400 to-transparent animate-slide-in [animation-delay:0.5s]"></div>
                </div>
                <div className="relative z-10 flex items-center justify-center">
                  <span className="text-xs font-black bg-gradient-to-br from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(16,185,129,0.8)] tracking-tight">
                    LCC
                  </span>
                </div>
                <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,1)]"></div>
                <div className="absolute bottom-0.5 right-0.5 w-1 h-1 bg-teal-400 rounded-full animate-pulse [animation-delay:0.3s] shadow-[0_0_8px_rgba(20,184,166,1)]"></div>
                <div className="absolute -inset-1 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 group-hover:from-emerald-500/40 group-hover:to-teal-500/40 rounded-2xl blur-lg transition-all duration-500"></div>
              </div>
              <h4 className="text-xl font-bold">Legal Crypto Change</h4>
            </a>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              Безопасный обмен криптовалюты с юридической поддержкой
            </p>
          </div>
          <div>
            <h5 className="font-semibold mb-4">Услуги</h5>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/#services" className="hover:text-foreground transition-colors">Наши услуги</a></li>
              <li><a href="/offers" className="hover:text-foreground transition-colors">Объявления</a></li>
              <li><a href="/#guarantees" className="hover:text-foreground transition-colors">Гарантии</a></li>
              <li><a href="/profile" className="hover:text-foreground transition-colors">Личный кабинет</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-4">Компания</h5>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/#hero" className="hover:text-foreground transition-colors">О нас</a></li>
              <li><a href="/#guarantees" className="hover:text-foreground transition-colors">Безопасность</a></li>
              <li><a href="/#services" className="hover:text-foreground transition-colors">Преимущества</a></li>
              <li><a href="/#contact" className="hover:text-foreground transition-colors">Контакты</a></li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-4">Поддержка</h5>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="/#contact" className="hover:text-foreground transition-colors">Связаться с нами</a></li>
              <li><a href="https://t.me/LegalCryptoExchangeBot" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors flex items-center gap-1">
                <Icon name="MessageCircle" size={14} />
                Telegram бот
              </a></li>
              <li><a href="/#guarantees" className="hover:text-foreground transition-colors">Правила обмена</a></li>
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