import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

interface Offer {
  id: number;
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
  const [offers, setOffers] = useState<Offer[]>([]);
  const [sortBy, setSortBy] = useState<'rate' | 'amount-min' | 'amount-max' | 'time'>('rate');
  const [isLoading, setIsLoading] = useState(true);
  const [currentRate, setCurrentRate] = useState<number | null>(null);

  useEffect(() => {
    loadOffers();
    fetchCurrentRate();
    
    const rateInterval = setInterval(() => {
      fetchCurrentRate();
    }, 30000);
    
    return () => clearInterval(rateInterval);
  }, []);

  const loadOffers = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/85034798-463f-4b9f-b879-43364e8c40ff');
      const data = await response.json();
      
      if (data.success) {
        setOffers(data.offers);
      }
    } catch (error) {
      console.error('Failed to load offers:', error);
    } finally {
      setIsLoading(false);
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

  const renderOfferCard = (offer: Offer) => (
    <Card key={offer.id} className="bg-card border-border hover:border-secondary transition-all">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-secondary to-accent rounded-full flex items-center justify-center">
              <span className="text-primary font-bold">{offer.username?.[0] || 'U'}</span>
            </div>
            <div>
              <p className="font-semibold text-lg">{offer.username || 'Пользователь'}</p>
              <p className="text-sm text-muted-foreground">{offer.deals_count} успешных сделок</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Сумма</p>
              <p className="text-xl font-bold">{offer.amount.toLocaleString('ru-RU')} USDT</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Курс</p>
              <p className="text-xl font-bold text-secondary">{offer.rate.toFixed(2)} ₽</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Встреча</p>
              <p className="text-sm font-medium">{offer.meeting_time}</p>
            </div>
            <Button className="bg-secondary text-primary hover:bg-secondary/90">
              Связаться
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <section id="offers" className="py-20 bg-card/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h3 className="text-4xl md:text-5xl font-bold mb-4">Объявления</h3>
          <p className="text-xl text-muted-foreground">Актуальные предложения от проверенных пользователей</p>
          {currentRate && (
            <div className="mt-4 inline-flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-2">
              <Icon name="TrendingUp" size={18} className="text-secondary" />
              <span className="text-sm text-muted-foreground">Рыночный курс USDT:</span>
              <span className="text-lg font-bold text-secondary">{currentRate.toFixed(2)} ₽</span>
            </div>
          )}
        </div>
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Icon name="ArrowUpDown" size={20} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Сортировать:</span>
            </div>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-[220px] bg-card border-border">
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