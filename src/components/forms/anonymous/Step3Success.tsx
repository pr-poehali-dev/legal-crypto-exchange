import { useEffect } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import func2url from '../../../../backend/func2url.json';

interface Step3SuccessProps {
  reservationId: number | null;
  reservationStatus: 'pending' | 'confirmed' | 'rejected' | null;
  onStatusChange: (status: 'pending' | 'confirmed' | 'rejected') => void;
  onClose: () => void;
}

export const Step3Success = ({ reservationId, reservationStatus, onStatusChange, onClose }: Step3SuccessProps) => {
  useEffect(() => {
    if (!reservationId) return;

    const checkStatus = async () => {
      try {
        const response = await fetch(`${func2url['check-reservation-status']}?reservation_id=${reservationId}`);
        const data = await response.json();
        
        if (data.success && data.status) {
          onStatusChange(data.status);
        }
      } catch (error) {
        console.error('Failed to check reservation status:', error);
      }
    };

    const interval = setInterval(checkStatus, 3000);
    checkStatus();

    return () => clearInterval(interval);
  }, [reservationId, onStatusChange]);

  if (reservationStatus === 'confirmed') {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-6">
        <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center">
          <Icon name="CheckCircle" size={48} className="text-green-500" />
        </div>
        
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-green-500">Заявка подтверждена!</h3>
          <p className="text-muted-foreground max-w-sm">
            Создатель объявления подтвердил вашу заявку. Ожидайте звонка для уточнения деталей встречи.
          </p>
        </div>

        <Button onClick={onClose} className="bg-secondary hover:bg-secondary/90">
          Закрыть
        </Button>
      </div>
    );
  }

  if (reservationStatus === 'rejected') {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-6">
        <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center">
          <Icon name="XCircle" size={48} className="text-red-500" />
        </div>
        
        <div className="text-center space-y-2">
          <h3 className="text-2xl font-bold text-red-500">Заявка отклонена</h3>
          <p className="text-muted-foreground max-w-sm">
            К сожалению, создатель объявления отклонил вашу заявку. Попробуйте выбрать другое время или другое объявление.
          </p>
        </div>

        <Button onClick={onClose} variant="outline">
          Закрыть
        </Button>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-secondary/20 flex items-center justify-center animate-pulse">
          <Icon name="Clock" size={48} className="text-secondary" />
        </div>
        <div className="absolute inset-0 rounded-full border-4 border-secondary/30 border-t-secondary animate-spin" />
      </div>
      
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-secondary">Ожидайте подтверждения</h3>
        <p className="text-muted-foreground max-w-sm">
          Ваша заявка отправлена создателю. Он должен подтвердить или отклонить бронь. Не закрывайте это окно.
        </p>
      </div>

      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon name="CheckCircle2" size={16} className="text-success" />
          <span>Заявка отправлена</span>
        </div>
        <p className="text-xs text-muted-foreground/70 italic text-center max-w-xs">
          Автоматически обновляем статус каждые 3 секунды
        </p>
      </div>
    </div>
  );
};