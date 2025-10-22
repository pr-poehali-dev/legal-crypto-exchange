import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Deal } from './types';

interface DealsTabProps {
  deals: Deal[];
  onCompleteDeal: (dealId: number) => void;
}

const DealsTab = ({ deals, onCompleteDeal }: DealsTabProps) => {
  if (deals.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-12 text-center">
          <Icon name="Inbox" size={48} className="mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Сделок пока нет</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {deals.map((deal) => (
        <Card key={deal.id} className="bg-card border-border hover:border-secondary transition-colors">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={deal.deal_type === 'buy' ? 'default' : 'secondary'}>
                    {deal.deal_type === 'buy' ? 'Покупка' : 'Продажа'} USDT
                  </Badge>
                  <Badge variant={deal.status === 'completed' ? 'default' : 'outline'}>
                    {deal.status === 'completed' ? 'Завершена' : deal.status === 'pending' ? 'В процессе' : 'Отменена'}
                  </Badge>
                </div>
                <p className="text-2xl font-bold text-foreground mb-2">
                  {deal.amount.toLocaleString()} USDT × {deal.rate.toLocaleString()} ₽ = {deal.total.toLocaleString()} ₽
                </p>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p><strong>Пользователь:</strong> {deal.username} ({deal.email})</p>
                  <p><strong>Телефон:</strong> {deal.phone}</p>
                  <p><strong>Партнёр:</strong> {deal.partner_name}</p>
                  <p><strong>Создана:</strong> {new Date(deal.created_at).toLocaleString('ru-RU')}</p>
                </div>
              </div>
              {deal.status !== 'completed' && (
                <Button
                  onClick={() => onCompleteDeal(deal.id)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Icon name="CheckCircle" className="mr-2" size={16} />
                  Завершить
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DealsTab;
