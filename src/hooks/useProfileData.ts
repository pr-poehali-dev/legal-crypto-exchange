import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export interface Deal {
  id: number;
  deal_type: string;
  amount: number;
  rate: number;
  total: number;
  status: string;
  partner_name: string | null;
  created_at: string;
}

export interface Offer {
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
  reservations?: any[];
}

export const useProfileData = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newReservationNotification, setNewReservationNotification] = useState<{offerId: number, buyerName: string} | null>(null);
  const prevReservationsCount = useRef<Record<number, number>>({});
  const notificationAudio = useRef<HTMLAudioElement | null>(null);

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

  return {
    user,
    setUser,
    deals,
    offers,
    isLoading,
    newReservationNotification,
    setNewReservationNotification,
    loadDeals,
    loadOffers,
    loadUserData
  };
};
