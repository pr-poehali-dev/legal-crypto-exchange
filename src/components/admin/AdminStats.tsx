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
      <div className="flex justify-between items-center bg-gradient-to-r from-secondary/20 to-accent/20 p-4 rounded-lg border border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-secondary to-accent rounded-lg flex items-center justify-center">
            <Icon name="TrendingUp" size={20} className="text-primary" />
          </div>
          <h2 className="text-xl font-bold">Статистика платформы</h2>
        </div>
        <PeriodFilter value={period} onPeriodChange={handlePeriodChange} />
      </div>

      {loading && (
        <div className="text-center py-4 text-muted-foreground">
          Загрузка статистики...
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-card to-secondary/10 border-border hover:shadow-lg transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
              <Icon name="Users" size={18} className="text-secondary" />
              Пользователей
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold text-secondary mb-1">{stats.totalUsers}</p>
            <div className="flex items-center gap-2 text-sm">
              <Icon name="Ban" size={14} className="text-red-500" />
              <span className="text-muted-foreground">Заблокировано: <strong>{stats.blockedUsers}</strong></span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-blue-500/10 border-border hover:shadow-lg transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
              <Icon name="MessageSquare" size={18} className="text-blue-500" />
              Объявлений
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold text-blue-500 mb-1">{stats.totalOffers}</p>
            <div className="flex items-center gap-2 text-sm">
              <Icon name="CheckCircle" size={14} className="text-green-500" />
              <span className="text-muted-foreground">Активных: <strong>{stats.activeOffers}</strong></span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-green-500/10 border-border hover:shadow-lg transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
              <Icon name="CheckCircle" size={18} className="text-green-500" />
              Завершённых сделок
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-5xl font-bold text-green-500 mb-1">
              {stats.completedDeals}
            </p>
            <div className="flex items-center gap-2 text-sm">
              <Icon name="Activity" size={14} className="text-muted-foreground" />
              <span className="text-muted-foreground">Всего: <strong>{stats.totalDeals}</strong></span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-card to-accent/10 border-border hover:shadow-lg transition-all">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-muted-foreground">
              <Icon name="TrendingUp" size={18} className="text-accent" />
              Общий объём
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-bold text-accent text-2xl mb-1 whitespace-nowrap">
              {stats.totalVolume.toLocaleString('ru-RU')} ₽
            </p>
            <div className="flex items-center gap-2 text-sm">
              <Icon name="TrendingUp" size={14} className="text-green-500" />
              <span className="text-muted-foreground text-xs">Средняя: <strong>{Math.round(avgDealAmount).toLocaleString('ru-RU')} ₽</strong></span>
            </div>
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