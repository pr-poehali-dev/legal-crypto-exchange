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
  reservation_status?: 'pending' | 'confirmed' | 'rejected' | 'expired';
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
    const playNotificationSound = () => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        if (audioContext.state === 'suspended') {
          audioContext.resume();
        }
        
        const playBeep = (freq1: number, freq2: number, delay: number = 0) => {
          setTimeout(() => {
            const osc1 = audioContext.createOscillator();
            const osc2 = audioContext.createOscillator();
            const gain = audioContext.createGain();
            
            osc1.connect(gain);
            osc2.connect(gain);
            gain.connect(audioContext.destination);
            
            osc1.frequency.value = freq1;
            osc2.frequency.value = freq2;
            osc1.type = 'sine';
            osc2.type = 'sine';
            
            gain.gain.setValueAtTime(0.3, audioContext.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
            
            osc1.start(audioContext.currentTime);
            osc2.start(audioContext.currentTime);
            osc1.stop(audioContext.currentTime + 0.4);
            osc2.stop(audioContext.currentTime + 0.4);
          }, delay);
        };
        
        playBeep(800, 1000, 0);
        playBeep(1000, 1200, 250);
      } catch (e) {
        console.error('Audio error:', e);
      }
    };
    
    notificationAudio.current = { play: () => Promise.resolve(playNotificationSound()) } as any;

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
            
            if (currentCount > prevCount) {
              const latestReservation = offer.reservations.find(r => r.status === 'pending');
              if (latestReservation) {
                console.log('🔔 Новая бронь!', latestReservation);
                setNewReservationNotification({
                  offerId: offer.id,
                  buyerName: latestReservation.buyer_name
                });
                notificationAudio.current?.play().catch((e) => console.error('Sound error:', e));
                
                if ('vibrate' in navigator) {
                  navigator.vibrate([200, 100, 200, 100, 400]);
                }
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