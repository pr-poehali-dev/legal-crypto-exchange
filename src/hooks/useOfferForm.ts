import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Offer } from './useProfileData';

export const useOfferForm = (userId: number | null, onSuccess: () => void) => {
  const { toast } = useToast();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [offerType, setOfferType] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingTimeEnd, setMeetingTimeEnd] = useState('');
  const [city, setCity] = useState('Москва');
  const [selectedOffices, setSelectedOffices] = useState<string[]>([]);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);

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
    setMeetingTimeEnd(offer.meeting_time_end || '00:00');
    setIsCreateDialogOpen(true);
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

    if (!userId) return;

    try {
      if (editingOffer) {
        const response = await fetch('https://functions.poehali.dev/706432f5-5c24-4beb-9327-0ce9f187c02f', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            offer_id: editingOffer.id,
            user_id: userId,
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
          onSuccess();
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
            user_id: userId,
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
          onSuccess();
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

  return {
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    offerType,
    setOfferType,
    amount,
    setAmount,
    rate,
    setRate,
    meetingTime,
    setMeetingTime,
    meetingTimeEnd,
    setMeetingTimeEnd,
    city,
    setCity,
    selectedOffices,
    setSelectedOffices,
    editingOffer,
    resetForm,
    handleEditOffer,
    handleCreateOffer
  };
};
