import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';
import Navigation from '@/components/sections/Navigation';

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

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [offerType, setOfferType] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      navigate('/');
      return;
    }
    
    const userData = JSON.parse(savedUser);
    setUser(userData);
    
    loadDeals(userData.id);
  }, [navigate]);

  const loadDeals = async (userId: number) => {
    try {
      const response = await fetch(`https://functions.poehali.dev/2b464d39-4017-4dda-aff5-982683e83257?user_id=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setDeals(data.deals);
      }
    } catch (error) {
      console.error('Failed to load deals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      pending: { label: 'В ожидании', className: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30' },
      completed: { label: 'Завершена', className: 'bg-accent/20 text-accent border-accent/30' },
      cancelled: { label: 'Отменена', className: 'bg-red-500/20 text-red-500 border-red-500/30' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCreateOffer = async () => {
    if (!amount || !rate || !meetingTime) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch('https://functions.poehali.dev/cc03f400-dfb5-45bc-a27d-f18787a96d3e', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          offer_type: offerType,
          amount: parseFloat(amount),
          rate: parseFloat(rate),
          meeting_time: meetingTime,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Успешно!',
          description: 'Объявление создано',
        });
        setIsCreateDialogOpen(false);
        setAmount('');
        setRate('');
        setMeetingTime('');
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось создать объявление',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать объявление',
        variant: 'destructive',
      });
    }
  };

  const completedDeals = deals.filter(d => d.status === 'completed').length;
  const totalVolume = deals
    .filter(d => d.status === 'completed')
    .reduce((sum, d) => sum + d.total, 0);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Личный кабинет</h1>
              <p className="text-muted-foreground">Управление профилем и история сделок</p>
            </div>
            <div className="flex gap-3">
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-secondary text-primary hover:bg-secondary/90">
                    <Icon name="Plus" className="mr-2" size={20} />
                    Создать объявление
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card">
                  <DialogHeader>
                    <DialogTitle className="text-2xl">Новое объявление</DialogTitle>
                    <DialogDescription>
                      Заполните данные для создания объявления
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="offer-type">Тип объявления</Label>
                      <Select value={offerType} onValueChange={(value: 'buy' | 'sell') => setOfferType(value)}>
                        <SelectTrigger id="offer-type" className="bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="buy">Покупка USDT</SelectItem>
                          <SelectItem value="sell">Продажа USDT</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="amount">Сумма (USDT)</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="Например: 1000"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="bg-background"
                      />
                    </div>
                    <div>
                      <Label htmlFor="rate">Курс (₽ за 1 USDT)</Label>
                      <Input
                        id="rate"
                        type="number"
                        step="0.01"
                        placeholder="Например: 95.50"
                        value={rate}
                        onChange={(e) => setRate(e.target.value)}
                        className="bg-background"
                      />
                    </div>
                    <div>
                      <Label htmlFor="meeting-time">Удобное время для встречи</Label>
                      <Input
                        id="meeting-time"
                        type="text"
                        placeholder="Например: Сегодня, 18:00"
                        value={meetingTime}
                        onChange={(e) => setMeetingTime(e.target.value)}
                        className="bg-background"
                      />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={handleCreateOffer}
                        className="flex-1 bg-secondary text-primary hover:bg-secondary/90"
                      >
                        Создать
                      </Button>
                      <Button
                        onClick={() => setIsCreateDialogOpen(false)}
                        variant="outline"
                        className="flex-1 border-secondary"
                      >
                        Отмена
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button onClick={() => navigate('/')} variant="outline" className="border-secondary">
                <Icon name="ArrowLeft" className="mr-2" size={20} />
                На главную
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
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
                  <p className="text-2xl font-bold text-secondary">{deals.length}</p>
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

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-2xl">История сделок</CardTitle>
              <CardDescription>
                Все ваши операции на платформе
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12 text-muted-foreground">
                  Загрузка...
                </div>
              ) : deals.length === 0 ? (
                <div className="text-center py-12">
                  <Icon name="Inbox" size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Пока нет сделок</p>
                  <Button 
                    onClick={() => navigate('/#offers')} 
                    className="mt-4 bg-secondary text-primary hover:bg-secondary/90"
                  >
                    Посмотреть объявления
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {deals.map((deal) => (
                    <div 
                      key={deal.id} 
                      className="border border-border rounded-lg p-4 hover:border-secondary transition-all"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            deal.deal_type === 'buy' 
                              ? 'bg-accent/20' 
                              : 'bg-secondary/20'
                          }`}>
                            <Icon 
                              name={deal.deal_type === 'buy' ? 'TrendingUp' : 'TrendingDown'} 
                              size={24} 
                              className={deal.deal_type === 'buy' ? 'text-accent' : 'text-secondary'}
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-lg">
                              {deal.deal_type === 'buy' ? 'Покупка' : 'Продажа'} USDT
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(deal.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div>
                            <p className="text-sm text-muted-foreground">Сумма</p>
                            <p className="font-bold">{deal.amount.toLocaleString('ru-RU')} USDT</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Курс</p>
                            <p className="font-bold">{deal.rate.toFixed(2)} ₽</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Итого</p>
                            <p className="font-bold text-secondary">{deal.total.toLocaleString('ru-RU')} ₽</p>
                          </div>
                          <div>
                            {getStatusBadge(deal.status)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;