import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Offer {
  id: number;
  offer_type: string;
  amount: number;
  rate: number;
  meeting_time: string;
  status: string;
  created_at: string;
  reserved_by?: number;
  reserved_at?: string;
  reserved_by_username?: string;
  owner_id?: number;
  owner_username?: string;
  relation_type?: 'created' | 'reserved';
}

interface Deal {
  id: number;
  deal_type: string;
  amount: number;
  rate: number;
  total: number;
  status: string;
  partner_name: string | null;
  created_at: string;
}

interface OffersListProps {
  offers: Offer[];
  deals: Deal[];
  onUpdateStatus: (offerId: number, status: string) => void;
  onEditOffer: (offer: Offer) => void;
  onDeleteOffer: (offerId: number) => void;
  onCancelReservation: (offerId: number) => void;
  formatDate: (dateString: string) => string;
}

const OffersList = ({ offers, deals, onUpdateStatus, onEditOffer, onDeleteOffer, onCancelReservation, formatDate }: OffersListProps) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');

  type CombinedItem = (Offer & { itemType: 'offer' }) | (Deal & { itemType: 'deal' });
  
  let combinedItems: CombinedItem[] = [
    ...offers.map(o => ({ ...o, itemType: 'offer' as const })),
    ...deals.map(d => ({ ...d, itemType: 'deal' as const }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  if (filterStatus === 'reserved') {
    combinedItems = combinedItems.filter(item => 
      item.itemType === 'offer' && 'relation_type' in item && item.relation_type === 'reserved'
    );
  } else if (filterStatus !== 'all') {
    combinedItems = combinedItems.filter(item => item.status === filterStatus);
  }

  const getOfferStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      active: { label: 'Активно', className: 'bg-accent/20 text-accent border-accent/30' },
      inactive: { label: 'Неактивно', className: 'bg-muted-foreground/20 text-muted-foreground border-muted-foreground/30' },
      completed: { label: 'Завершено', className: 'bg-secondary/20 text-secondary border-secondary/30' }
    };
    
    const config = statusConfig[status] || statusConfig.active;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <Card className="bg-card border-border mb-6">
      <CardHeader>
        <CardTitle className="text-2xl">Мои объявления</CardTitle>
        <CardDescription>
          Управление вашими объявлениями
        </CardDescription>
        <Tabs value={filterStatus} onValueChange={setFilterStatus} className="mt-4">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-2">
            <TabsTrigger value="all" className="text-xs md:text-sm">Все</TabsTrigger>
            <TabsTrigger value="active" className="text-xs md:text-sm">Активные</TabsTrigger>
            <TabsTrigger value="reserved" className="text-xs md:text-sm col-span-2 md:col-span-1">Зарезервированные</TabsTrigger>
            <TabsTrigger value="inactive" className="text-xs md:text-sm col-span-2 md:col-span-1">Приостановленные</TabsTrigger>
            <TabsTrigger value="completed" className="text-xs md:text-sm col-span-2 md:col-span-1">Завершенные</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {combinedItems.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="FileText" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">{filterStatus === 'all' ? 'Пока нет объявлений' : 'Нет объявлений с таким статусом'}</p>
            <p className="text-sm text-muted-foreground mt-2">Создайте первое объявление</p>
          </div>
        ) : (
          <div className="space-y-4">
            {combinedItems.map((item) => {
              if (item.itemType === 'deal') {
                const deal = item as Deal & { itemType: 'deal' };
                return (
                  <div
                    key={`deal-${deal.id}`}
                    className="border border-border rounded-lg p-4 bg-green-500/5"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-green-500/20">
                          <Icon
                            name="CheckCircle"
                            size={24}
                            className="text-green-500"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <p className="font-semibold text-lg break-words">
                              {deal.deal_type === 'buy' ? 'Куплю' : 'Продам'} {deal.amount.toLocaleString('ru-RU')} USDT
                            </p>
                            <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                              Завершено
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Курс: {deal.rate.toFixed(2)} ₽ • Итого: {deal.total.toLocaleString('ru-RU')} ₽
                          </p>
                          {deal.partner_name && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Партнёр: {deal.partner_name}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            Создано: {formatDate(deal.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
              
              const offer = item as Offer & { itemType: 'offer' };
              
              // Определяем реальный тип операции для текущего пользователя
              let userDealType: 'buy' | 'sell';
              if (offer.relation_type === 'created') {
                // Я создал объявление - показываем как есть
                userDealType = offer.offer_type as 'buy' | 'sell';
              } else {
                // Я зарезервировал - инвертируем
                userDealType = offer.offer_type === 'buy' ? 'sell' : 'buy';
              }
              
              return (
              <div 
                key={offer.id} 
                className="border border-border rounded-lg p-4 hover:border-secondary transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      userDealType === 'buy' 
                        ? 'bg-accent/20' 
                        : 'bg-secondary/20'
                    }`}>
                      <Icon 
                        name={userDealType === 'buy' ? 'ShoppingCart' : 'Wallet'} 
                        size={24} 
                        className={userDealType === 'buy' ? 'text-accent' : 'text-secondary'}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="font-semibold text-lg break-words">
                          {userDealType === 'buy' ? 'Куплю' : 'Продам'} {offer.amount.toLocaleString('ru-RU')} USDT
                        </p>
                        {getOfferStatusBadge(offer.status)}
                        {offer.reserved_by && (
                          <Badge className="bg-orange-500/20 text-orange-500 border-orange-500/30">
                            Зарезервировано
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Курс: {offer.rate.toFixed(2)} ₽ • {offer.meeting_time}
                      </p>
                      {offer.relation_type === 'reserved' && offer.owner_username && (
                        <p className="text-sm text-blue-500 mt-1">
                          Владелец: {offer.owner_username}
                        </p>
                      )}
                      {offer.relation_type === 'created' && offer.reserved_by && offer.reserved_by_username && (
                        <p className="text-sm text-orange-500 mt-1">
                          Забронировал: {offer.reserved_by_username}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Создано: {formatDate(offer.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {offer.relation_type === 'reserved' ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onCancelReservation(offer.id)}
                        className="border-blue-500 text-blue-500 hover:bg-blue-500/10"
                      >
                        <Icon name="X" size={16} className="mr-1" />
                        Отказаться
                      </Button>
                    ) : offer.reserved_by ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onCancelReservation(offer.id)}
                        className="border-orange-500 text-orange-500 hover:bg-orange-500/10"
                      >
                        <Icon name="X" size={16} className="mr-1" />
                        Отменить резервацию
                      </Button>
                    ) : (
                      <>
                        {offer.status === 'active' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onUpdateStatus(offer.id, 'inactive')}
                            className="border-secondary text-secondary hover:bg-secondary/10"
                          >
                            <Icon name="Pause" size={16} className="mr-1" />
                            Деактивировать
                          </Button>
                        )}
                        {offer.status === 'inactive' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onUpdateStatus(offer.id, 'active')}
                            className="border-accent text-accent hover:bg-accent/10"
                          >
                            <Icon name="Play" size={16} className="mr-1" />
                            Активировать
                          </Button>
                        )}
                        {offer.status !== 'completed' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onEditOffer(offer)}
                            >
                              <Icon name="Pencil" size={16} className="mr-1" />
                              Изменить
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onDeleteOffer(offer.id)}
                              className="border-destructive text-destructive hover:bg-destructive/10"
                            >
                              <Icon name="Trash2" size={16} className="mr-1" />
                              Удалить
                            </Button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OffersList;