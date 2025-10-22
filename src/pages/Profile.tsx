import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/sections/Navigation';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileStats from '@/components/profile/ProfileStats';
import CreateOfferDialog from '@/components/profile/CreateOfferDialog';
import OffersList from '@/components/profile/OffersList';
import DealsList from '@/components/profile/DealsList';

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

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [offerType, setOfferType] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState('');
  const [meetingHour, setMeetingHour] = useState('');
  const [meetingMinute, setMeetingMinute] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      navigate('/');
      return;
    }
    
    const userData = JSON.parse(savedUser);
    setUser(userData);
    
    loadDeals(userData.id);
    loadOffers(userData.id);
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

  const loadOffers = async (userId: number) => {
    try {
      const response = await fetch(`https://functions.poehali.dev/ad8e0859-d6b1-4dde-8da7-2b137a4c9abb?user_id=${userId}`);
      const data = await response.json();
      
      if (data.success) {
        setOffers(data.offers);
      }
    } catch (error) {
      console.error('Failed to load offers:', error);
    }
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
    if (!amount || !rate || !meetingHour || !meetingMinute) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive',
      });
      return;
    }

    const fullMeetingTime = `${meetingHour}:${meetingMinute}`;

    try {
      const response = await fetch('https://functions.poehali.dev/cc03f400-dfb5-45bc-a27d-f18787a96d3e', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          offer_type: offerType,
          amount: parseFloat(amount),
          rate: parseFloat(rate),
          meeting_time: fullMeetingTime,
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
        setMeetingHour('');
        setMeetingMinute('');
        loadOffers(user.id);
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

  const handleUpdateOfferStatus = async (offerId: number, status: string) => {
    try {
      const response = await fetch('https://functions.poehali.dev/716426cb-1d05-4858-a5f1-4d46123b5470', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offer_id: offerId, status }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Успешно!',
          description: status === 'active' ? 'Объявление активировано' : status === 'inactive' ? 'Объявление деактивировано' : 'Объявление завершено',
        });
        loadOffers(user.id);
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить статус',
        variant: 'destructive',
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
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
            <ProfileHeader onLogout={handleLogout} />
            <CreateOfferDialog
              isOpen={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
              offerType={offerType}
              setOfferType={setOfferType}
              amount={amount}
              setAmount={setAmount}
              rate={rate}
              setRate={setRate}
              meetingHour={meetingHour}
              setMeetingHour={setMeetingHour}
              meetingMinute={meetingMinute}
              setMeetingMinute={setMeetingMinute}
              onSubmit={handleCreateOffer}
            />
          </div>

          <ProfileStats
            totalDeals={deals.length}
            completedDeals={completedDeals}
            totalVolume={totalVolume}
            username={user.username}
            phone={user.phone}
          />

          <OffersList
            offers={offers}
            onUpdateStatus={handleUpdateOfferStatus}
            formatDate={formatDate}
          />

          <DealsList
            deals={deals}
            isLoading={isLoading}
            formatDate={formatDate}
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;