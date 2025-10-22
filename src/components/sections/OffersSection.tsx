import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

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
}

interface OffersSectionProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const OffersSection = ({ activeTab, setActiveTab }: OffersSectionProps) => {
  const { toast } = useToast();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [sortBy, setSortBy] = useState<'rate' | 'amount-min' | 'amount-max' | 'time'>('rate');
  const [isLoading, setIsLoading] = useState(true);
  const [currentRate, setCurrentRate] = useState<number | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  useEffect(() => {
    loadOffers();
    fetchCurrentRate();
    
    const rateInterval = setInterval(() => {
      fetchCurrentRate();
    }, 30000);
    
    const offersInterval = setInterval(() => {
      loadOffers(true);
    }, 30000);
    
    return () => {
      clearInterval(rateInterval);
      clearInterval(offersInterval);
    };
  }, []);

  const loadOffers = async (silent = false) => {
    if (!silent) {
      setIsLoading(true);
    }
    try {
      const response = await fetch('https://functions.poehali.dev/85034798-463f-4b9f-b879-43364e8c40ff');
      const data = await response.json();
      
      if (data.success) {
        setOffers(data.offers);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Failed to load offers:', error);
    } finally {
      if (!silent) {
        setIsLoading(false);
      }
    }
  };

  const fetchCurrentRate = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/f429c90b-c275-4b5d-bcd3-d3a69a15dea9');
      const data = await response.json();
      
      if (data.success && data.rate) {
        setCurrentRate(data.rate);
      }
    } catch (error) {
      console.error('Failed to fetch rate:', error);
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
        return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      default:
        return sorted;
    }
  };

  const buyOffers = getSortedOffers(offers.filter(o => o.offer_type === 'buy'));
  const sellOffers = getSortedOffers(offers.filter(o => o.offer_type === 'sell'));

  const handleContact = async (offer: Offer) => {
    if (!currentUser) {
      toast({
        title: 'Требуется авторизация',
        description: 'Войдите в систему, чтобы связаться с продавцом',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('https://functions.poehali.dev/9c031941-05ab-46ce-9781-3bd0b4c6974f', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offer_id: offer.id,
          user_id: currentUser.id,
          username: currentUser.username,
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
    <Card key={offer.id} className="bg-card border-border hover:border-secondary transition-all">
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-secondary to-accent rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary font-bold">{offer.username?.[0] || 'U'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-base truncate">{offer.username || 'Пользователь'}</p>
              <p className="text-sm text-muted-foreground">{offer.deals_count} успешных сделок</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Сумма</p>
              <p className="text-base md:text-lg font-bold">{offer.amount.toLocaleString('ru-RU')} USDT</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Курс</p>
              <p className="text-base md:text-lg font-bold text-secondary">{offer.rate.toFixed(2)} ₽</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Встреча</p>
              <p className="text-sm font-medium">Сегодня, {offer.meeting_time}</p>
            </div>
          </div>
          
          {!isOwnOffer(offer) && (
            <Button 
              onClick={() => handleContact(offer)}
              className="bg-secondary text-primary hover:bg-secondary/90 w-full"
            >
              <Icon name="MessageCircle" className="mr-2" size={16} />
              Связаться
            </Button>
          )}
          {isOwnOffer(offer) && (
            <div className="text-center py-2 text-sm text-muted-foreground">
              Ваше объявление
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <section id="offers" className="py-12 md:py-20 bg-card/30">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-8 md:mb-16">
          <h3 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">Объявления</h3>
          <p className="text-base md:text-xl text-muted-foreground px-2">Актуальные предложения от проверенных пользователей</p>
          <div className="mt-3 md:mt-4 flex flex-col items-center gap-2">
            {currentRate && (
              <div className="inline-flex items-center gap-2 bg-card border border-border rounded-lg px-3 md:px-4 py-2">
                <Icon name="TrendingUp" size={16} className="text-secondary md:w-[18px] md:h-[18px]" />
                <span className="text-xs md:text-sm text-muted-foreground">Рыночный курс USDT:</span>
                <span className="text-base md:text-lg font-bold text-secondary">{currentRate.toFixed(2)} ₽</span>
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
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 md:mb-6 gap-3">
            <div className="flex items-center gap-2">
              <Icon name="ArrowUpDown" size={18} className="text-muted-foreground" />
              <span className="text-xs md:text-sm text-muted-foreground">Сортировать:</span>
            </div>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-full md:w-[220px] bg-card border-border text-sm">
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

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-card border border-border mb-8">
              <TabsTrigger value="buy" className="data-[state=active]:bg-secondary data-[state=active]:text-primary">
                <Icon name="TrendingUp" className="mr-2" size={20} />
                Купить USDT
              </TabsTrigger>
              <TabsTrigger value="sell" className="data-[state=active]:bg-secondary data-[state=active]:text-primary">
                <Icon name="TrendingDown" className="mr-2" size={20} />
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
                  <p className="text-muted-foreground">Пока нет объявлений</p>
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
                  <p className="text-muted-foreground">Пока нет объявлений</p>
                </div>
              ) : (
                sellOffers.map(renderOfferCard)
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
};

export default OffersSection;