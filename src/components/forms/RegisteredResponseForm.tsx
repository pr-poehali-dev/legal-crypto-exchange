import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { RegisteredBookingForm } from './registered/RegisteredBookingForm';
import { RegisteredSuccessScreen } from './registered/RegisteredSuccessScreen';
import funcUrls from '../../../backend/func2url.json';

interface RegisteredResponseFormProps {
  offerId: number;
  userId: number;
  username: string;
  offerOffices?: string[];
  offerCity?: string;
  offerAmount?: number;
  currentRate?: number;
  availableSlots?: string[];
  onSuccess?: () => void;
}

const MOSCOW_OFFICES = [
  'Москва, ул. Арбат, 10',
  'Москва, Тверская ул., 15',
  'Москва, ул. Ленина, 25',
];

const CITIES_OFFICES: Record<string, string[]> = {
  'Москва': MOSCOW_OFFICES,
  'Санкт-Петербург': [
    'Санкт-Петербург, Невский пр., 28',
    'Санкт-Петербург, ул. Рубинштейна, 15',
  ],
  'Сочи': [
    'Сочи, ул. Навагинская, 12',
    'Сочи, Курортный пр., 75',
  ],
  'Омск': [
    'Омск, ул. Ленина, 18',
    'Омск, пр. Мира, 32',
  ],
};

const RegisteredResponseForm = ({ 
  offerId, 
  userId, 
  username, 
  offerOffices = [], 
  offerCity = 'Москва',
  offerAmount = 0,
  currentRate = 100,
  availableSlots = [],
  onSuccess 
}: RegisteredResponseFormProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [useOfferOffice, setUseOfferOffice] = useState(true);
  const [customOffice, setCustomOffice] = useState('');
  const [usdtAmount, setUsdtAmount] = useState(offerAmount.toString());
  const [rubAmount, setRubAmount] = useState((offerAmount * currentRate).toString());

  const handleUsdtChange = (value: string) => {
    const usdt = parseFloat(value);
    if (!isNaN(usdt) && usdt > offerAmount) {
      toast({
        title: 'Превышен лимит',
        description: `Максимальная сумма: ${offerAmount} USDT`,
        variant: 'destructive',
      });
      return;
    }
    setUsdtAmount(value);
    if (!isNaN(usdt)) {
      setRubAmount((usdt * currentRate).toFixed(2));
    } else {
      setRubAmount('');
    }
  };

  const handleRubChange = (value: string) => {
    const rub = parseFloat(value);
    const maxRub = offerAmount * currentRate;
    if (!isNaN(rub) && rub > maxRub) {
      toast({
        title: 'Превышен лимит',
        description: `Максимальная сумма: ${maxRub.toFixed(2)} ₽`,
        variant: 'destructive',
      });
      return;
    }
    setRubAmount(value);
    if (!isNaN(rub)) {
      setUsdtAmount((rub / currentRate).toFixed(2));
    } else {
      setUsdtAmount('');
    }
  };
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (availableSlots.length > 0) {
      setSelectedTimeSlot(availableSlots[0]);
    }
  }, [availableSlots]);

  const firstOfferOffice = offerOffices && offerOffices.length > 0 ? offerOffices[0] : '';
  const cityOffices = CITIES_OFFICES[offerCity || 'Москва'] || MOSCOW_OFFICES;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTimeSlot) {
      toast({
        title: 'Ошибка',
        description: 'Выберите время встречи',
        variant: 'destructive',
      });
      return;
    }

    const finalOffice = useOfferOffice ? firstOfferOffice : customOffice;
    
    if (!finalOffice) {
      toast({
        title: 'Ошибка',
        description: 'Укажите адрес для встречи',
        variant: 'destructive',
      });
      return;
    }
    const meetingTime = selectedTimeSlot;

    setIsSubmitting(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const reserveUrl = funcUrls['reserve-offer'];
      if (!reserveUrl) throw new Error('reserve-offer URL not found');

      const response = await fetch(reserveUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offer_id: offerId,
          user_id: userId,
          username: username,
          meeting_office: finalOffice,
          slot_time: meetingTime,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setStep(2);
      } else {
        console.error('Reserve offer error:', data);
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось отправить отклик',
          variant: 'destructive',
        });
        setIsSubmitting(false);
      }
    } catch (error: any) {
      console.error('Reserve offer fetch error:', error);
      const errorMessage = error.name === 'AbortError' 
        ? 'Превышено время ожидания. Попробуйте ещё раз.' 
        : 'Не удалось отправить отклик. Проверьте подключение к интернету.';
      
      toast({
        title: 'Ошибка',
        description: errorMessage,
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  };

  if (step === 2) {
    return <RegisteredSuccessScreen onCancel={onSuccess} />;
  }

  return (
    <RegisteredBookingForm
      currentRate={currentRate}
      offerAmount={offerAmount}
      rubAmount={rubAmount}
      usdtAmount={usdtAmount}
      onRubChange={handleRubChange}
      onUsdtChange={handleUsdtChange}
      firstOfferOffice={firstOfferOffice}
      offerCity={offerCity}
      useOfferOffice={useOfferOffice}
      onUseOfferOfficeChange={setUseOfferOffice}
      customOffice={customOffice}
      onCustomOfficeChange={setCustomOffice}
      cityOffices={cityOffices}
      selectedTimeSlot={selectedTimeSlot}
      onTimeSlotChange={setSelectedTimeSlot}
      availableSlots={availableSlots}
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
    />
  );
};

export default RegisteredResponseForm;