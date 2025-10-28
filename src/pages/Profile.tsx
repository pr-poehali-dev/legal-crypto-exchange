import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/sections/Navigation';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileStats from '@/components/profile/ProfileStats';
import CreateOfferDialog from '@/components/profile/CreateOfferDialog';
import OffersList from '@/components/profile/OffersList';
import TelegramSettings from '@/components/profile/TelegramSettings';

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
  reserved_by?: number;
  reserved_at?: string;
  reserved_by_username?: string;
  owner_id?: number;
  owner_username?: string;
  relation_type?: 'created' | 'reserved';
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
  const [city, setCity] = useState('Москва');
  const [selectedOffices, setSelectedOffices] = useState<string[]>([]);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);

  useEffect(() => {
    const now = new Date();
    let currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    const intervals = [0, 15, 30, 45];
    let nextMinute = intervals.find(m => m >= currentMinute);
    
    if (nextMinute === undefined) {
      currentHour = currentHour + 1;
      nextMinute = 0;
    }
    
    if (currentHour < 9) {
      currentHour = 9;
      nextMinute = 0;
    } else if (currentHour > 21 || (currentHour === 21 && nextMinute > 0)) {
      currentHour = 9;
      nextMinute = 0;
    }
    
    setMeetingHour(String(currentHour).padStart(2, '0'));
    setMeetingMinute(String(nextMinute).padStart(2, '0'));
  }, []);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      navigate('/');
      return;
    }
    
    const userData = JSON.parse(savedUser);
    
    if (!userData.id) {
      toast({
        title: 'Ошибка',
        description: 'Пожалуйста, войдите заново',
        variant: 'destructive',
      });
      localStorage.removeItem('user');
      navigate('/');
      return;
    }
    
    setUser(userData);
    
    loadUserData(userData.id);
    loadDeals(userData.id);
    loadOffers(userData.id);
  }, [navigate]);

  const loadDeals = async (userId: number) => {
    try {
      const response = await fetch(`https://functions.poehali.dev/2b464d39-4017-4dda-aff5-982683e83257?user_id=${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
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

  const loadUserData = async (userId: number) => {
    try {
      const response = await fetch(`https://functions.poehali.dev/89a1066f-b5ab-4ce5-bc62-94bfd60d600b?user_id=${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.user) {
        setUser((prevUser: any) => {
          const updatedUser = { ...prevUser, telegram_id: data.user.telegram_id };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          return updatedUser;
        });
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  };

  const loadOffers = async (userId: number) => {
    try {
      const response = await fetch(`https://functions.poehali.dev/ad8e0859-d6b1-4dde-8da7-2b137a4c9abb?user_id=${userId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
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
    if (!amount || !rate || !meetingHour || !meetingMinute || !city || selectedOffices.length === 0) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive',
      });
      return;
    }

    const fullMeetingTime = `${meetingHour}:${meetingMinute}`;

    try {
      if (editingOffer) {
        const response = await fetch('https://functions.poehali.dev/706432f5-5c24-4beb-9327-0ce9f187c02f', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            offer_id: editingOffer.id,
            user_id: user.id,
            offer_type: offerType,
            amount: parseFloat(amount),
            rate: parseFloat(rate),
            meeting_time: fullMeetingTime,
            city: city,
            offices: selectedOffices,
          }),
        });

        const data = await response.json();

        if (data.success) {
          toast({
            title: 'Успешно!',
            description: 'Объявление обновлено',
          });
          setIsCreateDialogOpen(false);
          resetForm();
          loadOffers(user.id);
        } else {
          toast({
            title: 'Ошибка',
            description: data.error || 'Не удалось обновить объявление',
            variant: 'destructive',
          });
        }
      } else {
        const response = await fetch('https://functions.poehali.dev/cc03f400-dfb5-45bc-a27d-f18787a96d3e', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            offer_type: offerType,
            amount: parseFloat(amount),
            rate: parseFloat(rate),
            meeting_time: fullMeetingTime,
            city: city,
            offices: selectedOffices,
          }),
        });

        const data = await response.json();

        if (data.success) {
          toast({
            title: 'Успешно!',
            description: 'Объявление создано',
          });
          setIsCreateDialogOpen(false);
          resetForm();
          loadOffers(user.id);
        } else {
          toast({
            title: 'Ошибка',
            description: data.error || 'Не удалось создать объявление',
            variant: 'destructive',
          });
        }
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: editingOffer ? 'Не удалось обновить объявление' : 'Не удалось создать объявление',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setAmount('');
    setRate('');
    setMeetingHour('');
    setMeetingMinute('');
    setCity('Москва');
    setSelectedOffices([]);
    setEditingOffer(null);
  };

  const handleEditOffer = (offer: Offer) => {
    setEditingOffer(offer);
    setOfferType(offer.offer_type as 'buy' | 'sell');
    setAmount(offer.amount.toString());
    setRate(offer.rate.toString());
    const [hour, minute] = offer.meeting_time.split(':');
    setMeetingHour(hour);
    setMeetingMinute(minute);
    setIsCreateDialogOpen(true);
  };

  const handleDeleteOffer = async (offerId: number) => {
    if (!confirm('Вы уверены, что хотите удалить это объявление?')) {
      return;
    }

    try {
      const response = await fetch('https://functions.poehali.dev/d7e2a78c-387a-4964-93af-6f6956d1cdd7', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offer_id: offerId, user_id: user.id }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Успешно!',
          description: 'Объявление удалено',
        });
        loadOffers(user.id);
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось удалить объявление',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить объявление',
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
        loadDeals(user.id);
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить статус',
        variant: 'destructive',
      });
    }
  };

  const handleCancelReservation = async (offerId: number) => {
    if (!confirm('Вы уверены, что хотите отменить резервацию?')) return;

    try {
      const response = await fetch('https://functions.poehali.dev/d3db438e-da8f-4c6a-a366-764038cf12c3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offer_id: offerId, user_id: user.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast({
          title: 'Ошибка',
          description: errorData.error || 'Не удалось отменить резервацию',
          variant: 'destructive',
        });
        return;
      }

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Успешно!',
          description: 'Резервация отменена',
        });
        loadOffers(user.id);
        loadDeals(user.id);
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось отменить резервацию',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отменить резервацию',
        variant: 'destructive',
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <ProfileHeader onLogout={handleLogout} />
            <CreateOfferDialog
              isOpen={isCreateDialogOpen}
              onOpenChange={(open) => {
                setIsCreateDialogOpen(open);
                if (!open) resetForm();
              }}
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
              city={city}
              setCity={setCity}
              selectedOffices={selectedOffices}
              setSelectedOffices={setSelectedOffices}
              onSubmit={handleCreateOffer}
              isEditing={!!editingOffer}
            />
          </div>

          <ProfileStats
            username={user.username}
            phone={user.phone}
            deals={deals}
            offers={offers}
            userId={user.id}
          />

          <TelegramSettings
            userId={user.id}
            currentTelegramId={user.telegram_id}
            onUpdate={() => loadUserData(user.id)}
          />

          <OffersList
            offers={offers}
            deals={deals}
            onUpdateStatus={handleUpdateOfferStatus}
            onEditOffer={handleEditOffer}
            onDeleteOffer={handleDeleteOffer}
            onCancelReservation={handleCancelReservation}
            formatDate={formatDate}
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;