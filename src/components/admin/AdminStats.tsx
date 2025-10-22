import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { User, Offer, Deal } from './types';

interface AdminStatsProps {
  users: User[];
  offers: Offer[];
  deals: Deal[];
}

const AdminStats = ({ users, offers, deals }: AdminStatsProps) => {
  const completedDeals = deals.filter(d => d.status === 'completed');
  const completedOffers = offers.filter(o => o.status === 'completed');
  const totalCompletedCount = completedDeals.length + completedOffers.length;
  
  const dealsVolume = completedDeals.reduce((sum, d) => sum + d.total, 0);
  const offersVolume = completedOffers.reduce((sum, o) => sum + (o.amount * o.rate), 0);
  const totalVolume = dealsVolume + offersVolume;
  
  const activeOffers = offers.filter(o => o.status === 'active');
  const blockedUsers = users.filter(u => u.blocked);
  
  const buyDeals = completedDeals.filter(d => d.deal_type === 'buy');
  const sellDeals = completedDeals.filter(d => d.deal_type === 'sell');
  const buyOffers = completedOffers.filter(o => o.offer_type === 'buy');
  const sellOffers = completedOffers.filter(o => o.offer_type === 'sell');
  
  const avgDealAmount = totalCompletedCount > 0 
    ? totalVolume / totalCompletedCount 
    : 0;

  return (
    <div className="space-y-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Icon name="Users" size={20} className="text-secondary" />
              Пользователей
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-secondary">{users.length}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Заблокировано: {blockedUsers.length}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Icon name="MessageSquare" size={20} className="text-secondary" />
              Объявлений
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-secondary">{offers.length}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Активных: {activeOffers.length}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Icon name="CheckCircle" size={20} className="text-green-500" />
              Завершённых сделок
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-500">
              {totalCompletedCount}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Всего операций: {deals.length + offers.length}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Icon name="TrendingUp" size={20} className="text-accent" />
              Общий объём
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-accent">
              {totalVolume.toLocaleString('ru-RU')} ₽
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Средняя сделка: {Math.round(avgDealAmount).toLocaleString('ru-RU')} ₽
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Icon name="ArrowUpCircle" size={20} className="text-green-500" />
              Покупка USDT
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Завершённых сделок:</span>
              <span className="text-2xl font-bold">{buyDeals.length + buyOffers.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Общий объём:</span>
              <span className="text-2xl font-bold text-green-500">
                {(buyDeals.reduce((sum, d) => sum + d.total, 0) + buyOffers.reduce((sum, o) => sum + (o.amount * o.rate), 0)).toLocaleString('ru-RU')} ₽
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Активных объявлений:</span>
              <span className="text-lg font-semibold">
                {offers.filter(o => o.status === 'active' && o.offer_type === 'buy').length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Icon name="ArrowDownCircle" size={20} className="text-red-500" />
              Продажа USDT
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Завершённых сделок:</span>
              <span className="text-2xl font-bold">{sellDeals.length + sellOffers.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Общий объём:</span>
              <span className="text-2xl font-bold text-red-500">
                {(sellDeals.reduce((sum, d) => sum + d.total, 0) + sellOffers.reduce((sum, o) => sum + (o.amount * o.rate), 0)).toLocaleString('ru-RU')} ₽
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Активных объявлений:</span>
              <span className="text-lg font-semibold">
                {offers.filter(o => o.status === 'active' && o.offer_type === 'sell').length}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminStats;