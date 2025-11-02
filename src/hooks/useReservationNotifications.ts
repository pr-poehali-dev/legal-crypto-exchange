import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useReservationNotifications = () => {
  const { toast } = useToast();
  const prevReservationsCount = useRef<Record<number, number>>({});
  const notificationPermission = useRef<NotificationPermission>('default');

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

  const checkNewReservations = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    try {
      const response = await fetch('https://functions.poehali.dev/cb7a012b-a1c5-4de9-857f-5a8d2c3c4b0a', {
        headers: { 'X-User-Id': userId },
      });

      if (response.ok) {
        const data = await response.json();
        const myOffers = data.offers?.filter((o: any) => o.owner_id === parseInt(userId)) || [];

        myOffers.forEach((offer: any) => {
          const currentCount = offer.reservations?.length || 0;
          const prevCount = prevReservationsCount.current[offer.id] || 0;

          if (currentCount > prevCount && prevCount >= 0) {
            const latestReservation = offer.reservations?.[0];
            const buyerName = latestReservation?.reserved_by_username || 'Неизвестный';
            
            console.log('🔔 Новая бронь!', { offerId: offer.id, buyerName, currentCount, prevCount });
            
            // Звук
            playNotificationSound();
            
            // Toast уведомление
            toast({
              title: '🎉 Новая бронь!',
              description: `${buyerName} забронировал ваше объявление`,
              duration: 10000,
            });

            // Системное уведомление (работает даже когда вкладка свернута)
            if ('Notification' in window && notificationPermission.current === 'granted') {
              new Notification('🎉 Новая бронь!', {
                body: `${buyerName} забронировал ваше объявление`,
                icon: '/favicon.ico',
                tag: `reservation-${offer.id}-${Date.now()}`,
                requireInteraction: true,
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
    const interval = setInterval(checkNewReservations, 5000);
    return () => clearInterval(interval);
  }, []);

  return null;
};
