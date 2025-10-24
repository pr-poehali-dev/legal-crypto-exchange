import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import func2url from '../../../backend/func2url.json';

interface AnonymousBuyOfferFormProps {
  onSuccess?: () => void;
}

const AnonymousBuyOfferForm = ({ onSuccess }: AnonymousBuyOfferFormProps) => {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState('');
  const [meetingHour, setMeetingHour] = useState('');
  const [meetingMinute, setMeetingMinute] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !phone || !amount || !rate || !meetingHour || !meetingMinute) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все поля',
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
        setAmount('');
        setRate('');
        setMeetingHour('');
        setMeetingMinute('');
        
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Фамилия Имя *</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Иванов Иван"
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Сумма в USDT *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate">Курс (₽ за 1 USDT) *</Label>
              <Input
                id="rate"
                type="number"
                step="0.01"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="95.50"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Время обмена *</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                max="23"
                value={meetingHour}
                onChange={(e) => setMeetingHour(e.target.value)}
                placeholder="14"
                className="w-20"
                required
              />
              <span>:</span>
              <Input
                type="number"
                min="0"
                max="59"
                value={meetingMinute}
                onChange={(e) => setMeetingMinute(e.target.value)}
                placeholder="30"
                className="w-20"
                required
              />
              <span className="text-sm text-muted-foreground">(часы : минуты)</span>
            </div>
          </div>

          <Button type="submit" className="w-full bg-secondary text-primary hover:bg-secondary/90" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Icon name="Loader2" className="mr-2 animate-spin" />
                Создаём объявление...
              </>
            ) : (
              <>
                <Icon name="ShoppingCart" className="mr-2" />
                Создать объявление о покупке USDT
              </>
            )}
          </Button>

        <p className="text-xs text-muted-foreground text-center">
          * Регистрация не требуется. Ваше объявление попадёт в раздел "Продать USDT", где его увидят продавцы.
        </p>
      </form>
  );
};

export default AnonymousBuyOfferForm;