import { useToast } from '@/hooks/use-toast';
import funcUrls from '../../backend/func2url.json';

export const useOfferActions = (userId: number | null, onSuccess: () => void) => {
  const { toast } = useToast();

  const handleUpdateOfferStatus = async (offerId: number, status: string) => {
    try {
      const url = funcUrls['update-offer-status'];
      const response = await fetch(url, {
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
        onSuccess();
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

    if (!userId) return;

    try {
      const url = funcUrls['cancel-reservation'];
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offer_id: offerId, user_id: userId }),
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
        onSuccess();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отменить резервацию',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteOffer = async (offerId: number) => {
    if (!confirm('Вы уверены, что хотите удалить объявление?')) return;

    try {
      const url = funcUrls['delete-offer'];
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offer_id: offerId }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Успешно!',
          description: 'Объявление удалено',
        });
        onSuccess();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить объявление',
        variant: 'destructive',
      });
    }
  };

  const handleManageReservation = async (reservationId: number, action: 'accept' | 'reject') => {
    try {
      const url = funcUrls['manage-reservation-response'];
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reservation_id: reservationId, action }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: action === 'accept' ? 'Заявка подтверждена!' : 'Заявка отклонена',
          description: action === 'accept' 
            ? 'Покупатель получил уведомление. Ожидайте встречи в указанное время.' 
            : 'Покупатель получил уведомление об отклонении.',
        });
        onSuccess();
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

  return {
    handleUpdateOfferStatus,
    handleCancelReservation,
    handleDeleteOffer,
    handleManageReservation
  };
};