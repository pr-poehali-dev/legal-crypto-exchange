import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

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

interface Offer {
  id: number;
  offer_type: string;
  amount: number;
  rate: number;
  meeting_time: string;
  status: string;
  created_at: string;
}

interface ProfileStatsProps {
  username: string;
  phone: string;
  deals: Deal[];
  offers: Offer[];
}

const ProfileStats = ({ username, phone, deals, offers }: ProfileStatsProps) => {
  const completedDeals = deals.filter(d => d.status === 'completed');
  const totalVolume = completedDeals.reduce((sum, d) => sum + d.total, 0);
  
  const buyDeals = completedDeals.filter(d => d.deal_type === 'buy');
  const sellDeals = completedDeals.filter(d => d.deal_type === 'sell');
  
  const buyVolume = buyDeals.reduce((sum, d) => sum + d.total, 0);
  const sellVolume = sellDeals.reduce((sum, d) => sum + d.total, 0);
  
  const activeOffers = offers.filter(o => o.status === 'active').length;
  const avgDealAmount = completedDeals.length > 0 ? totalVolume / completedDeals.length : 0;

  return (
    <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Icon name="User" size={18} className="text-secondary" />
              Профиль
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 sm:space-y-3">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Имя</p>
              <p className="text-base sm:text-lg font-semibold break-words">{username}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">Телефон</p>
              <p className="text-base sm:text-lg font-semibold">{phone}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Icon name="CheckCircle" size={18} className="text-green-500" />
              Завершённых сделок
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl sm:text-4xl font-bold text-green-500">
              {completedDeals.length}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
              Всего: {deals.length}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border sm:col-span-2 lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Icon name="TrendingUp" size={18} className="text-accent" />
              Общий объём
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-accent break-words">
              {totalVolume.toLocaleString('ru-RU')} ₽
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
              Средний чек: {Math.round(avgDealAmount).toLocaleString('ru-RU')} ₽
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Icon name="ArrowUpCircle" size={18} className="text-green-500" />
              Покупка USDT
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center gap-2">
              <span className="text-xs sm:text-sm text-muted-foreground">Завершённых сделок:</span>
              <span className="text-xl sm:text-2xl font-bold">{buyDeals.length}</span>
            </div>
            <div className="flex justify-between items-center gap-2">
              <span className="text-xs sm:text-sm text-muted-foreground">Общий объём:</span>
              <span className="text-xl sm:text-2xl font-bold text-green-500 break-words">
                {buyVolume.toLocaleString('ru-RU')} ₽
              </span>
            </div>
            <div className="flex justify-between items-center gap-2">
              <span className="text-xs sm:text-sm text-muted-foreground">Активных объявлений:</span>
              <span className="text-base sm:text-lg font-semibold">
                {offers.filter(o => o.status === 'active' && o.offer_type === 'buy').length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Icon name="ArrowDownCircle" size={18} className="text-red-500" />
              Продажа USDT
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center gap-2">
              <span className="text-xs sm:text-sm text-muted-foreground">Завершённых сделок:</span>
              <span className="text-xl sm:text-2xl font-bold">{sellDeals.length}</span>
            </div>
            <div className="flex justify-between items-center gap-2">
              <span className="text-xs sm:text-sm text-muted-foreground">Общий объём:</span>
              <span className="text-xl sm:text-2xl font-bold text-red-500 break-words">
                {sellVolume.toLocaleString('ru-RU')} ₽
              </span>
            </div>
            <div className="flex justify-between items-center gap-2">
              <span className="text-xs sm:text-sm text-muted-foreground">Активных объявлений:</span>
              <span className="text-base sm:text-lg font-semibold">
                {offers.filter(o => o.status === 'active' && o.offer_type === 'sell').length}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileStats;