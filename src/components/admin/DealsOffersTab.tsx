import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Offer, Deal } from './types';

interface DealsOffersTabProps {
  offers: Offer[];
  deals: Deal[];
  onToggleStatus: (offerId: number, currentStatus: string) => void;
  onDelete: (offerId: number) => void;
  onCompleteDeal: (dealId: number) => void;
  onCompleteOffer: (offerId: number) => void;
  onFilteredOffersChange: (offers: Offer[]) => void;
}

const DealsOffersTab = ({ offers, deals, onToggleStatus, onDelete, onCompleteDeal, onCompleteOffer, onFilteredOffersChange }: DealsOffersTabProps) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  type CombinedItem = (Offer & { itemType: 'offer' }) | (Deal & { itemType: 'deal' });
  
  let combinedItems: CombinedItem[] = [
    ...offers.map(o => ({ ...o, itemType: 'offer' as const })),
    ...deals.map(d => ({ ...d, itemType: 'deal' as const }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  if (filterStatus === 'reserved') {
    combinedItems = combinedItems.filter(item => 
      item.itemType === 'offer' && 'reserved_by' in item && item.reserved_by !== undefined && item.reserved_by !== null
    );
  } else if (filterStatus !== 'all') {
    combinedItems = combinedItems.filter(item => item.status === filterStatus);
  }

  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    combinedItems = combinedItems.filter(item => {
      if (item.itemType === 'offer') {
        const offer = item as Offer & { itemType: 'offer' };
        return (
          offer.id.toString().includes(query) ||
          offer.username?.toLowerCase().includes(query) ||
          offer.phone?.toLowerCase().includes(query) ||
          offer.amount.toString().includes(query) ||
          offer.rate.toString().includes(query)
        );
      } else {
        const deal = item as Deal & { itemType: 'deal' };
        return (
          deal.id.toString().includes(query) ||
          deal.username?.toLowerCase().includes(query) ||
          deal.email?.toLowerCase().includes(query) ||
          deal.phone?.toLowerCase().includes(query) ||
          deal.amount.toString().includes(query)
        );
      }
    });
  }

  const allCombinedItems = [
    ...offers.map(o => ({ ...o, itemType: 'offer' as const })),
    ...deals.map(d => ({ ...d, itemType: 'deal' as const }))
  ];

  useEffect(() => {
    const filteredOffersOnly = combinedItems
      .filter(item => item.itemType === 'offer')
      .map(item => {
        const { itemType, ...offer } = item;
        return offer as Offer;
      });
    onFilteredOffersChange(filteredOffersOnly);
  }, [filterStatus, searchQuery, offers]);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="relative">
          <Icon name="Search" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Поиск по ID, имени, телефону, сумме..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary text-foreground"
          />
        </div>
        
        <div className="flex items-center justify-between gap-4 bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Icon name="Filter" size={20} className="text-muted-foreground" />
            <span className="text-sm font-medium">Статус:</span>
          </div>
          <Tabs value={filterStatus} onValueChange={setFilterStatus} className="flex-1">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all" className="text-xs">Все ({allCombinedItems.length})</TabsTrigger>
              <TabsTrigger value="active" className="text-xs">Активные</TabsTrigger>
              <TabsTrigger value="reserved" className="text-xs">Резерв</TabsTrigger>
              <TabsTrigger value="inactive" className="text-xs">Пауза</TabsTrigger>
              <TabsTrigger value="completed" className="text-xs">Завершены</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      {combinedItems.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="p-12 text-center">
            <Icon name="Inbox" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Нет данных с выбранными фильтрами</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
      {combinedItems.map((item) => {
        if (item.itemType === 'offer') {
          const offer = item as Offer & { itemType: 'offer' };
          return (
            <Card key={`offer-${offer.id}`} className="bg-card border-border hover:border-secondary transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="font-mono text-xs">
                        ID: {offer.id}
                      </Badge>
                      <Badge variant={offer.offer_type === 'buy' ? 'default' : 'secondary'}>
                        {offer.offer_type === 'buy' ? 'Покупка' : 'Продажа'}
                      </Badge>
                      <Badge variant={offer.status === 'active' ? 'default' : offer.status === 'completed' ? 'outline' : 'secondary'}>
                        {offer.status === 'active' ? 'Активно' : offer.status === 'completed' ? 'Завершено' : 'Приостановлено'}
                      </Badge>
                      {offer.reserved_by && (
                        <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/30">
                          Зарезервировано
                        </Badge>
                      )}
                    </div>
                    <div className="mb-3">
                      <p className="text-2xl font-bold">
                        {offer.amount.toLocaleString()} USDT
                      </p>
                      <p className="text-lg text-muted-foreground">
                        {offer.rate.toLocaleString()} ₽ за 1 USDT = <span className="text-accent font-bold">{(offer.amount * offer.rate).toLocaleString()} ₽</span>
                      </p>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                        <p className="text-xs font-semibold text-blue-600 mb-2">👤 Создатель объявления</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                          <div>
                            <p className="text-muted-foreground text-xs">Имя</p>
                            <p className="font-semibold">{offer.username}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Телефон</p>
                            <p className="font-semibold">{offer.phone}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs">Email</p>
                            <p className="font-semibold text-xs break-all">{offer.email || '—'}</p>
                          </div>
                        </div>
                      </div>

                      {offer.reservations && offer.reservations.length > 0 && (
                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                          <p className="text-xs font-semibold text-orange-600 mb-2">📋 Заявки ({offer.reservations.length})</p>
                          <div className="space-y-2">
                            {offer.reservations.map((res, idx) => (
                              <div key={idx} className="bg-background/50 rounded p-3 text-sm border border-border">
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-2">
                                  <div>
                                    <p className="text-muted-foreground text-xs">Имя</p>
                                    <p className="font-semibold">{res.buyer_name}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground text-xs">Телефон</p>
                                    <p className="font-semibold">{res.buyer_phone || '—'}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground text-xs">Email</p>
                                    <p className="font-semibold text-xs break-all">{res.buyer_email || '—'}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground text-xs">Время</p>
                                    <p className="font-semibold">{res.meeting_time}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground text-xs">Статус</p>
                                    <Badge variant={res.status === 'confirmed' ? 'default' : res.status === 'rejected' ? 'destructive' : 'secondary'} className="text-xs">
                                      {res.status === 'confirmed' ? '✅ Принято' : res.status === 'rejected' ? '❌ Отклонено' : '⏰ Ожидание'}
                                    </Badge>
                                  </div>
                                </div>
                                {res.status === 'confirmed' && (
                                  <Button
                                    size="sm"
                                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                                    onClick={() => onCompleteOffer(offer.id)}
                                  >
                                    <Icon name="CheckCircle2" className="mr-2" size={14} />
                                    Завершить сделку с {res.buyer_name}
                                  </Button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground">
                        <p>Встреча: {offer.meeting_time}{offer.meeting_time_end ? ` — ${offer.meeting_time_end}` : ''}</p>
                        <p>Создано: {new Date(offer.created_at).toLocaleString('ru-RU')}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4 w-full md:w-auto md:min-w-[160px] md:max-w-[200px]">
                    {offer.status !== 'completed' && (
                      <Button
                        size="sm"
                        variant={offer.status === 'active' ? 'outline' : 'default'}
                        onClick={() => onToggleStatus(offer.id, offer.status)}
                        className="text-xs whitespace-nowrap"
                      >
                        <Icon name={offer.status === 'active' ? 'PauseCircle' : 'PlayCircle'} className="mr-1" size={14} />
                        {offer.status === 'active' ? 'Деактивировать' : 'Активировать'}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDelete(offer.id)}
                      className="text-xs"
                    >
                      <Icon name="Trash2" className="mr-1" size={14} />
                      Удалить
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        } else {
          const deal = item as Deal & { itemType: 'deal' };
          return (
            <Card key={`deal-${deal.id}`} className="bg-card border-border hover:border-accent transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="outline" className="font-mono text-xs">
                        ID: {deal.id}
                      </Badge>
                      <Badge variant={deal.deal_type === 'buy' ? 'default' : 'secondary'}>
                        {deal.deal_type === 'buy' ? 'Покупка' : 'Продажа'}
                      </Badge>
                      <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                        Завершено
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold mb-2">
                      {deal.amount.toLocaleString()} USDT × {deal.rate.toLocaleString()} ₽ = <span className="text-accent">{deal.total.toLocaleString()} ₽</span>
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Пользователь</p>
                        <p className="font-semibold">{deal.username} ({deal.email})</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Телефон</p>
                        <p className="font-semibold">{deal.phone}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Партнёр</p>
                        <p className="font-semibold">{deal.partner_name}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Создана</p>
                        <p className="font-semibold">{new Date(deal.created_at).toLocaleString('ru-RU')}</p>
                      </div>
                    </div>
                  </div>
                  {deal.status !== 'completed' && (
                    <Button
                      onClick={() => onCompleteDeal(deal.id)}
                      className="bg-green-600 hover:bg-green-700 text-white ml-4"
                    >
                      <Icon name="CheckCircle" className="mr-2" size={16} />
                      Завершить
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        }
      })}
        </div>
      )}
    </div>
  );
};

export default DealsOffersTab;