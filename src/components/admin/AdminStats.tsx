import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { User, Offer, Deal } from './types';

interface AdminStatsProps {
  users: User[];
  offers: Offer[];
  deals: Deal[];
}

const AdminStats = ({ users, offers, deals }: AdminStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Icon name="Users" size={20} className="text-secondary" />
            Пользователей
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-secondary">{users.length}</p>
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
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Icon name="Handshake" size={20} className="text-accent" />
            Сделок
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-accent">{deals.length}</p>
        </CardContent>
      </Card>
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Icon name="CheckCircle" size={20} className="text-green-500" />
            Завершено
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-green-500">
            {deals.filter(d => d.status === 'completed').length}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStats;
