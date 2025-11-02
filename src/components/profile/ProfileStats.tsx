import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import PeriodFilter from '@/components/ui/period-filter';
import func2url from '../../../backend/func2url.json';

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
  email?: string;
  deals: Deal[];
  offers: Offer[];
  userId: number;
}

interface Statistics {
  totalDeals: number;
  completedDeals: number;
  totalVolume: number;
  buyDeals: number;
  buyVolume: number;
  sellDeals: number;
  sellVolume: number;
  activeOffers: number;
}

const ProfileStats = ({ username, phone, email, deals, offers, userId }: ProfileStatsProps) => {
  const [period, setPeriod] = useState('all_time');
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStatistics('all_time');
  }, []);

  const fetchStatistics = async (selectedPeriod: string, startDate?: string, endDate?: string) => {
    setLoading(true);
    try {
      let url = `${func2url['get-statistics']}?period=${selectedPeriod}&user_id=${userId}`;
      if (startDate && endDate) {
        url += `&start_date=${startDate}&end_date=${endDate}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setStatistics(data.statistics);
      }
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (selectedPeriod: string, startDate?: string, endDate?: string) => {
    setPeriod(selectedPeriod);
    fetchStatistics(selectedPeriod, startDate, endDate);
  };
  const stats = statistics || {
    totalDeals: 0,
    completedDeals: 0,
    totalVolume: 0,
    buyDeals: 0,
    buyVolume: 0,
    sellDeals: 0,
    sellVolume: 0,
    activeOffers: 0
  };

  const avgDealAmount = stats.completedDeals > 0 ? stats.totalVolume / stats.completedDeals : 0;

  return (
    <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Статистика</h2>
        <PeriodFilter value={period} onPeriodChange={handlePeriodChange} />
      </div>

      {loading && (
        <div className="text-center py-4 text-muted-foreground">
          Загрузка статистики...
        </div>
      )}
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
            {email && (
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground">Почта</p>
                <p className="text-base sm:text-lg font-semibold break-words">{email}</p>
              </div>
            )}
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
              {stats.completedDeals}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 sm:mt-2">
              Всего: {stats.totalDeals}
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
              {stats.totalVolume.toLocaleString('ru-RU')} ₽
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
              <span className="text-xl sm:text-2xl font-bold">{stats.buyDeals}</span>
            </div>
            <div className="flex justify-between items-center gap-2">
              <span className="text-xs sm:text-sm text-muted-foreground">Общий объём:</span>
              <span className="text-xl sm:text-2xl font-bold text-green-500 break-words">
                {stats.buyVolume.toLocaleString('ru-RU')} ₽
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
              <span className="text-xl sm:text-2xl font-bold">{stats.sellDeals}</span>
            </div>
            <div className="flex justify-between items-center gap-2">
              <span className="text-xs sm:text-sm text-muted-foreground">Общий объём:</span>
              <span className="text-xl sm:text-2xl font-bold text-red-500 break-words">
                {stats.sellVolume.toLocaleString('ru-RU')} ₽
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileStats;