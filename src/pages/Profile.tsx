import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import Navigation from '@/components/sections/Navigation';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileStats from '@/components/profile/ProfileStats';
import CreateOfferDialog from '@/components/profile/CreateOfferDialog';
import OffersList from '@/components/profile/OffersList';
import TelegramSettings from '@/components/profile/TelegramSettings';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

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
  meeting_time_end?: string;
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
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingTimeEnd, setMeetingTimeEnd] = useState('');
  const [city, setCity] = useState('Москва');
  const [selectedOffices, setSelectedOffices] = useState<string[]>([]);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [newReservationNotification, setNewReservationNotification] = useState<{offerId: number, buyerName: string} | null>(null);
  const prevReservationsCount = useRef<Record<number, number>>({});
  const notificationAudio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const now = new Date();
    let currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    const intervals = [0, 15, 30, 45];
    let nextMinute = intervals.find(m => m > currentMinute);
    
    if (nextMinute === undefined) {
      currentHour = currentHour + 1;
      nextMinute = 0;
    }
    
    if (currentHour < 9) {
      currentHour = 9;
      nextMinute = 0;
    } else if (currentHour >= 24) {
      currentHour = 9;
      nextMinute = 0;
    }
    
    const startTime = `${String(currentHour).padStart(2, '0')}:${String(nextMinute).padStart(2, '0')}`;
    setMeetingTime(startTime);
    setMeetingTimeEnd('00:00');
  }, []);

  useEffect(() => {
    notificationAudio.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBgoOEhYaHiImKi4yNjo+QkZKTlJWWl5iZmpucnZ6foKGio6SlpqeoqaqrrK2ur7CxsrO0tba3uLm6u7y9vr/AwcLDxMXGx8jJysvMzc7P0NHS09TV1tfY2drb3N3e3+Dh4uPk5ebn6Onq6+zt7u/w8fLz9PX29/j5+vv8/f7/AAECAwQFBgcICQoLDA0ODxAREhMUFRYXGBkaGxwdHh8gISIjJCUmJygpKissLS4vMDEyMzQ1Njc4OTo7PD0+P0BBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWltcXV5fYGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6e3x9fn+AgYKDhIWGh4iJiouMjY6PkJGSk5SVlpeYmZqbnJ2en6ChoqOkpaanqKmqq6ytrq+wsbKztLW2t7i5uru8vb6/wMHCw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t/g4eLj5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+/w==');
    notificationAudio.current.volume = 0.5;

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
    
    const interval = setInterval(() => {
      loadOffers(userData.id);
    }, 5000);
    
    return () => clearInterval(interval);
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
        data.offers.forEach((offer: Offer) => {
          if (offer.relation_type === 'created' && offer.reservations) {
            const currentCount = offer.reservations.filter(r => r.status === 'pending').length;
            const prevCount = prevReservationsCount.current[offer.id] || 0;
            
            if (currentCount > prevCount && prevCount > 0) {
              const latestReservation = offer.reservations.find(r => r.status === 'pending');
              if (latestReservation) {
                setNewReservationNotification({
                  offerId: offer.id,
                  buyerName: latestReservation.buyer_name
                });
                notificationAudio.current?.play().catch(() => {});
              }
            }
            
            prevReservationsCount.current[offer.id] = currentCount;
          }
        });
        
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
    if (!amount || !rate || !meetingTime || !meetingTimeEnd || !city || selectedOffices.length === 0) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
        variant: 'destructive',
      });
      return;
    }

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
            meeting_time: meetingTime,
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
            time_start: meetingTime,
            time_end: meetingTimeEnd,
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
    setMeetingTime('');
    setMeetingTimeEnd('00:00');
    setCity('Москва');
    setSelectedOffices([]);
    setEditingOffer(null);
  };

  const handleEditOffer = (offer: Offer) => {
    setEditingOffer(offer);
    setOfferType(offer.offer_type as 'buy' | 'sell');
    setAmount(offer.amount.toString());
    setRate(offer.rate.toString());
    setMeetingTime(offer.meeting_time);
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

  const handleManageReservation = async (reservationId: number, action: 'accept' | 'reject') => {
    try {
      const response = await fetch('https://functions.poehali.dev/353673c7-c605-4d46-bb98-56554c376426', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservation_id: reservationId, action }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Успешно!',
          description: action === 'accept' ? 'Резервация подтверждена' : 'Резервация отклонена',
        });
        loadOffers(user.id);
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось обработать запрос',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось обработать запрос',
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
              meetingTime={meetingTime}
              setMeetingTime={setMeetingTime}
              meetingTimeEnd={meetingTimeEnd}
              setMeetingTimeEnd={setMeetingTimeEnd}
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
            onManageReservation={handleManageReservation}
            formatDate={formatDate}
          />
        </div>
      </div>

      <Dialog open={!!newReservationNotification} onOpenChange={() => setNewReservationNotification(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center animate-pulse">
                <Icon name="Bell" size={24} className="text-accent" />
              </div>
              <DialogTitle className="text-xl">Новая заявка!</DialogTitle>
            </div>
            <DialogDescription className="text-base">
              <span className="font-semibold">{newReservationNotification?.buyerName}</span> хочет зарезервировать ваше объявление
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button
              onClick={() => {
                if (newReservationNotification) {
                  const offer = offers.find(o => o.id === newReservationNotification.offerId);
                  const reservation = offer?.reservations?.find(r => r.buyer_name === newReservationNotification.buyerName);
                  if (reservation) {
                    handleManageReservation(reservation.id, 'accept');
                  }
                }
                setNewReservationNotification(null);
              }}
              className="flex-1 bg-green-500 hover:bg-green-600"
            >
              <Icon name="Check" className="mr-2" />
              Подтвердить
            </Button>
            <Button
              onClick={() => {
                if (newReservationNotification) {
                  const offer = offers.find(o => o.id === newReservationNotification.offerId);
                  const reservation = offer?.reservations?.find(r => r.buyer_name === newReservationNotification.buyerName);
                  if (reservation) {
                    handleManageReservation(reservation.id, 'reject');
                  }
                }
                setNewReservationNotification(null);
              }}
              variant="outline"
              className="flex-1 border-red-500 text-red-500 hover:bg-red-500/10"
            >
              <Icon name="X" className="mr-2" />
              Отказать
            </Button>
          </div>
          <Button
            onClick={() => setNewReservationNotification(null)}
            variant="ghost"
            className="mt-2"
          >
            Посмотрю позже
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;