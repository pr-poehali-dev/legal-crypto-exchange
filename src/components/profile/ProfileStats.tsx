import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface ProfileStatsProps {
  totalDeals: number;
  completedDeals: number;
  totalVolume: number;
  username: string;
  phone: string;
}

const ProfileStats = ({ totalDeals, completedDeals, totalVolume, username, phone }: ProfileStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="User" size={20} className="text-secondary" />
            Профиль
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Имя</p>
            <p className="text-lg font-semibold">{username}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Телефон</p>
            <p className="text-lg font-semibold">{phone}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="TrendingUp" size={20} className="text-accent" />
            Статистика
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Всего сделок</p>
            <p className="text-2xl font-bold text-secondary">{totalDeals}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Завершено</p>
            <p className="text-2xl font-bold text-accent">{completedDeals}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon name="DollarSign" size={20} className="text-secondary" />
            Объем
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground">Общий объем сделок</p>
            <p className="text-2xl font-bold text-secondary">
              {totalVolume.toLocaleString('ru-RU')} ₽
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileStats;
