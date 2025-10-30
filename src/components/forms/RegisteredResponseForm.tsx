import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

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
      const response = await fetch('https://functions.poehali.dev/9c031941-05ab-46ce-9781-3bd0b4c6974f', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offer_id: offerId,
          user_id: userId,
          username: username,
          meeting_office: finalOffice,
          meeting_time: meetingTime,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Успешно!',
          description: 'Мы получили ваш отклик и свяжемся с вами для подтверждения встречи.',
        });
        setUseOfferOffice(true);
        setCustomOffice('');
        setMeetingHour('');
        setMeetingMinute('');
        onSuccess?.();
      } else {
        console.error('Reserve offer error:', data);
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось отправить отклик',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Reserve offer fetch error:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить отклик. Проверьте подключение к интернету.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
                disabled={isSubmitting}
              />
              <Label htmlFor="use-offer-office" className="text-sm leading-relaxed cursor-pointer font-normal">
                {offerCity}, {firstOfferOffice}
              </Label>
            </div>
          </div>
        )}
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <Checkbox
              id="use-custom-office"
              checked={!useOfferOffice}
              onCheckedChange={(checked) => setUseOfferOffice(checked !== true)}
              disabled={isSubmitting}
            />
            <Label htmlFor="use-custom-office" className="text-sm leading-relaxed cursor-pointer font-normal">
              Укажите свой адрес
            </Label>
          </div>
          {!useOfferOffice && (
            <Select value={customOffice} onValueChange={setCustomOffice} disabled={isSubmitting}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Выберите адрес" />
              </SelectTrigger>
              <SelectContent>
                {cityOffices.map((office, idx) => (
                  <SelectItem key={idx} value={office}>{office}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Выберите время встречи</Label>
        {availableSlots.length > 0 ? (
          <>
            <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot} disabled={isSubmitting}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите доступное время" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {availableSlots.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    <div className="flex items-center gap-2">
                      <Icon name="Clock" size={16} />
                      {slot}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              <Icon name="Info" size={12} className="inline mr-1" />
              Доступно {availableSlots.length} временных слотов
            </p>
          </>
        ) : (
          <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground">
            <Icon name="AlertCircle" size={16} className="inline mr-2" />
            Нет доступных временных слотов
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          <Icon name="Info" size={12} className="inline mr-1" />
          Обратите внимание: курс обмена актуален в течение трех часов и может измениться
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Icon name="Loader2" className="mr-2 animate-spin" />
            Отправка...
          </>
        ) : (
          <>
            <Icon name="Handshake" className="mr-2" />
            Откликнуться
          </>
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        * Мы получим ваш отклик и свяжемся с вами для подтверждения встречи.
      </p>
    </form>
  );
};

export default RegisteredResponseForm;