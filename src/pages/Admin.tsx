import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  created_at: string;
  blocked?: boolean;
}

interface Offer {
  id: number;
  offer_type: string;
  amount: number;
  rate: number;
  meeting_time: string;
  status: string;
  created_at: string;
  username: string;
  phone: string;
}

interface Deal {
  id: number;
  user_id: number;
  username: string;
  email: string;
  phone: string;
  deal_type: string;
  amount: number;
  rate: number;
  total: number;
  status: string;
  partner_name: string;
  created_at: string;
  updated_at: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('deals');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      navigate('/');
      return;
    }

    const userData = JSON.parse(user);
    if (userData.email !== 'admin@kuzbassexchange.ru') {
      navigate('/');
      return;
    }

    loadData();
  }, [navigate]);

  const loadData = async () => {
    setIsLoading(true);
    await Promise.all([loadUsers(), loadOffers(), loadDeals()]);
    setIsLoading(false);
  };

  const loadDeals = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/b63444fc-5ce5-498a-8eab-6617d79ba7ee');
      const data = await response.json();
      if (data.success) {
        setDeals(data.deals || []);
      }
    } catch (error) {
      console.error('Failed to load deals:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/d95b473e-1b4b-4f75-82aa-7e0211e55839');
      const data = await response.json();
      if (data.success) {
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const loadOffers = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/24cbcabc-c4e4-496b-a820-0315a576e32e');
      const data = await response.json();
      if (data.success) {
        setOffers(data.offers || []);
      }
    } catch (error) {
      console.error('Failed to load offers:', error);
    }
  };

  const deleteOffer = async (offerId: number) => {
    if (!confirm('Удалить это объявление?')) return;

    try {
      const response = await fetch('https://functions.poehali.dev/c6a4e4a7-6edb-4a9e-a4d7-c8fb0a5e8a4f', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offer_id: offerId, status: 'deleted' })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Объявление удалено');
        loadOffers();
      } else {
        toast.error('Ошибка при удалении');
      }
    } catch (error) {
      toast.error('Ошибка при удалении');
    }
  };

  const completeDeal = async (dealId: number) => {
    if (!confirm('Завершить эту сделку?')) return;

    try {
      const response = await fetch('https://functions.poehali.dev/33e941b4-9e68-46b2-8e4a-95ce5ca9b880', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deal_id: dealId })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Сделка завершена');
        loadDeals();
      } else {
        toast.error('Ошибка при завершении сделки');
      }
    } catch (error) {
      toast.error('Ошибка при завершении сделки');
    }
  };

  const toggleUserBlock = async (userId: number, currentBlocked: boolean) => {
    const action = currentBlocked ? 'разблокировать' : 'заблокировать';
    if (!confirm(`Вы уверены что хотите ${action} пользователя?`)) return;

    try {
      const response = await fetch('https://functions.poehali.dev/62daff60-6649-4ae2-84a1-d891fa4799bc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, blocked: !currentBlocked })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(data.message);
        loadUsers();
      } else {
        toast.error('Ошибка при изменении статуса');
      }
    } catch (error) {
      toast.error('Ошибка при изменении статуса');
    }
  };

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();

    // Экспорт сделок
    const dealsData = deals.map(deal => ({
      'ID': deal.id,
      'Пользователь': deal.username,
      'Email': deal.email,
      'Телефон': deal.phone,
      'Тип': deal.deal_type === 'buy' ? 'Покупка' : 'Продажа',
      'Количество USDT': deal.amount,
      'Курс ₽': deal.rate,
      'Итого ₽': deal.total,
      'Статус': deal.status === 'completed' ? 'Завершена' : deal.status === 'pending' ? 'В процессе' : 'Отменена',
      'Партнёр': deal.partner_name,
      'Дата создания': new Date(deal.created_at).toLocaleString('ru-RU'),
      'Дата обновления': new Date(deal.updated_at).toLocaleString('ru-RU')
    }));
    const dealsSheet = XLSX.utils.json_to_sheet(dealsData);
    XLSX.utils.book_append_sheet(workbook, dealsSheet, 'Сделки');

    // Экспорт объявлений
    const offersData = offers.map(offer => ({
      'ID': offer.id,
      'Пользователь': offer.username,
      'Телефон': offer.phone,
      'Тип': offer.offer_type === 'buy' ? 'Покупка' : 'Продажа',
      'Количество USDT': offer.amount,
      'Курс ₽': offer.rate,
      'Время встречи': offer.meeting_time,
      'Статус': offer.status === 'active' ? 'Активно' : 'Неактивно',
      'Дата создания': new Date(offer.created_at).toLocaleString('ru-RU')
    }));
    const offersSheet = XLSX.utils.json_to_sheet(offersData);
    XLSX.utils.book_append_sheet(workbook, offersSheet, 'Объявления');

    // Экспорт пользователей
    const usersData = users.map(user => ({
      'ID': user.id,
      'Имя': user.name,
      'Email': user.email,
      'Телефон': user.phone,
      'Статус': user.blocked ? 'Заблокирован' : 'Активен',
      'Дата регистрации': new Date(user.created_at).toLocaleString('ru-RU')
    }));
    const usersSheet = XLSX.utils.json_to_sheet(usersData);
    XLSX.utils.book_append_sheet(workbook, usersSheet, 'Пользователи');

    // Статистика
    const statsData = [
      { 'Показатель': 'Всего пользователей', 'Значение': users.length },
      { 'Показатель': 'Всего объявлений', 'Значение': offers.length },
      { 'Показатель': 'Активных объявлений', 'Значение': offers.filter(o => o.status === 'active').length },
      { 'Показатель': 'Всего сделок', 'Значение': deals.length },
      { 'Показатель': 'Завершённых сделок', 'Значение': deals.filter(d => d.status === 'completed').length },
      { 'Показатель': 'Общий объём (₽)', 'Значение': deals.filter(d => d.status === 'completed').reduce((sum, d) => sum + d.total, 0) }
    ];
    const statsSheet = XLSX.utils.json_to_sheet(statsData);
    XLSX.utils.book_append_sheet(workbook, statsSheet, 'Статистика');

    const fileName = `KuzbassExchange_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    toast.success('Данные экспортированы в Excel');
  };

  const toggleOfferStatus = async (offerId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

    try {
      const response = await fetch('https://functions.poehali.dev/c6a4e4a7-6edb-4a9e-a4d7-c8fb0a5e8a4f', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offer_id: offerId, status: newStatus })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`Объявление ${newStatus === 'active' ? 'активировано' : 'деактивировано'}`);
        loadOffers();
      } else {
        toast.error('Ошибка при изменении статуса');
      }
    } catch (error) {
      toast.error('Ошибка при изменении статуса');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-secondary to-accent rounded-lg flex items-center justify-center">
                <Icon name="Shield" size={24} className="text-primary" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Админ-панель</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={exportToExcel} className="bg-green-600 hover:bg-green-700 text-white">
                <Icon name="Download" className="mr-2" size={16} />
                Экспорт в Excel
              </Button>
              <Button onClick={() => navigate('/')} variant="outline">
                <Icon name="Home" className="mr-2" size={16} />
                На главную
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
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

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 bg-card border border-border mb-6">
              <TabsTrigger value="deals" className="data-[state=active]:bg-secondary data-[state=active]:text-primary">
                <Icon name="Handshake" className="mr-2" size={20} />
                Сделки
              </TabsTrigger>
              <TabsTrigger value="offers" className="data-[state=active]:bg-secondary data-[state=active]:text-primary">
                <Icon name="MessageSquare" className="mr-2" size={20} />
                Объявления
              </TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-secondary data-[state=active]:text-primary">
                <Icon name="Users" className="mr-2" size={20} />
                Пользователи
              </TabsTrigger>
            </TabsList>

            <TabsContent value="deals" className="space-y-4">
              {deals.length === 0 ? (
                <Card className="bg-card border-border">
                  <CardContent className="p-12 text-center">
                    <Icon name="Inbox" size={48} className="mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Сделок пока нет</p>
                  </CardContent>
                </Card>
              ) : (
                deals.map((deal) => (
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
                            onClick={() => completeDeal(deal.id)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Icon name="CheckCircle" className="mr-2" size={16} />
                            Завершить
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="offers" className="space-y-4">
              {offers.length === 0 ? (
                <Card className="bg-card border-border">
                  <CardContent className="p-12 text-center">
                    <Icon name="Inbox" size={48} className="mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Объявлений пока нет</p>
                  </CardContent>
                </Card>
              ) : (
                offers.map(offer => (
                  <Card key={offer.id} className="bg-card border-border">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <Badge variant={offer.status === 'active' ? 'default' : 'secondary'}>
                              {offer.status === 'active' ? 'Активно' : 'Неактивно'}
                            </Badge>
                            <Badge variant={offer.offer_type === 'buy' ? 'default' : 'outline'}>
                              {offer.offer_type === 'buy' ? 'Покупка' : 'Продажа'}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Пользователь</p>
                              <p className="font-semibold">{offer.username}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Сумма</p>
                              <p className="font-semibold">{offer.amount.toLocaleString('ru-RU')} USDT</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Курс</p>
                              <p className="font-semibold text-secondary">{offer.rate.toFixed(2)} ₽</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Встреча</p>
                              <p className="font-semibold">{offer.meeting_time}</p>
                            </div>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Телефон</p>
                            <p className="font-semibold">{offer.phone}</p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            variant={offer.status === 'active' ? 'outline' : 'default'}
                            onClick={() => toggleOfferStatus(offer.id, offer.status)}
                          >
                            <Icon name={offer.status === 'active' ? 'PauseCircle' : 'PlayCircle'} className="mr-2" size={16} />
                            {offer.status === 'active' ? 'Деактивировать' : 'Активировать'}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteOffer(offer.id)}
                          >
                            <Icon name="Trash2" className="mr-2" size={16} />
                            Удалить
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              {users.length === 0 ? (
                <Card className="bg-card border-border">
                  <CardContent className="p-12 text-center">
                    <Icon name="Inbox" size={48} className="mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">Пользователей пока нет</p>
                  </CardContent>
                </Card>
              ) : (
                users.map(user => (
                  <Card key={user.id} className="bg-card border-border">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                          <div>
                            <p className="text-sm text-muted-foreground">Имя</p>
                            <p className="font-semibold">{user.name}</p>
                            {user.blocked && (
                              <Badge variant="destructive" className="mt-1">Заблокирован</Badge>
                            )}
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Email</p>
                            <p className="font-semibold">{user.email}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Телефон</p>
                            <p className="font-semibold">{user.phone}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Регистрация</p>
                            <p className="font-semibold">
                              {new Date(user.created_at).toLocaleDateString('ru-RU')}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant={user.blocked ? 'default' : 'destructive'}
                          onClick={() => toggleUserBlock(user.id, user.blocked || false)}
                          className="ml-4"
                        >
                          <Icon name={user.blocked ? 'Unlock' : 'Lock'} className="mr-2" size={16} />
                          {user.blocked ? 'Разблокировать' : 'Заблокировать'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Admin;