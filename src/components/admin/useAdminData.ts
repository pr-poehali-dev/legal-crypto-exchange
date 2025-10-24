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
        setOffers(data.offers || []);
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
      const response = await fetch('https://functions.poehali.dev/2237d1cb-ec94-4c0c-a318-6145c2f54e23', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clear_all: true })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`Удалено объявлений: ${data.deleted_count}`);
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