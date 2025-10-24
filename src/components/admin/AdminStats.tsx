import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { User, Offer, Deal } from './types';
import PeriodFilter from '@/components/ui/period-filter';
import func2url from '../../../backend/func2url.json';

interface AdminStatsProps {
  users: User[];
  offers: Offer[];
  deals: Deal[];
}

interface GlobalStatistics {
  totalUsers: number;
  blockedUsers: number;
  totalOffers: number;
  activeOffers: number;
  totalDeals: number;
  completedDeals: number;
  totalVolume: number;
  buyDeals: number;
  buyVolume: number;
  sellDeals: number;
  sellVolume: number;
}

const AdminStats = ({ users, offers, deals }: AdminStatsProps) => {
  const [period, setPeriod] = useState('all_time');
  const [statistics, setStatistics] = useState<GlobalStatistics | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStatistics('all_time');
  }, []);

  const fetchStatistics = async (selectedPeriod: string, startDate?: string, endDate?: string) => {
    setLoading(true);
    try {
      let url = `${func2url['get-statistics']}?period=${selectedPeriod}`;
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
    totalUsers: users.length,
    blockedUsers: users.filter(u => u.blocked).length,
    totalOffers: offers.length,
    activeOffers: offers.filter(o => o.status === 'active').length,
    totalDeals: deals.length,
    completedDeals: 0,
    totalVolume: 0,
    buyDeals: 0,
    buyVolume: 0,
    sellDeals: 0,
    sellVolume: 0
  };

  const avgDealAmount = stats.completedDeals > 0 ? stats.totalVolume / stats.completedDeals : 0;

  return (
    <div className="space-y-6 mb-8">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Статистика платформы</h2>
        <PeriodFilter value={period} onPeriodChange={handlePeriodChange} />
      </div>

      {loading && (
        <div className="text-center py-4 text-muted-foreground">
          Загрузка статистики...
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Icon name="Users" size={20} className="text-secondary" />
              Пользователей
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-secondary">{stats.totalUsers}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Заблокировано: {stats.blockedUsers}
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
            <p className="text-4xl font-bold text-secondary">{stats.totalOffers}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Активных: {stats.activeOffers}
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
              {stats.completedDeals}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Всего операций: {stats.totalDeals}
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
            <p className="font-bold text-accent text-2xl">
              {stats.totalVolume.toLocaleString('ru-RU')} ₽
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
              <span className="text-2xl font-bold">{stats.buyDeals}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Общий объём:</span>
              <span className="text-2xl font-bold text-green-500">
                {stats.buyVolume.toLocaleString('ru-RU')} ₽
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
              <span className="text-2xl font-bold">{stats.sellDeals}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Общий объём:</span>
              <span className="text-2xl font-bold text-red-500">
                {stats.sellVolume.toLocaleString('ru-RU')} ₽
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminStats;