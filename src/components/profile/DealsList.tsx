import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';

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

interface DealsListProps {
  deals: Deal[];
  isLoading: boolean;
  formatDate: (dateString: string) => string;
}

const DealsList = ({ deals, isLoading, formatDate }: DealsListProps) => {
  const navigate = useNavigate();

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      pending: { label: 'В ожидании', className: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' },
      completed: { label: 'Завершена', className: 'bg-accent/20 text-accent border-accent/30' },
      cancelled: { label: 'Отменена', className: 'bg-red-500/20 text-red-500 border-red-500/30' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-2xl">История сделок</CardTitle>
        <CardDescription>
          Все ваши операции на платформе
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            Загрузка...
          </div>
        ) : deals.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="Inbox" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Пока нет сделок</p>
            <Button 
              onClick={() => navigate('/#offers')} 
              className="mt-4 bg-secondary text-primary hover:bg-secondary/90"
            >
              Посмотреть объявления
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {deals.map((deal) => (
              <div 
                key={deal.id} 
                className="border border-border rounded-lg p-4 hover:border-secondary transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      deal.deal_type === 'buy' 
                        ? 'bg-accent/20' 
                        : 'bg-secondary/20'
                    }`}>
                      <Icon 
                        name={deal.deal_type === 'buy' ? 'TrendingUp' : 'TrendingDown'} 
                        size={24} 
                        className={deal.deal_type === 'buy' ? 'text-accent' : 'text-secondary'}
                      />
                    </div>
                    <div>
                      <p className="font-semibold text-lg">
                        {deal.deal_type === 'buy' ? 'Покупка' : 'Продажа'} USDT
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(deal.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground">Сумма</p>
                      <p className="font-bold">{deal.amount.toLocaleString('ru-RU')} USDT</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Курс</p>
                      <p className="font-bold">{deal.rate.toFixed(2)} ₽</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Итого</p>
                      <p className="font-bold text-secondary">{deal.total.toLocaleString('ru-RU')} ₽</p>
                    </div>
                    <div>
                      {getStatusBadge(deal.status)}
                    </div>
                  </div>
                </div>
                {deal.partner_name && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                      Партнёр: <span className="text-foreground font-medium">{deal.partner_name}</span>
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DealsList;
