import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import AnonymousBuyOfferForm from '@/components/forms/AnonymousBuyOfferForm';
import AnonymousResponseForm from '@/components/forms/AnonymousResponseForm';

interface Offer {
  id: number;
  user_id: number;
  offer_type: string;
  amount: number;
  rate: number;
  meeting_time: string;
  username: string;
  phone: string;
  deals_count: number;
  created_at: string;
  is_anonymous?: boolean;
  city: string;
  offices: string[];
}

interface OffersSectionProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const OffersSection = ({ activeTab, setActiveTab }: OffersSectionProps) => {
  const { toast } = useToast();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [sortBy, setSortBy] = useState<'rate' | 'amount-min' | 'amount-max' | 'time'>('rate');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [currentRate, setCurrentRate] = useState<number | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [responseDialogOpen, setResponseDialogOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  useEffect(() => {
    cleanupExpiredOffers();
    loadOffers();
    fetchCurrentRate();
    
    const rateInterval = setInterval(() => {
      fetchCurrentRate();
    }, 30000);
    
    const offersInterval = setInterval(() => {
      loadOffers(true);
    }, 30000);
    
    const cleanupInterval = setInterval(() => {
      cleanupExpiredOffers();
    }, 60000);
    
    return () => {
      clearInterval(rateInterval);
      clearInterval(offersInterval);
      clearInterval(cleanupInterval);
    };
  }, [selectedCity]);

  const loadOffers = async (silent = false) => {
    if (!silent) {
      setIsLoading(true);
    }
    try {
      const url = selectedCity === 'all' 
        ? 'https://functions.poehali.dev/85034798-463f-4b9f-b879-43364e8c40ff'
        : `https://functions.poehali.dev/85034798-463f-4b9f-b879-43364e8c40ff?city=${encodeURIComponent(selectedCity)}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        setOffers(data.offers);
        setLastUpdate(new Date());
      }
    } catch (error) {
      if (!silent) {
        console.error('Failed to load offers:', error);
      }
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  };

  const cleanupExpiredOffers = async () => {
    try {
      await fetch('https://functions.poehali.dev/2237d1cb-ec94-4c0c-a318-6145c2f54e23', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error('Failed to cleanup expired offers:', error);
    }
  };

  const fetchCurrentRate = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/f429c90b-c275-4b5d-bcd3-d3a69a15dea9');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.rate) {
        setCurrentRate(data.rate);
      }
    } catch (error) {
      // Silently fail for rate updates
    }
  };

  const getSortedOffers = (offersList: Offer[]) => {
    const sorted = [...offersList];
    
    switch (sortBy) {
      case 'rate':
        return sorted.sort((a, b) => a.rate - b.rate);
      case 'amount-min':
        return sorted.sort((a, b) => a.amount - b.amount);
      case 'amount-max':
        return sorted.sort((a, b) => b.amount - a.amount);
      case 'time':
        return sorted.sort((a, b) => {
          const timeA = a.meeting_time.split(':').map(Number);
          const timeB = b.meeting_time.split(':').map(Number);
          const minutesA = timeA[0] * 60 + timeA[1];
          const minutesB = timeB[0] * 60 + timeB[1];
          return minutesA - minutesB;
        });
      default:
        return sorted;
    }
  };

  const buyOffers = getSortedOffers(offers.filter(o => o.offer_type === 'sell'));
  const sellOffers = getSortedOffers(offers.filter(o => o.offer_type === 'buy'));

  const handleContact = async (offer: Offer) => {
    if (!currentUser) {
      if (offer.offer_type === 'buy') {
        toast({
          title: 'Требуется регистрация',
          description: 'Для отклика на это объявление необходимо войти в систему',
          variant: 'destructive',
        });
        return;
      }
      
      setSelectedOffer(offer);
      setResponseDialogOpen(true);
      return;
    }

    try {
      const response = await fetch('https://functions.poehali.dev/9c031941-05ab-46ce-9781-3bd0b4c6974f', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offer_id: offer.id,
          user_id: currentUser.id,
          username: currentUser.name || currentUser.username || 'Пользователь',
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Успешно!',
          description: 'Владелец объявления получил уведомление о вашем интересе',
        });
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось отправить уведомление',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить уведомление',
        variant: 'destructive',
      });
    }
  };

  const isOwnOffer = (offer: Offer) => {
    return currentUser && currentUser.id === offer.user_id;
  };

  const renderOfferCard = (offer: Offer) => (
    <Card key={offer.id} className="glass border-border hover:border-secondary/70 transition-all duration-300 group glow-hover overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
      
      <CardContent className="p-5 md:p-7 relative z-10">
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-secondary via-amber-400 to-accent rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
              <span className="text-primary font-bold text-lg">{offer.username?.[0] || 'U'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-base md:text-lg truncate">{offer.username || 'Пользователь'}</p>
              <div className="flex items-center gap-2 flex-wrap">
                {!offer.is_anonymous && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Icon name="CheckCircle2" size={14} className="text-accent" />
                    <span>{offer.deals_count} успешных сделок</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-sm">
                  <Icon name="MapPin" size={14} className="text-secondary" />
                  <span className="font-medium text-secondary">{offer.city || 'Москва'}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 md:gap-4 bg-background/50 rounded-xl p-3 md:p-4">
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground mb-1.5 uppercase tracking-wide">Сумма</p>
              <p className="text-sm md:text-base font-bold break-words">{offer.amount.toLocaleString('ru-RU')} <span className="text-xs md:text-sm text-muted-foreground">USDT</span></p>
              <p className="text-xs md:text-sm text-accent font-semibold mt-1 break-words">{(offer.amount * offer.rate).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₽</p>
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground mb-1.5 uppercase tracking-wide">Курс</p>
              <p className="text-sm md:text-base font-bold text-secondary break-words">{offer.rate.toFixed(2)} <span className="text-xs md:text-sm">₽</span></p>
            </div>
            <div className="col-span-2 min-w-0">
              <p className="text-xs text-muted-foreground mb-1.5 uppercase tracking-wide">Встреча</p>
              <p className="text-sm font-medium break-words">Сегодня {offer.meeting_time}</p>
            </div>
          </div>

          {offer.offices && offer.offices.length > 0 && (
            <div className="bg-background/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Building2" size={16} className="text-secondary" />
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Офисы для встречи</p>
              </div>
              <div className="space-y-1.5">
                {offer.offices.map((office, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Icon name="MapPin" size={14} className="text-accent mt-0.5 flex-shrink-0" />
                    <p className="text-xs md:text-sm leading-relaxed">{office}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {!isOwnOffer(offer) && (
            <Button 
              onClick={() => handleContact(offer)}
              className="bg-secondary text-primary hover:bg-secondary/90 w-full shadow-lg shadow-secondary/20 hover:shadow-xl hover:shadow-secondary/30 transition-all duration-300 group/btn"
            >
              <Icon name="Handshake" className="mr-2 group-hover/btn:scale-110 transition-transform" size={18} />
              Создать сделку
            </Button>
          )}
          {isOwnOffer(offer) && (
            <div className="text-center py-3 px-4 rounded-lg bg-accent/10 border border-accent/20 text-sm font-medium text-accent">
              Ваше объявление
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <section id="offers" className="py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-6 md:mb-10">
          <div className="mt-3 md:mt-4 flex flex-col items-center gap-2">
            {currentRate && (
              <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-card border border-border rounded-lg px-2 sm:px-3 md:px-4 py-1.5 sm:py-2">
                <Icon name="TrendingUp" size={14} className="text-secondary sm:w-4 sm:h-4 md:w-[18px] md:h-[18px]" />
                <span className="text-[11px] sm:text-xs md:text-sm text-muted-foreground">Курс USDT:</span>
                <span className="text-sm sm:text-base md:text-lg font-bold text-secondary">{currentRate.toFixed(2)} ₽</span>
              </div>
            )}
            {lastUpdate && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Icon name="RefreshCw" size={12} />
                <span>Обновлено: {lastUpdate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
              </div>
            )}
          </div>
        </div>
        <div className="max-w-5xl mx-auto">
          <div className="mb-4 md:mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Icon name="MapPin" size={18} className="text-secondary" />
              <span className="text-sm md:text-base font-semibold">Выберите город</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {['all', 'Москва', 'Санкт-Петербург', 'Сочи', 'Омск'].map((city) => (
                <Button
                  key={city}
                  onClick={() => setSelectedCity(city)}
                  variant={selectedCity === city ? 'default' : 'outline'}
                  className={selectedCity === city 
                    ? 'bg-secondary text-primary hover:bg-secondary/90' 
                    : 'border-border hover:border-secondary'}
                >
                  {city === 'all' ? 'Все города' : city}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 md:mb-6 gap-3">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Icon name="ArrowUpDown" size={16} className="text-muted-foreground sm:w-[18px] sm:h-[18px]" />
              <span className="text-[11px] sm:text-xs md:text-sm text-muted-foreground">Сортировать:</span>
            </div>
            <div className="flex gap-3 items-center">
              {currentUser && (
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-secondary text-primary hover:bg-secondary/90"
                >
                  <Icon name="Plus" className="mr-2" size={18} />
                  Создать объявление
                </Button>
              )}
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-full md:w-[220px] bg-card border-border text-xs sm:text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rate">По курсу (от меньшего)</SelectItem>
                  <SelectItem value="time">По времени (от ближайшего)</SelectItem>
                  <SelectItem value="amount-min">По сумме (от минимальной)</SelectItem>
                  <SelectItem value="amount-max">По сумме (от максимальной)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-card border border-border mb-8">
              <TabsTrigger value="buy" className="data-[state=active]:bg-secondary data-[state=active]:text-primary">
                <Icon name="ShoppingCart" className="mr-2" size={20} />
                Купить USDT
              </TabsTrigger>
              <TabsTrigger value="sell" className="data-[state=active]:bg-secondary data-[state=active]:text-primary">
                <Icon name="Wallet" className="mr-2" size={20} />
                Продать USDT
              </TabsTrigger>
            </TabsList>
            <TabsContent value="buy" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Загрузка...</p>
                </div>
              ) : buyOffers.length === 0 ? (
                <div className="text-center py-12">
                  <Icon name="Inbox" size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">Пока нет продавцов USDT</p>
                  <p className="text-xs text-muted-foreground">Здесь появятся объявления продавцов, у которых вы сможете купить USDT</p>
                </div>
              ) : (
                buyOffers.map(renderOfferCard)
              )}
            </TabsContent>
            <TabsContent value="sell" className="space-y-4">
              {isLoading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Загрузка...</p>
                </div>
              ) : sellOffers.length === 0 ? (
                <div className="text-center py-12">
                  <Icon name="Inbox" size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">Пока нет покупателей USDT</p>
                  <p className="text-xs text-muted-foreground mb-6">Здесь появятся объявления покупателей, которым вы можете продать USDT</p>
                  {!currentUser && (
                    <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-secondary text-primary hover:bg-secondary/90">
                      <Icon name="Plus" className="mr-2" size={18} />
                      Разместить объявление о покупке
                    </Button>
                  )}
                </div>
              ) : (
                sellOffers.map(renderOfferCard)
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Создать объявление о покупке USDT</DialogTitle>
            <DialogDescription>
              Вы хотите купить USDT за рубли. Укажите условия - продавцы увидят ваше объявление и смогут связаться с вами.
            </DialogDescription>
          </DialogHeader>
          <AnonymousBuyOfferForm onSuccess={() => {
            setIsCreateDialogOpen(false);
            loadOffers();
          }} />
        </DialogContent>
      </Dialog>

      <Dialog open={responseDialogOpen} onOpenChange={setResponseDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="Lock" className="text-primary" />
              Зарезервировать объявление
            </DialogTitle>
            <DialogDescription>
              Объявление будет зарезервировано за вами, и продавец свяжется с вами для завершения сделки.
            </DialogDescription>
          </DialogHeader>
          {selectedOffer && (
            <AnonymousResponseForm 
              offerId={selectedOffer.id} 
              onSuccess={() => {
                setResponseDialogOpen(false);
                setSelectedOffer(null);
                loadOffers();
              }} 
            />
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default OffersSection;