import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
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
  username: string;
  phone: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('offers');

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
    await Promise.all([loadUsers(), loadOffers()]);
    setIsLoading(false);
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Icon name="Users" size={20} className="text-secondary" />
                  Всего пользователей
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
                  Всего объявлений
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-secondary">{offers.length}</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Icon name="CheckCircle" size={20} className="text-accent" />
                  Активных объявлений
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-4xl font-bold text-accent">
                  {offers.filter(o => o.status === 'active').length}
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 bg-card border border-border mb-6">
              <TabsTrigger value="offers" className="data-[state=active]:bg-secondary data-[state=active]:text-primary">
                <Icon name="MessageSquare" className="mr-2" size={20} />
                Объявления
              </TabsTrigger>
              <TabsTrigger value="users" className="data-[state=active]:bg-secondary data-[state=active]:text-primary">
                <Icon name="Users" className="mr-2" size={20} />
                Пользователи
              </TabsTrigger>
            </TabsList>

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
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Имя</p>
                          <p className="font-semibold">{user.name}</p>
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