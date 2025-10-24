import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { User, Offer, Deal } from './types';

interface UsersTabProps {
  users: User[];
  offers: Offer[];
  deals: Deal[];
  onToggleBlock: (userId: number, currentBlocked: boolean) => void;
  onFilteredUsersChange: (users: User[]) => void;
}

const UsersTab = ({ users, offers, deals, onToggleBlock, onFilteredUsersChange }: UsersTabProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const getUserStats = (userId: number) => {
    const userDeals = deals.filter(d => d.user_id === userId);
    const userOffers = offers.filter(o => o.user_id === userId);
    
    const completedDeals = userDeals.filter(d => d.status === 'completed');
    const totalVolume = completedDeals.reduce((sum, d) => sum + d.total, 0);
    
    const buyDeals = completedDeals.filter(d => d.deal_type === 'buy');
    const sellDeals = completedDeals.filter(d => d.deal_type === 'sell');
    
    const buyVolume = buyDeals.reduce((sum, d) => sum + d.total, 0);
    const sellVolume = sellDeals.reduce((sum, d) => sum + d.total, 0);
    
    const activeOffers = userOffers.filter(o => o.status === 'active').length;

    return {
      totalDeals: userDeals.length,
      completedDeals: completedDeals.length,
      totalVolume,
      buyVolume,
      sellVolume,
      buyDealsCount: buyDeals.length,
      sellDealsCount: sellDeals.length,
      activeOffers,
      totalOffers: userOffers.length
    };
  };

  let filteredUsers = users;
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredUsers = users.filter(user => 
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query) ||
      user.phone?.toLowerCase().includes(query)
    );
  }

  useEffect(() => {
    onFilteredUsersChange(filteredUsers);
  }, [searchQuery, users]);

  if (users.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-12 text-center">
          <Icon name="Inbox" size={48} className="mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Пользователей пока нет</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Icon name="Search" size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Поиск по имени, email, телефону..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary text-foreground"
        />
      </div>

      {filteredUsers.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="p-12 text-center">
            <Icon name="Search" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Ничего не найдено</p>
          </CardContent>
        </Card>
      ) : (
        filteredUsers.map(user => {
          const stats = getUserStats(user.id);
        return (
          <Card key={user.id} className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-bold">{user.name}</h3>
                    {user.blocked && (
                      <Badge variant="destructive">Заблокирован</Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-semibold">{user.email}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Телефон</p>
                      <p className="font-semibold">{user.phone}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Регистрация</p>
                      <p className="font-semibold">
                        {new Date(user.created_at).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={user.blocked ? 'default' : 'destructive'}
                  onClick={() => onToggleBlock(user.id, user.blocked || false)}
                  className="ml-4"
                >
                  <Icon name={user.blocked ? 'Unlock' : 'Lock'} className="mr-2" size={16} />
                  {user.blocked ? 'Разблокировать' : 'Заблокировать'}
                </Button>
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-sm font-semibold text-muted-foreground mb-3">Статистика активности</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-secondary/10 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Завершённых сделок</p>
                    <p className="text-2xl font-bold text-secondary">{stats.completedDeals}</p>
                    <p className="text-xs text-muted-foreground">Всего: {stats.totalDeals}</p>
                  </div>
                  <div className="bg-accent/10 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Общий объём</p>
                    <p className="text-2xl font-bold text-accent">{stats.totalVolume.toLocaleString('ru-RU')} ₽</p>
                    <p className="text-xs text-muted-foreground">За все сделки</p>
                  </div>
                  <div className="bg-green-500/10 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Покупка</p>
                    <p className="text-lg font-bold text-green-500">{stats.buyVolume.toLocaleString('ru-RU')} ₽</p>
                    <p className="text-xs text-muted-foreground">Сделок: {stats.buyDealsCount}</p>
                  </div>
                  <div className="bg-red-500/10 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Продажа</p>
                    <p className="text-lg font-bold text-red-500">{stats.sellVolume.toLocaleString('ru-RU')} ₽</p>
                    <p className="text-xs text-muted-foreground">Сделок: {stats.sellDealsCount}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div className="bg-blue-500/10 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Активных объявлений</p>
                    <p className="text-xl font-bold text-blue-500">{stats.activeOffers}</p>
                    <p className="text-xs text-muted-foreground">Всего создано: {stats.totalOffers}</p>
                  </div>
                  <div className="bg-purple-500/10 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-1">Средний чек</p>
                    <p className="text-xl font-bold text-purple-500">
                      {stats.completedDeals > 0 
                        ? Math.round(stats.totalVolume / stats.completedDeals).toLocaleString('ru-RU') 
                        : 0} ₽
                    </p>
                    <p className="text-xs text-muted-foreground">На одну сделку</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })
      )}
    </div>
  );
};

export default UsersTab;