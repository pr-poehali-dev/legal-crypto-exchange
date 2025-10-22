import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Offer {
  id: number;
  offer_type: string;
  amount: number;
  rate: number;
  meeting_time: string;
  status: string;
  created_at: string;
}

interface OffersListProps {
  offers: Offer[];
  onUpdateStatus: (offerId: number, status: string) => void;
  formatDate: (dateString: string) => string;
}

const OffersList = ({ offers, onUpdateStatus, formatDate }: OffersListProps) => {
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
      </CardHeader>
      <CardContent>
        {offers.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="FileText" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Пока нет объявлений</p>
            <p className="text-sm text-muted-foreground mt-2">Создайте первое объявление</p>
          </div>
        ) : (
          <div className="space-y-4">
            {offers.map((offer) => (
              <div 
                key={offer.id} 
                className="border border-border rounded-lg p-4 hover:border-secondary transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      offer.offer_type === 'buy' 
                        ? 'bg-accent/20' 
                        : 'bg-secondary/20'
                    }`}>
                      <Icon 
                        name={offer.offer_type === 'buy' ? 'ShoppingCart' : 'Wallet'} 
                        size={24} 
                        className={offer.offer_type === 'buy' ? 'text-accent' : 'text-secondary'}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-lg">
                          {offer.offer_type === 'buy' ? 'Куплю' : 'Продам'} {offer.amount.toLocaleString('ru-RU')} USDT
                        </p>
                        {getOfferStatusBadge(offer.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Курс: {offer.rate.toFixed(2)} ₽ • {offer.meeting_time}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Создано: {formatDate(offer.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUpdateStatus(offer.id, 'completed')}
                        className="border-muted-foreground text-muted-foreground hover:bg-muted-foreground/10"
                      >
                        <Icon name="Check" size={16} className="mr-1" />
                        Завершить
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OffersList;
