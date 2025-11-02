import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import funcUrls from '../../../../backend/func2url.json';

interface RegisteredSuccessScreenProps {
  reservationId: number | null;
  userId: number;
  onCancel?: () => void;
}

export const RegisteredSuccessScreen = ({ reservationId, userId, onCancel }: RegisteredSuccessScreenProps) => {
  const [status, setStatus] = useState<'pending' | 'confirmed' | 'rejected'>('pending');

  useEffect(() => {
    if (!reservationId || !userId) return;

    const checkStatus = async () => {
      try {
        const url = funcUrls['get-user-deals'];
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId })
        });
        const data = await response.json();
        
        if (data.success && data.deals) {
          const reservation = data.deals.find((d: any) => d.reservation_id === reservationId);
          if (reservation && reservation.status !== 'pending') {
            setStatus(reservation.status);
          }
        }
      } catch (error) {
        console.error('Failed to check status:', error);
      }
    };

    const interval = setInterval(checkStatus, 3000);
    checkStatus();

    return () => clearInterval(interval);
  }, [reservationId, userId]);
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-secondary/20 flex items-center justify-center animate-pulse">
          <Icon name="Clock" size={48} className="text-secondary" />
        </div>
        <div className="absolute inset-0 rounded-full border-4 border-secondary/30 border-t-secondary animate-spin" />
      </div>
      
      <div className="text-center space-y-2">
        {status === 'pending' && (
          <>
            <h3 className="text-2xl font-bold text-secondary">Ожидайте подтверждения</h3>
            <p className="text-muted-foreground max-w-sm">
              Ваша заявка отправлена создателю. Он должен подтвердить бронь. Следите за статусом в профиле.
            </p>
          </>
        )}
        {status === 'confirmed' && (
          <>
            <h3 className="text-2xl font-bold text-green-500">Заявка подтверждена!</h3>
            <p className="text-muted-foreground max-w-sm">
              Создатель объявления подтвердил вашу бронь. Ожидайте встречи в указанное время.
            </p>
          </>
        )}
        {status === 'rejected' && (
          <>
            <h3 className="text-2xl font-bold text-red-500">Заявка отклонена</h3>
            <p className="text-muted-foreground max-w-sm">
              К сожалению, создатель объявления отклонил вашу заявку.
            </p>
          </>
        )}
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        {status === 'pending' && (
          <>
            <Icon name="Clock" size={16} className="text-secondary" />
            <span>Заявка отправлена</span>
          </>
        )}
        {status === 'confirmed' && (
          <>
            <Icon name="CheckCircle2" size={16} className="text-green-500" />
            <span className="text-green-500">Подтверждено</span>
          </>
        )}
        {status === 'rejected' && (
          <>
            <Icon name="XCircle" size={16} className="text-red-500" />
            <span className="text-red-500">Отклонено</span>
          </>
        )}
      </div>

      {onCancel && (
        <Button
          variant="outline"
          onClick={onCancel}
          className="border-blue-500 text-blue-500 hover:bg-blue-500/10"
        >
          <Icon name="X" size={16} className="mr-1" />
          Закрыть
        </Button>
      )}
    </div>
  );
};