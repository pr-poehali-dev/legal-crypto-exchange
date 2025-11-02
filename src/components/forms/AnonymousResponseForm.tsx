import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import func2url from '../../../backend/func2url.json';
import { Step1ExchangeDetails } from './anonymous/Step1ExchangeDetails';
import { Step2ContactInfo } from './anonymous/Step2ContactInfo';
import { Step3Success } from './anonymous/Step3Success';

interface AnonymousResponseFormProps {
  offerId: number;
  offerOffices?: string[];
  offerCity?: string;
  offerAmount?: number;
  currentRate?: number;
  onSuccess?: () => void;
}

const MOSCOW_OFFICES = [
  'ул. Нефтезаводская, д.9/2, 12 этаж'
];

const CITIES_OFFICES: Record<string, string[]> = {
  'Москва': MOSCOW_OFFICES,
  'Санкт-Петербург': [
    'Невский проспект, д.190, 23 этаж'
  ],
  'Сочи': [
    'ул. Солнечная, д.78, 1 этаж'
  ],
  'Омск': [
    'ул. Ленина, д.99, 19 этаж'
  ],
};

const AnonymousResponseForm = ({ offerId, offerOffices = [], offerCity = 'Москва', offerAmount = 0, currentRate = 100, onSuccess }: AnonymousResponseFormProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [occupiedTimes, setOccupiedTimes] = useState<Set<string>>(new Set());

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
    } else if (currentHour > 21 || (currentHour === 21 && nextMinute > 0)) {
      currentHour = 9;
      nextMinute = 0;
    }
    
    setMeetingTime(`${String(currentHour).padStart(2, '0')}:${String(nextMinute).padStart(2, '0')}`);
  }, []);
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

  const firstOfferOffice = offerOffices && offerOffices.length > 0 ? offerOffices[0] : '';

  useEffect(() => {
    if (!firstOfferOffice) return;
    
    const fetchOccupiedTimes = async () => {
      try {
        const response = await fetch(func2url['get-all-offers'] || 'https://functions.poehali.dev/24cbcabc-c4e4-496b-a820-0315a576e32e');
        const data = await response.json();
        
        if (data.success && data.offers) {
          const occupied = new Set<string>();
          data.offers.forEach((offer: any) => {
            if ((offer.status === 'active' || offer.status === 'reserved') && offer.offices) {
              if (offer.offices.includes(firstOfferOffice)) {
                occupied.add(offer.meeting_time);
              }
            }
          });
          setOccupiedTimes(occupied);
        }
      } catch (error) {
        console.error('Failed to load occupied times:', error);
      }
    };
    
    fetchOccupiedTimes();
  }, [firstOfferOffice]);

  const handleNextStep = () => {
    if (!meetingTime) {
      toast({
        title: 'Ошибка',
        description: 'Выберите время встречи',
        variant: 'destructive',
      });
      return;
    }

    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !phone) {
      toast({
        title: 'Ошибка',
        description: 'Заполните имя и телефон',
        variant: 'destructive',
      });
      return;
    }

    const phoneRegex = /^\+?[0-9\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(phone)) {
      toast({
        title: 'Ошибка',
        description: 'Введите корректный номер телефона',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const reserveUrl = func2url['reserve-offer'] || 'https://functions.poehali.dev/9c031941-05ab-46ce-9781-3bd0b4c6974f';
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(reserveUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offer_id: offerId,
          buyer_name: name,
          buyer_phone: phone,
          buyer_email: email || undefined,
          meeting_office: firstOfferOffice,
          slot_time: meetingTime,
          is_anonymous: true,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setStep(3);
        setTimeout(() => {
          setName('');
          setPhone('');
          setEmail('');
          setMeetingTime('');
          setStep(1);
          onSuccess?.();
        }, 3000);
      } else {
        console.error('Reserve offer error:', data);
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось зарезервировать объявление',
          variant: 'destructive',
        });
        setIsSubmitting(false);
      }
    } catch (error: any) {
      console.error('Reserve offer fetch error:', error);
      const errorMessage = error.name === 'AbortError' 
        ? 'Превышено время ожидания. Попробуйте ещё раз.' 
        : 'Не удалось зарезервировать объявление. Проверьте подключение к интернету.';
      
      toast({
        title: 'Ошибка',
        description: errorMessage,
        variant: 'destructive',
      });
      setIsSubmitting(false);
    }
  };

  if (step === 1) {
    return (
      <Step1ExchangeDetails
        currentRate={currentRate}
        offerAmount={offerAmount}
        rubAmount={rubAmount}
        usdtAmount={usdtAmount}
        onRubChange={handleRubChange}
        onUsdtChange={handleUsdtChange}
        firstOfferOffice={firstOfferOffice}
        meetingTime={meetingTime}
        onMeetingTimeChange={setMeetingTime}
        occupiedTimes={occupiedTimes}
        onNextStep={handleNextStep}
      />
    );
  }

  if (step === 3) {
    return <Step3Success />;
  }

  return (
    <Step2ContactInfo
      name={name}
      phone={phone}
      email={email}
      onNameChange={setName}
      onPhoneChange={setPhone}
      onEmailChange={setEmail}
      isSubmitting={isSubmitting}
      onBack={() => setStep(1)}
      onSubmit={handleSubmit}
    />
  );
};

export default AnonymousResponseForm;