import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import func2url from '../../../backend/func2url.json';

interface AnonymousBuyOfferFormProps {
  onSuccess?: () => void;
}

const AnonymousBuyOfferForm = ({ onSuccess }: AnonymousBuyOfferFormProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState('');
  const [rubles, setRubles] = useState('');
  const [lastEditedField, setLastEditedField] = useState<'usdt' | 'rubles'>('usdt');
  const [meetingHour, setMeetingHour] = useState('');
  const [meetingMinute, setMeetingMinute] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    const intervals = [0, 15, 30, 45];
    let nextMinute = intervals.find(m => m > currentMinute) ?? 0;
    let nextHour = currentHour;
    
    if (nextMinute === 0) {
      nextHour = currentHour + 1;
    }
    
    if (nextHour < 9) {
      nextHour = 9;
      nextMinute = 0;
    } else if (nextHour > 21) {
      nextHour = 9;
      nextMinute = 0;
    } else if (nextHour === 21 && nextMinute > 0) {
      nextHour = 9;
      nextMinute = 0;
    }
    
    setMeetingHour(String(nextHour).padStart(2, '0'));
    setMeetingMinute(String(nextMinute).padStart(2, '0'));
  }, []);

  const calculateRubles = (usdtAmount: string, exchangeRate: string) => {
    const usdt = parseFloat(usdtAmount);
    const rateNum = parseFloat(exchangeRate);
    if (!isNaN(usdt) && !isNaN(rateNum) && usdt > 0 && rateNum > 0) {
      setRubles((usdt * rateNum).toFixed(2));
    } else {
      setRubles('');
    }
  };

  const calculateUsdt = (rublesAmount: string, exchangeRate: string) => {
    const rub = parseFloat(rublesAmount);
    const rateNum = parseFloat(exchangeRate);
    if (!isNaN(rub) && !isNaN(rateNum) && rub > 0 && rateNum > 0) {
      setAmount((rub / rateNum).toFixed(2));
    } else {
      setAmount('');
    }
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    setLastEditedField('usdt');
    calculateRubles(value, rate);
  };

  const handleRublesChange = (value: string) => {
    setRubles(value);
    setLastEditedField('rubles');
    calculateUsdt(value, rate);
  };

  const handleRateChange = (value: string) => {
    setRate(value);
    if (lastEditedField === 'usdt') {
      calculateRubles(amount, value);
    } else {
      calculateUsdt(rubles, value);
    }
  };

  const handleNextStep = () => {
    if (!amount || !rate || !meetingHour || !meetingMinute) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
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

    const meetingTime = `${meetingHour.padStart(2, '0')}:${meetingMinute.padStart(2, '0')}`;

    setIsSubmitting(true);

    try {
      const response = await fetch(func2url['create-anonymous-offer'], {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          email: email || undefined,
          amount: parseFloat(amount),
          rate: parseFloat(rate),
          meeting_time: meetingTime,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Успешно!',
          description: data.message || 'Объявление создано',
        });
        
        setName('');
        setPhone('');
        setEmail('');
        setAmount('');
        setRate('');
        setRubles('');
        setMeetingHour('');
        setMeetingMinute('');
        setStep(1);
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast({
          title: 'Ошибка',
          description: data.error || 'Не удалось создать объявление',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать объявление',
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
          <Label htmlFor="rate">Курс (₽ за 1 USDT) *</Label>
          <Input
            id="rate"
            type="number"
            step="0.01"
            value={rate}
            onChange={(e) => handleRateChange(e.target.value)}
            placeholder="95.50"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount">Сумма в USDT *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="1000"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rubles">Сумма в рублях *</Label>
            <Input
              id="rubles"
              type="number"
              step="0.01"
              value={rubles}
              onChange={(e) => handleRublesChange(e.target.value)}
              placeholder="95500"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Время обмена *</Label>
          <div className="flex gap-2">
            <Select value={meetingHour} onValueChange={setMeetingHour} required>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Часы" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {Array.from({ length: 13 }, (_, i) => i + 9).map(hour => (
                  <SelectItem key={hour} value={String(hour).padStart(2, '0')}>
                    {String(hour).padStart(2, '0')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="flex items-center text-2xl font-bold">:</span>
            <Select value={meetingMinute} onValueChange={setMeetingMinute} required>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Минуты" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {['00', '15', '30', '45'].map(minute => (
                  <SelectItem key={minute} value={minute}>
                    {minute}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            <Icon name="Info" size={12} className="inline mr-1" />
            Обратите внимание: курс обмена актуален в течение трех часов и может измениться
          </p>
        </div>

        <Button 
          type="button" 
          onClick={handleNextStep}
          className="w-full bg-secondary text-primary hover:bg-secondary/90"
        >
          Далее
          <Icon name="ArrowRight" className="ml-2" />
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          * Регистрация не требуется
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Имя и фамилия *</Label>
        <Input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Иван Иванов"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Номер телефона *</Label>
        <Input
          id="phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+7 999 123-45-67"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Почта (необязательно)</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@mail.com"
        />
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          onClick={() => setStep(1)}
          variant="outline"
          className="flex-1"
        >
          <Icon name="ArrowLeft" className="mr-2" />
          Назад
        </Button>
        <Button 
          type="submit" 
          className="flex-1 bg-secondary text-primary hover:bg-secondary/90" 
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Icon name="Loader2" className="mr-2 animate-spin" />
              Создаём...
            </>
          ) : (
            <>
              <Icon name="ShoppingCart" className="mr-2" />
              Создать объявление
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default AnonymousBuyOfferForm;