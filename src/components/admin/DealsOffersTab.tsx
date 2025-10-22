import { useState } from 'react';
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
}

const DealsOffersTab = ({ offers, deals, onToggleStatus, onDelete, onCompleteDeal, onCompleteOffer }: DealsOffersTabProps) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  type CombinedItem = (Offer & { itemType: 'offer' }) | (Deal & { itemType: 'deal' });
  
  let combinedItems: CombinedItem[] = [
    ...offers.map(o => ({ ...o, itemType: 'offer' as const })),
    ...deals.map(d => ({ ...d, itemType: 'deal' as const }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Filter by type (offers/deals)
  if (filterType === 'offers') {
    combinedItems = combinedItems.filter(item => item.itemType === 'offer');
  } else if (filterType === 'deals') {
    combinedItems = combinedItems.filter(item => item.itemType === 'deal');
  }

  // Filter by status
  if (filterStatus === 'reserved') {
    combinedItems = combinedItems.filter(item => 
      item.itemType === 'offer' && 'reserved_by' in item && item.reserved_by !== undefined && item.reserved_by !== null
    );
  } else if (filterStatus !== 'all') {
    combinedItems = combinedItems.filter(item => item.status === filterStatus);
  }

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Тип</h3>
              <Tabs value={filterType} onValueChange={setFilterType}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">Все</TabsTrigger>
                  <TabsTrigger value="offers">Объявления</TabsTrigger>
                  <TabsTrigger value="deals">Сделки</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div>
              <h3 className="text-sm font-medium mb-2">Статус</h3>
              <Tabs value={filterStatus} onValueChange={setFilterStatus}>
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="all">Все</TabsTrigger>
                  <TabsTrigger value="active">Активные</TabsTrigger>
                  <TabsTrigger value="reserved">Зарезервированные</TabsTrigger>
                  <TabsTrigger value="inactive">Приостановленные</TabsTrigger>
                  <TabsTrigger value="completed">Завершенные</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardContent>
      </Card>
      
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
                      <Badge className="bg-blue-500/20 text-blue-500 border-blue-500/30">
                        Объявление
                      </Badge>
                      <Badge variant={offer.offer_type === 'buy' ? 'default' : 'secondary'}>
                        {offer.offer_type === 'buy' ? 'Покупка' : 'Продажа'}
                      </Badge>
                      <Badge variant={offer.status === 'active' ? 'default' : 'outline'}>
                        {offer.status === 'active' ? 'Активно' : 'Неактивно'}
                      </Badge>
                    </div>
                    <p className="text-xl font-bold mb-2">
                      {offer.amount.toLocaleString()} USDT по {offer.rate.toLocaleString()} ₽
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Пользователь</p>
                        <p className="font-semibold">{offer.username}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Встреча</p>
                        <p className="font-semibold">{offer.meeting_time}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Телефон</p>
                        <p className="font-semibold">{offer.phone}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Создано: {new Date(offer.created_at).toLocaleString('ru-RU')}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    {offer.status !== 'completed' && (
                      <>
                        <Button
                          size="sm"
                          variant={offer.status === 'active' ? 'outline' : 'default'}
                          onClick={() => onToggleStatus(offer.id, offer.status)}
                        >
                          <Icon name={offer.status === 'active' ? 'PauseCircle' : 'PlayCircle'} className="mr-2" size={16} />
                          {offer.status === 'active' ? 'Деактивировать' : 'Активировать'}
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => onCompleteOffer(offer.id)}
                        >
                          <Icon name="CheckCircle" className="mr-2" size={16} />
                          Подтвердить сделку
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDelete(offer.id)}
                    >
                      <Icon name="Trash2" className="mr-2" size={16} />
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
                      <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                        Сделка
                      </Badge>
                      <Badge variant={deal.deal_type === 'buy' ? 'default' : 'secondary'}>
                        {deal.deal_type === 'buy' ? 'Покупка' : 'Продажа'}
                      </Badge>
                      <Badge variant={deal.status === 'completed' ? 'default' : 'outline'}>
                        {deal.status === 'completed' ? 'Завершена' : deal.status === 'pending' ? 'В процессе' : 'Отменена'}
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