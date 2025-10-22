import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Offer } from './types';

interface OffersTabProps {
  offers: Offer[];
  onToggleStatus: (offerId: number, currentStatus: string) => void;
  onDelete: (offerId: number) => void;
}

const OffersTab = ({ offers, onToggleStatus, onDelete }: OffersTabProps) => {
  if (offers.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-12 text-center">
          <Icon name="Inbox" size={48} className="mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Объявлений пока нет</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {offers.map((offer) => (
        <Card key={offer.id} className="bg-card border-border hover:border-secondary transition-colors">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
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
              </div>
              <div className="flex flex-col gap-2">
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
      ))}
    </div>
  );
};

export default OffersTab;
