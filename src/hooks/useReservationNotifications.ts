import { useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

interface ReservationNotification {
  offerId: number;
  buyerName: string;
}

export const useReservationNotifications = () => {
  const { toast } = useToast();
  const prevReservationsCount = useRef<Record<number, number>>({});
  const notificationPermission = useRef<NotificationPermission>('default');
  const [notification, setNotification] = useState<ReservationNotification | null>(null);
  const [offers, setOffers] = useState<any[]>([]);

  useEffect(() => {
    // Запрашиваем разрешение на уведомления
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        notificationPermission.current = permission;
      });
    } else if ('Notification' in window) {
      notificationPermission.current = Notification.permission;
    }
  }, []);

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error('Sound error:', error);
    }
  };

  const vibrate = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 400]);
    }
  };

  const checkNewReservations = async () => {
    const savedUser = localStorage.getItem('user');
    if (!savedUser) return;
    
    const userData = JSON.parse(savedUser);
    const userId = userData.id;
    if (!userId) return;

    try {
      const response = await fetch(`https://functions.poehali.dev/ad8e0859-d6b1-4dde-8da7-2b137a4c9abb?user_id=${userId}`);

      if (response.ok) {
        const data = await response.json();
        const myOffers = data.offers?.filter((o: any) => o.relation_type === 'created') || [];
        
        console.log('📡 Loaded offers with reservations:', myOffers);
        setOffers(myOffers);

        myOffers.forEach((offer: any) => {
          const currentCount = offer.reservations?.filter((r: any) => r.status === 'pending').length || 0;
          const prevCount = prevReservationsCount.current[offer.id] || 0;

          if (currentCount > prevCount && prevCount >= 0) {
            const latestReservation = offer.reservations?.find((r: any) => r.status === 'pending');
            const buyerName = latestReservation?.buyer_name || 'Неизвестный';
            
            console.log('🔔 Новая бронь!', { offerId: offer.id, buyerName, offer, currentCount, prevCount });
            
            playNotificationSound();
            vibrate();
            
            setNotification({ offerId: offer.id, buyerName });
            
            toast({
              title: '🎉 Новая бронь!',
              description: `${buyerName} забронировал ваше объявление`,
              duration: 10000,
            });

            if ('Notification' in window && notificationPermission.current === 'granted') {
              new Notification('🎉 Новая бронь!', {
                body: `${buyerName} забронировал ваше объявление`,
                icon: '/favicon.ico',
                tag: `reservation-${offer.id}-${Date.now()}`,
                requireInteraction: true,
                vibrate: [200, 100, 200, 100, 400],
              });
            }
          }

          prevReservationsCount.current[offer.id] = currentCount;
        });
      }
    } catch (error) {
      console.error('Notification check error:', error);
    }
  };

  useEffect(() => {
    checkNewReservations();
    const interval = setInterval(checkNewReservations, 2000);
    return () => clearInterval(interval);
  }, []);

  return { notification, setNotification, offers };
};