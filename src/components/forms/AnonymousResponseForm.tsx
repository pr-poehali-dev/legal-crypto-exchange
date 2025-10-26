import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import func2url from '../../../backend/func2url.json';

interface AnonymousResponseFormProps {
  offerId: number;
  offerOffices?: string[];
  offerCity?: string;
  onSuccess?: () => void;
}

const AnonymousResponseForm = ({ offerId, offerOffices = [], offerCity = 'Москва', onSuccess }: AnonymousResponseFormProps) => {
  const { toast } = useToast();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [useOfferOffice, setUseOfferOffice] = useState(true);
  const [customOffice, setCustomOffice] = useState('');
  const [meetingHour, setMeetingHour] = useState('');
  const [meetingMinute, setMeetingMinute] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const firstOfferOffice = offerOffices && offerOffices.length > 0 ? offerOffices[0] : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !phone || !meetingHour || !meetingMinute) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
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

    const phoneRegex = /^\+?[0-9\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(phone)) {
      toast({
        title: 'Ошибка',
        description: 'Введите корректный номер телефона',
        variant: 'destructive',
      });
      return;
    }
    const meetingTime = `${meetingHour}:${meetingMinute}`;

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
          meeting_office: finalOffice,
          meeting_time: meetingTime,
          is_anonymous: true,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Успешно!',
          description: 'Мы получили вашу заявку и свяжемся с вами для завершения сделки.',
        });
        setName('');
        setPhone('');
        setUseOfferOffice(true);
        setCustomOffice('');
        setMeetingHour('');
        setMeetingMinute('');
        onSuccess?.();
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
            <Input
              placeholder="Введите адрес"
              value={customOffice}
              onChange={(e) => setCustomOffice(e.target.value)}
              disabled={isSubmitting}
              className="mt-2"
            />
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
              {['00', '15', '30', '45'].map((minute) => (
                <SelectItem key={minute} value={minute}>{minute}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Имя и фамилия</Label>
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
        <Label htmlFor="phone">Номер телефона</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="+7 (999) 123-45-67"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Icon name="Loader2" className="mr-2 animate-spin" />
            Резервирование...
          </>
        ) : (
          <>
            <Icon name="Lock" className="mr-2" />
            Зарезервировать
          </>
        )}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        * Мы получим вашу заявку и свяжемся с вами для завершения сделки.
      </p>
    </form>
  );
};

export default AnonymousResponseForm;