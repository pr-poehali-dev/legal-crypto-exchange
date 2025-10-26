import { useState } from 'react';
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
  onSuccess 
}: RegisteredResponseFormProps) => {
  const { toast } = useToast();
  const [useOfferOffice, setUseOfferOffice] = useState(true);
  const [customOffice, setCustomOffice] = useState('');
  const [exchangeAmount, setExchangeAmount] = useState(offerAmount.toString());

  const calculatedRub = parseFloat(exchangeAmount) * currentRate;
  const calculatedUsdt = parseFloat(exchangeAmount);
  const [meetingHour, setMeetingHour] = useState('');
  const [meetingMinute, setMeetingMinute] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const firstOfferOffice = offerOffices && offerOffices.length > 0 ? offerOffices[0] : '';
  const cityOffices = CITIES_OFFICES[offerCity || 'Москва'] || MOSCOW_OFFICES;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!meetingHour || !meetingMinute) {
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
    const meetingTime = `${meetingHour}:${meetingMinute}`;

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
        <Label htmlFor="exchange-amount">Сумма обмена (USDT)</Label>
        <Input
          id="exchange-amount"
          type="number"
          step="0.01"
          min="0"
          placeholder="Введите сумму в USDT"
          value={exchangeAmount}
          onChange={(e) => setExchangeAmount(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label>Предполагаемая сумма обмена</Label>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">В рублях</p>
            <p className="text-lg font-semibold">
              {isNaN(calculatedRub) ? '0.00' : calculatedRub.toFixed(2)} ₽
            </p>
          </div>
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">В USDT</p>
            <p className="text-lg font-semibold">
              {isNaN(calculatedUsdt) ? '0.00' : calculatedUsdt.toFixed(2)} USDT
            </p>
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
                {firstOfferOffice}
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
        <div className="flex gap-2">
          <Select value={meetingHour} onValueChange={setMeetingHour} disabled={isSubmitting}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Часы" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                <SelectItem key={hour} value={hour.toString().padStart(2, '0')}>
                  {hour.toString().padStart(2, '0')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-2xl font-bold flex items-center">:</span>
          <Select value={meetingMinute} onValueChange={setMeetingMinute} disabled={isSubmitting}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Минуты" />
            </SelectTrigger>
            <SelectContent>
              {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map((minute) => (
                <SelectItem key={minute} value={minute}>{minute}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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