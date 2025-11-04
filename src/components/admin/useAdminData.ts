import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { User, Offer, Deal } from './types';

export const useAdminData = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
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
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
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
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      if (data.success) {
        const offersData = data.offers || [];
        
        // Group offers by user_id to minimize requests
        const userIds = [...new Set(offersData.map((o: any) => o.user_id))];
        const reservationsByUserId: Record<number, any[]> = {};
        
        // Load reservations for each unique user in parallel with error handling
        const reservationPromises = userIds.map(async (userId) => {
          try {
            const resResponse = await fetch(`https://functions.poehali.dev/ad8e0859-d6b1-4dde-8da7-2b137a4c9abb?user_id=${userId}`, {
              signal: AbortSignal.timeout(5000) // 5 second timeout
            });
            if (resResponse.ok) {
              const resData = await resResponse.json();
              if (resData.success && resData.offers) {
                resData.offers.forEach((offer: any) => {
                  if (offer.reservations && offer.reservations.length > 0) {
                    reservationsByUserId[offer.id] = offer.reservations;
                  }
                });
              }
            }
          } catch (err) {
            // Silently handle errors - show offers even if reservations fail to load
          }
        });
        
        // Wait for all reservation requests with timeout
        await Promise.allSettled(reservationPromises);
        
        // Attach reservations to offers
        offersData.forEach((offer: any) => {
          offer.reservations = reservationsByUserId[offer.id] || [];
        });
        
        setOffers(offersData);
      }
    } catch (error) {
      console.error('Failed to load offers:', error);
    }
  };

  const deleteOffer = async (offerId: number) => {
    if (!confirm('Удалить это объявление?')) return;

    try {
      const response = await fetch('https://functions.poehali.dev/d7e2a78c-387a-4964-93af-6f6956d1cdd7', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offer_id: offerId })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Объявление удалено');
        await loadOffers();
        await loadDeals();
      } else {
        toast.error(data.error || 'Ошибка при удалении');
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
        await loadDeals();
        await loadOffers();
        await loadUsers();
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

  const toggleOfferStatus = async (offerId: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

    try {
      const response = await fetch('https://functions.poehali.dev/716426cb-1d05-4858-a5f1-4d46123b5470', {
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

  const completeOffer = async (offerId: number) => {
    if (!confirm('Подтвердить успешную сделку по этому объявлению?')) return;

    try {
      const response = await fetch('https://functions.poehali.dev/716426cb-1d05-4858-a5f1-4d46123b5470', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offer_id: offerId, status: 'completed' })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Сделка подтверждена');
        await loadOffers();
        await loadDeals();
        await loadUsers();
      } else {
        toast.error('Ошибка при подтверждении сделки');
      }
    } catch (error) {
      toast.error('Ошибка при подтверждении сделки');
    }
  };

  const clearAllOffers = async () => {
    if (!confirm('ВНИМАНИЕ! Это удалит ВСЕ объявления из базы. Продолжить?')) return;

    try {
      const response = await fetch('https://functions.poehali.dev/9ba15f07-2b5a-4130-9c77-85a5b1d8f040', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clear_all: true })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`Удалено записей: ${data.deleted_count} (резервации: ${data.reservations}, сделки: ${data.deals}, слоты: ${data.slots}, объявления: ${data.offers})`);
        await loadOffers();
        await loadDeals();
      } else {
        toast.error('Ошибка при очистке');
      }
    } catch (error) {
      toast.error('Ошибка при очистке');
    }
  };

  return {
    users,
    offers,
    deals,
    isLoading,
    deleteOffer,
    completeDeal,
    toggleUserBlock,
    toggleOfferStatus,
    completeOffer,
    clearAllOffers
  };
};