import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import func2url from '../../../backend/func2url.json';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  const [useOfferOffice, setUseOfferOffice] = useState(true);
  const [customOffice, setCustomOffice] = useState('');
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
  const cityOffices = CITIES_OFFICES[offerCity || 'Москва'] || MOSCOW_OFFICES;
  const selectedOffice = useOfferOffice ? firstOfferOffice : customOffice;

  useEffect(() => {
    if (!selectedOffice) return;
    
    const fetchOccupiedTimes = async () => {
      try {
        const response = await fetch(func2url['get-all-offers'] || 'https://functions.poehali.dev/24cbcabc-c4e4-496b-a820-0315a576e32e');
        const data = await response.json();
        
        if (data.success && data.offers) {
          const occupied = new Set<string>();
          data.offers.forEach((offer: any) => {
            if ((offer.status === 'active' || offer.status === 'reserved') && offer.offices) {
              if (offer.offices.includes(selectedOffice)) {
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
  }, [selectedOffice]);

  const handleNextStep = () => {
    if (!meetingTime) {
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

    const finalOffice = useOfferOffice ? firstOfferOffice : customOffice;

    setIsSubmitting(true);

    try {
      const reserveUrl = func2url['reserve-offer'] || 'https://functions.poehali.dev/9c031941-05ab-46ce-9781-3bd0b4c6974f';
      
      const response = await fetch(reserveUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offer_id: offerId,
          buyer_name: name,
          buyer_phone: phone,
          buyer_email: email || undefined,
          meeting_office: finalOffice,
          slot_time: meetingTime,
          is_anonymous: true,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStep(3);
        setTimeout(() => {
          setName('');
          setPhone('');
          setEmail('');
          setUseOfferOffice(true);
          setCustomOffice('');
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
      }
    } catch (error) {
      console.error('Reserve offer fetch error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось зарезервировать объявление. Проверьте подключение к интернету.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 1) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Текущий курс</Label>
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium">
              1 USDT = {currentRate.toFixed(2)} ₽
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Сумма обмена</Label>
            <span className="text-xs text-muted-foreground">
              Макс: {offerAmount} USDT ({(offerAmount * currentRate).toFixed(2)} ₽)
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="rub-amount" className="text-xs text-muted-foreground">В рублях (₽)</Label>
              <Input
                id="rub-amount"
                type="number"
                step="0.01"
                min="0"
                max={(offerAmount * currentRate).toFixed(2)}
                placeholder="0.00"
                value={rubAmount}
                onChange={(e) => handleRubChange(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="usdt-amount" className="text-xs text-muted-foreground">В USDT</Label>
              <Input
                id="usdt-amount"
                type="number"
                step="0.01"
                min="0"
                max={offerAmount}
                placeholder="0.00"
                value={usdtAmount}
                onChange={(e) => handleUsdtChange(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Label>Адрес для встречи</Label>
          {firstOfferOffice && (
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="use-offer-office"
                  checked={useOfferOffice}
                  onCheckedChange={(checked) => setUseOfferOffice(checked === true)}
                />
                <label htmlFor="use-offer-office" className="text-sm leading-relaxed cursor-pointer">
                  {firstOfferOffice}
                </label>
              </div>
            </div>
          )}
          
          {!useOfferOffice && (
            <div className="space-y-2">
              <Label htmlFor="custom-office">Укажите адрес</Label>
              <Select value={customOffice} onValueChange={setCustomOffice}>
                <SelectTrigger id="custom-office">
                  <SelectValue placeholder="Выберите адрес" />
                </SelectTrigger>
                <SelectContent>
                  {cityOffices.map((office) => (
                    <SelectItem key={office} value={office}>
                      {office}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Выберите время встречи</Label>
          <Select value={meetingTime} onValueChange={setMeetingTime}>
            <SelectTrigger>
              <SelectValue placeholder="Выберите время" />
            </SelectTrigger>
            <SelectContent>
              <TooltipProvider>
                {Array.from({ length: 13 }, (_, i) => i + 9).flatMap((hour) => 
                  ['00', '15', '30', '45'].map((minute) => {
                    if (hour > 21) return null;
                    if (hour === 21 && minute !== '00') return null;
                    
                    const now = new Date();
                    const currentHour = now.getHours();
                    const currentMinute = now.getMinutes();
                    const slotHour = hour;
                    const slotMinute = parseInt(minute);
                    
                    if (slotHour < currentHour) return null;
                    if (slotHour === currentHour && slotMinute <= currentMinute) return null;
                    
                    const time = `${hour.toString().padStart(2, '0')}:${minute}`;
                    const isOccupied = occupiedTimes.has(time);
                    
                    return (
                      <Tooltip key={time} delayDuration={200}>
                        <TooltipTrigger asChild>
                          <SelectItem value={time} disabled={isOccupied}>
                            {time} {isOccupied && '(Забронировано)'}
                          </SelectItem>
                        </TooltipTrigger>
                        {isOccupied && (
                          <TooltipContent side="left" className="max-w-xs">
                            <div className="text-xs">
                              <p className="font-semibold">Это время уже занято для выбранного офиса</p>
                            </div>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    );
                  })
                ).filter(Boolean)}
              </TooltipProvider>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            <Icon name="Info" size={12} className="inline mr-1" />
            Обратите внимание: курс обмена актуален в течение трех часов и может измениться
          </p>
        </div>

        <Button 
          type="button"
          onClick={handleNextStep}
          className="w-full"
        >
          Далее
          <Icon name="ArrowRight" className="ml-2" />
        </Button>
      </div>
    );
  }

  if (step === 3) {
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
            Ваша заявка успешно отправлена. Продавец получит уведомление и свяжется с вами в ближайшее время.
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Icon name="CheckCircle2" size={16} className="text-success" />
          <span>Заявка отправлена</span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Ваше Имя</Label>
        <Input
          id="name"
          type="text"
          placeholder="Иван Иванов"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Номер телефона *</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+7 (999) 123-45-67"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Почта (необязательно)</Label>
        <Input
          id="email"
          type="email"
          placeholder="example@mail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          onClick={() => setStep(1)}
          variant="outline"
          className="flex-1"
          disabled={isSubmitting}
        >
          <Icon name="ArrowLeft" className="mr-2" />
          Назад
        </Button>
        <Button type="submit" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Icon name="Loader2" className="mr-2 animate-spin" />
              Резервирование...
            </>
          ) : (
            <>
              <Icon name="Lock" className="mr-2" />
              Забронировать
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default AnonymousResponseForm;